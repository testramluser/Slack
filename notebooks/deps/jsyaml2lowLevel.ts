/// <reference path="./typings/tsd.d.ts" />
import yaml=require('./yamlAST')
import lowlevel=require('./lowLevelAST')
import highlevel=require('./highLevelAST')
import path=require("path")
import fs=require("fs")
import parser=require('./js-yaml')
import dumper=require('./dumper')
import Error=require('./exception')
import _=require("underscore")
import textutil = require('./textutil')
import hli=require('./highLevelImpl');

export class MarkupIndentingBuffer {

    text: string = '';
    indent: string;

    constructor(indent: string) {
        this.indent = indent;
    }

    isLastNL() {
        return this.text.length > 0 && this.text[this.text.length-1] == '\n';
    }

    addWithIndent(lev: number, s: string) {
        if(this.isLastNL()) {
            this.text += textutil.indent(lev);
            this.text += this.indent;
        }
        this.text += s;
    }

    addChar(ch: string) {
        if(this.isLastNL()) {
            this.text += this.indent;
        }
        this.text += ch;
    }

    append(s: string) {
        for(var i=0; i<s.length; i++) {
            this.addChar(s[i]);
        }
    }

}

export class CompilationUnit implements lowlevel.ICompilationUnit{

    constructor(private _path,private _content,private _tl,private _project:Project, private _apath:string){

    }
    isDirty(){
        return false;
    }

    absolutePath(){
        return this._apath
    }

    isRAMLUnit():boolean{
        var en=path.extname(this._path);
        return en=='.raml'||en=='.yaml'
    }

    contents():string {
        return this._content;
    }

    resolve(p:string):CompilationUnit{
        var unit=this._project.resolve(this._path,p);
        return unit
    }

    path():string {
        return this._path;
    }
    private errors:Error[]=[];

    lexerErrors(){
        return this.errors;
    }

    ast():ASTNode{
        if(this._node){
            return this._node;
        }
        try {
            var result = <yaml.YAMLNode><any>parser.load(this._content, {});
            this.errors=result.errors;
            this._node = new ASTNode(result, this, null, null, null);
            this._node._errors=this.errors;
            return this._node;
        }catch (e){
            console.log(this._content)
            console.log(e)
            this._node=null;
            return this._node
        }
    }

    private _node:ASTNode;

    isTopLevel():boolean {
        return this._tl;
    }
    updateContent(n:string){
        this._content=n;
        this._node=null;//todo incremental update


    }
    updateContentSafe(n:string){
        this._content=n;
    }


    project():Project{
        return this._project;
    }

    ramlVersion():string{

        var ind = this._content.indexOf('#%RAML');
        if(ind<0){
            return 'unknown';
        }
        ind += '#%RAML'.length;
        var ind1 = this._content.indexOf('\n',ind);
        if(ind1<0){
            ind1 = this._content.length;
        }
        var ramlVersion = this._content.substring(ind,ind1).trim();
        return ramlVersion;
    }

}
export interface IncludeResolver{
    content(path:string):string
    list(path:string):string[]
}

export class FSResolver implements IncludeResolver{


    content(path:string):string{
        if (!fs.existsSync(path)){
            return null;
        }
        try {
            return fs.readFileSync(path).toString();
        } catch (e){
            return null;
        }
    }
    list(path:string):string[]{
        return fs.readdirSync(path);
    }
}
function copyNode(n:yaml.YAMLNode):yaml.YAMLNode{
    if (n==null){
        return null;
    }
    switch (n.kind){
        case yaml.Kind.SCALAR:
            return  {
                errors:[],
                startPosition:n.startPosition,
                endPosition:n.endPosition,
                value:(<yaml.YAMLScalar>n).value,
                kind:yaml.Kind.SCALAR,
                parent:n.parent
            }
        case yaml.Kind.MAPPING:
            var map=(<yaml.YAMLMapping>n)
            return {
                errors:[],
                key: copyNode(map.key),
                value: copyNode(map.value),
                startPosition:map.startPosition,
                endPosition:map.endPosition,
                kind:yaml.Kind.MAPPING,
                parent:map.parent
            }

        case yaml.Kind.MAP:
            var ymap=(<yaml.YamlMap>n)
            return {
                errors:[],
                startPosition:n.startPosition,
                endPosition:n.endPosition,
                mappings:ymap.mappings.map(x=>copyNode(x)),
                kind:yaml.Kind.MAP,
                parent:ymap.parent
            }
    }
    return n;
}


var innerShift = function (offset:number, yaNode:yaml.YAMLNode, shift:number) {
    if(!yaNode) return;
    if (yaNode.startPosition >= offset) {
        yaNode.startPosition += shift;
    }
    if (yaNode.endPosition > offset) {
        yaNode.endPosition += shift;
    }
    //this kind is a separate case
    if (yaNode.kind == yaml.Kind.MAPPING) {
        var m = <yaml.YAMLMapping>yaNode;
        innerShift(offset,m.key,shift);
        innerShift(offset,m.value,shift);
    }
};

function splitOnLines(text:string):string[]{
    var lines = text.match(/^.*((\r\n|\n|\r)|$)/gm);
    return lines;
}
//TODO IMPROVE INDENTS
function stripIndent(text:string,indent:string){
    var lines = splitOnLines(text);
    var rs=[];
    for (var i=0;i<lines.length;i++){
        if (i==0){
            rs.push(lines[0]);
        }
        else{
            rs.push(lines[i].substring(indent.length));
        }
    }
    return rs.join("");
}


var leadingIndent = function (node:lowlevel.ILowLevelASTNode, text:string) {
    var leading = "";
    var pos = node.start() - 1;
    while (pos > 0) {
        var ch = text[pos];
        if (ch == '\r' || ch == '\n') break;
        leading = ch + leading;
        pos--;
    }
    return leading;
};
function indent(line:string){
    var rs="";
    for (var i=0;i<line.length;i++){
        var c=line[i];
        if (c=='\r'||c=='\n'){
            continue;
        }
        if (c==' '||c=='\t'){
            rs+=c;
            continue;
        }
        break;
    }
    return rs;
}
function indentLines(s:string,indent:string){
    return s.split("\n").map(x=>{
            if (x.trim().length==0){
                return x;
            }
            return  indent+x}
    ).join("\n")
}
function extraIndent(text:string,indent:string):string{
    var lines = splitOnLines(text);
    var rs=[];
    for (var i=0;i<lines.length;i++){
        if (i==0){
            rs.push(lines[0]);
        }
        else{
            if (lines[i].trim().length>0) {
                rs.push(indent+lines[i] );
            }
            else{
                rs.push("")
            }
        }
    }
    return rs.join("");
}

export class Project implements lowlevel.IProject{

    private listeners:lowlevel.IASTListener[]=[]
    private tlisteners:lowlevel.ITextChangeCommandListener[]=[]

    constructor(private rootPath:string,private resolver:IncludeResolver=new FSResolver()){

    }

    resolve(unitPath:string,pathInUnit:string):CompilationUnit{

        if (unitPath.charAt(0)=='/'){
            unitPath=unitPath.substr(1);//TODO REVIEW IT
        }
        if (pathInUnit.charAt(0)!='.'){
            return this.unit(pathInUnit);
        }
        var absPath=path.resolve(path.dirname(path.resolve(this.rootPath,unitPath)),pathInUnit);

        return this.unit(absPath,true);
    }

    private pathToUnit:{[path:string]:CompilationUnit}={}

    units():lowlevel.ICompilationUnit[] {
        var names=this.resolver.list(this.rootPath).filter(x=>path.extname(x)=='.raml');
        return names.map(x=>this.unit(x)).filter(y=>y.isTopLevel())
    }
    unit(p:string,absolute:boolean=false):CompilationUnit{
        if (this.pathToUnit[p]){
            return this.pathToUnit[p];
        }
        if (p.charAt(0)=='/'&&!absolute){
            p=p.substr(1);//TODO REVIEW IT
        }
        var apath=absolute?p:path.resolve(this.rootPath,p);
        var cnt=this.resolver.content(apath);
        var cnt=this.resolver.content(path.resolve(this.rootPath,p));
        if (cnt==null){
            return null;
        }
        var tl=(cnt.indexOf("#%RAML")==0);
        var unit=new CompilationUnit(p,cnt,tl,this,apath);
        this.pathToUnit[p]=unit;
        return unit;
    }

