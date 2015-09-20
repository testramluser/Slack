var env = require('./executionEnvironment');
function prompt(message) {
    return env.execCfgPrompt(message);
}
module.exports = prompt;
//# sourceMappingURL=prompt.js.map