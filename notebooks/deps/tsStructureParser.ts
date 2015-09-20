/**
 * Created by kor on 08/05/15.
 */
/// <reference path="./typings/tsd.d.ts" />

import ts=require("typescript")
import tsm=require('./tsASTMatchers')
import pth=require("path")
import fs=require("fs")

function parse(content:string){
    return ts.createSourceFile("sample.ts",content,ts.ScriptTarget.ES3,"1.4.1",true);
}
var fld=tsm.Matching.field();
var clazzMatcher=tsm.Matching.classDeclaration();

export interface Module{
    classes:ClassModel[]
    imports:{ [name:string]:Module}
    aliases:AliasNode[]
    enumDeclarations:EnumDeclaration[]
    name:string
}
export interface AliasNode{
    name:string;
    type:TypeModel
}
export class EnumDeclaration{
    name:string
    members:string[]
}
export enum TypeKind{
    BASIC,
    ARRAY,
    UNION
}
export interface TypeModel{
    typeKind:TypeKind

}
export interface BasicType extends TypeModel{
    //typeName:string
    nameSpace:string
    basicName:string
    typeName:string
    typeArguments:TypeModel[]
    modulePath:string;
}

export interface ArrayType extends TypeModel{
    base:TypeModel
}

type Arg=string|number|boolean;

export interface UnionType extends TypeModel{
    options:TypeModel[]
}
export interface Annotation{
    name:string
    arguments:(Arg|Arg[])[];
}


export interface FieldModel{
    name:string
    type:TypeModel
    annotations:Annotation[];
    valueConstraint:Constraint;
    optional:boolean
}
export interface MethodModel{
    start:number
    end:number
    name:string
    text:string
}

export interface Constraint{
    isCallConstraint:boolean
}
export interface CallConstraint extends Constraint{
    value:Annotation
}
export interface ValueConstraint extends Constraint{
    value:string|number|boolean
}

export interface ClassModel{

    name:string

    annotations:Annotation[];
    moduleName:string;
    extends:TypeModel[]
    implements:TypeModel[]

    fields:FieldModel[]

    methods:MethodModel[]

    typeParameters:string[]
    typeParameterConstraint:string[]
    isInterface:boolean
}
export function classDecl(name:string,isInteface:boolean):ClassModel{
    return {
        name:name,
        methods:[],
        typeParameters:[],
        typeParameterConstraint:[],
        implements:[],
        fields:[],
        isInterface:isInteface,
        annotations:[],
        extends:[],
        moduleName:null
    }
}

