/// <reference path="./typings/tsd.d.ts" />

import esprima = require("esprima");
type Node=esprima.Syntax.Node;
type Expression=esprima.Syntax.Expression;
type CallExpression=esprima.Syntax.CallExpression;
type MemberExpression=esprima.Syntax.MemberExpression;
type Identifier=esprima.Syntax.Identifier;
type ExpressionStatement=esprima.Syntax.ExpressionStatement;
type AssignmentExpression=esprima.Syntax.AssignmentExpression;
type SequenceExpression=esprima.Syntax.SequenceExpression;
type VariableDeclaration=esprima.Syntax.VariableDeclaration;
type Literal=esprima.Syntax.Literal;
type ObjectExpression=esprima.Syntax.ObjectExpression;
type Property=esprima.Syntax.Property;
module ASTBuilder {

    export function varDecl(left:Identifier, right:Expression):VariableDeclaration {
        var decl:esprima.Syntax.VariableDeclaration = {
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

    export function block(arr:esprima.Syntax.Statement[]):esprima.Syntax.BlockStatement {
        var block:esprima.Syntax.BlockStatement = {
            body: arr,
            type: "BlockStatement"
        };
        return block;
    }

    export function ident(left:string):Identifier {
        var decl:Identifier = {
            name: left,
            type: "Identifier"
        };
        return decl;
    }

    export function assignExpr(left:Expression,right:Expression,operator:string):AssignmentExpression {
        var assignExpr:AssignmentExpression = {
            left: left,
            right: right,
            operator: operator,
            type: "AssignmentExpression"
        };
        return assignExpr;
    }

    export function literal(left:string|number|boolean):Literal {
        var decl:Literal = {
            value: left,
            type: "Literal"
        };
        return decl;
    }
    export function unary(operator:string,e:Expression):esprima.Syntax.UnaryExpression {
        var decl:esprima.Syntax.UnaryExpression = {
            operator: operator,
            prefix:true,
            argument:e,
            type: "UnaryExpression"
        };
        return decl;
    }
    export function number(left:string):Literal {
        var decl:Literal = {
            value: left,
            type: "Literal"
        };
        return decl;
    }

    export function member(left:Expression, right:string):MemberExpression {
        var decl:MemberExpression = {
            object: left,
            computed: false,
            property: ident(right),
            type: "MemberExpression"
        };
        return decl;
    }

    export function memberExp(left:Expression, right:Expression):MemberExpression {
        var decl:MemberExpression = {
            object: left,
            computed: false,
            property: <esprima.Syntax.IdentifierOrExpression>right,
            type: "MemberExpression"
        };
        return decl;
    }

    export function property(property:string, value:Expression):Property {
        var decl:Property = {
            key: <esprima.Syntax.LiteralOrIdentifier>ident(property),
            computed: false,
            value: value,
            kind: "init",
            type: "Property"
        };
        return decl;
    }

    export function remapProperty(prefix:string, value:Property):Property {
        if (value.key.type == "Identifier") {
            var decl:Property = {
                key: <esprima.Syntax.LiteralOrIdentifier>ident(prefix + (<Identifier>value.key).name),
                computed: false,
                value: value.value,
                kind: "init",
                type: "Property"
            };
            return decl;
        }
        else {
            var decl:Property = {
                key: <esprima.Syntax.LiteralOrIdentifier>literal(prefix + (<Literal>value.key).value),
                computed: false,
                value: value.value,
                kind: "init",
                type: "Property"
            };
            return decl;
        }
    }

    export function object():ObjectExpression {
        var decl:ObjectExpression = {
            properties: [],
            type: "ObjectExpression"
        };
        return decl;
    }

    export function call(base:Expression, args:Expression[]):CallExpression {
        var decl:CallExpression = {
            callee: base,
            arguments: args,
            type: "CallExpression"
        };
        return decl;
    }

    export function exprStmt(base:Expression):ExpressionStatement {
        var decl:ExpressionStatement = {
            expression: base,
            type: "ExpressionStatement"
        };
        return decl;
    }
}
export =ASTBuilder