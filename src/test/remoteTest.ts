"use strict";

/**
 * Typescript-based test file with remote tunnel
 * @since 0.0.1
 */

import CommandTunnelHelper from '../CommandTunnelHelper';

var helper = new CommandTunnelHelper()

// remote tunnel entity
let dummyModule = {
	test: async function () {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve('This method was called through RemoteTunnel after 2000ms');
			}, 2000)
		});
	}
}

let RemoteTunnelClass = helper.getTunnel('RemoteTunnel')
let remoteTunnelInstance = new RemoteTunnelClass({
	name: 'RemoteTunnelInstance',
	entityReference: dummyModule,
	serverAddress: '127.0.0.1:3444'
});

// now just wait till the other side calls the test method through tunnel...
