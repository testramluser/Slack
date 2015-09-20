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
import typeExpression=require('./typeExpressionParser')
import hlImpl=require('./highLevelImpl')

interface BaseNode{
    type:string
}
interface Union extends BaseNode{
    first: BaseNode
    rest: BaseNode
}
interface Parens{
    expr:  BaseNode
    arr: string
}
interface Literal{
    value: string
    arr: string
}
export function validate(str:string, node:hl.IAttribute,cb:hl.ValidationAcceptor){
    var result:BaseNode=typeExpression.parse(str);
    validateNode(result,node,cb);
}
function validateNode(r:BaseNode,node:hl.IAttribute,cb:hl.ValidationAcceptor){
    if (r.type=="union"){
        var u:Union=<Union>r;
        validateNode(u.first,node,cb);
        validateNode(u.rest,node,cb);
    }
    if (r.type=='parens'){
        var ex:Parens=<any>r;
        validateNode(ex.expr,node,cb);

    }
    if (r.type=='name'){
        var l:Literal=<any>r;
        var val=l.value;
        if (val.lastIndexOf("[]")==val.length-2){
            val=val.substr(0,val.length-2);//FIXME Should be in PEG
        }
        var pr=node.property()
        var values = pr.enumValues(node.parent());
        if (!_.find(values, x=>x == val)) {

            cb.accept(hlImpl.createIssue(hl.IssueCode.UNRESOLVED_REFERENCE,"Unresolved reference:"+val,node));
            return true;
        }
    }

}