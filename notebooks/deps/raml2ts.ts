/// <reference path="./typings/tsd.d.ts" />
import tsutil = require('./tsutil');
import util   = require('./index');
import _ = require("underscore");
import assert = require("assert")
import iconfig = require('./config')

import Opt=require('./Opt');
import RamlWrapper= require('./Raml08Wrapper')
import TS =require('./TSDeclModel')
import JS2TS=require('./jsonschema2ts')
import XML2TS=require('./xmlschema2ts')
// TODO where do you have the logic that quotes names? ( '-text'?:string )
// TODO build string as an array and then join('')


//FIXME users.me() case2

export class Config implements iconfig.IConfig{


    constructor() {
    }

    /**
     * if set to true it will be possible to pass numbers to string parameters
     * @type {boolean}
     */
    numberIsString=true;
    /**
     * If it set to true system will create named interfaces for parameters defenition otherwise,
     * it will use structural types
     * Use named interfaces
     */
    createTypesForResources=true;


    /**
     * If this option is set to true query parameters will be placed as second argument when method has body
     */
    queryParametersSecond:boolean=true;


    /**
     * If this option is set to true .get() will be collapsed to ()
     */
    collapseGet:boolean=false;

    /**
     * If this option is set to true method references will be collapsed if it is only method in the resource
     * foo.get() => foo()
     */
    collapseOneMethod:boolean=false;

    /**
     * If this option is set to true media type parameters will be removed from declarations
     */
    collapseMediaTypes:boolean=false;

    /**
     * For example, let resource 'somerRes' have GET, POST and PUT methods.
     * If 'false', generates get(), post() and put() for 'someResource'
     * If 'true', generates getSomeRes(), postSomeRes() and putSomeRes() for
     * parent of 'someRes'. If 'someRes' does not itself has child resources, it is not generated.
     * @type {boolean}
     */
    methodNamesAsPrefixes:boolean = false;

    /**
     * If this option is set to 'true', the executor combines request and response into a HAR entry
     * and places it into the '__$harEntry__' field of ramlscript response.
     */
    storeHarEntry:boolean=true;

    /**
     * If it set to true system will create named interfaces for parameters defenition otherwise,
     * it will use structural types
     * Use named interfaces
     */
    createTypesForParameters=true;
    /**
     * It true geneartor will try to reuse parameter types when possible
     * and redeclare using type =
     */
    reuseTypeForParameters=true;

    /**
     * If true will not reuse structural types for schemas
    */
    createTypesForSchemaElements=true;

    /* It true geneartor will try to reuse parameter types when possible
    * and redeclare using type =
     */
    reuseTypesForSchemaElements=true;

    /**
     * If 'true', exception is thrown for statuses > 399
     */
    throwExceptionOnIncorrectStatus:boolean=false;

    /**
     * generate asynchronous client
     **/
    async=false;

    debugOptions:{
        generateImplementation:boolean;
        generateSchemas:boolean;
        generateInterface:boolean;
        schemaNameFilter:iconfig.NameFilter

    }={
        generateImplementation:true,
        generateSchemas:true,
        generateInterface:true,

        schemaNameFilter: function (name:String):boolean{
            return true;//name=="cities"
        },
        resourcePathFilter:null
    }

    /**
     * Whether to overwrite the 'node_modules' folder for the generated notebook.
     * If the folder is known to be consistent, the option may be set to 'false'
     * in order to save time.
     */
    overwriteModules:boolean = true;
}

export var HAR_ENTRY_FIELD_NAME:string = '__$harEntry__'

export var MEDIA_TYPE_SUFFIX = 'mediaTypeSuffix';

export var MEDIA_TYPE_EXTENSION = 'mediaTypeExtension';

export function raml2ts(api:RamlWrapper.Api,cfg:Config=new Config):string {
    //lets build type script model first
    var mod = new ShortStyleModelBuilder(cfg).buildConversion()(api);
    //now just serialize it to string
    var content = new DefaultModelSerializer(api, cfg).buildConversion()(mod);

    var content =
`export function createApi(${getPDecl(api)}):Api{
    return new ApiImpl(${getPcalls(api)});
}
${content}\n`;

    return content;
}

function getPDecl(api:RamlWrapper.Api){
    var result:string[]=[];
    api.baseUriParameters().forEach(x=>{
        if (x.name()=="version"){
            return;
        }
        result.push(x.name()+":string");
    });
    return result.join(",");
}

function getPcalls(api:RamlWrapper.Api){
    var result:string[]=[];
    api.baseUriParameters().forEach(x=>{
        if (x.name()=="version"){
            return;
        }
        result.push(x.name());
    });
    return result.join(",");
}


// TODO create a Typescript Comment object/builder
function toComment(descriptionFromRAML:Opt<RamlWrapper.MarkdownString>):string{
    var arrayOfLines = descriptionFromRAML.getOrElse(new RamlWrapper.MarkdownString("")).value().match(/[^\r\n]+/g);
    if (arrayOfLines!=null) {
        if (arrayOfLines.length>1) {
            var result = ""
            arrayOfLines.forEach(x=>result += "*" + (x.length>0 && x.charAt(0)=='/') ? ' '+x : x  + "\n")
            return result;
        }
    }
    return descriptionFromRAML.getOrElse(new RamlWrapper.MarkdownString("")).value();
}

/**
 * declaration which has relation to resource
 */
class TSResourceMappedApiElement extends TS.TSAPIElementDeclaration {
    originalResource:RamlWrapper.Resource;


