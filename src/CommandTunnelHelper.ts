"use strict";

import OwnedTunnel from './tunnels/OwnedTunnel';
import AbstractTunnel from './tunnels/AbstractTunnel'
import LocalTunnel from './tunnels/LocalTunnel'
import RemoteTunnel from './tunnels/RemoteTunnel'

/**
 * Command tunnel for transparent approach to communication between nodes - remote or local
 * Could be extended or just embedded as variable
 * @since 0.0.1
 */
class CommandTunnelHelper {

	protected registeredTunnels: any = {};

	constructor() {
		this.registerTunnel('AbstractTunnel', AbstractTunnel);
		this.registerTunnel('OwnedTunnel', OwnedTunnel);
		this.registerTunnel('LocalTunnel', LocalTunnel);
		this.registerTunnel('RemoteTunnel', RemoteTunnel);
	}

	registerTunnel(newTunnelName, TunnelClass) {
		this.registeredTunnels[newTunnelName] = TunnelClass;
	}

	getTunnel(tunnelName) {
		return this.registeredTunnels[tunnelName];
	}
}

export default CommandTunnelHelper;
