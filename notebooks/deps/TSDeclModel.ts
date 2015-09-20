/// <reference path="./typings/tsd.d.ts" />

import util   = require('./index');
import tsutil   = require('./tsutil');

import _ = require("underscore");
import assert = require("assert")
import iconfig = require('./config')

import Opt=require('./Opt');

export interface TSModelVisitor {
    startTypeDeclaration(decl:TSTypeDeclaration):boolean;
    endTypeDeclaration(decl:TSTypeDeclaration):void;
    betweenElements():void;
    startVisitElement(decl:TSAPIElementDeclaration):boolean;
    endVisitElement(decl:TSAPIElementDeclaration):void;
}



//TODO HIDE Fields from unmanagable modification
//TODO Refine type decl type ref hieararchy a bit more
//TODO add classes, generics, metadata
export class TSModelElement<T extends TSModelElement<any>> {

    private _parent:TSModelElement<any>;
    private _children:T[]
    protected _config:iconfig.IConfig

    patchParent(parent:TSModelElement<any>){
        this._parent=parent;//FIXME
    }

    isEmpty():boolean {
        return this._children.length == 0;
    }
    parent():TSModelElement<any>{return this._parent}

    children():T[] {
        return this._children;
    }



    root():TSAPIModule{
        if (this._parent==Universe){
            return <TSAPIModule>(<any>this);
        }
        return this._parent.root();
    }

    constructor(parent:TSModelElement<any> = Universe,config?:iconfig.IConfig) {
        this._parent = parent;
        this._config = config ? config : parent._config
        this._children = [];
        assert(parent,"Should never be null");

        this._parent.addChild(this);
    }

    removeChild(child:T){
        if (child._parent==this){
            this._children=this._children.filter(x=>x!=child);
        }
        child._parent=Universe;
    }

    addChild(child:T){
        if(child._parent){
            child._parent.removeChild(child);
        }
        child._parent=this;
        this._children.push(child);
    }

    serializeToString():string {
        throw new Error("You should override serialize to string always");
    }
}
//TODO It should become an interface
export class TSTypeDeclaration extends TSModelElement<TSAPIElementDeclaration> {
    canBeOmmited = () => this.locked ? false : this.children().every( x => x.optional )

    locked:boolean=false;

    protected extras:string[]=[""];

    addCode(code:string):void{
        this.extras.push(code)
    }

    toReference():TSTypeReference<any>{throw new Error("Implement in subclasses");}

    hash(){ return this.serializeToString(); }

    isFunctor() {
        return this.children().some(x=>x.isAnonymousFunction())
    }

    constructor(parent:TSModelElement<any> = null){
        super(parent);
    }

    getFunctor() {
        return _.find( this.children(), x => x.isAnonymousFunction() )
    }

    visit(v:TSModelVisitor) {
        if (v.startTypeDeclaration(this)) {
            this.children().forEach((x, i, arr) => {
                x.visit(v)
                if (i != arr.length - 1) v.betweenElements();
            })
            v.endTypeDeclaration(this);
        }
    }
}

export class TSInterface extends TSTypeDeclaration {


    name:string
    extends:TSTypeReference<any>[]=[];
    implements:TSTypeReference<any>[]=[];



    hash(){ return this.children().filter(x=>!x.isPrivate).map( x =>  "\n" + x.serializeToString() + "\n" ).join('') }

    toReference():TSTypeReference<any>{return new TSDeclaredInterfaceReference(Universe,this.name,this)}


    constructor(p:TSModelElement<any>, name:string) {
        super(p)
        this.name = name;
    }
    decl(){
        return "interface"
    }

    serializeToString() {
        var body = this.hash();
        return "export "+this.decl() +" "+ this.name.concat(this.extendsString()+this.implementsString())+
            "{" +this.extras.join("\n")+ body + "}\n"
    }

    private  extendsString():string{
        if(this.extends.length>0){
            return " extends "+this.extends.map(x=>x.serializeToString()).join(",")
        }
        return "";
    }

    private  implementsString():string{
        if(this.implements.length>0){
            return " implements "+this.implements.map(x=>x.serializeToString()).join(",")
        }
        return "";
    }

}
//TODO INCORRECT INHERITANCE CHAIN
export class TSClassDecl extends TSInterface{

