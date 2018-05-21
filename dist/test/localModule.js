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
const LocalTunnel_1 = require("../tunnels/LocalTunnel");
// owned tunnel test
let dummyModule = {
    testAsync: function () {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve('This method was called through LocalTunnel after 2000ms');
                }, 2000);
            });
        });
    },
    testSync: function () {
        return 'This method was called through LocalTunnel after 2000ms';
    }
};
var localTunnelInstance = new LocalTunnel_1.default({ entityReference: dummyModule });
setTimeout(function () {
    console.log('LocalTunnelTest: Child process ending');
    process.exit();
}, 5000);
