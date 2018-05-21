import AbstractTunnel from './tunnels/AbstractTunnel';
import OwnedTunnel from './tunnels/OwnedTunnel';
import RemoteTunnel from './tunnels/RemoteTunnel';
import ITunnel from "./tunnels/ITunnel";

export default class CommandTunnelHelper {
	protected registeredTunnels: { [key: string]: Function } = {};

	constructor() {
		this.registerTunnel('AbstractTunnel', AbstractTunnel);
		this.registerTunnel('OwnedTunnel', OwnedTunnel);
		this.registerTunnel('RemoteTunnel', RemoteTunnel);
	}

	registerTunnel(newTunnelName: string, TunnelClass: Function) {
		this.registeredTunnels[newTunnelName] = TunnelClass;
	}

	getTunnel(tunnelName): Function {
		return this.registeredTunnels[tunnelName];
	}
}
