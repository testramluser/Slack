var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var jsyaml = require('./jsyaml2lowLevel');
var defs = require('./definitionSystem');
var hl = require('./highLevelAST');
var ll = require('./lowLevelAST');
var ts2Def = require('./tsStrut2Def');
var _ = require("underscore");
var yaml = require('./yamlAST');
var selector = require('./selectorMatch');
var typeExpression = require('./typeExpressions');
var KeyMatcher = (function () {
    function KeyMatcher(_props) {
        this._props = _props;
        this.parentValue = _.find(_props, function (x) { return x.isFromParentValue(); });
        this.parentKey = _.find(_props, function (x) { return x.isFromParentKey(); });
        this.canBeValue = _.find(_props, function (x) { return x.canBeValue(); });
    }
    KeyMatcher.prototype.match = function (key) {
        var _this = this;
        var _res = null;
        var lastPref = "";
        this._props.forEach(function (p) {
            if (p.isSystem()) {
                return;
            }
            if (p != _this.parentValue && p != _this.parentKey && p.matchKey(key)) {
                if (p.keyPrefix() != null) {
                    if (p.keyPrefix().length >= lastPref.length) {
                        lastPref = p.keyPrefix();
                        _res = p;
                    }
                }
                else {
                    _res = p;
                    lastPref = p.name();
                }
            }
        });
        return _res;
    };
    return KeyMatcher;
})();
exports.subTypesWithLocals = function (range, n) {
    var result = range.allSubTypes();
    if (range.getRuntimeExtenders().length > 0 && n) {
        var extenders = range.getRuntimeExtenders();
        var root = n.root();
        extenders.forEach(function (x) {
            var definitionNodes = globalDeclarations(n).filter(function (z) { return z.definition() == x; });
            result = result.concat(definitionNodes.map(function (x) { return typeFromNode(x); }));
        });
    }
    return result;
};
exports.nodesDeclaringType = function (range, n) {
    var result = [];
    if (range.getRuntimeExtenders().length > 0 && n) {
        var extenders = range.getRuntimeExtenders();
        var root = n;
        extenders.forEach(function (x) {
            var definitionNodes = globalDeclarations(root).filter(function (z) { return z.definition() == x; });
            result = result.concat(definitionNodes);
        });
    }
    var isElementType = !range.isValueType();
    if (isElementType && range.isInlinedTemplates() && n) {
        var root = n;
        var definitionNodes = globalDeclarations(root).filter(function (z) { return z.definition() == range; });
        result = result.concat(definitionNodes);
    }
    else {
        var root = n;
        var q = {};
        range.allSubTypes().forEach(function (x) { return q[x.name()] = true; });
        q[range.name()] = true;
        var definitionNodes = globalDeclarations(root).filter(function (z) { return q[z.definition().name()]; });
        result = result.concat(definitionNodes);
    }
    return result;
};
function findAllSubTypes(p, n) {
    var range = p.range();
    return exports.subTypesWithLocals(range, n);
}
exports.findAllSubTypes = findAllSubTypes;
;
var handleValue = function (strV, d, prop, allwaysString) {
    var ps = 0;
    while (true) {
        var pos = strV.indexOf("<<", ps);
        if (pos != -1) {
            var end = strV.indexOf(">>", pos);
            var isFull = pos == 0 && end == strV.length - 2;
            var parameterUsage = strV.substring(pos + 2, end);
            ps = pos + 2;
            var directiveIndex = parameterUsage.indexOf("|");
            if (directiveIndex != -1) {
                parameterUsage = parameterUsage.substring(0, directiveIndex);
            }
            parameterUsage = parameterUsage.trim();
            var q = d[parameterUsage];
            var r = prop.property().range();
            if (!isFull || allwaysString) {
                r = prop.definition().universe().getType("StringType");
            }
            if (q) {
                q.push(r);
            }
            else {
                d[parameterUsage] = [r];
            }
        }
        else
            break;
    }
};
function templateFields(node, d) {
    node.children().forEach(function (x) { return templateFields(x, d); });
    if (node instanceof ASTPropImpl) {
        var prop = node;
        var v = prop.value();
        if (typeof v == 'string') {
            var strV = v;
            handleValue(strV, d, prop, false);
        }
        else {
            node.lowLevel().visit(function (x) {
                if (x.value()) {
                    var strV = x.value() + "";
                    handleValue(strV, d, prop, true);
                }
                return true;
            });
        }
    }
}
function typeFromNode(node) {
    var result = new defs.NodeClass(node.name(), node.definition().universe(), node.lowLevel().unit().path());
    var def = node.definition();
    if (def.isInlinedTemplates()) {
        var usages = {};
        templateFields(node, usages);
        Object.keys(usages).forEach(function (x) {
            var prop = new defs.Property(x);
            prop.withDomain(result);
            var tp = _.unique(usages[x]).filter(function (x) { return x.name() != "StringType"; });
            prop.withRange(tp.length == 1 ? tp[0] : node.definition().universe().getType("StringType"));
            prop.withRequired(true);
            prop.unmerge();
        });
    }
    else if (def.getReferenceIs()) {
        if (def.universe().version() == "RAML08") {
            result.withAllowAny();
        }
        var p = def.property(def.getReferenceIs());
        if (p) {
            p.range().properties().forEach(function (x) {
                var prop = new defs.Property(x.name());
                prop.unmerge();
                prop.withDomain(result);
                prop.withRange(x.range());
                prop.withMultiValue(x.isMultiValue());
            });
        }
    }
    else {
        var rp = def.findMembersDeterminer();
        if (rp) {
            var elements = node.elementsOfKind(rp.name());
            elements.forEach(function (x) {
                var prop = elementToProp(x);
                prop.withDomain(result);
            });
        }
        if (def.getExtendedType()) {
            result._superTypes.push(def.getExtendedType());
        }
    }
    return result;
}
exports.typeFromNode = typeFromNode;
function elementToProp(e) {
    var nm = e.name();
    var result = new defs.Property(nm);
    result.unmerge();
    var props = e.definition().properties();
    var tp = e.attr("type");
    if (tp) {
        var typeName = tp.value();
        var tpv = e.definition().universe().getType(typeName);
        result.withRange(tpv);
        if (typeName == "pointer") {
            var scope = e.attr("target");
            if (scope) {
                try {
                    var sm = selector.parse(e, "" + scope.value());
                    result.setSelector(sm);
                }
                catch (e) {
                }
            }
        }
    }
    if (nm == "value" && e.parent() && e.parent().definition().name() == "AnnotationType") {
        result.withCanBeValue();
    }
    e.definition().allProperties().forEach(function (p) {
        if (p.name() != "type") {
            if (p.describesAnnotation()) {
                var annotationName = p.describedAnnotation();
                var args = [];
                var vl = e.attributes(p.name()).map(function (a) { return a.value(); });
                if (vl.length == 1) {
                    args.push(vl[0]);
                }
                else {
                    args.push(vl);
                }
                var an = {
                    name: annotationName,
                    arguments: args
                };
                ts2Def.recordAnnotation(result, an);
            }
        }
    });
    if (result.range() == null) {
        result.withRange(new defs.ValueType("String", e.definition().universe(), ""));
    }
    return result;
}
exports.elementToProp = elementToProp;
function qName(x, context) {
    var nm = x.name();
    var origUnit = context.lowLevel().unit();
    while (true) {
        var np = x.parent();
        if (!np) {
            break;
        }
        else {
            if (np.lowLevel().unit() != origUnit) {
                break;
            }
            if (np.definition().name() == "Library" && np.parent()) {
                nm = np.name() + "." + nm;
            }
            x = np;
        }
    }
    return nm;
}
exports.qName = qName;
function insideResourceTypeOrTrait(h) {
    var declRoot = h;
    while (true) {
        var np = declRoot.parent();
        if (!np) {
            break;
        }
        else {
            declRoot = np;
        }
        if (declRoot.definition().isInlinedTemplates()) {
            return true;
        }
    }
    return false;
}
var declRoot = function (h) {
    var declRoot = h;
    while (true) {
        var np = declRoot.parent();
        if (!np) {
            break;
        }
        else {
            if (np.definition().name() == "Library") {
                declRoot = np;
                break;
            }
            declRoot = np;
        }
    }
    return declRoot;
};
function globalDeclarations(h) {
    var decl = declRoot(h);
    return findDeclarations(decl);
}
exports.globalDeclarations = globalDeclarations;
function findDeclarations(h) {
    var rs = [];
    h.elements().forEach(function (x) {
        if (x.definition().name() == "Library") {
            rs = rs.concat(findDeclarations(x));
        }
        rs.push(x);
    });
    return rs;
}
exports.findDeclarations = findDeclarations;
function resolveReference(point, path) {
    if (!path) {
        return null;
    }
    var sp = path.split("/");
    var result = point;
    for (var i = 0; i < sp.length; i++) {
        if (sp[i] == '#') {
            result = point.unit().ast();
            continue;
        }
        result = _.find(result.children(), function (x) { return x.key() == sp[i]; });
        if (!result) {
            return null;
        }
    }
    return result;
}
exports.resolveReference = resolveReference;
function resolveRamlPointer(point, path) {
    var components = path.split(".");
    var currentNode = point;
    if (currentNode.definition().isAnnotation()) {
        currentNode = currentNode.parent();
    }
    components.forEach(function (x) {
        if (currentNode == null) {
            return;
        }
        if (x == '$parent') {
            currentNode = currentNode.parent();
            return;
        }
        if (x == '$root') {
            currentNode = currentNode.root();
            return;
        }
        if (x == '$top') {
            currentNode = declRoot(currentNode);
            return;
        }
        var newEl = _.find(currentNode.elements(), function (y) { return y.name() == x; });
        currentNode = newEl;
    });
    return currentNode;
}
exports.resolveRamlPointer = resolveRamlPointer;
function allChildren(node) {
    return new selector.AnyChildMatch().apply(node.root());
}
var BasicNodeBuilder = (function () {
    function BasicNodeBuilder() {
    }
    BasicNodeBuilder.prototype.process = function (node, childrenToAdopt) {
        var _this = this;
        var km = new KeyMatcher(node.definition().allProperties());
        var aNode = node;
        var allowsQuestion = aNode._allowQuestion || node.definition().getAllowQuestion();
        var res = [];
        if (km.parentKey) {
            if (node.lowLevel().key()) {
                res.push(new ASTPropImpl(node.lowLevel(), node, km.parentKey.range(), km.parentKey, true));
            }
        }
        if (node.lowLevel().value()) {
            if (km.parentValue) {
                res.push(new ASTPropImpl(node.lowLevel(), node, km.parentValue.range(), km.parentValue));
            }
            else if (km.canBeValue) {
                var s = node.lowLevel().value();
                if (typeof s == 'string' && s.trim().length > 0) {
                    res.push(new ASTPropImpl(node.lowLevel(), node, km.canBeValue.range(), km.canBeValue));
                }
            }
        }
        aNode._children = res;
        childrenToAdopt.forEach(function (x) {
            var key = x.key();
            if (key == '$ref' && aNode.universe().version() == "Swagger") {
                var resolved = resolveReference(x, x.value());
                if (!resolved) {
                    var bnode = new BasicASTNode(x, aNode);
                    bnode.unresolvedRef = "ref";
                    res.push(bnode);
                }
                else {
                    var mm = _this.process(aNode, resolved.children());
                    mm.forEach(function (x) {
                        if (x.property() && x.property().isKey()) {
                            return;
                        }
                        res.push(x);
                    });
                }
            }
            if (allowsQuestion) {
                if (key != null && key.charAt(key.length - 1) == '?') {
                    key = key.substr(0, key.length - 1);
                }
            }
            var p = km.match(key);
            if (p != null) {
                if (p.range().isValueType()) {
                    if (p.isMultiValue() || true) {
                        if (p.range().name() == "structure") {
                            res.push(new ASTPropImpl(x, aNode, p.range(), p));
                        }
                        else {
                            var ch = x.children();
                            if (ch.length > 1) {
                                ch.forEach(function (y) { return res.push(new ASTPropImpl(y, aNode, p.range(), p)); });
                            }
                            else {
                                if (p.isInherited()) {
                                    aNode.setComputed(p.name(), x.value());
                                }
                                res.push(new ASTPropImpl(x, aNode, p.range(), p));
                            }
                        }
                    }
                    return;
                }
                else {
                    var rs = [];
                    aNode._children = res;
                    var types = findAllSubTypes(p, aNode);
                    if (!p.isMerged()) {
                        if (p.isMultiValue()) {
                            if (p.isEmbedMap()) {
                                var chld = x.children();
                                if (chld.length == 0) {
                                    if (x.value()) {
                                        var bnode = new BasicASTNode(x, aNode);
                                        bnode.knownProperty = p;
                                        res.push(bnode);
                                    }
                                }
                                chld.forEach(function (y) {
                                    var cld = y.children();
                                    if (!y.key() && cld.length == 1) {
                                        var node = new ASTNodeImpl(cld[0], aNode, p.range(), p);
                                        node._allowQuestion = allowsQuestion;
                                        rs.push(node);
                                    }
                                    else {
                                        if (aNode.universe().version() == "RAML1") {
                                            var node = new ASTNodeImpl(y, aNode, p.range(), p);
                                            node._allowQuestion = allowsQuestion;
                                            rs.push(node);
                                        }
                                        else {
                                            var bnode = new BasicASTNode(y, aNode);
                                            res.push(bnode);
                                            if (y.key()) {
                                                bnode.needSequence = true;
                                            }
                                        }
                                    }
                                });
                            }
                            else {
                                var filter = {};
                                if (p.range() instanceof defs.NodeClass) {
                                    var nc = p.range();
                                    if (nc.getCanInherit().length > 0) {
                                        nc.getCanInherit().forEach(function (v) {
                                            var vl = aNode.computedValue(v);
                                            if (vl) {
                                                if (!_.find(x.children(), function (x) { return x.key() == vl; })) {
                                                    var node = new ASTNodeImpl(x, aNode, p.range(), p);
                                                    var ch = node.children();
                                                    node._children = ch.filter(function (x) { return !x.isUnknown(); });
                                                    node._allowQuestion = allowsQuestion;
                                                    rs.push(node);
                                                    node.attrs().forEach(function (x) {
                                                        if (x.property().isKey()) {
                                                            var atr = x;
                                                            atr._computed = true;
                                                            return;
                                                        }
                                                        filter[x.name()] = true;
                                                    });
                                                    node._computed = true;
                                                }
                                            }
                                        });
                                    }
                                }
                                x.children().forEach(function (y) {
                                    if (filter[y.key()]) {
                                        return;
                                    }
                                    var node = new ASTNodeImpl(y, aNode, p.range(), p);
                                    node._allowQuestion = allowsQuestion;
                                    rs.push(node);
                                });
                            }
                        }
                        else {
                            rs.push(new ASTNodeImpl(x, aNode, p.range(), p));
                        }
                    }
                    else {
                        var node = new ASTNodeImpl(x, aNode, p.range(), p);
                        node._allowQuestion = allowsQuestion;
                        rs.push(node);
                    }
                    rs.forEach(function (x) {
                        var rt = null;
                        if (types.length > 0) {
                            types.forEach(function (y) {
                                if (!rt) {
                                    if (y.match(x, rt)) {
                                        rt = y;
                                    }
                                }
                            });
                        }
                        if (rt && rt != x.definition()) {
                            x.patchType(rt);
                        }
                        p.childRestrictions().forEach(function (y) {
                            x.setComputed(y.name, y.value);
                        });
                        var def = x.definition();
                        res.push(x);
                    });
                }
            }
            else {
                res.push(new BasicASTNode(x, aNode));
            }
        });
        aNode._children = res;
        aNode._children.forEach(function (x) {
            if (x instanceof ASTPropImpl) {
                var attr = x;
                var p = attr.property();
                var tpes = p.range().name() == "StringType" ? [] : p.range().allSubTypes();
                var actualType = p.range();
                if (tpes.length > 0) {
                    var rm = aNode.toRuntimeModel();
                    tpes.forEach(function (t) {
                        var ds = t.getFunctionalDescriminator();
                        if (ds) {
                            try {
                                var q = evalInSandbox("return " + ds, rm, []);
                                if (q) {
                                    attr.patchType(t);
                                }
                            }
                            catch (e) {
                            }
                        }
                    });
                }
            }
        });
        return res;
    };
    return BasicNodeBuilder;
})();
exports.BasicNodeBuilder = BasicNodeBuilder;
function createType(nd) {
    return null;
}
var loophole = require("loophole");
function evalInSandbox(code, thisArg, args) {
    return new loophole.Function(code).call(thisArg, args);
}
var BasicASTNode = (function () {
    function BasicASTNode(_node, _parent) {
        this._node = _node;
        this._parent = _parent;
        this._implicit = false;
        this.values = {};
        if (_node) {
            _node.setHighLevelParseResult(this);
        }
    }
    BasicASTNode.prototype.root = function () {
        if (this.parent()) {
            return this.parent().root();
        }
        return this;
    };
    BasicASTNode.prototype.checkContextValue = function (name, value, thisObj) {
        var vl = this.computedValue(name);
        if (vl && vl.indexOf(value) != -1) {
            return true;
        }
        if (!vl) {
            try {
                var res = evalInSandbox("return " + name, thisObj, []);
                if (res != undefined) {
                    return "" + res == value;
                }
            }
            catch (e) {
            }
        }
        return value == vl || value == 'false';
    };
    BasicASTNode.prototype.toRuntimeModel = function () {
        var _this = this;
        var thisObj = {};
        this.children().forEach(function (x) {
            if (x instanceof ASTPropImpl) {
                var pr = x;
                var val = pr.value();
                if (val) {
                    var type = pr.property().range();
                    val = _this.fillValue(type, val);
                    thisObj[x.name()] = val;
                }
            }
        });
        return thisObj;
    };
    BasicASTNode.prototype.fillValue = function (type, val) {
        type.methods().forEach(function (m) {
            if (typeof val == 'string') {
                var newVal = {};
                newVal['value'] = new loophole.Function("return this._value");
                newVal._value = val;
                val = newVal;
            }
            var nm = m.name;
            var body = m.text;
            var actualText = body.substring(body.indexOf('{') + 1, body.lastIndexOf('}'));
            var func = new loophole.Function(actualText);
            val[nm] = func;
        });
        val['$$'] = this;
        return val;
    };
    BasicASTNode.prototype.validate = function (v) {
        var _this = this;
        if (this.lowLevel() && this._parent == null) {
            this.lowLevel().errors().forEach(function (x) {
                var em = {
                    code: hl.IssueCode.YAML_ERROR,
                    message: x.message,
                    node: null,
                    start: x.mark.position,
                    end: x.mark.position + 1,
                    isWarning: false,
                    path: _this.lowLevel().unit().path()
                };
                v.accept(em);
            });
        }
        this.validateIncludes(v);
        if (this.isUnknown()) {
            if (this.needSequence) {
                v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "node: " + this.name() + " should be wrapped in sequence", this));
            }
            if (this.unresolvedRef) {
                v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "reference : " + this.lowLevel().value() + " can not be resolved", this));
            }
            if (this.knownProperty && this.lowLevel().value()) {
                v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "property " + this.name() + " can not have scalar value", this));
            }
            else {
                v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "Unknown node:" + this.name(), this));
            }
        }
        this.directChildren().forEach(function (x) { return x.validate(v); });
    };
    BasicASTNode.prototype.validateIncludes = function (v) {
        var _this = this;
        if (this.lowLevel()) {
            this.lowLevel().includeErrors().forEach(function (x) {
                var em = createIssue(hl.IssueCode.UNABLE_TO_RESOLVE_INCLUDE_FILE, x, _this);
                v.accept(em);
            });
        }
    };
    BasicASTNode.prototype.setComputed = function (name, v) {
        this.values[name] = v;
    };
    BasicASTNode.prototype.computedValue = function (name) {
        var vl = this.values[name];
        if (!vl && this.parent()) {
            return this.parent().computedValue(name);
        }
        return vl;
    };
    BasicASTNode.prototype.lowLevel = function () {
        return this._node;
    };
    BasicASTNode.prototype.expansionSpec = function () {
        return null;
    };
    BasicASTNode.prototype.name = function () {
        var c = this.lowLevel().key();
        if (!c) {
            return "";
        }
        return c;
    };
    BasicASTNode.prototype.parent = function () {
        return this._parent;
    };
    BasicASTNode.prototype.isElement = function () {
        return false;
    };
    BasicASTNode.prototype.directChildren = function () {
        return this.children();
    };
    BasicASTNode.prototype.children = function () {
        return [];
    };
    BasicASTNode.prototype.isAttached = function () {
        return this.parent() != null;
    };
    BasicASTNode.prototype.isImplicit = function () {
        return this._implicit;
    };
    BasicASTNode.prototype.isAttr = function () {
        return false;
    };
    BasicASTNode.prototype.isUnknown = function () {
        return true;
    };
    BasicASTNode.prototype.id = function () {
        if (this._parent) {
            return this._parent.id() + (this.name().indexOf("/") != 0 ? "." : "") + this.name();
        }
        return "";
    };
    BasicASTNode.prototype.localId = function () {
        return this.name();
    };
    BasicASTNode.prototype.property = function () {
        return null;
    };
    return BasicASTNode;
})();
exports.BasicASTNode = BasicASTNode;
function checkReference(pr, astNode, vl, cb) {
    if (!vl) {
        return;
    }
    if (vl == 'null') {
        if (pr.isAllowNull()) {
            return;
        }
    }
    try {
        if (typeof vl == 'string') {
            if (pr.domain().name() == 'DataElement') {
                if (pr.name() == "type" || pr.name() == 'items') {
                    typeExpression.validate(vl, astNode, cb);
                    return;
                }
            }
            if (pr.name() == "schema") {
                var q = vl.trim();
                if (q.length > 0 && q.charAt(0) != '{' && q.charAt(0) != '<') {
                    typeExpression.validate(vl, astNode, cb);
                    return;
                }
                return;
            }
        }
    }
    catch (e) {
        cb.accept(createIssue(hl.IssueCode.UNRESOLVED_REFERENCE, "Syntax error:" + e.message, astNode));
    }
    var values = pr.enumValues(astNode.parent());
    if (!_.find(values, function (x) { return x == vl; })) {
        if (typeof vl == 'string') {
            if ((vl.indexOf("x-") == 0) && pr.name() == "type") {
                return true;
            }
        }
        cb.accept(createIssue(hl.IssueCode.UNRESOLVED_REFERENCE, "Unresolved reference:" + vl, astNode));
        return true;
    }
    return false;
}
;
function createIssue(c, message, node, w) {
    if (w === void 0) { w = false; }
    var st = node.lowLevel().start();
    var et = node.lowLevel().end();
    if (node.lowLevel().key() && node.lowLevel().keyStart()) {
        var ks = node.lowLevel().keyStart();
        if (ks > 0) {
            st = ks;
        }
        var ke = node.lowLevel().keyEnd();
        if (ke > 0) {
            et = ke;
        }
    }
    if (et < st) {
        et = st + 1;
    }
    if (node) {
        if (node.lowLevel().unit() != node.root().lowLevel().unit()) {
            var v = node.lowLevel().unit();
            if (v) {
                message = message + " " + v.path();
            }
        }
    }
    return {
        code: c,
        isWarning: w,
        message: message,
        node: node,
        start: st,
        end: et,
        path: node.lowLevel().unit() ? node.lowLevel().unit().path() : ""
    };
}
exports.createIssue = createIssue;
var StructuredValue = (function () {
    function StructuredValue(node, _parent, _pr, kv) {
        if (kv === void 0) { kv = null; }
        this.node = node;
        this._parent = _parent;
        this._pr = _pr;
        this.kv = kv;
    }
    StructuredValue.prototype.valueName = function () {
        if (this.kv) {
            return this.kv;
        }
        return this.node.key();
    };
    StructuredValue.prototype.children = function () {
        return this.node.children().map(function (x) { return new StructuredValue(x, null, null); });
    };
    StructuredValue.prototype.lowLevel = function () {
        return this.node;
    };
    StructuredValue.prototype.toHighlevel = function () {
        var _this = this;
        var vn = this.valueName();
        var cands = this._pr.referenceTargets(this._parent).filter(function (x) { return qName(x, _this._parent) == vn; });
        if (cands && cands[0]) {
            var tp = typeFromNode(cands[0]);
            var node = new ASTNodeImpl(this.node, this._parent, tp, this._pr);
            if (this._pr) {
                this._pr.childRestrictions().forEach(function (y) {
                    node.setComputed(y.name, y.value);
                });
            }
            return node;
        }
        return null;
    };
    return StructuredValue;
})();
exports.StructuredValue = StructuredValue;
function genStructuredValue(type, name, mappings, parent) {
    var map = yaml.newMap(mappings.map(function (mapping) { return yaml.newMapping(yaml.newScalar(mapping.key), yaml.newScalar(mapping.value)); }));
    var node = new jsyaml.ASTNode(map, (parent ? parent.lowLevel().unit() : null), parent ? parent.lowLevel() : null, null, null);
    return new StructuredValue(node, parent, parent ? parent.definition().property(type) : null, name);
}
exports.genStructuredValue = genStructuredValue;
function checkPropertyQuard(n, v) {
    var pr = n.property();
    if (pr) {
        pr.getContextRequirements().forEach(function (x) {
            if (!n.checkContextValue(x.name, x.value, n.parent().toRuntimeModel())) {
                v.accept(createIssue(hl.IssueCode.MISSED_CONTEXT_REQUIREMENT, x.name + " should be " + x.value + " to use property " + pr.name(), n));
            }
        });
    }
    return pr;
}
;
function parseUrl(value) {
    var result = [];
    var temp = "";
    var inPar = false;
    var count = 0;
    for (var a = 0; a < value.length; a++) {
        var c = value[a];
        if (c == '{') {
            count++;
            inPar = true;
            continue;
        }
        if (c == '}') {
            count--;
            inPar = false;
            result.push(temp);
            temp = "";
            continue;
        }
        if (inPar) {
            temp += c;
        }
    }
    if (count > 0) {
        throw new Error("Unmatched '{'");
    }
    if (count < 0) {
        throw new Error("Unmatched '}'");
    }
    return result;
}
var ASTPropImpl = (function (_super) {
    __extends(ASTPropImpl, _super);
    function ASTPropImpl(node, parent, _def, _prop, fromKey) {
        if (fromKey === void 0) { fromKey = false; }
        _super.call(this, node, parent);
        this._def = _def;
        this._prop = _prop;
        this.fromKey = fromKey;
    }
    ASTPropImpl.prototype.definition = function () {
        return this._def;
    };
    ASTPropImpl.prototype.patchType = function (t) {
        this._def = t;
    };
    ASTPropImpl.prototype.findReferenceDeclaration = function () {
        var _this = this;
        var targets = this.property().referenceTargets(this.parent());
        var t = _.find(targets, function (x) { return qName(x, _this.parent()) == _this.value(); });
        return t;
    };
    ASTPropImpl.prototype.findReferencedValue = function () {
        var c = this.findReferenceDeclaration();
        if (c) {
            var vl = c.attr("value");
            if (c.definition().name() == "GlobalSchema") {
                if (vl) {
                    var actualValue = vl.value();
                    if (actualValue) {
                        var rf = this._def.isValid(this.parent(), actualValue, vl.property());
                        return rf;
                    }
                }
                return null;
            }
        }
        return c;
    };
    ASTPropImpl.prototype.validate = function (v) {
        var pr = checkPropertyQuard(this, v);
        var vl = this.value();
        if (!this.property().range().hasStructure()) {
            if (vl instanceof StructuredValue) {
                v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Scalar is expected here", this));
            }
        }
        if (this.parent().allowsQuestion() && this.property().isKey()) {
            if (vl != null && vl.length > 0 && vl.charAt(vl.length - 1) == '?') {
                vl = vl.substr(0, vl.length - 1);
            }
        }
        if (typeof vl == 'string' && vl.indexOf("<<") != -1) {
            if (vl.indexOf(">>") > vl.indexOf("<<")) {
                if (insideResourceTypeOrTrait(this.parent())) {
                    return;
                }
            }
        }
        this.validateIncludes(v);
        if (this.property().name() == "name") {
            if (this.parent().property() && this.parent().property().name() == 'uriParameters') {
                var c = this.parent().parent();
                var tn = c.name();
                if (c.definition().name() == 'Api') {
                    this.checkBaseUri(c, vl, v);
                }
                try {
                    var pNames = parseUrl(tn);
                    if (!_.find(pNames, function (x) { return x == vl; })) {
                        v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Unused url parameter '" + vl + "'", this));
                    }
                }
                catch (e) {
                }
            }
            if (this.parent().property() && this.parent().property().name() == 'baseUriParameters') {
                var c = this.parent().parent();
                this.checkBaseUri(c, vl, v);
            }
        }
        if (pr.isReference() || pr.isDescriminator()) {
            var valueKey = vl;
            if (typeof vl == 'string') {
                checkReference(pr, this, vl, v);
                if (pr.range() instanceof defs.ReferenceType) {
                    var t = pr.range();
                    if (true) {
                        var mockNode = jsyaml.createNode("" + vl);
                        mockNode._actualNode().startPosition = this.lowLevel().valueStart();
                        mockNode._actualNode().endPosition = this.lowLevel().valueEnd();
                        var stv = new StructuredValue(mockNode, this.parent(), this.property());
                        var hn = stv.toHighlevel();
                        if (hn) {
                            hn.validate(v);
                        }
                    }
                }
            }
            else {
                var st = vl;
                if (st) {
                    valueKey = st.valueName();
                    var vn = st.valueName();
                    if (!checkReference(pr, this, vn, v)) {
                        var hnode = st.toHighlevel();
                        if (hnode)
                            hnode.validate(v);
                    }
                }
                else {
                    valueKey = null;
                }
            }
            if (valueKey) {
                var validation = pr.range().isValid(this.parent(), valueKey, pr);
                if (validation instanceof Error) {
                    v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, validation.message, this));
                    validation = null;
                }
            }
        }
        else {
            var validation = pr.range().isValid(this.parent(), vl, pr);
            if (validation instanceof Error) {
                if (!validation.canBeRef) {
                    v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, validation.message, this));
                    validation = null;
                    return;
                }
            }
            if (!validation || validation instanceof Error) {
                if (pr.name() != 'value') {
                    if (!checkReference(pr, this, vl, v)) {
                        var decl = this.findReferencedValue();
                        if (decl instanceof Error) {
                            v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, decl.message, this));
                        }
                        if (!decl) {
                            if (vl) {
                                if (pr.name() == 'schema') {
                                    var z = vl.trim();
                                    if (z.charAt(0) != '{' && z.charAt(0) != '<') {
                                        if (vl.indexOf('|') != -1 || vl.indexOf('[]') != -1 || vl.indexOf("(") != -1) {
                                            return;
                                        }
                                    }
                                }
                            }
                            if (validation instanceof Error && vl) {
                                v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, validation.message, this));
                                validation = null;
                                return;
                            }
                            v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Empty value is not allowed here", this));
                        }
                    }
                }
                else {
                    v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Invalid value schema " + this.value(), this));
                }
            }
            var values = pr.enumOptions();
            if (values && values.length > 0) {
                if (!_.find(values, function (x) { return x == vl; })) {
                    if (vl && (vl.indexOf("x-") == 0) && pr.name() == "type") {
                    }
                    else {
                        v.accept(createIssue(hl.IssueCode.UNRESOLVED_REFERENCE, "Invalid value:" + vl + " allowed values are:" + values.join(","), this));
                    }
                }
            }
        }
        if (!vl) {
            vl = "";
        }
        if (this._def.methods().length > 0) {
            var valueObj = this.fillValue(this._def, vl);
            if (valueObj['parse']) {
                try {
                    valueObj.parse();
                }
                catch (e) {
                    if (e.message.indexOf("Cannot assign to read only property '__$validated'") == 0) {
                        return;
                    }
                    if (e.errors) {
                        v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, e.message, this, true));
                        return;
                    }
                    v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, e.message, this, true));
                }
            }
        }
    };
    ASTPropImpl.prototype.checkBaseUri = function (c, vl, v) {
        var bu = c.root().attr("baseUri");
        if (bu) {
            var tnv = bu.value();
            try {
                var pNames = parseUrl(tnv);
                if (!_.find(pNames, function (x) { return x == vl; })) {
                    v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Unused url parameter", this));
                }
            }
            catch (e) {
            }
        }
        else {
            v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Unused url parameter", this));
        }
    };
    ASTPropImpl.prototype.toRuntime = function () {
        var vl = this.value();
        var valueObj = this.fillValue(this.property().range(), vl);
        if (valueObj['parse']) {
            try {
                return valueObj.parse();
            }
            catch (e) {
                return e;
            }
        }
        return valueObj;
    };
    ASTPropImpl.prototype.isElement = function () {
        return false;
    };
    ASTPropImpl.prototype.property = function () {
        return this._prop;
    };
    ASTPropImpl.prototype.value = function () {
        if (this._computed) {
            return this.computedValue(this.property().name());
        }
        if (this.fromKey) {
            return this._node.key();
        }
        var actualValue = this._node.value();
        if (actualValue instanceof jsyaml.ASTNode) {
            return new StructuredValue(actualValue, this.parent(), this._prop);
        }
        return actualValue;
    };
    ASTPropImpl.prototype.name = function () {
        return this._prop.name();
    };
    ASTPropImpl.prototype.isAttr = function () {
        return true;
    };
    ASTPropImpl.prototype.isUnknown = function () {
        return false;
    };
    ASTPropImpl.prototype.setValue = function (value) {
        if (value == this.value())
            return;
        var c = new ll.CompositeCommand();
        if (typeof value === 'string') {
            var val = value;
            if (this._prop.isFromParentKey()) {
                c.commands.push(ll.setKey(this._node, val));
            }
            else {
                if (!val || val.length == 0) {
                    c.commands.push(ll.removeNode(this._node.parent(), this._node));
                }
                else {
                    c.commands.push(ll.setAttr(this._node, val));
                }
            }
        }
        else {
            if (this._prop.isFromParentKey()) {
                throw "couldn't set structured value to a key: " + this._prop.name();
            }
            var sval = value;
            c.commands.push(ll.setAttrStructured(this._node, sval));
        }
        this._node.execute(c);
    };
    ASTPropImpl.prototype.children = function () {
        return [];
    };
    return ASTPropImpl;
})(BasicASTNode);
exports.ASTPropImpl = ASTPropImpl;
var VirtualAttribute = (function (_super) {
    __extends(VirtualAttribute, _super);
    function VirtualAttribute(_nodeParent, _def, _prop, fromKey) {
        if (fromKey === void 0) { fromKey = false; }
        _super.call(this, null, _nodeParent);
        this._def = _def;
        this._prop = _prop;
        this.fromKey = fromKey;
        this.val = null;
        this.realAttribute = null;
    }
    VirtualAttribute.prototype.definition = function () {
        return this._def;
    };
    VirtualAttribute.prototype.isElement = function () {
        return false;
    };
    VirtualAttribute.prototype.name = function () {
        return this._prop.name();
    };
    VirtualAttribute.prototype.isAttr = function () {
        return true;
    };
    VirtualAttribute.prototype.isUnknown = function () {
        return false;
    };
    VirtualAttribute.prototype.children = function () {
        return [];
    };
    VirtualAttribute.prototype.property = function () {
        return this._prop;
    };
    VirtualAttribute.prototype.toRuntime = function () {
        var vl = this.value();
        var valueObj = this.fillValue(this.property().range(), vl);
        if (valueObj['parse']) {
            try {
                return valueObj.parse();
            }
            catch (e) {
                return e;
            }
        }
        return valueObj;
    };
    VirtualAttribute.prototype.value = function () {
        return this.realAttribute ? this.realAttribute.value() : '';
    };
    VirtualAttribute.prototype.setValue = function (val) {
        this.parent().createAttr(this.name(), '');
        this.realAttribute = this.parent().attr(this.name());
        this.realAttribute.setValue(val);
    };
    return VirtualAttribute;
})(BasicASTNode);
exports.VirtualAttribute = VirtualAttribute;
var nodeBuilder = new BasicNodeBuilder();
function possibleNodes(p, c) {
    if (c) {
        if (p.isDescriminating()) {
            var range = p.range();
            if (range.getRuntimeExtenders().length > 0 && c) {
                var extenders = range.getRuntimeExtenders();
                var result = [];
                extenders.forEach(function (x) {
                    var definitionNodes = globalDeclarations(c).filter(function (z) { return z.definition() == x; });
                    result = result.concat(definitionNodes);
                });
                return result;
            }
            return [];
        }
        if (p.isReference()) {
            return exports.nodesDeclaringType(p.referencesTo(), c);
        }
        if (p.range().isValueType()) {
            var vt = p.range();
            if (vt.globallyDeclaredBy().length > 0) {
                var definitionNodes = globalDeclarations(c).filter(function (z) { return _.find(vt.globallyDeclaredBy(), function (x) { return x == z.definition(); }) != null; });
                return definitionNodes;
            }
        }
    }
    return this._enumOptions;
}
function refFinder(root, node, result) {
    root.elements().forEach(function (x) {
        refFinder(x, node, result);
    });
    root.attrs().forEach(function (a) {
        var pr = a.property();
        var vl = a.value();
        if (pr.isReference() || pr.isDescriminator()) {
            if (typeof vl == 'string') {
                var pn = possibleNodes(pr, root);
                if (_.find(pn, function (x) { return x.name() == vl && x == node; })) {
                    result.push(a);
                }
            }
            else {
                var st = vl;
                if (st) {
                    var vn = st.valueName();
                    var pn = possibleNodes(pr, root);
                    if (_.find(pn, function (x) { return x.name() == vn && x == node; })) {
                        result.push(a);
                    }
                    var hnode = st.toHighlevel();
                    if (hnode) {
                        refFinder(hnode, node, result);
                    }
                }
            }
        }
        else {
            var pn = possibleNodes(pr, root);
            if (_.find(pn, function (x) { return x.name() == vl && x == node; })) {
                result.push(a);
            }
        }
    });
}
var ASTNodeImpl = (function (_super) {
    __extends(ASTNodeImpl, _super);
    function ASTNodeImpl(node, parent, _def, _prop) {
        _super.call(this, node, parent);
        this._def = _def;
        this._prop = _prop;
        this._expanded = false;
        this._allowQuestion = false;
        this._auxChecked = false;
        if (node) {
            node.setHighLevelNode(this);
        }
    }
    ASTNodeImpl.prototype.isAuxilary = function () {
        var _this = this;
        if (this._isAux) {
            return true;
        }
        if (this._auxChecked) {
            return false;
        }
        this._auxChecked = true;
        var mr = _.find(this.lowLevel().children(), function (x) { return x.key() == "masterRef"; });
        if (mr && mr.value()) {
            this._isAux = true;
            var val = mr.value();
            var unit = this.lowLevel().unit().project().resolve(this.lowLevel().unit().path(), val);
            var api = hl.fromUnit(unit);
            if (api) {
                var v = allChildren(api);
                this._knownIds = {};
                v.forEach(function (x) { return _this._knownIds[x.id()] = x; });
            }
        }
    };
    ASTNodeImpl.prototype.insideOfDeclaration = function () {
        if (this.definition().isDeclaration()) {
            return true;
        }
        if (this.parent()) {
            return this.parent().insideOfDeclaration();
        }
    };
    ASTNodeImpl.prototype.isAllowedId = function () {
        var r = this.root();
        if (r.definition().name() == "Extension") {
            return true;
        }
        if (r.isAuxilary()) {
            if (this.insideOfDeclaration()) {
                var vl = this.computedValue("decls");
                if (vl == "true") {
                    return true;
                }
            }
            if (r._knownIds) {
                var m = r._knownIds[this.id()] != null;
                return m;
            }
            return false;
        }
        return true;
    };
    ASTNodeImpl.prototype.getExtractedChildren = function () {
        var r = this.root();
        if (r.isAuxilary()) {
            if (r._knownIds) {
                var i = r._knownIds[this.id()];
                if (i) {
                    return i.children();
                }
            }
            return [];
        }
        return [];
    };
    ASTNodeImpl.prototype.allowsQuestion = function () {
        return this._allowQuestion || this.definition().getAllowQuestion();
    };
    ASTNodeImpl.prototype.findReferences = function () {
        var rs = [];
        refFinder(this.root(), this, rs);
        return rs;
    };
    ASTNodeImpl.prototype.name = function () {
        var ka = _.find(this.directChildren(), function (x) { return x.property() && x.property().isKey(); });
        if (ka && ka instanceof ASTPropImpl) {
            var c = ka.value();
            var io = c.indexOf(':');
            if (io != -1) {
                return c.substring(0, io);
            }
            return c;
        }
        return _super.prototype.name.call(this);
    };
    ASTNodeImpl.prototype.findElementAtOffset = function (n) {
        return this._findNode(this, n, n);
    };
    ASTNodeImpl.prototype.isElement = function () {
        return true;
    };
    ASTNodeImpl.prototype.universe = function () {
        if (this._universe) {
            return this._universe;
        }
        return this.definition().universe();
    };
    ASTNodeImpl.prototype.setUniverse = function (u) {
        this._universe = u;
    };
    ASTNodeImpl.prototype.validate = function (v) {
        var _this = this;
        if (!this.parent()) {
            var u = this.universe();
            var tv = u.getTypedVersion();
            if (tv) {
                if (tv.indexOf("#%") == 0) {
                    if (tv != "#%RAML 0.8" && tv != "#%RAML 1.0") {
                        var i = createIssue(hl.IssueCode.NODE_HAS_VALUE, "Unknown version of RAML expected to see one of '#%RAML 0.8' or '#%RAML 1.0'", this);
                        v.accept(i);
                    }
                    var tl = u.getTopLevel();
                    if (tl) {
                        if (tl != this.definition().name()) {
                            var i = createIssue(hl.IssueCode.NODE_HAS_VALUE, "Unknown top level type:" + tl, this);
                            v.accept(i);
                        }
                    }
                }
            }
        }
        if (!this.isAllowedId()) {
            if ((!this.property()) || this.property().name() != "annotations") {
                if (this.definition().name() != "GlobalSchema") {
                    var i = createIssue(hl.IssueCode.ONLY_OVERRIDE_ALLOWED, "This node did not overrides any node from master api:" + this.id(), this);
                    v.accept(i);
                }
            }
        }
        if (!this.definition().getAllowAny()) {
            _super.prototype.validate.call(this, v);
        }
        else {
            this.validateIncludes(v);
        }
        ;
        checkPropertyQuard(this, v);
        if (typeof this.value() == 'string' && !this.definition().allowValue()) {
            var i = createIssue(hl.IssueCode.NODE_HAS_VALUE, "node " + this.name() + " can not be a scalar", this);
            v.accept(i);
        }
        this.definition().requiredProperties().forEach(function (x) {
            if (x.range().isValueType()) {
                var nm = _this.attr(x.name());
                if (!nm) {
                    var i = createIssue(hl.IssueCode.MISSING_REQUIRED_PROPERTY, "Missing required property " + x.name(), _this);
                    v.accept(i);
                }
            }
            else {
                var el = _this.elementsOfKind(x.name());
                if (!el || el.length == 0) {
                    var i = createIssue(hl.IssueCode.MISSING_REQUIRED_PROPERTY, "Missing required property " + x.name(), _this);
                    v.accept(i);
                }
            }
        });
        this.definition().getContextRequirements().forEach(function (x) {
            if (!_this.checkContextValue(x.name, x.value, _this.toRuntimeModel())) {
                v.accept(createIssue(hl.IssueCode.MISSED_CONTEXT_REQUIREMENT, x.name + " should be " + x.value + " to use type " + _this.definition().name(), _this));
            }
        });
        if (this.definition().universe().version() == "RAML08") {
            var m = {};
            var els = this.directChildren().filter(function (x) { return x.isElement(); });
            els.forEach(function (x) {
                if (x["_computed"]) {
                    return;
                }
                if (!x.name()) {
                    return;
                }
                var rm = x.lowLevel().parent() ? x.lowLevel().parent().end() : "";
                var k = x.name() + rm;
                if (m[k]) {
                    var i = createIssue(hl.IssueCode.KEY_SHOULD_BE_UNIQUE_INTHISCONTEXT, x.name() + " already exists in this context", x);
                    v.accept(i);
                }
                else {
                    m[k] = 1;
                }
            });
        }
        var pr = this.directChildren().filter(function (x) { return x.isAttr(); });
        var gr = _.groupBy(pr, function (x) { return x.name(); });
        Object.keys(gr).forEach(function (x) {
            if (gr[x].length > 1 && !gr[x][0].property().isMultiValue()) {
                gr[x].forEach(function (y) {
                    var i = createIssue(hl.IssueCode.PROPERTY_EXPECT_TO_HAVE_SINGLE_VALUE, y.property().name() + " should have a single value", y);
                    v.accept(i);
                });
            }
        });
    };
    ASTNodeImpl.prototype._findNode = function (n, offset, end) {
        var _this = this;
        if (n == null) {
            return null;
        }
        if (n.lowLevel()) {
            if (n.lowLevel().start() <= offset && n.lowLevel().end() >= end) {
                var res = n;
                n.elements().forEach(function (x) {
                    if (x.lowLevel().unit() != n.lowLevel().unit()) {
                        return;
                    }
                    var m = _this._findNode(x, offset, end);
                    if (m) {
                        res = m;
                    }
                });
                return res;
            }
        }
        return null;
    };
    ASTNodeImpl.prototype.isStub = function () {
        return !this.lowLevel().unit();
    };
    ASTNodeImpl.prototype.findInsertionPoint = function (node) {
        var ch = this.children();
        var toRet = null;
        var embed = node.property() && node.property().isEmbedMap();
        if (embed && _.find(this.lowLevel().children(), function (x) { return x.key() == node.property().name(); })) {
            embed = false;
        }
        if (node.isAttr() || embed) {
            for (var i = 0; i < ch.length; i++) {
                if (!ch[i].isAttr()) {
                    break;
                }
                else {
                    toRet = ch[i].lowLevel();
                }
            }
            if (toRet == null) {
                toRet = this.lowLevel();
            }
        }
        return toRet;
    };
    ASTNodeImpl.prototype.add = function (node) {
        var _this = this;
        if (!this._children) {
            this._children = [];
        }
        var insertionPoint = this.findInsertionPoint(node);
        var newLowLevel = null;
        var command = new ll.CompositeCommand();
        if (node.property().isMerged() || node.property().range().isValueType()) {
            newLowLevel = node.lowLevel();
            command.commands.push(ll.insertNode(this.lowLevel(), newLowLevel, insertionPoint));
        }
        else {
            var name = node.property().name();
            var target = this.lowLevel();
            var found = this.lowLevel().find(name);
            if (!found) {
                var nn = null;
                if (node.property().isEmbedMap()) {
                    nn = jsyaml.createSeqNode(name);
                    nn.addChild(node.lowLevel());
                }
                else {
                    nn = jsyaml.createNode(name);
                    nn.addChild(node.lowLevel());
                }
                newLowLevel = nn;
                command.commands.push(ll.insertNode(target, nn, insertionPoint));
            }
            else {
                if (node.property().isEmbedMap()) {
                    newLowLevel = node.lowLevel();
                    command.commands.push(ll.insertNode(found, node.lowLevel(), insertionPoint, true));
                }
                else {
                    newLowLevel = node.lowLevel();
                    command.commands.push(ll.insertNode(found, node.lowLevel(), insertionPoint, false));
                }
            }
        }
        if (this.isStub()) {
            this._children.push(node);
            command.commands.forEach(function (x) { return _this.lowLevel().addChild(x.value); });
            return;
        }
        this.lowLevel().execute(command);
        this._children.push(node);
    };
    ASTNodeImpl.prototype.remove = function (node) {
        if (this.isStub()) {
            if (!this._children) {
                return;
            }
            this._children = this._children.filter(function (x) { return x != node; });
            return;
        }
        var command = new ll.CompositeCommand();
        if (node instanceof ASTNodeImpl) {
            var aNode = node;
            if (!aNode.property().isMerged()) {
                if (this.elementsOfKind(aNode.property().name()).length == 1) {
                    command.commands.push(ll.removeNode(this.lowLevel(), aNode.lowLevel().parent().parent()));
                }
                else {
                    command.commands.push(ll.removeNode(this.lowLevel(), aNode.lowLevel()));
                }
            }
            else {
                command.commands.push(ll.removeNode(this.lowLevel(), aNode.lowLevel()));
            }
        }
        else {
            command.commands.push(ll.removeNode(this.lowLevel(), node.lowLevel()));
        }
        this.lowLevel().execute(command);
        this._children = this._children.filter(function (x) { return x != node; });
    };
    ASTNodeImpl.prototype.dump = function (flavor) {
        return this._node.dump();
    };
    ASTNodeImpl.prototype.patchType = function (d) {
        this._def = d;
        this._children = null;
    };
    ASTNodeImpl.prototype.children = function () {
        if (this._children) {
            var extra = this.getExtractedChildren();
            var res = this._children.concat(extra);
            return res;
        }
        if (this._node) {
            this._children = nodeBuilder.process(this, this._node.children());
            this._children = this._children.filter(function (x) { return x != null; });
            var extra = this.getExtractedChildren();
            var res = this._children.concat(extra);
            return res;
        }
        return [];
    };
    ASTNodeImpl.prototype.directChildren = function () {
        if (this._children) {
            return this._children;
        }
        if (this._node) {
            this._children = nodeBuilder.process(this, this._node.children());
            return this._children;
        }
        return [];
    };
    ASTNodeImpl.prototype.resetChildren = function () {
        this._children = null;
    };
    ASTNodeImpl.prototype.createAttr = function (n, v) {
        var mapping = jsyaml.createMapping(n, v);
        if (this.isStub()) {
            this._node.addChild(mapping);
            this._children = null;
        }
        else {
            this._children = null;
            var command = new ll.CompositeCommand();
            command.commands.push(ll.insertNode(this.lowLevel(), mapping, null));
            this.lowLevel().execute(command);
        }
    };
    ASTNodeImpl.prototype.isAttr = function () {
        return false;
    };
    ASTNodeImpl.prototype.isUnknown = function () {
        return false;
    };
    ASTNodeImpl.prototype.value = function () {
        return this._node.value();
    };
    ASTNodeImpl.prototype.valuesOf = function (propName) {
        var pr = this._def.property(propName);
        if (pr != null) {
            return this.elements().filter(function (x) { return x.property() == pr; });
        }
        return [];
    };
    ASTNodeImpl.prototype.attr = function (n) {
        return _.find(this.attrs(), function (y) { return y.name() == n; });
    };
    ASTNodeImpl.prototype.attrOrCreate = function (name) {
        var a = this.attr(name);
        if (!a)
            this.createAttr(name, '');
        return this.attr(name);
    };
    ASTNodeImpl.prototype.attributes = function (n) {
        return _.filter(this.attrs(), function (y) { return y.name() == n; });
    };
    ASTNodeImpl.prototype.attrs = function () {
        return this.children().filter(function (x) { return x.isAttr(); });
    };
    ASTNodeImpl.prototype.allAttrs = function () {
        var _this = this;
        var attrs = this.children().filter(function (x) { return x.isAttr(); });
        var attributes = [];
        this.definition().allProperties().forEach(function (x) {
            if (x.range().isValueType() && !x.isSystem()) {
                var a = _.find(attrs, function (y) { return y.name() == x.name(); });
                if (a) {
                    attributes.push(a);
                }
                else {
                    a = new VirtualAttribute(_this, _this.definition(), x, false);
                    attributes.push(a);
                }
            }
        });
        return attributes;
    };
    ASTNodeImpl.prototype.elements = function () {
        return this.children().filter(function (x) { return !x.isAttr() && !x.isUnknown(); });
    };
    ASTNodeImpl.prototype.element = function (n) {
        var r = this.elementsOfKind(n);
        if (r.length > 0) {
            return r[0];
        }
        return null;
    };
    ASTNodeImpl.prototype.elementsOfKind = function (n) {
        var r = this.elements().filter(function (x) { return x.property().name() == n; });
        return r;
    };
    ASTNodeImpl.prototype.definition = function () {
        return this._def;
    };
    ASTNodeImpl.prototype.property = function () {
        return this._prop;
    };
    ASTNodeImpl.prototype.isExpanded = function () {
        return this._expanded;
    };
    ASTNodeImpl.prototype.copy = function () {
        return new ASTNodeImpl(this.lowLevel().copy(), this.parent(), this.definition(), this.property());
    };
    return ASTNodeImpl;
})(BasicASTNode);
exports.ASTNodeImpl = ASTNodeImpl;
//# sourceMappingURL=highLevelImpl.js.map