    visualizeNewlines(s: string): string {
        var res: string = '';
        for(var i=0; i<s.length; i++) {
            var ch = s[i];
            if(ch == '\r') ch = '\\r';
            if(ch == '\n') ch = '\\n';
            res += ch;
        }
        return res;
    }

    indent(node:ASTNode):string {
        var text = node.unit().contents();
        //console.log('Node text:\n' + this.visualizeNewlines(text.substring(node.start(), node.end())));
        if(node == node.root()) return '';
        var leading = leadingIndent(node, text);
        var dmp=splitOnLines(node.dump());
        if (dmp.length>1){
            if(dmp[1].trim().length > 0) {
                //console.log('DMP0: [' + dmp[0] + ']');
                //console.log('DMP1: [' + dmp[1] + ']');
                var extra = indent(dmp[1]);
                return leading + extra;
            }
        }
        //console.log('LEADING: [' + this.visualizeNewlines(leading) + '] ');
        return leading + '  ';
    }

    startIndent(node: ASTNode):string {
        var text = node.unit().contents();
        //console.log('Node text:\n' + this.visualizeNewlines(text.substring(node.start(), node.end())));
        if(node == node.root()) return '';
        var dmp = splitOnLines(node.dump());
        if (dmp.length>0){
            console.log('FIRST: ' + dmp[0]);
            var extra = indent(dmp[0]);
            return extra + '  ';
        }
        //console.log('LEADING: [' + this.visualizeNewlines(leading) + '] ');
        return '';
    }


    private canWriteInOneLine(node:ASTNode):boolean{
        return false;
    }

    private isOneLine(node:ASTNode):boolean{
        return node.text().indexOf('\n')<0;
    }

    private recalcPositionsUp(target: ASTNode) {
        var np = target;
        while(np) {
            np.recalcEndPositionFromChilds();
            np = np.parent();
        }

    }


    private add2(target: ASTNode, node: ASTNode, toSeq: boolean, point: ASTNode, json: boolean = false) {
        var unit:lowlevel.ICompilationUnit = target.unit();

        var range = new textutil.TextRange(unit.contents(), node.start(), node.end());
        var targetRange = new textutil.TextRange(unit.contents(), target.start(), target.end());

        var unitText = target.unit().contents();

        var originalIndent = this.indent(target);
        var xindent = originalIndent;
        var indentLength = originalIndent.length;
        //toSeq = false;
        //console.log('indent: ' + originalIndent.length);
        if (toSeq) {
            xindent = xindent + "  ";
            indentLength += 2;
        }
        var buf = new MarkupIndentingBuffer(xindent);
        //target.show('TARGET:');
        //node.show('NODE1');
        node.markupNode(buf, node._actualNode(), 0, json);
        var text = buf.text;

        //target.show('TARGET2');
        //node.show('NODE2', 0, text);
        //console.log('TEXT TO ADD:\n' + text);
        //console.log('TEXT TO ADD:\n' + this.visualizeNewlines(text));

        //console.log('indent: ' + indentLength);
        if (toSeq) {
            text = originalIndent + '- ' + text;
        } else {
            text = originalIndent + text;
        }

        //point.show("POINT");
        var pos = target.end();
        if (point){
            if (point!=target){
                pos = point.end();
            } else {
                pos = target.keyEnd()+1;
                pos = new textutil.TextRange(unitText,pos,pos).extendAnyUntilNewLines().endpos();
            }
        }

        var insertionRange = new textutil.TextRange(unitText, 0, pos);
        pos = insertionRange.extendToNewlines().endpos();

        if (pos>0 && unitText[pos-1] != '\n') {
            text = "\n" + text;
            indentLength++;
        }


        //console.log('\nOLD TEXT:\n' + unitText);
        //console.log('FINAL TEXT TO ADD: [' + this.visualizeNewlines(text) + '] at position ' + pos);
        //console.log('FINAL TEXT TO ADD at position ' + pos + '\n' + text);
        var newtext = unitText.substring(0,pos) + text + unitText.substring(pos, unitText.length);
        //console.log('\nNEW TEXT:\n' + newtext);
        var cu: CompilationUnit = <CompilationUnit>unit;
        cu.updateContentSafe(newtext);

        (<ASTNode>target.root()).shiftNodes(pos, node.end()-node.start()+indentLength);

        //target.show('TARGET2');

        if(point) {
            var childs = target.children();
            var index = -1;
            for(var i=0; i<childs.length; i++) {
                var x = childs[i];
                if(x.start() == point.start() && x.end() == point.end()) {
                    index = i; break;
                }
            }
            //console.log('index: ' + index);
            if(index >=0) {
                target.addChild(node, index+1);
            } else {
                target.addChild(node);
            }
        } else {
            target.addChild(node);
        }

        node.shiftNodes(0, pos + indentLength);
        //target.show('UPDATED');

        this.recalcPositionsUp(target);

        node.setUnit(<CompilationUnit>target.unit());
        node.visit(
            (n:lowlevel.ILowLevelASTNode):boolean => {
                var node = <ASTNode>n;
                //console.log('visit: ' + node.kindName());
                node.setUnit(<CompilationUnit>target.unit());
                return true;
            }
        );

    }


    findInsertionPoint(){

    }

    private isYamlMap(node: ASTNode) {
        if(!node.isMap()) return false;
        var text = node.text().trim();
        return text.length>=2 && text[0] == '{' && text[text.length-1] == '}';
    }

    private remove(unit: lowlevel.ICompilationUnit, target: ASTNode, node: ASTNode) {
        //var startpos = node.start();
        //var endpos = node.end();
        //var text = unit.contents();
        var parent = node.parent();
        node._oldText=node.dump();

        //node.showParents('PARENTS:');

        var range = new textutil.TextRange(unit.contents(), node.start(), node.end());
        var targetRange = new textutil.TextRange(unit.contents(), target.start(), target.end());
        var parentRange = new textutil.TextRange(unit.contents(), parent.start(), parent.end());
        //console.log('NODE  : ' + yaml.Kind[node.kind()] + '\t' + range.startpos() + '..' + range.endpos() + ': ' + this.visualizeNewlines(range.text()));
        //console.log('PARENT: ' + yaml.Kind[parent.kind()] + '\t' + parentRange.startpos() + '..' + parentRange.endpos()  + ': ' + this.visualizeNewlines(parentRange.text()));
        //console.log('TARGET: ' + yaml.Kind[target.kind()] + '\t' + targetRange.startpos() + '..' + targetRange.endpos() + ': ' + this.visualizeNewlines(targetRange.text()));

        //(<ASTNode>node.root()).show('API:');
        //console.log('');
        //node.showParents('PARENTS:');
        //console.log('');
        //target.show('TARGET:');
        //node.show('REMOVE:');
        //console.log('');

        //console.log('INITIAL SELECTION:\n' + range.text() + '\n]]]]]]]');


        //console.log('NODE KIND: ' + yaml.Kind[node.kind()]);
        //console.log('  text: \n' + unitText.substring(startpos,endpos));

        if (this.isOneLine(node) && node.kind()==yaml.Kind.MAPPING && node.parent().kind()==yaml.Kind.MAP) {
            var mapnode = node.parent();
            if(mapnode.asMap().mappings.length==1) {
                //console.log('REMOVE MAP INSTEAD!');
                this.remove(unit, mapnode.parent(), mapnode);
                return;
            }
        }
        if (target.kind()==yaml.Kind.MAPPING) {
            var mapping =  (<yaml.YAMLMapping>target._actualNode());
            var map =  (<yaml.YamlMap>mapping.value);
            var size =  map.mappings.length;
            //console.log('MAP SIZE: ' + size);
            if(false && size == 1 && parent.parent()) {
                // last mapping in map, remove map instead
                //console.log('Remove mapping from parent map instead')
                var parentMapNode = target.parentOfKind(yaml.Kind.MAP);
                if(map) {
                    //console.log('new target: ' + parentMapNode.parent());
                    //console.log('new node: ' + target);
                    this.remove(unit, parentMapNode, target);
                }
                return;
            }
        }

        var originalStartPos=range.startpos();

        if(target.kind() == yaml.Kind.SEQ) {
            // extend range to start of line
            //console.log('RANGE SEQ 0:\n-----------\n' + range.text() + '\n-------------');
            range = range.extendToStartOfLine().extendAnyUntilNewLines().extendToNewlines();
            //console.log('RANGE SEQ 1:\n-----------\n' + range.text() + '\n-------------');
        }

        if(target.kind() == yaml.Kind.MAP) {
            // extend range to end of line
            //console.log('RANGE MAP 0: ' +  this.visualizeNewlines(range.text()));
            range = range.extendAnyUntilNewLines();
            range = range.extendToNewlines();
            //console.log('RANGE MAP 2: ' +  this.visualizeNewlines(range.text()));
            range = range.extendToStartOfLine().extendUntilNewlinesBack();
            //console.log('RANGE MAP 3: ' +  this.visualizeNewlines(range.text()));
        }

        if(target.kind() == yaml.Kind.MAPPING) {
            //console.log('NODE TEXT: ' + node.text());
            if(this.isYamlMap(node) && this.isOneLine(node)) {
                // no need to trim trailing new lines
            } else {
                // extend range to end of line
                //console.log('RANGE MAP 0: ' +  this.visualizeNewlines(range.text()));
                range = range.extendSpacesUntilNewLines();
                range = range.extendToNewlines();
                //console.log('RANGE MAP 2: ' +  this.visualizeNewlines(range.text()));
                range = range.extendToStartOfLine().extendUntilNewlinesBack();
                //console.log('RANGE MAP 3: ' +  this.visualizeNewlines(range.text()));
            }
        }

        //console.log('NODE:\n-----------\n' + range.unitText() + '\n-------------');
        //console.log('TARGET: ' + target.kindName());
        //target.show('TARGET');
        //console.log('REMOVE TEXT: ' +  this.visualizeNewlines(range.text()));
        //console.log('NEW TEXT:\n-----------\n' + range.remove() + '\n-------------');

        var cu: CompilationUnit = <CompilationUnit>unit;
        cu.updateContentSafe(range.remove());
        //node.parent().show('Before remove');
        node.parent().removeChild(node);
        var shift = -range.len();
        //console.log('shift: ' + shift);
        (<ASTNode>target.root()).shiftNodes(originalStartPos, shift);


        this.recalcPositionsUp(target);

        //this.executeTextChange(new lowlevel.TextChangeCommand(range.startpos(), range.len(), "", unit))

        //target.show('TARGET AFTER REMOVE:');
        //target.root().show('API AFTER REMOVE:');

    }

