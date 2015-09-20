var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RamlWrapper = require('./Raml08Wrapper');
var Helper = require('./wrapperHelper');
var report = require('./executionReport');
var reportImpl = require('./executionReportImpl');
var env = require('./executionEnvironment');
var xmlutil = require('./xmlutil');
var raml2ts = require('./raml2ts');
var ZSchema = require("z-schema");
var platformExecution = require('./platformExecution');
var XMLHttpRequestConstructor = require("xmlhttprequest").XMLHttpRequest;
function buildXHR() {
    var x = new XMLHttpRequestConstructor;
    return x;
}
var LoggingExecutor = (function () {
    function LoggingExecutor(_delegate) {
        this._delegate = _delegate;
    }
    LoggingExecutor.prototype.execute = function (req) {
        console.log(req.url);
        var res = this._delegate.execute(req);
        return res;
    };
    LoggingExecutor.prototype.executeAsync = function (req) {
        console.log(req.url);
        var res = this._delegate.executeAsync(req);
        return res;
    };
    LoggingExecutor.prototype.log = function (varName, value) {
        this._delegate.log(varName, value);
    };
    return LoggingExecutor;
})();
exports.LoggingExecutor = LoggingExecutor;
var MethodMatcher = (function () {
    function MethodMatcher(_api, burl) {
        this._api = _api;
        this.burl = burl;
    }
    MethodMatcher.prototype.findMethod = function (url, method) {
        var res;
        var buri = this.burl;
        var m = null;
        var allResources = this._api instanceof RamlWrapper.Api ? this._api.allResources() : Helper.allResources(this._api);
        allResources.forEach(function (x) {
            var fullRelativeUri = url.substr(buri.length);
            var matchUri = x instanceof RamlWrapper.Resource ? x.matchUri(fullRelativeUri).isDefined() : Helper.matchUri(fullRelativeUri, x).isDefined();
            if (matchUri) {
                res = x;
                res.methods().forEach(function (x) {
                    if (x.method().toLowerCase() == method.toLowerCase()) {
                        m = x;
                    }
                });
            }
        });
        return m;
    };
    return MethodMatcher;
})();
exports.MethodMatcher = MethodMatcher;
var AuthenticationDecorator = (function (_super) {
    __extends(AuthenticationDecorator, _super);
    function AuthenticationDecorator(_delegate, _api, burl, cfg) {
        _super.call(this, _api, burl);
        this._delegate = _delegate;
        this.cfg = cfg;
    }
    AuthenticationDecorator.prototype.execute = function (req) {
        this.patchRequest(req);
        var res = this._delegate.execute(req);
        return res;
    };
    AuthenticationDecorator.prototype.executeAsync = function (req) {
        this.patchRequest(req);
        var res = this._delegate.executeAsync(req);
        return res;
    };
    AuthenticationDecorator.prototype.patchRequest = function (req) {
        var m = this.findMethod(req.url, req.method);
        if (m) {
            env.getAuthManager().patchRequest(req, m);
        }
    };
    AuthenticationDecorator.prototype.log = function (varName, value) {
    };
    return AuthenticationDecorator;
})(MethodMatcher);
exports.AuthenticationDecorator = AuthenticationDecorator;
var ramlMethodPath = function (m) {
    var absUri = m instanceof RamlWrapper.Method ? m.resource().absoluteUri() : Helper.completeRelativeUri(Helper.parentResource(m));
    return m.method().toUpperCase() + ' ' + absUri;
};
var requestPath = function (req) {
    return req.method.toUpperCase() + ' ' + req.url;
};
var RequestValidator = (function (_super) {
    __extends(RequestValidator, _super);
    function RequestValidator(_delegate, _api, burl, cfg) {
        _super.call(this, _api, burl);
        this._delegate = _delegate;
        this.cfg = cfg;
    }
    RequestValidator.prototype.execute = function (req) {
        var step = new reportImpl.Step();
        step.request = req;
        try {
            this.validateRequest(req, step);
            try {
                var res = this._delegate.execute(req);
                step.response = res;
            }
            catch (err) {
                this.reportException(step, err);
            }
            this.validateResponse(req, res, step);
            return res;
        }
        catch (err) {
            this.reportException(step, err);
        }
        finally {
            appendStep(step);
        }
    };
    RequestValidator.prototype.log = function (varName, value) {
        this._delegate.log(varName, value);
        appendVarLog({
            varName: varName,
            value: value,
            filePath: "unknown",
            lineNumber: 0,
            columnNumber: 0
        });
    };
    RequestValidator.prototype.executeAsync = function (req) {
        var _this = this;
        var step = new reportImpl.Step();
        step.request = req;
        try {
            this.validateRequest(req, step);
            var res = this._delegate.executeAsync(req);
            return res.then(function (r) {
                step.response = r;
                _this.validateResponse(req, r, step);
                appendStep(step);
                return r;
            }).catch(function (err) {
                _this.reportException(step, err);
                appendStep(step);
                return err;
            });
        }
        catch (err) {
            this.reportException(step, err);
        }
    };
    RequestValidator.prototype.reportException = function (step, err, altMessage) {
        var text = err.toString();
        if (altMessage) {
            text = altMessage;
        }
        console.log(text);
        var msg = new reportImpl.Message(report.MessageCodes.EXCEPTION, report.MessageSeverity.ERROR, text);
        step.appendMessage(msg);
    };
    RequestValidator.prototype.reportInfo = function (step, message) {
        var msg = new reportImpl.Message(report.MessageCodes.OK, report.MessageSeverity.INFO, message);
        step.appendMessage(msg);
    };
    RequestValidator.prototype.validateRequest = function (req, step) {
        var m = this.findMethod(req.url, req.method);
        var msg = null;
        if (m) {
            this.reportInfo(step, 'Method mapped: ' + requestPath(req) + ' -> ' + ramlMethodPath(m));
        }
        else {
            msg = new reportImpl.Message(report.MessageCodes.VALIDATION_FAILURE, report.MessageSeverity.ERROR, 'Method can not be mapped on api: ' + requestPath(req));
            step.appendMessage(msg);
        }
        if (m) {
            if (m instanceof RamlWrapper.Method) {
                var raml08Method = m;
                step.methodId = raml08Method.id().value();
                step.apiTitle = raml08Method.api().title().value();
                step.resourceId = raml08Method.resource().id().value();
            }
            else {
                var raml10Method = m;
                step.methodId = Helper.methodId(raml10Method);
                step.apiTitle = Helper.ownerApi(raml10Method).title();
                step.resourceId = Helper.completeRelativeUri(Helper.parentResource(raml10Method));
            }
            this.validateRequestArguments(m, req, step);
        }
    };
    RequestValidator.prototype.validateRequestArguments = function (m, req, step) {
    };
    RequestValidator.prototype.validateResponseValue = function (m, req, step) {
        var _this = this;
        console.log("Response:" + req);
        var status = ('' + req.status);
        if (parseInt('' + status[0]) > 3) {
            var msg = new reportImpl.Message(report.MessageCodes.EXCEPTION, report.MessageSeverity.ERROR, 'Invalid response status: ' + status);
            step.appendMessage(msg);
        }
        var bodiesMap = {};
        if (m instanceof RamlWrapper.Method) {
            m.responses().forEach(function (x) { return bodiesMap[x.code()] = x.bodies(); });
        }
        else {
            m.responses().forEach(function (x) { return bodiesMap[x.code()] = x.body(); });
        }
        var ct;
        try {
            ct = JSON.parse(req.content.text);
        }
        catch (err) {
            try {
                xmlutil(req.content.text);
            }
            catch (err) {
                var expectsObject = false;
                var expectsText = false;
                Object.keys(bodiesMap).forEach(function (x) {
                    bodiesMap[x].forEach(function (y) {
                        var mt = y instanceof RamlWrapper.Body ? y.mediaType() : y.mediaType().value();
                        mt = mt.toLowerCase();
                        expectsObject = expectsObject || mt.indexOf('xml') > 0 || mt.indexOf('json') > 0;
                        expectsText = expectsObject || mt.indexOf('text/') == 0;
                    });
                });
                if (expectsObject && !expectsText) {
                    var msg = new reportImpl.Message(report.MessageCodes.OTHER, report.MessageSeverity.ERROR, 'Unable to parse response:\n' + req.content.text);
                    step.appendMessage(msg);
                }
            }
        }
        if (!ct) {
            return;
        }
        Object.keys(bodiesMap).forEach(function (x) {
            try {
                if (x == status) {
                    console.log("Status matched");
                    bodiesMap[x].forEach(function (y) {
                        var mt = y instanceof RamlWrapper.Body ? y.mediaType() : y.mediaType().value();
                        if (mt.toLowerCase().indexOf("json") != -1) {
                            var schemaOpt = y instanceof RamlWrapper.Body ? y.schema() : Helper.schema(y, Helper.ownerApi(m));
                            schemaOpt.forEach(function (sch) {
                                var content = sch.content();
                                var schemaCoordinates = ramlMethodPath(m) + ' ' + x + ' ' + mt;
                                _this.validateBodyAgainstSchema(ct, content, step, schemaCoordinates);
                            });
                        }
                    });
                }
            }
            catch (err) {
                _this.reportException(step, err);
            }
        });
    };
    RequestValidator.prototype.validateBodyAgainstSchema = function (bcontent, schema, step, schemaCoordinates) {
        try {
            var jsonSchemaObject;
            try {
                var jsonSchemaObject = JSON.parse(schema);
            }
            catch (err) {
                try {
                    xmlutil(schema);
                }
                catch (err) {
                    var msg = new reportImpl.Message(report.MessageCodes.VALIDATION_FAILURE, report.MessageSeverity.ERROR, 'Can not parse schema:\n' + schemaCoordinates);
                    step.appendMessage(msg);
                }
            }
            if (!jsonSchemaObject) {
                return;
            }
            try {
                var api = require('json-schema-compatibility');
                jsonSchemaObject = api.v4(jsonSchemaObject);
            }
            catch (e) {
                this.reportException(step, e, 'Can not parse schema' + schema);
            }
            delete jsonSchemaObject['$schema'];
            delete jsonSchemaObject['required'];
            var validator = new ZSchema();
            var valid = validator.validate(bcontent, jsonSchemaObject);
            if (valid) {
                this.reportInfo(step, 'Valid schema: ' + schemaCoordinates);
                return;
            }
            var errors = validator.getLastErrors();
            errors.filter(function (x) { return x.code == "UNRESOLVABLE_REFERENCE"; }).forEach(function (x) {
                var schemaUrl = x.params[0];
                var req = buildXHR();
                req.open("GET", schemaUrl + "", false);
                req.send();
                var strng = req.responseText;
                validator.setRemoteReference(schemaUrl, JSON.parse(strng));
            });
            var valid = validator.validate(bcontent, jsonSchemaObject);
            if (valid) {
                this.reportInfo(step, 'Valid schema: ' + schemaCoordinates);
                return;
            }
            var errors = validator.getLastErrors();
            var msg = new reportImpl.Message(report.MessageCodes.VALIDATION_FAILURE, report.MessageSeverity.ERROR, 'Invalid schema: ' + schemaCoordinates, errors);
            step.appendMessage(msg);
        }
        catch (err) {
            this.reportException(step, err);
        }
    };
    RequestValidator.prototype.validateResponse = function (req, resp, step) {
        var m = this.findMethod(req.url, req.method);
        if (m) {
            this.validateResponseValue(m, resp, step);
        }
    };
    return RequestValidator;
})(MethodMatcher);
exports.RequestValidator = RequestValidator;
var SimpleExecutor = (function () {
    function SimpleExecutor(cfg) {
        this.cfg = cfg;
    }
    SimpleExecutor.prototype.execute = function (req, doAppendParams) {
        if (doAppendParams === void 0) { doAppendParams = true; }
        var xhr = buildXHR();
        var url = req.url;
        if (doAppendParams) {
            url = this.appendParams(req, req.url);
        }
        xhr.open(req.method, url, false);
        this.doRequest(req, xhr);
        var status = xhr.status;
        if (status > 300 && status < 400) {
            var locHeader = xhr.getResponseHeader('location');
            if (locHeader) {
                req.url = locHeader;
                return this.execute(req, false);
            }
        }
        var response = {
            status: status,
            headers: xhr.getAllResponseHeaders().split('\n').map(function (x) {
                var ind = x.indexOf(':');
                return {
                    name: x.substring(0, ind).trim(),
                    value: x.substring(ind + 1).trim()
                };
            }),
            content: {
                text: xhr.responseText,
                mimeType: xhr.responseType
            }
        };
        return response;
    };
    SimpleExecutor.prototype.appendParams = function (req, url) {
        var gotQueryParams = (req.queryString && req.queryString.length > 0);
        var gotFormParams = (req.postData && req.postData.params && req.postData.params.length > 0);
        if (gotQueryParams || gotFormParams) {
            url = url + '?';
            var arr = [];
            if (gotQueryParams) {
                arr = arr.concat(req.queryString.map(function (q) {
                    return encodeURIComponent(q.name) + '=' + encodeURIComponent(q.value);
                }));
            }
            if (gotFormParams) {
                arr = arr.concat(req.postData.params.map(function (q) {
                    return encodeURIComponent(q.name) + '=' + encodeURIComponent(q.value);
                }));
            }
            url += arr.join('&');
        }
        return url;
    };
    SimpleExecutor.prototype.log = function (varName, value) {
    };
    SimpleExecutor.prototype.executeAsync = function (req, doAppendParams) {
        if (doAppendParams === void 0) { doAppendParams = true; }
        var xhr = buildXHR();
        var url = req.url;
        if (doAppendParams) {
            url = this.appendParams(req, req.url);
        }
        var outer = this;
        return new Promise(function (resolve, reject) {
            xhr.open(req.method, url, true);
            xhr.onload = function () {
                var status = xhr.status;
                if (status > 300 && status < 400) {
                    var locHeader = xhr.getResponseHeader('location');
                    if (locHeader) {
                        req.url = locHeader;
                        return outer.executeAsync(req, false);
                    }
                }
                var response = {
                    status: status,
                    headers: xhr.getAllResponseHeaders().split('\n').map(function (x) {
                        var ind = x.indexOf(':');
                        return {
                            name: x.substring(0, ind).trim(),
                            value: x.substring(ind + 1).trim()
                        };
                    }),
                    content: {
                        text: xhr.responseText,
                        mimeType: xhr.responseType
                    }
                };
                if (outer.cfg && outer.cfg.storeHarEntry) {
                    response[raml2ts.HAR_ENTRY_FIELD_NAME] = {
                        request: req,
                        response: {
                            status: status,
                            content: {
                                text: xhr.responseText,
                                mimeType: xhr.responseType
                            }
                        }
                    };
                }
                resolve(response);
            };
            xhr.onerror = function () {
                reject(Error("Network Error"));
            };
            outer.doRequest(req, xhr);
        });
    };
    SimpleExecutor.prototype.doRequest = function (req, xhr) {
        if (req.headers) {
            req.headers.forEach(function (x) { return xhr.setRequestHeader(x.name, x.value); });
        }
        if (req.postData) {
            if (req.postData.params) {
                var body = '';
                req.postData.params.forEach(function (p) { return body += p.name + '=' + encodeURIComponent(p.value) + '&'; });
                body = body.substring(0, body.length - 1);
                xhr.send(body);
            }
            else {
                xhr.send(req.postData.text);
            }
        }
        else {
            xhr.send();
        }
    };
    return SimpleExecutor;
})();
exports.SimpleExecutor = SimpleExecutor;
function appendStep(step) {
    appendFilePathAndPosition(step);
    env.getReportManager().serializeStep(step);
}
function doLog(varName, value) {
    appendVarLog({
        varName: varName,
        value: value,
        filePath: "unknown",
        lineNumber: 0,
        columnNumber: 0
    });
}
exports.doLog = doLog;
function appendVarLog(step) {
    appendFilePathAndPosition(step, true);
    env.getReportManager().serializeStep(step);
}
function createExecutor(api, baseUri, cfg) {
    return new AuthenticationDecorator(new RequestValidator(new SimpleExecutor(cfg), api, baseUri, cfg), api, baseUri, cfg);
}
exports.createExecutor = createExecutor;
function createFakeExecutor(api, baseUri, cfg) {
    return new RequestValidator(new FakeHARExecutor(), api, baseUri, cfg);
}
exports.createFakeExecutor = createFakeExecutor;
var HARRequestWithResponse = (function () {
    function HARRequestWithResponse(entry) {
        var request = entry.request;
        var response = entry.response;
        if (!request) {
            throw new Error('HAR entry has no request:\n' + entry.toString());
        }
        if (!response) {
            throw new Error('HAR entry has no response:\n' + entry.toString());
        }
        for (var key in request) {
            this[key] = request[key];
        }
        this.response = function () { return response; };
    }
    return HARRequestWithResponse;
})();
exports.HARRequestWithResponse = HARRequestWithResponse;
var FakeHARExecutor = (function () {
    function FakeHARExecutor() {
    }
    FakeHARExecutor.prototype.execute = function (req) {
        return req.response();
    };
    FakeHARExecutor.prototype.executeAsync = function (req) {
        return Promise.resolve(req.response());
    };
    FakeHARExecutor.prototype.log = function (varName, value) {
    };
    return FakeHARExecutor;
})();
exports.FakeHARExecutor = FakeHARExecutor;
function appendFilePathAndPosition(step, st) {
    if (st === void 0) { st = false; }
    if (platformExecution.type == 'java') {
        return;
    }
    var err = new Error();
    var stack = err['stack'];
    var split = stack.split(/\r?\n/).map(function (x) { return x.replace(new RegExp('\\\\', 'g'), '/'); });
    var stackLines = split.map(function (x) {
        var j = x.lastIndexOf('/') + 1;
        var i0 = x.indexOf('(') + 1;
        var i2 = x.lastIndexOf(':');
        var i1 = x.lastIndexOf(':', i2 - 1);
        var i3 = x.lastIndexOf(')');
        var className = x.substring(i0, j);
        var filePath = x.substring(i0, i1);
        var lineNumber = x.substring(i1 + 1, i2);
        var columnNumber = x.substring(i2 + 1, i3);
        var sl = new StackLine(className, filePath, parseInt(lineNumber), parseInt(columnNumber));
        return sl;
    });
    var count = 0;
    var beyondExecutor = false;
    var notebookLine;
    var fileName = null;
    for (var i = 0; i < stackLines.length; i++) {
        var sl = stackLines[i];
        if (sl.filePath.indexOf('executor.js') != -1) {
            beyondExecutor = true;
            continue;
        }
        if (beyondExecutor) {
            if (fileName) {
                if (sl.filePath != fileName) {
                    notebookLine = sl;
                    break;
                }
            }
            else {
                fileName = sl.filePath;
                if (st) {
                    notebookLine = sl;
                    break;
                }
            }
        }
    }
    if (!notebookLine) {
        return;
    }
    step.filePath = notebookLine.filePath;
    step.lineNumber = notebookLine.lineNumber;
    step.columnNumber = notebookLine.columnNumber;
}
var StackLine = (function () {
    function StackLine(className, filePath, lineNumber, columnNumber) {
        this.className = className;
        this.filePath = filePath;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
    }
    return StackLine;
})();
//# sourceMappingURL=ramlAwareExecutor.js.map