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

interface NodeMatcher {
    doMatch(node:Node):any
}
interface TypedMatcher<T extends Node> extends NodeMatcher {
    doMatch(node:Node):any

    nodeType():string;

}
interface Transformer<T,R> {
    (a:T):R
}

class BasicMatcher {

    protected match(node:esprima.Syntax.Node):any {
        throw new Error()
    }

    nodeType():string {
        throw new Error()
    }

    doMatch(n:Node):boolean {
        if (this.nodeType() == n.type) {
            return this.match(n);
        }
    }
}

class CallExpressionMatcher extends BasicMatcher implements TypedMatcher<CallExpression> {
    match(node:CallExpression):any {
        if (this.calleeMatcher.doMatch(node.callee)) {
            return this.tr(node);
        }
        return null;
    }

    constructor(private calleeMatcher:TypedMatcher<Expression>, private tr:Transformer<CallExpression,any>) {
        super()
    }

    nodeType():string {
        return "CallExpression";
    }
}
class ExpressionStatementMatcher extends BasicMatcher implements TypedMatcher<ExpressionStatement> {
    match(node:ExpressionStatement):any {
        var exp = this.expression.doMatch(node.expression);
        if (exp) {

            var v = this.tr(node.expression);

            if (v == true) {
                return exp;
            }
            return v;
        }
        return null;
    }

    constructor(private expression:TypedMatcher<Expression>, private tr:Transformer<Expression,any>) {
        super()
    }

    nodeType():string {
        return "ExpressionStatement";
    }
}
class AssignmentExpressionMatcher extends BasicMatcher implements TypedMatcher<AssignmentExpression> {
    match(node:AssignmentExpression):any {
        if (this.left.doMatch(node.left) && this.right.doMatch(node.right)) {
            return this.tr(node);
        }
        return null;
    }

    constructor(private left:TypedMatcher<Expression>, private right:TypedMatcher<Expression>, private tr:Transformer<AssignmentExpression,any>) {
        super()
    }

    nodeType():string {
        return "AssignmentExpression";
    }
}

class SequenceExpressionMatch extends BasicMatcher implements TypedMatcher<SequenceExpression> {

    match(node:SequenceExpression):any {
        return node;
    }

    nodeType():string {
        return "SequenceExpression";
    }
}

class SimpleIdentMatcher extends BasicMatcher implements TypedMatcher<Identifier> {

    match(node:Identifier):any {
        if (node.name == this.val) {
            return true;
        }
        return null;
    }

    constructor(private val:string) {
        super()
    }

    nodeType():string {
        return "Identifier";
    }
}

class MemberExpressionMatcher extends BasicMatcher implements TypedMatcher<MemberExpression> {
    match(node:MemberExpression):any {
        if (this.objectMatcher.doMatch(node.object) && this.propertyMatcher.doMatch(node.property)) {
            return this.tr(node);
        }
        return null;
    }

    nodeType():string {
        return "MemberExpression";
    }

    constructor(private objectMatcher:TypedMatcher<Expression>,
                private propertyMatcher:TypedMatcher<Expression|Identifier>,
                private tr:Transformer<MemberExpression,any>) {
        super()
    }
}

class PathNode {
    name:string
    arguments:Expression[] = null;

    constructor(name:string) {
        this.name = name;
    }
}





class TrueMatcher<T extends Node> implements TypedMatcher<T> {

    doMatch(node:Node):any {
        return true;
    }

    nodeType():string {
        return null;
    }
}

module Matchers {

    export class CallPath {
        base:string;

        isGeneralCall:boolean = false

        constructor(base:string) {
            this.base = base;
        }

        path:PathNode[] = [];

        toString():string{
            return this.path.map(x=>x.name).join(".");
        }
    }
    export class CallBaseMatcher implements TypedMatcher<Expression> {
        doMatch(node:Expression):Matchers.CallPath {
            var original = node;
            if (node.type == "CallExpression") {
                var call = (<CallExpression>node);
                var res:Matchers.CallPath = this.doMatch(call.callee);
                if (res) {
                    if (res.path.length > 0 && res.path[res.path.length - 1].arguments == null) {
                        res.path[res.path.length - 1].arguments = call.arguments;
                        return res;
                    }
                    if (res.path.length==0&&call.arguments.length>0){
                        //this is not resource based call!!!
                        if (call.arguments[0].type=="Literal"){
                            var l:Literal=<Literal>call.arguments[0];
                            var url=l.value;
                            if(url.indexOf('/')==0){
                                url = url.substring(1)
                            }
                            var uriPath=url.toString().split("/");
                            uriPath.forEach(x=>res.path.push(
                                new PathNode(x)
                            ))
                            res.isGeneralCall = true
                            return res;
                        }
                    }
                    return null;
                }
            }
            else if (node.type == "MemberExpression") {
                var me = (<MemberExpression>node);
                var v:Matchers.CallPath = this.doMatch(me.object);
                if (v) {
                    if (me.property.type == "Identifier") {
                        v.path.push(new PathNode((<Identifier>me.property).name));
                        return v;
                    }
                    else if(me.property.type == 'Literal'){
                        v.path.push(new PathNode(me.property['value'].toString()));
                        return v;
                    }
                    return null;
                }
            }
            else if (node.type == "Identifier") {
                var id:Identifier = <Identifier>node
                if (this.rootMatcher.doMatch(id)) {
                    return new Matchers.CallPath(id.name);
                }
            }
            return null;
        }

        nodeType():string {
            return null;
        }

        constructor(private rootMatcher:TypedMatcher<Identifier>) {
        }
    }

    export function call(calleeMatcher:TypedMatcher<Expression>, tr:Transformer<CallExpression,any> = x=>true):TypedMatcher<CallExpression> {
        return new CallExpressionMatcher(calleeMatcher, tr);
    }

    export function ident(name:string):TypedMatcher<MemberExpression> {
        return new SimpleIdentMatcher(name);
    }

    export function member(objMatcher:TypedMatcher<Expression>, propMatcher:TypedMatcher<Expression|Identifier>, tr:Transformer<MemberExpression,any> = x=>true):TypedMatcher<MemberExpression> {
        return new MemberExpressionMatcher(objMatcher, propMatcher, tr);
    }

    export function memberFromString(objMatcher:string, propMatcher:string, tr:Transformer<MemberExpression,any> = x=>true):TypedMatcher<MemberExpression> {
        return new MemberExpressionMatcher(ident(objMatcher), ident(propMatcher), tr);
    }

    export function anyNode():TypedMatcher<Node> {
        return new TrueMatcher();
    }

    export function exprStmt(eM:TypedMatcher<Expression>, tr:Transformer<MemberExpression,any> = x=>true):TypedMatcher<ExpressionStatement> {
        return new ExpressionStatementMatcher(eM, tr);
    }

    export function assign(left:TypedMatcher<Expression>, right:TypedMatcher<Expression>, tr:Transformer<AssignmentExpression,any> = x=>true):TypedMatcher<AssignmentExpression> {
        return new AssignmentExpressionMatcher(left, right, tr);
    }

    export function sequence():TypedMatcher<AssignmentExpression> {
        return new SequenceExpressionMatch();
    }

    export function memberFromExp(objMatcher:string, tr:Transformer<Expression,any> = x=>true):TypedMatcher<any> {
        var array:string[] = objMatcher.split(".");
        var result:TypedMatcher<any> = null;
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
        //console.log(result)
        return result;
    }
}
export =Matchers