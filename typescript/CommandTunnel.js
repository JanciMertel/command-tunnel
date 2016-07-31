"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/**
 * Command tunnel for transparent approach to communication between nodes - remote or local
 * Could be extended or just embedded as variable
 * @since 0.0.1
 */
var CommandTunnel = (function () {
    function CommandTunnel(passedEntityConfig) {
        this.name = 'CommandTunnel';
        this.entityConfig = passedEntityConfig;
        this.registeredActions = {};
        this.callbackQueue = {};
        this.remoteCallbackQueue = {};
        this.orderNumber = 0;
        this.tunnelReady = false;
        this.notPreparedQueue = [];
        this.entity = passedEntityConfig.entityReference;
        // create default actions
        this.registerAction('commandTunnel::tunnelReady', this.onTunnelReady); // should fire any preregistered commands
        return Proxy.create({
            get: function (rcvr, name) {
            }
        });
    }
    CommandTunnel.prototype.getNextOrderNumber = function () {
        return ++this.orderNumber;
    };
    /*
     * Proxy based __noSuchMethod__ hook
     */
    CommandTunnel.prototype.__noSuchMethod__ = function (name, args) {
        if (typeof args[0] !== 'object' || typeof args[0].length === 'undefined') {
            args = [args];
        }
        return this.command({ name: name, arguments: args });
    };
    CommandTunnel.prototype.getEntity = function () {
        return this.entity;
    };
    /**
     * Both sides are now listening
     */
    CommandTunnel.prototype.onTunnelReady = function () {
        cli.info('Tunnel is now ready');
        this.tunnelReady = true;
        var that = this;
        this.notPreparedQueue.iterator().toEnd(function (item) {
            // item is array of arguments
            that.command.apply(that, item);
        });
        this.notPreparedQueue = [];
    };
    CommandTunnel.prototype.registerAction = function (name, callback) {
        if (!this.registeredActions[name]) {
            this.registeredActions[name] = [];
        }
        return this.registeredActions[name].push(callback) - 1;
    };
    /*
     * Tunnel is basically awaiting only one data object, which holds all informations
     */
    CommandTunnel.prototype.onAbstractMessage = function (data) {
        // space for extending... right now it just checks whether the identification
        // of event is present
        if (data.name) {
            this.on(data);
        }
        else {
            cli.info(this.name + ' catched unknown command: ' + JSON.stringify(data));
        }
    };
    CommandTunnel.prototype.command = function (data) {
        // extend this!!
        cli.info(this.name + ' does not have extended method "command"!');
    };
    CommandTunnel.prototype.on = function (data) {
        // extend this!!
        cli.info(this.name + ' does not have extended method "on"!');
    };
    /**
     * Latter implementations should add various method for checking, like remote polling
     * @return {boo} whether is ready or not, should be async
     */
    CommandTunnel.prototype.checkReadyState = function () {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tunnelReady;
        });
    };
    return CommandTunnel;
}());
exports.__esModule = true;
exports["default"] = CommandTunnel;
//# sourceMappingURL=CommandTunnel.js.map