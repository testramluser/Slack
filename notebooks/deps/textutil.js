function isMultiLine(s) {
    return s && s.indexOf('\n') >= 0;
}
exports.isMultiLine = isMultiLine;
function trimStart(s) {
    if (!s)
        return s;
    var pos = 0;
    while (pos < s.length) {
        var ch = s[pos];
        if (ch != '\r' && ch != '\n' && ch != ' ' && ch != '\t')
            break;
        pos++;
    }
    return s.substring(pos, s.length);
}
exports.trimStart = trimStart;
function indent(lev, str) {
    if (str === void 0) { str = ''; }
    var leading = '';
    for (var i = 0; i < lev; i++)
        leading += '  ';
    return leading + str;
}
exports.indent = indent;
function replaceNewlines(s, rep) {
    if (rep === void 0) { rep = null; }
    var res = '';
    for (var i = 0; i < s.length; i++) {
        var ch = s[i];
        if (ch == '\r')
            ch = rep == null ? '\\r' : rep;
        if (ch == '\n')
            ch = rep == null ? '\\n' : rep;
        res += ch;
    }
    return res;
}
exports.replaceNewlines = replaceNewlines;
function trimEnd(s) {
    var pos = s.length;
    while (pos > 0) {
        var ch = s[pos - 1];
        if (ch != ' ' && ch != '\t')
            break;
        pos--;
    }
    return s.substring(0, pos);
}
exports.trimEnd = trimEnd;
function splitOnLines(text) {
    var lines = text.match(/^.*((\r\n|\n|\r)|$)/gm);
    return lines;
}
exports.splitOnLines = splitOnLines;
function makeMutiLine(s, lev) {
    var xbuf = '';
    if (isMultiLine(s)) {
        xbuf += '|\n';
        var lines = splitOnLines(s);
        for (var i = 0; i < lines.length; i++) {
            xbuf += indent(lev, lines[i]);
        }
    }
    else {
        xbuf += s;
    }
    return xbuf;
}
exports.makeMutiLine = makeMutiLine;
var TextRange = (function () {
    function TextRange(contents, start, end) {
        this.contents = contents;
        this.start = start;
        this.end = end;
    }
    TextRange.prototype.text = function () {
        return this.contents.substring(this.start, this.end);
    };
    TextRange.prototype.startpos = function () {
        return this.start;
    };
    TextRange.prototype.endpos = function () {
        return this.end;
    };
    TextRange.prototype.len = function () {
        return this.end - this.start;
    };
    TextRange.prototype.unitText = function () {
        return this.contents;
    };
    TextRange.prototype.withStart = function (start) {
        return new TextRange(this.contents, start, this.end);
    };
    TextRange.prototype.withEnd = function (end) {
        return new TextRange(this.contents, this.start, end);
    };
    TextRange.prototype.sub = function (start, end) {
        return this.contents.substring(start, end);
    };
    TextRange.prototype.extendToStartOfLine = function () {
        var pos = this.start;
        while (pos > 0) {
            var prevchar = this.contents[pos - 1];
            if (prevchar == '\r' || prevchar == '\n')
                break;
            pos--;
        }
        return new TextRange(this.contents, pos, this.end);
    };
    TextRange.prototype.trimStart = function () {
        var pos = this.start;
        while (pos < this.contents.length - 1) {
            var ch = this.contents[pos];
            if (ch != ' ' && ch != '\t')
                break;
            pos++;
        }
        return new TextRange(this.contents, pos, this.end);
    };
    TextRange.prototype.trimEnd = function () {
        var pos = this.end;
        while (pos > 0) {
            var ch = this.contents[pos - 1];
            if (ch != ' ' && ch != '\t')
                break;
            pos--;
        }
        return new TextRange(this.contents, this.end, pos);
    };
    TextRange.prototype.extendAnyUntilNewLines = function () {
        var pos = this.end;
        if (pos > 0) {
            var last = this.contents[pos - 1];
            if (last == '\n')
                return this;
        }
        while (pos < this.contents.length - 1) {
            var nextchar = this.contents[pos];
            if (nextchar == '\r' || nextchar == '\n')
                break;
            pos++;
        }
        return new TextRange(this.contents, this.start, pos);
    };
    TextRange.prototype.extendSpacesUntilNewLines = function () {
        var pos = this.end;
        if (pos > 0) {
            var last = this.contents[pos - 1];
            if (last == '\n')
                return this;
        }
        while (pos < this.contents.length - 1) {
            var nextchar = this.contents[pos];
            if (nextchar != ' ' || nextchar == '\r' || nextchar == '\n')
                break;
            pos++;
        }
        return new TextRange(this.contents, this.start, pos);
    };
    TextRange.prototype.extendToNewlines = function () {
        var pos = this.end;
        if (pos > 0) {
            var last = this.contents[pos - 1];
            if (last == '\n')
                return this;
        }
        while (pos < this.contents.length - 1) {
            var nextchar = this.contents[pos];
            if (nextchar != '\r' && nextchar != '\n')
                break;
            pos++;
        }
        return new TextRange(this.contents, this.start, pos);
    };
    TextRange.prototype.extendUntilNewlinesBack = function () {
        var pos = this.start;
        while (pos > 0) {
            var nextchar = this.contents[pos - 1];
            if (nextchar == '\r' || nextchar == '\n')
                break;
            pos--;
        }
        return new TextRange(this.contents, pos, this.end);
    };
    TextRange.prototype.replace = function (text) {
        return this.sub(0, this.start) + text + this.sub(this.end, this.unitText().length);
    };
    TextRange.prototype.remove = function () {
        return this.sub(0, this.start) + this.sub(this.end, this.unitText().length);
    };
    return TextRange;
})();
exports.TextRange = TextRange;
//# sourceMappingURL=textutil.js.map