# Command tunnel #

Changelog:

- 0.0.4:
	- refactored, old system->client has been removed in the process (even the local node is now history - required spawning). Instead i switched to any-any communication via hub.
	
- up to 0.0.3
	- introduced owned, local, remote nodes. Communication strictly only between 2 points. For any other couple new node pair has to be created - major drawdown.
	

## Idea: ##
```
"I want a solution for point-to-point communication between local/remote nodes with the same interface"
 
   -myself
```

Lets picture a situation:

![Alt text](materials/command-tunnel.png?raw=true "Title")

When the instance is owned(aka part of requester - node 0), the request is simple:
``` 
const outcome = nodeZero.getItemIds(); // synchronous if you want
```

When talking about remove instances (node1/node2), we need to use some kind of api, ie. rest

```
fetch(PATH_TO_NODE + ROUTE).then(...) 
// or
async fetch(PATH_TO_NODE + ROUTE)
```

What if you need to have multiple instances of nodes above, but want to acces their exposed methods via unified interface?

You can:
1) use network based message emitter, like socket.io, or deepstream or whatever
2) organize your api / nodes so you minimize the problem - this should normally suffice
3) use this library 

I should also point out that this library has been originally developed for my own specific requirements (multiple microservices with similar interface), so it's definitely not a solution for typical problems (hence the 3. place).

## Proposed solution ##

Based on the picture above, the initial solution that i wanted to accomplish looks like this:

```
const response1 = await nodeZero.getItemIds(); // the same
const response2 = await nodeOne.getItemIds().wakeItems(); // piping
const response3 = await nodeTwo.downloadCsv(); // same interface as owned node
```

As it is should be clear, all requests are asynchronous, to share the same interface.

### Nodes ###
Each node is basically a client, which is able to communicate with any other node.
Since we have clients, there must be also a server - default is deepstream server, but could be replaced with ie. tcp server. When bundled, the server then stands for the master node (which is also "owned" node - same process).  If the server is standalone, then the master node should be the first connected client.

Node: even though the master node's existence is important, it is blackboxed and hidden from the user.

As mentioned before, there are 2 node types: owned & remote 



