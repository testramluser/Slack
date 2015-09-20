var reportManager = require('./executionReportManager');
var authManager = require('./authenticationManager');
var RamlWrapper = require('./Raml08Wrapper');
var fs = require('fs');
var path = require('path');
var XMLHttpRequestConstructor = require("xmlhttprequest").XMLHttpRequest;
function buildXHR() {
    var x = new XMLHttpRequestConstructor;
    return x;
}
var CONFIG_FILENAME = "config.cfg";
var AUTH_CONFIG_FILENAME = "auth.cfg";
var GENERATION_CONFIG_FILENAME = "generation.cfg";
var SPProvider = (function () {
    function SPProvider(authStorage, prefix) {
        this.authStorage = authStorage;
        this.prefix = prefix;
    }
    SPProvider.prototype.getValue = function (name, loc) {
        return this.authStorage.readValue(this.prefix + name);
    };
    SPProvider.prototype.writeValue = function (name, value, loc) {
        this.authStorage.writeValue(this.prefix + name, value);
    };
    SPProvider.prototype.getSubProvider = function (name) {
        return new SPProvider(this.authStorage, this.prefix + name);
    };
    return SPProvider;
})();
var ExecutionEnvironment = (function () {
    function ExecutionEnvironment(_dirname) {
        this._dirname = _dirname;
        this.reportManager = new reportManager.ReportManager();
        this.cfgPrompt = new Prompt(this.configPath());
        this.authStorage = new JSONStorage(this.authConfigPath());
        this.apis = {};
        this.securityParamsProvider = new SPProvider(this.authStorage, "");
        this.authManager = new authManager.AuthManager(this.securityParamsProvider);
    }
    ExecutionEnvironment.prototype.setPath = function (s) {
        this._dirname = s;
        this.authStorage = new JSONStorage(this.authConfigPath());
        this.securityParamsProvider = new SPProvider(this.authStorage, "");
        this.authManager = new authManager.AuthManager(this.securityParamsProvider);
    };
    ExecutionEnvironment.prototype.configPath = function () {
        return path.resolve(this._dirname, CONFIG_FILENAME);
    };
    ExecutionEnvironment.prototype.authConfigPath = function () {
        return path.resolve(this._dirname, AUTH_CONFIG_FILENAME);
    };
    ExecutionEnvironment.prototype.configFileName = function () {
        return CONFIG_FILENAME;
    };
    ExecutionEnvironment.prototype.authConfigFileName = function () {
        return AUTH_CONFIG_FILENAME;
    };
    ExecutionEnvironment.prototype.generationConfigFileName = function () {
        return GENERATION_CONFIG_FILENAME;
    };
    ExecutionEnvironment.prototype.execCfgPrompt = function (name) {
        return this.cfgPrompt.prompt(name);
    };
    ExecutionEnvironment.prototype.getReportManager = function () {
        return this.reportManager;
    };
    ExecutionEnvironment.prototype.getAuthManager = function () {
        return this.authManager;
    };
    ExecutionEnvironment.prototype.registerApi = function (api) {
        var key = this.apiKey(api);
        if (this.apis[key]) {
            return;
        }
        this.apis[key] = api;
        this.authManager.registerApi(api);
    };
    ExecutionEnvironment.prototype.apiKey = function (api) {
        if (api instanceof RamlWrapper.Api) {
            var api08 = api;
            return api08.title().getOrElse("title") + ' ' + api08.version().getOrElse("version");
        }
        else {
            var api10 = api;
            return api10.title() + ' ' + api10.version();
        }
    };
    ExecutionEnvironment.prototype.finalize = function () {
        this.reportManager.finalize();
    };
    return ExecutionEnvironment;
})();
var Prompt = (function () {
    function Prompt(configFilePath) {
        this.configFilePath = configFilePath;
    }
    Prompt.prototype.findValue = function (name, content) {
        var pos = content.indexOf(name);
        if (pos == -1) {
            throw new Error("Configuration value " + name + " not found");
        }
        content = content.substr(pos + name.length);
        var p1 = content.indexOf("=");
        content = content.substr(p1 + 1);
        var p2 = content.indexOf("\n");
        if (p2 != -1) {
            content = content.substr(0, p2);
        }
        return content.trim();
    };
    Prompt.prototype.prompt = function (message) {
        if (fs.existsSync(this.configFilePath)) {
            var content = fs.readFileSync(this.configFilePath).toString();
            return this.findValue(message, content);
        }
        else {
            var xhr = buildXHR();
            var url = "http://localhost:4343/" + message;
            xhr.open("GET", url, false);
            xhr.send();
            return xhr.responseText;
        }
    };
    return Prompt;
})();
var JSONStorage = (function () {
    function JSONStorage(filePath) {
        this.filePath = filePath;
    }
    JSONStorage.prototype.readValue = function (name) {
        if (this.obj) {
            return this.obj[name];
        }
        if (!fs.existsSync(this.filePath)) {
            return undefined;
        }
        var rawContent = fs.readFileSync(this.filePath).toString();
        this.obj = JSON.parse(rawContent);
        return this.obj[name];
    };
    JSONStorage.prototype.writeValue = function (name, value) {
        if (!this.obj) {
            this.obj = {};
        }
        this.obj[name] = value;
        console.log("Writing:" + this.filePath);
        fs.writeFileSync(this.filePath, JSON.stringify(this.obj, null, 2));
    };
    return JSONStorage;
})();
var instance = new ExecutionEnvironment(__dirname);
process.on('exit', function () {
    instance.finalize();
});
module.exports = instance;
//# sourceMappingURL=executionEnvironment.js.map