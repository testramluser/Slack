var report = require('./executionReport');
var reportImpl = require('./executionReportImpl');
var backReport = require('./BackReport');
var util = require('./index');
var path = require('path');
var fs = require('fs');
var LOG_DEFAULT_FILENAME = 'executionLog.json';
var LOG_PATH_ARGNAME = '-logDir';
var RESET_LOG_ARGNAME = '-resetLog';
var ReportManager = (function () {
    function ReportManager() {
        this.blocked = false;
        this.hasBeenUsed = false;
        this.startedWriting = false;
        this.reset = false;
        this.logPathArgName = function () { return LOG_PATH_ARGNAME; };
        this.resetLogArgName = function () { return RESET_LOG_ARGNAME; };
        this.logDefaultFileNmae = function () { return LOG_DEFAULT_FILENAME; };
        var args = process.argv;
        for (var i = 0; i < args.length; i++) {
            if (args[i] == LOG_PATH_ARGNAME && i < args.length - 1) {
                this.logPath = args[i + 1];
            }
            else if (args[i] == RESET_LOG_ARGNAME) {
                this.reset = true;
            }
        }
        if (!this.logPath) {
            this.logPath = path.resolve(process.cwd(), LOG_DEFAULT_FILENAME);
        }
    }
    ReportManager.prototype.setLogPath = function (logPath) {
        this.logPath = fs.lstatSync(logPath).isDirectory() ? path.resolve(logPath, LOG_DEFAULT_FILENAME) : logPath;
        this.startedWriting = false;
    };
    ReportManager.prototype.serializeStep = function (step) {
        this.hasBeenUsed = true;
        while (this.blocked) {
        }
        this.blocked = true;
        try {
            var buf = ',\n' + JSON.stringify(step);
            if (!this.startedWriting) {
                var exists = fs.existsSync(this.logPath);
                if (!exists || this.reset) {
                    fs.writeFileSync(this.logPath, '[' + buf.substring(1), 'utf8');
                }
                else {
                    var content = fs.readFileSync(this.logPath).toString().trim();
                    if (util.stringEndsWith(content, ']')) {
                        fs.writeFileSync(this.logPath, content.substring(0, content.length - 1) + buf);
                    }
                }
                this.startedWriting = true;
            }
            else {
                fs.appendFileSync(this.logPath, buf, 'utf8');
            }
        }
        catch (err) {
            console.log(err);
        }
        finally {
            this.blocked = false;
        }
    };
    ReportManager.prototype.finalize = function () {
        if (!this.hasBeenUsed) {
            return;
        }
        try {
            fs.appendFileSync(this.logPath, '\n]', 'utf8');
        }
        catch (err) {
            console.log(err);
        }
    };
    ReportManager.prototype.readReport = function (filePath) {
        var str = fs.readFileSync(filePath).toString().trim();
        if (str.indexOf(']', str.length - 1) < 0) {
            str += ']';
        }
        var arr = JSON.parse(str);
        return arr;
    };
    ReportManager.prototype.getReportObject = function (logPath, notebookPath) {
        var staticReport = new backReport.BackReport().buildReport(notebookPath);
        var apis = [];
        for (var key in staticReport.apis) {
            var api = staticReport.apis[key];
            apis.push(api);
        }
        return this.getReportObjectForApis(logPath, apis);
    };
    ReportManager.prototype.getLatestReportFor = function (pth) {
        var actualReportPath = path.dirname(pth) + "/executionLog.json";
        if (!fs.existsSync(pth) || !fs.existsSync(actualReportPath)) {
            return null;
        }
        var report = this.getReportObject(actualReportPath, pth);
        return report;
    };
    ReportManager.prototype.getReportObjectForApis = function (logPath, apis) {
        var steps = this.readReport(logPath);
        var executionReport = new reportImpl.ExecutionReport(steps, new Date().toDateString());
        var reportObject = report.ReportObject.build(executionReport, apis);
        return reportObject;
    };
    return ReportManager;
})();
exports.ReportManager = ReportManager;
//# sourceMappingURL=executionReportManager.js.map