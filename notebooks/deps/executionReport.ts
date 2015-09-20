/// <reference path="./typings/tsd.d.ts" />

/**
 * Created by kor on 10/04/15.
 */

import RamlWrapper=require('./Raml08Wrapper')
import _ = require("underscore")
import sourceMap=require("source-map")
import fs=require("fs")
import path=require("path")
interface SourceMapStorage{
    [path:string]:sourceMap.SourceMapConsumer;
}

export class ReportObject{


    private _coveredMethods:RamlWrapper.Method[]

    private _coveredResources:RamlWrapper.Resource[]

    private _notCoveredMethods:RamlWrapper.Method[]

    private _notCoveredResources:RamlWrapper.Resource[]

    private _failures:FailureInfo[]=[]

    private _execution:RamlScriptExecutionReport;

    private _apis:RamlWrapper.Api[];

    procent:number

    failures():FailureInfo[]{
        return this._failures;
    }

    coveredResources = ():RamlWrapper.Resource[] => this._coveredResources

    notCoveredResources = ():RamlWrapper.Resource[] => this._notCoveredResources

    coveredMethods = ():RamlWrapper.Method[] => this._coveredMethods

    statuses(m:RamlWrapper.Method):number[]{
        var s=this.steps(m);
        return _.unique(s.map(x=>x.response.status))
    }
    apis():RamlWrapper.Api[]{
        return this._apis;
    }

    notCoveredMethods = ():RamlWrapper.Method[] => this._notCoveredMethods

    findSteps(lineNumber:number,path:string):ExecutionRequestStep[]{
        return this._execution.steps.filter(x=>x.lineNumber==lineNumber+1&&x.filePath==path)

    }
    stepsFromIds(ids:string[]):ExecutionRequestStep[]{
        return this._execution.steps.filter(x=>ids.indexOf(x.id)!=-1)

    }

    steps(method:RamlWrapper.Method):ExecutionRequestStep[]{
        return this._execution.steps.filter(x=>x.methodId==method.id().value())
    }
    allSteps():ExecutionRequestStep[]{
        return this._execution.steps
    }

    methodFromStep(step:ExecutionRequestStep):RamlWrapper.Method{
        var result:RamlWrapper.Method=null;
        this.apis().forEach(x=>x.allMethods().forEach(m=>{
            if (m.id().value()==step.methodId){
                result=m;
            }
        }));
        return result;
    }

    stepFailures(step:ExecutionRequestStep):FailureInfo[]{
        return this._failures.filter(x=>x.step.id==step.id)
    }

    methodFailures(method:RamlWrapper.Method):FailureInfo[]{
        return this._failures.filter(x=>x.step.methodId==method.id().value())
    }
    vars():VariableLogStep[]{
        return this._execution.variableLog;
    }

    /**
     * @param profile
     * @param apis
     * @returns {null}
     */
    static build(report:RamlScriptExecutionReport,apis:RamlWrapper.Api[]):ReportObject{
        try {
            ReportObject.remapLines(report);
        }catch (e){

        }
        var map = {}
        report.steps.forEach(x=>{
            var apiTitle = x.apiTitle

            var resourceId = x.resourceId
            var methodId = x.methodId
            console.log(x.methodId)
            var api = map[apiTitle]
            if(!api){
                api = {}
                map[apiTitle] = api
            }
            var resource = api[resourceId]
            if(!resource){
                resource = {}
                api[resourceId] = resource
            }
            resource[methodId] = 1
        })
        var failures:FailureInfo[]=[];
        report.steps.forEach(x=>{
            if (x.messages){
                x.messages.forEach(y=>{
                    if (y.severity!=MessageSeverity.INFO){
                        failures.push({message:y,step:x});
                    }
                })
            }

        })
        var cm:RamlWrapper.Method[] = []
        var cr:RamlWrapper.Resource[] = []
        var ncm:RamlWrapper.Method[] = []
        var ncr:RamlWrapper.Resource[] = []
        var all=0;
        apis.filter(x=>x!=null&&x!=undefined).forEach( api => all+=api.allMethods().length);
        apis.filter(x=>x!=null&&x!=undefined).forEach( api => api.allResources().forEach(res=>{

            var apiInfo = map[api.title().value()]
            if(!apiInfo){
                return
            }
            var resourceInfo = apiInfo[res.id().value()]
            if(!resourceInfo){
                ncr.push(res)
                return
            }
            var allCovered:boolean = true;
            res.methods().forEach( m => {
                var methodInfo = resourceInfo[m.id().value()]
                if(!methodInfo){
                    allCovered = false
                    ncm.push(m)
                }
                else{
                    cm.push(m)
                }
            })
            if(allCovered){
                cr.push(res)
            }
            else{
                ncr.push(res)
            }
        }))
        var reportObject = new ReportObject()
        reportObject._coveredMethods = cm;
        reportObject.procent=reportObject.coveredMethods().length/all;
        reportObject._coveredResources = cr
        reportObject._notCoveredResources = ncr
        reportObject._failures=failures;
        reportObject._execution=report
        reportObject._apis=apis;
        return reportObject
    }

    private static remapLines(report:RamlScriptExecutionReport) {
        var consumers:SourceMapStorage = {}
        report.steps.forEach(x=> {
            var consumer = consumers[x.filePath]
            if (!consumer) {
                var mapPath = x.filePath + ".map";
                var rawMap:sourceMap.RawSourceMap = JSON.parse(fs.readFileSync(mapPath).toString());
                consumer = new sourceMap.SourceMapConsumer(rawMap);
                consumers[x.filePath] = consumer;
            }
            var p:sourceMap.Position = {line: x.lineNumber, column: x.columnNumber};
            var newPos = consumer.originalPositionFor(p);
            if (newPos) {
                x.lineNumber = newPos.line;
                x.columnNumber = newPos.column;
                var actualFile=newPos.source.replace(".l.ts","");
                x.filePath = path.resolve(path.dirname(x.filePath),actualFile);
            }
        });
    }
}
export interface FailureInfo{

    message: ValidationMessage
    step: ExecutionRequestStep

}
export function merge(profiles:RamlScriptExecutionReport[]):RamlScriptExecutionReport{
    return null;
}

export interface RamlScriptExecutionReport{

    date:string
    environment:any
    steps:ExecutionRequestStep[];
    variableLog:VariableLogStep[];
}
export enum MessageSeverity{
    INFO,WARNING,ERROR
}

export interface ValidationMessage{

    code:number
    severity:MessageSeverity

    message:String;

    extras:any[]
}

export interface ExecutionRequestStep{

    id:string
    methodId:string
    resourceId:string
    apiTitle:string
    filePath:string
    lineNumber:number
    columnNumber:number
    request:har.Request;
    response:har.Response

    messages:ValidationMessage[]
}
export interface VariableLogStep{
    varName:string;
    value:any;
    filePath:string
    lineNumber:number
    columnNumber:number
}

export enum MessageCodes{
    OK, VALIDATION_FAILURE, EXCEPTION, OTHER
}