    constructor(p:TS.TSModelElement<any>, name:string, originalResource:RamlWrapper.Resource) {
        super(p, name);
        this.originalResource = originalResource;
    }

    absolutePath():string{

        return this.originalResource.completeRelativeUri();
    }
    commentCode():string{

        return `
        /**
         * ${toComment(this.originalResource.description())}
         * @ramlpath ${this.absolutePath()}
         **/


         `
    }
}
/**
 * Resource which is binded to method
 *
 */
class TSFullyMappedApiElement extends TSResourceMappedApiElement {
    originalMethod:RamlWrapper.Method;

    constructor(p:TS.TSModelElement<any>, name:string, originalMethod:RamlWrapper.Method) {
        super(p, name,originalMethod.resource());
        this.originalMethod = originalMethod;
    }
    commentCode():string{

        return `
        /**
         * ${toComment(this.originalMethod.description())}
         * @ramlpath ${this.absolutePath()}  ${this.originalMethod.method()}
         **/
         `
    }

    returnStr = ():string => {
        if(this.rangeType){
            var rangeStr = this.rangeType.serializeToString()
            if(this.isFunction()&&this._config&&this._config.async){
                return ':Promise<' + rangeStr + '>'
            }
            else{
                return ':'+rangeStr
            }
        }
        else{
            return ''
        }

    }
}

export function escapedName(name:string):string {
    name = name.indexOf('/')==0 ? name.substring(1):name;
    name = name.replace(/[\{\}]/g,'')
    name = tsutil.escapeToIdentifier(name);
    name=name.replace(MEDIA_TYPE_SUFFIX,"");
    name=name.replace(MEDIA_TYPE_EXTENSION,"");
    return name;
}


/**
 * 1. different styles of serializing
 * 2. handle: headers, multiple bodies
 * 3. prepare framework for body generation
 * 4. add metadata about source raml;
 **/

interface ConvertFunction<A,B>{
    (model:A):B
}
interface TypeScriptStoSourceConverter{
    (model:TS.TSAPIModule):string
}
interface RamlToTSModelConverter{
    (model:RamlWrapper.Api):TS.TSAPIModule
}

interface Builder<A,B>{
    buildConversion():ConvertFunction<A,B>
}


function firstToUpper(q:string):string{
    if (q.length==0){
        return q;
    }
    return q.charAt(0).toUpperCase()+q.substr(1)
}

class CollapsingJSONToTSConvertor extends JS2TS.JSONSchematToTS{


    constructor(name:string,private owner:ShortStyleModelBuilder) {
        super(name,owner.module,owner.cfg);
    }

    protected createTypeDeclaration(pd:TS.TSAPIElementDeclaration):TS.TSTypeDeclaration {
        var onm=firstToUpper(escapedName(this.name))+firstToUpper(escapedName(pd.name))
        var nm=onm;
        var num=0;
        while (this.module.getInterface(nm).isDefined()){
            num++;
            nm=onm+num;
        }
        return new TS.TSInterface(this.module, nm);
    }

    protected replace(original:TS.TSTypeDeclaration):TS.TSTypeDeclaration {
        if (this.owner.cfg.reuseTypesForSchemaElements){
            this.owner.collapseToTypeAliasOrAdd(<TS.TSInterface>original);
        }
        else{
            this.module.addChild(<TS.TSInterface>original);
        }
        return super.replace(original);
    }
}
class ResourceMappedReference extends TS.TSSimpleTypeReference{
    constructor(p:TS.TSModelElement<any>, private _resourceInterface:ResourceMappedInterface) {
        super(p, _resourceInterface.name);
    }

    resourceInterface(){
        return this._resourceInterface;
    }

    isFunctor(){
        return this._resourceInterface.isFunctor();
    }

    getFunctor():TS.TSAPIElementDeclaration {
        return this._resourceInterface.getFunctor();
    }

    children():any[] {
        return this._resourceInterface.children();
    }
}

class ResourceMappedInterface extends TS.TSInterface{

    constructor(p:TS.TSModelElement<any>, name:string,private _resource:TSResourceMappedApiElement) {
        super(p, name);
    }

    resource():TSResourceMappedApiElement{
        return this._resource;
    }

    toReference():TS.TSTypeReference<any> {
        return  new ResourceMappedReference(TS.Universe,this);
    }
}
export function emitParameter(cfg:Config, x:RamlWrapper.Param){
    return cfg.collapseMediaTypes ? (x.name() != MEDIA_TYPE_SUFFIX&&x.name()!=MEDIA_TYPE_EXTENSION) : true
}
/**
 * this builder provides convertor which looses some information
 */
class ShortStyleModelBuilder implements Builder<RamlWrapper.Api,TS.TSAPIModule>{
    constructor(cfg:Config) {
        this.cfg=cfg
    }
    cfg:Config


