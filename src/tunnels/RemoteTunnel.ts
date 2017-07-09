"use strict";

/**
 * Remote Tunnel
 * Similar to LocalTunnel, but going further - for communication uses TCP
 * connection.
 * The server side requires passed tcpServer instance - or uses provided
 * bundled singleton.
 * The client side requires serverAddress passed in config.
 * @since 0.0.1
 */

var net = require('net');
import AbstractTunnel from './AbstractTunnel';
import BundledTcpServer from '../BundledTcpServer';

class RemoteTunnel extends AbstractTunnel
{
    private isServer;
    private tcpServer;
    private tcpClient;
    private rawDataBuffer = '';
    private messageDelimiter = '##';

    constructor(tunnelConfig)
    {
        super(tunnelConfig);

        let that = this;
        this.isServer = !tunnelConfig.serverAddress

        if(this.isServer)
        {
          if(tunnelConfig.tcpServer)
          {
            this.tcpServer = tunnelConfig.tcpServer;
          }
          else
          {
            //fallback if no server has been passed - using bundled one
            this.tcpServer = BundledTcpServer;
            // tell server to identify and map specific client to this tunnel
            this.tcpServer.awaitConnection(tunnelConfig.name, this);
            if(!this.tcpServer.isListening())
            {
              this.tcpServer.listen(tunnelConfig.port); // server-side listening
            }
          }
        }
        else
        {
          this.connectClient();
        }
    }

    public setAsReady() {
      this.tunnelReady = true;
      this.command({name:'commandTunnel::tunnelReady'});
      this.onTunnelReady();
    }

    /**
     * Implements simple mechanism for postponed/immediate connection establishment
     * @return {[type]} [description]
     */
    private connectClient() {
      var that = this;
      var alreadyMapped = false;

      // connect to server side
      this.tcpClient = new net.Socket({
        allowHalfOpen: false,
        readable: true,
        writable: true
      });

      var mapTcpClientEvents = function() {
        if(alreadyMapped)
          return false;
        alreadyMapped = true;

        that.tcpClient.on('data', that.onRawData.bind(that));
        that.authenticate(that.tunnelConfig.name);
      }
      let port = this.tunnelConfig.serverAddress.split(':');
      let host = port[0];
      port = port[1];
      this.tcpClient.connect(port, host, mapTcpClientEvents);
      this.tcpClient.on('error', function(e) {
          if (e.code == 'ECONNREFUSED') {
              console.log("Can't connect to server. Reconnecting in 4000ms.");

              setTimeout(function() {
                  that.tcpClient.connect(port, host, mapTcpClientEvents);
              }, 4000);
          }
      });
    }

    protected authenticate(authName) {
        this.sendMessage(JSON.stringify({name: 'authentication', data: authName}))
    }

    private sendMessage(message) {
        if(typeof message === 'object')
          message = JSON.stringify(message);
        this.tcpClient.write(message + this.messageDelimiter)
    }

    /**
     * Incomming network data would arrive here, where it should be checked
     * and in the case of indication of the message delimiter, it would be parsed
     * as object, which could be then used as command.
     * @param  {<Byte>Array} chunk Chunked data in base Byte format
     */
    protected onRawData(chunk) {
      this.rawDataBuffer += chunk.toString('utf8')
      if(this.rawDataBuffer.indexOf(this.messageDelimiter) !== -1)
      {
        let rawMessages = this.rawDataBuffer.split(this.messageDelimiter);
        this.rawDataBuffer = rawMessages.pop();
        for(var i in rawMessages)
        {
          let completeMessage = null;
          try {
            completeMessage = JSON.parse(rawMessages[i]);
          }
          catch(e)
          {
            // error
          }
          if(completeMessage)
          {
            this.onAbstractMessage(completeMessage);
          }
        }
      }
    }

