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
import typeExpression=require('./typeExpressions')
import def=require( "./definitionSystem");
import high=require('./highLevelAST');
type NodeClass=def.NodeClass;
type IAttribute=high.IAttribute
class KeyMatcher{

    parentValue:hl.IProperty
    parentKey:hl.IProperty
    canBeValue:hl.IProperty

    constructor(private _props:hl.IProperty[]){
        this.parentValue=_.find(_props,x=>x.isFromParentValue());
        this.parentKey=_.find(_props,x=>x.isFromParentKey());
        this.canBeValue=_.find(_props,x=>(<defs.Property>x).canBeValue());
    }

    match(key:string):hl.IProperty{
        var _res:hl.IProperty=null;
        var lastPref=""

        this._props.forEach(p=>{
            if (p.isSystem()){
                return;
            }
            if (p!=this.parentValue&&p!=this.parentKey&&p.matchKey(key)){
                if (p.keyPrefix()!=null) {
                    if (p.keyPrefix().length >= lastPref.length) {
                        lastPref=p.keyPrefix();
                        _res = p;
                    }
                }
                else{
                    _res=p;
                    lastPref=p.name();
                }
            }
        })
        return _res;
    }
}
export var subTypesWithLocals = function (range:hl.ITypeDefinition, n:hl.IHighLevelNode) {
    var result = range.allSubTypes();
    if (range.getRuntimeExtenders().length > 0&&n) {
        var extenders = range.getRuntimeExtenders();
        var root = n.root();
        extenders.forEach(x=> {
            var definitionNodes = globalDeclarations(n).filter(z=>z.definition() == x);
            result = result.concat(definitionNodes.map(x=>typeFromNode(x)))
        })
    }

    return result;
};

export var nodesDeclaringType = function (range:hl.ITypeDefinition, n:hl.IHighLevelNode):hl.IHighLevelNode[] {
    var result:hl.IHighLevelNode[] = [];
    if (range.getRuntimeExtenders().length > 0&&n) {
        var extenders = range.getRuntimeExtenders();
        var root = n;
        extenders.forEach(x=> {
            var definitionNodes = globalDeclarations(root).filter(z=>z.definition() == x);
            result = result.concat(definitionNodes)
        })
    }
    var isElementType=!range.isValueType();
    if (isElementType&&(<hl.INodeDefinition>range).isInlinedTemplates() && n){
        var root = n;
        //TODO I did not like it it might be written much better
        var definitionNodes = globalDeclarations(root).filter(z=>z.definition() == range);
        result=result.concat(definitionNodes);
    }
    else{
        var root = n;
        var q={};
        range.allSubTypes().forEach(x=>q[x.name()]=true)
        q[range.name()]=true;
        var definitionNodes = globalDeclarations(root).filter(z=>q[z.definition().name()]);
        result=result.concat(definitionNodes);
    }
    return result;
};
export function findAllSubTypes(p:hl.IProperty,n:hl.IHighLevelNode) {
     var range=p.range();
    return subTypesWithLocals(range, n);
};
interface TemplateData{
    [name:string]:hl.ITypeDefinition[]
}
var handleValue = function (strV:string, d:TemplateData, prop:ASTPropImpl,allwaysString:boolean) {
    var ps = 0;
    while (true) {
        var pos = strV.indexOf("<<", ps);
        if (pos != -1) {
            var end = strV.indexOf(">>", pos);
            var isFull = pos == 0 && end == strV.length - 2;
            var parameterUsage = strV.substring(pos + 2, end);
            ps = pos + 2;
            var directiveIndex = parameterUsage.indexOf("|");
            if (directiveIndex != -1) {
                parameterUsage = parameterUsage.substring(0, directiveIndex);
            }
            parameterUsage = parameterUsage.trim();
            var q = d[parameterUsage];
            var r = prop.property().range();
            if (!isFull||allwaysString) {
                r = prop.definition().universe().getType("StringType");
            }
            //FIX ME NOT WHOLE TEMPLATES
            if (q) {
                q.push(r);
            }
            else {
                d[parameterUsage] = [r]
            }
        }
        else break;
    }
};
function templateFields(node:hl.IParseResult,d:TemplateData){
    node.children().forEach(x=>templateFields(x,d));
    if (node instanceof ASTPropImpl){
        var prop=<ASTPropImpl>node;
        //TODO RECURSIVE PARAMETERS
        var v=prop.value();
        if (typeof v=='string'){
            var strV=<string>v;
            handleValue(strV, d, prop,false);
        }
        else{
            node.lowLevel().visit(x=>{
                if (x.value()){
                    var strV=x.value()+"";
                    handleValue(strV,d,prop,true);

                }
                return true;
            })
        }
    }
}
export function typeFromNode(node:hl.IHighLevelNode):hl.ITypeDefinition{
    var result=new defs.NodeClass(node.name(),<defs.Universe>node.definition().universe(),node.lowLevel().unit().path());
    var def=<defs.NodeClass>node.definition();
    if (def.isInlinedTemplates()){
        var usages:TemplateData={}
        templateFields(node,usages);
        Object.keys(usages).forEach(x=>{
            var prop=new defs.Property(x);
            prop.withDomain(result);
            var tp=_.unique(usages[x]).filter(x=>x.name()!="StringType");
            prop.withRange(tp.length==1?tp[0]:<any>node.definition().universe().getType("StringType"));
            prop.withRequired(true)
            prop.unmerge();
        })
    }
    else if (def.getReferenceIs()){
        if (def.universe().version()=="RAML08") {
            result.withAllowAny();
        }
        var p=def.property(def.getReferenceIs());
        if (p){
            p.range().properties().forEach(x=>{
                var prop=new defs.Property(x.name());
                prop.unmerge();
                prop.withDomain(result);
                prop.withRange(x.range());
                prop.withMultiValue(x.isMultiValue());
            });
        }
    }
    else {
        var rp = def.findMembersDeterminer();
        if (rp) {
            var elements = node.elementsOfKind(rp.name());
            elements.forEach(x=> {
                var prop = elementToProp(x);
                prop.withDomain(result)
            })
        }
        if (def.getExtendedType()) {
            result._superTypes.push(def.getExtendedType());
        }
    }
    return result;
}
export function elementToProp(e:hl.IHighLevelNode):defs.Property{
    var nm=e.name();
    var result=new defs.Property(nm);
    result.unmerge();
    var props=e.definition().properties();
    var tp=e.attr("type");
    if (tp){
        var typeName=tp.value();
        var tpv=e.definition().universe().getType(typeName);
        result.withRange(<defs.IType>tpv);
        //FIXME
        if (typeName=="pointer"){
            var scope=e.attr("target");
            if (scope){
                try {
                    var sm=selector.parse(e,""+scope.value());
                    result.setSelector(sm);
                }catch (e){
                    //ignoring syntax error here
                }
            }
        }
    }
    //FIXME Literals
    if (nm=="value"&&e.parent()&&e.parent().definition().name()=="AnnotationType"){
        result.withCanBeValue()
    }
    e.definition().allProperties().forEach(p=>{
        if (p.name()!="type"){
            if ((<defs.Property>p).describesAnnotation()){
                var annotationName= (<defs.Property>p).describedAnnotation();
                var args:(string|string[])[]=[]
                var vl=e.attributes(p.name()).map(a=>a.value());
                if (vl.length==1) {
                    args.push(vl[0]);
                }
                else{
                    args.push(vl)
                }
                //TODO ANNOTATIONS WITH MULTIPLE ARGUMENTS
                var an:tsStruct.Annotation={
                    name:annotationName,
                    arguments:args
                }
                ts2Def.recordAnnotation(result,an);
            }
        }
    })

    if (result.range()==null){
        result.withRange(new defs.ValueType("String",<defs.Universe>e.definition().universe(),""))
    }
    return result;
}
export function qName(x:hl.IHighLevelNode,context:hl.IHighLevelNode):string{
    var nm=x.name();
    var origUnit=context.lowLevel().unit();
    while (true){
        var np=x.parent();
        if (!np){
            break;
        }
        else{
            if (np.lowLevel().unit()!=origUnit){
                break;
            }
            if (np.definition().name()=="Library"&&np.parent()){
                nm=np.name()+"."+nm;
            }
            x=np;
        }
    }
    return nm;
}
function insideResourceTypeOrTrait(h:hl.IHighLevelNode){
    var declRoot=h;
    while (true){
        var np=declRoot.parent();
        if (!np){
            break;
        }
        else{
            declRoot=np;
        }
        if (declRoot.definition().isInlinedTemplates()){
            return true;
        }
    }
    return false;
}
var declRoot = function (h:hl.IHighLevelNode):hl.IHighLevelNode {
    var declRoot = h;
    while (true) {
        var np = declRoot.parent();
        if (!np) {
            break;
        }
        else {
            if (np.definition().name() == "Library") {
                declRoot = np;
                break;
            }
            declRoot = np;
        }
    }
    return declRoot;
};
export function globalDeclarations(h:hl.IHighLevelNode):hl.IHighLevelNode[]{
    var decl= declRoot(h);
    return findDeclarations(decl);
}
export function findDeclarations(h:hl.IHighLevelNode):hl.IHighLevelNode[]{
    var rs:hl.IHighLevelNode[]=[];
    h.elements().forEach(x=>{
        if (x.definition().name()=="Library"){
            rs=rs.concat(findDeclarations(x));
        }
        rs.push(x);
    });
    return rs;
}