    processResource(
        container:TS.TSTypeDeclaration,
        r:RamlWrapper.Resource,
        resType?:TS.TSTypeDeclaration):TS.TSTypeDeclaration {

        var uriParameters = r.uriParameters().
            filter(x=>this.collapse(x))
            .map(p=> {
                var defaultExt:string;
                var pName = p.name();
                if(pName==MEDIA_TYPE_SUFFIX||pName==MEDIA_TYPE_EXTENSION){
                    var extensions = {};
                    p.definitions().filter(def=>def.enum().isDefined()).forEach(def=>def.enum().getOrThrow().map(v=>v.toString()).forEach(v=>{
                        if(v.toLowerCase().indexOf('json')>=0){
                            extensions['json']=v;
                        }
                        else if(v.toLowerCase().indexOf('xml')>=0){
                            extensions['xml']=v;
                        }
                        else{
                            extensions['default']=v;
                        }

                    }));
                    ['default','xml','json'].forEach(ext=>{
                        if(extensions[ext]){
                            defaultExt = extensions[ext];
                        }
                    })
                }
                return new TS.Param(res, p.name(), TS.ParamLocation.URI,this.getParamType(p),defaultExt);
            });
        var processResource:boolean = true;

        if(this.cfg.methodNamesAsPrefixes){
            r.methods().sort(this.methodComparator).forEach(m=>this.customizeMethod(container, m, false,uriParameters));
            processResource = r.resources().length > 0;
        }

        if(processResource){
            if(!resType) {
                var relativeUri = r.relativeUri();
                if(relativeUri.length==1){
                    resType = container;
                }
                else {
                    var res = new TSResourceMappedApiElement(container, escapedName(relativeUri), r);
                    resType = this.createResourceType(res);
                    res.rangeType = resType.toReference();
                    res.parameters = uriParameters;
                }
            }
            this.processChildResources(resType,r);
        }
        if(!this.cfg.methodNamesAsPrefixes&&resType) {
            r.methods().sort(this.methodComparator).forEach(m=>this.customizeMethod(resType, m, this.inlinable(r, resType)));
        }
        return resType;
    }

    private methodComparator(m1:RamlWrapper.Method,m2:RamlWrapper.Method):number{
        var methodOrder = {
            'options' : 1,
            'delete': 2,
            'patch' : 3,
            'put' : 4,
            'post' : 5,
            'get' : 6
        }
        var i1 = methodOrder[m1.method()];
        var i2 = methodOrder[m2.method()];
        i1 = i1 ? i1 : 0;
        i2 = i2 ? i2 : 0;
        return i2 - i1;
    }


    private processChildResources(resType:TS.TSTypeDeclaration,r:RamlWrapper.Resource|RamlWrapper.Api) {
        var map:{[key:string]:RamlWrapper.Resource[]} = {}
        r.resources().forEach(x=> {
            var uri = x.relativeUri();
            var keyUri = uri.replace('{' + MEDIA_TYPE_EXTENSION + '}', '').replace('{' + MEDIA_TYPE_SUFFIX + '}', '');
            var arr = map[keyUri];
            if (!arr) {
                arr = []
                map[keyUri] = arr;
            }
            if (uri != keyUri) {
                map[keyUri] = [x].concat(arr);
            }
            else {
                arr.push(x);
            }
        })
        Object.keys(map).forEach(x=> {
            var arr:RamlWrapper.Resource[] = map[x];
            var childResType = this.processResource(resType, arr[0]);
            for (var i = 1; i < arr.length; i++) {
                this.processResource(resType, arr[i], childResType);
            }
        })
    }

    private createResourceType(meth:TSResourceMappedApiElement):TS.TSTypeDeclaration {
        if (this.cfg.createTypesForResources){
            var mz=meth.name;
            if (!mz){
                mz="Unknown"
            }
            var onm=firstToUpper(mz)+"Resource"
            var nm=onm;
            var num=0;
            while (this.module.getInterface(nm).isDefined()){
                num++;
                nm=onm+num;
            }
            return new ResourceMappedInterface(this.module,nm,meth);
        }
        return new TS.TSStructuralTypeReference(meth);
    }

    public collapse(x:RamlWrapper.Param):boolean {
        return emitParameter(this.cfg,x)
    }

    inlinable= (r:RamlWrapper.Resource,resType:TS.TSTypeDeclaration):boolean =>r.methods().length === 1//(This restriction is not needed)&&meth.parameters.length > 0

    convertTypeName(tp:string) {
        if (tp == "integer") {
            return "number;"
        }
        if (this.cfg.numberIsString) {
            if (tp == "string") {
                return "string|number|boolean;"
            }
        }
        return tp;
    }
    schemas:TS.TSTypeReference<any>[] = []

    schemaContentToSchema: { [content: string]: TS.TSTypeReference<any> } = {}
    schemaNameToSchema: { [name: string]: TS.TSTypeReference<any> } = {}
    typeHashToType: { [name: string]: TS.TSInterface } = {}


    addSchema( schema: TS.TSTypeReference<any>, name: string, content: string ):void {
        this.schemas.push(schema);
        this.schemaContentToSchema[content] = schema;
        this.schemaNameToSchema[name] = schema;
    }

    num: number = 0;
    module:TS.TSAPIModule;


    private createSchema( name:string, content: string, mediaType:string, appendHar:boolean=false ): TS.TSTypeReference<any> {
        try {
            if (this.cfg.debugOptions.schemaNameFilter){
                if (!this.cfg.debugOptions.schemaNameFilter(content)){
                    return new TS.TSInterface(TS.Universe,"Dummy").toReference();
                }
            }
            var tr;
            var iName = escapedName(name);
            if(mediaType.indexOf('json')>=0) {
                tr = new JS2TS.JSONSchematToTS(iName, this.module, this.cfg).parse(content, appendHar);
            }
            else if(mediaType.indexOf('xml')>=0){
                tr = new XML2TS.XMLSchematToTS(iName, this.module, this.cfg).parse(content, appendHar);
            }
            this.addSchema( tr, name, content )
            return tr;
        }catch (e){
            console.log(e.stack);
        }
    }

