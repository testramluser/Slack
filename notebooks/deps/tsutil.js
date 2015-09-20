var ts = require("typescript");
function escapeTypescriptPropertyName(str) {
    return isValidTypescriptIdentifier(str) ? str : JSON.stringify(str);
}
exports.escapeTypescriptPropertyName = escapeTypescriptPropertyName;
var tsKeywords = 'type class interface break case catch continue debugger default delete do else finally for function if in instanceof new return switch this throw try typeof var void while with'.split(' ');
var digitCodesL = "0".charCodeAt(0);
var digitCodesR = "9".charCodeAt(0);
var lowerCaseCodesL = "a".charCodeAt(0);
var lowerCaseCodesR = "z".charCodeAt(0);
var upperCaseCodesL = "A".charCodeAt(0);
var upperCaseCodesR = "Z".charCodeAt(0);
var digitChars = {};
var validChars = {};
for (var i = digitCodesL, end = digitCodesR; i <= end; i++) {
    digitChars[String.fromCharCode(i)] = true;
    validChars[String.fromCharCode(i)] = true;
}
for (var i = lowerCaseCodesL, end = lowerCaseCodesR; i <= end; i++) {
    validChars[String.fromCharCode(i)] = true;
}
for (var i = upperCaseCodesL, end = upperCaseCodesR; i <= end; i++) {
    validChars[String.fromCharCode(i)] = true;
}
"_ $".split(" ").forEach(function (x) { return validChars[x] = true; });
function isValidTypescriptIdentifier(str) {
    str = str.trim();
    if (str.length == 0) {
        return false;
    }
    if (tsKeywords.indexOf(str) >= 0) {
        return false;
    }
    if (digitChars[str.charAt(0)]) {
        return false;
    }
    for (var i = 0; i < str.length; i++) {
        if (!validChars[str.charAt(i)]) {
            return false;
        }
    }
    return true;
}
exports.isValidTypescriptIdentifier = isValidTypescriptIdentifier;
function escapeToIdentifier(str) {
    str = str.trim();
    var result = '';
    if (str.length > 0 && digitChars[str.charAt(0)]) {
        result += '_';
    }
    for (var i = 0; i < str.length; i++) {
        var ch = str.charAt(i);
        if (validChars[ch]) {
            result += ch;
        }
        else {
            result += '_';
        }
    }
    return result;
}
exports.escapeToIdentifier = escapeToIdentifier;
function format(text) {
    var options = getDefaultOptions();
    var sourceFile = ts.createSourceFile("file.ts", text, ts.ScriptTarget.Latest, "0");
    fixupParentReferences(sourceFile);
    var edits = ts.formatting.formatDocument(sourceFile, getRuleProvider(options), options);
    return applyEdits(text, edits);
    function getRuleProvider(options) {
        var ruleProvider = new ts.formatting.RulesProvider();
        ruleProvider.ensureUpToDate(options);
        return ruleProvider;
    }
    function applyEdits(text, edits) {
        var result = text;
        for (var i = edits.length - 1; i >= 0; i--) {
            var change = edits[i];
            var head = result.slice(0, change.span.start());
            var tail = result.slice(change.span.start() + change.span.length());
            result = head + change.newText + tail;
        }
        return result;
    }
    function getDefaultOptions() {
        return {
            IndentSize: 4,
            TabSize: 4,
            NewLineCharacter: '\n',
            ConvertTabsToSpaces: true,
            InsertSpaceAfterCommaDelimiter: true,
            InsertSpaceAfterSemicolonInForStatements: true,
            InsertSpaceBeforeAndAfterBinaryOperators: true,
            InsertSpaceAfterKeywordsInControlFlowStatements: true,
            InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
            InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
            PlaceOpenBraceOnNewLineForFunctions: false,
            PlaceOpenBraceOnNewLineForControlBlocks: false
        };
    }
    function fixupParentReferences(sourceFile) {
        var parent = sourceFile;
        function walk(n) {
            n.parent = parent;
            var saveParent = parent;
            parent = n;
            ts.forEachChild(n, walk);
            parent = saveParent;
        }
        ts.forEachChild(sourceFile, walk);
    }
}
exports.format = format;
var typeMap = {
    'string': 'string',
    'integer': 'number',
    'number': 'number',
    'boolean': 'boolean',
    'file': 'string',
    'date': 'string'
};
function ramlType2TSType(ramlType) {
    var tsType = typeMap[ramlType];
    if (!tsType) {
        tsType = 'any';
    }
    return tsType;
}
exports.ramlType2TSType = ramlType2TSType;
//# sourceMappingURL=tsutil.js.map