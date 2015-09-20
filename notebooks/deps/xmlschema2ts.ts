/// <reference path="./typings/tsd.d.ts" />
import path=require("path")
import fs =require("fs");
import mkdirp =require("mkdirp")
import _ = require("underscore");

import Opt = require('./Opt')
var tsc = require('typescript-compiler')
var jsonix = require('jsonix')

import RamlWrapper= require('./Raml08Wrapper')
import config= require('./config')
import JSON2TS= require('./jsonschema2ts')
import XML= require('./xmlutil')
import tsutil= require('./tsutil')
import TS =require('./TSDeclModel')

var ANY_TYPE = "__any_type__"

var SIMPLE_TYPE = "__simple_type__"

var XSD_2_TS_TYPE_MAP = {
    "ENTITIES": "string",
    "ENTITY": "string",
    "ID": "string",
    "IDREF": "string",
    "IDREFS": "string",
    "language": "string",
    "Name": "string",
    "NCName": "string",
    "NMTOKEN": "string",
    "NMTOKENS": "string",
    "normalizedString": "string",
    "QName": "string",
    "string": "string",
    "token": "string",
    "date": "string",
    "dateTime": "string",
    "duration": "string",
    "gDay": "string",
    "gMonth": "string",
    "gMonthDay": "string",
    "gYear": "string",
    "gYearMonth": "string",
    "time": "string",
    "anyURI": "string",
    "base64Binary": "string",
    "hexBinary": "string",
    "NOTATION": "string",
    "boolean": "boolean",
    "double": "number",
    "float": "number",
    "byte": "number",
    "decimal": "number",
    "int": "number",
    "integer": "number",
    "long": "number",
    "negativeInteger": "number",
    "nonNegativeInteger": "number",
    "nonPositiveInteger": "number",
    "positiveInteger": "number",
    "short": "number",
    "unsignedLong": "number",
    "unsignedInt": "number",
    "unsignedShort": "number",
    "unsignedByte": "number"
}

export class XMLSchematToTS {

    protected name:string

    protected cfg:config.IConfig

    protected module:TS.TSAPIModule

    simpleTypes:{[key:string]:any} = {}

    complexTypes:{[key:string]:any} = {}

    constructor(name:string, module?:TS.TSAPIModule, cfg?:config.IConfig) {
        //console.log(name);
        this.cfg = cfg
        this.name = name.charAt(0).toUpperCase() + name.substr(1);
        this.name = this.name.replace("-", "")
        this.module = module
    }

    parse(schema:string, appendHar:boolean = false):TS.TSTypeReference<any> {

        var schemaObject = parseSchema(schema);
        return this.createInterface(schemaObject, appendHar);
    }

    private createInterface(obj:any, appendHar:boolean):TS.TSTypeReference<any>{

        var tsi = new TS.TSInterface(this.module ? this.module:TS.Universe, this.name);
        var result:TS.TSTypeReference<any> = new TS.AnyType();
        var rootElements:ElementDescription[] = this.getRootElements(obj);
        rootElements.forEach(x=>this.processProperty(x, tsi, rootElements.length>1))
        if (this.generateHarEntry() && appendHar) {
            new JSON2TS.JSONSchematToTS("SomeType").appendHarEntry(tsi);
        }
        return tsi.toReference();
    }

    protected generateHarEntry():boolean {
        return this.cfg ? this.cfg.storeHarEntry : false
    }

    getRootElements(obj) {

        var objValue = obj['value']

        var result:ElementDescription[] = [];
        if (objValue) {

            var simpleTypes = objValue['simpleType']
            if (simpleTypes) {
                simpleTypes.forEach(x=>this.simpleTypes[x.name] = x);
            }

            var complexTypes = objValue['complexType']
            if (complexTypes) {
                complexTypes.forEach(x=>this.complexTypes[x.name] = x);
            }

            var rootElements = objValue['element'];
            if(rootElements){
                result = rootElements.map(x=>new ElementDescription(this,x));
            }
        }
        return result;
    }