    schemas2ts(bodies:RamlWrapper.Body[],appendHar:boolean):TS.TSTypeReference<any>{

        var result:TS.TSTypeReference<any> = new TS.AnyType();

        var jsonSchemas:RamlWrapper.SchemaDef[] = bodies.filter(x=>x.mediaType().indexOf("json")>=0)
            .map(x=>x.schema())
            .filter(x=>x.isDefined())
            .map(x=>x.value());

        if(jsonSchemas.length>0){
            jsonSchemas.forEach(x=>result=result.union(this.schema2ts(x,'json',appendHar)))
            if(this.cfg&&this.cfg.collapseMediaTypes) {
                return result;
            }
        }

        var xmlSchemas:RamlWrapper.SchemaDef[] = bodies.filter(x=>x.mediaType().indexOf("xml")>=0)
            .map(x=>x.schema())
            .filter(x=>x.isDefined())
            .map(x=>x.value());

        xmlSchemas.forEach(x=>result=result.union(this.schema2ts(x,'xml',appendHar)))

        return result;
    }

    schema2ts( nm: RamlWrapper.SchemaDef, mediaType:string, appendHar:boolean=false ): TS.TSTypeReference<any> {
        // look for cached versions first. then create
        return this.schemaNameToSchema[nm.name()] || this.schemaContentToSchema[nm.content()] || this.createSchema( nm.name(), nm.content(), mediaType, appendHar )
    }

    raml2TSModel = (api:RamlWrapper.Api):TS.TSAPIModule =>{
        var mod = new TS.TSAPIModule(TS.Universe,this.cfg);
        this.module=mod;
        if (this.cfg.debugOptions.generateSchemas) {
            var sh=api.schemas();
            if (this.cfg.debugOptions.schemaNameFilter){
                sh=sh.filter(x=>this.cfg.debugOptions.schemaNameFilter(x.name()));
            }
            sh.forEach(x => {
                try {
                    var conv=this.cfg.createTypesForSchemaElements? new CollapsingJSONToTSConvertor(x.name(),this):new JS2TS.JSONSchematToTS(x.name(),this.module);
                    var td = conv.parse(x.content())
                    this.addSchema(td, x.name(), x.content())
                } catch (e) {
                }
            })
        }
        var oldCfg = TS.Universe.getConfig();
        TS.Universe.setConfig(this.cfg);
        if (this.cfg.debugOptions.generateInterface) {
            var apidecl = new TS.TSInterface(mod, "Api");
            this.processChildResources(apidecl,api);
        }
        TS.Universe.setConfig(oldCfg);
        return mod;
    };



    customizeMethod(parent:TS.TSTypeDeclaration, ramlMethod:RamlWrapper.Method, doInline:boolean,uriParameters?:TS.Param[]):void {

        var methodName = escapedName(ramlMethod.method());;
        if(this.cfg.methodNamesAsPrefixes){
            methodName = methodName + firstToUpper(escapedName(ramlMethod.resource().relativeUri()));
        }
        else if(((ramlMethod.method() === "get")&&this.cfg.collapseGet) || (doInline&&this.cfg.collapseOneMethod)){
            methodName = "";
        }

        var method:TSFullyMappedApiElement = new TSFullyMappedApiElement(parent,methodName,ramlMethod)
        //consume parameters

        var ptype:TS.TSTypeDeclaration = new TS.TSStructuralTypeReference(method);
        if (this.cfg.createTypesForParameters){
            if (parent.parent() instanceof TSResourceMappedApiElement) {
                var tn:string = firstToUpper((<TSResourceMappedApiElement>parent.parent()).name) + firstToUpper(method.name) + "Options";
                ptype = new TS.TSInterface(TS.Universe, (tn));
            }
            else{
                var tn:string = firstToUpper((<TS.TSInterface>parent).name) + firstToUpper(method.name) + "Options";
                ptype = new TS.TSInterface(TS.Universe, (tn));

            }
        }
        //TODO ANOTHER TYPES OF PARAMETERS
        this.processParameters(ptype, ramlMethod.queryParameters(),"");
        this.processParameters(ptype, ramlMethod.headers(),"header_");
        if(ramlMethod.bodies()){
            ramlMethod.bodies().forEach(x=>this.processParameters(ptype, x.formParameters(),"form_"))
        }
        if (this.cfg.reuseTypeForParameters) {
            this.collapseToTypeAliasOrAdd(<TS.TSInterface>ptype);
        }

        //lets take care about return type now
        var responseBodies:RamlWrapper.Body[] = []
        ramlMethod.responses().filter(x => x.isOkRange()).forEach(x=>responseBodies = responseBodies.concat(x.bodies()))
        var returnType:TS.TSTypeReference<any> = this.schemas2ts(responseBodies,true);

        //lets take care about payload
        var bodyType:TS.TSTypeReference<any> = this.schemas2ts(ramlMethod.bodies(),false);

        var opParam=new TS.Param(method, "options", TS.ParamLocation.OPTIONS,ptype.toReference());
        opParam.optional=ptype.canBeOmmited()
        method.parameters.push(opParam);
        if (!(bodyType instanceof TS.AnyType)) {
            method.parameters.push(new TS.Param(method, "payload", TS.ParamLocation.BODY, bodyType))
        }
        if (this.cfg.queryParametersSecond){
            method.parameters=method.parameters.reverse();
        }

        if(uriParameters){
            method.parameters = uriParameters.concat(method.parameters)
        }

        method.rangeType = returnType;
    }