    private changeKey(unit: lowlevel.ICompilationUnit, attr: ASTNode, newval: string) {
        //console.log('ATTR ' + yaml.Kind[attr.kind()] + '; VALUE: ' + attr.value() + ' => ' + newval);

        //attr.show('NODE:');

        var range = new textutil.TextRange(attr.unit().contents(), attr.keyStart(), attr.keyEnd());
        //console.log('Range1: ' + this.visualizeNewlines(range.text()));

        if(attr.kind() == yaml.Kind.MAPPING) {
            var sc: yaml.YAMLScalar = (<yaml.YAMLMapping>attr._actualNode()).key;
            sc.value=<string>newval;
        }

        var cu: CompilationUnit = <CompilationUnit>unit;
        //console.log('replace: ' + range.len());
        //console.log('Range2: ' + this.visualizeNewlines(range.text()));
        //console.log('Text1: ' + this.visualizeNewlines(cu.contents()));
        var newtext = range.replace(newval);
        //console.log('Text1: ' + this.visualizeNewlines(newtext));
        cu.updateContentSafe(newtext);
        var shift = newval.length-range.len();
        //console.log('shift: ' + shift);
        (<ASTNode>attr.root()).shiftNodes(range.startpos(), shift);

        this.recalcPositionsUp(attr);

        //this.executeTextChange(new lowlevel.TextChangeCommand(startpos, val.length, ""+newval,attr.unit()));
        //if (attr.kind() == yaml.Kind.MAPPING) {
        //    var tx = (<yaml.YAMLMapping>attr._actualNode());
        //    if (tx.value&&tx.value.kind==yaml.Kind.SCALAR) {
        //        var sc = (<yaml.YAMLScalar>tx.value);
        //        sc.value = "" + newValue;
        //        //FIXME
        //    }
        //}

    }

    private changeValue(unit: lowlevel.ICompilationUnit, attr: ASTNode, newval: string | lowlevel.ILowLevelASTNode) {
        //console.log('ATTR ' + yaml.Kind[attr.kind()] + '; VALUE: ' + val + ' => ' + newval);

        //attr.show('NODE:');

        var range = new textutil.TextRange(attr.unit().contents(), attr.start(), attr.end());
        //console.log('Range1: ' + this.visualizeNewlines(range.text()));

        //console.log('ATTR: ' + attr.kindName());

        var newNodeText;

        var indent = 0;

        var replacer = null;
        var mapping = null;

        //console.log('attr: ' + attr.kindName());
        if (attr.kind() == yaml.Kind.SCALAR) {
            if (typeof newval == 'string') {
                attr.asScalar().value = <string>newval;
                //range = range.withStart(attr.valueStart()).withEnd(attr.valueEnd());
                //console.log('Range1: ' + this.visualizeNewlines(range.text()));
                newNodeText = newval;
            } else {
                throw "not implemented";
            }
        } else if (attr.kind() == yaml.Kind.MAPPING) {
            mapping = attr.asMapping();
            //console.log('val: ' + mapping.value);
            range = mapping.value? range.withStart(attr.valueStart()).withEnd(attr.valueEnd()) : range.withStart(attr.keyEnd()+1).withEnd(attr.keyEnd()+1);
            if (newval == null) {
                newNodeText = '';
                mapping.value = null;
            } else if (typeof newval == 'string' || newval == null) {
                var newstr = <string>newval;
                var ind = this.indent(attr);
                //console.log('indent: ' + ind.length);
                if(newstr && textutil.isMultiLine(newstr)) {
                    newstr = '' + textutil.makeMutiLine(newstr, ind.length/2);
                }
                newNodeText = newstr;
                var valueNode = null;
                if (!mapping.value) {
                    mapping.value = yaml.newScalar(newstr);
                } else if (mapping.value.kind == yaml.Kind.SEQ) {
                    valueNode = (<yaml.YAMLSequence>mapping.value).items[0];
                } else if (mapping.value.kind == yaml.Kind.SCALAR) {
                    valueNode = (<yaml.YAMLScalar>mapping.value);
                }
                //console.log('set mapping scalar/seq');
                if (valueNode) {
                    valueNode.value = newstr;
                }
            } else {
                var n = <ASTNode>newval;
                var buf = new MarkupIndentingBuffer('');
                n.markupNode(buf, n._actualNode(), 0, true);
                newNodeText = ' ' + buf.text + '';
                //newNodeText = '{' + n.dump() + '}';
                indent++;
                //n.show("NN1:", 0, newNodeText);
                //range = mapping.value? range.withStart(attr.valueStart()).withEnd(attr.valueEnd()) : range.withStart(attr.keyEnd()+1).withEnd(attr.keyEnd()+1 + newNodeText);
                n.shiftNodes(0, range.startpos()+indent);
                //n.show("NN2:");
                replacer = n;
                //console.log('new node text: ' + this.visualizeNewlines(newNodeText) + '; len: ' + newNodeText.length);
            }
        } else {
            console.log('Unsupported change value case: ' + attr.kindName());
        }

        //console.log('new node text: ' + newNodeText);
        var cu: CompilationUnit = <CompilationUnit>unit;
        //console.log('replace: ' + range.len());
        //console.log('Range2: ' + this.visualizeNewlines(range.text()));
        //console.log('Text1: ' + this.visualizeNewlines(cu.contents()));
        var newtext = range.replace(newNodeText);
        //console.log('Text1: ' + this.visualizeNewlines(newtext));
        cu.updateContentSafe(newtext);
        var shift = newNodeText.length-range.len();
        //console.log('shift: ' + shift);
        (<ASTNode>attr.root()).shiftNodes(range.endpos()+indent, shift);

        if (replacer) {
            mapping.value = replacer._actualNode();
        }



        this.recalcPositionsUp(attr);

        //this.executeTextChange(new lowlevel.TextChangeCommand(startpos, val.length, ""+newval,attr.unit()));
        //if (attr.kind() == yaml.Kind.MAPPING) {
        //    var tx = (<yaml.YAMLMapping>attr._actualNode());
        //    if (tx.value&&tx.value.kind==yaml.Kind.SCALAR) {
        //        var sc = (<yaml.YAMLScalar>tx.value);
        //        sc.value = "" + newValue;
        //        //FIXME
        //    }
        //}

    }

