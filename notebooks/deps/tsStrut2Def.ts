/// <reference path="./typings/tsd.d.ts" />
import tsStruct=require('./tsStructureParser')
import def=require('./definitionSystem')
import _=require("underscore")
import khttp=require ("know-your-http-well");
import selector=require('./selectorMatch')

class FieldWrapper{

    constructor(private _field:tsStruct.FieldModel,private _clazz:ClassWrapper){

    }

    name(){
        return this._field.name;
    }
    range():ClassWrapper{

        return this._clazz.getModule().typeFor(this._field.type,this._clazz);
    }

    isMultiValue(){
        return this._field.type.typeKind==tsStruct.TypeKind.ARRAY
    }

    isKey(){
        return _.find(this._field.annotations,x=>x.name=="MetaModel.key")!=null;
    }
    isSimpleValue(){
        return _.find(this._field.annotations,x=>x.name=="MetaModel.value")!=null;
    }

    annotations(){
        return this._field.annotations;
    }
}

interface TypeWrapper{
    name()
    methods():tsStruct.MethodModel[]
    members():FieldWrapper[]
    isSubTypeOf(of:TypeWrapper):boolean
    getSuperTypes():TypeWrapper[]
    constraints():FieldConstraint[]
    getAllSuperTypes():TypeWrapper[]
    typeMeta():tsStruct.Annotation[]
    getModule():ModuleWrapper;
}
class FieldConstraint{

    constructor(private _field:tsStruct.FieldModel,private _clazz:ClassWrapper){

    }

    name(){
        return this._field.name;
    }

    value(){
        return this._field.valueConstraint
    }

}
class ClassWrapper implements TypeWrapper{
    constructor(private _clazz:tsStruct.ClassModel,private mw:ModuleWrapper){

    }

    typeMeta():tsStruct.Annotation[]{
        return this._clazz.annotations;
    }
    path(){
        return this.mw.path();
    }

    getModule(){
        return this.mw;
    }
    typeArgs():string[]{
        return this._clazz.typeParameters
    }

    typConstraints():TypeWrapper[]{
        return this._clazz.typeParameterConstraint.map(x=>{
            if (x){
            return this.mw.classForName(x)
            }
            return null;
        })
    }

    methods(){
        return this._clazz.methods;
    }
    name(){
        return this._clazz.name;
    }
    members():FieldWrapper[]{
        return this._clazz.fields.filter(x=>x.valueConstraint==null).map(x=>new FieldWrapper(x,this))
    }

    constraints():FieldConstraint[]{
        return this._clazz.fields.filter(x=>x.valueConstraint!=null).map(x=>new FieldConstraint(x,this))

    }

    isSubTypeOf(of:TypeWrapper):boolean{
        if (this==of){
            return true;
        }
        var _res=false;
        this.getAllSuperTypes().forEach(x=>{
            if (!_res){
            _res=_res||x.isSubTypeOf(of)
            }
        })
        return _res;
    }

    getExtendsClauses(){
        return this._clazz.extends
    }

    getSuperTypes():TypeWrapper[]{
        var result:TypeWrapper[]=[];
        this._clazz.extends.forEach(x=>{
            var tp=this.mw.classForName((<tsStruct.BasicType>x).typeName);
            if (tp){
                result.push(tp);
            }
        });
        return result;
    }
    getAllSuperTypes():TypeWrapper[]{
        var result:TypeWrapper[]=[];
        this._clazz.extends.forEach(x=>{

            var tp=this.mw.classForName((<tsStruct.BasicType>x).typeName);
            if (tp){
                var mm=tp.getAllSuperTypes();
                result.push(tp);
                result.concat(mm)
            }
        });
        return _.unique(result);
    }
}
class AbstractSimpleWrapper implements TypeWrapper{
    members():FieldWrapper[]{
        return [];//this._clazz.members.map(x=>new FieldWrapper(x,this))
    }
    methods(){return []}

    isSubTypeOf(of:ClassWrapper):boolean{
        return false;
    }

