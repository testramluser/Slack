var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BasicMatcher = (function () {
    function BasicMatcher() {
    }
    BasicMatcher.prototype.match = function (node) {
        throw new Error();
    };
    BasicMatcher.prototype.nodeType = function () {
        throw new Error();
    };
    BasicMatcher.prototype.doMatch = function (n) {
        if (this.nodeType() == n.type) {
            return this.match(n);
        }
    };
    return BasicMatcher;
})();
var CallExpressionMatcher = (function (_super) {
    __extends(CallExpressionMatcher, _super);
    function CallExpressionMatcher(calleeMatcher, tr) {
        _super.call(this);
        this.calleeMatcher = calleeMatcher;
        this.tr = tr;
    }
    CallExpressionMatcher.prototype.match = function (node) {
        if (this.calleeMatcher.doMatch(node.callee)) {
            return this.tr(node);
        }
        return null;
    };
    CallExpressionMatcher.prototype.nodeType = function () {
        return "CallExpression";
    };
    return CallExpressionMatcher;
})(BasicMatcher);
var ExpressionStatementMatcher = (function (_super) {
    __extends(ExpressionStatementMatcher, _super);
    function ExpressionStatementMatcher(expression, tr) {
        _super.call(this);
        this.expression = expression;
        this.tr = tr;
    }
    ExpressionStatementMatcher.prototype.match = function (node) {
        var exp = this.expression.doMatch(node.expression);
        if (exp) {
            var v = this.tr(node.expression);
            if (v == true) {
                return exp;
            }
            return v;
        }
        return null;
    };
    ExpressionStatementMatcher.prototype.nodeType = function () {
        return "ExpressionStatement";
    };
    return ExpressionStatementMatcher;
})(BasicMatcher);
var AssignmentExpressionMatcher = (function (_super) {
    __extends(AssignmentExpressionMatcher, _super);
    function AssignmentExpressionMatcher(left, right, tr) {
        _super.call(this);
        this.left = left;
        this.right = right;
        this.tr = tr;
    }
    AssignmentExpressionMatcher.prototype.match = function (node) {
        if (this.left.doMatch(node.left) && this.right.doMatch(node.right)) {
            return this.tr(node);
        }
        return null;
    };
    AssignmentExpressionMatcher.prototype.nodeType = function () {
        return "AssignmentExpression";
    };
    return AssignmentExpressionMatcher;
})(BasicMatcher);
var SequenceExpressionMatch = (function (_super) {
    __extends(SequenceExpressionMatch, _super);
    function SequenceExpressionMatch() {
        _super.apply(this, arguments);
    }
    SequenceExpressionMatch.prototype.match = function (node) {
        return node;
    };
    SequenceExpressionMatch.prototype.nodeType = function () {
        return "SequenceExpression";
    };
    return SequenceExpressionMatch;
})(BasicMatcher);
var SimpleIdentMatcher = (function (_super) {
    __extends(SimpleIdentMatcher, _super);
    function SimpleIdentMatcher(val) {
        _super.call(this);
        this.val = val;
    }
    SimpleIdentMatcher.prototype.match = function (node) {
        if (node.name == this.val) {
            return true;
        }
        return null;
    };
    SimpleIdentMatcher.prototype.nodeType = function () {
        return "Identifier";
    };
    return SimpleIdentMatcher;
})(BasicMatcher);
var MemberExpressionMatcher = (function (_super) {
    __extends(MemberExpressionMatcher, _super);
    function MemberExpressionMatcher(objectMatcher, propertyMatcher, tr) {
        _super.call(this);
        this.objectMatcher = objectMatcher;
        this.propertyMatcher = propertyMatcher;
        this.tr = tr;
    }
    MemberExpressionMatcher.prototype.match = function (node) {
        if (this.objectMatcher.doMatch(node.object) && this.propertyMatcher.doMatch(node.property)) {
            return this.tr(node);
        }
        return null;
    };
    MemberExpressionMatcher.prototype.nodeType = function () {
        return "MemberExpression";
    };
    return MemberExpressionMatcher;
})(BasicMatcher);
var PathNode = (function () {
    function PathNode(name) {
        this.arguments = null;
        this.name = name;
    }
    return PathNode;
})();
var TrueMatcher = (function () {
    function TrueMatcher() {
    }
    TrueMatcher.prototype.doMatch = function (node) {
        return true;
    };
    TrueMatcher.prototype.nodeType = function () {
        return null;
    };
    return TrueMatcher;
})();
var Matchers;
(function (Matchers) {
    var CallPath = (function () {
        function CallPath(base) {
            this.isGeneralCall = false;
            this.path = [];
            this.base = base;
        }
        CallPath.prototype.toString = function () {
            return this.path.map(function (x) { return x.name; }).join(".");
        };
        return CallPath;
    })();
    Matchers.CallPath = CallPath;
    var CallBaseMatcher = (function () {
        function CallBaseMatcher(rootMatcher) {
            this.rootMatcher = rootMatcher;
        }
        CallBaseMatcher.prototype.doMatch = function (node) {
            var original = node;
            if (node.type == "CallExpression") {
                var call = node;
                var res = this.doMatch(call.callee);
                if (res) {
                    if (res.path.length > 0 && res.path[res.path.length - 1].arguments == null) {
                        res.path[res.path.length - 1].arguments = call.arguments;
                        return res;
                    }
                    if (res.path.length == 0 && call.arguments.length > 0) {
                        if (call.arguments[0].type == "Literal") {
                            var l = call.arguments[0];
                            var url = l.value;
                            if (url.indexOf('/') == 0) {
                                url = url.substring(1);
                            }
                            var uriPath = url.toString().split("/");
                            uriPath.forEach(function (x) { return res.path.push(new PathNode(x)); });
                            res.isGeneralCall = true;
                            return res;
                        }
                    }
                    return null;
                }
            }
            else if (node.type == "MemberExpression") {
                var me = node;
                var v = this.doMatch(me.object);
                if (v) {
                    if (me.property.type == "Identifier") {
                        v.path.push(new PathNode(me.property.name));
                        return v;
                    }
                    else if (me.property.type == 'Literal') {
                        v.path.push(new PathNode(me.property['value'].toString()));
                        return v;
                    }
                    return null;
                }
            }
            else if (node.type == "Identifier") {
                var id = node;
                if (this.rootMatcher.doMatch(id)) {
                    return new Matchers.CallPath(id.name);
                }
            }
            return null;
        };
        CallBaseMatcher.prototype.nodeType = function () {
            return null;
        };
        return CallBaseMatcher;
    })();
    Matchers.CallBaseMatcher = CallBaseMatcher;
    function call(calleeMatcher, tr) {
        if (tr === void 0) { tr = function (x) { return true; }; }
        return new CallExpressionMatcher(calleeMatcher, tr);
    }
    Matchers.call = call;
    function ident(name) {
        return new SimpleIdentMatcher(name);
    }
    Matchers.ident = ident;
    function member(objMatcher, propMatcher, tr) {
        if (tr === void 0) { tr = function (x) { return true; }; }
        return new MemberExpressionMatcher(objMatcher, propMatcher, tr);
    }
    Matchers.member = member;
    function memberFromString(objMatcher, propMatcher, tr) {
        if (tr === void 0) { tr = function (x) { return true; }; }
        return new MemberExpressionMatcher(ident(objMatcher), ident(propMatcher), tr);
    }
    Matchers.memberFromString = memberFromString;
    function anyNode() {
        return new TrueMatcher();
    }
    Matchers.anyNode = anyNode;
    function exprStmt(eM, tr) {
        if (tr === void 0) { tr = function (x) { return true; }; }
        return new ExpressionStatementMatcher(eM, tr);
    }
    Matchers.exprStmt = exprStmt;
    function assign(left, right, tr) {
        if (tr === void 0) { tr = function (x) { return true; }; }
        return new AssignmentExpressionMatcher(left, right, tr);
    }
    Matchers.assign = assign;
    function sequence() {
        return new SequenceExpressionMatch();
    }
    Matchers.sequence = sequence;
    function memberFromExp(objMatcher, tr) {
        if (tr === void 0) { tr = function (x) { return true; }; }
        var array = objMatcher.split(".");
        var result = null;
        for (var a = 0; a < array.length; a++) {
            var arg = array[a];
            var ci = arg.indexOf("(*)");
            var isCall = false;
            if (ci != -1) {
                arg = arg.substr(0, ci);
                isCall = true;
            }
            if (result == null) {
                result = arg == '*' ? anyNode() : ident(arg);
            }
            else {
                result = new MemberExpressionMatcher(result, arg == '*' ? anyNode() : ident(arg), tr);
            }
            if (isCall) {
                result = new CallExpressionMatcher(result, tr);
            }
        }
        return result;
    }
    Matchers.memberFromExp = memberFromExp;
})(Matchers || (Matchers = {}));
module.exports = Matchers;
//# sourceMappingURL=jsAstMatchers.js.map