    //potentialy useful method for transforming formParams array into DTO
    generateFormSchema(body:RamlWrapper.Body,method:RamlWrapper.Method): TS.TSTypeReference<any>{

        var segment = ''
        var segments:string[] = method.resource().completeRelativeUri().split('/')
        for(var i = segments.length-1;i>=0;i--){
            var str = segments[i];
            if(str.trim().length==0){
                continue;
            }
            var ind = str.indexOf('{');
            if(ind==0){
                continue;
            }
            else if(ind<0){
                ind = str.length;
            }
            segment = str.substring(0,ind)
            break;
        }

        var oName = firstToUpper(escapedName(segment)) + firstToUpper(method.method()) + "Form";
        var name = oName;
        var i = 1;
        while(this.module.getInterface(name).isDefined()){
            name = oName + i++;
        }

        var tsi = new TS.TSInterface(this.module, name);
        body.formParameters().forEach(x=>{

            var pd = new TS.TSAPIElementDeclaration(tsi, x.name());
            pd.optional = !x.required();
            var definitions = x.definitions();
            if(definitions.length==1){
                var propType = tsutil.ramlType2TSType(definitions[0].type());
                pd.rangeType = new TS.TSSimpleTypeReference(pd, propType);
            }
            else {
                pd.rangeType = new TS.AnyType();
                definitions.forEach(d=> {
                    var propType = tsutil.ramlType2TSType(d.type());
                    var st:TS.TSTypeReference<any> = new TS.TSSimpleTypeReference(pd, propType);
                    pd.rangeType.union(st);
                })
            }
        })
        return tsi.toReference();
    }

    collapseToTypeAliasOrAdd(ptype:TS.TSInterface):void {
        var hash = ptype.hash();
        var ptasInt = (<TS.TSInterface>ptype);

        var et = this.typeHashToType[hash]
        if (et) {
            var onm = ptasInt.name
            var nm = onm
            var num=0;
            while (this.module.getInterface(nm).isDefined()){
                num++;
                nm=onm+num;
            }
            new TS.TSTypeAssertion(this.module, nm, et.toReference());
            //ptype = et;
        }
        else {
            this.typeHashToType[hash] = ptasInt;
            this.module.addChild(ptasInt);
        }
    }

    private processParameters( ptype:TS.TSTypeDeclaration, actualParameters:RamlWrapper.Param[],namePref:string):void {
        actualParameters.forEach(actualParameter=> {
            var p = new TS.TSAPIElementDeclaration(ptype, namePref+actualParameter.name());
            p.rangeType = this.getParamType(actualParameter);
            p.optional = !actualParameter.required();
        });
    }

    buildConversion():ConvertFunction<RamlWrapper.Api, TS.TSAPIModule> {
        return this.raml2TSModel;
    }

    private getParamType(actualParameter:RamlWrapper.Param):TS.TSTypeReference<any>{
        var tp:TS.TSTypeReference<any> = new TS.AnyType()
        actualParameter.definitions().forEach(x=>
            tp=tp.union(new TS.TSSimpleTypeReference(TS.Universe, this.mapRamlType(x.type()))));
        return tp
    }
    private typesMap:any = {
        "integer": "number",
        "string": "string",
        "boolean": "boolean",
        "number": "number",
        "file": "string",
        "date": "string"
    }

    private mapRamlType(ramlType:string):string{
        var result = this.typesMap[ramlType];
        if(!result){
            result = "string";
        }
        return result;
    }
}
class DefaultGenerator{
    strings:string[]=[];

    protected append(s:string){
        this.strings.push(s);
    }

    public getResult():string{
        return this.strings.join("");
    }
}


class ImplementationGenerator implements TS.TSModelVisitor {

    betweenElements() {
        if (this.level > 1) {
            this.generatedCode .push(",\n")
        }
    }
    generatedDeclarations:string[]=[];
    generatedCode:string[] =[];

    getResult():string{
        return this.generatedCode.join("")
    }

    isInP = false;
    level = 0;



    startTypeDeclaration(decl:TS.TSTypeDeclaration):boolean {
        this.generatedCode .push("\n{\n");
        this.isInP = this.isInPatch;
        this.isInPatch = false;
        if (this.level == 0) {
            this.generateDeclarations();
            this.level++;
            decl.children().forEach(x=>this.writePatchPart(x,`(<any>this)`,false));
            this.generatedCode.push("}\n")
            this.level--;
        }
        this.level++;
        return true;
    }

    protected genInvoke():string{
        return
        `invoke(path:string,method:string,obj:any){
            env.registerApi(this.declaration())
            return this.inv(path,method,obj)
         }`
    }

    protected generateConstructorParameters():string{
       return "op:any={}"
    }
    protected generateOpAssignment():string{
        return "this.options=op;"
    }

    protected generateDeclarations() {
        this.generatedCode.push(`
            private inv:invoker
            private options:any
            ${this.genInvoke()}
            constructor(${this.generateConstructorParameters()}inv:invoker=null/*fixme*/){

            ${this.generateOpAssignment()}
            `)
    }


    endTypeDeclaration(decl:TS.TSTypeDeclaration):void {
        this.generatedCode .push("\n"+` /* type ending */ }` + "\n");
        this.level--
        this.isInPatch = this.isInP;
    }

