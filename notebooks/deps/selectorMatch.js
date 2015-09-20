var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require("underscore");
var sel = require('./ramlselector');
var Selector = (function () {
    function Selector() {
    }
    Selector.prototype.candidates = function (context) {
        return context;
    };
    Selector.prototype.apply = function (h) {
        return this.candidates([h]);
    };
    return Selector;
})();
exports.Selector = Selector;
var OrMatch = (function (_super) {
    __extends(OrMatch, _super);
    function OrMatch(left, right) {
        _super.call(this);
        this.left = left;
        this.right = right;
    }
    OrMatch.prototype.candidates = function (context) {
        var l = this.left.candidates(context);
        l = l.concat(this.right.candidates(context));
        return _.unique(l);
    };
    return OrMatch;
})(Selector);
exports.OrMatch = OrMatch;
var DotMatch = (function (_super) {
    __extends(DotMatch, _super);
    function DotMatch(left, right) {
        _super.call(this);
        this.left = left;
        this.right = right;
    }
    DotMatch.prototype.candidates = function (context) {
        var l = this.left.candidates(context);
        if (this.left instanceof AnyParentMatch) {
            l = this.right.candidates(new AnyChildMatch().candidates(l));
            return _.unique(l);
        }
        if (this.left instanceof ParentMatch) {
            l = this.right.candidates(new AnyChildMatch().candidates(l));
            return _.unique(l);
        }
        l = this.right.candidates(l);
        return _.unique(l);
    };
    return DotMatch;
})(Selector);
exports.DotMatch = DotMatch;
function resolveSelector(s, n) {
    if (s.type == "or") {
        var b = s;
        var l = resolveSelector(b.left, n);
        var r = resolveSelector(b.right, n);
        return new OrMatch(l, r);
    }
    if (s.type == "dot") {
        var b = s;
        var l = resolveSelector(b.left, n);
        var r = resolveSelector(b.right, n);
        return new DotMatch(l, r);
    }
    if (s.type == 'classLiteral') {
        var literal = s;
        var tp = n.definition().universe().getType(literal.name);
        if (tp == null || tp.isValueType()) {
            throw new Error("Referencing unknown type:" + literal.name);
        }
        return new IdMatch(literal.name);
    }
    if (s.type == 'parent') {
        return new ParentMatch();
    }
    if (s.type == 'ancestor') {
        return new AnyParentMatch();
    }
    if (s.type == 'descendant') {
        return new AnyChildMatch();
    }
    if (s.type == 'child') {
        return new ChildMatch();
    }
}
exports.resolveSelector = resolveSelector;
var IdMatch = (function (_super) {
    __extends(IdMatch, _super);
    function IdMatch(name) {
        _super.call(this);
        this.name = name;
    }
    IdMatch.prototype.candidates = function (context) {
        var _this = this;
        return context.filter(function (x) {
            if (!x) {
                return false;
            }
            if (x.definition().name() == _this.name) {
                return true;
            }
            var superTypes = x.definition().allSuperTypes();
            if (_.find(superTypes, function (x) { return x.name() == _this.name; })) {
                return true;
            }
            return false;
        });
    };
    return IdMatch;
})(Selector);
exports.IdMatch = IdMatch;
var AnyParentMatch = (function (_super) {
    __extends(AnyParentMatch, _super);
    function AnyParentMatch() {
        _super.apply(this, arguments);
    }
    AnyParentMatch.prototype.candidates = function (context) {
        var res = [];
        context.forEach(function (x) {
            if (x) {
                var z = x.parent();
                while (z) {
                    res.push(z);
                    z = z.parent();
                }
            }
        });
        return _.unique(res);
    };
    return AnyParentMatch;
})(Selector);
exports.AnyParentMatch = AnyParentMatch;
function addChildren(x, r) {
    r.push(x);
    x.elements().forEach(function (y) { return addChildren(y, r); });
}
var AnyChildMatch = (function (_super) {
    __extends(AnyChildMatch, _super);
    function AnyChildMatch() {
        _super.apply(this, arguments);
    }
    AnyChildMatch.prototype.candidates = function (context) {
        var res = [];
        context.forEach(function (x) {
            if (x) {
                addChildren(x, res);
            }
        });
        return _.unique(res);
    };
    return AnyChildMatch;
})(Selector);
exports.AnyChildMatch = AnyChildMatch;
var ParentMatch = (function (_super) {
    __extends(ParentMatch, _super);
    function ParentMatch() {
        _super.apply(this, arguments);
    }
    ParentMatch.prototype.candidates = function (context) {
        return context.map(function (x) { return x.parent(); });
    };
    return ParentMatch;
})(Selector);
exports.ParentMatch = ParentMatch;
var ChildMatch = (function (_super) {
    __extends(ChildMatch, _super);
    function ChildMatch() {
        _super.apply(this, arguments);
    }
    ChildMatch.prototype.candidates = function (context) {
        var res = [];
        context.forEach(function (x) {
            if (x) {
                res = res.concat(x.elements());
            }
        });
        return res;
    };
    return ChildMatch;
})(Selector);
exports.ChildMatch = ChildMatch;
function parse(h, path) {
    return resolveSelector(sel.parse(path), h);
}
exports.parse = parse;
//# sourceMappingURL=selectorMatch.js.map