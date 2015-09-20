var esprima = require("esprima");
var RamlWrapper = require('./Raml08Wrapper');
var ASTBuilder = require('./jsAstBuilder');
var raml2ts = require('./raml2ts');
var escodegen = require("escodegen");
var Opt = require('./Opt');
var ParameterWithValue = (function () {
    function ParameterWithValue(name, value, location) {
        this.name = name;
        this.value = value;
        this.location = location;
    }
    ParameterWithValue.build = function (name, value, location) {
        return new ParameterWithValue(name, ASTBuilder.literal("" + value), location);
    };
    ParameterWithValue.buildNumber = function (name, value, location) {
        return new ParameterWithValue(name, ASTBuilder.literal("" + value), location);
    };
    ParameterWithValue.buildBoolean = function (name, value, location) {
        return new ParameterWithValue(name, ASTBuilder.literal("" + value), location);
    };
    return ParameterWithValue;
})();
exports.ParameterWithValue = ParameterWithValue;
var HTTPCallOccurence = (function () {
    function HTTPCallOccurence(name, method, segments, uriParameters, body, params) {
        this.name = name;
        this.uriParameters = uriParameters;
        this.api = method.api();
        this.method = method;
        this.segments = segments;
        this.bodyParameter = body;
        this.otherParams = params;
    }
    HTTPCallOccurence.prototype.toString = function () {
        return this.method.id();
    };
    HTTPCallOccurence.build = function (name, method, uriParameters, body, args) {
        var r = method.resource();
        var segments = r.segments();
        return new HTTPCallOccurence(name, method, segments, uriParameters, body, args);
    };
    HTTPCallOccurence.getPattern = function (clientName, method, cfg) {
        var pattern = HTTPCallOccurence.buildFrom(clientName, method, [], "body").toPatternString(cfg);
        return pattern;
    };
    HTTPCallOccurence.buildFrom = function (clientName, method, args, body) {
        var uriParams = args.filter(function (x) { return x.location == RamlWrapper.ParamLocation.uri; });
        var segments = method.resource().completeRelativeUri().split("/");
        var uriParameters = [];
        segments.forEach(function (seg) {
            if (seg.length == 0) {
                return;
            }
            var un = HTTPCallOccurence.getUriParamNames(seg);
            var params = [];
            un.forEach(function (n) {
                var o = HTTPCallOccurence.findName(n, uriParams);
                params.push(o.getOrElse(new ParameterWithValue(n, ASTBuilder.literal(''), RamlWrapper.ParamLocation.uri)).value);
            });
            uriParameters.push(params);
        });
        var paramLiteral = ASTBuilder.object();
        var queryParams = args.filter(function (x) { return x.location == RamlWrapper.ParamLocation.query; });
        this.pushParams(queryParams, paramLiteral, "");
        var headerParams = args.filter(function (x) { return x.location == RamlWrapper.ParamLocation.header; });
        this.pushParams(headerParams, paramLiteral, "header_");
        var formParams = args.filter(function (x) { return x.location == RamlWrapper.ParamLocation.form; });
        this.pushParams(formParams, paramLiteral, "form_");
        body = esprima.parse(JSON.stringify(body));
        return HTTPCallOccurence.build(clientName, method, uriParameters, body, paramLiteral);
    };
    HTTPCallOccurence.pushParams = function (queryParams, paramLiteral, pref) {
        queryParams.forEach(function (x) { return paramLiteral.properties.push(ASTBuilder.property(pref + x.name, x.value)); });
    };
    HTTPCallOccurence.findName = function (name, args) {
        var res = Opt.empty();
        args.filter(function (x) { return x.name == name; }).forEach(function (x) { return res = new Opt(x); });
        return res;
    };
    HTTPCallOccurence.getUriParamNames = function (seg) {
        var res = [];
        var cur = null;
        for (var a = 0; a < seg.length; a++) {
            var c = seg.charAt(a);
            if (c == '{') {
                cur = "";
                continue;
            }
            if (c == '}') {
                if (cur != null) {
                    res.push(cur);
                    cur = null;
                    continue;
                }
            }
            if (cur != null) {
                cur = cur + c;
            }
        }
        return res;
    };
    HTTPCallOccurence.prototype.isCollapsed = function (cfg) {
        if (this.method.method() == "get") {
            return cfg.collapseGet;
        }
        if (this.method.resource().methods().length == 1) {
            return cfg.collapseOneMethod;
        }
        return false;
    };
    HTTPCallOccurence.prototype.toSnippet = function (cfg) {
        var exp = this.toCall(cfg);
        return escodegen.generate(exp);
    };
    HTTPCallOccurence.prototype.toPatternString = function (cfg) {
        var exp = this.toPattern(cfg);
        return escodegen.generate(exp);
    };
    HTTPCallOccurence.prototype.toCall = function (cfg) {
        try {
            var methodArguments;
            var params = this.otherParams;
            var body = this.bodyParameter;
            var newArgs = [];
            var hasBody = body != null && this.method.bodies().length > 0;
            var hasArgs = params.properties.length > 0;
            if (hasArgs && hasBody && cfg.queryParametersSecond) {
                newArgs.push(body);
                newArgs.push(params);
            }
            else {
                if (hasArgs) {
                    newArgs.push(params);
                }
                if (hasBody) {
                    newArgs.push(body);
                }
            }
            var uri = this.method.resource().completeRelativeUri();
            var res = ASTBuilder.call(this.baseCall(uri, cfg), newArgs);
            return res;
        }
        catch (e) {
            console.log(e.stack);
        }
    };
    HTTPCallOccurence.prototype.toPattern = function (cfg) {
        try {
            var uri = this.method.resource().completeRelativeUri();
            var res = this.baseCall(uri, cfg, true);
            return res;
        }
        catch (e) {
            console.log(e.stack);
        }
    };
    HTTPCallOccurence.prototype.baseCall = function (uri, cfg, toPatern) {
        var _this = this;
        if (toPatern === void 0) { toPatern = false; }
        var segments = uri.split("/");
        var cur = ASTBuilder.ident(this.name);
        var uriParamIndex = 0;
        this.segments.forEach(function (x) {
            if (x.relativeUri() != "") {
                var name = raml2ts.escapedName(x.relativeUri());
                cur = ASTBuilder.member(cur, name);
                var up = x.uriParameters();
                if (cfg.collapseMediaTypes) {
                    up = up.filter(function (x) { return raml2ts.emitParameter(cfg, x); });
                }
                if (up.length > 0 && !toPatern) {
                    var params = _this.uriParameters[uriParamIndex];
                    if (params != null) {
                        cur = ASTBuilder.call(cur, params);
                    }
                    else {
                        params = [];
                        for (var num = 0; num < up.length; num++) {
                            params.push(ASTBuilder.literal(""));
                        }
                        cur = ASTBuilder.call(cur, params);
                    }
                }
            }
            uriParamIndex++;
        });
        if (!this.isCollapsed(cfg)) {
            cur = ASTBuilder.member(cur, this.method.method());
        }
        return cur;
    };
    HTTPCallOccurence.prototype.getMethod = function () {
        return this.method;
    };
    return HTTPCallOccurence;
})();
exports.HTTPCallOccurence = HTTPCallOccurence;
//# sourceMappingURL=HTTPCallOccurence.js.map