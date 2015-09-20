var ASTDelta = (function () {
    function ASTDelta() {
    }
    return ASTDelta;
})();
exports.ASTDelta = ASTDelta;
(function (CommandKind) {
    CommandKind[CommandKind["ADD_CHILD"] = 0] = "ADD_CHILD";
    CommandKind[CommandKind["REMOVE_CHILD"] = 1] = "REMOVE_CHILD";
    CommandKind[CommandKind["MOVE_CHILD"] = 2] = "MOVE_CHILD";
    CommandKind[CommandKind["CHANGE_KEY"] = 3] = "CHANGE_KEY";
    CommandKind[CommandKind["CHANGE_VALUE"] = 4] = "CHANGE_VALUE";
})(exports.CommandKind || (exports.CommandKind = {}));
var CommandKind = exports.CommandKind;
var TextChangeCommand = (function () {
    function TextChangeCommand(offset, replacementLength, text, unit, target) {
        if (target === void 0) { target = null; }
        this.offset = offset;
        this.replacementLength = replacementLength;
        this.text = text;
        this.unit = unit;
        this.target = target;
    }
    return TextChangeCommand;
})();
exports.TextChangeCommand = TextChangeCommand;
var CompositeCommand = (function () {
    function CompositeCommand() {
        this.commands = [];
    }
    return CompositeCommand;
})();
exports.CompositeCommand = CompositeCommand;
var ASTChangeCommand = (function () {
    function ASTChangeCommand(kind, target, value, position) {
        this.toSeq = false;
        this.kind = kind;
        this.target = target;
        this.value = value;
        this.position = position;
    }
    return ASTChangeCommand;
})();
exports.ASTChangeCommand = ASTChangeCommand;
function setAttr(t, value) {
    return new ASTChangeCommand(4 /* CHANGE_VALUE */, t, value, -1);
}
exports.setAttr = setAttr;
function setAttrStructured(t, value) {
    return new ASTChangeCommand(4 /* CHANGE_VALUE */, t, value.lowLevel(), -1);
}
exports.setAttrStructured = setAttrStructured;
function setKey(t, value) {
    return new ASTChangeCommand(3 /* CHANGE_KEY */, t, value, -1);
}
exports.setKey = setKey;
function removeNode(t, child) {
    return new ASTChangeCommand(1 /* REMOVE_CHILD */, t, child, -1);
}
exports.removeNode = removeNode;
function insertNode(t, child, insertAfter, toSeq) {
    if (insertAfter === void 0) { insertAfter = null; }
    if (toSeq === void 0) { toSeq = false; }
    var s = new ASTChangeCommand(0 /* ADD_CHILD */, t, child, -1);
    s.insertionPoint = insertAfter;
    s.toSeq = toSeq;
    return s;
}
exports.insertNode = insertNode;
//# sourceMappingURL=lowLevelAST.js.map