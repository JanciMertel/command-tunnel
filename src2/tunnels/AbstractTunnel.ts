"use strict";

/**
 * Command tunnel for transparent approach to communication between nodes - remote or local
 * Could be extended or just embedded as variable
 *
 * Abstracrt tunnel represents interface - required methods to be implemented in each tunnel:
 * - __noSuchMethod__ - catches all method calls
 * - command - entry point for sending messages from this side
 * - on - entry point for receiving messages on this side
 *
 * @since 0.0.1
 */
class AbstractTunnel {

	protected name; // alised name - direct identification on current side of tunnel
	protected entity; // simplified: for owned its object with callable methods, for remote / local it is connection
	protected tunnelConfig: any;
	protected registeredActions;  // aliased actions -- could be stored under custom name
	protected orderNumber: number; // keeping eyes on command numbers aka ids
	protected callbackQueue;
	protected remoteCallbackQueue;
	protected notPreparedQueue;
	protected tunnelReady;
	protected broadcaster: any = console.log;

	constructor(tunnelConfig) {
		this.name = 'AbstractTunnel instance';
		this.registeredActions = {};
		this.callbackQueue = {};
		this.remoteCallbackQueue = {};
		this.orderNumber = 0;
		this.tunnelReady = false;
		this.notPreparedQueue = [];
		this.tunnelConfig = tunnelConfig;
		// owned tunnel is using direct reference + todo add checking
		this.entity = tunnelConfig.entityReference;

		// create default actions
		this.registerAction('commandTunnel::tunnelReady', this.onTunnelReady); // should fire any preregistered commands

		// wrap this side of the tunnel in Proxy so non existing calls could be transformed into commands
		var that = this;
		return new Proxy(this, {
			get: function (rcvr, name) {
				if (name === '__noSuchMethod__') {
					console.log('Command called through proxy, but method named  is not defined. Ignoring.');
				} else {
					if (typeof that[name] !== 'undefined') {
						return that[name]
					}
					else {
						return function () {
							var args = Array.prototype.slice.call(arguments);
							return that.__noSuchMethod__(name, args);
						}
					}
				}
			}
		})
	}

	/*
	 * Proxy based __noSuchMethod__ hook
	 */
	__noSuchMethod__(name, args) {
		if (typeof args[0] !== 'object' || typeof args[0].length === 'undefined') {
			args = [args];
		}
		return this.command({name: name, arguments: args});
	}

	getEntity() {
		return this.entity;
	}

	/**
	 * Just increments the counter and returns actual number
	 * @return {[type]} [description]
	 */
	getNextOrderNumber() {
		return ++this.orderNumber
	}

	/**
	 * Lets alias some action - or actions
	 * @param  {[type]}   name     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	registerAction(name, callback) {
		if (!this.registeredActions[name]) {
			this.registeredActions[name] = [];
		}
		return this.registeredActions[name].push(callback) - 1;
	}

	/**
	 * Both sides are now listening
	 */
	protected onTunnelReady() {
		this.broadcaster('Tunnel is now ready');
		this.tunnelReady = true;
		var that = this;

		for (let i in this.notPreparedQueue) {
			if (!this.notPreparedQueue.hasOwnProperty(i)) {
				continue;
			}
			let item = this.notPreparedQueue[i];
			// item is array of arguments
			that.command.apply(that, item);
		}
		this.notPreparedQueue = [];

	}

	/**
	 * Entry point for messages on this side of the tunnel
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	protected command(data) {
		// extend this!!
		this.broadcaster(this.name + ' does not have extended method "command"!');
	}

	/*
	 * Just a checker method before the actual 'on' call - here should be places various checkings as
	 * the argument is just an object transferred through the tunnel.
	 */
	protected onAbstractMessage(data) {
		// space for extending... right now it just checks whether the identification
		// of event is present
		if (data.name) {
			this.on(data);
		}
		else {
			this.broadcaster(this.name + ' catched unknown command: ' + JSON.stringify(data));
		}
	}

	/**
	 * Entry point for received messages on this side of the tunnel
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	protected async on(data) {
		// extend this!!
		return await this.broadcaster(this.name + ' does not have extended method "on"!');
	}

	/**
	 * Latter implementations should add various method for checking, like remote polling
	 * @return {bool} whether is ready or not, should be async
	 */
	public async checkReadyState() {
		return this.tunnelReady;
	}
}

export default AbstractTunnel;
