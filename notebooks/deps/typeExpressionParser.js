var v = (function () {
    "use strict";
    function peg$subclass(child, parent) {
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
    }
    function peg$SyntaxError(message, expected, found, location) {
        this.message = message;
        this.expected = expected;
        this.found = found;
        this.location = location;
        this.name = "SyntaxError";
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, peg$SyntaxError);
        }
    }
    peg$subclass(peg$SyntaxError, Error);
    function peg$parse(input) {
        var options = arguments.length > 1 ? arguments[1] : {}, parser = this, peg$FAILED = {}, peg$startRuleFunctions = { Term: peg$parseTerm }, peg$startRuleFunction = peg$parseTerm, peg$c0 = "|", peg$c1 = { type: "literal", value: "|", description: "\"|\"" }, peg$c2 = function (first, rest) {
            return rest ? { "type": "union", "first": first, "rest": rest[1] } : first;
        }, peg$c3 = "(", peg$c4 = { type: "literal", value: "(", description: "\"(\"" }, peg$c5 = ")", peg$c6 = { type: "literal", value: ")", description: "\")\"" }, peg$c7 = "[]", peg$c8 = { type: "literal", value: "[]", description: "\"[]\"" }, peg$c9 = "{}", peg$c10 = { type: "literal", value: "{}", description: "\"{}\"" }, peg$c11 = function (expr, arr) {
            return { "type": "parens", "expr": expr, "arr": arr };
        }, peg$c12 = { type: "other", description: "name" }, peg$c13 = function (r, c) {
            return { "type": "name", "value": r.join(""), "arr": (c ? c : "") };
        }, peg$c14 = { type: "other", description: "whitespace" }, peg$c15 = /^[ \t\n\r]/, peg$c16 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" }, peg$c17 = /^[0-z]/, peg$c18 = { type: "class", value: "[0-z]", description: "[0-z]" }, peg$c19 = "_", peg$c20 = { type: "literal", value: "_", description: "\"_\"" }, peg$c21 = "-", peg$c22 = { type: "literal", value: "-", description: "\"-\"" }, peg$c23 = ".", peg$c24 = { type: "literal", value: ".", description: "\".\"" }, peg$currPos = 0, peg$savedPos = 0, peg$posDetailsCache = [{ line: 1, column: 1, seenCR: false }], peg$maxFailPos = 0, peg$maxFailExpected = [], peg$silentFails = 0, peg$result;
        if ("startRule" in options) {
            if (!(options.startRule in peg$startRuleFunctions)) {
                throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
            }
            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }
        function text() {
            return input.substring(peg$savedPos, peg$currPos);
        }
        function location() {
            return peg$computeLocation(peg$savedPos, peg$currPos);
        }
        function expected(description) {
            throw peg$buildException(null, [{ type: "other", description: description }], input.substring(peg$savedPos, peg$currPos), peg$computeLocation(peg$savedPos, peg$currPos));
        }
        function error(message) {
            throw peg$buildException(message, null, input.substring(peg$savedPos, peg$currPos), peg$computeLocation(peg$savedPos, peg$currPos));
        }
        function peg$computePosDetails(pos) {
            var details = peg$posDetailsCache[pos], p, ch;
            if (details) {
                return details;
            }
            else {
                p = pos - 1;
                while (!peg$posDetailsCache[p]) {
                    p--;
                }
                details = peg$posDetailsCache[p];
                details = {
                    line: details.line,
                    column: details.column,
                    seenCR: details.seenCR
                };
                while (p < pos) {
                    ch = input.charAt(p);
                    if (ch === "\n") {
                        if (!details.seenCR) {
                            details.line++;
                        }
                        details.column = 1;
                        details.seenCR = false;
                    }
                    else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
                        details.line++;
                        details.column = 1;
                        details.seenCR = true;
                    }
                    else {
                        details.column++;
                        details.seenCR = false;
                    }
                    p++;
                }
                peg$posDetailsCache[pos] = details;
                return details;
            }
        }
        function peg$computeLocation(startPos, endPos) {
            var startPosDetails = peg$computePosDetails(startPos), endPosDetails = peg$computePosDetails(endPos);
            return {
                start: {
                    offset: startPos,
                    line: startPosDetails.line,
                    column: startPosDetails.column
                },
                end: {
                    offset: endPos,
                    line: endPosDetails.line,
                    column: endPosDetails.column
                }
            };
        }
        function peg$fail(expected) {
            if (peg$currPos < peg$maxFailPos) {
                return;
            }
            if (peg$currPos > peg$maxFailPos) {
                peg$maxFailPos = peg$currPos;
                peg$maxFailExpected = [];
            }
            peg$maxFailExpected.push(expected);
        }
        function peg$buildException(message, expected, found, location) {
            function cleanupExpected(expected) {
                var i = 1;
                expected.sort(function (a, b) {
                    if (a.description < b.description) {
                        return -1;
                    }
                    else if (a.description > b.description) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                });
                while (i < expected.length) {
                    if (expected[i - 1] === expected[i]) {
                        expected.splice(i, 1);
                    }
                    else {
                        i++;
                    }
                }
            }
            function buildMessage(expected, found) {
                function stringEscape(s) {
                    function hex(ch) {
                        return ch.charCodeAt(0).toString(16).toUpperCase();
                    }
                    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\x08/g, '\\b').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\f/g, '\\f').replace(/\r/g, '\\r').replace(/[\x00-\x07\x0B\x0E\x0F]/g, function (ch) {
                        return '\\x0' + hex(ch);
                    }).replace(/[\x10-\x1F\x80-\xFF]/g, function (ch) {
                        return '\\x' + hex(ch);
                    }).replace(/[\u0100-\u0FFF]/g, function (ch) {
                        return '\\u0' + hex(ch);
                    }).replace(/[\u1000-\uFFFF]/g, function (ch) {
                        return '\\u' + hex(ch);
                    });
                }
                var expectedDescs = new Array(expected.length), expectedDesc, foundDesc, i;
                for (i = 0; i < expected.length; i++) {
                    expectedDescs[i] = expected[i].description;
                }
                expectedDesc = expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[expected.length - 1] : expectedDescs[0];
                foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";
                return "Expected " + expectedDesc + " but " + foundDesc + " found.";
            }
            if (expected !== null) {
                cleanupExpected(expected);
            }
            return new peg$SyntaxError(message !== null ? message : buildMessage(expected, found), expected, found, location);
        }
        function peg$parseTerm() {
            var s0, s1, s2, s3, s4, s5, s6;
            s0 = peg$currPos;
            s1 = peg$parseFactor();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$parse_();
                if (s3 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 124) {
                        s4 = peg$c0;
                        peg$currPos++;
                    }
                    else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c1);
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parse_();
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parseTerm();
                            if (s6 !== peg$FAILED) {
                                s3 = [s3, s4, s5, s6];
                                s2 = s3;
                            }
                            else {
                                peg$currPos = s2;
                                s2 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 === peg$FAILED) {
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c2(s1, s2);
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseFactor() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 40) {
                s1 = peg$c3;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c4);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parse_();
                if (s2 !== peg$FAILED) {
                    s3 = peg$parseTerm();
                    if (s3 !== peg$FAILED) {
                        s4 = peg$parse_();
                        if (s4 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 41) {
                                s5 = peg$c5;
                                peg$currPos++;
                            }
                            else {
                                s5 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c6);
                                }
                            }
                            if (s5 !== peg$FAILED) {
                                s6 = peg$currPos;
                                s7 = peg$parse_();
                                if (s7 !== peg$FAILED) {
                                    if (input.substr(peg$currPos, 2) === peg$c7) {
                                        s8 = peg$c7;
                                        peg$currPos += 2;
                                    }
                                    else {
                                        s8 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$c8);
                                        }
                                    }
                                    if (s8 !== peg$FAILED) {
                                        s7 = [s7, s8];
                                        s6 = s7;
                                    }
                                    else {
                                        peg$currPos = s6;
                                        s6 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s6;
                                    s6 = peg$FAILED;
                                }
                                if (s6 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 2) === peg$c9) {
                                        s6 = peg$c9;
                                        peg$currPos += 2;
                                    }
                                    else {
                                        s6 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$c10);
                                        }
                                    }
                                }
                                if (s6 === peg$FAILED) {
                                    s6 = null;
                                }
                                if (s6 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$c11(s3, s6);
                                    s0 = s1;
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parseLiteral();
            }
            return s0;
        }
        function peg$parseLiteral() {
            var s0, s1, s2, s3, s4;
            peg$silentFails++;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsechar();
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    s2 = peg$parsechar();
                }
            }
            else {
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$parse_();
                if (s3 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c7) {
                        s4 = peg$c7;
                        peg$currPos += 2;
                    }
                    else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c8);
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        s3 = [s3, s4];
                        s2 = s3;
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 === peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c9) {
                        s2 = peg$c9;
                        peg$currPos += 2;
                    }
                    else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c10);
                        }
                    }
                }
                if (s2 === peg$FAILED) {
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c13(s1, s2);
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c12);
                }
            }
            return s0;
        }
        function peg$parse_() {
            var s0, s1;
            peg$silentFails++;
            s0 = [];
            if (peg$c15.test(input.charAt(peg$currPos))) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c16);
                }
            }
            while (s1 !== peg$FAILED) {
                s0.push(s1);
                if (peg$c15.test(input.charAt(peg$currPos))) {
                    s1 = input.charAt(peg$currPos);
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c16);
                    }
                }
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c14);
                }
            }
            return s0;
        }
        function peg$parsechar() {
            var s0;
            if (peg$c17.test(input.charAt(peg$currPos))) {
                s0 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c18);
                }
            }
            if (s0 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 95) {
                    s0 = peg$c19;
                    peg$currPos++;
                }
                else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c20);
                    }
                }
                if (s0 === peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 45) {
                        s0 = peg$c21;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c22);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 46) {
                            s0 = peg$c23;
                            peg$currPos++;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c24);
                            }
                        }
                    }
                }
            }
            return s0;
        }
        peg$result = peg$startRuleFunction();
        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
            return peg$result;
        }
        else {
            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
                peg$fail({ type: "end", description: "end of input" });
            }
            throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
        }
    }
    return {
        SyntaxError: peg$SyntaxError,
        parse: peg$parse
    };
})();
module.exports = v;
//# sourceMappingURL=typeExpressionParser.js.map