    getSuperTypes():TypeWrapper[]{
        return [];
    }
    getAllSuperTypes():TypeWrapper[]{
        return [];
    }
    name():string{
        return null;
    }
    constraints():FieldConstraint[]{
        return []
    }
    typeMeta(){
        return [];
    }
    getModule():ModuleWrapper{
        throw new Error("Not implemented")
    }
}
class EnumWrapper extends AbstractSimpleWrapper{


    constructor (private _clazz:tsStruct.EnumDeclaration,private mw:ModuleWrapper){
        super()
    }

    getModule(){
        return this.mw;
    }

    values(){
        return this._clazz.members;
    }

    name(){
        return this._clazz.name;
    }

}
class UnionWrapper extends AbstractSimpleWrapper{

    constructor (private _clazz:TypeWrapper[],private mw:ModuleWrapper){
        super();
    }
    elements(){
        return this._clazz;
    }

    name(){
        return this._clazz.map(x=>x.name()).join("|")
    }
}



class ModuleWrapper{

    name2Class:{ [name:string]:TypeWrapper}={}
    namespaceToMod:{[name:string]:ModuleWrapper}={}
    private _classes:TypeWrapper[]=[]


    typeFor(t:tsStruct.TypeModel,ow:ClassWrapper){
        switch (t.typeKind){
            case tsStruct.TypeKind.BASIC:
                var bt=<tsStruct.BasicType>t;
                var typeName=bt.typeName
                if (typeName=="string"){
                    typeName="StringType";
                }
                if (typeName=="number"){
                    typeName="NumberType";
                }
                if (typeName=="boolean"){
                    typeName="BooleanType";
                }

                var ti=_.indexOf(ow.typeArgs(),typeName)
                if (ti!=-1){
                    var cnst=ow.typConstraints()[ti];
                    if (!cnst){
                        return this.classForName("ValueType")
                    }
                    return cnst;
                }
                return this.classForName(typeName);
            case tsStruct.TypeKind.UNION:
                var ut=<tsStruct.UnionType>t;

                return new UnionWrapper(ut.options.map(x=>this.typeFor(x,ow)),this);
            case tsStruct.TypeKind.ARRAY:
                var at=<tsStruct.ArrayType>t;
                return this.typeFor(at.base,ow);
        }
        return null;
    }
    path(){
        return this._univers.name;
    }
    constructor(private _univers:tsStruct.Module){
        _univers.classes.forEach(x=>{
            var c=new ClassWrapper(x,this);
            this._classes.push(c)
            this.name2Class[x.name]=c;
            if(x.moduleName){
                //FIXME
                this.name2Class[x.moduleName+"."+x.name]=c;
            }
        })
        _univers.enumDeclarations.forEach(x=>{
            var c=new EnumWrapper(x,this);
            this._classes.push(c)
            this.name2Class[x.name]=c;

        })
    }
    classForName(name:string,stack:{[name:string]:ModuleWrapper}={}){
        if (!name){
            return null;
        }
        var result=this.name2Class[name];

        if (!result&&!stack[this.path()]){
            stack[this.path()]=this;
            var nmsp=name.indexOf(".");
            if (nmsp!=-1){
                var actualMod=this.namespaceToMod[name.substring(0,nmsp)];
                if(!actualMod){
                    throw new Error();
                }
                return actualMod.classForName(name.substring(nmsp+1),stack)
            }
            Object.keys(this.namespaceToMod).forEach(x=>{
               if (x!="MetaModel") {
                   var nm = this.namespaceToMod[x].classForName(name,stack);
                   if (nm) {
                       result = nm;
                   }
               }
            })
        }
        return result;
    }

    classes(){
        return this._classes;
    }
}