    decl(){
        return "class"
    }

}

export class TSTypeAssertion extends TSTypeDeclaration{

    toReference():TSTypeReference<any>{return new TSSimpleTypeReference(Universe,this.name)}

    constructor(p:TSModelElement<any>, private name:string,private ref:TSTypeReference<any>) {
       super(p);
    }

    serializeToString() {
        return "export type " + this.name + "=" + this.ref.serializeToString()+"\n";
    }
}

export class TSUniverse extends TSModelElement<any>{

    constructor() {
        super(this)
    }

    addChild(child:any){
    }

    setConfig(cfg:iconfig.IConfig){ this._config = cfg; }

    getConfig():iconfig.IConfig{ return this._config; }
}
export var Universe=new TSUniverse();

export class TSAPIModule extends TSModelElement<TSInterface>{

    getInterface(nm:string):Opt<TSInterface>{
        return new Opt(_.find(this.children(),x=>x.name==nm));
    }

    serializeToString():string {

        var typeMap:{[key:string]:TSInterface} = {};
        this.children().forEach(x=>typeMap[x.name]=x);

        var covered:{[key:string]:boolean} = {};
        var sorted:TSInterface[] = []
        var append = function(t:TSInterface){
            if(covered[t.name]){
                return;
            }
            covered[t.name] = true;
            var refs:TSTypeReference<any>[] = t.extends;
            refs.forEach(ref=> {
                    if (ref instanceof TSSimpleTypeReference) {
                        var name = (<TSSimpleTypeReference>ref).name;
                        var st = typeMap[name];
                        if (st) {
                            append(st);
                        }
                    }
                }
            );
            sorted.push(t);
        }
        this.children().forEach(x=>append(x));
        return sorted.map(x=>x.serializeToString()).join("\n")
    }
}


interface NoChildren extends TSModelElement<NoChildren> {
}

export class TSMember<T extends TSModelElement<any>> extends TSModelElement<T> {
    optional:boolean;
}

export interface TSTypeReference<T extends TSModelElement<any>> extends TSModelElement<T> {

    array:boolean
    locked:boolean;

    canBeOmmited():boolean;


    isFunctor():boolean;

    getFunctor():TSAPIElementDeclaration;

    union(q:TSTypeReference<any>):TSTypeReference<any>

    copy(parent:TSModelElement<any>):TSTypeReference<any>
}


export class TSUnionTypeReference extends TSModelElement<TSTypeReference<any>> implements TSTypeReference<TSTypeReference<any>>{

    array:boolean;
    locked:boolean;
    getFunctor():TSAPIElementDeclaration {
        return null;
    }

    //TODO FIXIT FIX IT WITH MIX IN
    union(q:TSTypeReference<any>):TSTypeReference<any>{
        var r=new TSUnionTypeReference();
        this.children().forEach(x=>r.addChild(x));
        r.addChild(q);
        return r;
    }

    isFunctor():boolean{
        return false;
    }

    canBeOmmited():boolean{
        return false;
    }

    serializeToString():string {
        var str = this.children().map(x=>x.serializeToString()).join(" | ");
        if(this.array){
            if(this.children().length>1){
                return '(' + str + ')[]';
            }
            else{
                return str + '[]'
            }
        }
        else{
            return str
        }
    }

    removeChild(child:TSTypeReference<any>){}

    addChild(child:TSTypeReference<any>){
        this.children().push(child);
    }

    copy(parent:TSModelElement<any>):TSTypeReference<any>{
        var result = new TSUnionTypeReference();
        Object.keys(this).forEach(x=>{
            if(x!='parent'){
                result[x] = this[x];
            }
        });
        return result;
    }
}

export class TSSimpleTypeReference extends TSModelElement<NoChildren> implements TSTypeReference<NoChildren> {

    locked:boolean;

    typeParameters:TSTypeReference<any>[]

    isEmpty():boolean {
        return false;
    }


    getFunctor():TSAPIElementDeclaration {
        return null;
    }

    canBeOmmited():boolean {
        return false;
    }

