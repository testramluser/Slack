var RamlWrapper = require('./Raml08Wrapper');
var Helper = require('./wrapperHelper');
var util = require('./index');
var SCHEMA_TYPE_OAUTH2 = 'OAuth 2.0';
var SCHEMA_TYPE_OAUTH1 = 'OAuth 1.0';
var SCHEMA_TYPE_DIGEST = 'Digest Authentication';
var SCHEMA_TYPE_BASIC = 'Basic Authentication';
var optionsMapping = {
    "clientId": "clientId"
};
var AuthManager = (function () {
    function AuthManager(paramsProvider) {
        this.paramsProvider = paramsProvider;
        this.apiMap = {};
    }
    AuthManager.prototype.patchRequest = function (request, method) {
        var api = (method instanceof RamlWrapper.Method) ? method.api() : Helper.ownerApi(method);
        var key = this.apiKey(api);
        var apiData = this.apiMap[key];
        apiData.patchRequest(request, method);
    };
    AuthManager.prototype.registerApi = function (api) {
        var key = this.apiKey(api);
        var data = new ApiSecurityData(api, this.paramsProvider.getSubProvider(key));
        this.apiMap[key] = data;
    };
    AuthManager.prototype.registerSchemes = function (api, schemes) {
        var key = this.apiKey(api);
        var data = this.apiMap[key];
        data.registerSchmes(schemes);
    };
    AuthManager.prototype.apiKey = function (api) {
        if (api instanceof RamlWrapper.Api) {
            var api08 = api;
            return api08.title().getOrElse("T0") + ' ' + api08.version().getOrElse("V");
        }
        else {
            var api10 = api;
            var title = api10.title();
            if (!title || title.trim().length == 0) {
                title = 'T0';
            }
            var version = api10.version();
            if (!version || version.trim().length == 0) {
                version = 'V';
            }
            return title + ' ' + version;
        }
    };
    AuthManager.prototype.store = function (apiName) {
        var _this = this;
        if (apiName) {
            var apiData = this.apiMap[apiName];
            if (apiData) {
                apiData.store();
            }
        }
        else {
            Object.keys(this.apiMap).forEach(function (x) { return _this.apiMap[x].store(); });
        }
    };
    AuthManager.prototype.updateSchema = function (api, schemaName, options) {
        var apiData = this.apiMap[this.apiKey(api)];
        if (!apiData) {
            return;
        }
        apiData.updateSchema(schemaName, options);
    };
    AuthManager.prototype.isReady = function () {
        var _this = this;
        console.log(this.apiMap);
        var result = true;
        Object.keys(this.apiMap).forEach(function (x) { return result = result && _this.apiMap[x].isReady(); });
        return result;
    };
    return AuthManager;
})();
exports.AuthManager = AuthManager;
var AuthSchema = (function () {
    function AuthSchema(ramlSchema, provider) {
        this.ramlSchema = ramlSchema;
        this.provider = provider;
        this.headers = [];
        this.queryParams = [];
        this.options = {};
        this.init();
    }
    AuthSchema.prototype.setSecurityProvider = function (paramsProvider) {
        this.provider = paramsProvider;
    };
    AuthSchema.prototype.name = function () {
        return this.ramlSchema.name();
    };
    AuthSchema.prototype.init = function () {
        var _this = this;
        this.schemaType = this.ramlSchema instanceof RamlWrapper.SecuritySchemaDef ? this.ramlSchema.type().type().getOrThrow() : this.ramlSchema.type();
        var describedBy = this.ramlSchema instanceof RamlWrapper.SecuritySchemaDef ? this.ramlSchema.type() : this.ramlSchema.describedBy();
        if (!describedBy) {
            return;
        }
        var headers = describedBy.headers();
        var queryParameters = describedBy.queryParameters();
        if (this.schemaType == SCHEMA_TYPE_OAUTH2) {
            this.getOption('clientId');
            this.getOption('clientSecret');
            var accessToken = this.getOption('accessToken');
            if (accessToken) {
                if (headers.filter(function (x) { return x.name() == 'Authorization'; }).length > 0) {
                    this.headers = [{ name: 'Authorization', value: 'Bearer ' + accessToken }];
                }
                queryParameters.forEach(function (x) {
                    if (x.name().toLowerCase().indexOf('token') >= 0) {
                        _this.queryParams.push({
                            name: x.name(),
                            value: accessToken
                        });
                    }
                });
            }
        }
        else if (this.schemaType == SCHEMA_TYPE_OAUTH2) {
        }
        else if (this.schemaType == SCHEMA_TYPE_DIGEST) {
        }
        else if (this.schemaType == SCHEMA_TYPE_BASIC) {
            var username = this.getOption('username');
            var password = this.getOption('password');
            if (username && password) {
                var authHeaderValue = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
                this.headers = [{ name: 'Authorization', value: authHeaderValue }];
            }
        }
        else if (this.schemaType.indexOf('x-') == 0) {
            headers.forEach(function (x) { return _this.headers.push({
                name: x.name(),
                value: _this.provider.getValue(x.name(), RamlWrapper.ParamLocation.header)
            }); });
            queryParameters.forEach(function (x) {
                _this.queryParams.push({
                    name: x.name(),
                    value: _this.provider.getValue(x.name(), RamlWrapper.ParamLocation.query)
                });
            });
        }
    };
    AuthSchema.prototype.store = function () {
        var _this = this;
        if (this.schemaType == SCHEMA_TYPE_OAUTH2) {
            this.saveOption('clientId');
            this.saveOption('clientSecret');
            this.saveOption('accessToken');
        }
        else if (this.schemaType == SCHEMA_TYPE_OAUTH1) {
        }
        else if (this.schemaType == SCHEMA_TYPE_DIGEST) {
        }
        else if (this.schemaType == SCHEMA_TYPE_BASIC) {
            this.saveOption('username');
            this.saveOption('password');
        }
        else if (this.schemaType.indexOf('x-') == 0) {
            this.queryParams.forEach(function (x) { return _this.provider.writeValue(x.name, x.value, RamlWrapper.ParamLocation.query); });
            this.headers.forEach(function (x) { return _this.provider.writeValue(x.name, x.value, RamlWrapper.ParamLocation.header); });
        }
    };
    AuthSchema.prototype.getOption = function (key) {
        var value = this.provider.getValue(key);
        if (value) {
            this.options[key] = value;
        }
        return value;
    };
    AuthSchema.prototype.saveOption = function (key) {
        var value = this.options[key];
        if (value) {
            this.provider.writeValue(key, value);
        }
    };
    AuthSchema.prototype.apply = function (request) {
        if (this.headers.length == 0 && this.queryParams.length == 0) {
            return false;
        }
        var applied = true;
        if (this.headers.length != 0) {
            request.headers = request.headers ? request.headers : [];
            applied = applied && this.applyParams(this.headers, request.headers);
        }
        if (this.queryParams.length != 0) {
            request.queryString = request.queryString ? request.queryString : [];
            applied = applied && this.applyParams(this.queryParams, request.queryString);
        }
        return applied;
    };
    AuthSchema.prototype.applyParams = function (schemaParams, requestParams) {
        var appliable = true;
        schemaParams.forEach(function (x) {
            var selected = requestParams.filter(function (z) { return z.name == x.name; });
            if (selected && selected.length != 0) {
                var definedParams = selected.filter(function (z) {
                    if (z.value == undefined || z.value == null) {
                        return false;
                    }
                    if (z.toString().trim().length == 0) {
                        return false;
                    }
                    return true;
                });
                appliable = appliable && (x.value != undefined) || definedParams.length > 0;
            }
            else {
                appliable = appliable && (x.value != undefined) || selected.length > 0;
            }
        });
        if (appliable) {
            schemaParams.forEach(function (x) {
                var selected = requestParams.filter(function (z) { return z.name == x.name; });
                if (selected && selected.length != 0) {
                    selected.forEach(function (z) {
                        if (z.value == undefined || z.value == null || z.value.toString().trim().length == 0) {
                            z.value = x.value;
                        }
                    });
                }
                else {
                    requestParams.push(x);
                }
            });
        }
        return appliable;
    };
    AuthSchema.prototype.update = function (options) {
        if (this.schemaType == SCHEMA_TYPE_OAUTH2) {
            if (options) {
                if (options['options']) {
                    this.options['clientId'] = options['options']['clientId'];
                    this.options['clientSecret'] = options['options']['clientSecret'];
                }
                if (options['user']) {
                    this.options['accessToken'] = options['user']['accessToken'];
                }
            }
        }
        else if (this.schemaType == SCHEMA_TYPE_BASIC) {
        }
        this.store();
        this.init();
    };
    AuthSchema.prototype.isReady = function () {
        var result = true;
        if (this.schemaType == SCHEMA_TYPE_OAUTH2) {
            result = result && util.isEssential(this.options['accessToken']);
        }
        else if (this.schemaType == SCHEMA_TYPE_OAUTH1) {
        }
        else if (this.schemaType == SCHEMA_TYPE_DIGEST) {
        }
        else if (this.schemaType == SCHEMA_TYPE_BASIC) {
            result = util.isEssential(this.options['username']) && util.isEssential(this.options['password']);
        }
        else if (this.schemaType.indexOf('x-') == 0) {
            this.queryParams.forEach(function (x) { return result = result && util.isEssential(x.value); });
            this.headers.forEach(function (x) { return result = result && util.isEssential(x.value); });
        }
        return result;
    };
    return AuthSchema;
})();
var Parameter = (function () {
    function Parameter() {
    }
    return Parameter;
})();
var ApiSecurityData = (function () {
    function ApiSecurityData(api, paramsProvider) {
        this.api = api;
        this.paramsProvider = paramsProvider;
        this.methodToSchemaMap = {};
        this.schemaMap = {};
        this.init();
    }
    ApiSecurityData.prototype.patchRequest = function (request, method) {
        var methodId = (method instanceof RamlWrapper.Method) ? method.id().value() : Helper.methodId(method);
        var schemas = this.methodToSchemaMap[methodId];
        if (schemas) {
            for (var i = 0, applied = false; !applied && i < schemas.length; i++) {
                applied = this.schemaMap[schemas[i]].apply(request);
            }
        }
    };
    ApiSecurityData.prototype.registerSchmes = function (schemes) {
        var _this = this;
        schemes.forEach(function (x) {
            _this.schemaMap[x.name()] = x;
            x.setSecurityProvider(_this.paramsProvider);
        });
    };
    ApiSecurityData.prototype.init = function () {
        var _this = this;
        var securitySchemes = this.api instanceof RamlWrapper.Api ? this.api.securitySchemas() : this.api.securitySchemes();
        securitySchemes.forEach(function (x) { return _this.schemaMap[x.name()] = new AuthSchema(x, _this.paramsProvider); });
        var resources = this.api.resources();
        resources.forEach(function (x) { return _this.inspectResource(x); });
    };
    ApiSecurityData.prototype.inspectResource = function (resource) {
        var _this = this;
        var globalSecuredBy = this.api instanceof RamlWrapper.Api ? this.api.securedBy().filter(function (x) { return x.isDefined(); }).map(function (x) { return x.getOrThrow(); }) : this.api.securedBy().map(function (x) { return x.value(); });
        var methods = resource.methods();
        methods.forEach(function (method) {
            var id = method instanceof RamlWrapper.Method ? method.id().value() : Helper.methodId(method);
            var localSecuredBy = method instanceof RamlWrapper.Method ? method.securedBy().filter(function (x) { return x.isDefined(); }).map(function (x) { return x.getOrThrow(); }) : method.securedBy().map(function (x) { return x.value(); });
            _this.registerSchemasForMethod(localSecuredBy, id);
            if (!_this.methodToSchemaMap[id]) {
                _this.registerSchemasForMethod(globalSecuredBy, id);
            }
        });
        var resources = resource.resources();
        resources.forEach(function (x) { return _this.inspectResource(x); });
    };
    ApiSecurityData.prototype.registerSchemasForMethod = function (localSecuredBy, id) {
        var _this = this;
        localSecuredBy.forEach(function (x) {
            var schema = _this.schemaMap[x];
            if (!schema) {
                return;
            }
            var methodSchemas = _this.methodToSchemaMap[id];
            if (!methodSchemas) {
                methodSchemas = [];
                _this.methodToSchemaMap[id] = methodSchemas;
            }
            methodSchemas.push(x);
        });
    };
    ApiSecurityData.prototype.store = function () {
        var _this = this;
        Object.keys(this.schemaMap).forEach(function (x) { return _this.schemaMap[x].store(); });
    };
    ApiSecurityData.prototype.updateSchema = function (schemaName, options) {
        var schema = this.schemaMap[schemaName];
        if (schema) {
            schema.update(options);
        }
    };
    ApiSecurityData.prototype.isReady = function () {
        var _this = this;
        var result = true;
        Object.keys(this.schemaMap).forEach(function (x) { return result = result && _this.schemaMap[x].isReady(); });
        return result;
    };
    return ApiSecurityData;
})();
//# sourceMappingURL=authenticationManager.js.map