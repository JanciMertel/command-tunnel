"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Local Tunnel
 * The one important difference between this tunnel and OwnedTunnel is that this one
 * is utilizing different instances instead of just one(OwnedTunnel->entity vs LocalTunnel1->LocalTunnel2)
 * Because of this, it is important to track which side is currently being used in instances(check forked flag)
 *
 * This tunnel is forking current process and loads requested module. Forking effectively creates tunnel
 * between old and forked processes.
 *
 * @since 0.0.1
 */
const AbstractTunnel_1 = require("./AbstractTunnel");
var cp = require('child_process');
class LocalTunnel extends AbstractTunnel_1.default {
    constructor(tunnelConfig) {
        super(tunnelConfig);
        this.isForked = typeof process.send === 'function';
        if (!this.isForked) {
            this.child = cp.fork(this.tunnelConfig.path);
            this.child.on('message', this.onAbstractMessage.bind(this));
        }
        else {
            process.on('message', this.onAbstractMessage.bind(this));
            // tunnel is now ready on the child's side
            this.tunnelReady = true;
            this.command({ name: 'commandTunnel::tunnelReady' });
        }
    }
    /**
     * This method should not be called directly, instead use the original-command method
     */
    command(data, preparedResolve) {
        let promiseToReturn;
        let that = this;
        if (!this.tunnelReady) {
            // if tunnel is not yet ready - store command callback so it would be executed
            // when connected
            promiseToReturn = new Promise(function (resolve, reject) {
                that.notPreparedQueue.push([data, resolve]);
            });
        }
        else {
            // alter data, add order number for better identification
            // but only if this is not reply message - othewise the order number
            // should remain the same
            // if this is reply to previous command, it isn't required to return promise
            if (!data.isReply) {
                data.orderNumber = that.getNextOrderNumber();
                // when we are talking about promises in async rpc, there is thin line
                // between error and success... on this level we can't determine
                // whether the result should be translated as error, so here
                // is the only callback - resolve. Validation should be done in caller
                //
                // if preparedResolve is present, that means the promise is already
                // returned to the caller, so here we just use the old promise
                if (typeof preparedResolve === 'function') {
                    that.callbackQueue[data.orderNumber] = preparedResolve;
                }
                else {
                    promiseToReturn = new Promise(function (resolve, reject) {
                        that.callbackQueue[data.orderNumber] = resolve;
                    });
                }
            }
            // transferring the command data to the other side
            if (!this.isForked) {
                this.child.send(data);
            }
            else {
                process.send(data);
            }
        }
        // always return the promise - async & await works with it - otherwise
        // the command call would be only asynchronous without waiting
        return promiseToReturn;
    }
    /**
     * Check AbstractTunnel::method.
     *
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    on(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var that = this;
            // two types : reply or new request
            if (data.isReply) {
                // if reply => Received reply from the other side
                // just do basic check and if everything is ok, call stored callback(saved under orderNumber when command was issued)
                // this callback accepts parameter - the callback is in fact resolve parameter of Promise callback
                // meaning that anything that is passed into the callback below IS RETURNED IN PROMISE CALLBACK
                // (whether in .then() or in await-async construct)
                // callback should be stored - only if this call is reply to previous command
                if (data.orderNumber && this.callbackQueue[data.orderNumber]) {
                    // assuming that required data are data.data...otherwise
                    // the async called above should receive undefined, which is still fine
                    this.callbackQueue[data.orderNumber](data.data);
                }
                else {
                    // ignore if callback does not exist
                    // shouldn't happen, but if does, then we cannot say for sure which
                    // resolve callback should be called - pairing failed...at least notify
                    this.broadcaster('Cannot find command callback base on order number. Ignoring.');
                }
                // return is not requireds
            }
            else {
                // if not reply => new command
                let returnValue;
                // first - check if this callback is registered - if so, then dont check callbackQueue, run just the registeredAction callback
                if (this.registeredActions[data.name]) {
                    // there can be more registered  callbacks - use iterator and call each callback
                    // TODO - right now only the last callback yields return data (simple overwrite)
                    for (let i in this.registeredActions[data.name]) {
                        returnValue = this.registeredActions[data.name][i].call(that, data);
                    }
                }
                else {
                    var pipes = data.name.split('.');
                    var pipesOk = true;
                    returnValue = this.entity; // replacement for actual object
                    for (let index in pipes) {
                        let item = pipes[index];
                        if (!pipesOk)
                            return false;
                        if (typeof returnValue[item] === 'function') {
                            returnValue = yield returnValue[item].apply(returnValue, data.arguments[index]);
                        }
                        else {
                            pipesOk = false;
                        }
                    }
                    if (!pipesOk) {
                        return false;
                    }
                }
                var replyData = {
                    name: data.name,
                    isReply: true,
                    data: returnValue,
                    orderNumber: data.orderNumber
                };
                this.command(replyData);
                return true;
            }
        });
    }
}
exports.default = LocalTunnel;
