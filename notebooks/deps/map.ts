/// <reference path="./typings/tsd.d.ts" />

'use strict';

import Type = require('./type');

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return null !== data ? data : {}; }
});
