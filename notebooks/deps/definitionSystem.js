var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require("underscore");
var hlimpl = require('./highLevelImpl');
var jsyaml = require('./jsyaml2lowLevel');
var su = require('./schemaUtil');
var selector = require('./selectorMatch');
var ramlexp = require('./ramlExpressions');
var Annotation = (function () {
    function Annotation(_name) {
        this._name = _name;
    }
    Annotation.prototype.name = function () {
        return this._name;
    };
    return Annotation;
})();
exports.Annotation = Annotation;
var Described = (function () {
    function Described(_name, _description) {
        if (_description === void 0) { _description = ""; }
        this._name = _name;
        this._description = _description;
        this._issues = [];
        this._toClarify = [];
        this._itCovers = [];
        this._tags = [];
    }
    Described.prototype.name = function () {
        return this._name;
    };
    Described.prototype.description = function () {
        return this._description;
    };
    Described.prototype.withIssue = function (description) {
        this._issues.push(description);
        return this;
    };
    Described.prototype.withTag = function (description) {
        this._tags.push(description);
        return this;
    };
    Described.prototype.withClarify = function (description) {
        this._toClarify.push(description);
        return this;
    };
    Described.prototype.getCoveredStuff = function () {
        return this._itCovers;
    };
    Described.prototype.withThisFeatureCovers = function (description) {
        this._itCovers.push(description);
        return this;
    };
    Described.prototype.withVersion = function (verstion) {
        this._version = verstion;
    };
    Described.prototype.version = function () {
        return this._version;
    };
    Described.prototype.issues = function () {
        return this._issues;
    };
    Described.prototype.toClarify = function () {
        return this._toClarify;
    };
    Described.prototype.tags = function () {
        return this._tags;
    };
    Described.prototype.withDescription = function (d) {
        this._description = d;
        return this;
    };
    return Described;
})();
exports.Described = Described;
var ValueRequirement = (function () {
    function ValueRequirement(name, value) {
        this.name = name;
        this.value = value;
    }
    return ValueRequirement;
})();
exports.ValueRequirement = ValueRequirement;
var AbstractType = (function (_super) {
    __extends(AbstractType, _super);
    function AbstractType(_name, _universe, _path) {
        _super.call(this, _name);
        this._universe = _universe;
        this._path = _path;
        this._superTypes = [];
        this._subTypes = [];
        this._annotations = [];
        this._requirements = [];
        this._aliases = [];
        this._defining = [];
        this._methods = [];
    }
    AbstractType.prototype.setConsumesRefs = function (b) {
        this._consumesRef = b;
    };
    AbstractType.prototype.definingPropertyIsEnough = function (v) {
        this._defining.push(v);
    };
    AbstractType.prototype.getDefining = function () {
        return this._defining;
    };
    AbstractType.prototype.getConsumesRefs = function () {
        return this._consumesRef;
    };
    AbstractType.prototype.addAlias = function (al) {
        this._aliases.push(al);
    };
    AbstractType.prototype.getAliases = function () {
        return this._aliases;
    };
    AbstractType.prototype.isValid = function (h, v, p) {
        return true;
    };
    AbstractType.prototype.getPath = function () {
        return this._path;
    };
    AbstractType.prototype.withFunctionalDescriminator = function (code) {
        this._fDesc = code;
    };
    AbstractType.prototype.addMethod = function (name, text) {
        this._methods.push({ name: name, text: text });
    };
    AbstractType.prototype.methods = function () {
        return this._methods;
    };
    AbstractType.prototype.setNameAtRuntime = function (name) {
        this._nameAtRuntime = name;
    };
    AbstractType.prototype.getNameAtRuntime = function () {
        return this._nameAtRuntime;
    };
    AbstractType.prototype.getFunctionalDescriminator = function () {
        return this._fDesc;
    };
    AbstractType.prototype.getRuntimeExtenders = function () {
        return [];
    };
    AbstractType.prototype.universe = function () {
        return this._universe;
    };
    AbstractType.prototype.superTypes = function () {
        return [].concat(this._superTypes);
    };
    AbstractType.prototype.subTypes = function () {
        return [].concat(this._subTypes);
    };
    AbstractType.prototype.allSubTypes = function () {
        var rs = [];
        this.subTypes().forEach(function (x) {
            rs.push(x);
            rs = rs.concat(x.allSubTypes());
        });
        return _.unique(rs);
    };
    AbstractType.prototype.allSuperTypes = function () {
        var rs = [];
        this.superTypes().forEach(function (x) {
            rs.push(x);
            rs = rs.concat(x.allSuperTypes());
        });
        return _.unique(rs);
    };
    AbstractType.prototype.addRequirement = function (name, value) {
        this._requirements.push(new ValueRequirement(name, value));
    };
    AbstractType.prototype.valueRequirements = function () {
        return this._requirements;
    };
    AbstractType.prototype.annotations = function () {
        return this._annotations;
    };
    return AbstractType;
})(Described);
exports.AbstractType = AbstractType;
var ValueType = (function (_super) {
    __extends(ValueType, _super);
    function ValueType(name, _universe, path, description, _restriction) {
        if (description === void 0) { description = ""; }
        if (_restriction === void 0) { _restriction = null; }
        _super.call(this, name, _universe, path);
        this._restriction = _restriction;
        this._declaredBy = [];
    }
    ValueType.prototype.hasStructure = function () {
        if (this.name() == "structure") {
            return true;
        }
        return false;
    };
    ValueType.prototype.isValid = function (h, v, p) {
        try {
            if (this.name() == "AnnotationRef") {
                var targets = p.referenceTargets(h);
                var actualAnnotation = _.find(targets, function (x) { return hlimpl.qName(x, h) == v; });
                if (actualAnnotation != null) {
                    var attrs = actualAnnotation.attributes("allowedTargets");
                    if (attrs) {
                        var aVals = attrs.map(function (x) { return x.value(); });
                        if (aVals.length > 0) {
                            var found = false;
                            var tps = h.definition().allSuperTypes();
                            tps = tps.concat([h.definition()]);
                            var tpNames = tps.map(function (x) { return x.name(); });
                            aVals.forEach(function (x) {
                                if (_.find(tpNames, function (y) { return y == x; })) {
                                    found = true;
                                }
                                else {
                                    if (x == "Parameter") {
                                        if (h.computedValue("location")) {
                                            found = true;
                                        }
                                    }
                                    if (x == "Field") {
                                        if (h.computedValue("field")) {
                                            found = true;
                                        }
                                    }
                                }
                            });
                            if (!found) {
                                return new Error("annotation " + v + " can not be placed at this location, allowed targets are:" + aVals);
                            }
                        }
                    }
                }
                return tm;
            }
            if (this.name() == "SchemaString") {
                var tm = su.createSchema(v);
                if (tm instanceof Error) {
                    tm.canBeRef = true;
                }
                return tm;
            }
            if (this.name() == "JSonSchemaString") {
                var jsshema = su.getJSONSchema(v);
                if (jsshema instanceof Error) {
                    jsshema.canBeRef = true;
                }
                return jsshema;
            }
            if (this.name() == "XMLSchemaString") {
                var xmlschema = su.getXMLSchema(v);
                if (xmlschema instanceof Error) {
                    xmlschema.canBeRef = true;
                }
                return xmlschema;
            }
            if (this.name() == "BooleanType") {
                if (!(v == 'true' || v == 'false')) {
                    return new Error("'true' or 'false' is expected here");
                }
            }
            if (this.name() == "NumberType") {
                var q = parseFloat(v);
                if (isNaN(q)) {
                    return new Error("number is expected here");
                }
            }
            if (this.name() == 'ramlexpression') {
                try {
                    if (p.name() == 'condition') {
                        if (h.computedValue("response")) {
                            h = h.parent().parent().parent();
                        }
                        else {
                            h = h.parent().parent();
                        }
                    }
                    if (p.name() == 'validWhen' || p.name() == 'requiredWhen') {
                        h = h.parent();
                    }
                    ramlexp.validate(v, h);
                }
                catch (e) {
                    return e;
                }
            }
            if (this.name() == "pointer") {
                var pointer = hlimpl.resolveRamlPointer(h, v);
                if (!pointer) {
                    return new Error("Unable to resolve raml pointer:" + v);
                }
                else {
                    var dp = p;
                    var sl = dp.getSelector(h);
                    if (sl) {
                        var pp = h;
                        if (pp.definition().isAnnotation()) {
                            pp = pp.parent();
                        }
                        var options = sl.apply(pp);
                        if (!_.find(options, function (x) { return x == pointer; })) {
                            return new Error("Pointer does not fits to scope " + v);
                        }
                    }
                }
            }
            if (this.name() == "RAMLSelector") {
                try {
                    var sl = selector.parse(h, v);
                    return sl;
                }
                catch (e) {
                    return new Error("Unable to parse RAML selector :" + e.message);
                }
            }
            return true;
        }
        catch (e) {
            e.canBeRef = true;
            return e;
        }
    };
    ValueType.prototype.isValueType = function () {
        return true;
    };
    ValueType.prototype.isUnionType = function () {
        return false;
    };
    ValueType.prototype.properties = function () {
        return [];
    };
    ValueType.prototype.allProperties = function () {
        return [];
    };
    ValueType.prototype.globallyDeclaredBy = function () {
        return this._declaredBy;
    };
    ValueType.prototype.setGloballyDeclaredBy = function (c) {
        this._declaredBy.push(c);
    };
    ValueType.prototype.getValueRestriction = function () {
        return this._restriction;
    };
    ValueType.prototype.match = function (r) {
        return false;
    };
    return ValueType;
})(AbstractType);
exports.ValueType = ValueType;
var EnumType = (function (_super) {
    __extends(EnumType, _super);
    function EnumType() {
        _super.apply(this, arguments);
        this.values = [];
    }
    return EnumType;
})(ValueType);
exports.EnumType = EnumType;
var ReferenceType = (function (_super) {
    __extends(ReferenceType, _super);
    function ReferenceType(name, path, referenceTo, _universe) {
        _super.call(this, name, _universe, path);
        this.referenceTo = referenceTo;
    }
    ReferenceType.prototype.getReferencedType = function () {
        return this.universe().getType(this.referenceTo);
    };
    ReferenceType.prototype.hasStructure = function () {
        var rt = this.getReferencedType();
        if (rt) {
            return rt.isInlinedTemplates() || (rt.findMembersDeterminer() != null);
        }
        else {
            return false;
        }
    };
    return ReferenceType;
})(ValueType);
exports.ReferenceType = ReferenceType;
var ScriptingHookType = (function (_super) {
    __extends(ScriptingHookType, _super);
    function ScriptingHookType(name, path, refTo, _universe) {
        _super.call(this, name, _universe, path);
        this.refTo = refTo;
    }
    ScriptingHookType.prototype.getReferencedType = function () {
        return this.universe().getType(this.refTo);
    };
    return ScriptingHookType;
})(ValueType);
exports.ScriptingHookType = ScriptingHookType;
var NodeClass = (function (_super) {
    __extends(NodeClass, _super);
    function NodeClass(_name, universe, path, _description) {
        if (_description === void 0) { _description = ""; }
        _super.call(this, _name, universe, path);
        this._properties = [];
        this._declaresType = null;
        this._runtimeExtenders = [];
        this._inlinedTemplates = false;
        this._contextReq = [];
        this._allowQuestion = false;
        this._canInherit = [];
    }
    NodeClass.prototype.isDeclaration = function () {
        if (this._inlinedTemplates) {
            return true;
        }
        if (this._convertsToGlobal) {
            return true;
        }
        if (this._declaresType) {
            return true;
        }
        if (this.name() == "Library") {
            return true;
        }
        return false;
    };
    NodeClass.prototype.isAnnotation = function () {
        if (this._annotationChecked) {
            return this._isAnnotation;
        }
        this._annotationChecked = true;
        this._isAnnotation = (_.find(this.allSuperTypes(), function (x) { return x.name() == "Annotation"; }) != null);
        return this._isAnnotation;
    };
    NodeClass.prototype.allowValue = function () {
        if (this._allowValueSet) {
            return this._allowValue;
        }
        if (_.find(this.allProperties(), function (x) { return x.isValue() || x.canBeValue(); })) {
            this._allowValue = true;
            this._allowValueSet = true;
            return true;
        }
        this._allowValueSet = true;
        return false;
    };
    NodeClass.prototype.withCanInherit = function (clazz) {
        this._canInherit.push(clazz);
    };
    NodeClass.prototype.getCanInherit = function () {
        return this._canInherit;
    };
    NodeClass.prototype.getReferenceIs = function () {
        return this._referenceIs;
    };
    NodeClass.prototype.withReferenceIs = function (fname) {
        this._referenceIs = fname;
    };
    NodeClass.prototype.withAllowQuestion = function () {
        this._allowQuestion = true;
    };
    NodeClass.prototype.requiredProperties = function () {
        return this.allProperties().filter(function (x) { return x.isRequired(); });
    };
    NodeClass.prototype.getAllowQuestion = function () {
        return this._allowQuestion;
    };
    NodeClass.prototype.withAllowAny = function () {
        this._allowAny = true;
    };
    NodeClass.prototype.getAllowAny = function () {
        return this._allowAny;
    };
    NodeClass.prototype.withActuallyExports = function (pname) {
        this._actuallyExports = pname;
    };
    NodeClass.prototype.withConvertsToGlobal = function (pname) {
        this._convertsToGlobal = pname;
    };
    NodeClass.prototype.getConvertsToGlobal = function () {
        return this._convertsToGlobal;
    };
    NodeClass.prototype.getActuallyExports = function () {
        return this._actuallyExports;
    };
    NodeClass.prototype.withContextRequirement = function (name, value) {
        this._contextReq.push({ name: name, value: value });
    };
    NodeClass.prototype.getContextRequirements = function () {
        return this._contextReq;
    };
    NodeClass.prototype.isGlobalDeclaration = function () {
        if (this._actuallyExports) {
            return true;
        }
        if (this._inlinedTemplates) {
            return true;
        }
        if (this._declaresType) {
            return true;
        }
        return false;
    };
    NodeClass.prototype.findMembersDeterminer = function () {
        return _.find(this.properties(), function (x) { return x.isThisPropertyDeclaresTypeFields(); });
    };
    NodeClass.prototype.isTypeSystemMember = function () {
        return this._declaresType != null;
    };
    NodeClass.prototype.hasStructure = function () {
        return true;
    };
    NodeClass.prototype.getExtendedType = function () {
        return this.universe().type(this._declaresType);
    };
    NodeClass.prototype.setInlinedTemplates = function (b) {
        this._inlinedTemplates = b;
        return this;
    };
    NodeClass.prototype.isInlinedTemplates = function () {
        return this._inlinedTemplates;
    };
    NodeClass.prototype.setExtendedTypeName = function (name) {
        this._declaresType = name;
        var tp = this.universe().type(name);
        if (tp instanceof NodeClass) {
            var nc = tp;
            nc._runtimeExtenders.push(this);
        }
    };
    NodeClass.prototype.getRuntimeExtenders = function () {
        return this._runtimeExtenders;
    };
    NodeClass.prototype.createStubNode = function (p, key) {
        if (key === void 0) { key = null; }
        var lowLevel = jsyaml.createNode(key ? key : "key");
        var nm = new hlimpl.ASTNodeImpl(lowLevel, null, this, p);
        this.allProperties().forEach(function (x) {
            if (x.range().isValueType() && !x.isSystem()) {
                var a = nm.attr(x.name());
                if (!a) {
                }
            }
        });
        nm.children();
        return nm;
    };
    NodeClass.prototype.descriminatorValue = function () {
        if (this.valueRequirements().length == 0) {
            return this.name();
        }
        return this.valueRequirements()[0].value;
    };
    NodeClass.prototype.match = function (r, alreadyFound) {
        var _this = this;
        if (r.isAttr() || r.isUnknown()) {
            return false;
        }
        var el = r;
        if (this.name() == "ObjectField") {
            var tp = el.attr("type");
            if (tp && tp.value()) {
                if (!_.find(["string", "boolean", "file", "number", "integer", "date", "pointer", "script"], function (x) { return x == tp.value(); })) {
                    return true;
                }
            }
        }
        var hasSuperType = _.find(this.superTypes(), function (x) {
            var dp = _.find(x.allProperties(), function (x) { return x.isDescriminating(); });
            if (dp) {
                var a = el.attr(dp.name());
                if (a) {
                    if (a.value() == _this.name()) {
                        return true;
                    }
                }
            }
            return false;
        });
        if (hasSuperType) {
            return true;
        }
        if (this.valueRequirements().length == 0) {
            return false;
        }
        var matches = true;
        this.valueRequirements().forEach(function (x) {
            var a = el.attr(x.name);
            if (a) {
                if (a.value() == x.value) {
                }
                else {
                    if (_this.getConsumesRefs()) {
                        var vl = a.value();
                        var allSubs = [];
                        _this.superTypes().forEach(function (x) { return x.allSubTypes().forEach(function (y) {
                            allSubs.push(y);
                        }); });
                        var allSubNames = [];
                        _.unique(allSubs).forEach(function (x) {
                            allSubNames.push(x.name());
                            x.valueRequirements().forEach(function (y) {
                                allSubNames.push(y.value);
                            });
                            x.getAliases().forEach(function (y) { return allSubNames.push(y); });
                        });
                        if (_.find(allSubNames, function (x) { return x == vl; })) {
                            matches = false;
                        }
                    }
                    else {
                        matches = false;
                    }
                }
            }
            else {
                var m = _this.getDefining();
                var ms = false;
                m.forEach(function (x) {
                    el.lowLevel().children().forEach(function (y) {
                        if (y.key() == x) {
                            ms = true;
                        }
                        if (y.key() == "$ref") {
                            if (el.definition().universe().version() == "Swagger") {
                                var resolved = hlimpl.resolveReference(y, y.value());
                                if (resolved) {
                                    if (_.find(resolved.children(), function (z) { return z.key() == x; })) {
                                        ms = true;
                                    }
                                }
                            }
                        }
                    });
                });
                if (ms) {
                    matches = true;
                    return;
                }
                if (!alreadyFound) {
                    var pr = _this.property(x.name);
                    if (pr && pr.defaultValue() == x.value) {
                    }
                    else {
                        matches = false;
                    }
                }
            }
        });
        return matches;
    };
    NodeClass.prototype.allProperties = function () {
        if (this._props) {
            return this._props;
        }
        var n = {};
        if (this.superTypes().length > 0) {
            this.superTypes().forEach(function (x) {
                x.allProperties().forEach(function (y) { return n[y.name()] = y; });
            });
        }
        this._properties.forEach(function (x) { return n[x.name()] = x; });
        this._props = Object.keys(n).map(function (x) { return n[x]; });
        return this._props;
    };
    NodeClass.prototype.isValueType = function () {
        return false;
    };
    NodeClass.prototype.isAbstract = function () {
        return this._isAbstract;
    };
    NodeClass.prototype.isUnionType = function () {
        return false;
    };
    NodeClass.prototype.property = function (propName) {
        return _.find(this.allProperties(), function (x) { return x.name() == propName; });
    };
    NodeClass.prototype.properties = function () {
        return [].concat(this._properties);
    };
    NodeClass.prototype.getKeyProp = function () {
        return _.find(this._properties, function (x) { return x.isKey(); });
    };
    NodeClass.prototype.registerProperty = function (p) {
        if (p.domain() != this) {
            throw new Error("Should be already owned by this");
        }
        if (this._properties.indexOf(p) != -1) {
            throw new Error("Already included");
        }
        this._properties.push(p);
    };
    return NodeClass;
})(AbstractType);
exports.NodeClass = NodeClass;
var Universe = (function (_super) {
    __extends(Universe, _super);
    function Universe(name, _parent, v) {
        if (name === void 0) { name = ""; }
        if (_parent === void 0) { _parent = null; }
        if (v === void 0) { v = "RAML08"; }
        _super.call(this, name);
        this._parent = _parent;
        this._classes = [];
        this._uversion = "RAML08";
        this.aMap = {};
        this._uversion = v;
    }
    Universe.prototype.setTopLevel = function (t) {
        this._topLevel = t;
    };
    Universe.prototype.getTopLevel = function () {
        return this._topLevel;
    };
    Universe.prototype.setTypedVersion = function (tv) {
        this._typedVersion = tv;
    };
    Universe.prototype.getTypedVersion = function () {
        return this._typedVersion;
    };
    Universe.prototype.version = function () {
        return this._uversion;
    };
    Universe.prototype.setUniverseVersion = function (version) {
        this._uversion = version;
    };
    Universe.prototype.types = function () {
        var result = [].concat(this._classes);
        if (this._parent != null) {
            result = result.concat(this._parent.types());
        }
        return result;
    };
    Universe.prototype.type = function (name) {
        if (this.aMap[name]) {
            return this.aMap[name];
        }
        var tp = _.find(this._classes, function (x) { return x.name() == name; });
        if (tp == null) {
            if (this._parent) {
                var tp = this._parent.type(name);
                if (tp instanceof AbstractType) {
                    var at = tp;
                    at._universe = this;
                }
            }
        }
        return tp;
    };
    Universe.prototype.getType = function (name) {
        return this.type(name);
    };
    Universe.prototype.register = function (t) {
        this._classes.push(t);
        if (t instanceof NodeClass) {
            this._classes.forEach(function (x) {
                if (x instanceof NodeClass) {
                    var nc = x;
                    if (nc.getExtendedType() == t) {
                        t.getRuntimeExtenders().push(x);
                    }
                }
            });
        }
        return this;
    };
    Universe.prototype.registerAlias = function (a, t) {
        this.aMap[a] = t;
    };
    Universe.prototype.unregister = function (t) {
        this._classes = this._classes.filter(function (x) { return x != t; });
        var st = t.superTypes();
        st.forEach(function (x) {
            var a = x;
            a._superTypes = a._superTypes.filter(function (x) { return x != t; });
        });
        st = t.subTypes();
        st.forEach(function (x) {
            var a = x;
            a._subTypes = a._subTypes.filter(function (x) { return x != t; });
        });
        return this;
    };
    Universe.prototype.registerSuperClass = function (t0, t1) {
        var a0 = t0;
        var a1 = t1;
        a0._superTypes.push(t1);
        a1._subTypes.push(t0);
    };
    return Universe;
})(Described);
exports.Universe = Universe;
var ValueRestriction = (function () {
    function ValueRestriction() {
    }
    ValueRestriction.prototype.test = function (n, p, value) {
        throw new Error("Should be overriden in subclasses");
    };
    return ValueRestriction;
})();
exports.ValueRestriction = ValueRestriction;
var ReferenceTo = (function (_super) {
    __extends(ReferenceTo, _super);
    function ReferenceTo(_requiredClass) {
        _super.call(this);
        this._requiredClass = _requiredClass;
    }
    ReferenceTo.prototype.requiredClass = function () {
        return this._requiredClass;
    };
    return ReferenceTo;
})(ValueRestriction);
exports.ReferenceTo = ReferenceTo;
var FixedSetRestriction = (function (_super) {
    __extends(FixedSetRestriction, _super);
    function FixedSetRestriction(_allowedValues) {
        _super.call(this);
        this._allowedValues = _allowedValues;
    }
    FixedSetRestriction.prototype.values = function () {
        return this._allowedValues;
    };
    return FixedSetRestriction;
})(ValueRestriction);
exports.FixedSetRestriction = FixedSetRestriction;
var RegExpRestriction = (function (_super) {
    __extends(RegExpRestriction, _super);
    function RegExpRestriction(_regExp) {
        _super.call(this);
        this._regExp = _regExp;
    }
    RegExpRestriction.prototype.regeExp = function () {
        return this._regExp;
    };
    return RegExpRestriction;
})(ValueRestriction);
exports.RegExpRestriction = RegExpRestriction;
var UnionType = (function () {
    function UnionType(_base) {
        this._base = _base;
    }
    UnionType.prototype.getRuntimeExtenders = function () {
        return [];
    };
    UnionType.prototype.methods = function () {
        return [];
    };
    UnionType.prototype.superTypes = function () {
        return [];
    };
    UnionType.prototype.allSuperTypes = function () {
        return [];
    };
    UnionType.prototype.subTypes = function () {
        return [];
    };
    UnionType.prototype.name = function () {
        return this._base.map(function (x) { return x.name(); }).join(",");
    };
    UnionType.prototype.hasStructure = function () {
        return false;
    };
    UnionType.prototype.description = function () {
        return "";
    };
    UnionType.prototype.isValid = function () {
        return true;
    };
    UnionType.prototype.universe = function () {
        return this._base[0].universe();
    };
    UnionType.prototype.match = function (r) {
        return false;
    };
    UnionType.prototype.allSubTypes = function () {
        throw new Error("Union types should not be used in this context");
    };
    UnionType.prototype.annotations = function () {
        throw new Error("Union types should not be used in this context");
    };
    UnionType.prototype.allProperties = function () {
        throw new Error("Union types should be never used in this context");
    };
    UnionType.prototype.getAlternatives = function () {
        return [].concat(this._base);
    };
    UnionType.prototype.valueRequirements = function () {
        throw new Error("Union types should be never used in this context");
    };
    UnionType.prototype.properties = function () {
        var res = [];
        this._base.forEach(function (x) { return res.concat(x.properties()); });
        return res;
    };
    UnionType.prototype.isValueType = function () {
        if (this._base.filter(function (x) { return (x.isValueType() == true); }).length == this._base.length) {
            return true;
        }
        if (this._base.filter(function (x) { return (x.isValueType() == false); }).length == this._base.length) {
            return false;
        }
        return null;
    };
    UnionType.prototype.isUnionType = function () {
        return true;
    };
    return UnionType;
})();
exports.UnionType = UnionType;
var PropertyTrait = (function () {
    function PropertyTrait() {
    }
    return PropertyTrait;
})();
exports.PropertyTrait = PropertyTrait;
var DefinesImplicitKey = (function (_super) {
    __extends(DefinesImplicitKey, _super);
    function DefinesImplicitKey(_where, _childKeyDefined) {
        _super.call(this);
        this._where = _where;
        this._childKeyDefined = _childKeyDefined;
    }
    DefinesImplicitKey.prototype.where = function () {
        return this._where;
    };
    DefinesImplicitKey.prototype.definesKeyOf = function () {
        return this._childKeyDefined;
    };
    return DefinesImplicitKey;
})(PropertyTrait);
exports.DefinesImplicitKey = DefinesImplicitKey;
var ExpansionTrait = (function (_super) {
    __extends(ExpansionTrait, _super);
    function ExpansionTrait() {
        _super.call(this);
    }
    return ExpansionTrait;
})(PropertyTrait);
exports.ExpansionTrait = ExpansionTrait;
function prop(name, desc, domain, range) {
    var prop = new Property(name, desc);
    return prop.withDomain(domain).withRange(range);
}
exports.prop = prop;
var ChildValueConstraint = (function () {
    function ChildValueConstraint(name, value) {
        this.name = name;
        this.value = value;
    }
    return ChildValueConstraint;
})();
exports.ChildValueConstraint = ChildValueConstraint;
var Property = (function (_super) {
    __extends(Property, _super);
    function Property() {
        _super.apply(this, arguments);
        this._keyShouldStartFrom = null;
        this._isMultiValue = false;
        this._isFromParentValue = false;
        this._isFromParentKey = false;
        this._isRequired = false;
        this._key = false;
        this._traits = [];
        this._describes = null;
        this._descriminates = false;
        this._contextReq = [];
        this._vrestr = [];
        this.determinesChildValues = [];
    }
    Property.prototype.getSelector = function (h) {
        var sl = this._selector;
        if (sl instanceof selector.Selector) {
            return sl;
        }
        if (!h) {
            return null;
        }
        if (this._selector) {
            return selector.parse(h, this._selector);
        }
        return null;
    };
    Property.prototype.setSelector = function (s) {
        this._selector = s;
        return this;
    };
    Property.prototype.valueDocProvider = function () {
        return this._vprovider;
    };
    Property.prototype.setValueDocProvider = function (v) {
        this._vprovider = v;
        return this;
    };
    Property.prototype.suggester = function () {
        return this._suggester;
    };
    Property.prototype.setValueSuggester = function (s) {
        this._suggester = s;
    };
    Property.prototype.enumOptions = function () {
        return this._enumOptions;
    };
    Property.prototype.getOftenKeys = function () {
        return this._oftenKeys;
    };
    Property.prototype.withOftenKeys = function (keys) {
        this._oftenKeys = keys;
        return this;
    };
    Property.prototype.withCanBeValue = function () {
        this._canBeValue = true;
        return this;
    };
    Property.prototype.withInherited = function (w) {
        this._isInherited = w;
    };
    Property.prototype.isInherited = function () {
        return this._isInherited;
    };
    Property.prototype.isAllowNull = function () {
        return this._isAllowNull;
    };
    Property.prototype.withAllowNull = function () {
        this._isAllowNull = true;
    };
    Property.prototype.isDescriminator = function () {
        return this._descriminates;
    };
    Property.prototype.getCanBeDuplicator = function () {
        return this._canBeDuplicator;
    };
    Property.prototype.isValue = function () {
        return this._isFromParentValue;
    };
    Property.prototype.canBeValue = function () {
        return this._canBeValue;
    };
    Property.prototype.setCanBeDuplicator = function () {
        this._canBeDuplicator = true;
        return true;
    };
    Property.prototype.inheritedContextValue = function () {
        return this._inheritsValueFromContext;
    };
    Property.prototype.withInheritedContextValue = function (v) {
        this._inheritsValueFromContext = v;
        return this;
    };
    Property.prototype.withPropertyGrammarType = function (pt) {
        this._propertyGrammarType = pt;
    };
    Property.prototype.getPropertyGrammarType = function () {
        return this._propertyGrammarType;
    };
    Property.prototype.withContextRequirement = function (name, value) {
        this._contextReq.push({ name: name, value: value });
    };
    Property.prototype.getContextRequirements = function () {
        return this._contextReq;
    };
    Property.prototype.withDescriminating = function (b) {
        this._descriminates = b;
        return this;
    };
    Property.prototype.isDescriminating = function () {
        return this._descriminates;
    };
    Property.prototype.withDescribes = function (a) {
        this._describes = a;
        return this;
    };
    Property.prototype.withValueRewstrinction = function (exp, message) {
        this._vrestr.push({ exp: exp, message: message });
        return this;
    };
    Property.prototype.getValueRestrictionExpressions = function () {
        return this._vrestr;
    };
    Property.prototype.describesAnnotation = function () {
        return this._describes != null;
    };
    Property.prototype.describedAnnotation = function () {
        return this._describes;
    };
    Property.prototype.createAttr = function (val) {
        var lowLevel = jsyaml.createMapping(this.name(), val);
        var nm = new hlimpl.ASTPropImpl(lowLevel, null, this.range(), this);
        return nm;
    };
    Property.prototype.isReference = function () {
        return this.range() instanceof ReferenceType;
    };
    Property.prototype.referencesTo = function () {
        return this.range().getReferencedType();
    };
    Property.prototype.newInstanceName = function () {
        if (this._newInstanceName) {
            return this._newInstanceName;
        }
        return this.range().name();
    };
    Property.prototype.withThisPropertyDeclaresFields = function (b) {
        if (b === void 0) { b = true; }
        this._declaresFields = b;
        return this;
    };
    Property.prototype.isThisPropertyDeclaresTypeFields = function () {
        return this._declaresFields;
    };
    Property.prototype.withNewInstanceName = function (name) {
        this._newInstanceName = name;
        return this;
    };
    Property.prototype.addChildValueConstraint = function (c) {
        this.determinesChildValues.push(c);
    };
    Property.prototype.setDefaultVal = function (s) {
        this._defaultVal = s;
        return this;
    };
    Property.prototype.defaultValue = function () {
        return this._defaultVal;
    };
    Property.prototype.getChildValueConstraints = function () {
        return this.determinesChildValues;
    };
    Property.prototype.childRestrictions = function () {
        return this.determinesChildValues;
    };
    Property.prototype.isSystem = function () {
        return this._isSystem;
    };
    Property.prototype.withSystem = function (s) {
        this._isSystem = s;
        return this;
    };
    Property.prototype.isEmbedMap = function () {
        return this._isEmbedMap;
    };
    Property.prototype.withEmbedMap = function () {
        this._isEmbedMap = true;
        return this;
    };
    Property.prototype.enumValues = function (c) {
        if (c) {
            var rs = [];
            if ((this.name() == "type" && this.domain().name() == "DataElement") || (this.name() == "schema" && this.domain().name() == "BodyLike")) {
                var definitionNodes = hlimpl.globalDeclarations(c).filter(function (node) {
                    if (node.definition().name() == "GlobalSchema") {
                        return true;
                    }
                    var st = node.definition().allSuperTypes();
                    if (_.find(st, function (x) { return x.name() == "DataElement"; })) {
                        return true;
                    }
                    return node.definition().name() == "DataElement" && node.property().name() == 'models';
                });
                rs = definitionNodes.map(function (x) { return hlimpl.qName(x, c); });
            }
            if (this.isDescriminating()) {
                var subTypes = hlimpl.subTypesWithLocals(this.domain(), c);
                rs = rs.concat(subTypes.map(function (x) { return x.descriminatorValue(); }));
            }
            else if (this.isReference()) {
                rs = hlimpl.nodesDeclaringType(this.referencesTo(), c).map(function (x) { return hlimpl.qName(x, c); });
            }
            else if (this.range().isValueType()) {
                var vt = this.range();
                if (vt.globallyDeclaredBy().length > 0) {
                    var definitionNodes = hlimpl.globalDeclarations(c).filter(function (z) { return _.find(vt.globallyDeclaredBy(), function (x) { return x == z.definition(); }) != null; });
                    rs = rs.concat(definitionNodes.map(function (x) { return hlimpl.qName(x, c); }));
                }
            }
            if (this.isAllowNull()) {
                rs.push("null");
            }
            if (this._enumOptions) {
                rs = rs.concat(this._enumOptions);
            }
            return rs;
        }
        return this._enumOptions;
    };
    Property.prototype.referenceTargets = function (c) {
        if (this.isDescriminating()) {
            var subTypes = hlimpl.nodesDeclaringType(this.range(), c);
            return subTypes;
        }
        if (this.isReference()) {
            var rt = this.referencesTo();
            var subTypes = hlimpl.nodesDeclaringType(rt, c);
            return subTypes;
        }
        if (this.range().isValueType()) {
            var vt = this.range();
            if (vt.globallyDeclaredBy().length > 0) {
                var definitionNodes = hlimpl.globalDeclarations(c).filter(function (z) { return _.find(vt.globallyDeclaredBy(), function (x) { return x == z.definition(); }) != null; });
                return definitionNodes;
            }
        }
        return [];
    };
    Property.prototype.getEnumOptions = function () {
        return this._enumOptions;
    };
    Property.prototype.withEnumOptions = function (op) {
        this._enumOptions = op;
        return this;
    };
    Property.prototype.withDomain = function (d) {
        this._ownerClass = d;
        d.registerProperty(this);
        return this;
    };
    Property.prototype.withRange = function (t) {
        this._nodeRange = t;
        return this;
    };
    Property.prototype.getTraits = function () {
        return this._traits;
    };
    Property.prototype.keyPrefix = function () {
        return this._keyShouldStartFrom;
    };
    Property.prototype.matchKey = function (k) {
        if (k == null) {
            return false;
        }
        if (this._groupName != null) {
            return this._groupName == k;
        }
        else {
            if (this._keyShouldStartFrom != null) {
                if (k.indexOf(this._keyShouldStartFrom) == 0) {
                    return true;
                }
            }
            if (this._enumOptions) {
                if (this._enumOptions.indexOf(k) != -1) {
                    return true;
                }
            }
            return false;
        }
    };
    Property.prototype.withMultiValue = function (v) {
        if (v === void 0) { v = true; }
        this._isMultiValue = v;
        return this;
    };
    Property.prototype.withFromParentValue = function (v) {
        if (v === void 0) { v = true; }
        this._isFromParentValue = v;
        return this;
    };
    Property.prototype.withFromParentKey = function (v) {
        if (v === void 0) { v = true; }
        this._isFromParentKey = v;
        return this;
    };
    Property.prototype.isFromParentKey = function () {
        return this._isFromParentKey;
    };
    Property.prototype.isFromParentValue = function () {
        return this._isFromParentValue;
    };
    Property.prototype.withGroupName = function (gname) {
        this._groupName = gname;
        return this;
    };
    Property.prototype.withRequired = function (req) {
        this._isRequired = req;
        return this;
    };
    Property.prototype.unmerge = function () {
        this._groupName = this.name();
        return this;
    };
    Property.prototype.merge = function () {
        this._groupName = null;
        return this;
    };
    Property.prototype.withKey = function (isKey) {
        this._key = isKey;
        return this;
    };
    Property.prototype.withKeyRestriction = function (keyShouldStartFrom) {
        this._keyShouldStartFrom = keyShouldStartFrom;
        return this;
    };
    Property.prototype.domain = function () {
        return this._ownerClass;
    };
    Property.prototype.range = function () {
        return this._nodeRange;
    };
    Property.prototype.isKey = function () {
        return this._key;
    };
    Property.prototype.isValueProperty = function () {
        return this._nodeRange.isValueType();
    };
    Property.prototype.isRequired = function () {
        return this._isRequired;
    };
    Property.prototype.isMultiValue = function () {
        return this._isMultiValue;
    };
    Property.prototype.isMerged = function () {
        return this._groupName == null;
    };
    Property.prototype.isPrimitive = function () {
        var name = this._nodeRange.name();
        return name == 'StringType' || name == 'NumberType' || name == 'BooleanType';
    };
    Property.prototype.groupName = function () {
        return this._groupName;
    };
    return Property;
})(Described);
exports.Property = Property;
//# sourceMappingURL=definitionSystem.js.map