"use strict";
/**
 * Typescript-based test file
 * @since 0.0.1
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandTunnelHelper_1 = require("../CommandTunnelHelper");
const Tester_1 = require("./Tester");
const path = require("path");
var helper = new CommandTunnelHelper_1.default();
function testAbstract() {
    return __awaiter(this, void 0, void 0, function* () {
        let AbstractTunnelClass = helper.getTunnel('AbstractTunnel');
        let abstractTunnelInstance = new AbstractTunnelClass({});
        abstractTunnelInstance.command = function () {
            return 'AbstractTunnel - overriden method';
        };
        return abstractTunnelInstance.test();
    });
}
function testOwned() {
    return __awaiter(this, void 0, void 0, function* () {
        // owned tunnel test
        let dummyModule = {
            test: function () {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve('This method was called through OwnedTunnel after 2000ms');
                        }, 2000);
                    });
                });
            }
        };
        let OwnedModuleClass = helper.getTunnel('OwnedTunnel');
        let ownedTunnelInstance = new OwnedModuleClass({ entityReference: dummyModule });
        return yield ownedTunnelInstance.test();
    });
}
function testLocal() {
    return __awaiter(this, void 0, void 0, function* () {
        let LocalModuleClass = helper.getTunnel('LocalTunnel');
        let localTunnelInstance = new LocalModuleClass({ path: path.join(__dirname, 'localModule.js') });
        return yield localTunnelInstance.testSync();
    });
}
function testRemote() {
    return __awaiter(this, void 0, void 0, function* () {
        let RemoteTunnelClass = helper.getTunnel('RemoteTunnel');
        let remoteTunnelInstance = new RemoteTunnelClass({ name: 'RemoteTunnelInstance', port: 3444 });
        let res = yield remoteTunnelInstance.test();
        remoteTunnelInstance.close();
        return res;
    });
}
function testAll() {
    return __awaiter(this, void 0, void 0, function* () {
        var tester = new Tester_1.default();
        var res = null;
        res = yield tester.expects(testAbstract).isEqual('AbstractTunnel - overriden method');
        tester.assertTest("AbstractTest", res);
        res = yield tester.expects(testOwned).isEqual('This method was called through OwnedTunnel after 2000ms');
        tester.assertTest("OwnedTest", res);
        res = yield tester.expects(testLocal).isEqual('This method was called through LocalTunnel after 2000ms');
        tester.assertTest("LocalTest", res);
        res = yield tester.expects(testRemote).isEqual('This method was called through RemoteTunnel after 2000ms');
        tester.assertTest("RemoteTest", res);
        tester.results();
    });
}
testAll();
