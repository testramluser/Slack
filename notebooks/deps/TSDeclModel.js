var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var tsutil = require('./tsutil');
var _ = require("underscore");
var assert = require("assert");
var Opt = require('./Opt');
var TSModelElement = (function () {
    function TSModelElement(parent, config) {
        if (parent === void 0) { parent = exports.Universe; }
        this._parent = parent;
        this._config = config ? config : parent._config;
        this._children = [];
        assert(parent, "Should never be null");
        this._parent.addChild(this);
    }
    TSModelElement.prototype.patchParent = function (parent) {
        this._parent = parent;
    };
    TSModelElement.prototype.isEmpty = function () {
        return this._children.length == 0;
    };
    TSModelElement.prototype.parent = function () {
        return this._parent;
    };
    TSModelElement.prototype.children = function () {
        return this._children;
    };
    TSModelElement.prototype.root = function () {
        if (this._parent == exports.Universe) {
            return this;
        }
        return this._parent.root();
    };
    TSModelElement.prototype.removeChild = function (child) {
        if (child._parent == this) {
            this._children = this._children.filter(function (x) { return x != child; });
        }
        child._parent = exports.Universe;
    };
    TSModelElement.prototype.addChild = function (child) {
        if (child._parent) {
            child._parent.removeChild(child);
        }
        child._parent = this;
        this._children.push(child);
    };
    TSModelElement.prototype.serializeToString = function () {
        throw new Error("You should override serialize to string always");
    };
    return TSModelElement;
})();
exports.TSModelElement = TSModelElement;
var TSTypeDeclaration = (function (_super) {
    __extends(TSTypeDeclaration, _super);
    function TSTypeDeclaration(parent) {
        var _this = this;
        if (parent === void 0) { parent = null; }
        _super.call(this, parent);
        this.canBeOmmited = function () { return _this.locked ? false : _this.children().every(function (x) { return x.optional; }); };
        this.locked = false;
        this.extras = [""];
    }
    TSTypeDeclaration.prototype.addCode = function (code) {
        this.extras.push(code);
    };
    TSTypeDeclaration.prototype.toReference = function () {
        throw new Error("Implement in subclasses");
    };
    TSTypeDeclaration.prototype.hash = function () {
        return this.serializeToString();
    };
    TSTypeDeclaration.prototype.isFunctor = function () {
        return this.children().some(function (x) { return x.isAnonymousFunction(); });
    };
    TSTypeDeclaration.prototype.getFunctor = function () {
        return _.find(this.children(), function (x) { return x.isAnonymousFunction(); });
    };
    TSTypeDeclaration.prototype.visit = function (v) {
        if (v.startTypeDeclaration(this)) {
            this.children().forEach(function (x, i, arr) {
                x.visit(v);
                if (i != arr.length - 1)
                    v.betweenElements();
            });
            v.endTypeDeclaration(this);
        }
    };
    return TSTypeDeclaration;
})(TSModelElement);
exports.TSTypeDeclaration = TSTypeDeclaration;
var TSInterface = (function (_super) {
    __extends(TSInterface, _super);
    function TSInterface(p, name) {
        _super.call(this, p);
        this.extends = [];
        this.implements = [];
        this.name = name;
    }
    TSInterface.prototype.hash = function () {
        return this.children().filter(function (x) { return !x.isPrivate; }).map(function (x) { return "\n" + x.serializeToString() + "\n"; }).join('');
    };
    TSInterface.prototype.toReference = function () {
        return new TSDeclaredInterfaceReference(exports.Universe, this.name, this);
    };
    TSInterface.prototype.decl = function () {
        return "interface";
    };
    TSInterface.prototype.serializeToString = function () {
        var body = this.hash();
        return "export " + this.decl() + " " + this.name.concat(this.extendsString() + this.implementsString()) + "{" + this.extras.join("\n") + body + "}\n";
    };
    TSInterface.prototype.extendsString = function () {
        if (this.extends.length > 0) {
            return " extends " + this.extends.map(function (x) { return x.serializeToString(); }).join(",");
        }
        return "";
    };
    TSInterface.prototype.implementsString = function () {
        if (this.implements.length > 0) {
            return " implements " + this.implements.map(function (x) { return x.serializeToString(); }).join(",");
        }
        return "";
    };
    return TSInterface;
})(TSTypeDeclaration);
exports.TSInterface = TSInterface;
var TSClassDecl = (function (_super) {
    __extends(TSClassDecl, _super);
    function TSClassDecl() {
        _super.apply(this, arguments);
    }
    TSClassDecl.prototype.decl = function () {
        return "class";
    };
    return TSClassDecl;
})(TSInterface);
exports.TSClassDecl = TSClassDecl;
var TSTypeAssertion = (function (_super) {
    __extends(TSTypeAssertion, _super);
    function TSTypeAssertion(p, name, ref) {
        _super.call(this, p);
        this.name = name;
        this.ref = ref;
    }
    TSTypeAssertion.prototype.toReference = function () {
        return new TSSimpleTypeReference(exports.Universe, this.name);
    };
    TSTypeAssertion.prototype.serializeToString = function () {
        return "export type " + this.name + "=" + this.ref.serializeToString() + "\n";
    };
    return TSTypeAssertion;
})(TSTypeDeclaration);
exports.TSTypeAssertion = TSTypeAssertion;
var TSUniverse = (function (_super) {
    __extends(TSUniverse, _super);
    function TSUniverse() {
        _super.call(this, this);
    }
    TSUniverse.prototype.addChild = function (child) {
    };
    TSUniverse.prototype.setConfig = function (cfg) {
        this._config = cfg;
    };
    TSUniverse.prototype.getConfig = function () {
        return this._config;
    };
    return TSUniverse;
})(TSModelElement);
exports.TSUniverse = TSUniverse;
exports.Universe = new TSUniverse();
var TSAPIModule = (function (_super) {
    __extends(TSAPIModule, _super);
    function TSAPIModule() {
        _super.apply(this, arguments);
    }
    TSAPIModule.prototype.getInterface = function (nm) {
        return new Opt(_.find(this.children(), function (x) { return x.name == nm; }));
    };
    TSAPIModule.prototype.serializeToString = function () {
        var typeMap = {};
        this.children().forEach(function (x) { return typeMap[x.name] = x; });
        var covered = {};
        var sorted = [];
        var append = function (t) {
            if (covered[t.name]) {
                return;
            }
            covered[t.name] = true;
            var refs = t.extends;
            refs.forEach(function (ref) {
                if (ref instanceof TSSimpleTypeReference) {
                    var name = ref.name;
                    var st = typeMap[name];
                    if (st) {
                        append(st);
                    }
                }
            });
            sorted.push(t);
        };
        this.children().forEach(function (x) { return append(x); });
        return sorted.map(function (x) { return x.serializeToString(); }).join("\n");
    };
    return TSAPIModule;
})(TSModelElement);
exports.TSAPIModule = TSAPIModule;
var TSMember = (function (_super) {
    __extends(TSMember, _super);
    function TSMember() {
        _super.apply(this, arguments);
    }
    return TSMember;
})(TSModelElement);
exports.TSMember = TSMember;
var TSUnionTypeReference = (function (_super) {
    __extends(TSUnionTypeReference, _super);
    function TSUnionTypeReference() {
        _super.apply(this, arguments);
    }
    TSUnionTypeReference.prototype.getFunctor = function () {
        return null;
    };
    TSUnionTypeReference.prototype.union = function (q) {
        var r = new TSUnionTypeReference();
        this.children().forEach(function (x) { return r.addChild(x); });
        r.addChild(q);
        return r;
    };
    TSUnionTypeReference.prototype.isFunctor = function () {
        return false;
    };
    TSUnionTypeReference.prototype.canBeOmmited = function () {
        return false;
    };
    TSUnionTypeReference.prototype.serializeToString = function () {
        var str = this.children().map(function (x) { return x.serializeToString(); }).join(" | ");
        if (this.array) {
            if (this.children().length > 1) {
                return '(' + str + ')[]';
            }
            else {
                return str + '[]';
            }
        }
        else {
            return str;
        }
    };
    TSUnionTypeReference.prototype.removeChild = function (child) {
    };
    TSUnionTypeReference.prototype.addChild = function (child) {
        this.children().push(child);
    };
    TSUnionTypeReference.prototype.copy = function (parent) {
        var _this = this;
        var result = new TSUnionTypeReference();
        Object.keys(this).forEach(function (x) {
            if (x != 'parent') {
                result[x] = _this[x];
            }
        });
        return result;
    };
    return TSUnionTypeReference;
})(TSModelElement);
exports.TSUnionTypeReference = TSUnionTypeReference;
var TSSimpleTypeReference = (function (_super) {
    __extends(TSSimpleTypeReference, _super);
    function TSSimpleTypeReference(p, tn) {
        var _this = this;
        _super.call(this, p);
        this.array = false;
        this.genericStr = function () { return _this.typeParameters && _this.typeParameters.length > 0 ? '<' + _this.typeParameters.map(function (p) { return p.serializeToString(); }).join(',') + '>' : ''; };
        this.name = tn;
    }
    TSSimpleTypeReference.prototype.isEmpty = function () {
        return false;
    };
    TSSimpleTypeReference.prototype.getFunctor = function () {
        return null;
    };
    TSSimpleTypeReference.prototype.canBeOmmited = function () {
        return false;
    };
    TSSimpleTypeReference.prototype.isFunctor = function () {
        return false;
    };
    TSSimpleTypeReference.prototype.union = function (q) {
        var r = new TSUnionTypeReference();
        r.addChild(this);
        r.addChild(q);
        return r;
    };
    TSSimpleTypeReference.prototype.serializeToString = function () {
        return this.name + this.genericStr() + (this.array ? "[]" : "");
    };
    TSSimpleTypeReference.prototype.copy = function (parent) {
        var _this = this;
        var result = new TSSimpleTypeReference(parent, this.name);
        Object.keys(this).forEach(function (x) {
            if (x != 'parent') {
                result[x] = _this[x];
            }
        });
        return result;
    };
    return TSSimpleTypeReference;
})(TSModelElement);
exports.TSSimpleTypeReference = TSSimpleTypeReference;
var TSFunctionReference = (function (_super) {
    __extends(TSFunctionReference, _super);
    function TSFunctionReference(p) {
        var _this = this;
        _super.call(this, p);
        this.rangeType = new AnyType();
        this.parameters = [];
        this.array = false;
        this.paramStr = function (appendDefault) {
            if (appendDefault === void 0) { appendDefault = false; }
            return '(' + _this.parameters.filter(function (x) { return !x.isEmpty(); }).map(function (p) { return p.serializeToString(appendDefault); }).join(', ') + ')';
        };
    }
    TSFunctionReference.prototype.isEmpty = function () {
        return false;
    };
    TSFunctionReference.prototype.getFunctor = function () {
        return null;
    };
    TSFunctionReference.prototype.canBeOmmited = function () {
        return false;
    };
    TSFunctionReference.prototype.isFunctor = function () {
        return true;
    };
    TSFunctionReference.prototype.union = function (q) {
        var r = new TSUnionTypeReference();
        r.addChild(this);
        r.addChild(q);
        return r;
    };
    TSFunctionReference.prototype.serializeToString = function () {
        return this.paramStr() + '=>' + this.rangeType.serializeToString() + (this.array ? '[]' : '');
    };
    TSFunctionReference.prototype.copy = function (parent) {
        var _this = this;
        var result = new TSFunctionReference(parent);
        Object.keys(this).forEach(function (x) {
            if (x != 'parent') {
                result[x] = _this[x];
            }
        });
        return result;
    };
    return TSFunctionReference;
})(TSModelElement);
exports.TSFunctionReference = TSFunctionReference;
var TSDeclaredInterfaceReference = (function (_super) {
    __extends(TSDeclaredInterfaceReference, _super);
    function TSDeclaredInterfaceReference(p, tn, _data) {
        _super.call(this, p, tn);
        this._data = _data;
    }
    TSDeclaredInterfaceReference.prototype.isEmpty = function () {
        return false;
    };
    TSDeclaredInterfaceReference.prototype.getFunctor = function () {
        return null;
    };
    TSDeclaredInterfaceReference.prototype.canBeOmmited = function () {
        return false;
    };
    TSDeclaredInterfaceReference.prototype.getOriginal = function () {
        return this._data;
    };
    return TSDeclaredInterfaceReference;
})(TSSimpleTypeReference);
exports.TSDeclaredInterfaceReference = TSDeclaredInterfaceReference;
var AnyType = (function (_super) {
    __extends(AnyType, _super);
    function AnyType(nm) {
        if (nm === void 0) { nm = "any"; }
        _super.call(this, exports.Universe, nm);
    }
    AnyType.prototype.union = function (q) {
        return q;
    };
    return AnyType;
})(TSSimpleTypeReference);
exports.AnyType = AnyType;
var TSStructuralTypeReference = (function (_super) {
    __extends(TSStructuralTypeReference, _super);
    function TSStructuralTypeReference(parent) {
        var _this = this;
        if (parent === void 0) { parent = exports.Universe; }
        _super.call(this, parent);
        this.array = false;
        this.canBeOmmited = function () { return _this.locked ? false : _this.children().every(function (x) { return x.optional; }); };
    }
    TSStructuralTypeReference.prototype.visitReturnType = function (v) {
        this.visit(v);
    };
    TSStructuralTypeReference.prototype.toReference = function () {
        return this;
    };
    TSStructuralTypeReference.prototype.union = function (q) {
        var r = new TSUnionTypeReference();
        r.addChild(this);
        r.addChild(q);
        return r;
    };
    TSStructuralTypeReference.prototype.serializeToString = function () {
        var body = this.children().map(function (x) { return ("\n" + x.serializeToString() + "\n"); }).join('');
        return "{" + body + "}" + (this.array ? "[]" : "");
    };
    TSStructuralTypeReference.prototype.copy = function (parent) {
        var _this = this;
        var result = new TSStructuralTypeReference(parent);
        Object.keys(this).forEach(function (x) {
            if (x != 'parent') {
                result[x] = _this[x];
            }
        });
        return result;
    };
    return TSStructuralTypeReference;
})(TSTypeDeclaration);
exports.TSStructuralTypeReference = TSStructuralTypeReference;
(function (ParamLocation) {
    ParamLocation[ParamLocation["URI"] = 0] = "URI";
    ParamLocation[ParamLocation["BODY"] = 1] = "BODY";
    ParamLocation[ParamLocation["OPTIONS"] = 2] = "OPTIONS";
    ParamLocation[ParamLocation["OTHER"] = 3] = "OTHER";
})(exports.ParamLocation || (exports.ParamLocation = {}));
var ParamLocation = exports.ParamLocation;
var Param = (function (_super) {
    __extends(Param, _super);
    function Param(p, nm, location, tp, defaultValue) {
        if (tp === void 0) { tp = new TSSimpleTypeReference(exports.Universe, "string"); }
        _super.call(this, p);
        this.name = nm;
        this.ptype = tp;
        this.location = location;
        this.defaultValue = defaultValue;
    }
    Param.prototype.isEmpty = function () {
        return this.ptype.isEmpty();
    };
    Param.prototype.serializeToString = function (appendDefault) {
        if (appendDefault === void 0) { appendDefault = false; }
        return this.name + (this.optional || (this.defaultValue && !appendDefault) ? "?" : "") + (":" + this.ptype.serializeToString() + (this.ptype.canBeOmmited() ? "?" : "")) + (appendDefault && this.defaultValue ? '=' + JSON.stringify(this.defaultValue) : '');
    };
    return Param;
})(TSModelElement);
exports.Param = Param;
var StringValue = (function (_super) {
    __extends(StringValue, _super);
    function StringValue(_value) {
        _super.call(this);
        this._value = _value;
    }
    StringValue.prototype.value = function () {
        return this._value;
    };
    StringValue.prototype.serializeToString = function () {
        return "\"" + this._value + "\"";
    };
    return StringValue;
})(TSMember);
exports.StringValue = StringValue;
var ArrayValue = (function (_super) {
    __extends(ArrayValue, _super);
    function ArrayValue(_values) {
        _super.call(this);
        this._values = _values;
    }
    ArrayValue.prototype.value = function () {
        return this.serializeToString();
    };
    ArrayValue.prototype.serializeToString = function () {
        return "[ " + this._values.map(function (x) { return x.value(); }).join(', ') + " ]";
    };
    return ArrayValue;
})(TSMember);
exports.ArrayValue = ArrayValue;
var TSAPIElementDeclaration = (function (_super) {
    __extends(TSAPIElementDeclaration, _super);
    function TSAPIElementDeclaration(p, name) {
        var _this = this;
        _super.call(this, p);
        this.rangeType = new AnyType();
        this.value = null;
        this.paramStr = function (appendDefault) {
            if (appendDefault === void 0) { appendDefault = false; }
            return '( ' + _this.parameters.filter(function (x) { return !x.isEmpty(); }).map(function (p) { return _this.serializeParam(p, appendDefault); }).join(',') + ' )';
        };
        this.serializeParam = function (p, appendDefault) { return p.serializeToString(appendDefault); };
        this.isFunction = function () { return _this.parameters.length != 0 || _this.isFunc; };
        this.isAnonymousFunction = function () { return _this.isFunction() && _this.name === ''; };
        this.returnStr = function () { return _this.rangeType ? ':' + _this.rangeType.serializeToString() : ''; };
        this.name = name;
        this.parameters = [];
        this.rangeType = null;
        this.optional = false;
    }
    TSAPIElementDeclaration.prototype.visit = function (v) {
        if (v.startVisitElement(this)) {
            if (this.rangeType) {
                if (this.rangeType instanceof TSStructuralTypeReference) {
                    this.rangeType.visitReturnType(v);
                }
            }
            v.endVisitElement(this);
        }
    };
    TSAPIElementDeclaration.prototype.commentCode = function () {
        return "\n        /**\n         *\n         **/\n         //" + this.name + "\n         ";
    };
    TSAPIElementDeclaration.prototype.serializeToString = function () {
        var x = (this.isPrivate ? 'private ' : '') + this.escapeDot(this.name) + (this.optional ? "?" : "") + (this.isFunction() ? this.paramStr() : "") + this.returnStr();
        if (this.value) {
            x += '=' + this.value.value();
        }
        return this.commentCode() + x + (this.isFunction() && this.isInterfaceMethodWithBody() ? '' : this.body());
    };
    TSAPIElementDeclaration.prototype.body = function () {
        if (this._body == null)
            return "";
        return "{" + this._body + "}";
    };
    TSAPIElementDeclaration.prototype.escapeDot = function (name) {
        return tsutil.escapeTypescriptPropertyName(name);
    };
    TSAPIElementDeclaration.prototype.isInterfaceMethodWithBody = function () {
        return false;
    };
    return TSAPIElementDeclaration;
})(TSMember);
exports.TSAPIElementDeclaration = TSAPIElementDeclaration;
var TSConstructor = (function (_super) {
    __extends(TSConstructor, _super);
    function TSConstructor(p) {
        _super.call(this, p, 'constructor');
        this.serializeParam = function (p, appendDefault) { return 'protected ' + p.serializeToString(appendDefault); };
    }
    return TSConstructor;
})(TSAPIElementDeclaration);
exports.TSConstructor = TSConstructor;
//# sourceMappingURL=TSDeclModel.js.map