export function resolveReference(point:ll.ILowLevelASTNode,path:string):ll.ILowLevelASTNode{
    if (!path){
        return null;
    }
    var sp=path.split("/");
    var result=point;
    for(var i=0;i<sp.length;i++){
        if (sp[i]=='#'){
            result=point.unit().ast();
            continue;
        }
        result=_.find(result.children(),x=>x.key()==sp[i]);
        if (!result){
            return null;
        }
    }
    return result;
}

//FIXME CORRECTLY STRUCTURE IT
export function resolveRamlPointer(point:hl.IHighLevelNode,path:string):hl.IHighLevelNode{
    var components:string[]=path.split(".");

    var currentNode=point;
    if (currentNode.definition().isAnnotation()){
        currentNode=currentNode.parent();
    }
    components.forEach(x=>{
        if (currentNode==null){
            return;
        }
        if (x=='$parent'){
            currentNode=currentNode.parent();
            return;
        }
        if (x=='$root'){
            currentNode=currentNode.root();
            return;
        }
        if (x=='$top'){
            currentNode=declRoot(currentNode);
            return;
        }
        var newEl=_.find(currentNode.elements(),y=>y.name()==x);

        currentNode=newEl;
    });
    return currentNode;
}

function allChildren(node:hl.IHighLevelNode){
    return new selector.AnyChildMatch().apply(node.root());
}
export class BasicNodeBuilder implements hl.INodeBuilder{


    process(node:hl.IHighLevelNode, childrenToAdopt:ll.ILowLevelASTNode[]):hl.IParseResult[] {
        var km=new KeyMatcher(node.definition().allProperties());
        var aNode=<ASTNodeImpl>node;

        var allowsQuestion=aNode._allowQuestion||node.definition().getAllowQuestion();
        var res:hl.IParseResult[]=[]
        if (km.parentKey){
            if (node.lowLevel().key()){
                res.push( new ASTPropImpl(node.lowLevel(),node,km.parentKey.range(),km.parentKey,true));
            }
        }
        if (node.lowLevel().value()){
            if (km.parentValue) {
                    res.push(new ASTPropImpl(node.lowLevel(), node, km.parentValue.range(), km.parentValue));
            }
            else if (km.canBeValue){
                var s=node.lowLevel().value();
                if (typeof s=='string'&&(<string>s).trim().length>0) {
                    res.push(new ASTPropImpl(node.lowLevel(), node, km.canBeValue.range(), km.canBeValue));
                }
            }
        }

        aNode._children=res;
        childrenToAdopt.forEach(x=>{
            var key:string=x.key();
            if (key=='$ref'&&aNode.universe().version()=="Swagger"){
                var resolved=resolveReference(x,x.value());
                if (!resolved) {
                    var bnode = new BasicASTNode(x, aNode);
                    bnode.unresolvedRef = "ref";
                    res.push(bnode);
                }
                else{
                    var mm=this.process(aNode,resolved.children());
                    mm.forEach(x=>{
                        if (x.property()&&x.property().isKey()){
                            return;
                        }
                        res.push(x);
                    })

                }
            }
            if (allowsQuestion){
                if (key != null && key.charAt(key.length-1)=='?'){
                    key=key.substr(0,key.length-1);
                }
            }
            var p=km.match(key);
            if (p!=null){
                //TODO DESCRIMINATORS
                if(p.range().isValueType()){

                    if (p.isMultiValue() || true) {//REVIEW IT
                        if (p.range().name()=="structure"){
                            res.push(new ASTPropImpl(x, aNode, p.range(), p));
                        }
                        else {
                            var ch = x.children();

                            if (ch.length > 1) {
                                ch.forEach(y=>res.push(new ASTPropImpl(y, aNode, p.range(), p)));
                            }
                            else {

                                if (p.isInherited()) {
                                    aNode.setComputed(p.name(), x.value());
                                }
                                res.push(new ASTPropImpl(x, aNode, p.range(), p));
                            }
                        }
                    }
                    return;
                }
                else{
                    var rs:ASTNodeImpl[]=[];
                    //now we need determine actual type
                    aNode._children=res;
                    var types= findAllSubTypes(p,aNode);
                    if (!p.isMerged()){
                        if (p.isMultiValue()){
                            if (p.isEmbedMap()){

                                var chld=x.children();

                                if (chld.length==0){
                                    if (x.value()){
                                        var bnode = new  BasicASTNode(x, aNode);
                                        bnode.knownProperty=p;
                                        res.push(bnode);
                                    }
                                }
                                chld.forEach(y=>{
                                    //TODO TRACK GROUP KEY
                                    var cld=y.children()
                                    if (!y.key()&&cld.length==1) {
                                        var node = new ASTNodeImpl(cld[0], aNode, <any> p.range(), p);
                                        node._allowQuestion = allowsQuestion;
                                        rs.push(node);
                                    }
                                    else{
                                        if (aNode.universe().version()=="RAML1"){
                                            var node = new ASTNodeImpl(y, aNode, <any> p.range(), p);
                                            node._allowQuestion = allowsQuestion;
                                            rs.push(node);
                                        }
                                        else {
                                            var bnode = new BasicASTNode(y, aNode);
                                            res.push(bnode);
                                            if (y.key()) {
                                                bnode.needSequence = true;
                                            }
                                        }
                                    }
                                })

                            }
                            else{
                                var filter:any={}
                                if(p.range() instanceof defs.NodeClass){
                                    var nc=<defs.NodeClass>p.range();

                                    if (nc.getCanInherit().length>0){
                                        nc.getCanInherit().forEach(v=>{
                                            var vl=aNode.computedValue(v);
                                            if (vl){
                                                if (!_.find(x.children(),x=>x.key()==vl)) {
                                                    //we can create inherited node;
                                                    var node = new ASTNodeImpl(x, aNode, <any> p.range(), p);
                                                    var ch = node.children();
                                                    //this are false unknowns actual unknowns will be reported by parent node
                                                    node._children = ch.filter(x=>!x.isUnknown())

                                                    node._allowQuestion = allowsQuestion;
                                                    rs.push(node);
                                                    node.attrs().forEach(x=> {
                                                        if (x.property().isKey()) {
                                                            var atr = <ASTPropImpl>x;
                                                            atr._computed = true;
                                                            return;
                                                        }
                                                        filter[x.name()] = true;
                                                    })
                                                    node._computed = true;
                                                }
                                            }
                                        })
                                    }
                                }
                                x.children().forEach(y=>{
                                    if (filter[y.key()]){
                                        return;
                                    }
                                  var node=   new ASTNodeImpl(y, aNode,<any> p.range(), p);
                                  node._allowQuestion=allowsQuestion;
                                  rs.push(node);
                                })
                            }
                        }
                        else{
                            //var y=x.children()[0];
                            rs.push(new ASTNodeImpl(x, aNode,<any> p.range(), p));
                        }
                    }
                    else {
                        var node=new ASTNodeImpl(x, aNode, <any>p.range(), p);
                        node._allowQuestion=allowsQuestion;
                        rs.push(node);
                    }

                    rs.forEach(x=> {
                        var rt:hl.ITypeDefinition=null;
                        if (types.length>0){
                            types.forEach(y=>{
                                if (!rt) {
                                    if (y.match(x,rt)) {
                                        rt = y;
                                    }
                                }
                            })
                        }
                        if(rt&&rt!=x.definition()){
                            x.patchType(<hl.INodeDefinition>rt);
                        }
                        p.childRestrictions().forEach(y=>{
                            x.setComputed(y.name,y.value)
                        })
                        var def=<hl.INodeDefinition>x.definition();

                        res.push(x)
                    });


                }
            }
            else{
                res.push(new BasicASTNode(x,aNode));
                //error
            }
        })
        aNode._children=res;
        aNode._children.forEach(x=>{
            if (x instanceof ASTPropImpl){
                var attr=<ASTPropImpl>x;
                var p=<defs.Property>attr.property();
                var tpes=p.range().name()=="StringType"?[]:p.range().allSubTypes();
                var actualType=p.range();
                if(tpes.length>0){
                    var rm=aNode.toRuntimeModel();
                    tpes.forEach(t=>{
                        var ds=(<defs.AbstractType><any>t).getFunctionalDescriminator();
                        if (ds){
                            try {
                                var q = evalInSandbox("return " + ds, rm, []);
                                if (q) {
                                    attr.patchType(<any>t)

                                }
                            } catch (e){
                                //silently ignore
                            }
                        }
                    });
                }
            }
        })
        return res;
    }
}

