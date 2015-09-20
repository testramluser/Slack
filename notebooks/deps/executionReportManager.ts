/// <reference path="./typings/tsd.d.ts" />
/**
 * Created by Sviridov on 4/10/2015.
 */
import RamlWrapper= require('./Raml08Wrapper')
import report = require('./executionReport')
import reportImpl = require('./executionReportImpl')
import backReport = require('./BackReport')
import util = require('./index')
import path = require('path')
import fs = require('fs')

var LOG_DEFAULT_FILENAME:string = 'executionLog.json'

var LOG_PATH_ARGNAME = '-logDir'

var RESET_LOG_ARGNAME = '-resetLog'

/**
 * Singleton class responsible for operations with execution reports
 */
export class ReportManager{

    constructor(){

        var args:string[] = process.argv
        for(var i = 0 ; i < args.length ; i++){
            if(args[i]==LOG_PATH_ARGNAME && i < args.length-1){
                this.logPath = args[i+1]
            }
            else if(args[i]==RESET_LOG_ARGNAME){
                this.reset = true
            }
        }
        if(!this.logPath) {
            this.logPath = path.resolve(process.cwd(), LOG_DEFAULT_FILENAME)
        }
    }

    private logPath:string

    private blocked:boolean = false

    private hasBeenUsed:boolean = false

    private startedWriting:boolean = false

    private reset:boolean = false

    setLogPath(logPath:string){
        this.logPath = fs.lstatSync(logPath).isDirectory() ? path.resolve(logPath, LOG_DEFAULT_FILENAME) : logPath;
        this.startedWriting = false;

    }

    serializeStep(step:report.ExecutionRequestStep|report.VariableLogStep):void{

        this.hasBeenUsed = true

        while(this.blocked){}

        this.blocked = true;

        try {
            var buf:string = ',\n' + JSON.stringify(step)

            if (!this.startedWriting) {
                var exists:boolean = fs.existsSync(this.logPath)
                if(!exists||this.reset){
                    fs.writeFileSync(this.logPath, '['+buf.substring(1), 'utf8')
                }
                else{
                    var content = fs.readFileSync(this.logPath).toString().trim()
                    if(util.stringEndsWith(content,']')){
                        fs.writeFileSync(this.logPath, content.substring(0,content.length-1)+buf)
                    }
                }
                this.startedWriting = true;
            }
            else {
                fs.appendFileSync(this.logPath, buf, 'utf8')
            }
        }
        catch(err){
            console.log(err)
        }
        finally{
            this.blocked = false
        }
    }

    finalize():void{
        if(!this.hasBeenUsed) {
            return
        }
        try {
            fs.appendFileSync(this.logPath, '\n]', 'utf8')
        }
        catch(err){
            console.log(err)
        }
    }

    readReport(filePath:string):(reportImpl.Step|report.VariableLogStep)[]{
        var str:string = fs.readFileSync(filePath).toString().trim();
        if(str.indexOf(']',str.length-1)<0) {
            str += ']'
        }
        var arr:reportImpl.Step[] = JSON.parse(str)
        return arr
    }

    getReportObject(logPath:string, notebookPath:string):report.ReportObject{

        var staticReport:backReport.StaticReport = new backReport.BackReport().buildReport(notebookPath)
        var apis:RamlWrapper.Api[] = []
        for(var key in staticReport.apis){
            var api = staticReport.apis[key]
            apis.push(api)
        }
        return this.getReportObjectForApis(logPath, apis);
    }

    getLatestReportFor(pth:string):report.ReportObject{
        var actualReportPath = path.dirname(pth) + "/executionLog.json";
        if (!fs.existsSync(pth)||!fs.existsSync(actualReportPath)){
            return null;
        }
        var report=this.getReportObject(actualReportPath,pth);
        return report;
    }

    getReportObjectForApis(logPath:string, apis:RamlWrapper.Api[]):report.ReportObject {
        var steps:(reportImpl.Step|report.VariableLogStep)[] = this.readReport(logPath);
        var executionReport:reportImpl.ExecutionReport = new reportImpl.ExecutionReport(steps, new Date().toDateString())
        var reportObject:report.ReportObject = report.ReportObject.build(executionReport, apis)
        return reportObject
    }

    logPathArgName = ():string => LOG_PATH_ARGNAME

    resetLogArgName = ():string => RESET_LOG_ARGNAME

    logDefaultFileNmae = ():string => LOG_DEFAULT_FILENAME
}