"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OwnedTunnel_1 = require("./tunnels/OwnedTunnel");
const AbstractTunnel_1 = require("./tunnels/AbstractTunnel");
const LocalTunnel_1 = require("./tunnels/LocalTunnel");
const RemoteTunnel_1 = require("./tunnels/RemoteTunnel");
/**
 * Command tunnel for transparent approach to communication between nodes - remote or local
 * Could be extended or just embedded as variable
 * @since 0.0.1
 */
class CommandTunnelHelper {
    constructor() {
        this.registeredTunnels = {};
        this.registerTunnel('AbstractTunnel', AbstractTunnel_1.default);
        this.registerTunnel('OwnedTunnel', OwnedTunnel_1.default);
        this.registerTunnel('LocalTunnel', LocalTunnel_1.default);
        this.registerTunnel('RemoteTunnel', RemoteTunnel_1.default);
    }
    registerTunnel(newTunnelName, TunnelClass) {
        this.registeredTunnels[newTunnelName] = TunnelClass;
    }
    getTunnel(tunnelName) {
        return this.registeredTunnels[tunnelName];
    }
}
exports.default = CommandTunnelHelper;