    /**
     * This method should not be called directly, instead use the original-command method
     */
    protected command(data, preparedResolve?)
    {
        let promiseToReturn;
        let that = this;
        if(!this.tunnelReady)
        {
            // if tunnel is not yet ready - store command callback so it would be executed
            // when connected
            promiseToReturn = new Promise(function(resolve, reject)
            {
                that.notPreparedQueue.push([data, resolve]);
            });
        }
        else
        {
            // alter data, add order number for better identification
            // but only if this is not reply message - othewise the order number
            // should remain the same
            // if this is reply to previous command, it isn't required to return promise
            if(!data.isReply)
            {
                data.orderNumber = that.getNextOrderNumber()

                // when we are talking about promises in async rpc, there is thin line
                // between error and success... on this level we can't determine
                // whether the result should be translated as error, so here
                // is the only callback - resolve. Validation should be done in caller
                //
                // if preparedResolve is present, that means the promise is already
                // returned to the caller, so here we just use the old promise
                if(typeof preparedResolve === 'function')
                {
                  that.callbackQueue[data.orderNumber] = preparedResolve;
                }
                else
                {
                  promiseToReturn = new Promise(function(resolve, reject)
                  {
                      that.callbackQueue[data.orderNumber] = resolve;
                  });
                }
            }

            // transferring the command data to the other side
            if(this.isServer)
            {
                this.tcpServer.sendMessage(this.tunnelConfig.name, data);
            }
            else
            {
                this.sendMessage(data);
            }
        }
        // always return the promise - async & await works with it - otherwise
        // the command call would be only asynchronous without waiting
        return promiseToReturn;
    }

    /**
     * Check AbstractTunnel::method.
     *
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    protected async on(data)
    {
        var that = this;
        // two types : reply or new request
        if(data.isReply)
        {
            // if reply => Received reply from the other side
            // just do basic check and if everything is ok, call stored callback(saved under orderNumber when command was issued)
            // this callback accepts parameter - the callback is in fact resolve parameter of Promise callback
            // meaning that anything that is passed into the callback below IS RETURNED IN PROMISE CALLBACK
            // (whether in .then() or in await-async construct)
            // callback should be stored - only if this call is reply to previous command
            if(data.orderNumber && this.callbackQueue[data.orderNumber])
            {
                // assuming that required data are data.data...otherwise
                // the async called above should receive undefined, which is still fine
                this.callbackQueue[data.orderNumber](data.data);
            }
            else
            {
                // ignore if callback does not exist
                // shouldn't happen, but if does, then we cannot say for sure which
                // resolve callback should be called - pairing failed...at least notify
                this.broadcaster('Cannot find command callback base on order number. Ignoring.');
            }
            // return is not requireds
        }
        else
        {
            // if not reply => new command
            let returnValue;
            // first - check if this callback is registered - if so, then dont check callbackQueue, run just the registeredAction callback
            if(this.registeredActions[data.name])
            {
                // there can be more registered  callbacks - use iterator and call each callback
                // TODO - right now only the last callback yields return data (simple overwrite)
                for(let i in this.registeredActions[data.name])
                {
                    returnValue = this.registeredActions[data.name][i].call(that, data);
                }
            }
            else
            {
                var pipes = data.name.split('.');
                var pipesOk = true;
                returnValue = this.entity; // replacement for actual object
                for(let index in pipes)
                {
                    let item = pipes[index];
                    if(!pipesOk) return false;
                    if(typeof returnValue[item] === 'function')
                    {
                        returnValue = await returnValue[item].apply(returnValue, data.arguments[index]);
                    }
                    else
                    {
                        pipesOk = false;
                    }
                }

                if(!pipesOk)
                {
                    return false;
                }
            }
            var replyData = {
                name : data.name,
                isReply : true,
                data : returnValue,
                orderNumber : data.orderNumber
            };
            this.command(replyData);
            return true;
        }
    }

    public close() {
      if(this.isServer)
        this.tcpServer.close();
    }
}

export default RemoteTunnel;
