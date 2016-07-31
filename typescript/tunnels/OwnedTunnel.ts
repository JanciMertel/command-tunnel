"use strict";

import AbstractTunnel from './AbstractTunnel'
/**
 * Owned Tunnel
 * One big difference from remote/local tunnels - no ON method needs to be implemented.
 * This tunnel just directly accesses the wanted entity synchronously, there isnt any
 * command envelope used and therefore no ON method called.
 * @since 0.0.1
 */

class OwnedTunnel extends AbstractTunnel
{
    constructor(directObjectReference, tunnelConfig)
    {
        super(directObjectReference, tunnelConfig);
        this.tunnelReady = true; // always
    }

    /*
     * Custom method for creating true local command - this method is referenced
     * in command method so it won't need to create anonymous function
     */
    private processOwnedCommand(data, resolve, reject)
    {
        console.log(arguments)
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

export default OwnedTunnel;
