/// <reference path='./lib.es6.d.ts' />

declare var require;
declare var GLOBAL;
declare var global;
declare var process;
declare var boot;
declare var server;
declare var system;
declare var cli;
declare var util;
declare var module;
declare var __dirname;

interface NoSuchMethodTrap {
new(someParam: any): NoSuchMethodTrap
}


interface ProxyConstructor {
create(a: any) : any;
createFunction(...args : any[]) : any;
}

interface Array<T> {
remove(o:number, to:number);
iterator(): any;
}

interface Object {
merge(o:any);
}

declare class CaelumServer {
test() : CaelumServer
constructor()
}
declare class DefaultController {
constructor()
}
declare module 'jsonfile' {
export function readFile(a:any, b:any) : any;
}

declare module 'readline' {
export function createInterface(a:Object) : any;
}

//grunt-start
/// <reference path="../typescript/CommandTunnelHelper.ts" />
/// <reference path="../typescript/test/Tester.ts" />
/// <reference path="../typescript/test/localModule.ts" />
/// <reference path="../typescript/test/remoteTest.ts" />
/// <reference path="../typescript/test/test.ts" />
/// <reference path="../typescript/tunnels/AbstractTunnel.ts" />
/// <reference path="../typescript/tunnels/LocalTunnel.ts" />
/// <reference path="../typescript/tunnels/OwnedTunnel.ts" />
/// <reference path="../typescript/tunnels/RemoteTunnel.ts" />
//grunt-end
