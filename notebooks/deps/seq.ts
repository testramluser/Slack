/// <reference path="./typings/tsd.d.ts" />

'use strict';

import Type = require('./type');

module.exports = new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return null !== data ? data : []; }
});
