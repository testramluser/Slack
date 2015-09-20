var ramlPathMatch = require('./raml-path-match');
var Opt = require('./Opt');
function completeRelativeUri(res) {
    var uri = '';
    var parent = res;
    do {
        res = parent;
        uri = res.relativeUri().value() + uri;
        parent = res.parent();
    } while (parent['relativeUri']);
    return uri;
}
exports.completeRelativeUri = completeRelativeUri;
function parentResource(method) {
    return method.parent();
}
exports.parentResource = parentResource;
function parent(resource) {
    var parent = resource.parent();
    if (isApi(parent)) {
        return Opt.empty();
    }
    return new Opt(parent);
}
exports.parent = parent;
function isApi(obj) {
    return (obj['title'] && obj['version'] && obj['baseUri']);
}
;
function ownerApi(method) {
    var obj = method;
    while (!isApi(obj)) {
        obj = obj.parent();
    }
    return obj;
}
exports.ownerApi = ownerApi;
function methodId(method) {
    return completeRelativeUri(parentResource(method)) + ' ' + method.method().toLowerCase();
}
exports.methodId = methodId;
function isOkRange(response) {
    return parseInt(response.code()) < 400;
}
exports.isOkRange = isOkRange;
function allResources(api) {
    var resources = [];
    var visitor = function (res) {
        resources.push(res);
        res.resources().forEach(function (x) { return visitor(x); });
    };
    api.resources().forEach(function (x) { return visitor(x); });
    return resources;
}
exports.allResources = allResources;
function matchUri(apiRootRelativeUri, resource) {
    var allParameters = {};
    var opt = new Opt(resource);
    while (opt.isDefined()) {
        var res = opt.getOrThrow();
        uriParameters(res).forEach(function (x) { return allParameters[x.name()] = new ParamWrapper(x); });
        opt = parent(res);
    }
    var result = ramlPathMatch(completeRelativeUri(resource), allParameters, {})(apiRootRelativeUri);
    if (result) {
        return new Opt(Object.keys(result.params).map(function (x) { return new ParamValue(x, result['params'][x]); }));
    }
    return Opt.empty();
}
exports.matchUri = matchUri;
var schemaContentChars = ['{', '<'];
function schema(body, api) {
    var schemaNode = body.schema();
    if (!schemaNode) {
        return Opt.empty();
    }
    var schemaString = schemaNode.value();
    var isContent = false;
    schemaContentChars.forEach(function (x) { return isContent = isContent || schemaString.indexOf(x) >= 0; });
    var schDef;
    if (isContent) {
        schDef = new SchemaDef(schemaString);
    }
    else {
        var globalSchemes = api.schemas().filter(function (x) { return x.key() == schemaString; });
        if (globalSchemes.length > 0) {
            schDef = new SchemaDef(globalSchemes[0].value().value(), globalSchemes[0].key());
        }
        else {
            return Opt.empty();
        }
    }
    return new Opt(schDef);
}
exports.schema = schema;
function uriParameters(resource) {
    var uri = resource.relativeUri().value();
    var params = resource.uriParameters();
    return extractParams(params, uri, resource);
}
exports.uriParameters = uriParameters;
function baseUriParameters(api) {
    var uri = api.baseUri().value();
    var params = api.baseUriParameters();
    return extractParams(params, uri, api);
}
exports.baseUriParameters = baseUriParameters;
function extractParams(params, uri, resource) {
    var describedParams = {};
    params.forEach(function (x) { return describedParams[x.name()] = x; });
    var allParams = [];
    var prev = 0;
    for (var i = uri.indexOf('{'); i >= 0; i = uri.indexOf('{', prev)) {
        prev = uri.indexOf('}', ++i);
        var paramName = uri.substring(i, prev);
        if (describedParams[paramName]) {
            allParams.push(describedParams[paramName]);
        }
        else {
            allParams.push(new UriParam(paramName, resource));
        }
    }
    return allParams;
}
;
var UriParam = (function () {
    function UriParam(_name, _parent) {
        this._name = _name;
        this._parent = _parent;
    }
    UriParam.prototype.name = function () {
        return this._name;
    };
    UriParam.prototype["type"] = function () {
        return ["string"];
    };
    UriParam.prototype.location = function () {
        return {};
    };
    UriParam.prototype.locationKind = function () {
        return {};
    };
    UriParam.prototype["default"] = function () {
        return null;
    };
    UriParam.prototype.sendDefaultByClient = function () {
        return false;
    };
    UriParam.prototype.example = function () {
        return [];
    };
    UriParam.prototype.repeat = function () {
        return false;
    };
    UriParam.prototype.enum = function () {
        return [];
    };
    UriParam.prototype.collectionFormat = function () {
        return 'multi';
    };
    UriParam.prototype.required = function () {
        return true;
    };
    UriParam.prototype.readOnly = function () {
        return false;
    };
    UriParam.prototype.scope = function () {
        return [];
    };
    UriParam.prototype.xml = function () {
        return null;
    };
    UriParam.prototype.validWhen = function () {
        return null;
    };
    UriParam.prototype.requiredWhen = function () {
        return null;
    };
    UriParam.prototype.displayName = function () {
        return this._name;
    };
    UriParam.prototype.description = function () {
        return null;
    };
    UriParam.prototype.annotations = function () {
        return [];
    };
    UriParam.prototype.parent = function () {
        return this._parent;
    };
    UriParam.prototype.highLevel = function () {
        return null;
    };
    return UriParam;
})();
exports.UriParam = UriParam;
var SchemaDef = (function () {
    function SchemaDef(_content, _name) {
        this._content = _content;
        this._name = _name;
    }
    SchemaDef.prototype.name = function () {
        return this._name;
    };
    SchemaDef.prototype.content = function () {
        return this._content;
    };
    return SchemaDef;
})();
exports.SchemaDef = SchemaDef;
var ParamValue = (function () {
    function ParamValue(key, value) {
        this.key = key;
        this.value = value;
    }
    return ParamValue;
})();
exports.ParamValue = ParamValue;
var ParamWrapper = (function () {
    function ParamWrapper(_param) {
        this._param = _param;
        this.description = _param.description() ? _param.description().value() : this.description;
        this.displayName = _param.displayName();
        this.type = _param.type().length > 0 ? _param.type()[0] : "string";
        this.example = _param.example();
        this.repeat = _param.repeat();
        this.required = _param.required();
        this.default = _param.default();
    }
    return ParamWrapper;
})();
//# sourceMappingURL=wrapperHelper.js.map