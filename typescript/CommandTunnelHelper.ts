"use strict";

import OwnedTunnel from './tunnels/OwnedTunnel';
import AbstractTunnel from './tunnels/AbstractTunnel'

/**
 * Command tunnel for transparent approach to communication between nodes - remote or local
 * Could be extended or just embedded as variable
 * @since 0.0.1
 */
class CommandTunnelHelper {

    protected registeredTunnels : any = {};

    constructor()
    {
      this.registerTunnel('AbstractTunnel', AbstractTunnel);
      this.registerTunnel('OwnedTunnel', OwnedTunnel);
    }

    registerTunnel(newTunnelName, TunnelClass)
    {
      this.registeredTunnels[newTunnelName] = TunnelClass;
    }

    getTunnel(tunnelName)
    {
      return this.registeredTunnels[tunnelName];
    }
}

export default CommandTunnelHelper;