    private processElement(element:ElementDescription,parent:TS.TSTypeDeclaration):void{

        var typeOpt = element.type()
        while(typeOpt.isDefined()){

            var eType = typeOpt.getOrThrow();

            var elements:ElementDescription[] = eType.elements();
            elements.forEach(x=>this.processProperty(x, parent));

            var attributes:AttributeDescription[] = eType.attributes();
            attributes.forEach(x=>this.processProperty(x, parent))

            typeOpt = eType.base();
        }

    }

    private processProperty(prop:PropertyDescription, parent:TS.TSTypeDeclaration, optional:boolean = false) {

        var propName = prop.isAttribute() ? '@'+prop.name() : prop.name();
        var pd = new TS.TSAPIElementDeclaration(parent, propName);
        pd.optional = optional || prop.optional();

        var eType = prop.type().getOrThrow();
        if (eType.isSimple()) {
            var xsdTypeName = eType.getBaseName();
            var tsTypeName = XSD_2_TS_TYPE_MAP[xsdTypeName.substring(xsdTypeName.indexOf(':')+1)];
            if (!tsTypeName) {
                throw new Error("Unable to resolze XSD simple type: " + xsdTypeName);
            }
            pd.rangeType = new TS.TSSimpleTypeReference(pd, tsTypeName);
        }
        else {
            if(prop.isAttribute()){
                throw new Error("Attribute with complex type occured in " + this.name);
            }
            if (eType.name() && ANY_TYPE == eType.name()) {
                pd.rangeType = new TS.AnyType();
            }
            else {
                var td = new TS.TSStructuralTypeReference(pd);
                this.processElement(prop, td);
                pd.rangeType = td.toReference();
            }
        }
        pd.rangeType.array = prop.isArray();
    }

}

class PropertyDescription{

    constructor(protected owner:XMLSchematToTS, protected _object:any){}

    name = ():string => this._object['name']

    type():Opt<TypeDescription>{

        var typeName
        var typeObject
        var isSimple = false;

        if(this._object['type']){
            var typeObj = this._object['type']
            typeName = extractName(typeObj);
            var sType = this.owner.simpleTypes[typeName];
            if(sType){
                typeObject = sType;
                isSimple = true;
            }
            var cType = this.owner.complexTypes[typeName];
            if(cType){
                typeObject = cType;
            }
            if((typeName.indexOf('xs:')==0||typeName.indexOf('xsd:')==0)) {
                if(typeName.substring(typeName.indexOf(':')+1)!='any'){
                    isSimple = true;
                }
            }
        }
        else if(this._object['complexType']){
            typeObject = this._object['complexType'];
        }
        else if(this._object['simpleType']){
            typeObject = this._object['simpleType'];
        }
        var result:TypeDescription = new TypeDescription(this.owner,typeName,isSimple,typeObject);
        return new Opt<TypeDescription>(result);
    }

    optional():boolean{
        throw new Error("This method is abstract.")
    }

    isArray():boolean{
        throw new Error("This method is abstract.")
    }

    isAttribute():boolean{
        return false;
    }
}

class AttributeDescription extends PropertyDescription {

    constructor(owner:XMLSchematToTS, object:any) {
        super(owner, object)
    }

    optional():boolean{
        var otherAttributes = this._object['otherAttributes'];
        if(!otherAttributes){
            return false;
        }
        var use = otherAttributes['use'];
        if(!use){
            return false;
        }
        return use != 'required';
    }

    isArray():boolean{
        return false;
    }

    isAttribute():boolean{
        return true;
    }
}

class ElementDescription extends PropertyDescription{

    constructor(owner:XMLSchematToTS,object:any) {
        super(owner,object)
    }


    isArray():boolean{
        var otherAttributes = this._object['otherAttributes'];
        if(!otherAttributes){
            return false;
        }
        var maxOccurs = otherAttributes['maxOccurs']
        if(!maxOccurs){
            return false;
        }
        if(maxOccurs == 'unbounded'){
            return true;
        }
        try{
            var mo = parseInt(maxOccurs);
            return mo > 1
        }
    catch(e){}
        return false;
    }