    execute(cmd:lowlevel.CompositeCommand) {
        //console.log('Commands: ' + cmd.commands.length);
        cmd.commands.forEach(x=>{
            //console.log('EXECUTE: kind: ' + lowlevel.CommandKind[x.kind] + '; val: ' + x.value);
            switch (x.kind){
                case lowlevel.CommandKind.CHANGE_VALUE:
                    var attr: ASTNode = <ASTNode>x.target;
                    var curval = attr.value();
                    if (!curval){
                        curval="";
                    }
                    var newval = x.value;

                    if(typeof curval == 'string' && typeof newval == 'string') {
                        //console.log('set value: str => str');
                        this.changeValue(attr.unit(), attr, <string>newval);
                    } else if(typeof curval == 'string' && typeof newval != 'string') {
                        // change structure
                        this.changeValue(attr.unit(), attr, null);
                        this.changeValue(attr.unit(), attr, <ASTNode>newval);
                    } else if(typeof curval != 'string' && typeof newval == 'string') {
                        var newstr = <string>x.value;
                        if(curval.kind() == yaml.Kind.MAPPING) {
                            if(!textutil.isMultiLine(newstr)) {
                                this.changeKey(attr.unit(), curval, newstr);
                            } else {
                                attr.children().forEach(n=> {
                                    this.remove(attr.unit(), attr, <ASTNode>n);
                                });
                                this.changeValue(attr.unit(), attr, newstr);
                            }
                        } else {
                            throw 'unsupported case: attribute value conversion: ' + (typeof curval) + ' ==> ' + (typeof newval) + ' not supported';
                        }
                    } else if(typeof curval != 'string' && typeof newval != 'string') {
                        // change structure
                        //console.log('set value: obj => obj');
                        var node = <ASTNode>newval;
                        var map = node.asMap();
                        //console.log('attr: ' + attr.kindName() + " " + attr.dump());
                        attr.children().forEach(n=> {
                            this.remove(attr.unit(), attr, <ASTNode>n);
                        });
                        node.children().forEach(m=> {
                            //this.add2(attr, <ASTNode>m, false, null, true);
                        });
                        this.changeValue(attr.unit(), attr, <ASTNode>newval);
                    } else {
                        throw "shouldn't be this case: attribute value conversion " + (typeof curval) + ' ==> ' + (typeof newval) + ' not supported';
                    }
                    return;
                case lowlevel.CommandKind.CHANGE_KEY:
                    var attr: ASTNode = <ASTNode>x.target;
                    this.changeKey(attr.unit(), attr, <string>x.value);
                    return;
                case lowlevel.CommandKind.ADD_CHILD:
                    var attr:ASTNode=<ASTNode>x.target;
                    var newValueNode=<ASTNode>x.value;
                    this.add2(attr, newValueNode, x.toSeq, <ASTNode>x.insertionPoint);
                    return;
                case lowlevel.CommandKind.REMOVE_CHILD:
                    var target:ASTNode = <ASTNode>x.target;
                    var node = <ASTNode>x.value;
                    this.remove(target.unit(), target, node);
                    return;
                default:
                    console.log('UNSUPPORTED COMMAND: ' + lowlevel.CommandKind[x.kind]);
                    return;

            }
        })
    }

    replaceYamlNode(target: ASTNode, newNodeContent: string, offset: number, shift: number, unit: lowlevel.ICompilationUnit) {

        //console.log('New content:\n' + newNodeContent);
        //target.show('OLD TARGET');

        var newYamlNode = <yaml.YAMLNode>parser.load(newNodeContent, {});

        //console.log('new yaml: ' + yaml.Kind[newYamlNode.kind]);
        this.updatePositions(target.start(), newYamlNode);
        //console.log('Shift: ' + shift);
        //(<ASTNode>unit.ast()).shiftNodes(offset, shift);
        (<ASTNode>target.root()).shiftNodes(offset, shift);

        var targetParent = target.parent();
        var targetYamlNode: yaml.YAMLNode = target._actualNode();
        var parent = targetYamlNode.parent;
        newYamlNode.parent = parent;

        if(targetParent && targetParent.kind() == yaml.Kind.MAP) {
            //console.log('MAP!!!');
            var targetParentMapNode = <yaml.YamlMap>targetParent._actualNode();
            targetParentMapNode.mappings = <yaml.YAMLMapping[]>targetParentMapNode.mappings.map(x=> {
                if (x != targetYamlNode) {
                    return x;
                }
                return newYamlNode;
            });
        }
        target.updateFrom(newYamlNode);

        //target.show('MEW TARGET');

        this.recalcPositionsUp(target);

    }

    executeTextChange2(textCommand: lowlevel.TextChangeCommand) {
        var cu: CompilationUnit = <CompilationUnit>textCommand.unit;
        var unitText = cu.contents();
        var target:ASTNode = <ASTNode>textCommand.target;
        if (target) {
            var cnt = unitText.substring(target.start(), target.end());
            var original=unitText;
            unitText = unitText.substr(0, textCommand.offset) + textCommand.text + unitText.substr(textCommand.offset + textCommand.replacementLength);

            var newNodeContent = cnt.substr(0, textCommand.offset - target.start()) +
                textCommand.text + cnt.substr(textCommand.offset - target.start() + textCommand.replacementLength);

            cu.updateContentSafe(unitText)
            if (textCommand.offset > target.start()) {
                try {
                    var shift = textCommand.text.length - textCommand.replacementLength;
                    var offset = textCommand.offset;

                    (<Project>target.unit().project()).replaceYamlNode(target, newNodeContent, offset, shift, textCommand.unit);

                } catch (e) {
                    console.log('New node contents (causes error below): \n' + newNodeContent);
                    console.log('Reparse error: ' + e.stack);
                }
            }
        } else {
            unitText = unitText.substr(0, textCommand.offset) + textCommand.text + unitText.substr(textCommand.offset + textCommand.replacementLength);
        }

        cu.updateContent(unitText);
        this.listeners.forEach(x=> {
            x(null)
        });
        this.tlisteners.forEach(x=> {
            x(textCommand)
        })

    }

