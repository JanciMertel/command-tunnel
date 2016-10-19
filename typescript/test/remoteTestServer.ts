"use strict";

require('babel-polyfill')

/**
 * Typescript-based test file with remote tunnel
 * @since 0.0.1
 */

import CommandTunnelHelper from '../CommandTunnelHelper';

var helper = new CommandTunnelHelper()

let RemoteTunnelClass = helper.getTunnel('RemoteTunnel')
let remoteTunnelInstance = new RemoteTunnelClass({name: 'RemoteTunnelInstance', port:3444});
remoteTunnelInstance.test();