function createType(nd:hl.INodeDefinition):hl.ITypeDefinition{
    return null;
}

var loophole= require("loophole")
function evalInSandbox(code:string,thisArg:any,args:any[]) {
    return new loophole.Function(code).call(thisArg,args);
}
export class BasicASTNode implements hl.IParseResult{

    root():hl.IHighLevelNode{
        if (this.parent()){
            return this.parent().root();
        }
        return <any>this;
    }
    private _implicit:boolean=false;
    private values:{[name:string]:any}={}
    _computed:boolean;
    constructor(protected _node:ll.ILowLevelASTNode,private _parent:hl.IHighLevelNode){
        if(_node) {
            _node.setHighLevelParseResult(this);
        }
    }
    knownProperty:hl.IProperty
    needSequence:boolean
    unresolvedRef:string
    checkContextValue(name:string,value:string,thisObj:any):boolean{
        var vl=this.computedValue(name);
        if (vl&&vl.indexOf(value)!=-1){
            return true;//FIXME
        }
        if (!vl){
            try {
                var res = evalInSandbox("return " + name, thisObj, []);
                if (res != undefined) {
                    return "" + res == value;
                }
            }catch (e){
                //ignoring failures here
            }
        }
        return value==vl||value=='false';
    }

    toRuntimeModel():any{
        var thisObj={};
        //FIXME it should be be done in much cooler way
        //Spec for runtime is also needed
        this.children().forEach(x=>{
            if (x instanceof ASTPropImpl){
                var pr=x;
                var val=pr.value();
                if (val) {
                    var type = pr.property().range();
                    val=this.fillValue(type, val);
                    thisObj[x.name()] = val;
                }
            }

        });
        return thisObj;
    }

    protected fillValue(type:hl.ITypeDefinition, val:any):any {
        type.methods().forEach(m=> {
            if (typeof val == 'string') {
                var newVal:any = {};
                newVal['value'] = new loophole.Function("return this._value");
                newVal._value = val;
                val = newVal;
            }
            var nm = m.name;
            var body = m.text;
            var actualText = body.substring(body.indexOf('{') + 1, body.lastIndexOf('}'))
            var func = new loophole.Function(actualText);
            val[nm] = func;
        })
        val['$$']=this;
        return val;
    }

