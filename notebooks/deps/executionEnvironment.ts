/// <reference path="./typings/tsd.d.ts" />
import reportManager = require('./executionReportManager')
import authManager = require('./authenticationManager')
import RamlWrapper = require('./Raml08Wrapper')
import RamlWrapper1 = require('./raml003parser')
import fs = require('fs')
import path = require('path')
import endpoints = require('./endpoints');
var XMLHttpRequestConstructor = require("xmlhttprequest").XMLHttpRequest;
function buildXHR( ){
    var x: XMLHttpRequest = new XMLHttpRequestConstructor;
    return x
}


var CONFIG_FILENAME:string = "config.cfg"

var AUTH_CONFIG_FILENAME:string = "auth.cfg"

var GENERATION_CONFIG_FILENAME:string = "generation.cfg"

class SPProvider implements authManager.SecurityParametersProvider{
    constructor(private authStorage:JSONStorage,private prefix:string){}


    getValue(name:string,loc?:RamlWrapper.ParamLocation) {
        return this.authStorage.readValue(this.prefix+name)
    }
    writeValue(name:string,value:string,loc?:RamlWrapper.ParamLocation)  {
        this.authStorage.writeValue(this.prefix+name,value)
    }

    getSubProvider(name:string){
        return new SPProvider(this.authStorage,this.prefix+name);
    }

}

class ExecutionEnvironment{

    private reportManager:reportManager.ReportManager = new reportManager.ReportManager()

    private cfgPrompt:Prompt = new Prompt(this.configPath())

    private authStorage = new JSONStorage(this.authConfigPath())

    private apis:{[key:string]:RamlWrapper.Api|RamlWrapper1.Api} = {}


    constructor(private _dirname:string){

    }

    setPath(s:string){
        this._dirname = s;
        this.authStorage=new JSONStorage(this.authConfigPath());
        this.securityParamsProvider=new SPProvider(this.authStorage,"");
        this.authManager= new authManager.AuthManager(this.securityParamsProvider)
    }

    private securityParamsProvider:authManager.SecurityParametersProvider =new SPProvider(this.authStorage,"")

    private authManager:authManager.AuthManager = new authManager.AuthManager(this.securityParamsProvider)

    configPath():string{
        return path.resolve(this._dirname,CONFIG_FILENAME)
    }

    authConfigPath():string{
        return path.resolve(this._dirname,AUTH_CONFIG_FILENAME)
    }

    configFileName():string{
        return CONFIG_FILENAME
    }

    authConfigFileName():string{
        return AUTH_CONFIG_FILENAME
    }

    generationConfigFileName():string{
        return GENERATION_CONFIG_FILENAME
    }

    execCfgPrompt(name:string):string{
        return this.cfgPrompt.prompt(name)
    }

    public getReportManager():reportManager.ReportManager {
        return this.reportManager;
    }

    public getAuthManager():authManager.AuthManager {
        return this.authManager;
    }

    registerApi(api:RamlWrapper.Api|RamlWrapper1.Api):void{
        var key:string = this.apiKey(api)
        if(this.apis[key]) {
            return
        }
        this.apis[key] = api
        this.authManager.registerApi(api)
    }


    public apiKey(api:RamlWrapper.Api|RamlWrapper1.Api):string{
        if(api instanceof RamlWrapper.Api) {
            var api08 = <RamlWrapper.Api>api
            return api08.title().getOrElse("title") + ' ' + api08.version().getOrElse("version")
        }
        else{
            var api10 = <RamlWrapper1.Api>api
            return api10.title() + ' ' + api10.version();
        }
    }

    finalize():void{
        this.reportManager.finalize()
    }
}

class Prompt{
    constructor(configFilePath:string) {
        this.configFilePath = configFilePath;
    }

    configFilePath:string

    private findValue(name:string,content:string){
        var pos=content.indexOf(name);
        if (pos==-1){
            throw new Error("Configuration value "+name+" not found")
        }
        content=content.substr(pos+name.length);
        var p1=content.indexOf("=");
        content=content.substr(p1+1);
        var p2=content.indexOf("\n");
        if (p2!=-1) {
            content = content.substr(0, p2);
        }
        return content.trim();
    }

    prompt(message:string){
        if (fs.existsSync(this.configFilePath)) {
            var content = fs.readFileSync(this.configFilePath).toString();
            return this.findValue(message, content);
        }
        else{
            var xhr = buildXHR();
            var url="http://localhost:4343/"+message;
            xhr.open("GET", url, false);
            xhr.send();
            return xhr.responseText;
        }
    }
}

class JSONStorage{
    constructor(filePath:string) {
        this.filePath = filePath;
    }

    filePath:string

    obj:any

    readValue(name:string):string{

        if(this.obj){
            return this.obj[name]
        }
        if(!fs.existsSync(this.filePath)){
            return undefined
        }
        var rawContent:string = fs.readFileSync(this.filePath).toString()
        this.obj = JSON.parse(rawContent)
        return this.obj[name];
    }

    writeValue(name:string,value:string){

        if(!this.obj){
            this.obj = {}
        }
        this.obj[name] = value
        console.log("Writing:"+this.filePath)
        fs.writeFileSync(this.filePath,JSON.stringify(this.obj,null,2))
    }
}

var instance = new ExecutionEnvironment(__dirname);

export = instance

process.on('exit', function () {
    instance.finalize()
})