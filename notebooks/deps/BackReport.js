var RamlWrapper = require('./Raml08Wrapper');
var HTTPCallOccurence = require('./HTTPCallOccurence');
var fs = require("fs");
var ps = require("path");
var APIENCODEDSTART = "APIENCODEDSTART";
var APIENCODEDEND = "APIENCODEDEND";
var BackReport = (function () {
    function BackReport() {
    }
    BackReport.prototype.buildReport = function (path, cfg) {
        if (cfg === void 0) { cfg = this.extractConfig(path); }
        var content = fs.readFileSync(path).toString();
        var dir = ps.dirname(path);
        var initialMap = {};
        var pMap = {};
        content.split("\n").forEach(function (l) {
            var Iindex = l.indexOf("import");
            if (Iindex != -1) {
                l = l.substr(Iindex + "import ".length).trim();
                var mn = l.substr(0, l.indexOf("=")).trim();
                var vl = l.substr(l.indexOf('"') + 1);
                vl = vl.substr(0, vl.lastIndexOf('"'));
                var modulePath = ps.resolve(dir, vl + ".ts");
                if (fs.existsSync(modulePath)) {
                    try {
                        var content = fs.readFileSync(modulePath).toString();
                        var start = content.indexOf(APIENCODEDSTART);
                        var end = content.indexOf(APIENCODEDEND);
                        if (start != -1) {
                            var apiDef = content.substring(start + APIENCODEDSTART.length + 2, end - 3);
                            var api = RamlWrapper.wrap(JSON.parse(apiDef).data);
                            initialMap[mn] = api;
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            }
            var Iindex = l.indexOf("createApi");
            if (Iindex != -1) {
                var mn = l.substr(0, l.indexOf("=")).trim();
                mn = mn.substr(l.indexOf("var ") + 4).trim();
                var vl = l.substring(l.indexOf("=") + 1, l.indexOf('.')).trim();
                pMap[mn] = initialMap[vl];
                if (!initialMap[vl]) {
                    console.log("Error: not able to load api:" + mn + ":" + vl);
                }
            }
        });
        return { apis: pMap, calls: this.buildOccurenceReport(content, pMap, cfg) };
    };
    BackReport.prototype.buildOccurenceReport = function (content, apis, cfg) {
        var result = [];
        var api_cp = this.buildPatterns(apis, cfg);
        var lines = this.cleanContent(content);
        for (var num = 0; num < lines.length; num++) {
            var line = lines[num];
            if (line.trim().length == 0) {
                continue;
            }
            for (var apiN in apis) {
                var tl = line;
                var callMap = api_cp[apiN];
                while (tl.length > 0) {
                    var pos = tl.indexOf(apiN + ".");
                    if (pos != -1) {
                        tl = tl.substring(pos + (apiN + ".").length);
                        for (var pt in callMap) {
                            if (("client." + tl).indexOf(pt) == 0) {
                                result.push({ method: callMap[pt], lineNumber: (num + 1) });
                                tl = tl.substr(pt.length);
                            }
                        }
                        tl = tl.substr(1);
                    }
                    else {
                        break;
                    }
                }
            }
        }
        return result;
    };
    BackReport.prototype.extractConfig = function (notebookPath) {
        try {
            var dir = ps.dirname(notebookPath);
            var content = fs.readFileSync(notebookPath).toString();
            var str = content.replace(new RegExp('\s', 'g'), '');
            var ind1 = str.indexOf('require("./api');
            var ind1 = str.indexOf('"', ind1) + 1;
            var ind2 = str.indexOf('"', ind1 + 1);
            var clientFileName = str.substring(ind1, ind2) + '.ts';
            var clientPath = ps.resolve(dir, clientFileName);
            var clientContent = fs.readFileSync(clientPath).toString();
            var ind3 = clientContent.indexOf('CONFIGENCODEDSTART');
            ind3 = clientContent.indexOf('{', ind3);
            var ind4 = clientContent.indexOf('CONFIGENCODEDEND', ind3);
            ind4 = clientContent.lastIndexOf('}', ind4) + 1;
            var configContent = clientContent.substring(ind3, ind4);
            var config = JSON.parse(configContent);
            return config;
        }
        catch (e) {
            return null;
        }
    };
    BackReport.prototype.cleanContent = function (s) {
        var cleaned = [];
        var inComma = false;
        var cl = "";
        try {
            for (var i = 0; i < s.length; i++) {
                var c = s.charAt(i);
                if (c == '(') {
                    inComma = true;
                }
                else if (c == ')') {
                    inComma = false;
                }
                else {
                    if (c == '\n') {
                        cleaned.push(cl);
                        cl = "";
                    }
                    if (!inComma) {
                        cl = cl + c;
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
        }
        cleaned.push(cl);
        return cleaned;
    };
    BackReport.prototype.buildPatterns = function (apis, cfg) {
        var api_cp = {};
        for (var apiName in apis) {
            var api = apis[apiName];
            if (api) {
                var allMethods = api.allMethods();
                var cpatterns = {};
                api_cp[apiName] = cpatterns;
                allMethods.forEach(function (m) {
                    try {
                        var pattern = HTTPCallOccurence.HTTPCallOccurence.getPattern(apiName, m, cfg);
                        cpatterns[pattern] = m;
                    }
                    catch (e) {
                        console.log(e.stack);
                    }
                });
            }
        }
        return api_cp;
    };
    return BackReport;
})();
exports.BackReport = BackReport;
//# sourceMappingURL=BackReport.js.map