"use strict";

require('babel-polyfill')

/**
 * Typescript-based test file
 * @since 0.0.1
 */

import CommandTunnelHelper from '../CommandTunnelHelper';

var helper = new CommandTunnelHelper()


async function testAbstract()
{
  let AbstractTunnelClass = helper.getTunnel('AbstractTunnel')
  let abstractTunnelInstance = new AbstractTunnelClass();
  abstractTunnelInstance.test()
}

async function testOwned()
{
  // owned tunnel test
  let dummyModule = {
    test : function()
    {
      console.log('This method was called through OwnedModule')
    }
  }

  let OwnedModuleClass = helper.getTunnel('OwnedTunnel')
  let ownedTunnelInstance = new OwnedModuleClass({entityReference:dummyModule});
  try
  {
    await ownedTunnelInstance.test();
  }
  catch(e)
  {
    console.log(e)
  }
}

async function testLocal()
{
  let LocalModuleClass = helper.getTunnel('LocalTunnel')
  let localTunnelInstance = new LocalModuleClass({path : '../test/localModule.js'});
}

testLocal();
