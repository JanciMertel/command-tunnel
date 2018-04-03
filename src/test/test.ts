/**
 * Typescript-based test file
 * @since 0.0.1
 */

import CommandTunnelHelper from '../CommandTunnelHelper';
import Tester from './Tester';
import * as path from 'path';

var helper = new CommandTunnelHelper()

async function testAbstract() {
	let AbstractTunnelClass = helper.getTunnel('AbstractTunnel')
	let abstractTunnelInstance = new AbstractTunnelClass({});
	abstractTunnelInstance.command = function () {
		return 'AbstractTunnel - overriden method';
	}
	return abstractTunnelInstance.test()
}

async function testOwned() {
	// owned tunnel test
	let dummyModule = {
		test: async function () {
			return new Promise(function (resolve) {
				setTimeout(function () {
					resolve('This method was called through OwnedTunnel after 2000ms');
				}, 2000)
			});
		}
	}

	let OwnedModuleClass = helper.getTunnel('OwnedTunnel')
	let ownedTunnelInstance = new OwnedModuleClass({entityReference: dummyModule});
	return await ownedTunnelInstance.test();
}

async function testLocal() {
	let LocalModuleClass = helper.getTunnel('LocalTunnel')
	let localTunnelInstance = new LocalModuleClass({path: path.join(__dirname, 'localModule.js')});
	return await localTunnelInstance.testSync();
}

async function testRemote() {
	let RemoteTunnelClass = helper.getTunnel('RemoteTunnel')
	let remoteTunnelInstance = new RemoteTunnelClass({name: 'RemoteTunnelInstance', port: 3444});
	let res = await remoteTunnelInstance.test();
	remoteTunnelInstance.close();
	return res;
}

async function testAll() {
	var tester = new Tester();
	var res = null;

	res = await tester.expects(testAbstract).isEqual('AbstractTunnel - overriden method')
	tester.assertTest("AbstractTest", res);

	res = await tester.expects(testOwned).isEqual('This method was called through OwnedTunnel after 2000ms')
	tester.assertTest("OwnedTest", res);

	res = await tester.expects(testLocal).isEqual('This method was called through LocalTunnel after 2000ms')
	tester.assertTest("LocalTest", res);

	res = await tester.expects(testRemote).isEqual('This method was called through RemoteTunnel after 2000ms')
	tester.assertTest("RemoteTest", res);

	tester.results();
}

testAll();