    executeTextChange(textCommand:lowlevel.TextChangeCommand) {
        var l0=new Date().getTime();
        try {
            var oc = textCommand.unit.contents();
            //console.log('Offset: ' + textCommand.offset + '; end: ' + (textCommand.offset + textCommand.replacementLength) + '; len: ' + textCommand.replacementLength);
            var target:ASTNode = <ASTNode>textCommand.target;
            if(target == null) {
                target = <ASTNode>this.findNode(textCommand.unit.ast(), textCommand.offset, textCommand.offset + textCommand.replacementLength);
            }
            var cu:CompilationUnit = <CompilationUnit>textCommand.unit;
            if (target) {
                var cnt = oc.substring(target.start(), target.end());
                //console.log('Content: ' + cnt);
                var original=oc;
                oc = oc.substr(0, textCommand.offset) + textCommand.text + oc.substr(textCommand.offset + textCommand.replacementLength);

                var newNodeContent = cnt.substr(0, textCommand.offset - target.start()) +
                    textCommand.text + cnt.substr(textCommand.offset - target.start() + textCommand.replacementLength);

                cu.updateContentSafe(oc)
                //console.log('UPDATED TEXT: ' + oc);
                var hasNewLines = breaksTheLine(original, textCommand);
                if (textCommand.offset > target.start()) {
                    //we can just reparse new node content;
                    //console.log(newNodeContent)
                    try {
                        var newYamlNode = <yaml.YAMLNode>parser.load(newNodeContent, {});
                        this.updatePositions(target.start(), newYamlNode);
                        //console.log("Positions updated")
                        //lets shift all after it
                        var shift = textCommand.text.length - textCommand.replacementLength;
                        //console.log('shift: ' + shift);

                        //console.log('offset: ' + textCommand.offset);
                        (<ASTNode>textCommand.unit.ast()).shiftNodes(textCommand.offset, shift);
                        //console.log('Unit AST: ' + textCommand.unit.ast())
                        if (newYamlNode != null && newYamlNode.kind == yaml.Kind.MAP) {
                            var actualResult = (<yaml.YamlMap>newYamlNode).mappings[0];
                            var targetYamlNode: yaml.YAMLNode = target._actualNode();
                            var parent = targetYamlNode.parent;
                            var cmd=new lowlevel.ASTDelta();
                            var unit = <CompilationUnit>textCommand.unit;
                            cmd.commands=[
                                new lowlevel.ASTChangeCommand(lowlevel.CommandKind.CHANGE_VALUE,
                                    new ASTNode(copyNode(targetYamlNode), unit, null, null, null),
                                    new ASTNode(actualResult, unit, null, null, null),
                                    0
                                )
                            ];
                            if (parent && parent.kind == yaml.Kind.MAP) {
                                var map:yaml.YamlMap = <yaml.YamlMap>parent;
                                map.mappings = <yaml.YAMLMapping[]>map.mappings.map(x=> {
                                    if (x != targetYamlNode) {
                                        return x;
                                    }
                                    return actualResult;
                                })
                            }
                            actualResult.parent = parent;
                            //updating low level ast from yaml

                            this.recalcPositionsUp(target);

                            target.updateFrom(actualResult);
                            //console.log("Incremental without listeners: "+(new Date().getTime()-l0));
                            //console.log("Notify listeners1: " + this.listeners.length + ":" + this.tlisteners.length);
                            this.listeners.forEach(x=> {
                                x(cmd)
                            });
                            this.tlisteners.forEach(x=> {
                                x(textCommand)
                            });
                            //console.log("Incremental update processed");
                            return;
                        }
                    }
                    catch (e) {
                        console.log('New node contents (causes error below): \n' + newNodeContent);
                        console.log('Reparse error: ' + e.stack);
                    }
                }
            }
            else {
                oc = oc.substr(0, textCommand.offset) + textCommand.text + oc.substr(textCommand.offset + textCommand.replacementLength);
            }
            var t2=new Date().getTime();
            //console.log("Full without listeners:"+(t2-l0));

            //!find node in scope
            cu.updateContent(oc);

            //console.log("Notify listeners2: " + this.listeners.length + ":" + this.tlisteners.length);

            this.listeners.forEach(x=> {
                x(null)
            });
            this.tlisteners.forEach(x=> {
                x(textCommand)
            })
        } finally{
            var t2=new Date().getTime();
            //console.log("Total:"+(t2-l0));
        }
    }

    updatePositions(offset: number, n: yaml.YAMLNode){
        if (n==null){
            return;
        }
        if (n.startPosition == -1){
            n.startPosition = offset;
        } else {
            n.startPosition = offset + n.startPosition;
        }
        n.endPosition = offset + n.endPosition;
        //console.log('SET POS: ' + n.startPosition + ".." + n.endPosition);
        switch (n.kind){
            case yaml.Kind.MAP:
                var m:yaml.YamlMap=<yaml.YamlMap>n;
                m.mappings.forEach(x=>this.updatePositions(offset,x))
                break;
            case yaml.Kind.MAPPING:
                var ma:yaml.YAMLMapping=<yaml.YAMLMapping>n;
                this.updatePositions(offset,ma.key)
                this.updatePositions(offset,ma.value)
                break;
            case yaml.Kind.SCALAR:
                break;
            case yaml.Kind.SEQ:
                var s:yaml.YAMLSequence=<yaml.YAMLSequence>n;
                s.items.forEach(x=>this.updatePositions(offset,x))
                break;
        }
    }

    findNode(n:lowlevel.ILowLevelASTNode,offset:number,end:number):lowlevel.ILowLevelASTNode{
        if (n==null){
            return null;
        }
        var node:ASTNode=<ASTNode>n;
        if (n.start()<=offset&&n.end()>=end){
            var res=n;
            node.directChildren().forEach(x=>{
                var m=this.findNode(x,offset,end);
                if (m){
                    res=m;
                }
            })
            return res;
        }
        return null;
    }

    //shiftNodes(n:lowlevel.ILowLevelASTNode, offset:number, shift:number):lowlevel.ILowLevelASTNode{
    //    var node:ASTNode=<ASTNode>n;
    //    if (node==null){
    //        return null;
    //    }
    //    node.directChildren().forEach(x=> {
    //        var m = this.shiftNodes(x, offset, shift);
    //    })
    //    var yaNode=(<ASTNode>n)._actualNode();
    //    if(yaNode) innerShift(offset, yaNode, shift);
    //    return null;
    //}

    addTextChangeListener(listener:lowlevel.ITextChangeCommandListener){
        this.tlisteners.push(listener)
    }
    removeTextChangeListener(listener:lowlevel.ITextChangeCommandListener){
        this.tlisteners=this.tlisteners.filter(x=>x!=listener);
    }


    addListener(listener:lowlevel.IASTListener) {
        this.listeners.push(listener)
    }

    removeListener(listener:lowlevel.IASTListener) {
        this.listeners=this.listeners.filter(x=>x!=listener)
    }

}
function breaksTheLine(oc:string,textCommand:lowlevel.TextChangeCommand){
    var oldText=oc.substr(textCommand.offset,textCommand.replacementLength);
    if (oldText.indexOf('\n')!=-1){
        return true;
    }
    if (textCommand.text.indexOf('\n')!=-1){
        return true;
    }
}

export class ASTNode implements lowlevel.ILowLevelASTNode{

    _errors:Error[]=[]

    constructor (
        private _node: yaml.YAMLNode,
        private _unit: CompilationUnit,
        private _parent: ASTNode,
        private _anchor: ASTNode,
        private _include: ASTNode,
        private cacheChildren:boolean = false) {
        if (_node==null){
            console.log("null")
        }
    }

    _children:lowlevel.ILowLevelASTNode[]

    yamlNode():yaml.YAMLNode{
        return this._node;
    }

    private _highLevelNode:highlevel.IHighLevelNode

    private _highLevelParseResult:highlevel.IParseResult

    setHighLevelParseResult(highLevelParseResult:highlevel.IParseResult){
        this._highLevelParseResult = highLevelParseResult;
    }

    highLevelParseResult():highlevel.IParseResult{
        return this._highLevelParseResult;
    }

    setHighLevelNode(highLevel:highlevel.IHighLevelNode){
        this._highLevelNode = highLevel;
    }

    highLevelNode():highlevel.IHighLevelNode{
        return this._highLevelNode;
    }

    start():number {
        return this._node.startPosition;
    }


    errors(){
        return this._errors;
    }

    parent():ASTNode{
        return this._parent;
    }

    recalcEndPositionFromChilds() {
        var childs = this.children();
        if(this.children().length == 0) return;
        var max = 0;
        var last: ASTNode = <ASTNode>this.children()[this.children().length-1];
        //this.children().forEach(n=> {
        //    var node: ASTNode = <ASTNode>n;
        //    if(node._node.endPosition > max) max = node._node.endPosition;
        //});
        this._node.endPosition = last._node.endPosition;
        //this._node.endPosition = max;;
    }

    isValueLocal():boolean{
        if (this._node.kind==yaml.Kind.MAPPING){
            var knd=(<yaml.YAMLMapping>this._node).value.kind;
            return knd!=yaml.Kind.INCLUDE_REF&&knd!=yaml.Kind.ANCHOR_REF;
        }
        return true;
    }

    keyStart():number{
        if (this._node.kind==yaml.Kind.MAPPING){
            return (<yaml.YAMLMapping>this._node).key.startPosition
        }
        return -1;
    }
    keyEnd():number{
        if (this._node.kind==yaml.Kind.MAPPING){
            return (<yaml.YAMLMapping>this._node).key.endPosition
        }
        return -1;
    }

    valueStart():number{
        if (this._node.kind==yaml.Kind.MAPPING){
            return this.asMapping().value.startPosition
        }

        return -1;
    }
    valueEnd():number{
        if (this._node.kind==yaml.Kind.MAPPING){
          var mn = this.asMapping();
            return mn.value.endPosition
        }
        return -1;
    }

