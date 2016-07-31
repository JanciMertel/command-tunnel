var CommandTunnel = require('../build/CommandTunnel')

let commandTunnelOwned = new CommandTunnel.default();


var someObject = {
    doSomething : function(firstArg)
    {
        console.log('Inside doSomething', firstArg);
    }
}

// owned test
commandTunnelOwned.setAsOwned(someObject, {}); // instance + config, this method would lock the setAs* methods
commandTunnelOwned.init(); // ambiguous?


// custom test
// use custom class for parsing and managing
commandTunnelOwned.registerWrapper('Custom', someClassHere)
commandTunnelOwned.setAsCustom(..., ...);
commandTunnelOwned.init();
... someClassHere's methods would be called