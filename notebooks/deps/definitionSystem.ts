/// <reference path="./typings/tsd.d.ts" />
import highLevel=require('./highLevelAST')
import _ =require("underscore")
import hlimpl=require('./highLevelImpl')
import ll=require('./lowLevelAST')
import jsyaml=require('./jsyaml2lowLevel')
import su=require('./schemaUtil')
import selector=require('./selectorMatch')
import ramlexp=require('./ramlExpressions')
import defs=require('./definitionSystem')
/**
 * What is our universe at first we have node types
 * they have following fundamental properties:
 * some nodes can fold to another kinds of nodes
 *
 */
export interface IType extends highLevel.ITypeDefinition{

    name():string
    description():string
    isValueType():boolean
    //TODO refactor value types with structure
    isUnionType():boolean;
    properties():Property[]
    annotations():Annotation[]
    universe():Universe
}

export class Annotation{

    constructor(private _name:string){

    }

    name():string{
        return this._name;
    }
}

export class Described{
    constructor(private _name,private _description=""){}

    name():string{return this._name;}
    description():string{return this._description}


    private _issues:string[]=[]
    private _toClarify:string[]=[]
    private _itCovers:string[]=[]

    private _tags:string[]=[]

    private _version:string;


    withIssue(description:string){
        this._issues.push(description);
        return this;
    }
    withTag(description:string){
        this._tags.push(description);
        return this;
    }
    withClarify(description:string){
        this._toClarify.push(description);
        return this;
    }
    getCoveredStuff(){
        return this._itCovers;
    }

    withThisFeatureCovers(description:string){
        this._itCovers.push(description);
        return this;
    }
    withVersion(verstion:string){
        this._version=verstion;
    }
    version(){
        return this._version;
    }

    issues(){
        return this._issues;
    }
    toClarify(){
        return this._toClarify;
    }
    tags(){
        return this._tags;
    }

    withDescription(d:string){
        this._description=d;
        return this;
    }
}

export class ValueRequirement{
    constructor(public name:string,public value:string){}
}
export class AbstractType extends Described{

     _superTypes:highLevel.ITypeDefinition[]=[];
     _subTypes:highLevel.ITypeDefinition[]=[];
    _annotations:Annotation[]=[];
    _requirements:ValueRequirement[]=[];
    _aliases:string[]=[];
    _consumesRef:boolean
    _defining:string[]=[]
    setConsumesRefs(b:boolean){
        this._consumesRef=b;
    }
    definingPropertyIsEnough(v:string){
        this._defining.push(v);
    }
    getDefining(){
        return this._defining;
    }

    getConsumesRefs(){
        return this._consumesRef
    }
     private _fDesc:string;

    addAlias(al:string){
        this._aliases.push(al);
    }
    getAliases(){
        return this._aliases;
    }
    private _nameAtRuntime:string

    isValid(h:highLevel.IHighLevelNode,v:any,p:highLevel.IProperty){
        return true;
    }
    getPath(){
        return this._path;
    }

    withFunctionalDescriminator(code:string){
        this._fDesc=code;
    }
    _methods:{name:string;text:string}[]=[]

    addMethod(name:string,text:string){
        this._methods.push({name:name,text:text})
    }
    methods(){
        return this._methods;
    }
    setNameAtRuntime(name:string){
        this._nameAtRuntime=name;
    }
    getNameAtRuntime(){
        return this._nameAtRuntime;
    }
    getFunctionalDescriminator(){
        return this._fDesc;
    }


    constructor(_name:string,public _universe:Universe,private _path:string){
       super(_name)
    }
    getRuntimeExtenders(){
        return []
    }
    universe(){
        return this._universe;
    }

    superTypes():highLevel.ITypeDefinition[]{
        return [].concat(this._superTypes);
    }

    subTypes():highLevel.ITypeDefinition[]{
        return [].concat(this._subTypes);
    }

    allSubTypes():highLevel.ITypeDefinition[]{
        var rs:highLevel.ITypeDefinition[]=[];
        this.subTypes().forEach(x=>{
            rs.push(x);
            rs=rs.concat(x.allSubTypes());
        })
        return _.unique(rs);
    }
    allSuperTypes():highLevel.ITypeDefinition[]{
        var rs:highLevel.ITypeDefinition[]=[];
        this.superTypes().forEach(x=>{
            rs.push(x);
            rs=rs.concat((<AbstractType><any>x).allSuperTypes());
        })
        return _.unique(rs);
    }