    isInPatch = false;
    isInFunct=false;
    isInFunction=false
    startVisitElement(decl:TS.TSAPIElementDeclaration):boolean {
        if (!this.isInPatch) {
            this.generatedCode.push(`${decl.name}`)
        }
        if (decl.rangeType != null && decl.rangeType.isFunctor()) {
            this.generateFunctionInline(decl);
            return false;
        }

        if (decl.isFunction()) {
            if (!this.isInPatch&&!this.isInFunction) {
                this.generatedCode.push( this.level > 1 ? ":" : (this.isInFunct ? ":any =" : "="));
            }
            this.generatedCode .push( decl.paramStr(true))
            this.generatedCode .push( "=>{\n")

            this.generatedCode .push( "var res=<any> \n");
            if (decl.rangeType) {
                if (decl.rangeType instanceof TS.TSSimpleTypeReference||decl.rangeType instanceof TS.TSUnionTypeReference) {
                    if (!(decl.rangeType instanceof ResourceMappedReference)) {
                        this.generateCall(decl)
                    }
                    else{
                        if (decl.rangeType instanceof ResourceMappedReference) {
                            this.subResourceProxyCreation(decl,<ResourceMappedReference>decl.rangeType);
                        }
                    }
                }
            }
            else {
                throw new Error("Range type is not defined")
            }
        }
        else {
            if (decl.rangeType instanceof ResourceMappedReference)
            {
                var q:TSResourceMappedApiElement = <TSResourceMappedApiElement>decl;
                var ref:ResourceMappedReference=<ResourceMappedReference>decl.rangeType;

                if (ref.resourceInterface().isFunctor()){
                    var c=this.isInFunct
                    this.isInFunct=true;
                    var funct = ref.resourceInterface().getFunctor();
                    funct.visit(this);
                    this.isInFunct=c;
                    return false;
                }
                else {
                    if (!this.isInPatch) {
                        this.generatedCode.push("=");
                    }
                    this.subResourceProxyCreation(decl,ref);
                }
            }
            else{
                throw new Error("Should not happen")
            }
            //this.generatedCode .push(decl.returnStr()+"\n");
        }
        return true;
    }
    cfg:Config;

    constructor(cfg:Config) {
        this.cfg = cfg;
    }

    protected subResourceProxyCreation(decl:TS.TSAPIElementDeclaration, ref:ResourceMappedReference) {
        this.generatedCode.push("new " + ref.name + "Impl(");
        decl.parameters.forEach(x=>this.generatedCode.push(x.name+","))
        this.generatedCode.push("this)\n");
        var p:ResourceImplementationGenerator=null;
        this.genSubResource(decl, p, ref);
    }

    protected genSubResource(decl:TS.TSAPIElementDeclaration, p:ResourceImplementationGenerator, ref:ResourceMappedReference) {
        var rimplGen = new ResourceImplementationGenerator(decl, p,this.cfg);
        if (ref.resourceInterface) {
            ref.resourceInterface().visit(rimplGen);
        }
        this.generatedDeclarations = this.generatedDeclarations.concat(rimplGen.generatedDeclarations);
        this.generatedDeclarations.push("class " + ref.name + "Impl\n" + rimplGen.getResult());
    }

    private generateFunctionInline(decl) {
        var c = this.isInFunct
        var isInFucntion = this.isInFunction
        this.isInFunct = true;
        if (decl.isFunction()) {
            this.generatedCode.push(decl.paramStr() + ":any" + (this.isInPatch ? "=>" : "") + "{\n")
            this.generatedCode.push("var result:any= ")

            this.isInFunction = true;
        }
        var funct = decl.rangeType.getFunctor();
        if (funct!=null) {
            funct.visit(this);
        }
        else{
            this.generatedCode.push("{}\n")
        }
        if (decl.isFunction()) {

            this.writePatchPart(decl, `result`, true);
            this.generatedCode.push("return result\n")
            this.generatedCode.push("}\n")
        }
        this.isInFunct = c;
        this.isInFunction = isInFucntion;
    }

    private generateCall(decl:TS.TSAPIElementDeclaration) :void{
        if (decl instanceof TSFullyMappedApiElement) {
            var q:TSFullyMappedApiElement = <TSFullyMappedApiElement>decl;
            var ru=q.originalResource.completeRelativeUri();
            if (this.cfg.collapseMediaTypes){
                //TODO select value among available ones
                ru=ru.replace("{"+MEDIA_TYPE_SUFFIX+"}","JSON")
                ru=ru.replace("{"+MEDIA_TYPE_EXTENSION+"}",".json")
            }
            var resolvedUrl=this.urlTemplate(ru,decl);
            this.generatedCode .push( `this.invoke(${resolvedUrl},'${q.originalMethod.method()}',{\n`);
            this.generatedCode .push( q.parameters
                .filter( x => ! x.isEmpty() )
                .map(    x => `"${x.name}":`+x.name+"\n" )
                .join(", "));

            this.generatedCode .push( '});\n');

        }
        else {
            throw new Error("Should never happen")
        }
    }

    protected urlTemplate(ru:string,decl:TS.TSAPIElementDeclaration):string {
        var s1 = "`";
        for (var i = 0; i < ru.length; i++) {
            var c = ru.charAt(i);
            if (c == '{') {
                s1 = s1 + "$"
            }
            s1 += c;
        }
        s1 += '`'
        return s1;
    }

    private writePatch(decl:TS.TSAPIElementDeclaration, path:String):void {
        if (decl.rangeType) {
            decl.rangeType.children().forEach(x=> {
                if (x.rangeType != null && x.rangeType.isFunctor()) {
                    //it is functor
                    x.rangeType.children().forEach(y=> {
                        if (!y.isAnonymousFunction()) {
                            var newPath = path + "." + x.name + "." + y.name;
                            this.generatedCode.push( newPath + "=");
                            this.writePatchDetails(y);
                            this.writePatchPart(y, newPath,false);
                        }
                    })
                }
            })
        }
    }