export function parseStruct(content:string,modules:{[path:string]:Module},mpth:string):Module{
    var mod=parse(content);
    var module:Module={classes:[],aliases:[],enumDeclarations:[],imports:{},name:mpth}
    modules[mpth]=module;
    var currentModule:string=null;
    tsm.Matching.visit(mod,x=>{

        if (x.kind==ts.SyntaxKind.ModuleDeclaration){
            var cmod=<ts.ModuleDeclaration>x;
            currentModule=cmod.name.text;
        }
        if (x.kind==ts.SyntaxKind.ImportDeclaration){
            var imp=<ts.ImportDeclaration>x;
            var namespace=imp.name.text;
            if (namespace=="RamlWrapper"){
                return;
            }
            if (imp.moduleReference.kind!=ts.SyntaxKind.ExternalModuleReference){
                throw new Error("Only external module references are supported now")
            }
            var path=<ts.ExternalModuleReference>imp.moduleReference
            if (path.expression.kind!=ts.SyntaxKind.StringLiteral){
                throw new Error("Only string literals are supported in module references ")
            }
            var literal=<ts.StringLiteralExpression>path.expression;
            var importPath=literal.text;
            var absPath=pth.resolve(pth.dirname(mpth)+"/",importPath)+".ts";
            if (!fs.existsSync(absPath)){
                throw new Error("Path "+importPath+" resolve to "+absPath+"do not exists")
            }
            if (!modules[absPath]) {
                var cnt = fs.readFileSync(absPath).toString();
                var mod = parseStruct(cnt, modules, absPath);
            }
            module.imports[namespace]=modules[absPath];
        }
        if (x.kind==ts.SyntaxKind.TypeAliasDeclaration){
            var u=<ts.TypeAliasDeclaration>x;
            var aliasName=u.name.text;
            var type=buildType(u.type,mpth)
            module.aliases.push({name:aliasName,type:type})
            //return;
        }

        if (x.kind==ts.SyntaxKind.EnumDeclaration){
            var e=<ts.EnumDeclaration>x;
            var members:string[]=[];
            e.members.forEach(y=>{
                members.push(y['name']['text'])

            })
            module.enumDeclarations.push({name:e.name.text,members:members})
        }

        var isInterface=x.kind==ts.SyntaxKind.InterfaceDeclaration;
        var isClass=x.kind==ts.SyntaxKind.ClassDeclaration;
        if(!isInterface&&!isClass){
            return;
        }
        var c:ts.ClassDeclaration=<ts.ClassDeclaration>x;
        if (c){

            var fields:{[n:string]:FieldModel}={}
            var clazz=classDecl(c.name.text,isInterface)
            clazz.moduleName=currentModule;
            module.classes.push(clazz)
            c.members.forEach(x=>{
                if (x.kind==ts.SyntaxKind.Method){
                    var md=<ts.MethodDeclaration>x;
                    var aliasName=(<ts.Identifier>md.name).text;
                    var text=content.substring(md.pos,md.end);
                    clazz.methods.push({name:aliasName,start:md.pos,end:md.end,text:text})
                    //return;
                }
                var field:ts.PropertyDeclaration=fld.doMatch(x)
                if (field){
                    var f=buildField(field,mpth);
                    if (f.name=='$'){
                        clazz.annotations=f.annotations
                    }
                    else if (f.name.charAt(0)!='$'||f.name=='$ref') {
                        fields[f.name] = f;
                        clazz.fields.push(f)
                    }
                    else{
                        var of=fields[f.name.substr(1)]
                        if (!of){
                            console.log(f.name)
                        }
                        else {
                            of.annotations = f.annotations;
                        }
                    }
                }
            })
            if(c.typeParameters) {
                c.typeParameters.forEach(x=> {
                    clazz.typeParameters.push(x.name['text'])
                    if (x.constraint==null){
                        clazz.typeParameterConstraint.push(null);
                    }
                    else {
                        clazz.typeParameterConstraint.push(x.constraint['typeName']['text'])
                    }
                })
            }
            if (c.heritageClauses) {
                c.heritageClauses.forEach(x=> {
                    x.types.forEach(y=>{
                        if (x.token==ts.SyntaxKind.ExtendsKeyword) {
                            clazz.extends.push(buildType(y,mpth))
                        }
                        else if (x.token==ts.SyntaxKind.ImplementsKeyword){
                            clazz.implements.push(buildType(y,mpth))
                        }
                        else{
                            throw new Error("Unknown token class heritage")
                        }
                    })
                })
            }
            return tsm.Matching.SKIP
        }
    })
    return module;
}
function buildField(f:ts.PropertyDeclaration,path:string):FieldModel{
    return {
        name:f.name['text'],
        type:buildType(f.type,path),
        annotations:f.name['text'].charAt(0)=='$'?buildInitializer(f.initializer):[],
        valueConstraint:f.name['text'].charAt(0)!='$'?buildConstraint(f.initializer):null,
        optional:f.questionToken!=null
    }
}
function buildConstraint(e:ts.Expression):Constraint{
    if (e==null){
        return null;
    }
    if (e.kind==ts.SyntaxKind.CallExpression){
        return {
            isCallConstraint:true,
            value:buildAnnotation(e)
        }
    }
    else{
        return {
            isCallConstraint:false,
            value:parseArg(e)
        }
    }

}
function buildInitializer(i:ts.Expression):Annotation[]{
    if (i==null){
        return []
    }
    if (i.kind==ts.SyntaxKind.ArrayLiteralExpression){
        var arr=<ts.ArrayLiteralExpression>i;
        var annotations=[];
        arr.elements.forEach(x=>{
            annotations.push(buildAnnotation(x))
        })
        return annotations;
    }
    else{
        throw new Error("Only Array Literals supported now")
    }
}
function buildAnnotation(e:ts.Expression):Annotation{
    if (e.kind==ts.SyntaxKind.CallExpression){
        var call:ts.CallExpression=<ts.CallExpression>e;
        var name=parseName(call.expression);
        var a= {
            name:name,
            arguments:[]
        }
        call.arguments.forEach(x=>{
            a.arguments.push(parseArg(x))
        })
        return a;
    }
    else{
         throw new Error("Only call expressions may be annotations");
    }
}
function parseArg(n:ts.Expression):any{
    if (n.kind==ts.SyntaxKind.StringLiteral){
        var l:ts.StringLiteralExpression=<ts.StringLiteralExpression>n;

        return l.text
    }
    if (n.kind==ts.SyntaxKind.NoSubstitutionTemplateLiteral){
        var ls:ts.LiteralExpression=<ts.LiteralExpression>n;

        return ls.text
    }
    if (n.kind==ts.SyntaxKind.ArrayLiteralExpression){
        var arr=<ts.ArrayLiteralExpression>n;
        var annotations=[];
        arr.elements.forEach(x=>{
            annotations.push(parseArg(x))
        })
        return annotations;
    }
    if (n.kind==ts.SyntaxKind.TrueKeyword){
        return true
    }
    if (n.kind==ts.SyntaxKind.PropertyAccessExpression){
        var pa=<ts.PropertyAccessExpression>n;
        return parseArg(pa.expression)+"."+parseArg(pa.name)
    }
    if (n.kind==ts.SyntaxKind.Identifier){
        var ident=<ts.Identifier>n;
        return ident.text;
    }
    if (n.kind==ts.SyntaxKind.FalseKeyword){
        return false
    }
    if (n.kind==ts.SyntaxKind.NumericLiteral){
        var nl:ts.LiteralExpression=<ts.LiteralExpression>n;

        return nl.text
    }
    if (n.kind==ts.SyntaxKind.BinaryExpression){
        var bin:ts.BinaryExpression=<ts.BinaryExpression>n;
        if (bin.operator=ts.SyntaxKind.PlusToken){
            return parseArg(bin.left)+parseArg(bin.right)
        }
    }
    throw new Error("Uknown value in annotation")
}