    addRequirement(name:string,value:string){
        this._requirements.push(new ValueRequirement(name,value))
    }

    //FIXME simplify it
    valueRequirements(){
        return this._requirements;
    }

    annotations(){
        return this._annotations;
    }
}






export class ValueType extends AbstractType implements IType,highLevel.IValueTypeDefinition{
    constructor(name,_universe:Universe,path:string,description="",private _restriction:ValueRestriction=null){
        super(name,_universe,path);
    }
    hasStructure():boolean{
        if (this.name()=="structure"){
            return true;
        }
        return false;
    }
    isValid(h:highLevel.IHighLevelNode, v:any,p:highLevel.IProperty):any{
        //FIXME
        try {

            if (this.name() == "AnnotationRef") {
                var targets=p.referenceTargets(h);
                var actualAnnotation=<highLevel.IHighLevelNode>_.find(targets,x=>hlimpl.qName(x,h)==v);
                if (actualAnnotation!=null){
                    var attrs=actualAnnotation.attributes("allowedTargets");
                    if (attrs){
                        var aVals=attrs.map(x=>x.value());
                        if (aVals.length>0){
                            var found=false;
                            //no we should actually check that we are applying annotation properly
                            var tps=h.definition().allSuperTypes();
                            tps=tps.concat([h.definition()])
                            var tpNames=tps.map(x=>x.name());
                            aVals.forEach(x=>{
                                if (_.find(tpNames,y=>y==x)){
                                    found=true;
                                }
                                else{
                                    if(x=="Parameter"){
                                        if (h.computedValue("location")){
                                            found=true;
                                        }
                                    }
                                    if(x=="Field"){
                                        if (h.computedValue("field")){
                                            found=true;
                                        }
                                    }
                                }
                            });
                            if (!found){
                                return new Error("annotation "+v+" can not be placed at this location, allowed targets are:"+aVals)
                            }
                        }
                    }
                }
                return tm;
            }
            if (this.name() == "SchemaString") {
                var tm = su.createSchema(v);
                if (tm instanceof Error){
                    (<any>tm).canBeRef=true;
                }
                return tm;
            }
            if (this.name() == "JSonSchemaString") {
                var jsshema = su.getJSONSchema(v);

                if (jsshema instanceof Error){
                    (<any>jsshema).canBeRef=true;
                }
                return jsshema;
            }
            if (this.name() == "XMLSchemaString") {
                var xmlschema = su.getXMLSchema(v);

                if (xmlschema instanceof Error){
                    (<any>xmlschema).canBeRef=true;
                }
                return xmlschema;
            }
            if (this.name() == "BooleanType") {
                if (!(v == 'true' || v == 'false')){
                    return new Error("'true' or 'false' is expected here")
                }
            }
            if (this.name() == "NumberType") {
                var q=parseFloat(v);
                if (isNaN(q)){
                    return new Error("number is expected here")
                }
            }
            if (this.name()=='ramlexpression'){
                try {
                    if (p.name()=='condition'){
                        if (h.computedValue("response")) {
                            h = h.parent().parent().parent();
                        }
                        else{
                            h=h.parent().parent();
                        }
                    }
                    if (p.name()=='validWhen'||p.name()=='requiredWhen'){
                        h=h.parent();
                    }
                    ramlexp.validate(v, h);
                } catch (e){
                    return e;
                }
            }
            if (this.name()=="pointer") {
                var pointer = hlimpl.resolveRamlPointer(h, v);
                if (!pointer) {
                    return new Error("Unable to resolve raml pointer:" + v);
                }
                else{
                    var dp=<defs.Property>p;
                    var sl=dp.getSelector(h);
                    if (sl){
                        var pp=h;
                        if (pp.definition().isAnnotation()){
                            pp=pp.parent();
                        }
                        var options=sl.apply(pp);
                        if (!_.find(options,x=>x==pointer)){
                            return new Error("Pointer does not fits to scope " + v);
                        }
                    }
                }
            }
            if (this.name()=="RAMLSelector") {
                try {
                    var sl = selector.parse(h,v);
                    return sl;
                } catch(e){
                    return new Error("Unable to parse RAML selector :"+e.message);
                }
            }
            return true;
        } catch (e){
            e.canBeRef=true;//FIXME
            return e;
        }
    }

    isValueType(){
        return true;
    }
    isUnionType(){
        return false;
    }
    properties(){return []}

