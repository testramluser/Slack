/// <reference path="./typings/tsd.d.ts" />

import jsyaml=require('./jsyaml2lowLevel')
import defs=require('./definitionSystem')
import hl=require('./highLevelAST')
import ll=require('./lowLevelAST')
import tsStruct=require('./tsStructureParser')
import ts2Def=require('./tsStrut2Def')
import _=require("underscore")
import yaml=require('./yamlAST')
import selector=require('./selectorMatch')
import ramlExpression=require('./ramlExpressionParser')
import hlImpl=require('./highLevelImpl')

interface Node{
    type: string
}
interface Paren extends Node{
    exp: Node
}
interface Ident extends Node{

    value: string
}

interface Literal extends Node{

    value: string
}
interface UnaryExpression extends Node{
    op: string
    exp: Node
}
interface BinaryExpression extends Node{
    l:Node
    r:Node
}

export function validate(str:string, node:hl.IHighLevelNode){
    var result:Node=ramlExpression.parse(str);
    validateNode(result,node);
}

function validateNode(r:Node,node:hl.IHighLevelNode){
    if (r.type=="unary"){
        var u:UnaryExpression=<UnaryExpression>r;
        validateNode(u.exp,node);
    }
    else if (r.type=='paren'){
        var ex:Paren=<any>r;
        validateNode(ex.exp,node);

    }
    else if (r.type=='string'||r.type=='number'){

    }
    else if (r.type=='ident'){
      var ident=<Ident>r;
      var p=hlImpl.resolveRamlPointer(node,ident.value)
      if (!p){
          throw new Error("Unable to resolve "+ident.value)
      }
    }
    else{
        var be:BinaryExpression=<BinaryExpression>r;
        validateNode(be.l,node);
        validateNode(be.r,node);
    }
}