    validate(v:hl.ValidationAcceptor):void{

        if (this.lowLevel()&&this._parent==null) {
            this.lowLevel().errors().forEach(x=> {
                var em={
                    code:hl.IssueCode.YAML_ERROR,
                    message:x.message,
                    node:null,
                    start:x.mark.position,
                    end:x.mark.position+1,
                    isWarning:false,
                    path:this.lowLevel().unit().path()
                }
                v.accept(em)
              });
        }

        this.validateIncludes(v);
        if (this.isUnknown()){
            if (this.needSequence){
                v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "node: " + this.name()+" should be wrapped in sequence", this));
            }
            if (this.unresolvedRef){
                v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "reference : " + this.lowLevel().value()+" can not be resolved", this));

            }
            if (this.knownProperty&&this.lowLevel().value()){
                v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "property "+this.name()+" can not have scalar value", this));
            }
            else {
                v.accept(createIssue(hl.IssueCode.UNKNOWN_NODE, "Unknown node:" + this.name(), this));
            }
        }
        this.directChildren().forEach(x=>x.validate(v));
    }

    protected validateIncludes(v) {
        if (this.lowLevel()) {
            this.lowLevel().includeErrors().forEach(x=> {
                var em = createIssue(hl.IssueCode.UNABLE_TO_RESOLVE_INCLUDE_FILE, x, this);
                v.accept(em)
            });
        }
    }
    setComputed(name:string,v:any){
        this.values[name]=v;
    }

    computedValue(name:string):any{
        var vl=this.values[name];
        if (!vl&&this.parent()){
            return this.parent().computedValue(name)
        }
        return vl;
    }

    lowLevel():ll.ILowLevelASTNode {
        return this._node;
    }

    expansionSpec():hl.ExpansionSpec {
        return null;
    }
    name(){
        var c=this.lowLevel().key();
        if (!c){
            return "";
        }
        return c;
    }

    parent():hl.IHighLevelNode {
        return this._parent;
    }
    isElement(){
        return false;
    }
    directChildren():hl.IParseResult[] {

        return this.children();
    }

    children():hl.IParseResult[] {
        return [];
    }

    isAttached():boolean {
        return this.parent()!=null;
    }

    isImplicit():boolean {
        return this._implicit;
    }

    isAttr():boolean{
        return false;
    }
    isUnknown():boolean{
        return true;
    }
    id():string{
        if (this._parent){
            return this._parent.id()+(this.name().indexOf("/")!=0?".":"")+this.name();
        }
        return "";
    }
    localId():string{
        return this.name();
    }
    property():hl.IProperty{
        return null;
    }
}
function checkReference(pr:hl.IProperty, astNode:hl.IAttribute, vl:string, cb:hl.ValidationAcceptor):boolean {
    if (!vl){
        return;
    }
    if (vl=='null'){
        if (pr.isAllowNull()){
            return;
        }
    }
    //FIXME this check should not be here
    try {
        if (typeof vl=='string') {
            if(pr.domain().name()=='DataElement') {
                if (pr.name() == "type"||pr.name()=='items') {
                    typeExpression.validate(vl, astNode, cb);
                    return;
                }
            }
            if (pr.name() == "schema") {
                var q = vl.trim();
                if (q.length > 0 && q.charAt(0) != '{' && q.charAt(0) != '<') {
                    typeExpression.validate(vl, astNode, cb);
                    return;
                }
                return;
            }
        }
    } catch (e){
        cb.accept(createIssue(hl.IssueCode.UNRESOLVED_REFERENCE,"Syntax error:"+e.message,astNode))
    }
    var values = pr.enumValues(astNode.parent());
    if (!_.find(values, x=>x == vl)) {
        if (typeof vl=='string') {
            if ((vl.indexOf("x-") == 0) && pr.name() == "type") {//FIXME move to def system
                return true;
            }
        }

        cb.accept(createIssue(hl.IssueCode.UNRESOLVED_REFERENCE,"Unresolved reference:"+vl,astNode));
        return true;
    }
    return false;
};

export function createIssue(c:hl.IssueCode, message:string,node:hl.IParseResult,w:boolean=false):hl.ValidationIssue{
    var st=node.lowLevel().start();
    var et=node.lowLevel().end();
    if (node.lowLevel().key()&&node.lowLevel().keyStart()){
        var ks=node.lowLevel().keyStart();
        if (ks>0){
            st=ks;
        }
        var ke=node.lowLevel().keyEnd();
        if (ke>0){
            et=ke;
        }
    }
    if (et<st){
        et=st+1;//FIXME
    }
    if (node) {
        if (node.lowLevel().unit() != node.root().lowLevel().unit()) {
            var v=node.lowLevel().unit();
            if (v) {
                message = message + " " + v.path();
            }
        }
    }
    return {
        code:c,
        isWarning:w,
        message:message,
        node:node,
        start:st,
        end:et,
        path:node.lowLevel().unit()?node.lowLevel().unit().path():""
    }
}
export class StructuredValue{

    constructor(private node:ll.ILowLevelASTNode,private _parent:hl.IHighLevelNode,private _pr:hl.IProperty,private kv=null){

    }

    valueName(): string {
        if (this.kv){
            return this.kv;
        }
        return this.node.key();
    }

    children():StructuredValue[]{
        return this.node.children().map(x=>new StructuredValue(x,null,null));
    }

    lowLevel():ll.ILowLevelASTNode{
        return this.node;
    }

    toHighlevel():hl.IHighLevelNode{
        var vn=this.valueName();
        var cands=this._pr.referenceTargets(this._parent).filter(x=>qName(x,this._parent)==vn);
        if (cands&&cands[0]){
            var tp=typeFromNode(<hl.IHighLevelNode>cands[0])
            var node=new ASTNodeImpl(this.node,this._parent,<hl.INodeDefinition>tp,this._pr);
            if (this._pr){
                this._pr.childRestrictions().forEach(y=>{
                    node.setComputed(y.name,y.value)
                })
            }
            return node;
        }
        return null;
    }
}

export function genStructuredValue(type: string, name: string, mappings: { key: string; value: string; }[], parent: hl.IHighLevelNode) {
    var map = yaml.newMap(mappings.map(mapping => yaml.newMapping(yaml.newScalar(mapping.key), yaml.newScalar(mapping.value))));
    
    var node = new jsyaml.ASTNode(map, <jsyaml.CompilationUnit> (parent? parent.lowLevel().unit():null), parent? <jsyaml.ASTNode> parent.lowLevel() : null, null, null);
    
    return new StructuredValue(node, parent, parent? parent.definition().property(type):null, name);
}

function checkPropertyQuard  (n:BasicASTNode, v:hl.ValidationAcceptor) {
    var pr = n.property();
    if (pr) {
        (<defs.Property>pr).getContextRequirements().forEach(x=> {
            if (!n.checkContextValue(x.name, x.value,(<BasicASTNode><any>n.parent()).toRuntimeModel())) {
                v.accept(createIssue(hl.IssueCode.MISSED_CONTEXT_REQUIREMENT, x.name + " should be " + x.value + " to use property " + pr.name(), n))
            }
        });
    }
    return pr;
};

//FIXME (Not here)
function parseUrl(value:string):string[]{//FIXME INHERITANCE
    var result=[]
    var temp="";
    var inPar=false;
    var count=0;
    for (var a=0;a<value.length;a++){
        var c=value[a];
        if (c=='{'){
            count++;
            inPar=true;
            continue;
        }
        if (c=='}'){
            count--;
            inPar=false;
            result.push(temp);
            temp="";
            continue;
        }
        if (inPar){
            temp+=c;
        }
    }
    if (count>0){
        throw new Error("Unmatched '{'")
    }
    if (count<0){
        throw new Error("Unmatched '}'")
    }
    return result;
}

export class ASTPropImpl extends BasicASTNode implements  hl.IAttribute {


    definition():hl.IValueTypeDefinition {
        return this._def;
    }


    constructor(node:ll.ILowLevelASTNode, parent:hl.IHighLevelNode, private _def:hl.IValueTypeDefinition, private _prop:hl.IProperty, private fromKey:boolean = false) {
        super(node, parent)

    }

    patchType(t:hl.IValueTypeDefinition){
        this._def=t;
    }


    findReferenceDeclaration():hl.IHighLevelNode{
        var targets=this.property().referenceTargets(this.parent());
        var t:hl.IHighLevelNode=_.find(targets,x=>qName(x,this.parent())==this.value())
        return t;
    }
    findReferencedValue(){
        var c=this.findReferenceDeclaration();
        if (c){
            var vl=c.attr("value");
            if (c.definition().name()=="GlobalSchema") {
                if (vl) {
                    var actualValue = vl.value();
                    if (actualValue) {
                        var rf = this._def.isValid(this.parent(),actualValue,vl.property());
                        return rf;
                    }
                }
                return null;
            }
        }
        return c;
    }