    end():number {
        return this._node.endPosition;

    }

    _oldText;
    dump():string{
        if (this._oldText){
            return this._oldText;
        }

        if (this._unit&&this._node.startPosition>0&&this._node.endPosition>0){
            var originalText=this._unit.contents().substring(this._node.startPosition,this._node.endPosition);
            originalText=stripIndent(originalText,leadingIndent(this,this._unit.contents()));
            //console.log("L:");
            //console.log(originalText);
            return originalText;
        }

        return dumper.dump(this.dumpToObject(),{})
    }
    dumpToObject():any{

        return this.dumpNode(this._node);
    }

    dumpNode(n:yaml.YAMLNode){
        if(!n){
            return  null;
        }
        if (n.kind==yaml.Kind.SEQ){
            var seq:yaml.YAMLSequence=<yaml.YAMLSequence>n
            var arr=[];
            seq.items.forEach(x=>arr.push(this.dumpNode(x)));
            return arr;
        }
        if (n.kind==yaml.Kind.MAPPING){
            var c:yaml.YAMLMapping=<yaml.YAMLMapping>n
            var v={};

            var val=c.value;
            var mm=this.dumpNode(val);
            v[""+this.dumpNode(c.key)]=mm;
            return v;
        }
        if (n.kind==yaml.Kind.SCALAR){
            var s:yaml.YAMLScalar=<yaml.YAMLScalar>n

            return s.value;
        }
        if (n.kind==yaml.Kind.MAP){
            var map=<yaml.YamlMap>n;
            var res={};
            if (map.mappings.length==1){
                if((<yaml.YAMLScalar>map.mappings[0].key).value=='value'){
                    return this.dumpNode(map.mappings[0].value);
                }
            }

            if (map.mappings) {
                map.mappings.forEach(x=> {
                    var ms=this.dumpNode(x.value);
                    if (ms==null){
                        ms="!$$$novalue"
                    }
                    if ((ms+"").length>0) {
                        res[this.dumpNode(x.key) + ""] = ms;
                    }
                })
            }
            return res;
        }
    }

    _actualNode(){
        return this._node
    }
    execute(cmd:lowlevel.CompositeCommand) {
        if (this.unit()){
            this.unit().project().execute(cmd)
        }
        else{
            cmd.commands.forEach(x=>{
                switch (x.kind){
                    case lowlevel.CommandKind.CHANGE_VALUE:
                        var attr:ASTNode=<ASTNode>x.target;
                        var newValue=x.value;
                        var va=attr._actualNode();
                        var as=attr.start();
                        if (va.kind==yaml.Kind.MAPPING){
                            (<yaml.YAMLMapping>va).value=yaml.newScalar(""+newValue);
                        }

                        //this.executeTextChange(new lowlevel.TextChangeCommand(as,attr.value().length,<string>newValue,attr.unit()))
                        return;
                    case lowlevel.CommandKind.CHANGE_KEY:
                        var attr:ASTNode=<ASTNode>x.target;
                        var newValue=x.value;
                        var va=attr._actualNode();
                        if (va.kind==yaml.Kind.MAPPING){
                            var sc:yaml.YAMLScalar=(<yaml.YAMLMapping>va).key
                            sc.value=<string>newValue
                        }
                        return;
                }
            })
        }
    }


    updateFrom(n:yaml.YAMLNode){
        this._node=n;
    }

    value():any {
       if (!this._node){
            return "";
       }
       if (this._node.kind==yaml.Kind.SCALAR){
            //TODO WHAT IS IT IS INCLUDE ACTUALLY
           return this._node['value'];
        }
        if (this._node.kind==yaml.Kind.ANCHOR_REF){
            var ref:yaml.YAMLAnchorReference=<yaml.YAMLAnchorReference>this._node;
            return new ASTNode(ref.value,this._unit,this,null,null).value();
        }
        if (this._node.kind==yaml.Kind.MAPPING){
            var map:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
            if (map.value==null){
                return null;
            }
            return new ASTNode(map.value,this._unit,this,null,null).value();
        }
        if (this._node.kind==yaml.Kind.INCLUDE_REF){
            //here we should resolve include
            var includePath=this._node['value'];

            var resolved=this._unit.resolve(includePath)
            if (resolved==null){
                return "can not resolve "+includePath
            }
            if (resolved.isRAMLUnit()){

                //TODO DIFFERENT DATA TYPES, inner references
                return null;
            }
            return resolved.contents();
        }
        if (this._node.kind==yaml.Kind.MAP){
            var amap:yaml.YamlMap=<yaml.YamlMap>this._node;
            if(amap.mappings.length==1){

                //handle map with one member case differently
                return new ASTNode(amap.mappings[0],this._unit,this,null,null);
            }

        }
        if (this._node.kind==yaml.Kind.SEQ){
            var aseq:yaml.YAMLSequence=<yaml.YAMLSequence>this._node;
            if(aseq.items.length==1&&true){

                //handle seq with one member case differently
                return new ASTNode(aseq.items[0],this._unit,this,null,null).value();
            }
        }
        //this are only kinds which has values
        return null;
    }


    visit(v:lowlevel.ASTVisitor) {
        this.children().forEach(x=>{
            if (v(x)){
                x.visit(v);
            }
        })
    }

    key():string {
        if (!this._node){
            return "";
        }
        if (this._node.kind==yaml.Kind.MAPPING){
            var map:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
            return map.key.value;
        }
        //other kinds do not have keys
        return null;
    }

    addChild(n: lowlevel.ILowLevelASTNode, pos: number = -1){
        var node = <ASTNode>n;
        this._oldText=null;
        if(this.isMap()) {
            var map = this.asMap();
            if (map.mappings==null||map.mappings==undefined){
                map.mappings=[]
            }
            if(pos >= 0) {
                map.mappings.splice(pos, 0, node.asMapping());
            } else {
                map.mappings.push(node.asMapping());
            }
        } else if(this.isMapping()) {
            var mapping = this.asMapping();
            var val = mapping.value;
            if(!mapping.value && node.isMap()) {
                mapping.value = node._actualNode();
                return;
            }
            if(!val) {
                val = yaml.newMap();
                mapping.value = val;
            }
            if(val.kind == yaml.Kind.MAP) {
                var map = <yaml.YamlMap>val;
                if (map.mappings==null||map.mappings==undefined){
                    map.mappings=[]
                }
                if(pos >= 0) {
                    map.mappings.splice(pos, 0, node.asMapping());
                } else {
                    map.mappings.push(node.asMapping());
                }
            } else if(val.kind == yaml.Kind.SEQ) {
                var seq = <yaml.YAMLSequence>val;
                if(pos >= 0) {
                    seq.items.splice(pos, 0, node._actualNode());
                } else {
                    seq.items.push(node._actualNode());
                }
            } else {
                throw "Insert into map with " + yaml.Kind[mapping.value.kind] + " value not supported";
            }
        } else if(this.isSeq()) {
            var seq = this.asSeq();
            if(pos >= 0) {
                seq.items.splice(pos, 0, node._actualNode());
            } else {
                seq.items.push(node._actualNode());
            }
        } else {
            throw "Insert into " + this.kindName() + " not supported";
        }

    }

    removeChild(n: lowlevel.ILowLevelASTNode){
        this._oldText=null;
        var node = <ASTNode>n;
        var ynode;
        var index;

        //console.log('*** REMOVE FROM: ' + this.kindName());

        if (this.kind() == yaml.Kind.SEQ) {
            //console.log('remove from seq');
            var seq = this.asSeq();
            //val = <yaml.YamlMap>((<yaml.YAMLMapping>this._node).value);
            ynode = <yaml.YAMLNode>node._node;
            index = seq.items.indexOf(ynode);
            if (index > -1) seq.items.splice(index, 1);
        } else if (this.kind() == yaml.Kind.MAP) {
            //val = <yaml.YamlMap>((<yaml.YAMLMapping>this._node).value);
            var map = this.asMap();
            //console.log('remove from map: ' + map.mappings.length);
            ynode = node.asMapping();
            index = map.mappings.indexOf(ynode);
            //console.log('  index: ' + index);
            if (index > -1) map.mappings.splice(index, 1);
            //console.log('  new len: ' + map.mappings.length);
        } else if (this.kind() == yaml.Kind.MAPPING) {
            //console.log('*** REMOVE FROM MAPPING');
            //val = <yaml.YamlMap>((<yaml.YAMLMapping>this._node).value);
            //console.log('remove from mapping with map as value');
            var mapping = this.asMapping();
            //this.show("REMOVE TARGET: ***");
            //node.show("REMOVE NODE: ***");
            if(node._actualNode() == mapping.value) {
                // remove right from mapping
                //console.log('*** remove map from mapping!');
                mapping.value = null;
            } else {
                var map = <yaml.YamlMap>(mapping.value);
                ynode = node.asMapping();
                if(map && map.mappings) {
                    index = map.mappings.indexOf(ynode);
                    if (index > -1) map.mappings.splice(index, 1);
                }
            }
        } else {
            throw "Delete from " + yaml.Kind[this.kind()] + " unsupported";
        }

    }

