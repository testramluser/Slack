'use strict';
var Schema = require('./schema');
var schema = new Schema({
    include: [
        require('./core')
    ],
    implicit: [
        require('./timestamp'),
        require('./merge')
    ],
    explicit: [
        require('./binary'),
        require('./omap'),
        require('./pairs'),
        require('./set')
    ]
});
module.exports = schema;
//# sourceMappingURL=default_safe.js.map