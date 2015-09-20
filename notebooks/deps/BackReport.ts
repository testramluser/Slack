/// <reference path="./typings/tsd.d.ts" />
import RamlWrapper= require('./Raml08Wrapper')
import config = require('./config');
import HTTPCallOccurence=require('./HTTPCallOccurence')
import esprima = require("esprima");
import estraverse=require("estraverse")
import Matchers = require('./jsAstMatchers');
import ASTBuilder = require('./jsAstBuilder');
import escodegen=require("escodegen")
import fs=require("fs")
import ps=require("path")
var APIENCODEDSTART="APIENCODEDSTART";
var APIENCODEDEND="APIENCODEDEND"
export interface OccurenceInCode{

    method:RamlWrapper.Method;

    lineNumber:number
}
export interface StaticReport{
    apis:ApiMap;
    calls:OccurenceInCode[];
}
export interface ApiMap {
[name:string]:RamlWrapper.Api
}

interface CallPatterns {
    [pattern:string]:RamlWrapper.Method
}

interface ApiCallPatterns{
    [name:string]:CallPatterns;

}
export class BackReport{

        buildReport(path:string,cfg:config.IConfig=this.extractConfig(path)):StaticReport {

            var content:string=fs.readFileSync(path).toString();
            var dir=ps.dirname(path);
            var initialMap:ApiMap={};
            var pMap:ApiMap={};

            content.split("\n").forEach(l=>
            {
               var Iindex=l.indexOf("import");
               if (Iindex!=-1){
                   l=l.substr(Iindex+"import ".length).trim();
                   var mn=l.substr(0,l.indexOf("=")).trim();
                   var vl=l.substr(l.indexOf('"')+1);
                   vl=vl.substr(0,vl.lastIndexOf('"'))
                   var modulePath=ps.resolve(dir,vl+".ts");
                   if (fs.existsSync(modulePath)){
                       try {
                           var content = fs.readFileSync(modulePath).toString();
                           var start = content.indexOf(APIENCODEDSTART);
                           var end = content.indexOf(APIENCODEDEND);
                           if (start != -1) {
                               var apiDef = content.substring(start+APIENCODEDSTART.length+2, end-3);
                               var api:RamlWrapper.Api=RamlWrapper.wrap(JSON.parse(apiDef).data);
                               initialMap[mn]=api;
                           }
                       }catch (e){
                           console.log(e)
                       }

                   }
                   //console.log(mn+":"+vl)
               }
                var Iindex=l.indexOf("createApi");
                if (Iindex!=-1){
                    var mn=l.substr(0,l.indexOf("=")).trim();
                    mn=mn.substr(l.indexOf("var ")+4).trim();

                    var vl=l.substring(l.indexOf("=")+1,l.indexOf('.')).trim();
                    pMap[mn]=initialMap[vl];
                    if (!initialMap[vl]){
                        console.log("Error: not able to load api:"+mn+":"+vl);
                    }
                }
            });
            return {apis:pMap, calls:this.buildOccurenceReport(content,pMap,cfg)};
        }

        buildOccurenceReport(content:string,apis:ApiMap,cfg:config.IConfig):OccurenceInCode[]{
        var result:OccurenceInCode[]=[]
        var api_cp:ApiCallPatterns=this.buildPatterns(apis, cfg);
        var lines=this.cleanContent(content);

        //console.log(content)
        for (var num=0;num<lines.length;num++){
            var line=lines[num];
            if (line.trim().length==0){
                continue;
            }
            for (var apiN in apis){
                var tl=line;
                var callMap=api_cp[apiN]

                while (tl.length>0) {
                    var pos = tl.indexOf(apiN + ".");
                    if (pos != -1) {
                        tl=tl.substring(pos+(apiN + ".").length);
                        for (var pt in callMap){

                            if (("client."+tl).indexOf(pt)==0){
                                result.push({method:callMap[pt],lineNumber:(num+1)})

                                tl=tl.substr(pt.length)
                            }
                        }
                        tl=tl.substr(1)
                    }
                    else{
                        break;
                    }
                }
            }
            //need to be a bit smart here
            //inserting dirty hack for now TODO rewrite it problem is that js parse may not work on typescript code
            //and I have no time to investigate typescript ast right not
            //for (var a=0;a<line.)

        }

        return result;
        //console.log(api_cp);
    }

    private extractConfig(notebookPath:string):config.IConfig{
        try {
            var dir = ps.dirname(notebookPath)
            var content:string = fs.readFileSync(notebookPath).toString();
            var str:string = content.replace(new RegExp('\s', 'g'), '')
            var ind1 = str.indexOf('require("./api')
            var ind1 = str.indexOf('"', ind1) + 1
            var ind2 = str.indexOf('"', ind1 + 1)
            var clientFileName = str.substring(ind1, ind2) + '.ts'
            var clientPath = ps.resolve(dir, clientFileName)
            var clientContent = fs.readFileSync(clientPath).toString()
            var ind3 = clientContent.indexOf('CONFIGENCODEDSTART')
            ind3 = clientContent.indexOf('{', ind3)
            var ind4 = clientContent.indexOf('CONFIGENCODEDEND', ind3)
            ind4 = clientContent.lastIndexOf('}', ind4) + 1
            var configContent = clientContent.substring(ind3, ind4)
            var config:config.IConfig = JSON.parse(configContent)
            return config
        }catch (e){
            return null;
        }
    }

    private cleanContent(s:string):string[]{
        var cleaned:string[]=[];
        var inComma=false;
        var cl=""
        try {
            for (var i = 0; i < s.length; i++) {
                var c = s.charAt(i);
                if (c == '(') {
                    inComma = true
                }
                else if (c == ')') {
                    inComma = false
                }
                else {
                    if (c == '\n') {
                        cleaned.push(cl);
                        cl = "";
                    }
                    if (!inComma) {
                        cl = cl + c;
                    }
                }
            }
        }catch (e){
            console.log(e)
        }
        cleaned.push(cl)

        //console.log(cleaned)
        return cleaned;
    }

    private buildPatterns(apis, cfg):ApiCallPatterns{
        var api_cp:ApiCallPatterns = {};
        for (var apiName in apis) {
            var api = apis[apiName];
            if (api) {
                var allMethods = api.allMethods()
                var cpatterns:CallPatterns = {}
                api_cp[apiName] = cpatterns;
                allMethods.forEach(m=> {
                    try {
                        var pattern = HTTPCallOccurence.HTTPCallOccurence.getPattern(apiName, m, cfg);
                        cpatterns[pattern] = m;
                    } catch (e) {
                        console.log(e.stack)
                    }
                });
            }
        }
        return api_cp;
    }
}