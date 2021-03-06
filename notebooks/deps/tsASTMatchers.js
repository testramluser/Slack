var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ts = require('typescript');
var Matching;
(function (Matching) {
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
            if (!n) {
                return null;
            }
            if (this.nodeType() == n.kind) {
                return this.match(n);
            }
        };
        return BasicMatcher;
    })();
    var ClassDeclarationMatcher = (function (_super) {
        __extends(ClassDeclarationMatcher, _super);
        function ClassDeclarationMatcher() {
            _super.call(this);
        }
        ClassDeclarationMatcher.prototype.match = function (node) {
            return node;
        };
        ClassDeclarationMatcher.prototype.nodeType = function () {
            return ts.SyntaxKind.ClassDeclaration;
        };
        return ClassDeclarationMatcher;
    })(BasicMatcher);
    var FieldMatcher = (function (_super) {
        __extends(FieldMatcher, _super);
        function FieldMatcher() {
            _super.apply(this, arguments);
        }
        FieldMatcher.prototype.match = function (node) {
            return node;
        };
        FieldMatcher.prototype.nodeType = function () {
            return ts.SyntaxKind.Property;
        };
        return FieldMatcher;
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
            if (node.operator == ts.SyntaxKind.EqualsToken) {
                if (this.left.doMatch(node.left) && this.right.doMatch(node.right)) {
                    return this.tr(node);
                }
            }
            return null;
        };
        AssignmentExpressionMatcher.prototype.nodeType = function () {
            return ts.SyntaxKind.BinaryExpression;
        };
        return AssignmentExpressionMatcher;
    })(BasicMatcher);
    var VariableDeclarationMatcher = (function (_super) {
        __extends(VariableDeclarationMatcher, _super);
        function VariableDeclarationMatcher(left, right, tr) {
            _super.call(this);
            this.left = left;
            this.right = right;
            this.tr = tr;
        }
        VariableDeclarationMatcher.prototype.match = function (node) {
            if (this.left.doMatch(node.name) && this.right.doMatch(node.initializer)) {
                return this.tr(node);
            }
        };
        VariableDeclarationMatcher.prototype.nodeType = function () {
            return ts.SyntaxKind.VariableDeclaration;
        };
        return VariableDeclarationMatcher;
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
            return ts.SyntaxKind.ExpressionStatement;
        };
        return ExpressionStatementMatcher;
    })(BasicMatcher);
    var SimpleIdentMatcher = (function (_super) {
        __extends(SimpleIdentMatcher, _super);
        function SimpleIdentMatcher(val) {
            _super.call(this);
            this.val = val;
        }
        SimpleIdentMatcher.prototype.match = function (node) {
            if (node.text == this.val) {
                return true;
            }
            return null;
        };
        SimpleIdentMatcher.prototype.nodeType = function () {
            return ts.SyntaxKind.Identifier;
        };
        return SimpleIdentMatcher;
    })(BasicMatcher);
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
    var CallExpressionMatcher = (function (_super) {
        __extends(CallExpressionMatcher, _super);
        function CallExpressionMatcher(calleeMatcher, tr) {
            _super.call(this);
            this.calleeMatcher = calleeMatcher;
            this.tr = tr;
        }
        CallExpressionMatcher.prototype.match = function (node) {
            if (this.calleeMatcher.doMatch(node.expression)) {
                return this.tr(node);
            }
            return null;
        };
        CallExpressionMatcher.prototype.nodeType = function () {
            return ts.SyntaxKind.CallExpression;
        };
        return CallExpressionMatcher;
    })(BasicMatcher);
    Matching.SKIP = {};
    function visit(n, cb) {
        var r0 = cb(n);
        if (r0) {
            if (r0 == Matching.SKIP) {
                return null;
            }
            return r0;
        }
        var r = ts.forEachChild(n, function (x) {
            var r = visit(x, cb);
            if (r) {
                return r;
            }
        });
        return r;
    }
    Matching.visit = visit;
    var PathNode = (function () {
        function PathNode(name, _base) {
            this._base = _base;
            this.arguments = null;
            this.name = name;
        }
        return PathNode;
    })();
    var CallPath = (function () {
        function CallPath(base, _baseNode) {
            this._baseNode = _baseNode;
            this.path = [];
            this.base = base;
        }
        CallPath.prototype.start = function () {
            return this._baseNode.pos;
        };
        CallPath.prototype.startLocation = function () {
            return this._baseNode.getSourceFile().getLineAndCharacterFromPosition(this.start());
        };
        CallPath.prototype.endLocation = function () {
            return this._baseNode.getSourceFile().getLineAndCharacterFromPosition(this.end());
        };
        CallPath.prototype.end = function () {
            var ce = this.path[this.path.length - 1]._callExpression;
            if (ce) {
                return ce.end;
            }
            return this.start();
        };
        CallPath.prototype.toString = function () {
            return this.path.map(function (x) { return x.name; }).join(".");
        };
        return CallPath;
    })();
    Matching.CallPath = CallPath;
    var MemberExpressionMatcher = (function (_super) {
        __extends(MemberExpressionMatcher, _super);
        function MemberExpressionMatcher(objectMatcher, propertyMatcher, tr) {
            _super.call(this);
            this.objectMatcher = objectMatcher;
            this.propertyMatcher = propertyMatcher;
            this.tr = tr;
        }
        MemberExpressionMatcher.prototype.match = function (node) {
            if (this.objectMatcher.doMatch(node.expression) && this.propertyMatcher.doMatch(node.name)) {
                return this.tr(node);
            }
            return null;
        };
        MemberExpressionMatcher.prototype.nodeType = function () {
            return ts.SyntaxKind.PropertyAccessExpression;
        };
        return MemberExpressionMatcher;
    })(BasicMatcher);
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
    Matching.memberFromExp = memberFromExp;
    var CallBaseMatcher = (function () {
        function CallBaseMatcher(rootMatcher) {
            this.rootMatcher = rootMatcher;
        }
        CallBaseMatcher.prototype.doMatch = function (node) {
            var original = node;
            if (node.kind == ts.SyntaxKind.CallExpression) {
                var call = node;
                var res = this.doMatch(call.expression);
                if (res) {
                    if (res.path.length > 0 && res.path[res.path.length - 1].arguments == null) {
                        res.path[res.path.length - 1].arguments = call.arguments;
                        res.path[res.path.length - 1]._callExpression = call;
                        return res;
                    }
                    return null;
                }
            }
            else if (node.kind == ts.SyntaxKind.PropertyAccessExpression) {
                var me = node;
                var v = this.doMatch(me.expression);
                if (v) {
                    if (me.name.kind == ts.SyntaxKind.Identifier) {
                        v.path.push(new PathNode(me.name.text, me.name));
                        return v;
                    }
                    return null;
                }
            }
            else if (node.kind == ts.SyntaxKind.Identifier) {
                var id = node;
                if (this.rootMatcher.doMatch(id)) {
                    return new CallPath(id.text, id);
                }
            }
            return null;
        };
        CallBaseMatcher.prototype.nodeType = function () {
            return null;
        };
        return CallBaseMatcher;
    })();
    Matching.CallBaseMatcher = CallBaseMatcher;
    function ident(name) {
        return new SimpleIdentMatcher(name);
    }
    Matching.ident = ident;
    function anyNode() {
        return new TrueMatcher();
    }
    Matching.anyNode = anyNode;
    function call(calleeMatcher, tr) {
        if (tr === void 0) { tr = function (x) { return true; }; }
        return new CallExpressionMatcher(calleeMatcher, tr);
    }
    Matching.call = call;
    function exprStmt(eM, tr) {
        if (tr === void 0) { tr = function (x) { return true; }; }
        return new ExpressionStatementMatcher(eM, tr);
    }
    Matching.exprStmt = exprStmt;
    function assign(left, right, tr) {
        if (tr === void 0) { tr = function (x) { return true; }; }
        return new AssignmentExpressionMatcher(left, right, tr);
    }
    Matching.assign = assign;
    function varDecl(left, right, tr) {
        if (tr === void 0) { tr = function (x) { return true; }; }
        return new VariableDeclarationMatcher(left, right, tr);
    }
    Matching.varDecl = varDecl;
    function field() {
        return new FieldMatcher();
    }
    Matching.field = field;
    function classDeclaration() {
        return new ClassDeclarationMatcher();
    }
    Matching.classDeclaration = classDeclaration;
})(Matching = exports.Matching || (exports.Matching = {}));
//# sourceMappingURL=tsASTMatchers.js.map