    optional():boolean{
        var otherAttributes = this._object['otherAttributes'];
        if(!otherAttributes){
            return true;
        }
        var minOccurs = otherAttributes['minOccurs']
        if(!minOccurs){
            return true;
        }
        try{
            var mo = parseInt(minOccurs);
            return mo == 0
        }
        catch(e){
        }
        return true;
    }
}

class TypeDescription{

    constructor(
    protected owner:XMLSchematToTS,
    protected _name:string,
    protected _isSimple:boolean,
    protected _object:any) {}

    name = ():string => this._name ;

    isSimple = ():boolean => this._isSimple;

    object = ():any => this._object;

    isChoice():boolean{
        return this.object && (this.object['choice'] ||
        (this.object['complexContent'] &&this.object['complexContent']['choice']) )
    }

    elements():PropertyDescription[]{
        var elementObjects:any[] = []
        if(this._object) {
            elementObjects = this.collectElements(this._object);
            if (elementObjects.length==0) {
                var complexContent = this.object['complexContent']
                if (complexContent) {
                    elementObjects = this.collectElements(complexContent);
                }
            }
        }
        var result:PropertyDescription[] = elementObjects.map(x=>new ElementDescription(this.owner,x));
        return result;
    }

    attributes():PropertyDescription[]{
        var result:PropertyDescription[] = []
        if(this._object && this._object['attribute']){
            result = this._object['attribute'].map(x=>new AttributeDescription(this.owner,x));
        }
        return result;
    }

    base():Opt<TypeDescription>{

        if(!this._object){
            return Opt.empty<TypeDescription>();
        }

        var baseObj;

        if(this._object['restriction']){
            var restriction = this._object['restriction'];
            baseObj = restriction['base'];
        }
    else if(this._object['complexContent']){
            var complexContent = this.object['complexContent']
            var resExt = complexContent['restriction'] || complexContent['extension'];
            if(resExt){
                baseObj = resExt['base'];
            }
        }
        if(!baseObj){
            return Opt.empty<TypeDescription>();
        }

        var typeName = extractName(baseObj);
        var isSimple = false;
        var typeObject

        var sType = this.owner.simpleTypes[typeName];
        if(sType){
            typeObject = sType;
            isSimple = true;
        }
        var cType = this.owner.complexTypes[typeName];
        if(cType){
            typeObject = cType;
        }
        if((typeName.indexOf('xs:')==0||typeName.indexOf('xsd:')==0)) {
            if(typeName.substring(typeName.indexOf(':')+1)!='any'){
                isSimple = true;
            }
        }

        var result:TypeDescription = new TypeDescription(this.owner,typeName,isSimple,typeObject);
        return new Opt<TypeDescription>(result);
    }

    getBaseName():string{
        var typeOpt:Opt<TypeDescription> = new Opt<TypeDescription>(this);
        var result = '';
        while(typeOpt.isDefined()){
            var t:TypeDescription = typeOpt.getOrThrow();
            result = t.name();
            typeOpt = t.base();
        }
        return result;
    }

    private collectElements(obj:any){
        var result:any = []
        var containers:any[] = [ obj['sequence'], obj['any'], obj['choice'] ];
        containers.filter(x=>x).forEach(x=>{
            if(x['element']){
                result = result.concat(x['element'])
            }
            result = result.concat(this.collectElements(x));
        });
        return result;
    }
}


function extractName(typeObj) {
    var prefix = typeObj['prefix']
    var localPart = typeObj['localPart']
    var typeName = prefix + (prefix.length > 0 ? ':' : '') + localPart;
    return typeName;
};

