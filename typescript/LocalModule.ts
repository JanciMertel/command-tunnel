"use strict";

/**
 * Local Module
 * @since 0.0.1
 */

import CommandTunnel from './CommandTunnel';
var cp = require('child_process');

class LocalModule extends CommandTunnel
{
    private isForked;

    constructor(passedConfig)
    {
        super(passedConfig);

        this.isForked = !!process.send;
        if(!this.isForked)
        {
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
     * This method should not be called directly, instead use the original command method
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
                data.orderNumber = ++this.orderNumber;

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
            // callback should be stored - only if this call is reply to previous command
            if(data.orderNumber && this.callbackQueue[data.orderNumber])
            {
                this.callbackQueue[data.orderNumber](data);
            }
            // ignore if callback does not exist
        }
        // is remote command
        else
        {
            var that = this;
            // if action is not registered and this process is the forket one, then the entity
            // should be set
            var returnValue;
            if(this.registeredActions[data.name])
            {
              this.registeredActions[data.name].iterator().toEnd(function(registeredActionCallback)
              {
                  returnValue = registeredActionCallback.call(that, data);
              });
            }
            else if(this.isForked)
            {
                var pipes = data.name.split('.');
                var pipesOk = true;
                returnValue = this.entity; // replacement for actual object
                pipes.iterator().toEnd(function(item, index)
                {
                    if(!pipesOk) return false;
                    if(typeof returnValue[item] === 'function')
                    {
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
            else
            {
              // not an allowed action, ignoring
              return false;
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

export default LocalModule;
