/// <reference path="./typings/tsd.d.ts" />

import esprima = require("esprima");
import RamlWrapper= require('./Raml08Wrapper')
import ASTBuilder = require('./jsAstBuilder');
import raml2ts = require('./raml2ts');
import escodegen = require("escodegen")
import Opt=require('./Opt')
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

export class ParameterWithValue{
    constructor(name:string, value:Expression, location:RamlWrapper.ParamLocation) {
        this.name = name;
        this.value = value;
        this.location = location;
    }
    name:string
    value:Expression
    location:RamlWrapper.ParamLocation

    static build(name:string,value:any,location:RamlWrapper.ParamLocation){
        return new ParameterWithValue(name,ASTBuilder.literal(""+value),location);
    }
    static buildNumber(name:string,value:any,location:RamlWrapper.ParamLocation){
        return new ParameterWithValue(name,ASTBuilder.literal(""+value),location);
    }
    static buildBoolean(name:string,value:any,location:RamlWrapper.ParamLocation){
        return new ParameterWithValue(name,ASTBuilder.literal(""+value),location);
    }
}


export class HTTPCallOccurence {
    protected api:RamlWrapper.Api;
    protected method:RamlWrapper.Method
    protected segments:RamlWrapper.Resource[]
    protected bodyParameter:Expression;
    protected otherParams:ObjectExpression;

    toString() {
        return this.method.id();
    }

    //TODO uri params should not be segment based
    constructor(private name:string, method:RamlWrapper.Method,segments:RamlWrapper.Resource[],private uriParameters:Expression[][],
                body:Expression,params:ObjectExpression

    ) {
        this.api = method.api();
        this.method = method;
        this.segments=segments;
        this.bodyParameter=body;
        this.otherParams=params;
    }

    static build(name:string,method:RamlWrapper.Method, uriParameters:Expression[][],
                 body:Expression,args:ObjectExpression):HTTPCallOccurence{
        var r = method.resource();
        var segments=r.segments();
        return new HTTPCallOccurence(name,method,segments,uriParameters,body,args);
    }
    static getPattern(clientName:string,method:RamlWrapper.Method,cfg:raml2ts.Config):string{
        var pattern = HTTPCallOccurence.buildFrom(clientName, method, [], "body").toPatternString(cfg);
        return pattern;
    }

    static buildFrom(clientName:string,method:RamlWrapper.Method,args:ParameterWithValue[],body:any):HTTPCallOccurence{
        var uriParams=args.filter(x=>x.location==RamlWrapper.ParamLocation.uri)
        var segments:string[]=method.resource().completeRelativeUri().split("/");
        var uriParameters:Expression[][]=[];
        segments.forEach(seg=>{
            if (seg.length==0){
                return;
            }
            var un=HTTPCallOccurence.getUriParamNames(seg);
            var params:Expression[]=[];

            un.forEach(n=>{
                var o=HTTPCallOccurence.findName(n,uriParams);
                params.push(o.getOrElse(new ParameterWithValue(n,ASTBuilder.literal(''),RamlWrapper.ParamLocation.uri)).value)
            });
            uriParameters.push(params);
        });
        var paramLiteral=ASTBuilder.object();
        var queryParams=args.filter(x=>x.location==RamlWrapper.ParamLocation.query)
        this.pushParams(queryParams, paramLiteral,"");
        var headerParams=args.filter(x=>x.location==RamlWrapper.ParamLocation.header)
        this.pushParams(headerParams, paramLiteral,"header_");
        var formParams=args.filter(x=>x.location==RamlWrapper.ParamLocation.form)
        this.pushParams(formParams, paramLiteral,"form_");
        body=esprima.parse(JSON.stringify(body));
        return HTTPCallOccurence.build(clientName,method,uriParameters,body,paramLiteral);
    }