    allProperties():Property[]{return []}

    private _declaredBy:NodeClass[]=[];

    globallyDeclaredBy():NodeClass[]{
        return this._declaredBy;
    }
    setGloballyDeclaredBy(c:NodeClass){
        this._declaredBy.push(c);
    }

    getValueRestriction(){
        return this._restriction;
    }
    match(r:highLevel.IParseResult):boolean{
        return false;
    }

}
export class EnumType extends ValueType{
    values:string[]=[];
}

export class ReferenceType extends ValueType{

   constructor(name:string,path:string,private referenceTo:string,_universe:Universe){
     super(name,_universe,path)
   }



   getReferencedType():NodeClass{
       return <NodeClass>this.universe().getType(this.referenceTo);
   }

    hasStructure():boolean{
        var rt=this.getReferencedType();
        if (rt) {
            return rt.isInlinedTemplates()||(rt.findMembersDeterminer()!=null);
        }
        else{
            return false;
        }
    }
}
export class ScriptingHookType extends ValueType{
    constructor(name:string,path:string,private refTo:string,_universe:Universe){
        super(name,_universe,path)
    }

    getReferencedType():NodeClass{
        return <NodeClass>this.universe().getType(this.refTo);
    }

}


export class NodeClass extends AbstractType implements IType,highLevel.INodeDefinition{
    private _properties:Property[]=[];
    private _isAbstract:boolean
    private _declaresType:string=null;
    private _runtimeExtenders:IType[]=[]
    private _inlinedTemplates:boolean=false;
    private _contextReq:{name:string;value:string}[]=[]
    private _actuallyExports:string
    private _convertsToGlobal:string
    private _allowAny:boolean
    private _allowQuestion:boolean=false;
    private _referenceIs:string;
    private _canInherit:string[]=[];
    private _allowValueSet:boolean
    private _allowValue:boolean
    private _isAnnotation:boolean;
    private _annotationChecked:boolean;




    isDeclaration(){
        if (this._inlinedTemplates){
            return true;
        }
        if (this._convertsToGlobal){
            return true;
        }
        if (this._declaresType){
            return true;
        }
        if (this.name()=="Library"){
            return true;
        }
        return false;
    }

    isAnnotation():boolean{
        if (this._annotationChecked){
            return this._isAnnotation;
        }
        this._annotationChecked=true;
        this._isAnnotation=(_.find(this.allSuperTypes(),x=>x.name()=="Annotation")!=null);
        return this._isAnnotation
    }

    allowValue():boolean{
        if (this._allowValueSet){
            return this._allowValue;
        }
        if (_.find(this.allProperties(),x=>x.isValue()||x.canBeValue())){
            this._allowValue=true;
            this._allowValueSet=true;
            return true;
        }
        this._allowValueSet=true;
        return false;
    }

    withCanInherit(clazz:string){
        this._canInherit.push(clazz);
    }

    getCanInherit(){
        return this._canInherit;
    }
    getReferenceIs(){
        return this._referenceIs;
    }

    withReferenceIs(fname:string){
        this._referenceIs=fname;
    }

    withAllowQuestion(){
        this._allowQuestion=true;
    }
    requiredProperties():Property[]{
        return this.allProperties().filter(x=>x.isRequired());
    }
    getAllowQuestion(){
        return this._allowQuestion;
    }

    withAllowAny(){
        this._allowAny=true;
    }

    getAllowAny(){
        return this._allowAny;
    }


    withActuallyExports(pname:string){
        this._actuallyExports=pname;
    }
    withConvertsToGlobal(pname:string){
        this._convertsToGlobal=pname;
    }
    getConvertsToGlobal(){
        return this._convertsToGlobal;
    }
    getActuallyExports(){
        return this._actuallyExports;
    }


    withContextRequirement(name:string,value:string){
        this._contextReq.push({name:name,value:value});
    }
    getContextRequirements(){
        return this._contextReq;
    }

    isGlobalDeclaration():boolean{
        if (this._actuallyExports){
            return true;
        }
        if (this._inlinedTemplates){
            return true;
        }
        if (this._declaresType){
            return true;
        }
        return false;
    }

    findMembersDeterminer(){
        return _.find(this.properties(), x=>x.isThisPropertyDeclaresTypeFields())
    }


    isTypeSystemMember(){
        return this._declaresType!=null;
    }
    hasStructure():boolean{
        return true;
    }

    getExtendedType():IType{
        return this.universe().type(this._declaresType)
    }