    isFunctor():boolean {
        return false;
    }
    array:boolean=false;

    constructor(p:TSModelElement<any>, tn:string) {
        super(p);
        this.name = tn;
    }

    union(q:TSTypeReference<any>):TSTypeReference<any>{
        var r=new TSUnionTypeReference();
        r.addChild(this);
        r.addChild(q);
        return r;
    }

    name:string

    genericStr = ():string => this.typeParameters && this.typeParameters.length > 0
        ?'<' + this.typeParameters.map( p => p.serializeToString() ).join(',') + '>'
        : '';

    serializeToString() {
        return this.name + this.genericStr() + (this.array?"[]":"");
    }

    copy(parent:TSModelElement<any>):TSTypeReference<any>{
        var result = new TSSimpleTypeReference(parent,this.name);
        Object.keys(this).forEach(x=>{
            if(x!='parent'){
                result[x] = this[x];
            }
        });
        return result;
    }
}
export class TSFunctionReference extends TSModelElement<NoChildren> implements TSTypeReference<NoChildren> {

    locked:boolean;

    rangeType:TSTypeReference<any>=new AnyType();

    parameters:Param[] = [];

    isEmpty():boolean {
        return false;
    }

    getFunctor():TSAPIElementDeclaration {
        return null;
    }

    canBeOmmited():boolean {
        return false;
    }

    isFunctor():boolean {
        return true;
    }
    array:boolean=false;

    constructor(p:TSModelElement<any>) {
        super(p);
    }

    union(q:TSTypeReference<any>):TSTypeReference<any>{
        var r=new TSUnionTypeReference();
        r.addChild(this);
        r.addChild(q);
        return r;
    }

    serializeToString() {
        return this.paramStr() + '=>' + this.rangeType.serializeToString() + (this.array?'[]':'');
    }

    paramStr = (appendDefault:boolean=false):string => '(' + this.parameters
        .filter(x=>!x.isEmpty())
        .map( p => p.serializeToString(appendDefault) )
        .join(', ') + ')'

    copy(parent:TSModelElement<any>):TSTypeReference<any>{
        var result = new TSFunctionReference(parent);
        Object.keys(this).forEach(x=>{
            if(x!='parent'){
                result[x] = this[x];
            }
        });
        return result;
    }
}
export class TSDeclaredInterfaceReference extends TSSimpleTypeReference{

    isEmpty():boolean {
        return false;
    }



    getFunctor():TSAPIElementDeclaration {
        return null;
    }

    canBeOmmited():boolean {
        return false;
    }

    constructor(p:TSModelElement<any>, tn:string,private _data:TSInterface) {
        super(p, tn);
    }

    getOriginal(){
        return this._data;
    }
}
export class AnyType extends TSSimpleTypeReference{

    constructor(nm:string="any") {
        super(Universe, nm);
    }
    union(q:TSTypeReference<any>):TSTypeReference<any>{
        return q;
    }
}

export class TSStructuralTypeReference extends TSTypeDeclaration implements TSTypeReference<TSAPIElementDeclaration> {
    visitReturnType(v:TSModelVisitor) {
        //v.visitStructuralReturn(this);
        this.visit(v);
    }
    toReference():TSTypeReference<any>{return this}


    union(q:TSTypeReference<any>):TSTypeReference<any>{
        var r=new TSUnionTypeReference();
        r.addChild(this);
        r.addChild(q);
        return r;
    }

    array:boolean=false;


    constructor(parent:TSModelElement<any> = Universe){
        super(parent);
    }

    serializeToString() {
        var body = this.children().map(x=> `\n${x.serializeToString()}\n` ).join('')
        return "{" + body + "}" + (this.array?"[]":"");
    }

    canBeOmmited = () => this.locked ? false : this.children().every( x => x.optional )

    copy(parent:TSModelElement<any>):TSTypeReference<any>{
        var result = new TSStructuralTypeReference(parent);
        Object.keys(this).forEach(x=>{
            if(x!='parent'){
                result[x] = this[x];
            }
        });
        return result;
    }

}

export enum ParamLocation{
    URI, BODY, OPTIONS, OTHER
}