var wrapperToType = function (range:TypeWrapper, u:def.Universe) {
    if (range) {
        var rangeType:def.IType;
        if (range instanceof UnionWrapper) {
            var uw = <UnionWrapper>range;
            rangeType = new def.UnionType(uw.elements().map(x=>wrapperToType(x, u)))
        }
        else {

            rangeType = u.type(range.name())

        }
        return rangeType;
    }
    else{
        return ;
    }
};
var registerClasses = function (m:ModuleWrapper, u:def.Universe) {
    var valueType = m.classForName("ValueType");
    m.classes().forEach(x=> {
        if (x instanceof EnumWrapper) {
            var et = new def.EnumType(x.name(), u, x.getModule().path());
            et.values = (<EnumWrapper>x).values()
            u.register(et);
            return;
        }
        if (x.isSubTypeOf(valueType)) {
            var st = x.getAllSuperTypes();
            st.push(x);
            var refTo = null;
            var scriptingHook = null;
            st.forEach(t=> {

                var cs = (<ClassWrapper>t).getExtendsClauses();
                cs.forEach(z=> {
                    if (z.typeKind == tsStruct.TypeKind.BASIC) {
                        var bas = <tsStruct.BasicType>z;
                        if (bas.basicName == 'Reference') {
                            var of = bas.typeArguments[0];
                            refTo = (<tsStruct.BasicType>of).typeName;
                        }
                        if (bas.basicName == 'ScriptingHook') {
                            var of = bas.typeArguments[0];
                            scriptingHook = (<tsStruct.BasicType>of).basicName;
                        }
                    }
                })

            })
            if (refTo) {
                //console.log("New reference type" + x.name())
                var ref = new def.ReferenceType(x.name(), x.getModule().path(), refTo, u);
                u.register(ref)
            }
            if (scriptingHook) {
                //console.log("New scripting hook " + x.name())
                var sc = new def.ScriptingHookType(x.name(), x.getModule().path(), scriptingHook, u);
                u.register(sc)
            }
            var vt = new def.ValueType(x.name(), u, x.getModule().path());
            u.register(vt);
        }
        else {
            var gt = new def.NodeClass(x.name(), u, x.getModule().path());
            u.register(gt);
        }
    })
};
var registerEverything = function (m:ModuleWrapper, u:def.Universe) {
    m.classes().forEach(x=> {
        x.getSuperTypes().forEach(y=> {
            var tp0 = u.type(x.name())
            var tp1 = u.type(y.name())
            if (!tp0 || !tp1) {
                var tp0 = u.type(x.name())
                var tp1 = u.type(y.name())
                throw new Error();
            }
            u.registerSuperClass(tp0, tp1);
        })
    })
    m.classes().forEach(x=> {
        var tp = u.type(x.name())
        x.typeMeta().forEach(a=> {
            if (a.name == 'MetaModel.declaresSubTypeOf') {//FIXME should be handled in same way as method annotations
                var rangeType = <def.NodeClass>wrapperToType(x, u);
                rangeType.setExtendedTypeName(<string>a.arguments[0]);
            }
            if (a.name == 'MetaModel.nameAtRuntime') {//FIXME should be handled in same way as method annotations
                var rangeType = <def.NodeClass>wrapperToType(x, u);
                rangeType.setNameAtRuntime(<string>a.arguments[0]);
            }
            if (a.name == 'MetaModel.description') {//FIXME should be handled in same way as method annotations
                var rangeType = <def.NodeClass>wrapperToType(x, u);
                rangeType.withDescription(<string>a.arguments[0]);
            }
            if (a.name == 'MetaModel.inlinedTemplates') {
                var rangeType = <def.NodeClass>wrapperToType(x, u);
                rangeType.setInlinedTemplates(true);
            }
            if (a.name == 'MetaModel.requireValue') {//FIXME should be handled in same way as method annotations
                var rangeType = <def.NodeClass>wrapperToType(x, u);

                rangeType.withContextRequirement("" + <string>a.arguments[0], "" + <string>a.arguments[1]);
            }

            if (a.name == 'MetaModel.referenceIs') {//FIXME should be handled in same way as method annotations
                var rangeType = <def.NodeClass>wrapperToType(x, u);
                rangeType.withReferenceIs("" + <string>a.arguments[0]);
            }
            //MetaModel.referenceIs
            if (a.name == 'MetaModel.actuallyExports') {//FIXME should be handled in same way as method annotations
                var rangeType = <def.NodeClass>wrapperToType(x, u);
                rangeType.withActuallyExports("" + <string>a.arguments[0]);
            }
            if (a.name == 'MetaModel.convertsToGlobalOfType') {//FIXME should be handled in same way as method annotations
                var rangeType = <def.NodeClass>wrapperToType(x, u);
                rangeType.withConvertsToGlobal("" + <string>a.arguments[0]);
            }
            if (a.name == 'MetaModel.allowAny') {//FIXME should be handled in same way as method annotations
                var rangeType = <def.NodeClass>wrapperToType(x, u);
                rangeType.withAllowAny();
            }
            if (a.name == 'MetaModel.allowQuestion') {
                var rangeType = <def.NodeClass>wrapperToType(x, u);
                rangeType.withAllowQuestion();
            }
            if (a.name == 'MetaModel.functionalDescriminator') {//FIXME should be handled in same way as method annotations
                var r1 = <def.AbstractType><any>wrapperToType(x, u);
                r1.withFunctionalDescriminator("" + <string>a.arguments[0]);
            }
            if (a.name == 'MetaModel.alias') {//FIXME should be handled in same way as method annotations
                var at = <def.AbstractType><any>wrapperToType(x, u);
                at.addAlias("" + <string>a.arguments[0]);
            }
            if (a.name == 'MetaModel.consumesRefs') {//FIXME should be handled in same way as method annotations
                var at = <def.AbstractType><any>wrapperToType(x, u);
                at.setConsumesRefs(true);
            }
            if (a.name == 'MetaModel.canInherit') {//FIXME should be handled in same way as method annotations
                var nc = <def.NodeClass><any>wrapperToType(x, u);
                nc.withCanInherit("" + <string>a.arguments[0]);
            }
            if (a.name == 'MetaModel.definingPropertyIsEnough') {//FIXME should be handled in same way as method annotations
                var nc = <def.NodeClass><any>wrapperToType(x, u);
                nc.definingPropertyIsEnough("" + <string>a.arguments[0]);
            }

        });
        x.members().forEach(x=> {

            var range = x.range();
            if (!x.range()) {
                range = x.range();
            }
            var rangeType = wrapperToType(range, u);
            if (rangeType == null) {
                console.log(range + ":" + x.name())
            }
            createProp(x, <def.NodeClass>tp, rangeType)
        });
        x.methods().forEach(x=> {
            var at = <def.AbstractType><any>tp;
            at.addMethod(x.name, x.text);
            //console.log(x.name);
            //createMember(x, <def.AbstractType>tp, rangeType)
        });
        x.constraints().forEach(x=> {
            if (x.value().isCallConstraint) {
                throw new Error();
            }
            var mm:tsStruct.ValueConstraint = <tsStruct.ValueConstraint>x.value();
            (<def.NodeClass>tp).addRequirement(x.name(), "" + mm.value)
        })
    })
    u.types().forEach(x=> {
        if (x instanceof def.AbstractType){
        var at=<def.AbstractType><any>x;
        at.getAliases().forEach(y=>u.registerAlias(y,<def.IType><any>at));
        }
    })
};
var processModule = function (ts:tsStruct.Module, u:def.Universe,used:{ [nm:string]:ModuleWrapper},declared:{ [nm:string]:ModuleWrapper}):ModuleWrapper {
    if (ts.name.indexOf("metamodel.ts")!=-1){
        return;//FIXME
    }
    if (declared[ts.name]){
        return declared[ts.name]
    }
    var m = new ModuleWrapper(ts);
    used[ts.name]=m;
    declared[ts.name]=m;
    Object.keys(ts.imports).forEach(x=> {
        var pMod = ts.imports[x];
        if (used[pMod.name]){
            m.namespaceToMod[x]=used[pMod.name];
           return
           // throw new Error("Module "+pMod.name+" is part of the cycle "+ts.name+" on stack "+Object.keys(used).join(","))
        }

        var vMod=processModule(pMod,u,used,declared)
        m.namespaceToMod[x]=vMod;
    })
    used[ts.name]=null;
    return m;
};
export function toDefSystem(ts:tsStruct.Module):def.Universe{
    var u=new def.Universe("");
    var c:{[name:string]:ModuleWrapper}={}
    processModule(ts, u,{},c);

    Object.keys(c).forEach(x=>{
        registerClasses(c[x], u);
    })

    Object.keys(c).forEach(x=>{
        registerEverything(c[x],u);
    })
    u.types().forEach(x=>{
        if (x instanceof def.NodeClass){
            var cl=<def.NodeClass>x;
            cl.properties().forEach(y=>{
                var t=y.range();
                if (!t.isValueType()){
                    t.properties().forEach(p0=>{
                        if (p0.isKey()){
                            var kp=p0.keyPrefix();
                            if (kp) {
                                y.withKeyRestriction(kp);
                                y.merge()
                            }
                            var eo=p0.getEnumOptions();
                            if (eo) {
                                y.withEnumOptions(eo)
                                y.merge()
                            }
                        }
                    })
                }

            })
            if (cl.isGlobalDeclaration()){
                if (cl.getActuallyExports()&&cl.getActuallyExports()!="$self"){
                    var tp=cl.property(cl.getActuallyExports()).range();
                    if (tp.isValueType()){
                        var vt=<def.ValueType>tp;
                        vt.setGloballyDeclaredBy(cl);
                    }
                    //rs+=genRef(tp)
                }
                if (cl.getConvertsToGlobal()){
                    var tp=<def.IType>u.getType(cl.getConvertsToGlobal());
                    if (tp.isValueType()){
                        var vt=<def.ValueType>tp;
                        vt.setGloballyDeclaredBy(cl);
                    }
                }

            }
        }
    });

    return u;
}
interface AnnotationHandler{
    (a:tsStruct.Annotation,f:def.Property)
}
var annotationHandlers:{[name:string]:AnnotationHandler}={
    key:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withFromParentKey();
        f.withKey(true)
    },
    value:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withFromParentValue()
    },
    canBeValue:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withCanBeValue()
    },
    unmerged:(a:tsStruct.Annotation,f:def.Property)=>{
        f.unmerge();
    },
    startFrom:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withKeyRestriction(<string>a.arguments[0])
        f.merge()
    },
    oneOf:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withEnumOptions(<string[]>a.arguments[0])
        //f.withKeyRestriction(<string>a.arguments[0])
    },
    oftenKeys:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withOftenKeys(<string[]>a.arguments[0])
        //f.withKeyRestriction(<string>a.arguments[0])
    },
    embeddedInMaps:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withEmbedMap()
        //f.withKeyRestriction(<string>a.arguments[0])
    },
    system:(a:tsStruct.Annotation,f:def.Property)=>{
       f.withSystem(true)
    },
    required:(a:tsStruct.Annotation,f:def.Property)=>{
        if (a.arguments[0]!='false') {
            f.withRequired(true)
        }
    },
    setsContextValue:(a:tsStruct.Annotation,f:def.Property)=>{
        f.addChildValueConstraint(new def.ChildValueConstraint(""+a.arguments[0],""+a.arguments[1]))
        //f.withKeyRestriction(<string>a.arguments[0])
    },
    defaultValue:(a:tsStruct.Annotation,f:def.Property)=>{
        f.setDefaultVal(""+a.arguments[0])
    },
    extraMetaKey:(a:tsStruct.Annotation,f:def.Property)=>{
        if (a.arguments[0]=="statusCodes"){
            f.withOftenKeys(khttp.statusCodes.map(x=>x.code))
            f.setValueDocProvider((name:string)=>{
                var s= _.find(khttp.statusCodes,x=>x.code==name);
                if (s){
                    return (name+":"+s.description);
                }
                return null;
            })
        }
        if (a.arguments[0]=="annotationTargets"){
            var targets=f.domain().universe().types().filter(x=>!x.isValueType()).map(x=>x.name());
            targets.push("Parameter");
            targets.push("Field");
            f.withEnumOptions(targets);

        }
        if (a.arguments[0]=="headers"){
            f.setValueSuggester(x=>{
                console.log(x);
                var c=(<def.Property>x.property()).getChildValueConstraints();
                if (_.find(c,x=>{return x.name=="location"&&x.value=="Params.ParameterLocation.HEADERS"})){
                    return khttp.headers.map(x=>x.header);
                }
                return null;
            })
            f.setValueDocProvider((name:string)=>{
                var s= _.find(khttp.headers,x=>x.header==name);
                if (s){
                    return (name+":"+s.description);
                }
                return null;
            })
        }
        if (a.arguments[0]=="methods"){
            f.setValueDocProvider((name:string)=>{
                var s= _.find(khttp.methods,x=>x.method==name.toUpperCase());
                if (s){
                    return (name+":"+s.description);
                }
                return null;
            })
            //f.withEnumOptions(khttp.methods.map(x=>x.method.toLowerCase()))
        }
    },
    requireValue:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withContextRequirement(""+a.arguments[0],""+a.arguments[1])
        //f.withKeyRestriction(<string>a.arguments[0])
    },
    allowMultiple:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withMultiValue(true);
        //f.withKeyRestriction(<string>a.arguments[0])
    },
    selector:(a:tsStruct.Annotation,f:def.Property)=>{
        f.setSelector(""+a.arguments[0]);
        //f.withKeyRestriction(<string>a.arguments[0])
    }
    ,
    constraint:(a:tsStruct.Annotation,f:def.Property)=>{

        //f.withKeyRestriction(<string>a.arguments[0])
    },
    newInstanceName:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withNewInstanceName(""+a.arguments[0])
        //f.withKeyRestriction(<string>a.arguments[0])
    },

    declaringFields:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withThisPropertyDeclaresFields();
        //f.withKeyRestriction(<string>a.arguments[0])
    },
    describesAnnotation:(a:tsStruct.Annotation,f:def.Property)=>{
        //f.withReferenceParameters();
        f.withDescribes(<string>a.arguments[0])
    },
    allowNull:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withAllowNull()
    }
    ,

    descriminatingProperty:(a:tsStruct.Annotation,f:def.Property)=>{
        //f.withReferenceParameters();
        f.withDescriminating(true)
    },
    description:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withDescription(""+a.arguments[0])
        //f.withReferenceParameters();
        //f.withDescriminating(true)
    },
    issue:(a:tsStruct.Annotation,f:def.Property)=>{
        //f.withReferenceParameters();
        //f.withDescriminating(true)
        f.withIssue(""+a.arguments[0])

    },
    inherited:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withInherited(true);
    },
    version:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withVersion(""+a.arguments[0])
    },
    needsClarification:(a:tsStruct.Annotation,f:def.Property)=>{
        //f.withReferenceParameters();
        //f.withDescriminating(true)

        f.withClarify(""+a.arguments[0])
    },
    thisFeatureCovers:(a:tsStruct.Annotation,f:def.Property)=>{
        //f.withReferenceParameters();
        //f.withDescriminating(true)

        f.withThisFeatureCovers(""+a.arguments[0])
    },
    valueRestriction:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withValueRewstrinction(""+a.arguments[0],""+a.arguments[1])
    },
    grammarTokenKind:(a:tsStruct.Annotation,f:def.Property)=>{
        f.withPropertyGrammarType(""+a.arguments[0])
    },
    canInherit:(a:tsStruct.Annotation,f:def.Property)=>{
    f.withInheritedContextValue(""+a.arguments[0])
    },
    canBeDuplicator:(a:tsStruct.Annotation,f:def.Property)=>{
    f.setCanBeDuplicator()
    }
}
export function recordAnnotation(p:def.Property,a:tsStruct.Annotation){
    annotationHandlers[a.name](a,p);
}

var processAnnotations = function (x:FieldWrapper, p:def.Property) {
    x.annotations().forEach(x=> {
        var nm = x.name.substring(x.name.lastIndexOf(".") + 1)
        if (!annotationHandlers[nm]) {
            console.log("Can not find handler for:" );
        }
        annotationHandlers[nm](x, p);
    })
};
function createProp(x:FieldWrapper,clazz:def.NodeClass,t:def.IType){
    var p=def.prop(x.name(),"",clazz,t)


    if (x.isMultiValue()){
        p.withMultiValue(true)
    }
    p.unmerge()
    if (!t.isValueType()){
      t.properties().forEach(p0=>{
          if (p0.isKey()){
              var kp=p0.keyPrefix();
              if (kp) {
                  p.withKeyRestriction(kp);
                  p.merge()
              }
              var eo=p0.getEnumOptions();
              if (eo) {
                  p.withEnumOptions(eo)
                  p.merge()
              }
          }
      })
    }
    processAnnotations(x, p);

}