"use strict";

var net = require('net');

/**
 * Generic tcp server for json-based message exchanging
 * @since 0.0.3
 */
class BundledTcpServer {
	private port;
	private server;
	private listening = false;
	private rawDataBuffer = '';
	private messageDelimiter = '##';
	private notMappedConnections = {}; // object - only one instance per specific
	// is allowed, faster lookup
	private notMappedDelegates = {}; // the same as before
	private mappedConnections = {}; // the same as before;

	listen(port) {
		let that = this;
		this.port = port;
		//listen
		this.server = net.createServer(function (socket) {
			socket.on('data', that.onRawData.bind(that, socket));
			socket.on('end', that.onEnd.bind(that, socket));
		});
		this.server.listen(this.port, '127.0.0.1');
		this.listening = true;
	}

	public sendMessage(socketOrName, message) {
		if (socketOrName) {
			if (typeof socketOrName === 'string') {
				socketOrName = this.mappedConnections[socketOrName].socket;
				if (!socketOrName) {
					return false;
				}
			}
			if (typeof message === 'object') {
				message = JSON.stringify(message);
			}
			socketOrName.write(message + this.messageDelimiter)
			return true;
		}
	}

	public isListening() {
		return this.listening;
	}

	/**
	 * Used for mapping uniquely identified connection to delegatedObject
	 * @param  {[type]} name            [description]
	 * @param  {[type]} delegatedObject [description]
	 * @return {boolean}               true/false on success/failure
	 */
	public awaitConnection(name, delegatedObject) {
		// first, check if the connection isn't stored already or if another delegate
		// isn't waiting
		if (this.mappedConnections[name] || this.notMappedDelegates[name]) {
			return false;
		}
		if (this.notMappedConnections[name]) {
			// if connection to the client side already exists and is waiting for its
			// delegated object
			this.mappedConnections[name] = {
				socket: this.notMappedConnections[name],
				delegatedObject: delegatedObject
			};
			delete this.notMappedConnections[name];
			// complete connection - notify delegated object
			this.mappedConnections[name].delegatedObject.setAsReady();
		}
		else {
			// if connection doesn't exist yet
			this.notMappedDelegates[name] = delegatedObject;
		}
		return true;
	}

	/**
	 * Exactly the same method as the one before, but works from the other side
	 * - manages incoming connections
	 * @param  String name   name
	 * @param  Object socket Connection socket
	 * @return Boolean        true/false on success/failure
	 */
	protected addConnection(name, socket) {
		// first, check if the connection isn't stored already or if another connection
		// isn't waiting
		if (this.mappedConnections[name] || this.notMappedConnections[name]) {
			return false;
		}
		if (this.notMappedDelegates[name]) {
			// if delegate already exists and is waiting for its connection
			this.mappedConnections[name] = {
				socket: socket,
				delegatedObject: this.notMappedDelegates[name]
			};
			delete this.notMappedDelegates[name];
			// complete connection - notify delegated object
			this.mappedConnections[name].delegatedObject.setAsReady();
		}
		else {
			// if delegate doesn't exist yet
			this.notMappedConnections[name] = socket;
		}
		return true;
	}

	/**
	 * Incomming network data would arrive here, where it should be checked
	 * and in the case of indication of the message delimiter, it would be parsed
	 * as object, which could be then used as command.
	 * @param  {<Byte>Array} chunk Chunked data in base Byte format
	 */
	protected onRawData(socket, chunk) {
		this.rawDataBuffer += chunk.toString('utf8')
		if (this.rawDataBuffer.indexOf(this.messageDelimiter) !== -1) {
			let rawMessages = this.rawDataBuffer.split(this.messageDelimiter);
			this.rawDataBuffer = rawMessages.pop();
			for (var i in rawMessages) {
				let completeMessage = null;
				try {
					completeMessage = JSON.parse(rawMessages[i]);
				}
				catch (e) {
					// error
				}
				if (!socket.authentication) {
					this.authenticateConnection(socket, completeMessage);
				} else {
					this.mappedConnections[socket.authentication].delegatedObject.onAbstractMessage(completeMessage);
				}
			}
		}
	}

	public async wdwd() {

	}

	/**
	 * Attempts to authenticate provided socket with provided message, hoping that
	 * it will consists of identification details
	 * @param  Object socket
	 * @param  Object message
	 * @return Boolean true on successful authentication, false otherwise
	 */
	protected authenticateConnection(socket, message) {
		if (message && message.name && message.name == 'authentication' && message.data) {
			// authentication consists only of the name - no password or anything
			socket.authentication = message.data;
			this.addConnection(message.data, socket)
		}
	}

	onEnd(socket) {
		// should call socket.end
		socket.end();
	}

	close() {
		var that = this;
		for (var i in this.notMappedConnections) {
			this.notMappedConnections[i].destroy();
		}
		for (var i in this.mappedConnections) {
			this.mappedConnections[i].socket.destroy();
		}

		this.server.close(function () {
			that.server.unref();
		});
		this.listening = false;
	}
}

var bundledTcpServerInstance = new BundledTcpServer();
export default bundledTcpServerInstance;
