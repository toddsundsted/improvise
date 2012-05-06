/**
 * JavaScript Socket
 * @author gabe@fijiwebdesign.com
 */

/**
 * Simple Event
 */
var SocketEvent = function(name) {
	this.triggered = 0;
	this.name = name;
	this.observers = [];
};
SocketEvent.prototype = {
	/**
	 * Number of times this event has triggered
	 */
	triggered: 0,
	/**
	 * Arbitrary name of this event
	 */
	name: null,
	/**
	 * List of observing functions
	 */
	observers: [],
	/**
	 * Add an observing function for this event
	 * @param {Function} fn
	 */
	observe: function(fn) {
		this.observers.push(fn);
	},
	/**
	 * Trigger the Event
	 * @param {Array} args
	 * @param {Object} scope
	 */
	trigger: function(args, scope) {
		this.triggered++;
		for(var i = 0; i < this.observers.length; i++) {
			this.observers[i].apply(scope || this, args);
		}
	},
	/**
	 * Remove an observing function
	 * @param {Function} fn
	 */
	unobserve: function(fn) {
		for(var i = 0; i < this.observers.length; i++) {
			if (this.observers[i] == fn) {
				delete(this.observers[i]);
			}
		}
	}
	
};

/**
 * Manage multiple Flash Socket proxies for JavaScript
 */
var SocketManager = {
	i: 0,
	/**
	 * Static Events
	 */
	events: {
		loaded: new SocketEvent('SocketManager.loaded'),
		loadedPolicyFile: new SocketEvent('SocketManager.loadedPolicyFile')
	},
	/**
	 * Attach observers for events
	 * Also makes sure we instantly call functions that observe an event already triggered
	 */
	observe: function(eventName, fn) {
		if (SocketManager.events[eventName]) {
			SocketManager.events[eventName].observe(fn);
			if (SocketManager.events[eventName].triggered > 0) {
				SocketManager.events[eventName].trigger();
			}
		}
	},
	/**
	 * Collection of Sockets
	 */
	sockets: {},
	/**
	 * Called when Flash Socket Proxy is loaded and ready
	 */
	loaded: function() {
		SocketManager.SWF = window.JavascriptSocket || document.JavascriptSocket;
		SocketManager.events.loaded.trigger();
	},
	/**
	 * Called when the Flash Policy File has loaded
	 */
	loadedPolicyFile: function() {
		SocketManager.events.loadedPolicyFile.trigger();
	},
	/**
	 * Load the Policy File at given URL. 
	 * @param {String} policyFileURL
	 * @example loadPolicyFile('xmlsocket://openfire.org:5229');
	 */
	loadPolicyFile: function(policyFileURL) {
		SocketManager.SWF.loadPolicyFile(policyFileURL);
	},
	/**
	 * Create a new Flash Socket Instance
	 * @param {Object} socket JavaScript Socket class instance
	 * @param {Boolean} debug
	 */
	create: function(socket, debug) {
		SocketManager.i++;
		SocketManager.sockets['i'+SocketManager.i] = socket;
		SocketManager.SWF.createSocketProxy('SocketManager.sockets.i'+SocketManager.i, debug);
		return SocketManager.i;
	},
	Socket: Socket,
	SWF: null
};

/**
 * Socket Instance
 * @param {Object} observers Event names and their observing functions
 * @param {Boolean} debug Enable Debugging
 */
var Socket = function(observers, debug) {
	// initialize socket events
	this.events = {
		ready: new SocketEvent('Socket.ready'),
		connected: new SocketEvent('Socket.connected'),
		disconnected: new SocketEvent('Socket.disconnected'),
		receive: new SocketEvent('Socket.receive'),
		securityError: new SocketEvent('Socket.securityError'),
		ioError: new SocketEvent('Socket.ioError')
	};
	// attach observers
	for(var x in observers) {
		if (this.events[x] && typeof(this.events[x]) == 'object') {
			this.events[x].observe(observers[x]);
		}
	}
	// create the flash socket
	this.i = SocketManager.create(this, debug);
};
Socket.prototype = {
	i: 0,
	/**
	 * Socket Events
	 */
	events: {},
	/**
	 * Connect Socket through flash externalInterface
	 */
	connect: function(host, port) { 
		SocketManager.SWF['SocketManager.sockets.i'+this.i+'.connect'](host, port);
	},
	/**
	 * Send data through flash socket
	 */
	send: function(data) {
		SocketManager.SWF['SocketManager.sockets.i'+this.i+'.write'](data);
	},
	/**
	 * Disconnect the flash socket
	 */
	disconnect: function() {
		SocketManager.SWF['SocketManager.sockets.i'+this.i+'.close']();
	},
	/**
	 * Called when the flash socket has become available to JavaScript
	 */
	ready: function() {
		this.events.ready.trigger();
	},
	/**
	 * Called when the flash socket is connected
	 */
	connected: function() {
		this.events.connected.trigger();
	},
	/**
	 * Called when the flash socket has disconnected
	 */
	disconnected: function() {
		this.events.disconnected.trigger();
	},
	/**
	 * Called when the flash socket has received data
	 */
	receive: function(data) {
		this.events.receive.trigger([unescape(data)]);
	},
	/**
	 * Called when the flash socket encounters a securityError
	 */
	securityError: function(e) {
		this.events.securityError.trigger([e]);
	},
	/**
	 * Called when the flash socket encounters an ioError
	 */
	ioError: function(e) {
		this.events.ioError.trigger([e]);
	}
};
