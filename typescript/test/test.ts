"use strict";

require('babel-polyfill')

/**
 * Typescript-based test file
 * @since 0.0.1
 */

import CommandTunnelHelper from '../CommandTunnelHelper';

async function test()
{
  // helper test
  var helper = new CommandTunnelHelper()
  let AbstractTunnelClass = helper.getTunnel('AbstractTunnel')
  let abstractTunnelInstance = new AbstractTunnelClass();
  abstractTunnelInstance.test()

  // owned tunnel test
  let dummyModule = {
    test : function()
    {
      console.log('This method was called through OwnedModule')
    }
  }

  let OwnedModuleClass = helper.getTunnel('OwnedTunnel')
  let ownedTunnelInstance = new OwnedModuleClass(dummyModule, {});
  try
  {
    await ownedTunnelInstance.test();
  }
  catch(e)
  {
    console.log(e)
  }
}

test();
