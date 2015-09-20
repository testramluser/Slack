var ts = require("typescript");
var tsm = require('./tsASTMatchers');
var pth = require("path");
var fs = require("fs");
function parse(content) {
    return ts.createSourceFile("sample.ts", content, ts.ScriptTarget.ES3, "1.4.1", true);
}
var fld = tsm.Matching.field();
var clazzMatcher = tsm.Matching.classDeclaration();
var EnumDeclaration = (function () {
    function EnumDeclaration() {
    }
    return EnumDeclaration;
})();
exports.EnumDeclaration = EnumDeclaration;
(function (TypeKind) {
    TypeKind[TypeKind["BASIC"] = 0] = "BASIC";
    TypeKind[TypeKind["ARRAY"] = 1] = "ARRAY";
    TypeKind[TypeKind["UNION"] = 2] = "UNION";
})(exports.TypeKind || (exports.TypeKind = {}));
var TypeKind = exports.TypeKind;
function classDecl(name, isInteface) {
    return {
        name: name,
        methods: [],
        typeParameters: [],
        typeParameterConstraint: [],
        implements: [],
        fields: [],
        isInterface: isInteface,
        annotations: [],
        extends: [],
        moduleName: null
    };
}
exports.classDecl = classDecl;
function parseStruct(content, modules, mpth) {
    var mod = parse(content);
    var module = { classes: [], aliases: [], enumDeclarations: [], imports: {}, name: mpth };
    modules[mpth] = module;
    var currentModule = null;
    tsm.Matching.visit(mod, function (x) {
        if (x.kind == ts.SyntaxKind.ModuleDeclaration) {
            var cmod = x;
            currentModule = cmod.name.text;
        }
        if (x.kind == ts.SyntaxKind.ImportDeclaration) {
            var imp = x;
            var namespace = imp.name.text;
            if (namespace == "RamlWrapper") {
                return;
            }
            if (imp.moduleReference.kind != ts.SyntaxKind.ExternalModuleReference) {
                throw new Error("Only external module references are supported now");
            }
            var path = imp.moduleReference;
            if (path.expression.kind != ts.SyntaxKind.StringLiteral) {
                throw new Error("Only string literals are supported in module references ");
            }
            var literal = path.expression;
            var importPath = literal.text;
            var absPath = pth.resolve(pth.dirname(mpth) + "/", importPath) + ".ts";
            if (!fs.existsSync(absPath)) {
                throw new Error("Path " + importPath + " resolve to " + absPath + "do not exists");
            }
            if (!modules[absPath]) {
                var cnt = fs.readFileSync(absPath).toString();
                var mod = parseStruct(cnt, modules, absPath);
            }
            module.imports[namespace] = modules[absPath];
        }
        if (x.kind == ts.SyntaxKind.TypeAliasDeclaration) {
            var u = x;
            var aliasName = u.name.text;
            var type = buildType(u.type, mpth);
            module.aliases.push({ name: aliasName, type: type });
        }
        if (x.kind == ts.SyntaxKind.EnumDeclaration) {
            var e = x;
            var members = [];
            e.members.forEach(function (y) {
                members.push(y['name']['text']);
            });
            module.enumDeclarations.push({ name: e.name.text, members: members });
        }
        var isInterface = x.kind == ts.SyntaxKind.InterfaceDeclaration;
        var isClass = x.kind == ts.SyntaxKind.ClassDeclaration;
        if (!isInterface && !isClass) {
            return;
        }
        var c = x;
        if (c) {
            var fields = {};
            var clazz = classDecl(c.name.text, isInterface);
            clazz.moduleName = currentModule;
            module.classes.push(clazz);
            c.members.forEach(function (x) {
                if (x.kind == ts.SyntaxKind.Method) {
                    var md = x;
                    var aliasName = md.name.text;
                    var text = content.substring(md.pos, md.end);
                    clazz.methods.push({ name: aliasName, start: md.pos, end: md.end, text: text });
                }
                var field = fld.doMatch(x);
                if (field) {
                    var f = buildField(field, mpth);
                    if (f.name == '$') {
                        clazz.annotations = f.annotations;
                    }
                    else if (f.name.charAt(0) != '$' || f.name == '$ref') {
                        fields[f.name] = f;
                        clazz.fields.push(f);
                    }
                    else {
                        var of = fields[f.name.substr(1)];
                        if (!of) {
                            console.log(f.name);
                        }
                        else {
                            of.annotations = f.annotations;
                        }
                    }
                }
            });
            if (c.typeParameters) {
                c.typeParameters.forEach(function (x) {
                    clazz.typeParameters.push(x.name['text']);
                    if (x.constraint == null) {
                        clazz.typeParameterConstraint.push(null);
                    }
                    else {
                        clazz.typeParameterConstraint.push(x.constraint['typeName']['text']);
                    }
                });
            }
            if (c.heritageClauses) {
                c.heritageClauses.forEach(function (x) {
                    x.types.forEach(function (y) {
                        if (x.token == ts.SyntaxKind.ExtendsKeyword) {
                            clazz.extends.push(buildType(y, mpth));
                        }
                        else if (x.token == ts.SyntaxKind.ImplementsKeyword) {
                            clazz.implements.push(buildType(y, mpth));
                        }
                        else {
                            throw new Error("Unknown token class heritage");
                        }
                    });
                });
            }
            return tsm.Matching.SKIP;
        }
    });
    return module;
}
exports.parseStruct = parseStruct;
function buildField(f, path) {
    return {
        name: f.name['text'],
        type: buildType(f.type, path),
        annotations: f.name['text'].charAt(0) == '$' ? buildInitializer(f.initializer) : [],
        valueConstraint: f.name['text'].charAt(0) != '$' ? buildConstraint(f.initializer) : null,
        optional: f.questionToken != null
    };
}
function buildConstraint(e) {
    if (e == null) {
        return null;
    }
    if (e.kind == ts.SyntaxKind.CallExpression) {
        return {
            isCallConstraint: true,
            value: buildAnnotation(e)
        };
    }
    else {
        return {
            isCallConstraint: false,
            value: parseArg(e)
        };
    }
}
function buildInitializer(i) {
    if (i == null) {
        return [];
    }
    if (i.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        var arr = i;
        var annotations = [];
        arr.elements.forEach(function (x) {
            annotations.push(buildAnnotation(x));
        });
        return annotations;
    }
    else {
        throw new Error("Only Array Literals supported now");
    }
}
function buildAnnotation(e) {
    if (e.kind == ts.SyntaxKind.CallExpression) {
        var call = e;
        var name = parseName(call.expression);
        var a = {
            name: name,
            arguments: []
        };
        call.arguments.forEach(function (x) {
            a.arguments.push(parseArg(x));
        });
        return a;
    }
    else {
        throw new Error("Only call expressions may be annotations");
    }
}
function parseArg(n) {
    if (n.kind == ts.SyntaxKind.StringLiteral) {
        var l = n;
        return l.text;
    }
    if (n.kind == ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        var ls = n;
        return ls.text;
    }
    if (n.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        var arr = n;
        var annotations = [];
        arr.elements.forEach(function (x) {
            annotations.push(parseArg(x));
        });
        return annotations;
    }
    if (n.kind == ts.SyntaxKind.TrueKeyword) {
        return true;
    }
    if (n.kind == ts.SyntaxKind.PropertyAccessExpression) {
        var pa = n;
        return parseArg(pa.expression) + "." + parseArg(pa.name);
    }
    if (n.kind == ts.SyntaxKind.Identifier) {
        var ident = n;
        return ident.text;
    }
    if (n.kind == ts.SyntaxKind.FalseKeyword) {
        return false;
    }
    if (n.kind == ts.SyntaxKind.NumericLiteral) {
        var nl = n;
        return nl.text;
    }
    if (n.kind == ts.SyntaxKind.BinaryExpression) {
        var bin = n;
        if (bin.operator = ts.SyntaxKind.PlusToken) {
            return parseArg(bin.left) + parseArg(bin.right);
        }
    }
    throw new Error("Uknown value in annotation");
}
function parseName(n) {
    if (n.kind == ts.SyntaxKind.Identifier) {
        return n['text'];
    }
    if (n.kind == ts.SyntaxKind.PropertyAccessExpression) {
        var m = n;
        return parseName(m.expression) + "." + parseName(m.name);
    }
    throw new Error("Only simple identifiers are supported now");
}
function basicType(n, path) {
    var namespaceIndex = n.indexOf(".");
    var namespace = namespaceIndex != -1 ? n.substring(0, namespaceIndex) : "";
    var basicName = namespaceIndex != -1 ? n.substring(namespaceIndex + 1) : n;
    return { typeName: n, nameSpace: namespace, basicName: basicName, typeKind: 0 /* BASIC */, typeArguments: [], modulePath: path };
}
function arrayType(b) {
    return { base: b, typeKind: 1 /* ARRAY */ };
}
function unionType(b) {
    return { options: b, typeKind: 2 /* UNION */ };
}
function buildType(t, path) {
    if (t == null) {
        return null;
    }
    if (t.kind == ts.SyntaxKind.StringKeyword) {
        return basicType("string", null);
    }
    if (t.kind == ts.SyntaxKind.NumberKeyword) {
        return basicType("number", null);
    }
    if (t.kind == ts.SyntaxKind.BooleanKeyword) {
        return basicType("boolean", null);
    }
    if (t.kind == ts.SyntaxKind.AnyKeyword) {
        return basicType("any", null);
    }
    if (t.kind == ts.SyntaxKind.TypeReference) {
        var tr = t;
        var res = basicType(parseQualified(tr.typeName), path);
        if (tr.typeArguments) {
            tr.typeArguments.forEach(function (x) {
                res.typeArguments.push(buildType(x, path));
            });
        }
        return res;
    }
    if (t.kind == ts.SyntaxKind.ArrayType) {
        var q = t;
        return arrayType(buildType(q.elementType, path));
    }
    if (t.kind == ts.SyntaxKind.UnionType) {
        var ut = t;
        return unionType(ut.types.map(function (x) { return buildType(x, path); }));
    }
    throw new Error("Case not supported" + t.kind);
}
function parseQualified(n) {
    if (n.kind == ts.SyntaxKind.Identifier) {
        return n['text'];
    }
    else {
        var q = n;
        return parseQualified(q.left) + "." + parseQualified(q.right);
    }
}
//# sourceMappingURL=tsStructureParser.js.map