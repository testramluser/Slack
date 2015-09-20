var hl = require('./highLevelAST');
var _ = require("underscore");
var typeExpression = require('./typeExpressionParser');
var hlImpl = require('./highLevelImpl');
function validate(str, node, cb) {
    var result = typeExpression.parse(str);
    validateNode(result, node, cb);
}
exports.validate = validate;
function validateNode(r, node, cb) {
    if (r.type == "union") {
        var u = r;
        validateNode(u.first, node, cb);
        validateNode(u.rest, node, cb);
    }
    if (r.type == 'parens') {
        var ex = r;
        validateNode(ex.expr, node, cb);
    }
    if (r.type == 'name') {
        var l = r;
        var val = l.value;
        if (val.lastIndexOf("[]") == val.length - 2) {
            val = val.substr(0, val.length - 2);
        }
        var pr = node.property();
        var values = pr.enumValues(node.parent());
        if (!_.find(values, function (x) { return x == val; })) {
            cb.accept(hlImpl.createIssue(hl.IssueCode.UNRESOLVED_REFERENCE, "Unresolved reference:" + val, node));
            return true;
        }
    }
}
//# sourceMappingURL=typeExpressions.js.map