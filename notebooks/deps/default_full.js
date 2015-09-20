'use strict';
var Schema = require('./schema');
var schema = new Schema({
    include: [
        require('./default_safe')
    ],
    explicit: [
        require('./undefined'),
        require('./regexp'),
        require('./function')
    ]
});
Schema.DEFAULT = schema;
module.exports = schema;
//# sourceMappingURL=default_full.js.map