var _ = require("underscore");
var sourceMap = require("source-map");
var fs = require("fs");
var path = require("path");
var ReportObject = (function () {
    function ReportObject() {
        var _this = this;
        this._failures = [];
        this.coveredResources = function () { return _this._coveredResources; };
        this.notCoveredResources = function () { return _this._notCoveredResources; };
        this.coveredMethods = function () { return _this._coveredMethods; };
        this.notCoveredMethods = function () { return _this._notCoveredMethods; };
    }
    ReportObject.prototype.failures = function () {
        return this._failures;
    };
    ReportObject.prototype.statuses = function (m) {
        var s = this.steps(m);
        return _.unique(s.map(function (x) { return x.response.status; }));
    };
    ReportObject.prototype.apis = function () {
        return this._apis;
    };
    ReportObject.prototype.findSteps = function (lineNumber, path) {
        return this._execution.steps.filter(function (x) { return x.lineNumber == lineNumber + 1 && x.filePath == path; });
    };
    ReportObject.prototype.stepsFromIds = function (ids) {
        return this._execution.steps.filter(function (x) { return ids.indexOf(x.id) != -1; });
    };
    ReportObject.prototype.steps = function (method) {
        return this._execution.steps.filter(function (x) { return x.methodId == method.id().value(); });
    };
    ReportObject.prototype.allSteps = function () {
        return this._execution.steps;
    };
    ReportObject.prototype.methodFromStep = function (step) {
        var result = null;
        this.apis().forEach(function (x) { return x.allMethods().forEach(function (m) {
            if (m.id().value() == step.methodId) {
                result = m;
            }
        }); });
        return result;
    };
    ReportObject.prototype.stepFailures = function (step) {
        return this._failures.filter(function (x) { return x.step.id == step.id; });
    };
    ReportObject.prototype.methodFailures = function (method) {
        return this._failures.filter(function (x) { return x.step.methodId == method.id().value(); });
    };
    ReportObject.prototype.vars = function () {
        return this._execution.variableLog;
    };
    ReportObject.build = function (report, apis) {
        try {
            ReportObject.remapLines(report);
        }
        catch (e) {
        }
        var map = {};
        report.steps.forEach(function (x) {
            var apiTitle = x.apiTitle;
            var resourceId = x.resourceId;
            var methodId = x.methodId;
            console.log(x.methodId);
            var api = map[apiTitle];
            if (!api) {
                api = {};
                map[apiTitle] = api;
            }
            var resource = api[resourceId];
            if (!resource) {
                resource = {};
                api[resourceId] = resource;
            }
            resource[methodId] = 1;
        });
        var failures = [];
        report.steps.forEach(function (x) {
            if (x.messages) {
                x.messages.forEach(function (y) {
                    if (y.severity != 0 /* INFO */) {
                        failures.push({ message: y, step: x });
                    }
                });
            }
        });
        var cm = [];
        var cr = [];
        var ncm = [];
        var ncr = [];
        var all = 0;
        apis.filter(function (x) { return x != null && x != undefined; }).forEach(function (api) { return all += api.allMethods().length; });
        apis.filter(function (x) { return x != null && x != undefined; }).forEach(function (api) { return api.allResources().forEach(function (res) {
            var apiInfo = map[api.title().value()];
            if (!apiInfo) {
                return;
            }
            var resourceInfo = apiInfo[res.id().value()];
            if (!resourceInfo) {
                ncr.push(res);
                return;
            }
            var allCovered = true;
            res.methods().forEach(function (m) {
                var methodInfo = resourceInfo[m.id().value()];
                if (!methodInfo) {
                    allCovered = false;
                    ncm.push(m);
                }
                else {
                    cm.push(m);
                }
            });
            if (allCovered) {
                cr.push(res);
            }
            else {
                ncr.push(res);
            }
        }); });
        var reportObject = new ReportObject();
        reportObject._coveredMethods = cm;
        reportObject.procent = reportObject.coveredMethods().length / all;
        reportObject._coveredResources = cr;
        reportObject._notCoveredResources = ncr;
        reportObject._failures = failures;
        reportObject._execution = report;
        reportObject._apis = apis;
        return reportObject;
    };
    ReportObject.remapLines = function (report) {
        var consumers = {};
        report.steps.forEach(function (x) {
            var consumer = consumers[x.filePath];
            if (!consumer) {
                var mapPath = x.filePath + ".map";
                var rawMap = JSON.parse(fs.readFileSync(mapPath).toString());
                consumer = new sourceMap.SourceMapConsumer(rawMap);
                consumers[x.filePath] = consumer;
            }
            var p = { line: x.lineNumber, column: x.columnNumber };
            var newPos = consumer.originalPositionFor(p);
            if (newPos) {
                x.lineNumber = newPos.line;
                x.columnNumber = newPos.column;
                var actualFile = newPos.source.replace(".l.ts", "");
                x.filePath = path.resolve(path.dirname(x.filePath), actualFile);
            }
        });
    };
    return ReportObject;
})();
exports.ReportObject = ReportObject;
function merge(profiles) {
    return null;
}
exports.merge = merge;
(function (MessageSeverity) {
    MessageSeverity[MessageSeverity["INFO"] = 0] = "INFO";
    MessageSeverity[MessageSeverity["WARNING"] = 1] = "WARNING";
    MessageSeverity[MessageSeverity["ERROR"] = 2] = "ERROR";
})(exports.MessageSeverity || (exports.MessageSeverity = {}));
var MessageSeverity = exports.MessageSeverity;
(function (MessageCodes) {
    MessageCodes[MessageCodes["OK"] = 0] = "OK";
    MessageCodes[MessageCodes["VALIDATION_FAILURE"] = 1] = "VALIDATION_FAILURE";
    MessageCodes[MessageCodes["EXCEPTION"] = 2] = "EXCEPTION";
    MessageCodes[MessageCodes["OTHER"] = 3] = "OTHER";
})(exports.MessageCodes || (exports.MessageCodes = {}));
var MessageCodes = exports.MessageCodes;
//# sourceMappingURL=executionReport.js.map