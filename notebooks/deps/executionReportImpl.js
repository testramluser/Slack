var ExecutionReport = (function () {
    function ExecutionReport(steps, date, environment) {
        var _this = this;
        this.date = date;
        this.environment = environment;
        this.steps = [];
        this.variableLog = [];
        steps.forEach(function (x) {
            if (x["varName"]) {
                _this.variableLog.push(x);
            }
            else {
                _this.steps.push(x);
            }
        });
    }
    return ExecutionReport;
})();
exports.ExecutionReport = ExecutionReport;
var Step = (function () {
    function Step() {
        this.id = '' + new Date().getTime();
        this.messages = [];
    }
    Step.prototype.appendMessage = function (message) {
        this.messages.push(message);
    };
    return Step;
})();
exports.Step = Step;
var Message = (function () {
    function Message(code, severity, message, extras) {
        this.code = code;
        this.severity = severity;
        this.message = message;
        this.extras = extras;
    }
    return Message;
})();
exports.Message = Message;
//# sourceMappingURL=executionReportImpl.js.map