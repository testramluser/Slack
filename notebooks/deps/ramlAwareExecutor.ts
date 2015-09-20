/// <reference path="./typings/tsd.d.ts" />

/**
 * Created by kor on 06/04/15.
 */

import Opt=require('./Opt')
import RamlWrapper=require('./Raml08Wrapper')
import RamlWrapper1 = require('./raml003parser')
import Helper = require('./wrapperHelper')
import report = require('./executionReport')
import reportImpl = require('./executionReportImpl')
import env = require('./executionEnvironment')
import config = require('./config')
import xmlutil = require('./xmlutil')
import raml2ts = require('./raml2ts')
var ZSchema=require("z-schema")
import platformExecution = require('./platformExecution');


var XMLHttpRequestConstructor = require("xmlhttprequest").XMLHttpRequest;
function buildXHR( ){
    var x: XMLHttpRequest = new XMLHttpRequestConstructor;
    return x
}
export interface HARExecutor{


    execute(req: har.Request):har.Response

    executeAsync(req:har.Request):Promise<har.Response>

    log(varName:string,value:any);

}
export class LoggingExecutor implements HARExecutor{

    execute(req:har.Request):har.Response {
        console.log(req.url);
        var res=this._delegate.execute(req);
        //console.log(res);
        return res;
    }
    executeAsync(req:har.Request):Promise<har.Response>{
        console.log(req.url);
        var res=this._delegate.executeAsync(req);
        //console.log(res);
        return res;
    }
    log(varName:string,value:any){
        this._delegate.log(varName,value);
    }

    constructor(private _delegate:HARExecutor) {

    }
}

export class MethodMatcher{

    constructor(private _api:RamlWrapper.Api|RamlWrapper1.Api,private burl:string) {}

    protected findMethod(url:string,method:string):RamlWrapper.Method|RamlWrapper1.Method{

        var res:RamlWrapper.Resource|RamlWrapper1.Resource;
        var buri=this.burl
        var m:RamlWrapper.Method|RamlWrapper1.Method=null;

        var allResources:(RamlWrapper.Resource|RamlWrapper1.Resource)[]
            = this._api instanceof RamlWrapper.Api
            ? (<RamlWrapper.Api>this._api).allResources()
            : Helper.allResources(<RamlWrapper1.Api>this._api);

        allResources.forEach(x=>
        {
            var fullRelativeUri:string = url.substr(buri.length)

            var matchUri:boolean
                = x instanceof RamlWrapper.Resource
                ? (<RamlWrapper.Resource>x).matchUri(fullRelativeUri).isDefined()
                : Helper.matchUri(fullRelativeUri,<RamlWrapper1.Resource>x).isDefined();

            if (matchUri){
                res=x;
                (<(RamlWrapper.Method|RamlWrapper1.Method)[]>res.methods()).forEach(x=>{
                    if (x.method().toLowerCase()==method.toLowerCase()){
                        m=x;
                    }
                })
            }
        })
        return m;
    }
}


export class AuthenticationDecorator extends MethodMatcher implements HARExecutor{

    execute(req:har.Request):har.Response {

        this.patchRequest(req)
        var res=this._delegate.execute(req);
        return res;
    }

    executeAsync(req:har.Request):Promise<har.Response>{
        this.patchRequest(req)
        var res=this._delegate.executeAsync(req);
        return res;
    }

    private patchRequest(req) {
        var m:RamlWrapper.Method|RamlWrapper1.Method = this.findMethod(req.url, req.method);
        if (m) {
            env.getAuthManager().patchRequest(req, m)
        }
    }

    log(varName:string,value:any){}

    constructor(private _delegate:HARExecutor,_api:RamlWrapper.Api|RamlWrapper1.Api,burl:string, private cfg:config.IConfig) {
        super(_api,burl)
    }
}

var ramlMethodPath = function (m:RamlWrapper.Method|RamlWrapper1.Method) {
    var absUri:string
        = m instanceof RamlWrapper.Method
        ? (<RamlWrapper.Method>m).resource().absoluteUri()
        : Helper.completeRelativeUri(Helper.parentResource(<RamlWrapper1.Method>m));

    return m.method().toUpperCase() + ' ' + absUri;
};

var requestPath = function (req) {
    return req.method.toUpperCase() + ' ' + req.url;
};


