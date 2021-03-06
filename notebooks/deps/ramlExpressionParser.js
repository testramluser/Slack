var parser = (function () {
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
        var options = arguments.length > 1 ? arguments[1] : {}, parser = this, peg$FAILED = {}, peg$startRuleFunctions = { Expression: peg$parseExpression }, peg$startRuleFunction = peg$parseExpression, peg$c0 = function (c) {
            return c;
        }, peg$c1 = function (op, exp) {
            return { 'type': 'unary', 'op': op, 'exp': exp };
        }, peg$c2 = /^[*%\/]/, peg$c3 = { type: "class", value: "[*%/]", description: "[*%/]" }, peg$c4 = function (l, r) {
            return r ? ({ "type": r[0], "l": l, "r": r[1] }) : l;
        }, peg$c5 = /^[\-+]/, peg$c6 = { type: "class", value: "[-+]", description: "[-+]" }, peg$c7 = "<=", peg$c8 = { type: "literal", value: "<=", description: "\"<=\"" }, peg$c9 = ">=", peg$c10 = { type: "literal", value: ">=", description: "\">=\"" }, peg$c11 = "<", peg$c12 = { type: "literal", value: "<", description: "\"<\"" }, peg$c13 = ">", peg$c14 = { type: "literal", value: ">", description: "\">\"" }, peg$c15 = "==", peg$c16 = { type: "literal", value: "==", description: "\"==\"" }, peg$c17 = "!=", peg$c18 = { type: "literal", value: "!=", description: "\"!=\"" }, peg$c19 = "&", peg$c20 = { type: "literal", value: "&", description: "\"&\"" }, peg$c21 = "^", peg$c22 = { type: "literal", value: "^", description: "\"^\"" }, peg$c23 = "|", peg$c24 = { type: "literal", value: "|", description: "\"|\"" }, peg$c25 = "&&", peg$c26 = { type: "literal", value: "&&", description: "\"&&\"" }, peg$c27 = "||", peg$c28 = { type: "literal", value: "||", description: "\"||\"" }, peg$c29 = "?", peg$c30 = { type: "literal", value: "?", description: "\"?\"" }, peg$c31 = ":", peg$c32 = { type: "literal", value: ":", description: "\":\"" }, peg$c33 = function (p, e) {
            return e ? null : p;
        }, peg$c34 = "(", peg$c35 = { type: "literal", value: "(", description: "\"(\"" }, peg$c36 = ")", peg$c37 = { type: "literal", value: ")", description: "\")\"" }, peg$c38 = function (e) {
            return { 'type': 'paren', 'exp': e };
        }, peg$c39 = /^[\-&*~!]/, peg$c40 = { type: "class", value: "[-&*~!]", description: "[-&*~!]" }, peg$c41 = "$", peg$c42 = { type: "literal", value: "$", description: "\"$\"" }, peg$c43 = /^[a-zA-Z_]/, peg$c44 = { type: "class", value: "[a-zA-Z_]", description: "[a-zA-Z_]" }, peg$c45 = /^[a-zA-Z0-9_]/, peg$c46 = { type: "class", value: "[a-zA-Z0-9_]", description: "[a-zA-Z0-9_]" }, peg$c47 = ".", peg$c48 = { type: "literal", value: ".", description: "\".\"" }, peg$c49 = function (v0, v1) {
            return { 'type': 'ident', value: [v0].concat(v1).join('') };
        }, peg$c50 = function (m) {
            m = m.map(function (x) {
                return x[1];
            });
            return { 'type': 'string', 'value': m.join('') };
        }, peg$c51 = "\"", peg$c52 = { type: "literal", value: "\"", description: "\"\\\"\"" }, peg$c53 = { type: "any", description: "any character" }, peg$c54 = /^[abfnrtv]/, peg$c55 = { type: "class", value: "[abfnrtv]", description: "[abfnrtv]" }, peg$c56 = "\\", peg$c57 = { type: "literal", value: "\\", description: "\"\\\\\"" }, peg$c58 = "'", peg$c59 = { type: "literal", value: "'", description: "\"'\"" }, peg$c60 = function (f) {
            return f.join('');
        }, peg$c61 = /^[0-9]/, peg$c62 = { type: "class", value: "[0-9]", description: "[0-9]" }, peg$c63 = function (v, f) {
            if (!f)
                f = [];
            var val = [v].concat(f).join('');
            return { 'type': 'number', 'value': val };
        }, peg$c64 = "-", peg$c65 = { type: "literal", value: "-", description: "\"-\"" }, peg$currPos = 0, peg$savedPos = 0, peg$posDetailsCache = [{ line: 1, column: 1, seenCR: false }], peg$maxFailPos = 0, peg$maxFailExpected = [], peg$silentFails = 0, peg$result;
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
        function peg$parseExpression() {
            var s0, s1;
            s0 = peg$currPos;
            s1 = peg$parseConditionalExpression();
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c0(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parseUnaryExpression() {
            var s0, s1;
            s0 = peg$currPos;
            s1 = peg$parsePrimaryExpression();
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c0(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$parseUnop();
            }
            return s0;
        }
        function peg$parseUnop() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$parseUnaryOperator();
            if (s1 !== peg$FAILED) {
                s2 = peg$parseUnaryExpression();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c1(s1, s2);
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
        function peg$parseMultiplicativeExpression() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$parseUnaryExpression();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                if (peg$c2.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c3);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseMultiplicativeExpression();
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
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c4(s1, s2);
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
        function peg$parseAdditiveExpression() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$parseMultiplicativeExpression();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                if (peg$c5.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c6);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseAdditiveExpression();
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
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c4(s1, s2);
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
        function peg$parseRelationalExpression() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$parseAdditiveExpression();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c7) {
                    s3 = peg$c7;
                    peg$currPos += 2;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c8);
                    }
                }
                if (s3 === peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c9) {
                        s3 = peg$c9;
                        peg$currPos += 2;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c10);
                        }
                    }
                    if (s3 === peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 60) {
                            s3 = peg$c11;
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c12);
                            }
                        }
                        if (s3 === peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 62) {
                                s3 = peg$c13;
                                peg$currPos++;
                            }
                            else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c14);
                                }
                            }
                        }
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseRelationalExpression();
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
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c4(s1, s2);
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
        function peg$parseEqualityExpression() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$parseRelationalExpression();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c15) {
                    s3 = peg$c15;
                    peg$currPos += 2;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c16);
                    }
                }
                if (s3 === peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c17) {
                        s3 = peg$c17;
                        peg$currPos += 2;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c18);
                        }
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseEqualityExpression();
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
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c4(s1, s2);
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
        function peg$parseANDExpression() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$parseEqualityExpression();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 38) {
                    s3 = peg$c19;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c20);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseANDExpression();
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
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c4(s1, s2);
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
        function peg$parseExclusiveORExpression() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$parseANDExpression();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 94) {
                    s3 = peg$c21;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c22);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseExclusiveORExpression();
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
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c4(s1, s2);
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
        function peg$parseInclusiveORExpression() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$parseExclusiveORExpression();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 124) {
                    s3 = peg$c23;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c24);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseInclusiveORExpression();
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
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c4(s1, s2);
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
        function peg$parseLogicalANDExpression() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$parseInclusiveORExpression();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c25) {
                    s3 = peg$c25;
                    peg$currPos += 2;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c26);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseLogicalANDExpression();
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
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c4(s1, s2);
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
        function peg$parseLogicalORExpression() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$parseLogicalANDExpression();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c27) {
                    s3 = peg$c27;
                    peg$currPos += 2;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c28);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseLogicalORExpression();
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
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c4(s1, s2);
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
        function peg$parseConditionalExpression() {
            var s0, s1, s2, s3, s4, s5, s6;
            s0 = peg$currPos;
            s1 = peg$parseLogicalORExpression();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 63) {
                    s3 = peg$c29;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c30);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseExpression();
                    if (s4 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 58) {
                            s5 = peg$c31;
                            peg$currPos++;
                        }
                        else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c32);
                            }
                        }
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parseConditionalExpression();
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
                    s1 = peg$c33(s1, s2);
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
        function peg$parsePrimaryExpression() {
            var s0;
            s0 = peg$parseIdentifier();
            if (s0 === peg$FAILED) {
                s0 = peg$parseStringLiteral();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseNumberLiteral();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseCharLiteral();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parseParen();
                        }
                    }
                }
            }
            return s0;
        }
        function peg$parseParen() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 40) {
                s1 = peg$c34;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c35);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseExpression();
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 41) {
                        s3 = peg$c36;
                        peg$currPos++;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c37);
                        }
                    }
                    if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c38(s2);
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
            return s0;
        }
        function peg$parseUnaryOperator() {
            var s0;
            if (peg$c39.test(input.charAt(peg$currPos))) {
                s0 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c40);
                }
            }
            return s0;
        }
        function peg$parseIdentifier() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 36) {
                s1 = peg$c41;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c42);
                }
            }
            if (s1 === peg$FAILED) {
                if (peg$c43.test(input.charAt(peg$currPos))) {
                    s1 = input.charAt(peg$currPos);
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c44);
                    }
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                if (peg$c45.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c46);
                    }
                }
                if (s3 === peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 46) {
                        s3 = peg$c47;
                        peg$currPos++;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c48);
                        }
                    }
                    if (s3 === peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 36) {
                            s3 = peg$c41;
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c42);
                            }
                        }
                    }
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    if (peg$c45.test(input.charAt(peg$currPos))) {
                        s3 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c46);
                        }
                    }
                    if (s3 === peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 46) {
                            s3 = peg$c47;
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c48);
                            }
                        }
                        if (s3 === peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 36) {
                                s3 = peg$c41;
                                peg$currPos++;
                            }
                            else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c42);
                                }
                            }
                        }
                    }
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c49(s1, s2);
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
        function peg$parseStringLiteral() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            s1 = peg$parsedoublequote();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseDQChar();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseDQChar();
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$parsedoublequote();
                    if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c50(s2);
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
            return s0;
        }
        function peg$parsedoublequote() {
            var s0;
            if (input.charCodeAt(peg$currPos) === 34) {
                s0 = peg$c51;
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c52);
                }
            }
            return s0;
        }
        function peg$parseDQChar() {
            var s0, s1, s2;
            s0 = peg$parseEscapeSequence();
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$currPos;
                peg$silentFails++;
                s2 = peg$parsedoublequote();
                peg$silentFails--;
                if (s2 === peg$FAILED) {
                    s1 = void 0;
                }
                else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
                if (s1 !== peg$FAILED) {
                    if (input.length > peg$currPos) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c53);
                        }
                    }
                    if (s2 !== peg$FAILED) {
                        s1 = [s1, s2];
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
            return s0;
        }
        function peg$parseQChar() {
            var s0, s1, s2;
            s0 = peg$parseEscapeSequence();
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$currPos;
                peg$silentFails++;
                s2 = peg$parsequote();
                peg$silentFails--;
                if (s2 === peg$FAILED) {
                    s1 = void 0;
                }
                else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
                if (s1 !== peg$FAILED) {
                    if (input.length > peg$currPos) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c53);
                        }
                    }
                    if (s2 !== peg$FAILED) {
                        s1 = [s1, s2];
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
            return s0;
        }
        function peg$parseEscapeSequence() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$parsebackslash();
            if (s1 !== peg$FAILED) {
                s2 = peg$parsequote();
                if (s2 === peg$FAILED) {
                    s2 = peg$parsedoublequote();
                    if (s2 === peg$FAILED) {
                        s2 = peg$parsebackslash();
                        if (s2 === peg$FAILED) {
                            if (peg$c54.test(input.charAt(peg$currPos))) {
                                s2 = input.charAt(peg$currPos);
                                peg$currPos++;
                            }
                            else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c55);
                                }
                            }
                        }
                    }
                }
                if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
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
        function peg$parsebackslash() {
            var s0;
            if (input.charCodeAt(peg$currPos) === 92) {
                s0 = peg$c56;
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c57);
                }
            }
            return s0;
        }
        function peg$parsequote() {
            var s0;
            if (input.charCodeAt(peg$currPos) === 39) {
                s0 = peg$c58;
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c59);
                }
            }
            return s0;
        }
        function peg$parseCharLiteral() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            s1 = peg$parsequote();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseQChar();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseQChar();
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$parsequote();
                    if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c50(s2);
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
            return s0;
        }
        function peg$parseInteger() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsedigit();
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    s2 = peg$parsedigit();
                }
            }
            else {
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c60(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parsedigit() {
            var s0;
            if (peg$c61.test(input.charAt(peg$currPos))) {
                s0 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c62);
                }
            }
            return s0;
        }
        function peg$parseNumberLiteral() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$parseInteger();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 46) {
                    s3 = peg$c47;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c48);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseInteger();
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
                    s2 = null;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c63(s1, s2);
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
        function peg$parseSign() {
            var s0;
            if (input.charCodeAt(peg$currPos) === 45) {
                s0 = peg$c64;
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c65);
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
module.exports = parser;
//# sourceMappingURL=ramlExpressionParser.js.map