"use strict";

require('babel-polyfill')

/**
 * Typescript-based test file
 * @since 0.0.1
 */

import CommandTunnelHelper from '../CommandTunnelHelper';
import Tester from './Tester';

var helper = new CommandTunnelHelper()


async function testOwned()
{
  // owned tunnel test
  let dummyModule = {
    test : async function()
    {
      return new Promise(function(resolve)
      {
        setTimeout(function()
        {
          resolve('This method was called through OwnedTunnel after 5000ms');
        }, 5000)
      });
    }
  }

  let OwnedModuleClass = helper.getTunnel('OwnedTunnel')
  let ownedTunnelInstance = new OwnedModuleClass({entityReference:dummyModule});

  try
  {
    return await ownedTunnelInstance.test();
  }
  catch(e)
  {
    console.log(e)
    return 'error';
  }
}

async function testAll() {
  var tester = new Tester();
  var res = null;
  try
  {
    var res = await tester.expects(testOwned).isEqual('This method was called through OwnedTunnel after 5000ms')
  }
  catch(e)
  {
    res = e
  }
  tester.assertTest("OwnedTest", res);
  tester.results();
}
testAll();