function parseName(n:ts.Expression):string{
    if (n.kind==ts.SyntaxKind.Identifier){
        return n['text'];
    }
    if (n.kind==ts.SyntaxKind.PropertyAccessExpression){
        var m:ts.PropertyAccessExpression=<ts.PropertyAccessExpression>n;
        return parseName(m.expression)+"."+parseName(m.name)
    }
    throw new Error("Only simple identifiers are supported now")
}


function basicType(n:string,path:string):BasicType{
    var namespaceIndex=n.indexOf(".")
    var namespace=namespaceIndex!=-1?n.substring(0,namespaceIndex):"";
    var basicName=namespaceIndex!=-1?n.substring(namespaceIndex+1):n;

    return {typeName:n,nameSpace:namespace,basicName:basicName,typeKind:TypeKind.BASIC,typeArguments:[],modulePath:path}
}
function arrayType(b:TypeModel):ArrayType{
    return {base:b,typeKind:TypeKind.ARRAY}
}
function unionType(b:TypeModel[]):UnionType{
    return {options:b,typeKind:TypeKind.UNION}
}
function buildType(t:ts.TypeNode,path:string):TypeModel{
    if (t==null){
        return null
    }
    if (t.kind==ts.SyntaxKind.StringKeyword){
        return basicType("string",null)
    }
    if (t.kind==ts.SyntaxKind.NumberKeyword){
        return basicType("number",null)
    }
    if (t.kind==ts.SyntaxKind.BooleanKeyword){
        return basicType("boolean",null)
    }
    if (t.kind==ts.SyntaxKind.AnyKeyword){
        return basicType("any",null)
    }

    if (t.kind==ts.SyntaxKind.TypeReference){
        var tr:ts.TypeReferenceNode=<ts.TypeReferenceNode>t;
        var res=basicType(parseQualified(tr.typeName),path)
        if(tr.typeArguments){
            tr.typeArguments.forEach(x=>{
                res.typeArguments.push(buildType(x,path))
            })
        }
        return res;
    }
    if (t.kind==ts.SyntaxKind.ArrayType){
        var q:ts.ArrayTypeNode=<ts.ArrayTypeNode>t
        return arrayType(buildType(q.elementType,path));
    }
    if (t.kind==ts.SyntaxKind.UnionType){
        var ut:ts.UnionTypeNode=<ts.UnionTypeNode>t
        return unionType(ut.types.map(x=>buildType(x,path)));
    }
    throw new Error("Case not supported"+t.kind)
}
function parseQualified(n:ts.EntityName):string{
    if (n.kind==ts.SyntaxKind.Identifier){
        return n['text']
    }
    else{
        var q=<ts.QualifiedName>n;
        return parseQualified(q.left)+"."+parseQualified(q.right)
    }
}