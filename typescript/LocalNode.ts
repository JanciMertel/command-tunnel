"use strict";

/**
 * Local Node
 * @since 0.0.1
 */

import CommandTunnel from './CommandTunnel';
var cp = require('child_process');

class LocalNode extends CommandTunnel
{
    private isForked;

    constructor(passedConfig)
    {
        super(passedConfig);

        this.isForked = !!process.send;
        if(!this.isForked)
        {
          console.log(this.entityConfig.path)
          this.child = cp.fork(this.entityConfig.path);
          this.child.on('message', this.onAbstractMessage.bind(this));
        }
        else
        {
            process.on('message', this.onAbstractMessage.bind(this));
            // tunnel is now ready on the child's side
            this.tunnelReady = true;
            this.command({name:'commandTunnel::tunnelReady'});
        }
    }

    /**
     * This method should not be called directly, instead use the original-command method
     */
    protected command(data)
    {
        let promiseToReturn;
        let that = this;
        if(!this.tunnelReady)
        {
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
                promiseToReturn = new Promise(function(resolve, reject)
                {
                    that.callbackQueue[data.orderNumber] = resolve;
                });
            }
            if(!this.isForked)
            {
                this.child.send(data);
            }
            else
            {
                process.send(data);
            }
        }
        return promiseToReturn;
    }

    on(data)
    {
        var that = this;
        // two types : reply or new request
        if(data.isReply)
        {
            //if reply => just do basic check and if everything is ok, call saved callback(saved under orderNumber)
            // this callback accepts parameter - the callback is in fact resolve parameter of Promise callback
            // meaning that anything that is passed into the callback below IS RETURNED IN PROMISE CALLBACK
            // (whether in .then() or in await-async construct)
            // callback should be stored - only if this call is reply to previous command
            if(data.orderNumber && this.callbackQueue[data.orderNumber])
            {
                // assuming that required data are data.data...otherwise
                // the async called above should receive undefined, which is still fine
                // TODO - returned object should be always Proxy instance -
                //  for supporting error catching(normally not ie. not callable error would not be noticed) and real asynchronosu PIPING :D wat?
                this.callbackQueue[data.orderNumber](data.data);
            }
            else
            {
                // ignore if callback does not exist
            }
            // return is optional...
        }
        else
        {
            // if not reply => new command
            let returnValue;
            // first - check if this callback is registered - if so, then dont check callbackQueue, run just the registeredAction callback
            if(this.registeredActions[data.name])
            {
                // there can be more registered callbacks - use iterator and call each callback
                // TODO - right now only the last callback yields return data (simple overwrite)
                this.registeredActions[data.name].iterator().toEnd(function(registeredActionCallback)
                {
                    returnValue = registeredActionCallback.call(that, data);
                });
            }
            else
            {
                var pipes = data.name.split('.');
                var pipesOk = true;
                returnValue = this.entity; // replacement for actual object
                pipes.iterator().toEnd(function(item, index)
                {
                    if(!pipesOk) return false;
                    if(typeof returnValue[item] === 'function')
                    {
                        cli.info(item)
                        returnValue = returnValue[item].apply(returnValue, data.arguments[index]);
                    }
                    else
                    {
                        pipesOk = false;
                    }
                });

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
}

export default LocalNode;
