'use strict';
var Schema = require('./schema');
module.exports = new Schema({
    explicit: [
        require('./str'),
        require('./seq'),
        require('./map')
    ]
});
//# sourceMappingURL=failsafe.js.map