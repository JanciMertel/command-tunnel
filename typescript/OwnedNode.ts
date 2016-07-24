"use strict";

/**
 * Owned Node
 * @since 0.0.1
 */

import CommandTunnel from './CommandTunnel';

class OwnedNode extends CommandTunnel
{
    constructor(passedConfig)
    {
        super(passedConfig);

        this.tunnelReady = true; // always
    }

    /*
     * Custom method for creating true local command - this method is referenced
     * in command method so it won't need to create anonymous function
     */
    processOwnedCommand(data, resolve, reject)
    {
        var returnValue;
        var that = this;
        // for any actions registered for this event
        if(this.registeredActions[data.name])
        {
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
                    returnValue = returnValue[item].apply(returnValue, data.arguments[index]);
                }
                else
                {
                    pipesOk = false;
                }
            });

            if(!pipesOk)
            {
                return reject(false);
            }
        }
        return resolve(returnValue);
    }

    protected command(data)
    {
        return new Promise(this.processOwnedCommand.bind(this, data));
    }
}

export default OwnedNode;