    validate(v:hl.ValidationAcceptor):void {
        var pr = checkPropertyQuard(this, v);
        var vl=this.value();
        if (!this.property().range().hasStructure()){
            if (vl instanceof StructuredValue){
                v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Scalar is expected here",this))
            }
        }
        if (this.parent().allowsQuestion()&&this.property().isKey()){
            if (vl != null &&vl.length>0&&vl.charAt(vl.length-1)=='?'){
                vl=vl.substr(0,vl.length-1);
            }
        }
        if (typeof vl=='string'&&vl.indexOf("<<")!=-1){
            if (vl.indexOf(">>")>vl.indexOf("<<")){
                if (insideResourceTypeOrTrait(this.parent())){
                    return;
                }
            }
        }

        this.validateIncludes(v);
        if (this.property().name()=="name"){
            //TODO MOVE TO DEF SYSTEM
            if (this.parent().property()&&this.parent().property().name()=='uriParameters'){
                var c=this.parent().parent();
                var tn=c.name();
                if (c.definition().name()=='Api'){
                    this.checkBaseUri(c, vl, v);
                }
                try {
                    var pNames=parseUrl(tn);
                    if (!_.find(pNames,x=>x==vl)){
                        v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Unused url parameter '"+vl+"'",this))
                    }
                } catch (e){

                }
            }
            if (this.parent().property()&&this.parent().property().name()=='baseUriParameters'){
                var c=this.parent().parent();
                this.checkBaseUri(c, vl, v);
            }
        }

        if (pr.isReference()||pr.isDescriminator()){
            var valueKey=vl;
            if (typeof vl=='string'){
                checkReference(pr, this, vl,v);
                if (pr.range() instanceof defs.ReferenceType){
                    var t=<defs.ReferenceType>pr.range();
                    if (true){
                        var mockNode=jsyaml.createNode(""+vl);
                        mockNode._actualNode().startPosition=this.lowLevel().valueStart();
                        mockNode._actualNode().endPosition=this.lowLevel().valueEnd();
                        var stv=new StructuredValue(mockNode,this.parent(),this.property())
                        var hn = stv.toHighlevel()
                        if (hn) {
                            hn.validate(v);
                        }
                    }
                }
            }
            else{
                var st=<StructuredValue>vl;
                if (st) {
                    valueKey=st.valueName();
                    var vn = st.valueName();
                    if (!checkReference(pr, this, vn,v)) {
                        var hnode = st.toHighlevel()
                        if(hnode) hnode.validate(v);
                    }
                }
                else{
                    valueKey=null;
                }
            }
            if (valueKey) {
                var validation = pr.range().isValid(this.parent(), valueKey, pr);

                if (validation instanceof Error) {
                    v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, (<Error>validation).message, this));
                    validation = null;
                }
            }
        }
        else{
            var validation=pr.range().isValid(this.parent(),vl,pr);
            if (validation instanceof Error){
                if (!(<any>validation).canBeRef){
                    v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,(<Error>validation).message, this));
                    validation=null;
                    return;
                }
            }
            if (!validation||validation instanceof Error){//FIXME
                if (pr.name()!='value') {
                    if (!checkReference(pr, this, vl, v)) {
                        var decl = this.findReferencedValue();
                        if (decl instanceof Error) {
                            v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,(<Error>decl).message, this));
                        }
                        if (!decl){
                            if (vl) {
                                if (pr.name() == 'schema') {
                                    var z=vl.trim();
                                    if (z.charAt(0)!='{'&&z.charAt(0)!='<') {
                                        if (vl.indexOf('|') != -1 || vl.indexOf('[]') != -1 || vl.indexOf("(") != -1) {
                                            return;
                                        }
                                    }
                                }
                            }
                            if (validation instanceof Error&&vl){
                                v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,(<Error>validation).message, this));
                                validation=null;
                                return;
                            }
                            v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,"Empty value is not allowed here", this));
                        }
                    }
                }
                else{
                    v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Invalid value schema "+this.value(), this));
                }
            }
            var values=pr.enumOptions();
            if (values&&values.length>0){
                if (!_.find(values, x=>x == vl)) {
                    if (vl&&(vl.indexOf("x-")==0)&&pr.name()=="type"){//FIXME move to def system
                        //return true;
                    }
                    else {
                        v.accept(createIssue(hl.IssueCode.UNRESOLVED_REFERENCE, "Invalid value:" + vl + " allowed values are:" + values.join(","), this));
                    }
                }
            }
        }
        if (!vl){
            vl="";
        }
        if (this._def.methods().length>0) {//FIXME INHERITANCE OF METHODS
            var valueObj = this.fillValue(this._def, vl);
            if (valueObj['parse']){
                try {
                    valueObj.parse();
                }catch (e){
                    if (e.message.indexOf("Cannot assign to read only property '__$validated'")==0){
                        //SCHEMA VALIDATOR BUG FIXME
                        return;
                    }
                    if (e.errors){
                        v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,e.message,this,true));
                        return;
                    }
                    v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA,e.message,this,true));
                }
            }
        }
    }

    private checkBaseUri(c, vl, v) {
        var bu = c.root().attr("baseUri")

        if (bu) {
            var tnv = bu.value();
            try {
                var pNames = parseUrl(tnv);
                if (!_.find(pNames, x=>x == vl)) {
                    v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Unused url parameter", this))
                }
            } catch (e) {

            }
        }
        else {
            v.accept(createIssue(hl.IssueCode.INVALID_VALUE_SCHEMA, "Unused url parameter", this))
        }
    }

    toRuntime():any{
        var vl=this.value();
        var valueObj = this.fillValue(this.property().range(), vl);
        if (valueObj['parse']){
            try {
                return valueObj.parse();
            }catch (e){
               return e;
            }
        }
        return valueObj;
    }

    isElement() {
        return false;
    }


    property():hl.IProperty {
        return this._prop;
    }

    value():any {
        if (this._computed){
            return this.computedValue(this.property().name());
        }
        if (this.fromKey) {
            return this._node.key();
        }
        var actualValue = this._node.value(); //TODO FIXME
        if (actualValue instanceof jsyaml.ASTNode) {
            return new StructuredValue(<ll.ILowLevelASTNode>actualValue,this.parent(),this._prop);
        }
        return actualValue;
    }

    name() {
        return this._prop.name();
    }

    isAttr():boolean {
        return true;
    }

    isUnknown():boolean {
        return false;
    }

    setValue(value: string|StructuredValue) {
        if (value == this.value()) return;
        var c = new ll.CompositeCommand();
        if(typeof value === 'string') {
            var val = <string>value;
            if (this._prop.isFromParentKey()) {
                //console.log('set key');
                c.commands.push(ll.setKey(this._node, val));
            } else {
                //console.log('set val');
                if (!val || val.length == 0) {
                    c.commands.push(ll.removeNode(this._node.parent(), this._node))
                } else {
                    c.commands.push(ll.setAttr(this._node, val));
                }
            }
        } else {
            if (this._prop.isFromParentKey()) {
                throw "couldn't set structured value to a key: " + this._prop.name();
            }
            var sval = <StructuredValue>value;
            c.commands.push(ll.setAttrStructured(this._node, sval));
        }
        this._node.execute(c);
    }

    children():hl.IParseResult[] {
        return [];
    }
}


