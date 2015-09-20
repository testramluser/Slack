/// <reference path="./typings/tsd.d.ts" />

import parseXml=require('./xmlutil')

import harExecutor=require('./ramlAwareExecutor')
import RamlWrapper=require('./Raml08Wrapper')
import RamlWrapper1 = require('./raml003parser')
import Helper = require('./wrapperHelper')
import config = require('./config')
import xmlutil = require('./xmlutil')
import raml2ts = require('./raml2ts')
import Opt = require('./Opt')
import XML2TS = require('./xmlschema2ts')


var XMLHttpRequestConstructor = require("xmlhttprequest").XMLHttpRequest;
function buildXHR( ){
    var x: XMLHttpRequest = new XMLHttpRequestConstructor;
    return x
}



// "http://localhost:8080/etc/sample.json"

class Header{
    name:string
    value:string

    constructor(name:string, value:string) {
        this.name = name;
        this.value = value;
    }
}

class HARRequest implements har.Request {
    constructor(url:string,method:string,queryArgs:har.QueryParameter[],headers:har.Header[]) {
        this.url = url;
        this.method=method
        this.queryString=queryArgs;
        this.headers=headers;

    }

    /**
     * Request method (GET, POST, ...).
     */
    method: string // "GET",

    /**
     * Absolute URL of the request (fragments are not included).
     */
    url: string // "http://www.example.com/path/?param=value",

    /**
     * Request HTTP Version.
     */
    httpVersion: string ="HTTP/1.1"


    /**
     * List of header objects.
     */
    headers: har.Header[]

    queryString : har.QueryParameter[]

    /**
     * posted data info.
     */
    postData : har.PostData

    /**
     * Total number of bytes from the start of the HTTP request message until (and including)
     * the double CRLF before the body. Set to -1 if the info is not available.
     */
    headersSize : number=-1

    /**
     * Size of the request body (POST data payload) in bytes.
     * Set to -1 if the info is not available.
     */
    bodySize : number=-1;
}


function detectMimeType(ramlMethod:RamlWrapper.Method|RamlWrapper1.Method ,options:any){

    var optKeys = Object.keys(options);
    for(var i = 0 ; i < optKeys.length ; i++){
        var key = optKeys[i];
        if(key.toLowerCase()=='header_content-type'){
            var val = options[key];
            if(val && typeof(val)=='string'&&val.trim().length>0){
                return val;
            }
        }
    }

    var payload=options['payload'];
    var payloadType = typeof(payload);
    if(payloadType === 'object' || payloadType === 'array'){
        var jsonMediaType:string;
        var xmlMediaType:string;

        var mediaTypes:string[]
            = ramlMethod instanceof RamlWrapper.Method
            ? (<RamlWrapper.Method>ramlMethod).bodies().map(x=>x.mediaType())
            : (<RamlWrapper1.Method>ramlMethod).body().map(x=>x.mediaType().value());

        mediaTypes.forEach(mt=>{
            var mt_lc = mt.toLowerCase();
            if(mt_lc.indexOf('json')>=0){
                jsonMediaType = mt;
            }
            else if(mt_lc.indexOf('xml')>=0){
                xmlMediaType = mt;
            }
        })
        if(jsonMediaType) {
            return jsonMediaType
        }
        if(xmlMediaType) {
            return xmlMediaType
        }
    }
    if(payloadType==='string'){
        try {
            xmlutil(payload)
            return 'application/xml'
        }
        catch(err){}
    }
    return 'text/plain'
}

function prepareBodyString(payload,mimeType:string,ramlMethod:RamlWrapper.Method|RamlWrapper1.Method){
    var payloadType = typeof(payload);
    if(mimeType.toLowerCase().indexOf('xml')>=0){
        if(payloadType === 'object'){
            return XML2TS.serializeToXML(payload);
        }
    }
    if(payloadType === 'object' || payloadType === 'array'){
        return JSON.stringify(payload)
    }
    return '' + payload
}
export function log(varName:string,value:string){
    harExecutor.doLog(varName,value);
    return value;
}
export class APIExecutor extends harExecutor.MethodMatcher{

    actualExecutor:harExecutor.HARExecutor;

    constructor(api:RamlWrapper.Api|RamlWrapper1.Api,resolvedUrl:string,private cfg:config.IConfig) {
        super(api,resolvedUrl);
        this.actualExecutor=harExecutor.createExecutor(api,resolvedUrl,cfg);
    }

    execute(path:string,method:string,options:any){
        var req=this.toRequest(path,method,options);
        var resp=this.actualExecutor.execute(req);
        return this.processResponse(req,resp);
    }

    executeAsync(path:string,method:string,options:any){
        var req=this.toRequest(path,method,options);
        var respPromise=this.actualExecutor.executeAsync(req);
        //TODO do it in the proper way
        return respPromise.then(resp=> {
            return this.processResponse(req,resp);
        })
    }

