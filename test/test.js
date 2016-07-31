var CommandTunnelHelper = require('../build/CommandTunnelHelper')

let commandTunnelHelper = new CommandTunnelHelper.default();


var someObject = {
    doSomething : function(firstArg)
    {
        console.log('Inside doSomething', firstArg);
    }
}

// owned test
var AbstractTunnel = commandTunnelHelper.getTunnel('AbstractTunnel'); // instance + config, this method would lock the setAs* methods
var abs = new AbstractTunnel();
console.log(abs.test())

// custom test
// use custom class for parsing and managing
//commandTunnelOwned.registerWrapper('Custom', someClassHere)
//commandTunnelOwned.setAsCustom(..., ...);
//commandTunnelOwned.init();
//... someClassHere's methods would be called
