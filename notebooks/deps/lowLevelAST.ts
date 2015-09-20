/// <reference path="./typings/tsd.d.ts" />

/**
 * Created by kor on 05/05/15.
 */
import Error=require('./exception')
import yaml=require('./yamlAST')
import highlevel=require('./highLevelAST')
import hi=require('./highLevelImpl')

export interface ICompilationUnit{

    contents():string

    path():string
    absolutePath():string

    isTopLevel():boolean

    ast():ILowLevelASTNode;

    isDirty():boolean;

    isRAMLUnit():boolean

    project():IProject;

    updateContent(newContent:string);//unsafe remove later

    ramlVersion():string
}

export interface IProject{
    units():ICompilationUnit[];//returns units with apis in this folder

    execute(cmd:CompositeCommand)

    executeTextChange(textCommand:TextChangeCommand);//this may result in broken nodes?

    addListener(listener:IASTListener);

    removeListener(listener:IASTListener)

    addTextChangeListener(listener:ITextChangeCommandListener);
    removeTextChangeListener(listener:ITextChangeCommandListener);
}
export interface IASTListener{
    (delta:ASTDelta)
}

export interface ITextChangeCommandListener{
    (delta:TextChangeCommand)
}
export class ASTDelta{
    commands:ASTChangeCommand[]
}
export interface ASTVisitor{
    (node:ILowLevelASTNode):boolean
}

export interface ILowLevelASTNode{

    start():number
    end():number

    value():any

    includeErrors():string[]

    includePath():string

    key():string

    children():ILowLevelASTNode[];
    parent():ILowLevelASTNode;

    unit():ICompilationUnit

    anchorId():string

    errors():Error[]

    anchoredFrom():ILowLevelASTNode;//back link in anchorId
    includedFrom():ILowLevelASTNode;//back link in includepath
    visit(v:ASTVisitor)

    addChild(n:ILowLevelASTNode)

    execute(cmd:CompositeCommand)

    dump():string

    keyStart():number;
    keyEnd():number;

    valueStart():number;
    valueEnd():number;

    isValueLocal():boolean;

    kind(): yaml.Kind;
    show(msg: string);

    highLevelParseResult():highlevel.IParseResult

    setHighLevelParseResult(highLevel:highlevel.IParseResult)

    highLevelNode():highlevel.IHighLevelNode

    setHighLevelNode(highLevelParseResult:highlevel.IHighLevelNode)

    text(unitText: string): string;

    copy(): ILowLevelASTNode

}

export enum CommandKind{
    ADD_CHILD,
    REMOVE_CHILD,
    MOVE_CHILD,
    CHANGE_KEY,
    CHANGE_VALUE
}
export class TextChangeCommand{
    offset:number;

    constructor(offset:number, replacementLength:number, text:string, unit:ICompilationUnit, target: ILowLevelASTNode = null) {
        this.offset = offset;
        this.replacementLength = replacementLength;
        this.text = text;
        this.unit = unit;
        this.target = target;
    }

    replacementLength:number;
    text:string;
    unit:ICompilationUnit;
    target: ILowLevelASTNode;
}

export class CompositeCommand{
    source:any;
    timestamp:number;
    commands:ASTChangeCommand[]=[]
}

export class ASTChangeCommand{
    constructor(kind:CommandKind, target:ILowLevelASTNode, value:string|ILowLevelASTNode, position:number) {
        this.kind = kind;
        this.target = target;
        this.value = value;
        this.position = position;
    }
    toSeq:boolean=false;
    insertionPoint:ILowLevelASTNode;
    kind:CommandKind;
    target:ILowLevelASTNode;
    value: string|ILowLevelASTNode;
    position:number;//only relevant for children modification
}
export function setAttr(t:ILowLevelASTNode,value:string):ASTChangeCommand{
    return new ASTChangeCommand(CommandKind.CHANGE_VALUE,t,value,-1)
}
export function setAttrStructured(t:ILowLevelASTNode,value:hi.StructuredValue):ASTChangeCommand{
    return new ASTChangeCommand(CommandKind.CHANGE_VALUE,t,value.lowLevel(),-1)
}
export function setKey(t:ILowLevelASTNode,value:string):ASTChangeCommand{
    return new ASTChangeCommand(CommandKind.CHANGE_KEY,t,value,-1)
}
export function removeNode(t:ILowLevelASTNode,child:ILowLevelASTNode):ASTChangeCommand{
    return new ASTChangeCommand(CommandKind.REMOVE_CHILD,t,child,-1)
}


export function insertNode(t:ILowLevelASTNode,child:ILowLevelASTNode,insertAfter:ILowLevelASTNode=null,toSeq:boolean=false):ASTChangeCommand{
    var s= new ASTChangeCommand(CommandKind.ADD_CHILD,t,child,-1);
    s.insertionPoint=insertAfter;
    s.toSeq=toSeq;
    return s;
}

export interface ILowLevelEnvironment{
    createProject(path:string):IProject
}