export class VirtualAttribute extends BasicASTNode implements  hl.IAttribute {

    private val: string = null;
    private realAttribute: IAttribute = null;

    constructor(_nodeParent: hl.IHighLevelNode, private _def:hl.IValueTypeDefinition, private _prop:hl.IProperty, private fromKey:boolean = false) {
        super(null, _nodeParent);
    }

    //constructor(node:ll.ILowLevelASTNode, parent:hl.IHighLevelNode, private _def:hl.IValueTypeDefinition, private _prop:hl.IProperty, private fromKey:boolean = false) {
    //    super(node, parent)
    //}
    //
    //patchType(t:hl.IValueTypeDefinition){
    //    this._def=t;
    //}
    //
    //
    //findReferenceDeclaration():hl.IHighLevelNode{
    //    var targets=this.property().referenceTargets(this.parent());
    //    var t:hl.IHighLevelNode=_.find(targets,x=>qName(x,this.parent())==this.value())
    //    return t;
    //}
    //findReferencedValue(){
    //    var c=this.findReferenceDeclaration();
    //    if (c){
    //        var vl=c.attr("value");
    //        if (c.definition().name()=="GlobalSchema") {
    //            if (vl) {
    //                var actualValue = vl.value();
    //                if (actualValue) {
    //                    var rf = this._def.isValid(this.parent(),actualValue,vl.property());
    //                    return rf;
    //                }
    //            }
    //            return null;
    //        }
    //    }
    //    return c;
    //}

    definition():hl.IValueTypeDefinition {
        return this._def;
    }

    isElement() {
        return false;
    }

    name() {
        return this._prop.name();
    }

    isAttr():boolean {
        return true;
    }

    isUnknown():boolean {
        return false;
    }

    children():hl.IParseResult[] {
        return [];
    }

    property():hl.IProperty {
        return this._prop;
    }

    toRuntime():any{
        var vl=this.value();
        var valueObj = this.fillValue(this.property().range(), vl);
        if (valueObj['parse']){
            try {
                return valueObj.parse();
            }catch (e){
                return e;
            }
        }
        return valueObj;
    }

    value():any {
        //if (this._computed){
        //    return this.computedValue(this.property().name());
        //}
        //if (this.fromKey) {
        //    return this._node.key();
        //}
        //var actualValue = this._node.value();//TODO FIXME
        //if (actualValue instanceof jsyaml.ASTNode) {
        //    return new StructuredValue(<ll.ILowLevelASTNode>actualValue,this.parent(),this._prop);
        //}
        //return actualValue;
        return this.realAttribute? this.realAttribute.value() : '';
    }

    setValue(val:string) {
        (<ASTNodeImpl>this.parent()).createAttr(this.name(), '');
        this.realAttribute = this.parent().attr(this.name());
        this.realAttribute.setValue(val);
        //if (n == this.value()) return;
        //var c = new ll.CompositeCommand();
        //if (this._prop.isFromParentKey()) {
        //    c.commands.push(ll.setKey(this._node, n))
        //} else {
        //    if (!n || n.length == 0) {
        //        c.commands.push(ll.removeNode(this._node.parent(), this._node))
        //    } else {
        //        c.commands.push(ll.setAttr(this._node, n))
        //    }
        //}
        //this._node.execute(c);
    }

}



var nodeBuilder=new BasicNodeBuilder()
interface NameToInt{
    [name:string]:number
}

function possibleNodes(p:defs.Property,c:hl.IHighLevelNode):hl.IHighLevelNode[]{
    if (c) {
        if (p.isDescriminating()) {
            var range=p.range();
            if (range.getRuntimeExtenders().length > 0&&c) {
                var extenders = range.getRuntimeExtenders();
                var result:hl.IHighLevelNode[]=[]
                extenders.forEach(x=> {
                    var definitionNodes = globalDeclarations(c).filter(z=>z.definition() == x);
                    result = result.concat(definitionNodes);
                });
                return result;
            }
            return []
        }
        if (p.isReference()) {
            return nodesDeclaringType(p.referencesTo(), c);
        }
        if (p.range().isValueType()) {
            var vt = <defs.ValueType>p.range();
            if (vt.globallyDeclaredBy().length>0) {
                var definitionNodes = globalDeclarations(c).filter(z=>_.find( vt.globallyDeclaredBy(),x=>x==z.definition())!=null);
                return definitionNodes;
            }
        }
    }
    return this._enumOptions;
}
function refFinder(root:hl.IHighLevelNode,node:hl.IHighLevelNode,result:hl.IParseResult[]):void{
    root.elements().forEach(x=>{
        refFinder(x,node,result);
    })
    root.attrs().forEach(a=>{
        var pr=a.property();
        var vl=a.value();
        if (pr.isReference()||pr.isDescriminator()){
            if (typeof vl=='string'){
                var pn=possibleNodes(<any>pr, root);
                if (_.find(pn,x=>x.name()==vl&&x==node)){
                    result.push(a);
                }
            }
            else{
                var st=<StructuredValue>vl;
                if (st) {
                    var vn = st.valueName();
                    var pn=possibleNodes(<any>pr, root);
                    if (_.find(pn,x=>x.name()==vn&&x==node)){
                        result.push(a);
                    }
                    var hnode = st.toHighlevel()
                    if (hnode) {
                        refFinder(hnode, node, result);
                    }
                }
            }
        }
        else{
            var pn=possibleNodes(<any>pr, root);
            if (_.find(pn,x=>x.name()==vl&&x==node)){
                result.push(a);
            }
        }
    });
}
export class ASTNodeImpl extends BasicASTNode implements  hl.IHighLevelNode{

    private _expanded=false;
    _children:hl.IParseResult[];
    _allowQuestion:boolean=false;

    private _isAux
    private _auxChecked=false;
    private _knownIds;

    isAuxilary(){
        if(this._isAux){
            return true;
        }
        if (this._auxChecked){
            return false;
        }
        this._auxChecked=true;
        var mr=_.find(this.lowLevel().children(),x=>x.key()=="masterRef");
        if (mr&&mr.value()){
           this._isAux=true;
           var val=mr.value();
           var unit=(<jsyaml.Project>this.lowLevel().unit().project()).resolve(this.lowLevel().unit().path(),val);
           var api=hl.fromUnit(unit);
           if (api){
               var v=allChildren(<hl.IHighLevelNode>api);
               this._knownIds={};
               v.forEach(x=>this._knownIds[x.id()]=x);
           }
        }
    }
    private insideOfDeclaration():boolean{
        if (this.definition().isDeclaration()){
            return true;
        }
        if (this.parent()){
            return (<ASTNodeImpl>this.parent()).insideOfDeclaration()
        }
    }
    private isAllowedId(){
        var r=<ASTNodeImpl>this.root();
        if (r.definition().name()=="Extension"){
            return true;
        }
        if (r.isAuxilary()){

            if (this.insideOfDeclaration()){
                var vl=this.computedValue("decls")
                if (vl=="true") {
                    return true;
                }

            }
            if (r._knownIds){
                var m=r._knownIds[this.id()]!=null;

                return m;
            }
            return false;
        }
        return true;
    }
    private getExtractedChildren(){
        var r=<ASTNodeImpl>this.root();
        if (r.isAuxilary()){
            if (r._knownIds){
                var i=<hl.IHighLevelNode>r._knownIds[this.id()];
                if (i){
                    return i.children();
                }
            }
            return [];
        }
        return [];
    }