    setInlinedTemplates(b:boolean){
        this._inlinedTemplates=b;
        return this;
    }

    isInlinedTemplates(){
        return this._inlinedTemplates;
    }

    setExtendedTypeName(name:string){
        this._declaresType=name;
        var tp=this.universe().type(name);
        if (tp instanceof NodeClass){
            var nc=<NodeClass>tp;
            nc._runtimeExtenders.push(this);
        }

    }

    //private vReqInitied=false;

    getRuntimeExtenders(){
        return this._runtimeExtenders;
    }

    createStubNode(p: highLevel.IProperty, key: string=null): highLevel.IHighLevelNode {
        var lowLevel:ll.ILowLevelASTNode = jsyaml.createNode(key?key:"key");
        var nm = new hlimpl.ASTNodeImpl(lowLevel,null,this,p);
        this.allProperties().forEach(x=>{
            if(x.range().isValueType()&&!x.isSystem()){
                var a = nm.attr(x.name());
                if (!a){
                    //nm.createAttr(x.name(),"")
                }
            }
        })
        nm.children();
        return nm;
    }

    descriminatorValue():string{
        if (this.valueRequirements().length==0){
            return this.name();
        }
        return this.valueRequirements()[0].value;
    }

    match(r:highLevel.IParseResult,alreadyFound:highLevel.ITypeDefinition):boolean{

            //this.vReqInitied=true;
        if( r.isAttr()||r.isUnknown()){
            return false;
        }
        var el:highLevel.IHighLevelNode=<highLevel.IHighLevelNode>r;

        if (this.name()=="ObjectField"){
           var tp= el.attr("type");
            if (tp&&tp.value()) {
                //FIXME
                if (!_.find(["string","boolean","file","number","integer","date","pointer","script"], x=>x==tp.value())) {
                    return true;
                }
            }
        }
        var hasSuperType=_.find(this.superTypes(),x=>{
                var dp= _.find(x.allProperties(),x=>(<Property>x).isDescriminating())
                if (dp) {
                    var a = el.attr(dp.name());
                    if (a) {
                        if (a.value() == this.name()) {
                            return true;
                        }
                    }
                }
                return false;
            }
        );
        if (hasSuperType){
            return true;
        }

        if (this.valueRequirements().length==0){
            return false;
        }
        var matches=true;

        //descriminating constraint
        this.valueRequirements().forEach(x=>{
            var a=el.attr(x.name);
            if (a){
                if (a.value()==x.value){
                    //do nothing
                }
                else{
                    if (this.getConsumesRefs()){
                        var vl=a.value();
                        var allSubs:AbstractType[]=[];
                        this.superTypes().forEach(x=>x.allSubTypes().forEach(y=>{
                           allSubs.push(<any>y);
                        }));
                        var allSubNames:string[]=[];
                        _.unique(allSubs).forEach(x=>{
                            allSubNames.push(x.name());
                            x.valueRequirements().forEach(y=>{
                                allSubNames.push(y.value)
                            });
                            x.getAliases().forEach(y=>allSubNames.push(y))
                        })
                        if (_.find(allSubNames,x=>x==vl)) {
                            matches = false;
                        }
                    }
                    else {
                        matches = false;
                    }
                }
            }
            else{
                var m=this.getDefining();
                var ms=false;
                m.forEach(x=>{
                    el.lowLevel().children().forEach(y=>{
                        if (y.key()==x) {
                            ms = true;
                        }
                        if (y.key()=="$ref"){
                            if (el.definition().universe().version()=="Swagger") {
                                var resolved = hlimpl.resolveReference(y, y.value());
                                if (resolved) {
                                    if (_.find(resolved.children(), z=>z.key() == x)) {
                                        ms = true;
                                    }
                                }
                            }
                        }
                    }
                )});
                if (ms){
                    matches=true;
                    return;
                }
                if (!alreadyFound) {
                    var pr = this.property(x.name)
                    if (pr && pr.defaultValue() == x.value) {
                        //do nothing
                    }
                    else {
                        matches = false;
                    }
                }
            }
        })
        return matches;
    }
    private _props:Property[];
    allProperties():Property[]{
        if (this._props){
            return this._props;
        }
        var n:{[name:string]:Property}={}
        if (this.superTypes().length>0){
            this.superTypes().forEach(x=>{
                x.allProperties().forEach(y=>n[y.name()]=<any>y);
            })
        }
        this._properties.forEach(x=>n[x.name()]=x);
        this._props=Object.keys(n).map(x=>n[x]);
        return this._props;
    }

