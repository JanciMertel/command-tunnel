"use strict";
import ITunnel from "./ITunnel";

/**
 * Command tunnel for transparent approach to communication between nodes
 * Could be extended or just embedded as variable
 *
 * Abstracrt tunnel represents interface - required methods to be implemented in each tunnel:
 * - __noSuchMethod__ - catches all method calls
 * - command - entry point for sending messages from this side
 * - on - entry point for receiving messages on this side
 *
 * @since 0.0.1
 */
class AbstractTunnel implements ITunnel {

	protected name; // aliased name - direct identification on current side of tunnel
	protected entity; // wrapped instance of whatever
	protected tunnelConfig: any;
	protected registeredActions: { [key: string]: Function[] } = {};  // aliased actions -- could be stored under custom name
	protected orderNumber: number = 0; // keeping eye on command numbers aka ids
	protected callbackQueue: { [key: number]: any } = {};
	protected notPreparedQueue: any[] = []; // array of commands
	protected tunnelReady: boolean = false;
	protected logger: any = console.log;

	constructor(entity: any, tunnelConfig) {
		this.name = 'AbstractTunnel instance';
		this.tunnelConfig = tunnelConfig;
		// owned tunnel is using direct reference + todo add checking
		this.entity = entity;

		// create default actions
		this.registerAction('commandTunnel::tunnelReady', this.onTunnelReady); // should fire any preregistered commands

		// wrap this side of the tunnel in Proxy so non existing calls could be transformed into commands
		return this.getProxy();
	}

	protected getProxy(): any {
		const that = this;
		return new Proxy(this, {
			get: function (rcvr, name) {
				console.log(name);
				if (name === '__noSuchMethod__') {
					console.log('Command called through proxy, but method named  is not defined. Ignoring.');
				} else {
					if (typeof rcvr[name] !== 'undefined') {
						return rcvr[name]
					} else if (typeof name === 'symbol' || name === 'inspect') {
						return;
					} else {
						return function () {
							var args = Array.prototype.slice.call(arguments);
							return that.__noSuchMethod__(name, args);
						}
					}
				}
			}
		});
	}

	public getEntity(): any {
		return this.entity;
	}

	/**
	 * Lets alias some action - or actions
	 * @param  {[type]}   name     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	public registerAction(name, callback) {
		if (!this.registeredActions[name]) {
			this.registeredActions[name] = [];
		}
		return this.registeredActions[name].push(callback) - 1;
	}

	/**
	 * Just increments the counter and returns actual number
	 * @return {[type]} [description]
	 */
	protected getNextOrderNumber() {
		return ++this.orderNumber
	}

	/**
	 * Both sides are now listening
	 */
	protected onTunnelReady() {
		this.logger('Tunnel is now ready');
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

	/*
	 * Proxy based __noSuchMethod__ hook
	 */
	private __noSuchMethod__(name, args) {
		if (typeof args[0] !== 'object' || typeof args[0].length === 'undefined') {
			args = [args];
		}
		console.log('in command', name, this.command)
		return this.command({name: name, arguments: args});
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
			this.logger(this.name + ' catched unknown command: ' + JSON.stringify(data));
		}
	}

	/**
	 * Entry point for messages on this side of the tunnel
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	protected command(data) {
		// extend this!!
		console.log(this.logger, this.name)
		this.logger(this.name + ' does not have extended method "command"!');
	}

	/**
	 * Entry point for received messages on this side of the tunnel
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	protected async on(data) {
		// extend this!!
		return await this.logger(this.name + ' does not have extended method "on"!');
	}
}

export default AbstractTunnel;