    private static pushParams(queryParams:ParameterWithValue[], paramLiteral:ObjectExpression,pref:string) {
        queryParams.forEach(x=>paramLiteral.properties.push(ASTBuilder.property(pref+x.name, x.value)));
    }

    private static findName(name:string,args:ParameterWithValue[]):Opt<ParameterWithValue>{
        var res:Opt<ParameterWithValue>=<Opt<ParameterWithValue>>Opt.empty();
        args.filter(x=>x.name==name).forEach(x=>res=new Opt(x));
        return res;
    }
    private static getUriParamNames(seg:string):string[]{
        //TODO SHOULD BE WRITTEN IN ANOTHER WAY
        var res:string[]=[]
        var cur=null;
        for (var a=0;a<seg.length;a++){
            var c=seg.charAt(a);
            if (c=='{'){
                cur="";
                continue;
            }
            if (c=='}'){
                if (cur!=null){
                    res.push(cur);
                    cur=null;
                    continue;
                }
            }
            if (cur!=null){
                cur=cur+c;
            }
        }
        return res;
    }

    private isCollapsed(cfg:raml2ts.Config):boolean {
        if (this.method.method() == "get") {
            return cfg.collapseGet;
        }
        if (this.method.resource().methods().length == 1) {
            return cfg.collapseOneMethod;
        }
        return false;
    }
    toSnippet(cfg:raml2ts.Config):string{
        var exp=this.toCall(cfg);
        return escodegen.generate(exp);
    }

    toPatternString(cfg:raml2ts.Config):string{
        var exp=this.toPattern(cfg);
        return escodegen.generate(exp);
    }

    toCall(cfg:raml2ts.Config):Expression {
        try {
            var methodArguments:Expression[];
            var params =this.otherParams;
            var body = this.bodyParameter;
            var newArgs:Expression[] = [];
            var hasBody = body != null && this.method.bodies().length > 0;
            //FIXME this should not depend from args settings in notebook;
            var hasArgs = params.properties.length > 0;
            if (hasArgs && hasBody && cfg.queryParametersSecond) {
                newArgs.push(body)
                newArgs.push(params);
            }
            else {
                if (hasArgs) {
                    newArgs.push(params);
                }
                if (hasBody) {
                    newArgs.push(body)
                }
            }
            var uri = this.method.resource().completeRelativeUri();
            var res = ASTBuilder.call(this.baseCall(uri, cfg), newArgs);
            return res;
        } catch (e) {
            console.log(e.stack)
        }
    }

    private toPattern(cfg:raml2ts.Config):Expression {
        try {
            var uri = this.method.resource().completeRelativeUri();
            var res = this.baseCall(uri, cfg,true);
            return res;
        } catch (e) {
            console.log(e.stack)
        }
    }


    private baseCall(uri:string, cfg:raml2ts.Config,toPatern:boolean=false):Expression {
        var segments = uri.split("/");
        var cur:Expression = ASTBuilder.ident(this.name);
        var uriParamIndex = 0;
        this.segments.forEach(x=> {
            if (x.relativeUri() != "") {
                var name = raml2ts.escapedName(x.relativeUri());
                cur = ASTBuilder.member(cur, name);
                var up = x.uriParameters();

                if (cfg.collapseMediaTypes) {
                    up = up.filter(x=>raml2ts.emitParameter(cfg, x))
                }
                if (up.length > 0&&!toPatern) {
                    var params = this.uriParameters[uriParamIndex];

                    if (params != null) {
                        cur = ASTBuilder.call(cur, params)
                    }
                    else {
                        params = [];
                        for (var num = 0; num < up.length; num++) {
                            params.push(ASTBuilder.literal(""))
                        }
                        cur = ASTBuilder.call(cur, params)
                    }
                }
            }
            uriParamIndex++;
        });
        if (!this.isCollapsed(cfg)) {
            cur = ASTBuilder.member(cur, this.method.method())
        }
        return cur;
    }

    getMethod():RamlWrapper.Method{
        return this.method
    }
}