    constructor(_name,universe:Universe,path:string,_description="") {
        super(_name,universe,path)
    }


    isValueType(){
        return false;
    }
    isAbstract(){
        return this._isAbstract;
    }

    isUnionType(){
        return false;
    }
    property(propName:string):Property {
        return _.find(this.allProperties(), x=>x.name() == propName);
    }

    properties():Property[]{
        return [].concat(this._properties)
    }

    getKeyProp():Property{
        return _.find(this._properties,x=>x.isKey())
    }

    registerProperty(p:Property){
        if (p.domain()!=this){
            throw new Error("Should be already owned by this");
        }
        if (this._properties.indexOf(p)!=-1){
            throw new Error("Already included");
        }
        this._properties.push(p);
    }

    //what means default mediaType

    //it is property with values.

    /**
     * body:
     *   schema: names
     *   example: !include examples/names.json
     *
     * ->
     *  body->mime(default media type (created on body instance as low level base))->schema
     *
     */
}

export class Universe extends Described implements highLevel.IUniverse{

    private _classes:IType[]=[]
    private _uversion:string="RAML08"


    private _topLevel:string;
    private _typedVersion:string;

    setTopLevel(t:string){
        this._topLevel=t;
    }
    getTopLevel(){
        return this._topLevel;
    }

    setTypedVersion(tv:string){
        this._typedVersion=tv;
    }
    getTypedVersion(){
        return this._typedVersion;
    }

    version(){
        return this._uversion;
    }

    setUniverseVersion(version:string){
        this._uversion=version;
    }
    types():IType[]{
        var result=[].concat(this._classes);
        if (this._parent!=null){
            result=result.concat(this._parent.types());
        }
        return result;
    }

    type(name:string){
        if(this.aMap[name]){
            return this.aMap[name];
        }
        var tp= _.find(this._classes,x=>x.name()==name)
        if(tp==null){
            if (this._parent){
                var tp= this._parent.type(name);
                if (tp instanceof AbstractType){
                    var at=<AbstractType><any>tp;
                    at._universe=this;//FIXME
                }
            }
        }
        return tp;
    }

    getType(name):highLevel.ITypeDefinition {
        return this.type(name);
    }

    register(t:IType){
        this._classes.push(t);
        if (t instanceof NodeClass) {
            this._classes.forEach(x=> {
                if (x instanceof NodeClass) {
                    var nc = x;
                    if (nc.getExtendedType() == t) {
                        t.getRuntimeExtenders().push(x)
                    }
                }}
                )
        }
        return this;
    }
    private aMap:{ [name:string]:IType}={}
    registerAlias(a:string,t:IType){
        this.aMap[a]=t;
    }
    unregister(t:IType){
        this._classes=this._classes.filter(x=>x!=t);
        var st=t.superTypes();
        st.forEach(x=>{
            var a:AbstractType=(<any>x);
            a._superTypes=a._superTypes.filter(x=>x!=t);
        })
        st=t.subTypes();
        st.forEach(x=>{
            var a:AbstractType=(<any>x);
            a._subTypes=a._subTypes.filter(x=>x!=t);
        })
        return this;
    }

    constructor(name:string="",private _parent:Universe=null,v:string="RAML08"){
        super(name)
        this._uversion=v;
    }

    registerSuperClass(t0:IType,t1:IType){
        var a0:AbstractType=(<any>t0);
        var a1:AbstractType=(<any>t1);
        a0._superTypes.push(t1);
        a1._subTypes.push(t0);
    }

}

export interface Status{
    isOk():boolean
    message():string;
}
export class ValueRestriction{


    test(n:highLevel.IAttribute,p:Property,value:any):Status{
        throw new Error("Should be overriden in subclasses")
    }
}

/**
 * references element in upper hierarchy
 */
export class ReferenceTo extends ValueRestriction{
    constructor(private _requiredClass:NodeClass){
        super();
    }

    requiredClass(){
        return this._requiredClass;
    }
}

/**
 * should be fixed set
 */
export class FixedSetRestriction extends ValueRestriction{

    constructor(private _allowedValues:any[]){
     super();
    }

    values(){
        return this._allowedValues;
    }
}

/**
 * should be reg exp
 */
