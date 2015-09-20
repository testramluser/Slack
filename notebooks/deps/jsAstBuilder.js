var ASTBuilder;
(function (ASTBuilder) {
    function varDecl(left, right) {
        var decl = {
            declarations: [{
                id: left,
                init: right,
                type: "VariableDeclarator"
            }],
            kind: "var",
            type: "VariableDeclaration"
        };
        return decl;
    }
    ASTBuilder.varDecl = varDecl;
    function block(arr) {
        var block = {
            body: arr,
            type: "BlockStatement"
        };
        return block;
    }
    ASTBuilder.block = block;
    function ident(left) {
        var decl = {
            name: left,
            type: "Identifier"
        };
        return decl;
    }
    ASTBuilder.ident = ident;
    function assignExpr(left, right, operator) {
        var assignExpr = {
            left: left,
            right: right,
            operator: operator,
            type: "AssignmentExpression"
        };
        return assignExpr;
    }
    ASTBuilder.assignExpr = assignExpr;
    function literal(left) {
        var decl = {
            value: left,
            type: "Literal"
        };
        return decl;
    }
    ASTBuilder.literal = literal;
    function unary(operator, e) {
        var decl = {
            operator: operator,
            prefix: true,
            argument: e,
            type: "UnaryExpression"
        };
        return decl;
    }
    ASTBuilder.unary = unary;
    function number(left) {
        var decl = {
            value: left,
            type: "Literal"
        };
        return decl;
    }
    ASTBuilder.number = number;
    function member(left, right) {
        var decl = {
            object: left,
            computed: false,
            property: ident(right),
            type: "MemberExpression"
        };
        return decl;
    }
    ASTBuilder.member = member;
    function memberExp(left, right) {
        var decl = {
            object: left,
            computed: false,
            property: right,
            type: "MemberExpression"
        };
        return decl;
    }
    ASTBuilder.memberExp = memberExp;
    function property(property, value) {
        var decl = {
            key: ident(property),
            computed: false,
            value: value,
            kind: "init",
            type: "Property"
        };
        return decl;
    }
    ASTBuilder.property = property;
    function remapProperty(prefix, value) {
        if (value.key.type == "Identifier") {
            var decl = {
                key: ident(prefix + value.key.name),
                computed: false,
                value: value.value,
                kind: "init",
                type: "Property"
            };
            return decl;
        }
        else {
            var decl = {
                key: literal(prefix + value.key.value),
                computed: false,
                value: value.value,
                kind: "init",
                type: "Property"
            };
            return decl;
        }
    }
    ASTBuilder.remapProperty = remapProperty;
    function object() {
        var decl = {
            properties: [],
            type: "ObjectExpression"
        };
        return decl;
    }
    ASTBuilder.object = object;
    function call(base, args) {
        var decl = {
            callee: base,
            arguments: args,
            type: "CallExpression"
        };
        return decl;
    }
    ASTBuilder.call = call;
    function exprStmt(base) {
        var decl = {
            expression: base,
            type: "ExpressionStatement"
        };
        return decl;
    }
    ASTBuilder.exprStmt = exprStmt;
})(ASTBuilder || (ASTBuilder = {}));
module.exports = ASTBuilder;
//# sourceMappingURL=jsAstBuilder.js.map