    private writePatchDetails(y:TS.TSAPIElementDeclaration):void {
        var ts = this.isInPatch;
        this.isInPatch = true;
        y.visit(this);
        this.isInPatch = ts;
        this.generatedCode .push( ";\n")
    }

    private writePatchPart(x:TS.TSAPIElementDeclaration, path:String,functionAllowed:boolean):void {

        if (x.rangeType != null && x.rangeType.isFunctor()&&(!x.isFunction()||functionAllowed)) {
            //it is functor
            x.rangeType.children().forEach(y=> {
                if (!y.isAnonymousFunction()) {
                    var newPath = path + "." + (!functionAllowed?(x.name + "."):"") + y.name;
                    this.generatedCode .push( newPath + "=");
                    this.writePatchDetails(y);
                    //this.writePatchPart(y, path + "." + x.name, true);
                }
            })
        }
    }

    endVisitElement(decl:TS.TSAPIElementDeclaration) :void{
        if (decl.isFunction()) {
            //we need patch all functors in child scopes here
            this.writePatch(decl, "res")

            this.generatedCode.push(`return res;/*d*${decl.name}*/}`)
            this.generatedCode.push("\n");
        }
    }


}
class ApiImplementationGenerator extends ImplementationGenerator{


    protected generateDeclarations() {
        var burl=(this._api.baseUri().isDefined()?this._api.baseUri().value():null).trim();
        if(util.stringEndsWith(burl,'/')){
            burl = burl.substring(0,burl.length-1)
        }
        this.generatedCode.push(`private baseUrl:string='${burl}'\n`);

        this.generatedCode.push(`private cfgEncoded=/*CONFIGENCODEDSTART*/${JSON.stringify(this.cfg)};/*CONFIGENCODEDEND*/\n`);
        this.generatedCode.push(`private apiEncoded=/*APIENCODEDSTART*/${JSON.stringify(this._api)};/*APIENCODEDEND*/\n`);
        this.generatedCode.push(`declaration():RamlWrapper.Api{var api : RamlWrapper.Api = new RamlWrapper.Api(<any>this.apiEncoded.data); endpoints.setApi(api); return api;}\n`);
        this.generatedCode.push(`authentificate(schemaName:string, options?:any){}\n`)

        this.generateAuthentification()
        this.generateBaseUrlResolveCall()
            this.generatedCode.push(`
            private inv:executor.APIExecutor
            private options:any
            ${this.genInvoke()}
            authenticate(schemaName?:string,options?:any):any{return null;}
            constructor(${this.generateConstructorParameters()}){
            this.inv=new executor.APIExecutor(this.declaration(),this.baseUrlResolved(),<any>this.cfgEncoded);
            ${this.generateOpAssignment()}
            `)

    }
    protected genInvoke():string{
        var executeMethod = this.cfg&&this.cfg.async ? 'executeAsync' : 'execute';
        return `
        invoke(path:string,method:string,obj:any){
            env.registerApi(this.declaration())
            return this.inv.${executeMethod}(this.baseUrlResolved()+path,method,obj)
        }`
    }
    protected generateParameterReplace(){
        var result:string="";
        this._api.baseUriParameters().forEach(x=>{
            if (x.name()=="version"){
                result=result+"burl=burl.replace('{"+x.name()+"}',"+"'"+(this._api.version().isDefined()?this._api.version().value():1)+"')\n";
            }
            else {
                result = result + "burl=burl.replace('{" + x.name() + "}'," + "this._" + x.name() + ")\n";
            }
        });
        return result;
    }
    protected generateOpAssignment():string{
        return ""
    }

    protected generateBaseUrlResolveCall(){
        this.generatedCode.push(`baseUrlResolved():string{
        var burl=this.baseUrl;
        ${this.generateParameterReplace()}
        return burl;
        }`)
    }

    protected generateConstructorParameters():string{
        var result:string[]=[];
        this._api.baseUriParameters().forEach(x=>{
            if (x.name()=="version"){
                return;
            }
            result.push("private _"+x.name()+":string")
        });
        return result.join(',');
    }
    constructor(private _api:RamlWrapper.Api,cfg:Config) {
        super(cfg);
    }

    protected generateAuthentification(){
        //this._api.securitySchemas().forEach(x=>{
        //    if (x.type() instanceof RamlWrapper.BasicSecuritySchemaType){
        //        this.generatedCode.push("authenticate(){}")
        //    }
        //})
        this.generatedCode.push("log(vName:string,val:any){this.inv.log(vName,val);return val;}")
    }
}

class ResourceImplementationGenerator extends ImplementationGenerator{