    includeErrors():string[]{
        if (this._node.kind==yaml.Kind.MAPPING){

            var mapping:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
            if (mapping.value==null){
                        return [];
            }
            return new ASTNode(mapping.value,this._unit,this,this._anchor,this._include).includeErrors();

        }
        var rs:string[]=[]
        if (this._node.kind==yaml.Kind.INCLUDE_REF){
            var mapping:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
            if (mapping.value==null){
                return [];
            }
            var includePath=this.includePath();

            var resolved=this._unit.resolve(includePath)
            if (resolved==null){
                rs.push("Can not resolve "+includePath);
                return rs;
            }
            if (resolved.isRAMLUnit()) {
                var ast=resolved.ast();
                if (ast) {
                    return []
                }
                else{
                    rs.push(""+includePath+" can not be parsed")
                }
            }
        }
        return rs;
    }
    children(inc:ASTNode=null,anc:ASTNode=null,inOneMemberMap:boolean=true):lowlevel.ILowLevelASTNode[] {
        if (this._node==null){
            return [];//TODO FIXME
        }
        if(this.cacheChildren&&this._children){
            return this._children;
        }
        var result:lowlevel.ILowLevelASTNode[];
        var kind = this._node.kind;

            if(kind==yaml.Kind.SCALAR) {
                result = [];
            }
            else if(kind == yaml.Kind.MAP)
            {
                var map:yaml.YamlMap=<yaml.YamlMap>this._node;
                if(map.mappings.length==1&&!inOneMemberMap){
                    //handle map with one member case differently
                    // q:
                    //  []
                    //   - a
                    //   - b
                    // ->
                    // q:
                    //  a
                    //  b
                    result = new ASTNode(map.mappings[0].value,this._unit,this,inc,anc,this.cacheChildren).children(null,null,true);
                }
                else {
                    result = map.mappings.map(x=>new ASTNode(x, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include,this.cacheChildren));
                }
            }
            else if(kind == yaml.Kind.MAPPING)
            {
                var mapping:yaml.YAMLMapping=<yaml.YAMLMapping>this._node;
                if (mapping.value==null){
                    result = [];
                }
                else {
                    result = new ASTNode(mapping.value, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include,this.cacheChildren).children();
                }
            }
            else if(kind == yaml.Kind.SEQ)
            {
                var seq:yaml.YAMLSequence=<yaml.YAMLSequence>this._node;
                result = seq.items.filter(x=>x!=null).map(x=>new ASTNode(x,this._unit,this,anc?anc:this._anchor,inc?inc:this._include,this.cacheChildren));
            }
            else if(kind == yaml.Kind.INCLUDE_REF)
            {
                if (this._unit) {
                    var includePath = this.includePath();
                    var resolved = this._unit.resolve(includePath)
                    if (resolved == null) {
                        result = [];
                    }
                    else if (resolved.isRAMLUnit()) {
                        var ast = resolved.ast();
                        if (ast) {
                            if(this.cacheChildren){
                                ast = <ASTNode>toChildCahcingNode(ast);
                            }
                            result = resolved.ast().children(this, null);
                        }
                    }
                }
                if(!result) {
                    result = [];
                }
            }
            else if(kind == yaml.Kind.ANCHOR_REF)
            {
                var ref:yaml.YAMLAnchorReference=<yaml.YAMLAnchorReference>this._node;
                result = new ASTNode(ref.value,this._unit,this,null,null,this.cacheChildren).children();
            }
            else{
                throw new Error("Should never happen; kind : " + yaml.Kind[this._node.kind]);
            }


            if(this.cacheChildren){
                this._children = result;
            }
            return result;


    }

    directChildren(inc:ASTNode=null,anc:ASTNode=null,inOneMemberMap:boolean=true):lowlevel.ILowLevelASTNode[] {
        if (this._node) {
            switch (this._node.kind) {
                case yaml.Kind.SCALAR:
                    return [];
                case yaml.Kind.MAP:
                {
                    var map:yaml.YamlMap = <yaml.YamlMap>this._node;
                    if (map.mappings.length == 1 && !inOneMemberMap) {
                        //handle map with one member case differently
                        return new ASTNode(map.mappings[0].value, this._unit, this, inc, anc).directChildren(null, null, true);
                    }
                    return map.mappings.map(x=>new ASTNode(x, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include));
                }
                case yaml.Kind.MAPPING:
                {
                    var mapping:yaml.YAMLMapping = <yaml.YAMLMapping>this._node;
                    if (mapping.value == null) {
                        return [];
                    }
                    return new ASTNode(mapping.value, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include).directChildren();
                }
                case yaml.Kind.SEQ:
                {
                    var seq:yaml.YAMLSequence = <yaml.YAMLSequence>this._node;
                    return seq.items.filter(x=>x!=null).map(x=>new ASTNode(x, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include));
                }
                case yaml.Kind.INCLUDE_REF:
                {
                    return [];
                }
                case yaml.Kind.ANCHOR_REF:
                {
                    return [];
                }
            }
            throw new Error("Should never happen; kind : " + yaml.Kind[this._node.kind]);
        }
        return []
    }

    anchorId():string {
        return this._node.anchorId;
    }

    unit():lowlevel.ICompilationUnit {
        return this._unit;
        //if(this._unit) return this._unit;
        //if(!this.parent()) return null;
        //return this.parent().unit();
    }

    setUnit(unit: CompilationUnit) {
        this._unit = unit;
    }

    includePath():string {
        if (this._node.kind==yaml.Kind.INCLUDE_REF){
            var includePath=this._node['value'];
            return includePath;
        }
        return null;
    }

    anchoredFrom():lowlevel.ILowLevelASTNode {
        return this._anchor;
    }

    includedFrom():lowlevel.ILowLevelASTNode {
        return this._include;
    }

    kind(): yaml.Kind {
        return this._actualNode().kind;
    }

    kindName(): string {
        return yaml.Kind[this.kind()];
    }

    indent(lev: number, str: string='') {
        var leading = '';
        //leading += '[' + lev + ']';
        for(var i=0; i<lev; i++) leading += '  ';
        return leading + str;
    }

    replaceNewlines(s: string, rep: string=null): string {
        var res: string = '';
        for(var i=0; i<s.length; i++) {
            var ch = s[i];
            if(ch == '\r') ch = rep == null? '\\r' : rep;
            if(ch == '\n') ch = rep == null? '\\n' : rep;
            res += ch;
        }
        return res;
    }

    shortText(unittext: string, maxlen: number = 50): string {
        var elen = this.end() - this.start();
        var len = elen;
        //var len = Math.min(elen,50);

        var unit = this.unit();

        if(!unittext && unit) {
            unittext = unit.contents();
        }
        var text;
        if (!unittext) {
            text = '[no-unit]';
        } else {
            var s = unittext;
            text = s ? s.substring(this.start(), this.end()) : '[no-text]';
        }
        text =  "[" + this.start() + ".." + this.end() + "] " + elen + " // " + text;
        if(len < elen) text += '...';

        text = this.replaceNewlines(text);
        return text;
    }

