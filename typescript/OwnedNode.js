"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Owned Node
 * @since 0.0.1
 */
var CommandTunnel_1 = require('./CommandTunnel');
var OwnedNode = (function (_super) {
    __extends(OwnedNode, _super);
    function OwnedNode(passedConfig) {
        _super.call(this, passedConfig);
        this.tunnelReady = true; // always
    }
    /*
     * Custom method for creating true local command - this method is referenced
     * in command method so it won't need to create anonymous function
     */
    OwnedNode.prototype.processOwnedCommand = function (data, resolve, reject) {
        var returnValue;
        var that = this;
        // for any actions registered for this event
        if (this.registeredActions[data.name]) {
            this.registeredActions[data.name].iterator().toEnd(function (registeredActionCallback) {
                returnValue = registeredActionCallback.call(that, data);
            });
        }
        else {
            var pipes = data.name.split('.');
            var pipesOk = true;
            returnValue = this.entity; // replacement for actual object
            pipes.iterator().toEnd(function (item, index) {
                if (!pipesOk)
                    return false;
                if (typeof returnValue[item] === 'function') {
                    returnValue = returnValue[item].apply(returnValue, data.arguments[index]);
                }
                else {
                    pipesOk = false;
                }
            });
            if (!pipesOk) {
                return reject(false);
            }
        }
        return resolve(returnValue);
    };
    OwnedNode.prototype.command = function (data) {
        return new Promise(this.processOwnedCommand.bind(this, data));
    };
    return OwnedNode;
}(CommandTunnel_1["default"]));
exports.__esModule = true;
exports["default"] = OwnedNode;
//# sourceMappingURL=OwnedNode.js.map