export class RequestValidator extends MethodMatcher implements HARExecutor{

    execute(req:har.Request):har.Response {

        var step:reportImpl.Step = new reportImpl.Step()
        step.request = req
        try {
            this.validateRequest(req,step);

            try {
                var res:har.Response = this._delegate.execute(req);
                step.response = res
            }
            catch(err){
                this.reportException(step,err)
            }

            this.validateResponse(req, res, step);
            return res;
        }
        catch(err){
            this.reportException(step,err)
        }
        finally{
            appendStep(step)
        }
    }

    log(varName:string,value:any){
        this._delegate.log(varName,value);
        appendVarLog({
            varName:varName,
            value:value,
            filePath:"unknown",
            lineNumber:0,
            columnNumber:0
        })
    }
    executeAsync(req:har.Request):Promise<har.Response> {

        var step:reportImpl.Step = new reportImpl.Step()
        step.request = req
            try {
            this.validateRequest(req,step);

                var res:Promise<har.Response> = this._delegate.executeAsync(req);
                return res.then(r=>{
                    step.response = r
                    this.validateResponse(req, r, step);
                    appendStep(step)
                    return r;
                }).catch(err=>{this.reportException(step,err);appendStep(step);return err})
            }
            catch(err){
                this.reportException(step,err)
            }

    }


    private reportException(step:reportImpl.Step,err:Error,altMessage?:string) {
        var text:string = err.toString()
        if(altMessage){
            text = altMessage
        }
        console.log(text)
        var msg = new reportImpl.Message(report.MessageCodes.EXCEPTION, report.MessageSeverity.ERROR,text)
        step.appendMessage(msg)
    }

    private reportInfo(step:reportImpl.Step, message:string) {
        var msg:reportImpl.Message = new reportImpl.Message(
            report.MessageCodes.OK,
            report.MessageSeverity.INFO,
            message
        )
        step.appendMessage(msg)
    }

    validateRequest(req:har.Request, step:reportImpl.Step){

        var m:RamlWrapper.Method|RamlWrapper1.Method = this.findMethod(req.url,req.method);
        var msg = null
        if(m){
            this.reportInfo(step,'Method mapped: ' + requestPath(req) + ' -> ' + ramlMethodPath(m) )
        }
        else{
            msg = new reportImpl.Message(
                report.MessageCodes.VALIDATION_FAILURE,
                report.MessageSeverity.ERROR,
                'Method can not be mapped on api: ' + requestPath(req))
            step.appendMessage(msg)
        }
        if(m) {
            if(m instanceof RamlWrapper.Method) {
                var raml08Method = <RamlWrapper.Method>m;
                step.methodId = raml08Method.id().value();
                step.apiTitle = raml08Method.api().title().value()
                step.resourceId = raml08Method.resource().id().value();
            }
            else{
                var raml10Method:RamlWrapper1.Method = <RamlWrapper1.Method>m;
                step.methodId = Helper.methodId(raml10Method);
                step.apiTitle = Helper.ownerApi(raml10Method).title();
                step.resourceId = Helper.completeRelativeUri(Helper.parentResource(raml10Method));
            }
            this.validateRequestArguments(m, req, step)
        }
    }

