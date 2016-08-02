"use strict";

require('babel-polyfill')

import LocalTunnel from '../tunnels/LocalTunnel';

// owned tunnel test
let dummyModule = {
  test : async function()
  {
    await new Promise(function(resolve)
    {                          
      setTimeout(function()
      {
        console.log('This method was called through LocalTunnel after 2000ms');
        resolve();
      }, 2000)
    });
  }
}

var localTunnelInstance = new LocalTunnel({ entityReference : dummyModule })

setTimeout(function()
{
  console.log('Child process ending')
  process.exit()
}, 5000)
