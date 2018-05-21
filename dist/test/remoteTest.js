"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Typescript-based test file with remote tunnel
 * @since 0.0.1
 */
const CommandTunnelHelper_1 = require("../CommandTunnelHelper");
var helper = new CommandTunnelHelper_1.default();
// remote tunnel entity
let dummyModule = {
    test: function () {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve('This method was called through RemoteTunnel after 2000ms');
                }, 2000);
            });
        });
    }
};
let RemoteTunnelClass = helper.getTunnel('RemoteTunnel');
let remoteTunnelInstance = new RemoteTunnelClass({ name: 'RemoteTunnelInstance', entityReference: dummyModule, serverAddress: '127.0.0.1:3444' });
