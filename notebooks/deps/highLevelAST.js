var ds = require('./definitionSystem');
(function (IssueCode) {
    IssueCode[IssueCode["UNRESOLVED_REFERENCE"] = 0] = "UNRESOLVED_REFERENCE";
    IssueCode[IssueCode["YAML_ERROR"] = 1] = "YAML_ERROR";
    IssueCode[IssueCode["UNKNOWN_NODE"] = 2] = "UNKNOWN_NODE";
    IssueCode[IssueCode["MISSING_REQUIRED_PROPERTY"] = 3] = "MISSING_REQUIRED_PROPERTY";
    IssueCode[IssueCode["PROPERTY_EXPECT_TO_HAVE_SINGLE_VALUE"] = 4] = "PROPERTY_EXPECT_TO_HAVE_SINGLE_VALUE";
    IssueCode[IssueCode["KEY_SHOULD_BE_UNIQUE_INTHISCONTEXT"] = 5] = "KEY_SHOULD_BE_UNIQUE_INTHISCONTEXT";
    IssueCode[IssueCode["UNABLE_TO_RESOLVE_INCLUDE_FILE"] = 6] = "UNABLE_TO_RESOLVE_INCLUDE_FILE";
    IssueCode[IssueCode["INVALID_VALUE_SCHEMA"] = 7] = "INVALID_VALUE_SCHEMA";
    IssueCode[IssueCode["MISSED_CONTEXT_REQUIREMENT"] = 8] = "MISSED_CONTEXT_REQUIREMENT";
    IssueCode[IssueCode["NODE_HAS_VALUE"] = 9] = "NODE_HAS_VALUE";
    IssueCode[IssueCode["ONLY_OVERRIDE_ALLOWED"] = 10] = "ONLY_OVERRIDE_ALLOWED";
})(exports.IssueCode || (exports.IssueCode = {}));
var IssueCode = exports.IssueCode;
;
var Problem = (function () {
    function Problem() {
        this.code = 0;
    }
    Problem.prototype.isOk = function () {
        return this.code == 0;
    };
    return Problem;
})();
exports.Problem = Problem;
function ast2Object(node) {
    var result = {};
    node.attrs().forEach(function (x) {
        result[x.property().name()] = x.value();
    });
    node.elements().forEach(function (x) {
        var m = result[x.property().name()];
        if (Array.isArray(m)) {
            m.push(ast2Object(x));
        }
        else if (x.property().isMultiValue()) {
            result[x.property().name()] = [ast2Object(x)];
        }
        else {
            result[x.property().name()] = ast2Object(x);
        }
    });
    return result;
}
exports.ast2Object = ast2Object;
var universes = {};
var fs = require("fs");
var path = require("path");
var tsstruct = require('./tsStructureParser');
var ts2def = require('./tsStrut2Def');
var hlImpl = require('./highLevelImpl');
function load() {
    var sp = path.resolve(__dirname, "./spec-1.0/api.ts");
    var decls = fs.readFileSync(sp).toString();
    var src = tsstruct.parseStruct(decls, {}, sp);
    var universe = ts2def.toDefSystem(src);
    universe.setUniverseVersion("RAML1");
    var sp08 = path.resolve(__dirname, "./spec-0.8/api.ts");
    var decls08 = fs.readFileSync(sp08).toString();
    var src08 = tsstruct.parseStruct(decls08, {}, sp08);
    var universe08 = ts2def.toDefSystem(src08);
    var spSwagger = path.resolve(__dirname, "./spec-swagger-2.0/swagger.ts");
    var declsSwagger = fs.readFileSync(spSwagger).toString();
    var srcSwagger = tsstruct.parseStruct(declsSwagger, {}, spSwagger);
    var universeSwagger = ts2def.toDefSystem(srcSwagger);
    universeSwagger.setUniverseVersion("Swagger");
    universes.loaded = true;
    universes.universe = universe;
    universes.universe08 = universe08;
    universes.universeSwagger = universeSwagger;
    var mediaTypeParser = require("media-typer");
    global.mediaTypeParser = mediaTypeParser;
}
exports.getDefinitionSystemType = function (contents, ast) {
    if (!universes.loaded) {
        load();
    }
    var spec = "";
    var ptype = "Api";
    var num = 0;
    var pt = 0;
    for (var n = 0; n < contents.length; n++) {
        var c = contents.charAt(n);
        if (c == '\r' || c == '\n') {
            if (spec) {
                ptype = contents.substring(pt, n).trim();
            }
            else {
                spec = contents.substring(0, n).trim();
            }
            break;
        }
        if (c == ' ') {
            num++;
            if (!spec && num == 2) {
                spec = contents.substring(0, n);
                pt = n;
            }
        }
    }
    var localUniverse = spec == "#%RAML 1.0" ? new ds.Universe("RAML1", universes.universe, "RAML1") : new ds.Universe("RAML08", universes.universe08);
    if (ast) {
        if (ast.children().filter(function (x) { return x.key() == "swagger"; }).length > 0) {
            localUniverse = new ds.Universe("Swagger", universes.universeSwagger, "Swagger");
            ptype = "SwaggerObject";
        }
    }
    localUniverse.setTopLevel(ptype);
    localUniverse.setTypedVersion(spec);
    return { ptype: ptype, localUniverse: localUniverse };
};
function fromUnit(l) {
    if (l == null) {
        return null;
    }
    var contents = l.contents();
    var ast = l.ast();
    var __ret = exports.getDefinitionSystemType(contents, ast);
    var ptype = __ret.ptype;
    var localUniverse = __ret.localUniverse;
    var apiType = localUniverse.type(ptype);
    if (!apiType) {
        apiType = localUniverse.type("Api");
    }
    var api = new hlImpl.ASTNodeImpl(ast, null, apiType, null);
    api.setUniverse(localUniverse);
    return api;
}
exports.fromUnit = fromUnit;
function globalId(h) {
    if (h.parent()) {
        return globalId(h.parent()) + "/" + h.localId();
    }
}
exports.globalId = globalId;
function nodeAtPosition(h, position) {
    var ch = h.children();
    var len = ch.length;
    var res = null;
    for (var num = 0; num < len; num++) {
        var cn = ch[num];
        if (cn.lowLevel().start() > position) {
            break;
        }
        if (cn.lowLevel().end() < position) {
            continue;
        }
        var nm = nodeAtPosition(cn, position);
        if (nm != null) {
            return nm;
        }
        return cn;
    }
}
exports.nodeAtPosition = nodeAtPosition;
//# sourceMappingURL=highLevelAST.js.map