export class RegExpRestriction extends ValueRestriction{
    constructor(private _regExp:RegExp){
        super()
    }
    regeExp():RegExp{
        return this._regExp
    }
}

export class UnionType implements IType{
    constructor(private _base:IType[]){

    }
    getRuntimeExtenders(){
        return [];
    }
    methods(){
        return [];
    }
    superTypes():highLevel.ITypeDefinition[]{
        return [];
    }

    allSuperTypes(){
        return []
    }

    subTypes():highLevel.ITypeDefinition[]{
        return [];
    }
    name(){
        return this._base.map(x=>x.name()).join(",")
    }
    hasStructure(){
        return false;
    }
    description(){
        return ""
    }
    isValid(){
        return true;
    }

    universe(){
        return this._base[0].universe();
    }


    match(r:highLevel.IParseResult):boolean{
        return false;
    }

    allSubTypes():highLevel.ITypeDefinition[]{
        throw  new Error("Union types should not be used in this context")

    }

    annotations():Annotation[]{
        throw  new Error("Union types should not be used in this context")
    }

    allProperties():Property[]{
        throw new Error("Union types should be never used in this context")
    }

    getAlternatives():IType[]{
        return [].concat(this._base)
    }
    valueRequirements():{name:string;value:string}[]{
        throw new Error("Union types should be never used in this context")
    }

    properties(){
       var res:Property[]=[];
       this._base.forEach(x=>res.concat(x.properties()))
       return res;
    }

    isValueType(){
        if (this._base.filter(x=>(x.isValueType()==true)).length==this._base.length){
            return true;
        }
        if (this._base.filter(x=>(x.isValueType()==false)).length==this._base.length){
            return false;
        }
        return null;
    }

    isUnionType(){
        return true;
    }

}



export class PropertyTrait{

}
export class DefinesImplicitKey extends PropertyTrait{

    constructor(private _where:NodeClass,private _childKeyDefined:NodeClass){
        super()
    }

    where(){
        return this._where;
    }
    definesKeyOf(){
        return this._childKeyDefined;
    }
}

export class ExpansionTrait extends PropertyTrait{
    constructor(){
        super();
    }
}
export function prop(name:string,desc:string,domain:NodeClass,range:IType):Property{
    var prop=new Property(name,desc);
    return prop.withDomain(domain).withRange(range)
}
export class ChildValueConstraint{
    constructor(public name:string,public
    value:string){}
}

export class Property extends Described implements highLevel.IProperty{

    private _ownerClass:NodeClass
    private _nodeRange:IType

    private _groupName:string;
    private _keyShouldStartFrom:string=null;
    private _isMultiValue:boolean=false;
    private _isFromParentValue:boolean=false;
    private _isFromParentKey:boolean=false;

    private _isRequired:boolean=false;
    private _key:boolean=false;
    private _traits:PropertyTrait[]=[]
    private _enumOptions:string[];
    private _isEmbedMap:boolean
    private _defaultVal:string
    private _isSystem:boolean;
    private _declaresFields:boolean;
    private _describes:string=null;
    private _descriminates:boolean=false;
    private _propertyGrammarType:string;
    private _inheritsValueFromContext:string;
    private _canBeDuplicator:boolean
    private _isAllowNull:boolean
    private _canBeValue:boolean;
    private _isInherited:boolean
    private _oftenKeys:string[]
    private _vprovider:highLevel.IValueDocProvider
    private _suggester:highLevel.IValueSuggester

    private _selector:selector.Selector|string;

    getSelector(h:highLevel.IHighLevelNode):selector.Selector{
        var sl:any=this._selector;
        if (sl instanceof selector.Selector){
            return <selector.Selector>sl;
        }
        if (!h){
            return null;
        }
        if (this._selector) {
            return selector.parse(h, <string>this._selector);
        }
        return null;
    }
    setSelector(s:selector.Selector|string){
        this._selector=s;
        return this
    }
    valueDocProvider():highLevel.IValueDocProvider{
        return this._vprovider;
    }
    setValueDocProvider(v:highLevel.IValueDocProvider){
        this._vprovider=v;
        return this;
    }
    suggester():highLevel.IValueSuggester{
        return this._suggester;
    }
    setValueSuggester(s:highLevel.IValueSuggester){
        this._suggester=s;
    }
    enumOptions():string[]{
        return this._enumOptions;
    }

    getOftenKeys(){
        return this._oftenKeys;
    }

