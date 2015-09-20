'use strict';
var Schema = require('./schema');
module.exports = new Schema({
    include: [
        require('./failsafe')
    ],
    implicit: [
        require('./null'),
        require('./bool'),
        require('./int'),
        require('./float')
    ]
});
//# sourceMappingURL=json.js.map