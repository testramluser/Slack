'use strict';
var loader = require('./loader');
var dumper = require('./dumper');
function deprecated(name) {
    return function () {
        throw new Error('Function ' + name + ' is deprecated and cannot be used.');
    };
}
exports.Type = require('./type');
exports.Schema = require('./schema');
exports.FAILSAFE_SCHEMA = require('./failsafe');
exports.JSON_SCHEMA = require('./json');
exports.CORE_SCHEMA = require('./core');
exports.DEFAULT_SAFE_SCHEMA = require('./default_safe');
exports.DEFAULT_FULL_SCHEMA = require('./default_full');
exports.load = loader.load;
exports.loadAll = loader.loadAll;
exports.safeLoad = loader.safeLoad;
exports.safeLoadAll = loader.safeLoadAll;
exports.dump = dumper.dump;
exports.safeDump = dumper.safeDump;
exports.YAMLException = require('./exception');
exports.MINIMAL_SCHEMA = require('./failsafe');
exports.SAFE_SCHEMA = require('./default_safe');
exports.DEFAULT_SCHEMA = require('./default_full');
exports.scan = deprecated('scan');
exports.parse = deprecated('parse');
exports.compose = deprecated('compose');
exports.addConstructor = deprecated('addConstructor');
//# sourceMappingURL=js-yaml.js.map