    withOftenKeys(keys:string[]){
        this._oftenKeys=keys;
        return this;
    }
    withCanBeValue(){
        this._canBeValue=true;
        return this;
    }
    withInherited(w:boolean){
        this._isInherited=w;
    }
    isInherited(){
        return this._isInherited;
    }

    isAllowNull(){
        return this._isAllowNull;
    }
    withAllowNull(){
        this._isAllowNull=true;
    }

    isDescriminator(){
        return this._descriminates;
    }

    getCanBeDuplicator(){
        return this._canBeDuplicator
    }
    isValue():boolean{
        return this._isFromParentValue;
    }

    canBeValue():boolean{
        return this._canBeValue;
    }

    setCanBeDuplicator(){
        this._canBeDuplicator=true;
        return true;
    }

    inheritedContextValue(){
        return this._inheritsValueFromContext;
    }

    withInheritedContextValue(v:string){
        this._inheritsValueFromContext=v;
        return this;
    }

    withPropertyGrammarType(pt:string){
        this._propertyGrammarType=pt;
    }
    getPropertyGrammarType(){
        return this._propertyGrammarType;
    }

    private _contextReq:{name:string;value:string}[]=[]
    private _vrestr:{exp:string;message:string}[]=[]

    withContextRequirement(name:string,value:string){
        this._contextReq.push({name:name,value:value});
    }
    getContextRequirements(){
        return this._contextReq;
    }

    withDescriminating(b:boolean){
        this._descriminates=b;
        return this;
    }
    isDescriminating(){
        return this._descriminates;
    }


    withDescribes(a:string){
        this._describes=a;
        return this;
    }
    withValueRewstrinction(exp:string,message:string){
        this._vrestr.push({exp:exp,message:message});
        return this;
    }
    getValueRestrictionExpressions(){
        return this._vrestr;
    }

    describesAnnotation(){
        return this._describes!=null;
    }
    describedAnnotation(){
        return this._describes
    }


    createAttr(val:any):highLevel.IAttribute{
        var lowLevel:ll.ILowLevelASTNode=jsyaml.createMapping(this.name(),val);
        var nm=new hlimpl.ASTPropImpl(lowLevel,null,this.range(),this);
        return nm;
    }
    
    private _newInstanceName:string;

    isReference(){
        return this.range() instanceof ReferenceType
    }

    referencesTo():IType{
        return <IType>(<ReferenceType>this.range()).getReferencedType();
    }

    newInstanceName():string{
        if (this._newInstanceName){
            return this._newInstanceName;
        }
        return this.range().name()
    }
    withThisPropertyDeclaresFields(b:boolean=true){
        this._declaresFields=b;
        return this;
    }
    isThisPropertyDeclaresTypeFields(){
        return this._declaresFields;
    }

    withNewInstanceName(name:string){
        this._newInstanceName=name;
        return this;
    }


    private determinesChildValues:ChildValueConstraint[]=[]

    addChildValueConstraint(c:ChildValueConstraint){
        this.determinesChildValues.push(c);
    }

    setDefaultVal(s:string){
        this._defaultVal=s;
        return this;
    }

    defaultValue(){
        return this._defaultVal;
    }

    getChildValueConstraints():ChildValueConstraint[]{
        return this.determinesChildValues;
    }
    childRestrictions():{name:string;value:any}[]{
        return this.determinesChildValues;
    }


    isSystem(){
        return this._isSystem;
    }
    withSystem(s:boolean){
        this._isSystem=s;
        return this;
    }


    isEmbedMap(){
        return this._isEmbedMap
    }
    withEmbedMap(){
        this._isEmbedMap=true;
        return this;
    }

