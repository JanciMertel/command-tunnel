"use strict";

import LocalTunnel from '../tunnels/LocalTunnel';

// owned tunnel test
let dummyModule = {
  testAsync : async function()
  {
    return new Promise(function(resolve)
    {
      setTimeout(function()
      {
        resolve('This method was called through LocalTunnel after 2000ms');
      }, 2000)
    });
  },
  testSync : function()
  {
    return 'This method was called through LocalTunnel after 2000ms';
  }
}

var localTunnelInstance = new LocalTunnel({ entityReference : dummyModule })

setTimeout(function()
{
  console.log('LocalTunnelTest: Child process ending')
  process.exit()
}, 5000)