export class Param extends TSModelElement<TSTypeReference<any>> {
    name:string
    ptype:TSTypeReference<any>;
    optional:boolean;
    location:ParamLocation;
    defaultValue:any;

    isEmpty(): boolean {
        return this.ptype.isEmpty()
    }

    constructor(
        p:TSAPIElementDeclaration,
        nm:string,
        location:ParamLocation,
        tp:TSTypeReference<any> = new TSSimpleTypeReference(Universe, "string"),
        defaultValue?:any) {
        super(p);
        this.name = nm;
        this.ptype = tp;
        this.location = location;
        this.defaultValue = defaultValue;
    }

    serializeToString(appendDefault:boolean = false) {
        //return this.name + (this.optional ? "?" : "") + ":" + this.ptype.serializeToString() + (this.ptype.canBeOmmited() ? "?" : "");
        return this.name + (this.optional || (this.defaultValue && !appendDefault) ? "?" : "")
            + (":" + this.ptype.serializeToString() + (this.ptype.canBeOmmited() ? "?" : ""))
            + (appendDefault && this.defaultValue ? '='+JSON.stringify(this.defaultValue) : '');
    }
}
export interface Value extends TSMember<NoChildren>{

    value():any
}
export class StringValue extends TSMember<NoChildren> implements Value{

    constructor(private _value:string){
        super();
    }

    value():string {
        return this._value;
    }

    serializeToString():string {
        return `"${this._value}"`
    }
}

export class ArrayValue extends TSMember<NoChildren> implements Value{

    constructor(private _values:Value[]){
        super();
    }

    value():string {
        return this.serializeToString();
    }

    serializeToString():string {
        return `[ ${this._values.map(x=>x.value()).join(', ')} ]`
    }
}


export class TSAPIElementDeclaration extends TSMember<TSTypeReference<any>> {
name:string;
rangeType:TSTypeReference<any>=new AnyType();
parameters:Param[]
optional:boolean;
value:Value=null;

isPrivate:boolean;
isFunc:boolean;

_body:string;

visit(v:TSModelVisitor) {
    if (v.startVisitElement(this)) {
        if (this.rangeType) {
            if (this.rangeType instanceof TSStructuralTypeReference) {
                (<TSStructuralTypeReference>this.rangeType).visitReturnType(v);
            }
        }
        v.endVisitElement(this);
    }
}

constructor(p:TSModelElement<any>, name:string) {
    super(p);
    this.name = name;
    this.parameters = [];
    this.rangeType = null;
    this.optional = false;
}

paramStr = (appendDefault:boolean=false):string => '( ' + this.parameters
.filter(x=>!x.isEmpty())
.map( p => this.serializeParam(p,appendDefault) )
.join(',') + ' )'

protected serializeParam = (p:Param, appendDefault:boolean):string => p.serializeToString(appendDefault)

isFunction = ():boolean => this.parameters.length != 0||this.isFunc

isAnonymousFunction = ():boolean => this.isFunction() && this.name === ''

returnStr = ():string => this.rangeType ?  ':' + this.rangeType.serializeToString() : ''

commentCode(){
    return `
        /**
         *
         **/
         //${this.name}
         `
}

serializeToString() {
    var x = (this.isPrivate ? 'private ' : '')
        + this.escapeDot(this.name)
        + (this.optional ? "?" : "")
        + (this.isFunction()? this.paramStr() : "")
        + this.returnStr();

    if (this.value){
        x+='='+this.value.value();
    }
    return this.commentCode() + x + (this.isFunction()&&this.isInterfaceMethodWithBody() ? '' : this.body());
}
body(){
    if (this._body==null)return "";
    return "{"+this._body+"}"
}

private escapeDot( name:string ): string {
    return tsutil.escapeTypescriptPropertyName( name )
}

isInterfaceMethodWithBody():boolean{ return false; }

}

export class TSConstructor extends TSAPIElementDeclaration {
    constructor(p:TSModelElement<any>) {
        super(p,'constructor');
    }

    protected serializeParam = (p:Param, appendDefault:boolean):string => 'protected ' + p.serializeToString(appendDefault)
}
