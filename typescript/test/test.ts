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
  let abstractTunnelInstance = new AbstractTunnelClass({});
  abstractTunnelInstance.test()
}

async function testOwned()
{
  // owned tunnel test
  let dummyModule = {
    test : async function()
    {
      await new Promise(function(resolve)
      {                          
        setTimeout(function()
        {
          console.log('This method was called through OwnedTunnel after 5000ms');
          resolve();
        }, 5000)
      });
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
  let localTunnelInstance = new LocalModuleClass({path : './localModule.js'});
  try
  {
    await localTunnelInstance.test();
  }
  catch(e)
  {
    console.log(e)
  }
}

async function testAll()
{
  console.log('#### Testing abstract tunnel ####');
  console.log('(should print \'...does not have extended method "command"...\')')
  await testAbstract();
  
  console.log('\r\n\r\n#### Testing owned tunnel ####');
  console.log('(should print \'...This method was called through OwnedTunnel...\')')
  await testOwned();
  
  console.log('\r\n\r\n#### Testing local tunnel ####');
  console.log('(should print \'...Tunnel is now ready...\')')
  console.log('(should print \'...This method was called through LocalTunnel...\')')
  console.log('(should print \'...Child process ending...\')')
  await testLocal();
}

testAll();