"use strict";

/**
 * Command tunnel for transparent approach to communication between nodes - remote or local
 * Could be extended or just embedded as variable
 * @since 0.0.1
 */
class CommandTunnel {

    protected entity; // simplified: for owned its object with callable methods, for remote / local it is connection
    protected registeredActions;  // aliased actions
    protected orderNumber : number; // keeping eyes on command numbers aka ids
    protected entityConfig;  // custom config for entity reference
    protected callbackQueue;
    protected remoteCallbackQueue;
    protected notPreparedQueue;
    protected tunnelReady;

    constructor(passedEntityConfig)
    {
      this.entityConfig = passedEntityConfig;
      this.registeredActions = {};
      this.callbackQueue = {};
      this.remoteCallbackQueue = {};
      this.orderNumber = 0;
      this.tunnelReady = false;
      this.notPreparedQueue = [];
      this.entity = passedEntityConfig.entityReference;
      // create default actions
      this.registerAction('commandTunnel::tunnelReady', this.onTunnelReady); // should fire any preregistered commands

        var that = this;
        return new Proxy(this, {
            get: function (rcvr, name) {

                if (name === '__noSuchMethod__') {
                    console.log('Command called through proxy, but method named  is not defined. Ignoring.');
                } else {
                    return function() {
                        var args = Array.prototype.slice.call(arguments);
                        return that.__noSuchMethod__(name, args);
                    }
                }
            }
        })
    }

    getNextOrderNumber()
    {
        return ++this.orderNumber
    }

    /*
     * Proxy based __noSuchMethod__ hook
     */
    __noSuchMethod__(name,args)
    {
        console.log('no such method')
    }

    getEntity()
    {
        return this.entity;
    }

    /**
     * Both sides are now listening
     */
    protected onTunnelReady()
    {
        cli.info('Tunnel is now ready');
        this.tunnelReady = true;
        var that = this;
        this.notPreparedQueue.iterator().toEnd(function(item)
        {
            // item is array of arguments
            that.command.apply(that, item);
        });
        this.notPreparedQueue = [];

    }

    registerAction(name, callback)
    {
        if(!this.registeredActions[name])
        {
            this.registeredActions[name] = [];
        }
        return this.registeredActions[name].push(callback) - 1;
    }

    /*
     * Tunnel is basically awaiting only one data object, which holds all informations
     */
    protected onAbstractMessage(data)
    {
        // space for extending... right now it just checks whether the identification
        // of event is present
        if(data.name)
        {
            this.on(data);
        }
        else
        {
            cli.info(this.name + ' catched unknown command: ' + JSON.stringify(data));
        }
    }

    protected command(data)
    {
        // extend this!!
        cli.info(this.name + ' does not have extended method "command"!');
    }

    protected on(data)
    {
        // extend this!!
        cli.info(this.name + ' does not have extended method "on"!');
    }

    /**
     * Latter implementations should add various method for checking, like remote polling
     * @return {boo} whether is ready or not, should be async
     */
    public async checkReadyState()
    {
        return this.tunnelReady;
    }
}

export default CommandTunnel;