    enumValues(c:highLevel.IHighLevelNode):string[]{
        if (c) {
            var rs:string[]=[];
            //TODO FIXME it is very very weird idea but I need to get it working right now

            if ((this.name()=="type"&&this.domain().name()=="DataElement")||(this.name()=="schema"&&this.domain().name()=="BodyLike")){
                var definitionNodes = hlimpl.globalDeclarations(c).filter(node=>{
                    if (node.definition().name()=="GlobalSchema"){
                        return true;
                    }
                    var st=node.definition().allSuperTypes();
                    if (_.find(st,x=>x.name()=="DataElement")){
                        return true;
                    }
                    return node.definition().name()=="DataElement"&&node.property().name()=='models'
                    //return true;
                })
                rs= definitionNodes.map(x=>hlimpl.qName(x,c));
            }
            if (this.isDescriminating()) {
                var subTypes = hlimpl.subTypesWithLocals(this.domain(), c);
                rs=rs.concat( subTypes.map(x=>(<NodeClass>x).descriminatorValue()));
            }
            else if (this.isReference()) {
                rs= hlimpl.nodesDeclaringType(this.referencesTo(), c).map(x=>hlimpl.qName(x,c));
            }
            else if (this.range().isValueType()) {
                var vt = <ValueType>this.range();

                if (vt.globallyDeclaredBy().length>0) {
                    var definitionNodes = hlimpl.globalDeclarations(c).filter(z=>
                    _.find(
                        vt.globallyDeclaredBy(), x=>x==z.definition())!=null);
                    rs= rs.concat(definitionNodes.map(x=>hlimpl.qName(x,c)));
                }
            }
            if (this.isAllowNull()){
                rs.push("null")
            }
            if (this._enumOptions) {
                rs=rs.concat(this._enumOptions);
            }
            return rs;
        }
        return this._enumOptions;
    }



    referenceTargets(c:highLevel.IHighLevelNode):highLevel.IHighLevelNode[]{
        if (this.isDescriminating()){
            var subTypes=hlimpl.nodesDeclaringType(this.range(),c);
            return subTypes;
        }
        if (this.isReference()){
            var rt=this.referencesTo();
            var subTypes=hlimpl.nodesDeclaringType(rt,c);
            return subTypes;
        }
        if (this.range().isValueType()){
            var vt=<ValueType>this.range();
            if(vt.globallyDeclaredBy().length>0){
                var definitionNodes = hlimpl.globalDeclarations(c).filter(z=>_.find( vt.globallyDeclaredBy(),x=>x==z.definition())!=null);
                return definitionNodes;
            }
        }
        return [];
    }

    getEnumOptions(){
        return this._enumOptions
    }

    withEnumOptions(op:string[]){
        this._enumOptions=op;
        return this;
    }

    withDomain(d:NodeClass){
        this._ownerClass=d;
        d.registerProperty(this);
        return this;
    }
    withRange(t:IType){
        this._nodeRange=t;
        return this;
    }

    getTraits():PropertyTrait[]{
        return this._traits
    }

    keyPrefix(){
        return this._keyShouldStartFrom
    }
    matchKey(k:string):boolean{
        if (k==null){
            return false;
        }
        if (this._groupName!=null){
            return this._groupName==k;
        }
        else{
            if (this._keyShouldStartFrom!=null){
                if(k.indexOf(this._keyShouldStartFrom)==0){
                    return true;
                }
            }
            if(this._enumOptions){
                if (this._enumOptions.indexOf(k)!=-1){
                    return true;
                }
            }
            return false;
        }
    }

    withMultiValue(v:boolean=true){
        this._isMultiValue=v;
        return this;
    }

    withFromParentValue(v:boolean=true){
        this._isFromParentValue=v;
        return this;
    }
    withFromParentKey(v:boolean=true){
        this._isFromParentKey=v;
        return this;
    }

    isFromParentKey(){
        return this._isFromParentKey;
    }

    isFromParentValue():boolean{
        return this._isFromParentValue;
    }

    withGroupName(gname:string){
        this._groupName=gname;
        return this;
    }
    withRequired(req:boolean){
        this._isRequired=req;
        return this;
    }
    unmerge(){
        this._groupName=this.name();
        return this;
    }
    merge(){
        this._groupName=null;
        return this;
    }

    withKey(isKey:boolean){
        this._key=isKey;
        return this;
    }

    /**
     * TODO THIS STUFF SHOULD BE MORE ABSTRACT (LATER...)
     * @param keyShouldStartFrom
     * @returns {Property}
     */
    withKeyRestriction(keyShouldStartFrom:string){
        this._keyShouldStartFrom=keyShouldStartFrom;
        return this;
    }

    domain():NodeClass{
        return this._ownerClass;
    }
    range():IType{
        return this._nodeRange;
    }

    isKey(){
        return this._key;
    }

    isValueProperty(){
        return this._nodeRange.isValueType();
    }

    isRequired(){
        return this._isRequired;
    }

    isMultiValue(){
        return this._isMultiValue;
    }

    isMerged(){
        return this._groupName==null;
    }

    isPrimitive(){
        var name = this._nodeRange.name();
        return name == 'StringType'||name=='NumberType'||name=='BooleanType';
    }

    groupName():string{
        return this._groupName;
    }
}
