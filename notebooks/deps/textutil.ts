/// <reference path="./typings/tsd.d.ts" />

export function isMultiLine(s: string): boolean {
    return s && s.indexOf('\n') >= 0;
}

export function trimStart(s: string): string {
    if(!s) return s;
    var pos = 0;
    while(pos < s.length) {
        var ch = s[pos];
        if(ch!='\r' && ch!='\n' && ch!=' ' && ch!='\t') break;
        pos++;
    }
    return s.substring(pos, s.length);
}

export function indent(lev: number, str: string='') {
    var leading = '';
    //leading += '[' + lev + ']';
    for(var i=0; i<lev; i++) leading += '  ';
    return leading + str;
}

export function replaceNewlines(s: string, rep: string=null): string {
    var res: string = '';
    for(var i=0; i<s.length; i++) {
        var ch = s[i];
        if(ch == '\r') ch = rep == null? '\\r' : rep;
        if(ch == '\n') ch = rep == null? '\\n' : rep;
        res += ch;
    }
    return res;
}


export function trimEnd(s: string): string {
    var pos = s.length;
        while(pos > 0) {
                var ch = s[pos-1];
                if(ch != ' ' && ch != '\t') break;
                pos--;
            }
        return s.substring(0,pos);
}

export function splitOnLines(text:string):string[]{
    var lines = text.match(/^.*((\r\n|\n|\r)|$)/gm);
    return lines;
}

export function makeMutiLine(s: string, lev: number): string {
    var xbuf = '';
    if (isMultiLine(s)) {
        xbuf += '|\n';
        var lines = splitOnLines(s);
        for(var i=0; i<lines.length; i++) {
            xbuf += indent(lev, lines[i]);
        }
        //xbuf += '\n';
    } else {
        xbuf += s;
    }
    return xbuf;
}

export class TextRange {

    constructor(private contents: string, private start: number, private end: number) {
    }

    text(): string {
        return this.contents.substring(this.start,this.end);
    }

    startpos(): number { return this.start }

    endpos(): number { return this.end }

    len(): number { return this.end - this.start }

    unitText(): string { return this.contents}

    withStart(start: number): TextRange {
        return new TextRange(this.contents, start, this.end);
    }

    withEnd(end: number): TextRange {
        return new TextRange(this.contents, this.start, end);
    }

    sub(start: number, end: number) {
        return this.contents.substring(start, end);
    }

    extendToStartOfLine(): TextRange {
        var pos = this.start;
        while(pos > 0) {
            var prevchar = this.contents[pos-1];
            if(prevchar == '\r' || prevchar == '\n') break;
            pos--;
        }
        return new TextRange(this.contents, pos, this.end);
    }

    trimStart(): TextRange {
        var pos = this.start;
        while(pos < this.contents.length-1) {
            var ch = this.contents[pos];
            if(ch != ' ' && ch != '\t') break;
            pos++;
        }
        return new TextRange(this.contents, pos, this.end);
    }

    trimEnd(): TextRange {
        var pos = this.end;
        while(pos > 0) {
            var ch = this.contents[pos-1];
            if(ch != ' ' && ch != '\t') break;
            pos--;
        }
        return new TextRange(this.contents, this.end, pos);
    }

    extendAnyUntilNewLines(): TextRange {
        var pos = this.end;
        if(pos>0) {
            var last = this.contents[pos-1];
            if(last == '\n') return this;
        }
        while(pos < this.contents.length-1) {
            var nextchar = this.contents[pos];
            if(nextchar == '\r' || nextchar == '\n') break;
            pos++;
        }
        return new TextRange(this.contents, this.start, pos);
    }

    extendSpacesUntilNewLines(): TextRange {
        var pos = this.end;
        if(pos>0) {
            var last = this.contents[pos-1];
            if(last == '\n') return this;
        }
        while(pos < this.contents.length-1) {
            var nextchar = this.contents[pos];
            if(nextchar != ' ' || nextchar == '\r' || nextchar == '\n') break;
            pos++;
        }
        return new TextRange(this.contents, this.start, pos);
    }

    extendToNewlines() {
        var pos = this.end;
        if(pos>0) {
            var last = this.contents[pos-1];
            if(last == '\n') return this;
        }
        while(pos < this.contents.length-1) {
            var nextchar = this.contents[pos];
            if(nextchar != '\r' && nextchar != '\n') break;
            pos++;
        }
        return new TextRange(this.contents, this.start, pos);
    }
    extendUntilNewlinesBack() {
        var pos = this.start;
        while(pos >0) {
            var nextchar = this.contents[pos-1];
            if(nextchar == '\r' || nextchar == '\n') break;
            pos--;
        }
        return new TextRange(this.contents, pos,this.end);
    }

    replace(text: string) {
        return this.sub(0, this.start) + text + this.sub(this.end, this.unitText().length);
    }

    remove() {
        return this.sub(0, this.start) + /*this.text() +*/ this.sub(this.end, this.unitText().length);
    }
}
