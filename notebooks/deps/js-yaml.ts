/// <reference path="./typings/tsd.d.ts" />

'use strict';


import loader = require('./loader');
import dumper = require('./dumper');


function deprecated(name) {
  return function () {
    throw new Error('Function ' + name + ' is deprecated and cannot be used.');
  };
}

export var Type                = require('./type');
export var Schema              = require('./schema');
export var FAILSAFE_SCHEMA     = require('./failsafe');
export var JSON_SCHEMA         = require('./json');
export var CORE_SCHEMA         = require('./core');
export var DEFAULT_SAFE_SCHEMA = require('./default_safe');
export var DEFAULT_FULL_SCHEMA = require('./default_full');
export var load= loader.load;
export var loadAll             = loader.loadAll;
export var safeLoad            = loader.safeLoad;
export var safeLoadAll         = loader.safeLoadAll;
export var dump                = dumper.dump;
export var safeDump            = dumper.safeDump;
export var YAMLException       = require('./exception');

// Deprecared schema names from JS-YAML 2.0.x
export var MINIMAL_SCHEMA = require('./failsafe');
export var SAFE_SCHEMA    = require('./default_safe');
export var DEFAULT_SCHEMA = require('./default_full');

// Deprecated functions from JS-YAML 1.x.x
export var scan           = deprecated('scan');
export var parse          = deprecated('parse');
export var compose        = deprecated('compose');
export var addConstructor = deprecated('addConstructor');