    validateRequestArguments(m:RamlWrapper.Method|RamlWrapper1.Method,req:har.Request, step:reportImpl.Step){

    }
    validateResponseValue(m:RamlWrapper.Method|RamlWrapper1.Method,req:har.Response, step:reportImpl.Step){
        console.log("Response:"+req)
        var status:string = ('' +req.status);
        if(parseInt(''+status[0])>3){
            var msg = new reportImpl.Message(report.MessageCodes.EXCEPTION, report.MessageSeverity.ERROR,'Invalid response status: ' + status)
            step.appendMessage(msg)
        }

        var bodiesMap:{[key:string]:(RamlWrapper.Body|RamlWrapper1.BodyLike)[]} = {}
        if(m instanceof RamlWrapper.Method){
            (<RamlWrapper.Method>m).responses().forEach(x=>bodiesMap[x.code()]=x.bodies());
        }
        else{
            (<RamlWrapper1.Method>m).responses().forEach(x=>bodiesMap[x.code()]=x.body());
        }

        var ct
        try {
            ct = JSON.parse(req.content.text);
        }
        catch(err){
            try {
                xmlutil(req.content.text)
            }
            catch(err) {

                var expectsObject:boolean = false
                var expectsText:boolean = false
                Object.keys(bodiesMap).forEach(x=>{
                    bodiesMap[x].forEach(y=>{
                        var mt:string
                            = y instanceof RamlWrapper.Body
                            ? (<RamlWrapper.Body>y).mediaType()
                            : (<RamlWrapper1.BodyLike>y).mediaType().value();

                        mt = mt.toLowerCase();
                        expectsObject = expectsObject || mt.indexOf('xml') > 0 || mt.indexOf('json') > 0;
                        expectsText = expectsObject || mt.indexOf('text/') == 0;
                    })
                })
                if(expectsObject && ! expectsText) {
                    var msg:reportImpl.Message = new reportImpl.Message(
                        report.MessageCodes.OTHER,
                        report.MessageSeverity.ERROR,
                        'Unable to parse response:\n' + req.content.text
                    )
                    step.appendMessage(msg)
                }
            }
        }
        if(!ct){
            return
        }
        Object.keys(bodiesMap).forEach(x=> {
            try{
                if (x == status) {
                    console.log("Status matched")
                    bodiesMap[x].forEach(y=>{

                        var mt:string
                            = y instanceof RamlWrapper.Body
                            ? (<RamlWrapper.Body>y).mediaType()
                            : (<RamlWrapper1.BodyLike>y).mediaType().value();

                        if(mt.toLowerCase().indexOf("json")!=-1){

                            var schemaOpt:Opt<RamlWrapper.SchemaDef|Helper.SchemaDef>
                                = y instanceof RamlWrapper.Body
                                ? (<RamlWrapper.Body>y).schema()
                                : Helper.schema(<RamlWrapper1.BodyLike>y,Helper.ownerApi(<RamlWrapper1.Method>m));

                            schemaOpt.forEach(sch=>{
                                var content:string = sch.content();
                                var schemaCoordinates:string = ramlMethodPath(m) + ' ' + x + ' ' + mt;
                                this.validateBodyAgainstSchema(ct,content,step,schemaCoordinates);
                            });
                        }
                    })
                }
            }catch (err){
                this.reportException(step,err)
            }
        });
    }

    validateBodyAgainstSchema(bcontent:any,schema:string,step:reportImpl.Step, schemaCoordinates:string){
        try{
            var jsonSchemaObject
            try {
                var jsonSchemaObject = JSON.parse(schema);
            }
            catch(err){
                try{
                    xmlutil(schema)
                }
                catch(err){
                    var msg:reportImpl.Message = new reportImpl.Message(
                        report.MessageCodes.VALIDATION_FAILURE,
                        report.MessageSeverity.ERROR,
                        'Can not parse schema:\n' + schemaCoordinates
                    )
                    step.appendMessage(msg)
                }
            }
            if(!jsonSchemaObject){
                return
            }

            try{
                var api = require('json-schema-compatibility');
                jsonSchemaObject =api.v4(jsonSchemaObject);
                //so['$ref']="http://json-schema.org/draft-04/schema#"
            }catch (e){
                this.reportException(step,e,'Can not parse schema'+schema)
            }

            delete jsonSchemaObject['$schema']
            delete jsonSchemaObject['required']

            var validator=new ZSchema();
            var valid = validator.validate(bcontent, jsonSchemaObject);
            if (valid){
                this.reportInfo(step, 'Valid schema: ' + schemaCoordinates);
                return;
            }
            //console.log("Validated schema")
            var errors:{code:string
                params:string[]
                message:string}[] = validator.getLastErrors();
            errors.filter(x=>x.code=="UNRESOLVABLE_REFERENCE").forEach(x=>{
                var schemaUrl=x.params[0];
                var req = buildXHR();
                req.open("GET", schemaUrl + "", false);
                req.send();
                var strng = req.responseText;
                validator.setRemoteReference(schemaUrl, JSON.parse(strng));
            })
            var valid = validator.validate(bcontent, jsonSchemaObject);
            if (valid){
                this.reportInfo(step, 'Valid schema: ' + schemaCoordinates);
                return ;
            }
            var errors:{code:string
                params:string[]
                message:string}[] = validator.getLastErrors();

            var msg:reportImpl.Message = new reportImpl.Message(
                report.MessageCodes.VALIDATION_FAILURE,
                report.MessageSeverity.ERROR,
                'Invalid schema: ' + schemaCoordinates,
                errors
            )
            step.appendMessage(msg)
        }catch (err){
            this.reportException(step,err)
        }
    }