    protected urlTemplate(url:string,decl:TS.TSAPIElementDeclaration):string {

        var methodUrlParameters:{[key:string]:boolean} = {}
        if (this.cfg.methodNamesAsPrefixes && decl.isFunction()) {
            decl.parameters.forEach(x=> {
                if (x.location === TS.ParamLocation.URI) {
                    methodUrlParameters[x.name] = true
                }
            })
        }


        var s1 = "`";
        for (var i = 0; i < url.length; i++) {
            var c = url.charAt(i);
            if (c == '{') {
                var ind = url.indexOf('}',i);
                ind = ind < 0 ? url.length : ind;
                var paramName = url.substring(i+1,ind);
                s1 += this.isInPatch||methodUrlParameters[paramName] ? "${":"${this."
            }
            else{
            s1 += c;
            }
        }
        s1 += '`'
        return s1;
    }
    protected subResourceProxyCreation(decl:TS.TSAPIElementDeclaration, ref:ResourceMappedReference) {
        this.generatedCode.push("new " + ref.name + "Impl(");
        var c=this;
        var declArray:TS.TSAPIElementDeclaration[] = []
        while (c){
            if(c._decl.parameters && c._decl.parameters.length>0){
                declArray.push(c._decl)
            }
            c=c._parent;
        }
        declArray.reverse().forEach(x=>x.parameters.filter(
                p=>p.name!=MEDIA_TYPE_EXTENSION&&p.name!=MEDIA_TYPE_SUFFIX)
            .forEach(p=>this.generatedCode.push("this."+p.name+",")))

        decl.parameters.forEach(x=>this.generatedCode.push(x.name+","))
        this.generatedCode.push("this)\n");
        var p:ResourceImplementationGenerator=this;
        this.genSubResource(decl, p, ref);
    }
    constructor(private _decl:TS.TSAPIElementDeclaration,private _parent:ResourceImplementationGenerator,cfg:Config) {
        super(cfg);
    }
    private extraParams():string{
        var q=this;
        var declArray:TS.TSAPIElementDeclaration[] = []
        for( var q = this; q ; q = q._parent) {
            declArray.push(q._decl)
        }
        var str = ''
        declArray.reverse().forEach((x,i)=>x.parameters.forEach(p=>{
            var pName = p.name
            var isExt:boolean = pName==MEDIA_TYPE_EXTENSION||pName==MEDIA_TYPE_SUFFIX;
            if(isExt && i < declArray.length-1){
                return;
            }
            str += "private " + pName /*+ (isExt ? '="'+p.defaultValue+'"' : '')*/ + ', ';
        }))
        return str;
    }

    protected generateDeclarations() {
        var extraParams:string = this.extraParams();
        var mtCorrectingCommand:string = '';
        if(extraParams.indexOf('mediaTypeExtension')>=0){
            mtCorrectingCommand = `if(this.mediaTypeExtension){
                if(this.mediaTypeExtension.length>0){
                    this.mediaTypeExtension = ("." + this.mediaTypeExtension).replace("..",".")
                }
            }`;
        }

        this.generatedCode.push(`

            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor(${extraParams} private _parent:{invoke(path:string,method:string,obj:any):void}){
                ${mtCorrectingCommand}
            `)
    }
}
class MetadataGenerator extends DefaultGenerator implements TS.TSModelVisitor{
    startTypeDeclaration(decl:TS.TSTypeDeclaration):boolean {
        this.append("{/*ts*/");
        return true;
    }

    endTypeDeclaration(decl:TS.TSTypeDeclaration):void {
        this.append("}")
    }

    betweenElements():void {
        this.append(",");
    }

    startVisitElement(decl:TS.TSAPIElementDeclaration):boolean {
        if (decl.isFunction()){

        }
        else{

        }
        return true;
        //is it property or function
        //write is or return type
        //if this type is generic write a bit more info
        // and even more if it is a structured type
    }

    endVisitElement(decl:TS.TSAPIElementDeclaration):void {
        this.append("}");
    }
}

/**
 * this builder provides convertor which looses some information
 */
class DefaultModelSerializer implements Builder<TS.TSAPIModule,string>{

    cfg:Config;

    constructor(private _api:RamlWrapper.Api,cfg:Config) {
        this.cfg = cfg;
    }



    tsModule2Src = (mod:TS.TSAPIModule):string =>{
        var ig = new ApiImplementationGenerator(this._api,this.cfg);
        if (this.cfg.debugOptions.generateImplementation) {
            mod.getInterface("Api").value().visit(ig);
        }
        mod.getInterface("Api").getOrThrow().addCode("declaration():RamlWrapper.Api");
        mod.getInterface("Api").getOrThrow().addCode("authenticate(schemaName?:string,options?:any):any")
        //this._api.securitySchemas().forEach(x=>{
        //    if (x.type() instanceof RamlWrapper.BasicSecuritySchemaType){
        //        mod.getInterface("Api").value().addCode("authenticate()")
        //
        //    }
        //})
        mod.getInterface("Api").value().addCode("log(vName:string,val:any)")

        var ret = `
            ${this.cfg.storeHarEntry ? 'export interface UnknownResponse{ ' + HAR_ENTRY_FIELD_NAME + ' : har.Entry }' : ''}
            export interface payloadType{}
            export interface responseType{}
            export interface invoker{ (url:String,method:string,options:any):any; }
            export class ApiImpl implements Api ${ig.getResult()}
            `
        var schemas:string = "";
        mod.children().forEach(x=>schemas +=  x.serializeToString());

        ret = ig.generatedDeclarations.join("")+schemas + ret;
        ret += "\n var meta={}"
        //var mg=new MetadataGenerator();
        //mod.getInterface("Api").value().visit(mg);
        //return mg.getResult();
        return `import RamlWrapper=require('./Raml08Wrapper')
        import executor=require('./executor')
        import env=require('./executionEnvironment')
        import endpoints=require('./endpoints')

        env.setPath(__dirname);
        env.getReportManager().setLogPath(__dirname);

            `+ret;
    }

    buildConversion():ConvertFunction<TS.TSAPIModule, string> {
        return this.tsModule2Src;
    }
}