    toRequest(path:string,method:string,options:any){
        var queryParams:har.QueryParameter[]=[];
        var headers:har.Header[]=[];
        var formParams:har.PostDataParam[] = []
        var actual=options.options;
        for (var op in actual){
            if (op.indexOf("header_")==0){
                var hv=actual[op];
                var hn=op.substr("header_".length);
                headers.push({name:hn,value:hv});
            }
            else if(op.indexOf('form_')==0){
                var val=actual[op];
                var pName=op.substr("form_".length);
                formParams.push({name:pName,value:val});
            }
            else if (op.indexOf("headers")==0){
                var headersObj = actual[op];
                Object.keys(headersObj).forEach(x=>headers.push({name:x,value:headersObj[x]}))
            }
            queryParams.push({
                name:op,
                value:actual[op]
            });
        }
        var req=new HARRequest(path,method,queryParams,headers);
        if(formParams.length>0){
            req.postData = {
                mimeType: 'application/x-www-form-urlencoded',
                params: formParams
            }
        }
        else if(options['payload']){
            var ramlMethod:RamlWrapper.Method|RamlWrapper1.Method = this.findMethod(path,method);
            var mimeType:string = detectMimeType(ramlMethod,options)
            var bodyString:string = prepareBodyString(options['payload'],mimeType,ramlMethod)
            var postData:har.PostData = {
                mimeType: mimeType,
                text:bodyString
            }
            req.postData = postData
            req.headers.push( { "name": "Content-Type", "value": mimeType} )
        }
        return req;
    }

    private processResponse(req:har.Request,resp:har.Response){

        var status = resp.status;
        if(this.cfg.throwExceptionOnIncorrectStatus&&status>399){
            throw new Error('Invalid status')
        }
        var ramlMethod:RamlWrapper.Method|RamlWrapper1.Method = this.findMethod(req.url,req.method);

        var mimeType:string;
        var xmlSchema:RamlWrapper.SchemaDef|Helper.SchemaDef;
        var canBeJson:boolean=false;
        var canBeXml:boolean=false;
        if(resp.headers) {
            var ctHeaders = resp.headers.filter(x=>x.name.toLowerCase() == 'content-type');
            if(ctHeaders.length>0){
                mimeType = ctHeaders[0].value;
            }
        }
        var statusStr = '' + status;
        var bodies:(RamlWrapper.Body|RamlWrapper1.BodyLike)[] = [];
        if(ramlMethod instanceof RamlWrapper.Method) {
            (<RamlWrapper.Method>ramlMethod).responses().filter(x=>x.code() == statusStr)
                .forEach(x=>bodies = bodies.concat(x.bodies()));
        }
        else{
            (<RamlWrapper1.Method>ramlMethod).responses().filter(x=>x.code() == statusStr)
                .forEach(x=>bodies = bodies.concat(x.body()));
        }
        bodies.forEach(x=>{

            var mt:string
                = x instanceof RamlWrapper.Body
                ? (<RamlWrapper.Body>x).mediaType()
                : (<RamlWrapper1.BodyLike>x).mediaType().value();

            mt = mt.toLowerCase();

            if(mt.indexOf('json')>=0){
                canBeJson = true;
            }
            else if(mt.indexOf('xml')>=0){
                canBeXml = true;

                var schemaOpt:Opt<RamlWrapper.SchemaDef|Helper.SchemaDef>
                    = x instanceof RamlWrapper.Body
                    ? (<RamlWrapper.Body>x).schema()
                    : Helper.schema(<RamlWrapper1.BodyLike>x,Helper.ownerApi(<RamlWrapper1.Method>ramlMethod));

                xmlSchema = schemaOpt.getOrElse(xmlSchema);
            }
        });

        var parsed:any;
        var result:any;
        var text = resp.content.text;
        if(mimeType){
            mimeType = mimeType.toLowerCase();
            if(mimeType.indexOf('json')>=0){
                try {
                    parsed = JSON.parse(text);
                }
                catch (e) {}
            }
            else if(mimeType.indexOf('xml')>=0){
                if(xmlSchema) {
                    var parseOpt:Opt<any> = XML2TS.parseClassInstance(text, xmlSchema.content());
                    if (parseOpt.isDefined()) {
                        parsed = parseOpt.getOrThrow();
                    }
                }
                else{
                    try {
                        parsed = xmlutil(text)
                    }
                    catch (e) {}
                }
            }
        }
        else {
            if(canBeJson) {
                try {
                    parsed = JSON.parse(text)
                }
                catch (e) {}
            }
            if(!parsed){
                if(xmlSchema){
                    var parseOpt:Opt<any> = XML2TS.parseClassInstance(text, xmlSchema.content());
                    if (parseOpt.isDefined()) {
                        parsed = parseOpt.getOrThrow();
                    }
                }
                if(!parsed && canBeXml){
                    try {
                        parsed = xmlutil(text)
                    }
                    catch (e) {}
                }
            }
        }
        result = parsed ? parsed : text;
        if (this.cfg.storeHarEntry) {
            var harEntry = {
                request: req,
                response: resp
            };
            if (!parsed) {
                result = {}
            }
            result[raml2ts.HAR_ENTRY_FIELD_NAME] = harEntry;
        }
        return result;
    }

    log(vName:string,val:any){
        this.actualExecutor.log(vName,val);
        return val;
    }
}