    validateResponse(req:har.Request,resp:har.Response, step:reportImpl.Step){
        var m:RamlWrapper.Method|RamlWrapper1.Method= this.findMethod(req.url,req.method);
        if(m){
            this.validateResponseValue(m,resp, step);
        }
    }

    constructor(private _delegate:HARExecutor,_api:RamlWrapper.Api|RamlWrapper1.Api,burl:string, private cfg:config.IConfig) {
        super(_api,burl)
    }
}

export class SimpleExecutor implements HARExecutor{

    constructor(private cfg:config.IConfig){}

    execute(req:har.Request,doAppendParams:boolean=true):har.Response {
        var xhr = buildXHR();
        var url = req.url
        if(doAppendParams) {
            url = this.appendParams(req, req.url);
        }
        xhr.open(req.method, url, false);
        this.doRequest(req,xhr);
        //rheaders=xhr.getAllResponseHeaders();
        var status = xhr.status;
        if(status>300&&status<400){
            var locHeader = xhr.getResponseHeader('location')
            if(locHeader){
                req.url = locHeader
                return this.execute(req,false)
            }
        }
        var response:har.Response={
            status: status,
            headers: xhr.getAllResponseHeaders().split('\n').map(x=>{
                var ind = x.indexOf(':');
                return{
                    name : x.substring(0,ind).trim(),
                    value : x.substring(ind+1).trim()
                }
            }),
            content:{
                text:xhr.responseText,
                mimeType:xhr.responseType
            }
        };
        return response;
    }

    private appendParams(req, url):string {
        var gotQueryParams = (req.queryString && req.queryString.length > 0);
        var gotFormParams = (req.postData && req.postData.params && req.postData.params.length > 0);
        if (gotQueryParams || gotFormParams) {
            url = url + '?';
            var arr:string[] = []
            if (gotQueryParams) {
                arr = arr.concat(req.queryString.map(q=> {
                    return encodeURIComponent(q.name) + '=' + encodeURIComponent(q.value)
                }))
            }
            if (gotFormParams) {
                arr = arr.concat(req.postData.params.map(q=> {
                    return encodeURIComponent(q.name) + '=' + encodeURIComponent(q.value)
                }))
            }
            url += arr.join('&');
        }
        return url;
    }


    log(varName:string,value:any){
    }

    executeAsync(req:har.Request,doAppendParams:boolean = true):Promise<har.Response> {
        var xhr = buildXHR();
        var url=req.url
        if(doAppendParams) {
            url = this.appendParams(req, req.url);
        }
        var outer=this;
        return new Promise(function(resolve, reject) {

            xhr.open(req.method, url, true);
            xhr.onload = function() {
                    //rheaders=xhr.getAllResponseHeaders();
                var status = xhr.status;
                if(status>300&&status<400){
                    var locHeader = xhr.getResponseHeader('location')
                    if(locHeader){
                        req.url = locHeader
                        return outer.executeAsync(req,false)
                    }
                }
                var response:har.Response={
                        status: status,
                        headers: xhr.getAllResponseHeaders().split('\n').map(x=>{
                            var ind = x.indexOf(':');
                            return{
                                name : x.substring(0,ind).trim(),
                                value : x.substring(ind+1).trim()
                            }
                        }),
                        content:{
                            text:xhr.responseText,
                            mimeType:xhr.responseType
                        }
                    };
                    if(outer.cfg&&outer.cfg.storeHarEntry){
                        response[raml2ts.HAR_ENTRY_FIELD_NAME] = {
                            request: req,
                            response: {
                                status:status,
                                content:{
                                    text:xhr.responseText,
                                    mimeType:xhr.responseType
                                }
                            }
                        }
                    }
                    resolve(response);
            }
            xhr.onerror = function() {
                reject(Error("Network Error"));
            };

            outer.doRequest(req, xhr);
        });
    }

