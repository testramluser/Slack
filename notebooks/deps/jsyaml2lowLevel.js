var yaml = require('./yamlAST');
var lowlevel = require('./lowLevelAST');
var path = require("path");
var fs = require("fs");
var parser = require('./js-yaml');
var dumper = require('./dumper');
var Error = require('./exception');
var textutil = require('./textutil');
var MarkupIndentingBuffer = (function () {
    function MarkupIndentingBuffer(indent) {
        this.text = '';
        this.indent = indent;
    }
    MarkupIndentingBuffer.prototype.isLastNL = function () {
        return this.text.length > 0 && this.text[this.text.length - 1] == '\n';
    };
    MarkupIndentingBuffer.prototype.addWithIndent = function (lev, s) {
        if (this.isLastNL()) {
            this.text += textutil.indent(lev);
            this.text += this.indent;
        }
        this.text += s;
    };
    MarkupIndentingBuffer.prototype.addChar = function (ch) {
        if (this.isLastNL()) {
            this.text += this.indent;
        }
        this.text += ch;
    };
    MarkupIndentingBuffer.prototype.append = function (s) {
        for (var i = 0; i < s.length; i++) {
            this.addChar(s[i]);
        }
    };
    return MarkupIndentingBuffer;
})();
exports.MarkupIndentingBuffer = MarkupIndentingBuffer;
var CompilationUnit = (function () {
    function CompilationUnit(_path, _content, _tl, _project, _apath) {
        this._path = _path;
        this._content = _content;
        this._tl = _tl;
        this._project = _project;
        this._apath = _apath;
        this.errors = [];
    }
    CompilationUnit.prototype.isDirty = function () {
        return false;
    };
    CompilationUnit.prototype.absolutePath = function () {
        return this._apath;
    };
    CompilationUnit.prototype.isRAMLUnit = function () {
        var en = path.extname(this._path);
        return en == '.raml' || en == '.yaml';
    };
    CompilationUnit.prototype.contents = function () {
        return this._content;
    };
    CompilationUnit.prototype.resolve = function (p) {
        var unit = this._project.resolve(this._path, p);
        return unit;
    };
    CompilationUnit.prototype.path = function () {
        return this._path;
    };
    CompilationUnit.prototype.lexerErrors = function () {
        return this.errors;
    };
    CompilationUnit.prototype.ast = function () {
        if (this._node) {
            return this._node;
        }
        try {
            var result = parser.load(this._content, {});
            this.errors = result.errors;
            this._node = new ASTNode(result, this, null, null, null);
            this._node._errors = this.errors;
            return this._node;
        }
        catch (e) {
            console.log(this._content);
            console.log(e);
            this._node = null;
            return this._node;
        }
    };
    CompilationUnit.prototype.isTopLevel = function () {
        return this._tl;
    };
    CompilationUnit.prototype.updateContent = function (n) {
        this._content = n;
        this._node = null;
    };
    CompilationUnit.prototype.updateContentSafe = function (n) {
        this._content = n;
    };
    CompilationUnit.prototype.project = function () {
        return this._project;
    };
    CompilationUnit.prototype.ramlVersion = function () {
        var ind = this._content.indexOf('#%RAML');
        if (ind < 0) {
            return 'unknown';
        }
        ind += '#%RAML'.length;
        var ind1 = this._content.indexOf('\n', ind);
        if (ind1 < 0) {
            ind1 = this._content.length;
        }
        var ramlVersion = this._content.substring(ind, ind1).trim();
        return ramlVersion;
    };
    return CompilationUnit;
})();
exports.CompilationUnit = CompilationUnit;
var FSResolver = (function () {
    function FSResolver() {
    }
    FSResolver.prototype.content = function (path) {
        if (!fs.existsSync(path)) {
            return null;
        }
        try {
            return fs.readFileSync(path).toString();
        }
        catch (e) {
            return null;
        }
    };
    FSResolver.prototype.list = function (path) {
        return fs.readdirSync(path);
    };
    return FSResolver;
})();
exports.FSResolver = FSResolver;
function copyNode(n) {
    if (n == null) {
        return null;
    }
    switch (n.kind) {
        case yaml.Kind.SCALAR:
            return {
                errors: [],
                startPosition: n.startPosition,
                endPosition: n.endPosition,
                value: n.value,
                kind: yaml.Kind.SCALAR,
                parent: n.parent
            };
        case yaml.Kind.MAPPING:
            var map = n;
            return {
                errors: [],
                key: copyNode(map.key),
                value: copyNode(map.value),
                startPosition: map.startPosition,
                endPosition: map.endPosition,
                kind: yaml.Kind.MAPPING,
                parent: map.parent
            };
        case yaml.Kind.MAP:
            var ymap = n;
            return {
                errors: [],
                startPosition: n.startPosition,
                endPosition: n.endPosition,
                mappings: ymap.mappings.map(function (x) { return copyNode(x); }),
                kind: yaml.Kind.MAP,
                parent: ymap.parent
            };
    }
    return n;
}
var innerShift = function (offset, yaNode, shift) {
    if (!yaNode)
        return;
    if (yaNode.startPosition >= offset) {
        yaNode.startPosition += shift;
    }
    if (yaNode.endPosition > offset) {
        yaNode.endPosition += shift;
    }
    if (yaNode.kind == yaml.Kind.MAPPING) {
        var m = yaNode;
        innerShift(offset, m.key, shift);
        innerShift(offset, m.value, shift);
    }
};
function splitOnLines(text) {
    var lines = text.match(/^.*((\r\n|\n|\r)|$)/gm);
    return lines;
}
function stripIndent(text, indent) {
    var lines = splitOnLines(text);
    var rs = [];
    for (var i = 0; i < lines.length; i++) {
        if (i == 0) {
            rs.push(lines[0]);
        }
        else {
            rs.push(lines[i].substring(indent.length));
        }
    }
    return rs.join("");
}
var leadingIndent = function (node, text) {
    var leading = "";
    var pos = node.start() - 1;
    while (pos > 0) {
        var ch = text[pos];
        if (ch == '\r' || ch == '\n')
            break;
        leading = ch + leading;
        pos--;
    }
    return leading;
};
function indent(line) {
    var rs = "";
    for (var i = 0; i < line.length; i++) {
        var c = line[i];
        if (c == '\r' || c == '\n') {
            continue;
        }
        if (c == ' ' || c == '\t') {
            rs += c;
            continue;
        }
        break;
    }
    return rs;
}
function indentLines(s, indent) {
    return s.split("\n").map(function (x) {
        if (x.trim().length == 0) {
            return x;
        }
        return indent + x;
    }).join("\n");
}
function extraIndent(text, indent) {
    var lines = splitOnLines(text);
    var rs = [];
    for (var i = 0; i < lines.length; i++) {
        if (i == 0) {
            rs.push(lines[0]);
        }
        else {
            if (lines[i].trim().length > 0) {
                rs.push(indent + lines[i]);
            }
            else {
                rs.push("");
            }
        }
    }
    return rs.join("");
}
var Project = (function () {
    function Project(rootPath, resolver) {
        if (resolver === void 0) { resolver = new FSResolver(); }
        this.rootPath = rootPath;
        this.resolver = resolver;
        this.listeners = [];
        this.tlisteners = [];
        this.pathToUnit = {};
    }
    Project.prototype.resolve = function (unitPath, pathInUnit) {
        if (unitPath.charAt(0) == '/') {
            unitPath = unitPath.substr(1);
        }
        if (pathInUnit.charAt(0) != '.') {
            return this.unit(pathInUnit);
        }
        var absPath = path.resolve(path.dirname(path.resolve(this.rootPath, unitPath)), pathInUnit);
        return this.unit(absPath, true);
    };
    Project.prototype.units = function () {
        var _this = this;
        var names = this.resolver.list(this.rootPath).filter(function (x) { return path.extname(x) == '.raml'; });
        return names.map(function (x) { return _this.unit(x); }).filter(function (y) { return y.isTopLevel(); });
    };
    Project.prototype.unit = function (p, absolute) {
        if (absolute === void 0) { absolute = false; }
        if (this.pathToUnit[p]) {
            return this.pathToUnit[p];
        }
        if (p.charAt(0) == '/' && !absolute) {
            p = p.substr(1);
        }
        var apath = absolute ? p : path.resolve(this.rootPath, p);
        var cnt = this.resolver.content(apath);
        var cnt = this.resolver.content(path.resolve(this.rootPath, p));
        if (cnt == null) {
            return null;
        }
        var tl = (cnt.indexOf("#%RAML") == 0);
        var unit = new CompilationUnit(p, cnt, tl, this, apath);
        this.pathToUnit[p] = unit;
        return unit;
    };
    Project.prototype.visualizeNewlines = function (s) {
        var res = '';
        for (var i = 0; i < s.length; i++) {
            var ch = s[i];
            if (ch == '\r')
                ch = '\\r';
            if (ch == '\n')
                ch = '\\n';
            res += ch;
        }
        return res;
    };
    Project.prototype.indent = function (node) {
        var text = node.unit().contents();
        if (node == node.root())
            return '';
        var leading = leadingIndent(node, text);
        var dmp = splitOnLines(node.dump());
        if (dmp.length > 1) {
            if (dmp[1].trim().length > 0) {
                var extra = indent(dmp[1]);
                return leading + extra;
            }
        }
        return leading + '  ';
    };
    Project.prototype.startIndent = function (node) {
        var text = node.unit().contents();
        if (node == node.root())
            return '';
        var dmp = splitOnLines(node.dump());
        if (dmp.length > 0) {
            console.log('FIRST: ' + dmp[0]);
            var extra = indent(dmp[0]);
            return extra + '  ';
        }
        return '';
    };
    Project.prototype.canWriteInOneLine = function (node) {
        return false;
    };
    Project.prototype.isOneLine = function (node) {
        return node.text().indexOf('\n') < 0;
    };
    Project.prototype.recalcPositionsUp = function (target) {
        var np = target;
        while (np) {
            np.recalcEndPositionFromChilds();
            np = np.parent();
        }
    };
    Project.prototype.add2 = function (target, node, toSeq, point, json) {
        if (json === void 0) { json = false; }
        var unit = target.unit();
        var range = new textutil.TextRange(unit.contents(), node.start(), node.end());
        var targetRange = new textutil.TextRange(unit.contents(), target.start(), target.end());
        var unitText = target.unit().contents();
        var originalIndent = this.indent(target);
        var xindent = originalIndent;
        var indentLength = originalIndent.length;
        if (toSeq) {
            xindent = xindent + "  ";
            indentLength += 2;
        }
        var buf = new MarkupIndentingBuffer(xindent);
        node.markupNode(buf, node._actualNode(), 0, json);
        var text = buf.text;
        if (toSeq) {
            text = originalIndent + '- ' + text;
        }
        else {
            text = originalIndent + text;
        }
        var pos = target.end();
        if (point) {
            if (point != target) {
                pos = point.end();
            }
            else {
                pos = target.keyEnd() + 1;
                pos = new textutil.TextRange(unitText, pos, pos).extendAnyUntilNewLines().endpos();
            }
        }
        var insertionRange = new textutil.TextRange(unitText, 0, pos);
        pos = insertionRange.extendToNewlines().endpos();
        if (pos > 0 && unitText[pos - 1] != '\n') {
            text = "\n" + text;
            indentLength++;
        }
        var newtext = unitText.substring(0, pos) + text + unitText.substring(pos, unitText.length);
        var cu = unit;
        cu.updateContentSafe(newtext);
        target.root().shiftNodes(pos, node.end() - node.start() + indentLength);
        if (point) {
            var childs = target.children();
            var index = -1;
            for (var i = 0; i < childs.length; i++) {
                var x = childs[i];
                if (x.start() == point.start() && x.end() == point.end()) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                target.addChild(node, index + 1);
            }
            else {
                target.addChild(node);
            }
        }
        else {
            target.addChild(node);
        }
        node.shiftNodes(0, pos + indentLength);
        this.recalcPositionsUp(target);
        node.setUnit(target.unit());
        node.visit(function (n) {
            var node = n;
            node.setUnit(target.unit());
            return true;
        });
    };
    Project.prototype.findInsertionPoint = function () {
    };
    Project.prototype.isYamlMap = function (node) {
        if (!node.isMap())
            return false;
        var text = node.text().trim();
        return text.length >= 2 && text[0] == '{' && text[text.length - 1] == '}';
    };
    Project.prototype.remove = function (unit, target, node) {
        var parent = node.parent();
        node._oldText = node.dump();
        var range = new textutil.TextRange(unit.contents(), node.start(), node.end());
        var targetRange = new textutil.TextRange(unit.contents(), target.start(), target.end());
        var parentRange = new textutil.TextRange(unit.contents(), parent.start(), parent.end());
        if (this.isOneLine(node) && node.kind() == yaml.Kind.MAPPING && node.parent().kind() == yaml.Kind.MAP) {
            var mapnode = node.parent();
            if (mapnode.asMap().mappings.length == 1) {
                this.remove(unit, mapnode.parent(), mapnode);
                return;
            }
        }
        if (target.kind() == yaml.Kind.MAPPING) {
            var mapping = target._actualNode();
            var map = mapping.value;
            var size = map.mappings.length;
            if (false && size == 1 && parent.parent()) {
                var parentMapNode = target.parentOfKind(yaml.Kind.MAP);
                if (map) {
                    this.remove(unit, parentMapNode, target);
                }
                return;
            }
        }
        var originalStartPos = range.startpos();
        if (target.kind() == yaml.Kind.SEQ) {
            range = range.extendToStartOfLine().extendAnyUntilNewLines().extendToNewlines();
        }
        if (target.kind() == yaml.Kind.MAP) {
            range = range.extendAnyUntilNewLines();
            range = range.extendToNewlines();
            range = range.extendToStartOfLine().extendUntilNewlinesBack();
        }
        if (target.kind() == yaml.Kind.MAPPING) {
            if (this.isYamlMap(node) && this.isOneLine(node)) {
            }
            else {
                range = range.extendSpacesUntilNewLines();
                range = range.extendToNewlines();
                range = range.extendToStartOfLine().extendUntilNewlinesBack();
            }
        }
        var cu = unit;
        cu.updateContentSafe(range.remove());
        node.parent().removeChild(node);
        var shift = -range.len();
        target.root().shiftNodes(originalStartPos, shift);
        this.recalcPositionsUp(target);
    };
    Project.prototype.changeKey = function (unit, attr, newval) {
        var range = new textutil.TextRange(attr.unit().contents(), attr.keyStart(), attr.keyEnd());
        if (attr.kind() == yaml.Kind.MAPPING) {
            var sc = attr._actualNode().key;
            sc.value = newval;
        }
        var cu = unit;
        var newtext = range.replace(newval);
        cu.updateContentSafe(newtext);
        var shift = newval.length - range.len();
        attr.root().shiftNodes(range.startpos(), shift);
        this.recalcPositionsUp(attr);
    };
    Project.prototype.changeValue = function (unit, attr, newval) {
        var range = new textutil.TextRange(attr.unit().contents(), attr.start(), attr.end());
        var newNodeText;
        var indent = 0;
        var replacer = null;
        var mapping = null;
        if (attr.kind() == yaml.Kind.SCALAR) {
            if (typeof newval == 'string') {
                attr.asScalar().value = newval;
                newNodeText = newval;
            }
            else {
                throw "not implemented";
            }
        }
        else if (attr.kind() == yaml.Kind.MAPPING) {
            mapping = attr.asMapping();
            range = mapping.value ? range.withStart(attr.valueStart()).withEnd(attr.valueEnd()) : range.withStart(attr.keyEnd() + 1).withEnd(attr.keyEnd() + 1);
            if (newval == null) {
                newNodeText = '';
                mapping.value = null;
            }
            else if (typeof newval == 'string' || newval == null) {
                var newstr = newval;
                var ind = this.indent(attr);
                if (newstr && textutil.isMultiLine(newstr)) {
                    newstr = '' + textutil.makeMutiLine(newstr, ind.length / 2);
                }
                newNodeText = newstr;
                var valueNode = null;
                if (!mapping.value) {
                    mapping.value = yaml.newScalar(newstr);
                }
                else if (mapping.value.kind == yaml.Kind.SEQ) {
                    valueNode = mapping.value.items[0];
                }
                else if (mapping.value.kind == yaml.Kind.SCALAR) {
                    valueNode = mapping.value;
                }
                if (valueNode) {
                    valueNode.value = newstr;
                }
            }
            else {
                var n = newval;
                var buf = new MarkupIndentingBuffer('');
                n.markupNode(buf, n._actualNode(), 0, true);
                newNodeText = ' ' + buf.text + '';
                indent++;
                n.shiftNodes(0, range.startpos() + indent);
                replacer = n;
            }
        }
        else {
            console.log('Unsupported change value case: ' + attr.kindName());
        }
        var cu = unit;
        var newtext = range.replace(newNodeText);
        cu.updateContentSafe(newtext);
        var shift = newNodeText.length - range.len();
        attr.root().shiftNodes(range.endpos() + indent, shift);
        if (replacer) {
            mapping.value = replacer._actualNode();
        }
        this.recalcPositionsUp(attr);
    };
    Project.prototype.execute = function (cmd) {
        var _this = this;
        cmd.commands.forEach(function (x) {
            switch (x.kind) {
                case lowlevel.CommandKind.CHANGE_VALUE:
                    var attr = x.target;
                    var curval = attr.value();
                    if (!curval) {
                        curval = "";
                    }
                    var newval = x.value;
                    if (typeof curval == 'string' && typeof newval == 'string') {
                        _this.changeValue(attr.unit(), attr, newval);
                    }
                    else if (typeof curval == 'string' && typeof newval != 'string') {
                        _this.changeValue(attr.unit(), attr, null);
                        _this.changeValue(attr.unit(), attr, newval);
                    }
                    else if (typeof curval != 'string' && typeof newval == 'string') {
                        var newstr = x.value;
                        if (curval.kind() == yaml.Kind.MAPPING) {
                            if (!textutil.isMultiLine(newstr)) {
                                _this.changeKey(attr.unit(), curval, newstr);
                            }
                            else {
                                attr.children().forEach(function (n) {
                                    _this.remove(attr.unit(), attr, n);
                                });
                                _this.changeValue(attr.unit(), attr, newstr);
                            }
                        }
                        else {
                            throw 'unsupported case: attribute value conversion: ' + (typeof curval) + ' ==> ' + (typeof newval) + ' not supported';
                        }
                    }
                    else if (typeof curval != 'string' && typeof newval != 'string') {
                        var node = newval;
                        var map = node.asMap();
                        attr.children().forEach(function (n) {
                            _this.remove(attr.unit(), attr, n);
                        });
                        node.children().forEach(function (m) {
                        });
                        _this.changeValue(attr.unit(), attr, newval);
                    }
                    else {
                        throw "shouldn't be this case: attribute value conversion " + (typeof curval) + ' ==> ' + (typeof newval) + ' not supported';
                    }
                    return;
                case lowlevel.CommandKind.CHANGE_KEY:
                    var attr = x.target;
                    _this.changeKey(attr.unit(), attr, x.value);
                    return;
                case lowlevel.CommandKind.ADD_CHILD:
                    var attr = x.target;
                    var newValueNode = x.value;
                    _this.add2(attr, newValueNode, x.toSeq, x.insertionPoint);
                    return;
                case lowlevel.CommandKind.REMOVE_CHILD:
                    var target = x.target;
                    var node = x.value;
                    _this.remove(target.unit(), target, node);
                    return;
                default:
                    console.log('UNSUPPORTED COMMAND: ' + lowlevel.CommandKind[x.kind]);
                    return;
            }
        });
    };
    Project.prototype.replaceYamlNode = function (target, newNodeContent, offset, shift, unit) {
        var newYamlNode = parser.load(newNodeContent, {});
        this.updatePositions(target.start(), newYamlNode);
        target.root().shiftNodes(offset, shift);
        var targetParent = target.parent();
        var targetYamlNode = target._actualNode();
        var parent = targetYamlNode.parent;
        newYamlNode.parent = parent;
        if (targetParent && targetParent.kind() == yaml.Kind.MAP) {
            var targetParentMapNode = targetParent._actualNode();
            targetParentMapNode.mappings = targetParentMapNode.mappings.map(function (x) {
                if (x != targetYamlNode) {
                    return x;
                }
                return newYamlNode;
            });
        }
        target.updateFrom(newYamlNode);
        this.recalcPositionsUp(target);
    };
    Project.prototype.executeTextChange2 = function (textCommand) {
        var cu = textCommand.unit;
        var unitText = cu.contents();
        var target = textCommand.target;
        if (target) {
            var cnt = unitText.substring(target.start(), target.end());
            var original = unitText;
            unitText = unitText.substr(0, textCommand.offset) + textCommand.text + unitText.substr(textCommand.offset + textCommand.replacementLength);
            var newNodeContent = cnt.substr(0, textCommand.offset - target.start()) + textCommand.text + cnt.substr(textCommand.offset - target.start() + textCommand.replacementLength);
            cu.updateContentSafe(unitText);
            if (textCommand.offset > target.start()) {
                try {
                    var shift = textCommand.text.length - textCommand.replacementLength;
                    var offset = textCommand.offset;
                    target.unit().project().replaceYamlNode(target, newNodeContent, offset, shift, textCommand.unit);
                }
                catch (e) {
                    console.log('New node contents (causes error below): \n' + newNodeContent);
                    console.log('Reparse error: ' + e.stack);
                }
            }
        }
        else {
            unitText = unitText.substr(0, textCommand.offset) + textCommand.text + unitText.substr(textCommand.offset + textCommand.replacementLength);
        }
        cu.updateContent(unitText);
        this.listeners.forEach(function (x) {
            x(null);
        });
        this.tlisteners.forEach(function (x) {
            x(textCommand);
        });
    };
    Project.prototype.executeTextChange = function (textCommand) {
        var l0 = new Date().getTime();
        try {
            var oc = textCommand.unit.contents();
            var target = textCommand.target;
            if (target == null) {
                target = this.findNode(textCommand.unit.ast(), textCommand.offset, textCommand.offset + textCommand.replacementLength);
            }
            var cu = textCommand.unit;
            if (target) {
                var cnt = oc.substring(target.start(), target.end());
                var original = oc;
                oc = oc.substr(0, textCommand.offset) + textCommand.text + oc.substr(textCommand.offset + textCommand.replacementLength);
                var newNodeContent = cnt.substr(0, textCommand.offset - target.start()) + textCommand.text + cnt.substr(textCommand.offset - target.start() + textCommand.replacementLength);
                cu.updateContentSafe(oc);
                var hasNewLines = breaksTheLine(original, textCommand);
                if (textCommand.offset > target.start()) {
                    try {
                        var newYamlNode = parser.load(newNodeContent, {});
                        this.updatePositions(target.start(), newYamlNode);
                        var shift = textCommand.text.length - textCommand.replacementLength;
                        textCommand.unit.ast().shiftNodes(textCommand.offset, shift);
                        if (newYamlNode != null && newYamlNode.kind == yaml.Kind.MAP) {
                            var actualResult = newYamlNode.mappings[0];
                            var targetYamlNode = target._actualNode();
                            var parent = targetYamlNode.parent;
                            var cmd = new lowlevel.ASTDelta();
                            var unit = textCommand.unit;
                            cmd.commands = [
                                new lowlevel.ASTChangeCommand(lowlevel.CommandKind.CHANGE_VALUE, new ASTNode(copyNode(targetYamlNode), unit, null, null, null), new ASTNode(actualResult, unit, null, null, null), 0)
                            ];
                            if (parent && parent.kind == yaml.Kind.MAP) {
                                var map = parent;
                                map.mappings = map.mappings.map(function (x) {
                                    if (x != targetYamlNode) {
                                        return x;
                                    }
                                    return actualResult;
                                });
                            }
                            actualResult.parent = parent;
                            this.recalcPositionsUp(target);
                            target.updateFrom(actualResult);
                            this.listeners.forEach(function (x) {
                                x(cmd);
                            });
                            this.tlisteners.forEach(function (x) {
                                x(textCommand);
                            });
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
            var t2 = new Date().getTime();
            cu.updateContent(oc);
            this.listeners.forEach(function (x) {
                x(null);
            });
            this.tlisteners.forEach(function (x) {
                x(textCommand);
            });
        }
        finally {
            var t2 = new Date().getTime();
        }
    };
    Project.prototype.updatePositions = function (offset, n) {
        var _this = this;
        if (n == null) {
            return;
        }
        if (n.startPosition == -1) {
            n.startPosition = offset;
        }
        else {
            n.startPosition = offset + n.startPosition;
        }
        n.endPosition = offset + n.endPosition;
        switch (n.kind) {
            case yaml.Kind.MAP:
                var m = n;
                m.mappings.forEach(function (x) { return _this.updatePositions(offset, x); });
                break;
            case yaml.Kind.MAPPING:
                var ma = n;
                this.updatePositions(offset, ma.key);
                this.updatePositions(offset, ma.value);
                break;
            case yaml.Kind.SCALAR:
                break;
            case yaml.Kind.SEQ:
                var s = n;
                s.items.forEach(function (x) { return _this.updatePositions(offset, x); });
                break;
        }
    };
    Project.prototype.findNode = function (n, offset, end) {
        var _this = this;
        if (n == null) {
            return null;
        }
        var node = n;
        if (n.start() <= offset && n.end() >= end) {
            var res = n;
            node.directChildren().forEach(function (x) {
                var m = _this.findNode(x, offset, end);
                if (m) {
                    res = m;
                }
            });
            return res;
        }
        return null;
    };
    Project.prototype.addTextChangeListener = function (listener) {
        this.tlisteners.push(listener);
    };
    Project.prototype.removeTextChangeListener = function (listener) {
        this.tlisteners = this.tlisteners.filter(function (x) { return x != listener; });
    };
    Project.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };
    Project.prototype.removeListener = function (listener) {
        this.listeners = this.listeners.filter(function (x) { return x != listener; });
    };
    return Project;
})();
exports.Project = Project;
function breaksTheLine(oc, textCommand) {
    var oldText = oc.substr(textCommand.offset, textCommand.replacementLength);
    if (oldText.indexOf('\n') != -1) {
        return true;
    }
    if (textCommand.text.indexOf('\n') != -1) {
        return true;
    }
}
var ASTNode = (function () {
    function ASTNode(_node, _unit, _parent, _anchor, _include, cacheChildren) {
        if (cacheChildren === void 0) { cacheChildren = false; }
        this._node = _node;
        this._unit = _unit;
        this._parent = _parent;
        this._anchor = _anchor;
        this._include = _include;
        this.cacheChildren = cacheChildren;
        this._errors = [];
        if (_node == null) {
            console.log("null");
        }
    }
    ASTNode.prototype.yamlNode = function () {
        return this._node;
    };
    ASTNode.prototype.setHighLevelParseResult = function (highLevelParseResult) {
        this._highLevelParseResult = highLevelParseResult;
    };
    ASTNode.prototype.highLevelParseResult = function () {
        return this._highLevelParseResult;
    };
    ASTNode.prototype.setHighLevelNode = function (highLevel) {
        this._highLevelNode = highLevel;
    };
    ASTNode.prototype.highLevelNode = function () {
        return this._highLevelNode;
    };
    ASTNode.prototype.start = function () {
        return this._node.startPosition;
    };
    ASTNode.prototype.errors = function () {
        return this._errors;
    };
    ASTNode.prototype.parent = function () {
        return this._parent;
    };
    ASTNode.prototype.recalcEndPositionFromChilds = function () {
        var childs = this.children();
        if (this.children().length == 0)
            return;
        var max = 0;
        var last = this.children()[this.children().length - 1];
        this._node.endPosition = last._node.endPosition;
    };
    ASTNode.prototype.isValueLocal = function () {
        if (this._node.kind == yaml.Kind.MAPPING) {
            var knd = this._node.value.kind;
            return knd != yaml.Kind.INCLUDE_REF && knd != yaml.Kind.ANCHOR_REF;
        }
        return true;
    };
    ASTNode.prototype.keyStart = function () {
        if (this._node.kind == yaml.Kind.MAPPING) {
            return this._node.key.startPosition;
        }
        return -1;
    };
    ASTNode.prototype.keyEnd = function () {
        if (this._node.kind == yaml.Kind.MAPPING) {
            return this._node.key.endPosition;
        }
        return -1;
    };
    ASTNode.prototype.valueStart = function () {
        if (this._node.kind == yaml.Kind.MAPPING) {
            return this.asMapping().value.startPosition;
        }
        return -1;
    };
    ASTNode.prototype.valueEnd = function () {
        if (this._node.kind == yaml.Kind.MAPPING) {
            var mn = this.asMapping();
            return mn.value.endPosition;
        }
        return -1;
    };
    ASTNode.prototype.end = function () {
        return this._node.endPosition;
    };
    ASTNode.prototype.dump = function () {
        if (this._oldText) {
            return this._oldText;
        }
        if (this._unit && this._node.startPosition > 0 && this._node.endPosition > 0) {
            var originalText = this._unit.contents().substring(this._node.startPosition, this._node.endPosition);
            originalText = stripIndent(originalText, leadingIndent(this, this._unit.contents()));
            return originalText;
        }
        return dumper.dump(this.dumpToObject(), {});
    };
    ASTNode.prototype.dumpToObject = function () {
        return this.dumpNode(this._node);
    };
    ASTNode.prototype.dumpNode = function (n) {
        var _this = this;
        if (!n) {
            return null;
        }
        if (n.kind == yaml.Kind.SEQ) {
            var seq = n;
            var arr = [];
            seq.items.forEach(function (x) { return arr.push(_this.dumpNode(x)); });
            return arr;
        }
        if (n.kind == yaml.Kind.MAPPING) {
            var c = n;
            var v = {};
            var val = c.value;
            var mm = this.dumpNode(val);
            v["" + this.dumpNode(c.key)] = mm;
            return v;
        }
        if (n.kind == yaml.Kind.SCALAR) {
            var s = n;
            return s.value;
        }
        if (n.kind == yaml.Kind.MAP) {
            var map = n;
            var res = {};
            if (map.mappings.length == 1) {
                if (map.mappings[0].key.value == 'value') {
                    return this.dumpNode(map.mappings[0].value);
                }
            }
            if (map.mappings) {
                map.mappings.forEach(function (x) {
                    var ms = _this.dumpNode(x.value);
                    if (ms == null) {
                        ms = "!$$$novalue";
                    }
                    if ((ms + "").length > 0) {
                        res[_this.dumpNode(x.key) + ""] = ms;
                    }
                });
            }
            return res;
        }
    };
    ASTNode.prototype._actualNode = function () {
        return this._node;
    };
    ASTNode.prototype.execute = function (cmd) {
        if (this.unit()) {
            this.unit().project().execute(cmd);
        }
        else {
            cmd.commands.forEach(function (x) {
                switch (x.kind) {
                    case lowlevel.CommandKind.CHANGE_VALUE:
                        var attr = x.target;
                        var newValue = x.value;
                        var va = attr._actualNode();
                        var as = attr.start();
                        if (va.kind == yaml.Kind.MAPPING) {
                            va.value = yaml.newScalar("" + newValue);
                        }
                        return;
                    case lowlevel.CommandKind.CHANGE_KEY:
                        var attr = x.target;
                        var newValue = x.value;
                        var va = attr._actualNode();
                        if (va.kind == yaml.Kind.MAPPING) {
                            var sc = va.key;
                            sc.value = newValue;
                        }
                        return;
                }
            });
        }
    };
    ASTNode.prototype.updateFrom = function (n) {
        this._node = n;
    };
    ASTNode.prototype.value = function () {
        if (!this._node) {
            return "";
        }
        if (this._node.kind == yaml.Kind.SCALAR) {
            return this._node['value'];
        }
        if (this._node.kind == yaml.Kind.ANCHOR_REF) {
            var ref = this._node;
            return new ASTNode(ref.value, this._unit, this, null, null).value();
        }
        if (this._node.kind == yaml.Kind.MAPPING) {
            var map = this._node;
            if (map.value == null) {
                return null;
            }
            return new ASTNode(map.value, this._unit, this, null, null).value();
        }
        if (this._node.kind == yaml.Kind.INCLUDE_REF) {
            var includePath = this._node['value'];
            var resolved = this._unit.resolve(includePath);
            if (resolved == null) {
                return "can not resolve " + includePath;
            }
            if (resolved.isRAMLUnit()) {
                return null;
            }
            return resolved.contents();
        }
        if (this._node.kind == yaml.Kind.MAP) {
            var amap = this._node;
            if (amap.mappings.length == 1) {
                return new ASTNode(amap.mappings[0], this._unit, this, null, null);
            }
        }
        if (this._node.kind == yaml.Kind.SEQ) {
            var aseq = this._node;
            if (aseq.items.length == 1 && true) {
                return new ASTNode(aseq.items[0], this._unit, this, null, null).value();
            }
        }
        return null;
    };
    ASTNode.prototype.visit = function (v) {
        this.children().forEach(function (x) {
            if (v(x)) {
                x.visit(v);
            }
        });
    };
    ASTNode.prototype.key = function () {
        if (!this._node) {
            return "";
        }
        if (this._node.kind == yaml.Kind.MAPPING) {
            var map = this._node;
            return map.key.value;
        }
        return null;
    };
    ASTNode.prototype.addChild = function (n, pos) {
        if (pos === void 0) { pos = -1; }
        var node = n;
        this._oldText = null;
        if (this.isMap()) {
            var map = this.asMap();
            if (map.mappings == null || map.mappings == undefined) {
                map.mappings = [];
            }
            if (pos >= 0) {
                map.mappings.splice(pos, 0, node.asMapping());
            }
            else {
                map.mappings.push(node.asMapping());
            }
        }
        else if (this.isMapping()) {
            var mapping = this.asMapping();
            var val = mapping.value;
            if (!mapping.value && node.isMap()) {
                mapping.value = node._actualNode();
                return;
            }
            if (!val) {
                val = yaml.newMap();
                mapping.value = val;
            }
            if (val.kind == yaml.Kind.MAP) {
                var map = val;
                if (map.mappings == null || map.mappings == undefined) {
                    map.mappings = [];
                }
                if (pos >= 0) {
                    map.mappings.splice(pos, 0, node.asMapping());
                }
                else {
                    map.mappings.push(node.asMapping());
                }
            }
            else if (val.kind == yaml.Kind.SEQ) {
                var seq = val;
                if (pos >= 0) {
                    seq.items.splice(pos, 0, node._actualNode());
                }
                else {
                    seq.items.push(node._actualNode());
                }
            }
            else {
                throw "Insert into map with " + yaml.Kind[mapping.value.kind] + " value not supported";
            }
        }
        else if (this.isSeq()) {
            var seq = this.asSeq();
            if (pos >= 0) {
                seq.items.splice(pos, 0, node._actualNode());
            }
            else {
                seq.items.push(node._actualNode());
            }
        }
        else {
            throw "Insert into " + this.kindName() + " not supported";
        }
    };
    ASTNode.prototype.removeChild = function (n) {
        this._oldText = null;
        var node = n;
        var ynode;
        var index;
        if (this.kind() == yaml.Kind.SEQ) {
            var seq = this.asSeq();
            ynode = node._node;
            index = seq.items.indexOf(ynode);
            if (index > -1)
                seq.items.splice(index, 1);
        }
        else if (this.kind() == yaml.Kind.MAP) {
            var map = this.asMap();
            ynode = node.asMapping();
            index = map.mappings.indexOf(ynode);
            if (index > -1)
                map.mappings.splice(index, 1);
        }
        else if (this.kind() == yaml.Kind.MAPPING) {
            var mapping = this.asMapping();
            if (node._actualNode() == mapping.value) {
                mapping.value = null;
            }
            else {
                var map = (mapping.value);
                ynode = node.asMapping();
                if (map && map.mappings) {
                    index = map.mappings.indexOf(ynode);
                    if (index > -1)
                        map.mappings.splice(index, 1);
                }
            }
        }
        else {
            throw "Delete from " + yaml.Kind[this.kind()] + " unsupported";
        }
    };
    ASTNode.prototype.includeErrors = function () {
        if (this._node.kind == yaml.Kind.MAPPING) {
            var mapping = this._node;
            if (mapping.value == null) {
                return [];
            }
            return new ASTNode(mapping.value, this._unit, this, this._anchor, this._include).includeErrors();
        }
        var rs = [];
        if (this._node.kind == yaml.Kind.INCLUDE_REF) {
            var mapping = this._node;
            if (mapping.value == null) {
                return [];
            }
            var includePath = this.includePath();
            var resolved = this._unit.resolve(includePath);
            if (resolved == null) {
                rs.push("Can not resolve " + includePath);
                return rs;
            }
            if (resolved.isRAMLUnit()) {
                var ast = resolved.ast();
                if (ast) {
                    return [];
                }
                else {
                    rs.push("" + includePath + " can not be parsed");
                }
            }
        }
        return rs;
    };
    ASTNode.prototype.children = function (inc, anc, inOneMemberMap) {
        var _this = this;
        if (inc === void 0) { inc = null; }
        if (anc === void 0) { anc = null; }
        if (inOneMemberMap === void 0) { inOneMemberMap = true; }
        if (this._node == null) {
            return [];
        }
        if (this.cacheChildren && this._children) {
            return this._children;
        }
        var result;
        var kind = this._node.kind;
        if (kind == yaml.Kind.SCALAR) {
            result = [];
        }
        else if (kind == yaml.Kind.MAP) {
            var map = this._node;
            if (map.mappings.length == 1 && !inOneMemberMap) {
                result = new ASTNode(map.mappings[0].value, this._unit, this, inc, anc, this.cacheChildren).children(null, null, true);
            }
            else {
                result = map.mappings.map(function (x) { return new ASTNode(x, _this._unit, _this, anc ? anc : _this._anchor, inc ? inc : _this._include, _this.cacheChildren); });
            }
        }
        else if (kind == yaml.Kind.MAPPING) {
            var mapping = this._node;
            if (mapping.value == null) {
                result = [];
            }
            else {
                result = new ASTNode(mapping.value, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include, this.cacheChildren).children();
            }
        }
        else if (kind == yaml.Kind.SEQ) {
            var seq = this._node;
            result = seq.items.filter(function (x) { return x != null; }).map(function (x) { return new ASTNode(x, _this._unit, _this, anc ? anc : _this._anchor, inc ? inc : _this._include, _this.cacheChildren); });
        }
        else if (kind == yaml.Kind.INCLUDE_REF) {
            if (this._unit) {
                var includePath = this.includePath();
                var resolved = this._unit.resolve(includePath);
                if (resolved == null) {
                    result = [];
                }
                else if (resolved.isRAMLUnit()) {
                    var ast = resolved.ast();
                    if (ast) {
                        if (this.cacheChildren) {
                            ast = toChildCahcingNode(ast);
                        }
                        result = resolved.ast().children(this, null);
                    }
                }
            }
            if (!result) {
                result = [];
            }
        }
        else if (kind == yaml.Kind.ANCHOR_REF) {
            var ref = this._node;
            result = new ASTNode(ref.value, this._unit, this, null, null, this.cacheChildren).children();
        }
        else {
            throw new Error("Should never happen; kind : " + yaml.Kind[this._node.kind]);
        }
        if (this.cacheChildren) {
            this._children = result;
        }
        return result;
    };
    ASTNode.prototype.directChildren = function (inc, anc, inOneMemberMap) {
        var _this = this;
        if (inc === void 0) { inc = null; }
        if (anc === void 0) { anc = null; }
        if (inOneMemberMap === void 0) { inOneMemberMap = true; }
        if (this._node) {
            switch (this._node.kind) {
                case yaml.Kind.SCALAR:
                    return [];
                case yaml.Kind.MAP:
                    {
                        var map = this._node;
                        if (map.mappings.length == 1 && !inOneMemberMap) {
                            return new ASTNode(map.mappings[0].value, this._unit, this, inc, anc).directChildren(null, null, true);
                        }
                        return map.mappings.map(function (x) { return new ASTNode(x, _this._unit, _this, anc ? anc : _this._anchor, inc ? inc : _this._include); });
                    }
                case yaml.Kind.MAPPING:
                    {
                        var mapping = this._node;
                        if (mapping.value == null) {
                            return [];
                        }
                        return new ASTNode(mapping.value, this._unit, this, anc ? anc : this._anchor, inc ? inc : this._include).directChildren();
                    }
                case yaml.Kind.SEQ:
                    {
                        var seq = this._node;
                        return seq.items.filter(function (x) { return x != null; }).map(function (x) { return new ASTNode(x, _this._unit, _this, anc ? anc : _this._anchor, inc ? inc : _this._include); });
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
        return [];
    };
    ASTNode.prototype.anchorId = function () {
        return this._node.anchorId;
    };
    ASTNode.prototype.unit = function () {
        return this._unit;
    };
    ASTNode.prototype.setUnit = function (unit) {
        this._unit = unit;
    };
    ASTNode.prototype.includePath = function () {
        if (this._node.kind == yaml.Kind.INCLUDE_REF) {
            var includePath = this._node['value'];
            return includePath;
        }
        return null;
    };
    ASTNode.prototype.anchoredFrom = function () {
        return this._anchor;
    };
    ASTNode.prototype.includedFrom = function () {
        return this._include;
    };
    ASTNode.prototype.kind = function () {
        return this._actualNode().kind;
    };
    ASTNode.prototype.kindName = function () {
        return yaml.Kind[this.kind()];
    };
    ASTNode.prototype.indent = function (lev, str) {
        if (str === void 0) { str = ''; }
        var leading = '';
        for (var i = 0; i < lev; i++)
            leading += '  ';
        return leading + str;
    };
    ASTNode.prototype.replaceNewlines = function (s, rep) {
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
    };
    ASTNode.prototype.shortText = function (unittext, maxlen) {
        if (maxlen === void 0) { maxlen = 50; }
        var elen = this.end() - this.start();
        var len = elen;
        var unit = this.unit();
        if (!unittext && unit) {
            unittext = unit.contents();
        }
        var text;
        if (!unittext) {
            text = '[no-unit]';
        }
        else {
            var s = unittext;
            text = s ? s.substring(this.start(), this.end()) : '[no-text]';
        }
        text = "[" + this.start() + ".." + this.end() + "] " + elen + " // " + text;
        if (len < elen)
            text += '...';
        text = this.replaceNewlines(text);
        return text;
    };
    ASTNode.prototype.show = function (message, lev, text) {
        if (message === void 0) { message = null; }
        if (lev === void 0) { lev = 0; }
        if (text === void 0) { text = null; }
        if (message && lev == 0) {
            console.log(message);
        }
        var children = this.children();
        var desc = this.kindName();
        var val = this._actualNode().value;
        if (this.kind() == yaml.Kind.MAPPING) {
            desc += '[' + this._actualNode().key.value + ']';
        }
        if (val)
            desc += "/" + yaml.Kind[val.kind];
        else
            desc += "";
        if (children.length == 0) {
            console.log(this.indent(lev) + desc + " // " + this.shortText(text));
        }
        else {
            console.log(this.indent(lev) + desc + " { // " + this.shortText(text));
            children.forEach(function (node) {
                var n = node;
                n.show(null, lev + 1, text);
            });
            console.log(this.indent(lev) + '}');
        }
    };
    ASTNode.prototype.showParents = function (message, lev) {
        if (lev === void 0) { lev = 0; }
        if (message && lev == 0) {
            console.log(message);
        }
        var depth = 0;
        if (this.parent()) {
            var n = this.parent();
            depth = n.showParents(null, lev + 1);
        }
        var desc = this.kindName();
        var val = this._actualNode().value;
        if (val)
            desc += "/" + yaml.Kind[val.kind];
        else
            desc += "/null";
        console.log(this.indent(depth) + desc + " // " + this.shortText(null));
        return depth + 1;
    };
    ASTNode.prototype.inlined = function (kind) {
        return kind == yaml.Kind.SCALAR || kind == yaml.Kind.INCLUDE_REF;
    };
    ASTNode.prototype.markupNode = function (xbuf, node, lev, json) {
        if (json === void 0) { json = false; }
        var start = xbuf.text.length;
        switch (node.kind) {
            case yaml.Kind.MAP:
                if (json)
                    xbuf.append('{');
                var mappings = node.mappings;
                for (var i = 0; i < mappings.length; i++) {
                    if (json && i > 0)
                        xbuf.append(', ');
                    this.markupNode(xbuf, mappings[i], lev, json);
                }
                if (json)
                    xbuf.append('}');
                break;
            case yaml.Kind.SEQ:
                var items = node.items;
                for (var i = 0; i < items.length; i++) {
                    xbuf.append(this.indent(lev, '- '));
                    this.markupNode(xbuf, items[i], lev + 1, json);
                }
                break;
            case yaml.Kind.MAPPING:
                var mapping = node;
                var val = mapping.value;
                if (json) {
                    xbuf.append(mapping.key.value);
                    xbuf.append(': ');
                    if (val.kind == yaml.Kind.SCALAR) {
                        var sc = val;
                        xbuf.append(sc.value);
                    }
                    break;
                }
                if (!val)
                    break;
                if (val.kind == yaml.Kind.SCALAR) {
                    var sc = val;
                }
                xbuf.addWithIndent(lev, mapping.key.value + ':');
                if (mapping.value) {
                    xbuf.append(this.inlined(mapping.value.kind) ? ' ' : '\n');
                    this.markupNode(xbuf, mapping.value, lev + 1, json);
                }
                else {
                    xbuf.append('\n');
                }
                break;
            case yaml.Kind.SCALAR:
                var sc = node;
                if (textutil.isMultiLine(sc.value)) {
                    xbuf.append('|\n');
                    var lines = splitOnLines(sc.value);
                    for (var i = 0; i < lines.length; i++) {
                        xbuf.append(this.indent(lev, lines[i]));
                    }
                    xbuf.append('\n');
                }
                else {
                    xbuf.append(sc.value + '\n');
                }
                break;
            case yaml.Kind.INCLUDE_REF:
                var ref = node;
                xbuf.append('include ref: ' + ref.referencesAnchor + '\n');
                break;
            default:
                throw 'Unknown node kind: ' + yaml.Kind[node.kind];
                break;
        }
        while (start < xbuf.text.length && xbuf.text[start] == ' ')
            start++;
        node.startPosition = start;
        node.endPosition = xbuf.text.length;
    };
    ASTNode.prototype.root = function () {
        var node = this;
        while (node.parent())
            node = node.parent();
        return node;
    };
    ASTNode.prototype.parentOfKind = function (kind) {
        var p = this.parent();
        while (p) {
            if (p.kind() == kind)
                return p;
            p = p.parent();
        }
        return null;
    };
    ASTNode.prototype.find = function (name) {
        var found = null;
        this.directChildren().forEach(function (y) {
            if (y.key() && y.key() == name) {
                if (!found)
                    found = y;
            }
        });
        return found;
    };
    ASTNode.prototype.shiftNodes = function (offset, shift) {
        this.directChildren().forEach(function (x) {
            var m = x.shiftNodes(offset, shift);
        });
        var yaNode = this._actualNode();
        if (yaNode)
            innerShift(offset, yaNode, shift);
        return null;
    };
    ASTNode.prototype.isMap = function () {
        return this.kind() == yaml.Kind.MAP;
    };
    ASTNode.prototype.isMapping = function () {
        return this.kind() == yaml.Kind.MAPPING;
    };
    ASTNode.prototype.isSeq = function () {
        return this.kind() == yaml.Kind.SEQ;
    };
    ASTNode.prototype.isScalar = function () {
        return this.kind() == yaml.Kind.SCALAR;
    };
    ASTNode.prototype.asMap = function () {
        if (!this.isMap())
            throw "map expected instead of " + this.kindName();
        return (this._actualNode());
    };
    ASTNode.prototype.asMapping = function () {
        if (!this.isMapping())
            throw "maping expected instead of " + this.kindName();
        return (this._actualNode());
    };
    ASTNode.prototype.asSeq = function () {
        if (!this.isSeq())
            throw "seq expected instead of " + this.kindName();
        return (this._actualNode());
    };
    ASTNode.prototype.asScalar = function () {
        if (!this.isScalar())
            throw "scalar expected instead of " + this.kindName();
        return (this._actualNode());
    };
    ASTNode.prototype.text = function (unitText) {
        if (unitText === void 0) { unitText = null; }
        if (!unitText) {
            if (!this.unit())
                return '[no-text]';
            unitText = this.unit().contents();
        }
        return unitText.substring(this.start(), this.end());
    };
    ASTNode.prototype.copy = function () {
        var yn = copyNode(this._actualNode());
        return new ASTNode(yn, this._unit, this._parent, this._anchor, this._include);
    };
    return ASTNode;
})();
exports.ASTNode = ASTNode;
function createNode(key) {
    var node = yaml.newMapping(yaml.newScalar(key), yaml.newMap());
    return new ASTNode(node, null, null, null, null);
}
exports.createNode = createNode;
function createSeqNode(key) {
    var node = yaml.newMapping(yaml.newScalar(key), yaml.newItems());
    return new ASTNode(node, null, null, null, null);
}
exports.createSeqNode = createSeqNode;
function createMapping(key, v) {
    var node = yaml.newMapping(yaml.newScalar(key), yaml.newScalar(v));
    return new ASTNode(node, null, null, null, null);
}
exports.createMapping = createMapping;
function toChildCahcingNode(node) {
    if (!(node instanceof ASTNode)) {
        return null;
    }
    var astNode = node;
    var result = new ASTNode(astNode.yamlNode(), astNode.unit(), null, null, null, true);
    result._errors = astNode._errors;
    return result;
}
exports.toChildCahcingNode = toChildCahcingNode;
//# sourceMappingURL=jsyaml2lowLevel.js.map