    show(message: string=null, lev: number=0, text: string = null) {
        if(message && lev == 0) {
            console.log(message);
        }
        var children = this.children();

        var desc = this.kindName();
        var val = (<any>this._actualNode()).value;

        if(this.kind() == yaml.Kind.MAPPING) {
            desc += '[' + (<yaml.YAMLMapping>this._actualNode()).key.value + ']';
        }

        if(val)
            desc += "/" + yaml.Kind[val.kind]; // + ' ' + val;
        else
            desc += "";


        if(children.length == 0) {
            //desc += "/" + this.value();
            console.log(this.indent(lev) + desc + " // " + this.shortText(text));
        } else {
            console.log(this.indent(lev) + desc + " { // " + this.shortText(text));
            children.forEach(node=> {
                var n = <ASTNode>node;
                n.show(null, lev + 1, text);
            })
            console.log(this.indent(lev) + '}');
        }

    }

    showParents(message: string, lev: number=0):number {
        if(message && lev == 0) {
            console.log(message);
        }
        var depth = 0;
        if(this.parent()) {
            var n = <ASTNode>this.parent();
            depth = n.showParents(null, lev + 1);
        }

        var desc = this.kindName();
        var val = (<any>this._actualNode()).value;
        if(val)
            desc += "/" + yaml.Kind[val.kind];
        else
            desc += "/null";

        console.log(this.indent(depth) + desc + " // " + this.shortText(null));

        return depth+1;
    }

    inlined(kind: yaml.Kind): boolean {
        return kind == yaml.Kind.SCALAR ||kind == yaml.Kind.INCLUDE_REF;
    }


    markupNode(xbuf: MarkupIndentingBuffer, node: yaml.YAMLNode, lev: number, json: boolean = false) {
        var start = xbuf.text.length;
        switch(node.kind) {
            case yaml.Kind.MAP:
                if(json) xbuf.append('{');
                var mappings = (<yaml.YamlMap>node).mappings;
                for (var i:number = 0; i < mappings.length; i++) {
                    if(json && i>0) xbuf.append(', ');
                    this.markupNode(xbuf, mappings[i], lev, json);
                }
                if(json) xbuf.append('}');
                break;
            case yaml.Kind.SEQ:
                var items = (<yaml.YAMLSequence>node).items;
                for (var i:number = 0; i < items.length; i++) {
                    xbuf.append(this.indent(lev, '- '));
                    //this.markupNode(xindent, pos+xbuf.text.length-(lev+1)*2, items[i], lev+1, xbuf);
                    this.markupNode(xbuf, items[i], lev+1, json);
                }
                break;
            case yaml.Kind.MAPPING:
                var mapping = (<yaml.YAMLMapping>node);
                var val = mapping.value;
                if(json) {
                    xbuf.append(mapping.key.value);
                    xbuf.append(': ');
                    if(val.kind == yaml.Kind.SCALAR) {
                        var sc = <yaml.YAMLScalar>val;
                        xbuf.append(sc.value);
                    }
                    break;
                }
                if(!val) break;
                if(val.kind == yaml.Kind.SCALAR) {
                    var sc = <yaml.YAMLScalar>val;
                    //if(!sc.value || sc.value.trim().length == 0) break;
                }
                //xbuf.append(this.indent(lev, mapping.key.value + ':'));
                xbuf.addWithIndent(lev, mapping.key.value + ':');
                if (mapping.value) {
                    xbuf.append(this.inlined(mapping.value.kind) ? ' ' : '\n');
                    this.markupNode(xbuf, mapping.value, lev+1, json);
                } else {
                    xbuf.append('\n');
                }
                break;
            case yaml.Kind.SCALAR:
                var sc = (<yaml.YAMLScalar>node);
                if (textutil.isMultiLine(sc.value)) {
                    xbuf.append('|\n');
                    var lines = splitOnLines(sc.value);
                    for(var i=0; i<lines.length; i++) {
                        xbuf.append(this.indent(lev, lines[i]));
                    }
                    xbuf.append('\n');
                } else {
                    xbuf.append(sc.value + '\n');
                }
                //console.log('SCALAR: ' + textutil.replaceNewlines(sc.value));
                break;
            case yaml.Kind.INCLUDE_REF:
                var ref = (<yaml.YAMLAnchorReference>node);
                xbuf.append('include ref: ' + ref.referencesAnchor + '\n');
                break;
            default:
                throw 'Unknown node kind: ' + yaml.Kind[node.kind];
                break;
        }
        while(start < xbuf.text.length && xbuf.text[start] == ' ') start++;
        node.startPosition = start;
        node.endPosition = xbuf.text.length;
    }


    root(): lowlevel.ILowLevelASTNode {
        var node = this;
        while(node.parent()) node = node.parent();
        return node;
    }

    parentOfKind(kind: yaml.Kind):ASTNode{
        var p = this.parent();
        while(p) {
            if(p.kind() == kind) return p;
            p = p.parent();
        }
        return null;
    }

    find(name: string): ASTNode {
        var found: ASTNode = null;
        //console.log('Looking for: ' + name);
        this.directChildren().forEach(y=>{
            //console.log('  node key: ' + y.key());
            if (y.key() && y.key() == name){
                if(!found) found = <ASTNode>y;
            }
        });
        return found;
    }

    shiftNodes(offset:number, shift:number) {
        this.directChildren().forEach(x=> {
            var m = (<ASTNode>x).shiftNodes(offset, shift);
        })
        var yaNode = this._actualNode();
        if(yaNode) innerShift(offset, yaNode, shift);
        return null;
    }

    isMap(): boolean {
        return this.kind() == yaml.Kind.MAP;
    }

    isMapping(): boolean {
        return this.kind() == yaml.Kind.MAPPING;
    }

    isSeq(): boolean {
        return this.kind() == yaml.Kind.SEQ;
    }

    isScalar(): boolean {
        return this.kind() == yaml.Kind.SCALAR;
    }

    asMap(): yaml.YamlMap {
        if(!this.isMap()) throw "map expected instead of " + this.kindName();
        return <yaml.YamlMap>(this._actualNode());
    }

    asMapping(): yaml.YAMLMapping {
        if(!this.isMapping()) throw "maping expected instead of " + this.kindName();
        return <yaml.YAMLMapping>(this._actualNode());
    }

    asSeq(): yaml.YAMLSequence {
        if(!this.isSeq()) throw "seq expected instead of " + this.kindName();
        return <yaml.YAMLSequence>(this._actualNode());
    }

    asScalar(): yaml.YAMLScalar {
        if(!this.isScalar()) throw "scalar expected instead of " + this.kindName();
        return <yaml.YAMLScalar>(this._actualNode());
    }

    text(unitText: string = null): string {
        if(!unitText) {
            if(!this.unit())
                return '[no-text]';
            unitText = this.unit().contents();

        }
        return unitText.substring(this.start(), this.end());
    }

    copy(): ASTNode {
        var yn = copyNode(this._actualNode());
       return new ASTNode(yn, this._unit, this._parent, this._anchor, this._include);
    }

}

export function createNode(key:string){
    //console.log('create node: ' + key);
    var node:yaml.YAMLNode=yaml.newMapping(yaml.newScalar(key),yaml.newMap());
    return new ASTNode(node,null,null,null,null);
}

/*
export function createMappingWithMap(key:string, map: yaml.YAMLNode){
    //console.log('create node: ' + key);
    var node:yaml.YAMLNode=yaml.newMapping(yaml.newScalar(key),map);
    return new ASTNode(node,null,null,null,null);
}

export function createMap(){
    //console.log('create node: ' + key);
    var node:yaml.YAMLNode=yaml.newMap();
    return new ASTNode(node,null,null,null,null);
}
*/

export function createSeqNode(key:string){
    var node:yaml.YAMLNode = yaml.newMapping(yaml.newScalar(key), yaml.newItems());
    return new ASTNode(node,null,null,null,null);
}

export function createMapping(key:string,v:string){
    //console.log('create mapping: ' + key);
    var node:yaml.YAMLNode=yaml.newMapping(yaml.newScalar(key),yaml.newScalar(v));
    return new ASTNode(node,null,null,null,null);
}

export function toChildCahcingNode(node:lowlevel.ILowLevelASTNode):lowlevel.ILowLevelASTNode{
    if(!(node instanceof ASTNode)){
        return null;
    }
    var astNode:ASTNode = <ASTNode>node;
    var result = new ASTNode(astNode.yamlNode(), <CompilationUnit>astNode.unit(), null, null, null, true);
    result._errors = astNode._errors;
    return result;
}
