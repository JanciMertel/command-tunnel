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
 * Abstract Manager for entities
 * @since 0.0.1
 */
var fs = require('fs');
var AbstractManager = (function () {
    function AbstractManager(passedEntitiesConfig) {
        this.entityAlias = 'Entity';
        this.entitiesDefaultDirectory = 'entities';
        this.entitiesByNamespace = {}; // stored each reference to object, based on path => nested object
        this.entitiesContainer = {}; // stores each reference to object, key is ID
        this.currentEntityId = 0; // starting from 0, will be increased, so the first entity would have id = 1
        this.entitiesConfig = passedEntitiesConfig;
    }
    /**
     * NOT SAFE! Waiting for the next implementation of catch-all-proxies, which is aleardy in beta(feb 2016).
     * This implementation should be able to catch traps from other objects, therefore this methos should be obsolete.
     * NOT EVEN MEMORY-SANITIZED!
     * @param  {[Object]} entity - object loaded in one of methods below
     * @return {Proxy}        each call to proxy methods is caught, no matter if it is non-existing
     */
    AbstractManager.prototype.__afterLoad__ = function (entity) {
        var that = this;
        return Proxy.create({
            get: function (rcvr, name) {
                if (name === '__noSuchMethod__') {
                    cli.warn('Command called through proxy, but method named ' + name + ' is not defined. Ignoring.');
                }
                else {
                    if (typeof entity[name] === 'function') {
                        return entity[name];
                    }
                    else {
                        return function () {
                            var args = Array.prototype.slice.call(arguments);
                            return entity.__noSuchMethod__(name, args);
                        };
                    }
                }
            }
        });
    };
    AbstractManager.prototype.getEntitiesConfig = function () {
        return this.entitiesConfig;
    };
    AbstractManager.prototype.addEntityConfig = function (newConfig) {
        this.entitiesConfig.merge(newConfig);
    };
    AbstractManager.prototype.getEntitiesByPath = function (path) {
        path = path.split(".");
        var entities = this.entitiesByNamespace;
        while (path.length >= 1) {
            entities = entities[path.shift()];
        }
        return entities;
    };
    /**
     * Retrieve specified entity based on id
     */
    AbstractManager.prototype.getEntity = function (id) {
        if (typeof this.entitiesContainer[id] === 'undefined') {
            cli.warn(this.entityAlias + " with id " + id + " does not exist. Terminating.");
            process.exit();
        }
        else {
            return this.entitiesContainer[id];
        }
    };
    AbstractManager.prototype.getEntityConfig = function (path, entityConfig) {
        var self = this;
        if (typeof entityConfig === "undefined") {
            entityConfig = self.getEntitiesConfig();
        }
        var pathParts = path.split('.');
        var now = pathParts.shift();
        for (var i = 0; i < entityConfig.length; i++) {
            if (entityConfig[i].name == now) {
                if (pathParts.length == 0) {
                    return entityConfig[i];
                }
                else {
                    return self.getEntityConfig(pathParts.join("."), entityConfig[i][this.entitiesDefaultDirectory]);
                }
            }
        }
        return false;
    };
    AbstractManager.prototype.saveEntityConfig = function (path, newEntityConfig) {
        var config = this.getEntitiesConfig();
        var entityConfig = config;
        var pathParts = path.split('.');
        while (pathParts.length > 1 && typeof entityConfig !== "undefined") {
            entityConfig = entityConfig[pathParts.shift()];
        }
        entityConfig[pathParts.shift()] = newEntityConfig;
        this.addEntityConfig(config);
    };
    AbstractManager.prototype.setEntity = function (passedEntity) {
        var path = boot.namespaceToEntity(passedEntity.getConfig().namespace, this.entitiesDefaultDirectory);
        path = path.split(".");
        var entity = this.entitiesByNamespace;
        // we have to stop at 2, because the assignment needs reference to last level in
        // entities stack
        while (path.length >= 2) {
            entity = entity[path.shift()];
        }
        var mergedConfig = passedEntity.getConfig();
        mergedConfig = Object.assign({}, mergedConfig, { entityReference: passedEntity });
        if (mergedConfig.type == 'remote') {
            entity[path.shift()] = boot.assert('core/driver/Remote' + this.entityAlias, mergedConfig);
        }
        else if (mergedConfig.type == 'local') {
            entity[path.shift()] = boot.assert('core/driver/Local' + this.entityAlias, mergedConfig);
        }
        else {
            entity[path.shift()] = boot.assert('core/driver/Owned' + this.entityAlias, mergedConfig);
        }
    };
    AbstractManager.prototype.getNewId = function () {
        return ++this.currentEntityId;
    };
    AbstractManager.prototype.loadEntities = function (entitiesConfig, namespace) {
        var that = this;
        if (typeof entitiesConfig === "undefined") {
            entitiesConfig = that.getEntitiesConfig();
        }
        if (entitiesConfig.length > 0) {
            var iterator = entitiesConfig.iterator();
            iterator.toEnd(function (item) {
                if (item.dontload) {
                    return false;
                }
                if (item.type == 'local') {
                    that.loadLocalEntity(item);
                }
                else if (item.type == 'remote') {
                    that.loadRemoteEntity(item);
                }
                else if (item.type == 'owned') {
                    that.loadOwnedEntity(item);
                }
                else {
                    cli.debug(that.entityAlias + ' ' + item.name + ' isn\'t of acceptable type(' + item.type + '). Piggybacking to owned ' + that.entityAlias.toLowerCase());
                    that.loadOwnedEntity(item);
                }
                cli.debug("Checking subentities for: " + item.name);
                return true;
            });
        }
    };
    /* dynamically loads owned entity
     * item - object from config, needs to be passed
     * namespace - string in format "Economy.Finances.Events", where Events is the required entity
     */
    AbstractManager.prototype.loadOwnedEntity = function (item, passedReference) {
        var self = this;
        var namespaceParts = item.namespace.split(".");
        var path = "";
        for (var i = 0; i < namespaceParts.length; i++) {
            if (namespaceParts[i] === "") {
                continue;
            }
            if (path != '') {
                path += '/';
            }
            path += this.entityAlias.toLowerCase() + "/" + namespaceParts[i];
        }
        item.path = this.entitiesDefaultDirectory + '/' + (item.path ? item.path : item.name) + '/' + item.name + this.entityAlias + '.js';
        // path is now fully derived from namespace
        if (fs.existsSync(boot.getBasePath(item.path))) {
            var entitiesPath = self.entitiesByNamespace;
            namespaceParts = !item.namespaceAlias ? namespaceParts : item.namespaceAlias.split('.');
            while (namespaceParts.length >= 1) {
                var currentNamespacePart = namespaceParts.shift();
                if (!entitiesPath[currentNamespacePart]) {
                    entitiesPath[currentNamespacePart] = {};
                }
                entitiesPath = entitiesPath[currentNamespacePart];
            }
            item.entityReference = boot.assert(item.path, item);
            // pass config to LocalEntity wrapper
            item.entityId = ++this.currentEntityId;
            var entityReference = this.__afterLoad__(boot.assert('core/driver/Owned' + this.entityAlias, item));
            // assing this reference to global object of references
            this.entitiesContainer[item.entityId] = entityReference;
            // assign this reference to container based on namespaces
            entitiesPath[item.entityId] = this.entitiesContainer[item.entityId];
            cli.system(this.entityAlias + " loaded: " + item.name + ' with id ' + item.entityId);
        }
        else {
            cli.warn("Owned " + this.entityAlias.toLowerCase() + " could not be loaded: " + item.name);
            process.exit();
        }
    };
    /* dynamically loads local entity
     * item - object from config, needs to be passed
     * namespace - string in format "Economy.Finances.Events", where Events is the required entity
     */
    AbstractManager.prototype.loadLocalEntity = function (item, passedReference) {
        var self = this;
        var namespaceParts = item.namespace.split(".");
        var path = "";
        for (var i = 0; i < namespaceParts.length; i++) {
            if (namespaceParts[i] === "") {
                continue;
            }
            if (path != '') {
                path += '/';
            }
            path += this.entityAlias.toLowerCase() + "/" + namespaceParts[i];
        }
        item.path = this.entitiesDefaultDirectory + '/' + (item.path ? item.path : item.name) + '/' + item.name + this.entityAlias + '.js';
        // path is now fully derived from namespace
        // even if it is local entity, it's recommended to check if path to this resource exists
        if (fs.existsSync(boot.getBasePath(item.path))) {
            var entitiesPath = self.entitiesByNamespace;
            namespaceParts = !item.namespaceAlias ? namespaceParts : item.namespaceAlias.split('.');
            while (namespaceParts.length >= 1) {
                var currentNamespacePart = namespaceParts.shift();
                if (!entitiesPath[currentNamespacePart]) {
                    entitiesPath[currentNamespacePart] = {};
                }
                entitiesPath = entitiesPath[currentNamespacePart];
            }
            // pass config to LocalEntity wrapper
            item.entityId = ++this.currentEntityId;
            entitiesPath[item.entityId] = this.__afterLoad__(boot.assert('core/driver/Local' + this.entityAlias, item));
            cli.system(this.entityAlias + " loaded: " + item.name + ' with id ' + item.entityId);
        }
        else {
            cli.warn("Local " + this.entityAlias + " could not be loaded: " + item.name);
            process.exit();
        }
    };
    /**
     * Dynamically loads remote entity. First it checks whether the item is in the current config.
     * If so, the method should load this entity by options provided, such as connection info etc.
     * If the item is not in the config, the method should attempt to create the connection based on connection provided.
     * If the connection object is not provided, the load process should end.
     * @param item
     * @param namespace
     */
    AbstractManager.prototype.loadRemoteEntity = function (item, passedReference) {
    };
    AbstractManager.prototype.entitiesSolicitation = function () {
        return __awaiter(this, void 0, Promise, function* () {
            for (var id in this.entitiesContainer) {
                if (this.entitiesContainer.hasOwnProperty(id)) {
                    var ready = yield this.entitiesContainer[id].checkReadyState();
                    if (!ready) {
                        return true;
                    }
                }
                return true;
            }
            return true;
        });
    };
    return AbstractManager;
}());
exports.__esModule = true;
exports["default"] = AbstractManager;
//# sourceMappingURL=AbstractManager.js.map