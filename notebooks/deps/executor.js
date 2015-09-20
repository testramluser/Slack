var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var harExecutor = require('./ramlAwareExecutor');
var RamlWrapper = require('./Raml08Wrapper');
var Helper = require('./wrapperHelper');
var xmlutil = require('./xmlutil');
var raml2ts = require('./raml2ts');
var XML2TS = require('./xmlschema2ts');
var XMLHttpRequestConstructor = require("xmlhttprequest").XMLHttpRequest;
function buildXHR() {
    var x = new XMLHttpRequestConstructor;
    return x;
}
var Header = (function () {
    function Header(name, value) {
        this.name = name;
        this.value = value;
    }
    return Header;
})();
var HARRequest = (function () {
    function HARRequest(url, method, queryArgs, headers) {
        this.httpVersion = "HTTP/1.1";
        this.headersSize = -1;
        this.bodySize = -1;
        this.url = url;
        this.method = method;
        this.queryString = queryArgs;
        this.headers = headers;
    }
    return HARRequest;
})();
function detectMimeType(ramlMethod, options) {
    var optKeys = Object.keys(options);
    for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        if (key.toLowerCase() == 'header_content-type') {
            var val = options[key];
            if (val && typeof (val) == 'string' && val.trim().length > 0) {
                return val;
            }
        }
    }
    var payload = options['payload'];
    var payloadType = typeof (payload);
    if (payloadType === 'object' || payloadType === 'array') {
        var jsonMediaType;
        var xmlMediaType;
        var mediaTypes = ramlMethod instanceof RamlWrapper.Method ? ramlMethod.bodies().map(function (x) { return x.mediaType(); }) : ramlMethod.body().map(function (x) { return x.mediaType().value(); });
        mediaTypes.forEach(function (mt) {
            var mt_lc = mt.toLowerCase();
            if (mt_lc.indexOf('json') >= 0) {
                jsonMediaType = mt;
            }
            else if (mt_lc.indexOf('xml') >= 0) {
                xmlMediaType = mt;
            }
        });
        if (jsonMediaType) {
            return jsonMediaType;
        }
        if (xmlMediaType) {
            return xmlMediaType;
        }
    }
    if (payloadType === 'string') {
        try {
            xmlutil(payload);
            return 'application/xml';
        }
        catch (err) {
        }
    }
    return 'text/plain';
}
function prepareBodyString(payload, mimeType, ramlMethod) {
    var payloadType = typeof (payload);
    if (mimeType.toLowerCase().indexOf('xml') >= 0) {
        if (payloadType === 'object') {
            return XML2TS.serializeToXML(payload);
        }
    }
    if (payloadType === 'object' || payloadType === 'array') {
        return JSON.stringify(payload);
    }
    return '' + payload;
}
function log(varName, value) {
    harExecutor.doLog(varName, value);
    return value;
}
exports.log = log;
var APIExecutor = (function (_super) {
    __extends(APIExecutor, _super);
    function APIExecutor(api, resolvedUrl, cfg) {
        _super.call(this, api, resolvedUrl);
        this.cfg = cfg;
        this.actualExecutor = harExecutor.createExecutor(api, resolvedUrl, cfg);
    }
    APIExecutor.prototype.execute = function (path, method, options) {
        var req = this.toRequest(path, method, options);
        var resp = this.actualExecutor.execute(req);
        return this.processResponse(req, resp);
    };
    APIExecutor.prototype.executeAsync = function (path, method, options) {
        var _this = this;
        var req = this.toRequest(path, method, options);
        var respPromise = this.actualExecutor.executeAsync(req);
        return respPromise.then(function (resp) {
            return _this.processResponse(req, resp);
        });
    };
    APIExecutor.prototype.toRequest = function (path, method, options) {
        var queryParams = [];
        var headers = [];
        var formParams = [];
        var actual = options.options;
        for (var op in actual) {
            if (op.indexOf("header_") == 0) {
                var hv = actual[op];
                var hn = op.substr("header_".length);
                headers.push({ name: hn, value: hv });
            }
            else if (op.indexOf('form_') == 0) {
                var val = actual[op];
                var pName = op.substr("form_".length);
                formParams.push({ name: pName, value: val });
            }
            else if (op.indexOf("headers") == 0) {
                var headersObj = actual[op];
                Object.keys(headersObj).forEach(function (x) { return headers.push({ name: x, value: headersObj[x] }); });
            }
            queryParams.push({
                name: op,
                value: actual[op]
            });
        }
        var req = new HARRequest(path, method, queryParams, headers);
        if (formParams.length > 0) {
            req.postData = {
                mimeType: 'application/x-www-form-urlencoded',
                params: formParams
            };
        }
        else if (options['payload']) {
            var ramlMethod = this.findMethod(path, method);
            var mimeType = detectMimeType(ramlMethod, options);
            var bodyString = prepareBodyString(options['payload'], mimeType, ramlMethod);
            var postData = {
                mimeType: mimeType,
                text: bodyString
            };
            req.postData = postData;
            req.headers.push({ "name": "Content-Type", "value": mimeType });
        }
        return req;
    };
    APIExecutor.prototype.processResponse = function (req, resp) {
        var status = resp.status;
        if (this.cfg.throwExceptionOnIncorrectStatus && status > 399) {
            throw new Error('Invalid status');
        }
        var ramlMethod = this.findMethod(req.url, req.method);
        var mimeType;
        var xmlSchema;
        var canBeJson = false;
        var canBeXml = false;
        if (resp.headers) {
            var ctHeaders = resp.headers.filter(function (x) { return x.name.toLowerCase() == 'content-type'; });
            if (ctHeaders.length > 0) {
                mimeType = ctHeaders[0].value;
            }
        }
        var statusStr = '' + status;
        var bodies = [];
        if (ramlMethod instanceof RamlWrapper.Method) {
            ramlMethod.responses().filter(function (x) { return x.code() == statusStr; }).forEach(function (x) { return bodies = bodies.concat(x.bodies()); });
        }
        else {
            ramlMethod.responses().filter(function (x) { return x.code() == statusStr; }).forEach(function (x) { return bodies = bodies.concat(x.body()); });
        }
        bodies.forEach(function (x) {
            var mt = x instanceof RamlWrapper.Body ? x.mediaType() : x.mediaType().value();
            mt = mt.toLowerCase();
            if (mt.indexOf('json') >= 0) {
                canBeJson = true;
            }
            else if (mt.indexOf('xml') >= 0) {
                canBeXml = true;
                var schemaOpt = x instanceof RamlWrapper.Body ? x.schema() : Helper.schema(x, Helper.ownerApi(ramlMethod));
                xmlSchema = schemaOpt.getOrElse(xmlSchema);
            }
        });
        var parsed;
        var result;
        var text = resp.content.text;
        if (mimeType) {
            mimeType = mimeType.toLowerCase();
            if (mimeType.indexOf('json') >= 0) {
                try {
                    parsed = JSON.parse(text);
                }
                catch (e) {
                }
            }
            else if (mimeType.indexOf('xml') >= 0) {
                if (xmlSchema) {
                    var parseOpt = XML2TS.parseClassInstance(text, xmlSchema.content());
                    if (parseOpt.isDefined()) {
                        parsed = parseOpt.getOrThrow();
                    }
                }
                else {
                    try {
                        parsed = xmlutil(text);
                    }
                    catch (e) {
                    }
                }
            }
        }
        else {
            if (canBeJson) {
                try {
                    parsed = JSON.parse(text);
                }
                catch (e) {
                }
            }
            if (!parsed) {
                if (xmlSchema) {
                    var parseOpt = XML2TS.parseClassInstance(text, xmlSchema.content());
                    if (parseOpt.isDefined()) {
                        parsed = parseOpt.getOrThrow();
                    }
                }
                if (!parsed && canBeXml) {
                    try {
                        parsed = xmlutil(text);
                    }
                    catch (e) {
                    }
                }
            }
        }
        result = parsed ? parsed : text;
        if (this.cfg.storeHarEntry) {
            var harEntry = {
                request: req,
                response: resp
            };
            if (!parsed) {
                result = {};
            }
            result[raml2ts.HAR_ENTRY_FIELD_NAME] = harEntry;
        }
        return result;
    };
    APIExecutor.prototype.log = function (vName, val) {
        this.actualExecutor.log(vName, val);
        return val;
    };
    return APIExecutor;
})(harExecutor.MethodMatcher);
exports.APIExecutor = APIExecutor;
//# sourceMappingURL=executor.js.map