export function serializeToXML(obj:any,element?:string):string{


    var str = '';
    if(typeof(obj)=='object') {

        var isRoot:boolean = !element;
        if(isRoot){
            str += '<?xml version="1.0" encoding="UTF-8"?>';
        }
        else{
            str += '<'+element ;
        }
        var attrKeys:string[] = [];
        var elementKeys:string[] = [];
        var allKeys = Object.keys(obj).forEach(x=>{
            if(x.charAt(0)=='@'){
                attrKeys.push(x);
            }
            else{
                elementKeys.push(x);
            }
        });
        attrKeys.forEach(x=>str += serializeToXML(obj[x],x));
        if(!isRoot) {
            str += '>';
        }
        elementKeys.forEach((x,i)=> {
            if(i==0||!isRoot) {
                var value = obj[x];
                if (Array.isArray(value)) {
                    value.forEach((y,j)=> {
                        if(j==0||!isRoot) {
                            str += serializeToXML(y, x);
                        }
                    })
                }
                else if (value instanceof Object) {
                    str += serializeToXML(value, x);
                }
                else {
                    str += serializeToXML(value, x);
                }
            }
        });
        if(!isRoot) {
            str += '</' + element + '>';
        }
    }
    else{
        var isAttr:boolean = element && element.charAt(0) == '@';
        if(isAttr){
            str += ' ' + element.substring(1) +'="';
        }
        else{
            str += '<' + element + '>';
        }
        str += obj.toString();
        if(isAttr){
            str += '"';
        }
        else{
            str += '</' + element + '>';
        }
    }
    return str;
}

export function rootElementName(schema:string):Opt<string>{
    var schemaObj = parseSchema(schema);
    var rootElements:ElementDescription[] = new XMLSchematToTS('SomeType').getRootElements(schemaObj);
    if(rootElements.length==0){
        return Opt.empty<string>();
    }
    return new Opt<string>(rootElements[0].name());
}

export function parseClassInstance(content:string,schema:string):Opt<any>{

    var schemaObj = parseSchema(schema);
    var rootElements:ElementDescription[] = new XMLSchematToTS("SomeType").getRootElements(schemaObj);
    if(rootElements.length==0){
        return Opt.empty<any>();
    }
    try {
        var xmlObj = XML(content);
    }
    catch(e){
        return Opt.empty<any>()
    }
    var keys:string[] = Object.keys(xmlObj);
    if(keys.length==0){
        return Opt.empty<string>();
    }
    var key = keys[0];
    var result = {}
    result[key] = refineElement(xmlObj[key],rootElements[0]);
    return new Opt<any>(result);
}

function refineElement(obj:any,element:ElementDescription):any{
    var t:TypeDescription = element.type().getOrThrow();
    var isArray = element.isArray();
    var inArray = isArray && typeof(obj)=='array' ? obj : [ obj ];
    var outArray = [];

    inArray.forEach(x=>{
        if(t.isSimple()){
            var simpleValue = refineSimpleValue(x,t);
            outArray.push(simpleValue);
        }
        else {
            outArray.push(x);
            var elements:PropertyDescription[] = t.elements();
            elements.forEach(y=>{
                var name = y.name();
                var eObj = x[name];
                if(eObj){
                    x[name] = refineElement(eObj,y);
                }
            });
            var attributes:PropertyDescription[] = t.attributes();
            attributes.forEach(y=>{
                var name = '@'+y.name();
                var aObj = x[name];
                if(aObj){
                    var at:TypeDescription = y.type().getOrThrow();
                    x[name] = refineSimpleValue(aObj,at);
                }
            })
        }
    })
    if(isArray){
        return outArray;
    }
    else{
        return outArray[0];
    }
}

function refineSimpleValue(x:any,t:TypeDescription):any{
    var typeName = t.name();
    var objStr = x.toString();
    if(typeName == 'number'){
        try {
            return Number(objStr);
        }
        catch(e){}
    }
    else if(typeName == 'boolean'){
        if(objStr.toLowerCase()=='true'){
            return true;
        }
        else if(objStr.toLowerCase()=='false'){
            return false;
        }
    }
    return objStr;
}
function parseSchema(schema:string):string {
    var XSD_1_0 = require('w3c-schemas').XSD_1_0;
    var context = new jsonix.Jsonix.Context([XSD_1_0]);
    var unmarshaller = context.createUnmarshaller();
    var schemaObject = unmarshaller.unmarshalString(schema);
    return schemaObject;
};


