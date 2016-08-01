"use strict";

require('babel-polyfill')

import LocalTunnel from '../tunnels/LocalTunnel';

class Wat
{
  test()
  {
    console.log('Neviem')
  }
}

var wat = new Wat()

var localTunnelInstance = new LocalTunnel({entityReference:wat})

setInterval(function()
{
  console.log('Trying this shit')
}, 1000)
