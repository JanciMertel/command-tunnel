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
/// <reference path="../typescript/AbstractManager.ts" />
/// <reference path="../typescript/CommandTunnel.ts" />
/// <reference path="../typescript/LocalModule.ts" />
/// <reference path="../typescript/LocalNode.ts" />
/// <reference path="../typescript/OwnedModule.ts" />
/// <reference path="../typescript/OwnedNode.ts" />
//grunt-end