    private doRequest(req, xhr) {
// Make the request
        if (req.headers) {
            req.headers.forEach(x=>xhr.setRequestHeader(x.name, x.value))
        }
        if (req.postData) {
            if (req.postData.params) {
                //var fd = new FormData();
                //req.postData.params.forEach(p=>fd.append(p.name, p.value));
                //xhr.send(fd);
                var body = ''
                req.postData.params.forEach(p=>body += p.name + '=' + encodeURIComponent(p.value)+'&');
                body = body.substring(0,body.length-1)
                xhr.send(body);
            }
            else {
                xhr.send(req.postData.text);
            }
        }
        else {
            xhr.send();
        }
    }
}

function appendStep(step:report.ExecutionRequestStep):void{
    appendFilePathAndPosition(step)
    env.getReportManager().serializeStep(step)
}
export function doLog(varName:string,value:string){
    appendVarLog({
        varName:varName,
        value:value,
        filePath:"unknown",
        lineNumber:0,
        columnNumber:0
    })
}

function appendVarLog(step:report.VariableLogStep):void{
    appendFilePathAndPosition(step,true)
    env.getReportManager().serializeStep(step)
}

export function createExecutor(api:RamlWrapper.Api|RamlWrapper1.Api,baseUri:string,cfg:config.IConfig):HARExecutor{
    return new AuthenticationDecorator(new RequestValidator(new SimpleExecutor(cfg),api,baseUri,cfg),api,baseUri,cfg);
}

export function createFakeExecutor(api:RamlWrapper.Api,baseUri:string,cfg:config.IConfig):HARExecutor{
    return new RequestValidator(new FakeHARExecutor(),api,baseUri,cfg);
}

export class HARRequestWithResponse implements har.Request{

    constructor(entry:har.Entry){

        var request = entry.request;
        var response = entry.response;
        if(!request){
            throw new Error('HAR entry has no request:\n' + entry.toString())
        }
        if(!response){
            throw new Error('HAR entry has no response:\n' + entry.toString())
        }
        for(var key in request){
            this[key] = request[key]
        }
        this.response = () => response

    }
    response: () => har.Response

}

export class FakeHARExecutor implements HARExecutor{

    execute(req:HARRequestWithResponse):har.Response {
        return req.response();
    }
    executeAsync(req:HARRequestWithResponse):Promise<har.Response> {
        return Promise.resolve(req.response());
    }

    log(varName:string,value:any){
    }
}

function appendFilePathAndPosition(step:report.ExecutionRequestStep|report.VariableLogStep,st:boolean=false):void {
    if (platformExecution.type == 'java') {
        return;
    }

    var err:Error = new Error()
    var stack:string = err['stack']
    var split:string[] = stack.split(/\r?\n/).map(x => x.replace(new RegExp('\\\\','g'),'/'))

    var stackLines:StackLine[] = split.map(x=>{
        var j:number = x.lastIndexOf('/')+1

        var i0:number = x.indexOf('(') + 1
        var i2:number = x.lastIndexOf(':')
        var i1:number = x.lastIndexOf(':',i2-1)
        var i3:number = x.lastIndexOf(')')

        var className = x.substring(i0,j)
        var filePath = x.substring(i0,i1)
        var lineNumber = x.substring(i1+1,i2)
        var columnNumber = x.substring(i2+1,i3)

        var sl = new StackLine(className,filePath,parseInt(lineNumber),parseInt(columnNumber))
        return sl
    })

    var count = 0
    var beyondExecutor:boolean = false
    var notebookLine:StackLine
    var fileName=null;
    for(var i = 0 ; i < stackLines.length ; i++){

        var sl:StackLine = stackLines[i]

        if(sl.filePath.indexOf('executor.js')!=-1){
            beyondExecutor = true
            continue;
        }
        if(beyondExecutor){
            if (fileName){
                if(sl.filePath!=fileName) {
                    notebookLine = sl
                    break
                }
            }
            else{
                fileName=sl.filePath;
                if (st){
                    notebookLine=sl;
                    break;
                }
            }
        }

    }

    if(!notebookLine){
        return
    }
    step.filePath = notebookLine.filePath
    step.lineNumber = notebookLine.lineNumber
    step.columnNumber = notebookLine.columnNumber
}

class StackLine{

    constructor(className:string, filePath:string, lineNumber:number, columnNumber:number) {
        this.className = className;
        this.filePath = filePath;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
    }

    className:string
    filePath:string
    lineNumber:number
    columnNumber:number
}