    allowsQuestion():boolean{
        return this._allowQuestion||this.definition().getAllowQuestion();
    }

    findReferences():hl.IParseResult []{
        var rs:hl.IParseResult[]=[];
        refFinder(this.root(),this,rs);
        return rs;
    }

    name(){
        var ka=_.find(this.directChildren(),x=>x.property()&&x.property().isKey());
        if (ka&&ka instanceof ASTPropImpl){
            var c= (<ASTPropImpl>ka).value();
            var io=c.indexOf(':');
            if(io!=-1) {//TODO REVIEW
                return c.substring(0, io);
            }
            return c;
        }
        return super.name();
    }

    findElementAtOffset(n:number):hl.IHighLevelNode{
        return this._findNode(this,n,n);
    }

    isElement(){
        return true;
    }

    private _universe:defs.Universe;
    universe():defs.Universe{
        if (this._universe){
            return this._universe;
        }
        return <any>this.definition().universe()
    }
    setUniverse(u:defs.Universe){
        this._universe=u;
    }

    validate(v:hl.ValidationAcceptor):void {

        if (!this.parent()){
            var u=this.universe();
            var tv=u.getTypedVersion();
            if (tv){
                if (tv.indexOf("#%")==0) {
                    if (tv != "#%RAML 0.8" && tv != "#%RAML 1.0") {
                        var i = createIssue(hl.IssueCode.NODE_HAS_VALUE, "Unknown version of RAML expected to see one of '#%RAML 0.8' or '#%RAML 1.0'", this)
                        v.accept(i);

                    }
                    var tl=u.getTopLevel();
                    if (tl){
                        if (tl!=this.definition().name()){
                            var i=createIssue(hl.IssueCode.NODE_HAS_VALUE,"Unknown top level type:"+tl,this)
                            v.accept(i);

                        }
                    }
                }
            }

        }

        if (!this.isAllowedId()){
            if ((!this.property())||this.property().name()!="annotations") {
                if (this.definition().name()!="GlobalSchema") {
                    var i = createIssue(hl.IssueCode.ONLY_OVERRIDE_ALLOWED, "This node did not overrides any node from master api:" + this.id(), this)
                    v.accept(i);
                }
            }
        }
        if (!this.definition().getAllowAny()) {
            super.validate(v);
        }
        else{
            this.validateIncludes(v);
        };
        checkPropertyQuard(this, v);
        if (typeof this.value()=='string'&&!this.definition().allowValue()){
            var i=createIssue(hl.IssueCode.NODE_HAS_VALUE,"node "+this.name()+" can not be a scalar",this)
            v.accept(i);
        }
        this.definition().requiredProperties().forEach(x=>{
            if (x.range().isValueType()) {
                var nm = this.attr(x.name());
                if (!nm) {

                    var i = createIssue(hl.IssueCode.MISSING_REQUIRED_PROPERTY, "Missing required property " + x.name(), this)
                    v.accept(i);
                }
            }
            else{
                var el = this.elementsOfKind(x.name());
                if (!el||el.length==0) {
                    var i = createIssue(hl.IssueCode.MISSING_REQUIRED_PROPERTY, "Missing required property " + x.name(), this)
                    v.accept(i);
                }
            }
        });

        (<defs.NodeClass>this.definition()).getContextRequirements().forEach(x=>{
            if (!this.checkContextValue(x.name,x.value,this.toRuntimeModel())){
                v.accept(createIssue(hl.IssueCode.MISSED_CONTEXT_REQUIREMENT,x.name+" should be "+x.value+" to use type "+this.definition().name(),this))
            }
        });
        if (this.definition().universe().version()=="RAML08") {
            var m:NameToInt={}
            var els=this.directChildren().filter(x=>x.isElement());
            els.forEach(x=> {
                if ((<BasicASTNode><any>x)["_computed"]){
                    return;
                }
                if (!x.name()){
                    return //handling nodes with no key (documentation)
                }
                var rm=x.lowLevel().parent()?x.lowLevel().parent().end():"";
                var k=x.name()+rm;
                if (m[k]){
                    var i=createIssue(hl.IssueCode.KEY_SHOULD_BE_UNIQUE_INTHISCONTEXT,x.name()+" already exists in this context",x)
                    v.accept(i)
                }
                else{
                    m[k]=1;
                }
            })
        }
        var pr=this.directChildren().filter(x=>x.isAttr());
        var gr=_.groupBy(pr,x=>x.name());
        Object.keys(gr).forEach(x=>{
            if (gr[x].length>1&&!gr[x][0].property().isMultiValue()){
                gr[x].forEach(y=>{
                    var i=createIssue(hl.IssueCode.PROPERTY_EXPECT_TO_HAVE_SINGLE_VALUE,y.property().name()+" should have a single value",y)
                    v.accept(i)
                })
            }
        })
    }
    private _findNode(n:hl.IHighLevelNode,offset:number,end:number):hl.IHighLevelNode{
        if (n==null){
            return null;
        }
        if (n.lowLevel()) {
            //var node:ASTNode=<ASTNode>n;
            if (n.lowLevel().start() <= offset && n.lowLevel().end() >= end) {
                var res:hl.IHighLevelNode = n;
                //TODO INCLUDES
                n.elements().forEach(x=> {
                    if (x.lowLevel().unit()!=n.lowLevel().unit()){
                        return;
                    }
                    var m = this._findNode(x, offset, end);
                    if (m) {
                        res = <hl.IHighLevelNode>m;
                    }
                })
                return res;
            }
        }
        return null;
    }

    isStub(){
        return !this.lowLevel().unit()
    }

