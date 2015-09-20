/// <reference path="./typings/tsd.d.ts" />
/**
 * Created by Sviridov on 4/10/2015.
 */

import report = require('./executionReport')

export class ExecutionReport implements report.RamlScriptExecutionReport{
    constructor( steps:(report.ExecutionRequestStep|report.VariableLogStep)[],date:string, environment?:any) {

        this.date = date;
        this.environment = environment;
        this.steps = [];
        this.variableLog=[];
        steps.forEach(x=>{
            if (x["varName"]){
                this.variableLog.push(<report.VariableLogStep>x);
            }
            else{
                this.steps.push(<report.ExecutionRequestStep>x);
            }
        })
    }
    date:string
    environment:any
    steps:report.ExecutionRequestStep[];
    variableLog:report.VariableLogStep[];
}

export class Step implements report.ExecutionRequestStep{

    id:string = '' + new Date().getTime()
    methodId:string
    resourceId:string
    apiTitle:string
    filePath:string
    lineNumber:number
    columnNumber:number
    request:har.Request;
    response:har.Response
    messages:report.ValidationMessage[] = []

    appendMessage(message:report.ValidationMessage):void{
        this.messages.push(message)
    }
}



export class Message implements report.ValidationMessage{

    constructor(code:number, severity:report.MessageSeverity, message:String, extras?:any[]) {
        this.code = code;
        this.severity = severity;
        this.message = message;
        this.extras = extras;
    }

    code:number
    severity:report.MessageSeverity
    message:String
    extras:any[]

}
