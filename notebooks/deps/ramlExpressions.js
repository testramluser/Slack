var ramlExpression = require('./ramlExpressionParser');
var hlImpl = require('./highLevelImpl');
function validate(str, node) {
    var result = ramlExpression.parse(str);
    validateNode(result, node);
}
exports.validate = validate;
function validateNode(r, node) {
    if (r.type == "unary") {
        var u = r;
        validateNode(u.exp, node);
    }
    else if (r.type == 'paren') {
        var ex = r;
        validateNode(ex.exp, node);
    }
    else if (r.type == 'string' || r.type == 'number') {
    }
    else if (r.type == 'ident') {
        var ident = r;
        var p = hlImpl.resolveRamlPointer(node, ident.value);
        if (!p) {
            throw new Error("Unable to resolve " + ident.value);
        }
    }
    else {
        var be = r;
        validateNode(be.l, node);
        validateNode(be.r, node);
    }
}
//# sourceMappingURL=ramlExpressions.js.map