    private findInsertionPoint(node:hl.IHighLevelNode|hl.IAttribute):ll.ILowLevelASTNode{
        //always insert attributes at start
        var ch=this.children();
        var toRet:ll.ILowLevelASTNode=null;
        var embed=node.property()&&node.property().isEmbedMap();
        if (embed&&_.find(this.lowLevel().children(),x=>x.key()==node.property().name())){
            embed=false;
        }
        if (node.isAttr()||embed) {
            for (var i = 0; i < ch.length; i++) {
                if (!ch[i].isAttr()){
                    break;
                }
                else{
                    toRet=ch[i].lowLevel();
                }
            }
            if (toRet==null){
                toRet=this.lowLevel();
            }
        }

        return toRet;
    }
    add(node: hl.IHighLevelNode|hl.IAttribute){
        if (!this._children){
            this._children=[];
        }

        var insertionPoint:ll.ILowLevelASTNode = this.findInsertionPoint(node);
        var newLowLevel:ll.ILowLevelASTNode=null;
        var command=new ll.CompositeCommand();
        //now we need to understand to which low level node it should go
        //command.commands.push(ll.insertNode(this.lowLevel(), node.lowLevel()))
        if (node.property().isMerged()||node.property().range().isValueType()){
            //console.log('CASE 1');
            newLowLevel = node.lowLevel();
            command.commands.push(ll.insertNode(this.lowLevel(), newLowLevel, insertionPoint))
        } else{
            //console.log('CASE 2');
            var name = node.property().name();
            var target = this.lowLevel();
            var found = (<jsyaml.ASTNode>this.lowLevel()).find(name);
            if (!found){
                var nn:jsyaml.ASTNode = null;
                //var nn: jsyaml.ASTNode = jsyaml.createSeqNode(name);
                //var mapping = <yaml.YAMLMapping>nn._actualNode();
                //var seq: yaml.YAMLSequence = <yaml.YAMLSequence>mapping.value;
                //if(!seq.items) seq.items = [];
                //seq.items.push((<jsyaml.ASTNode>node.lowLevel())._actualNode());
                if (node.property().isEmbedMap()){
                    nn=jsyaml.createSeqNode(name);
                    //console.log('NN: ' + yaml.Kind[nn._actualNode().kind]);
                    nn.addChild(node.lowLevel());
                }
                else{
                    nn=jsyaml.createNode(name);
                    nn.addChild(node.lowLevel());
                }
                newLowLevel=nn;
                command.commands.push(ll.insertNode(target, nn,insertionPoint))
            } else {
                //console.log('case 22');
                if (node.property().isEmbedMap()){
                    newLowLevel=node.lowLevel();
                    command.commands.push(ll.insertNode(found, node.lowLevel(),insertionPoint,true));
                } else {
                    newLowLevel=node.lowLevel();
                    command.commands.push(ll.insertNode(found, node.lowLevel(),insertionPoint,false));
                }
            }

        }
        if (this.isStub()){
            this._children.push(node);
            //TODO behavior should be smarter we are ignoring insertion points now
            command.commands.forEach(x=>this.lowLevel().addChild(<ll.ILowLevelASTNode>x.value));
            return;
        }
        this.lowLevel().execute(command)
        this._children.push(node);
        //now we need to add new child to our children;

    }
    remove(node:hl.IHighLevelNode|hl.IAttribute){
        if (this.isStub()){
            if (!this._children){
                return;
            }
            this._children=this._children.filter(x=>x!=node);
            return;
        }
        var command=new ll.CompositeCommand();
        if (node instanceof ASTNodeImpl){
            var aNode=<ASTNodeImpl>node;
            if (!aNode.property().isMerged()){
                if (this.elementsOfKind(aNode.property().name()).length==1){
                    command.commands.push(ll.removeNode(this.lowLevel(), aNode.lowLevel().parent().parent()))
                } else {
                    command.commands.push(ll.removeNode(this.lowLevel(), aNode.lowLevel()))
                }
            } else {
                command.commands.push(ll.removeNode(this.lowLevel(), aNode.lowLevel()))
            }
        } else {
            command.commands.push(ll.removeNode(this.lowLevel(), node.lowLevel()))
        }
        this.lowLevel().execute(command)
        //update high level
        this._children=this._children.filter(x=>x!=node);
    }

    dump(flavor:string):string{
        return this._node.dump()
    }
    constructor(node:ll.ILowLevelASTNode, parent:hl.IHighLevelNode,private _def:hl.INodeDefinition,private _prop:hl.IProperty){
        super(node,parent)
        if(node) {
            node.setHighLevelNode(this);
        }
    }



    patchType(d:hl.INodeDefinition){
        this._def=d;
        this._children=null;
    }

    children():hl.IParseResult[] {

        if (this._children){
            var extra=this.getExtractedChildren();
            var res=this._children.concat(extra);
            return res;
        }
        if (this._node) {
            this._children = nodeBuilder.process(this, this._node.children());
            this._children=this._children.filter(x=>x!=null);
            //FIXME
            var extra=this.getExtractedChildren();
            var res=this._children.concat(extra);
            return res;

        }
        return [];
    }
    directChildren():hl.IParseResult[] {

        if (this._children){
            return this._children;
        }
        if (this._node) {
            this._children = nodeBuilder.process(this, this._node.children());
            return this._children;

        }
        return [];
    }

    resetChildren(){
        this._children = null;
    }

    //createAttr(n:string,v:string){
    //    var mapping=jsyaml.createMapping(n,v);
    //    this._node.addChild(mapping);
    //    this._children=null;
    //}

    createAttr(n:string,v:string){
        var mapping=jsyaml.createMapping(n,v);
        //console.log('create attribute: ' + n);
        if(this.isStub()) {
            this._node.addChild(mapping);
            this._children=null;
        } else {
            //this._node.addChild(mapping);
            this._children=null;
            var command=new ll.CompositeCommand();
            command.commands.push(ll.insertNode(this.lowLevel(), mapping, null));
            this.lowLevel().execute(command);
        }
    }


    isAttr():boolean{
        return false;
    }
    isUnknown():boolean{
        return false;
    }
    value():any{
        return this._node.value();
    }

    valuesOf(propName:string):hl.IHighLevelNode[]{
        var pr= this._def.property(propName)
        if (pr!=null){
            return this.elements().filter(x=>x.property()==pr);
        }
        return [];
    }
    attr(n:string):hl.IAttribute{
        return _.find(this.attrs(),y=>y.name()==n);
    }

    attrOrCreate(name: string):hl.IAttribute{
        var a = this.attr(name);
        if(!a) this.createAttr(name, '');
        return this.attr(name);
    }

    attributes(n:string):hl.IAttribute[]{
        return _.filter(this.attrs(),y=>y.name()==n);
    }


    attrs():hl.IAttribute[]{


        return <hl.IAttribute[]>this.children().filter(x=>x.isAttr());
    }

    allAttrs():hl.IAttribute[]{
        var attrs = <hl.IAttribute[]>this.children().filter(x=>x.isAttr());
        var attributes = [];
        //console.log('Attributes(' + this.definition().name() + '): ');
        (<NodeClass>this.definition()).allProperties().forEach(x=>{
            if(x.range().isValueType()&&!x.isSystem()){
                var a = _.find(attrs,y=>y.name()==x.name());
                //var a = this.attr(x.name());
                if (a){
                    //console.log('  real   : ' + x.name() + ' = ' + a.value());
                    attributes.push(a);
                } else {
                    a = new VirtualAttribute(this, this.definition(), x, false);
                    //console.log('  virtual: ' + x.name());
                    attributes.push(a);
                }
            }
        })
        return attributes;
    }

    elements():hl.IHighLevelNode[]{
        return <hl.IHighLevelNode[]>this.children()
            .filter(x=>!x.isAttr()&&!x.isUnknown())
    }
    element(n:string):hl.IHighLevelNode{
        var r= this.elementsOfKind(n)
        if (r.length>0){
            return r[0];
        }
        return null;
    }

    elementsOfKind(n:string):hl.IHighLevelNode[]{
        var r= this.elements().filter(x=>x.property().name()==n)
        return r;
    }


    definition():hl.INodeDefinition {
        return this._def;
    }

    property():hl.IProperty {
        return this._prop;
    }

    isExpanded():boolean {
        return this._expanded;
    }

    copy(): ASTNodeImpl {
        return new ASTNodeImpl(this.lowLevel().copy(), this.parent(), this.definition(), this.property());
    }


}
