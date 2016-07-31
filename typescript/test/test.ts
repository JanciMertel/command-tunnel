"use strict";

/**
 * Typescript-based test file
 * @since 0.0.1
 */

import CommandTunnelHelper from '../CommandTunnelHelper';

var helper = new CommandTunnelHelper()
let AbstractTunnelClass = helper.getTunnel('AbstractTunnel')
let abstractTunnelInstance = new AbstractTunnelClass();
console.log(abstractTunnelInstance.test() )
