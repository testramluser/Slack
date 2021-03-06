var mod = (function () {
    function peg$subclass(child, parent) {
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
    }
    function SyntaxError(message, expected, found, offset, line, column) {
        this.message = message;
        this.expected = expected;
        this.found = found;
        this.offset = offset;
        this.line = line;
        this.column = column;
        this.name = "SyntaxError";
    }
    peg$subclass(SyntaxError, Error);
    function parse(input) {
        var options = arguments.length > 1 ? arguments[1] : {}, peg$FAILED = {}, peg$startRuleFunctions = { start: peg$parsestart }, peg$startRuleFunction = peg$parsestart, peg$c0 = peg$FAILED, peg$c1 = "|", peg$c2 = { type: "literal", value: "|", description: "\"|\"" }, peg$c3 = function (left, r) {
            return { 'type': 'or', 'left': left, 'right': r ? r : null };
        }, peg$c4 = ".", peg$c5 = { type: "literal", value: ".", description: "\".\"" }, peg$c6 = function (left, r) {
            return { 'type': 'dot', 'left': left, 'right': r };
        }, peg$c7 = "$", peg$c8 = { type: "literal", value: "$", description: "\"$\"" }, peg$c9 = function () {
            return { 'type': 'parent' };
        }, peg$c10 = "$$", peg$c11 = { type: "literal", value: "$$", description: "\"$$\"" }, peg$c12 = function () {
            return { 'type': 'ancestor' };
        }, peg$c13 = "**", peg$c14 = { type: "literal", value: "**", description: "\"**\"" }, peg$c15 = function () {
            return { 'type': 'descendant' };
        }, peg$c16 = "*", peg$c17 = { type: "literal", value: "*", description: "\"*\"" }, peg$c18 = function () {
            return { 'type': 'child' };
        }, peg$c19 = [], peg$c20 = /^[A-z]/, peg$c21 = { type: "class", value: "[A-z]", description: "[A-z]" }, peg$c22 = function (chars) {
            return { 'type': 'classLiteral', "name": chars.join("") };
        }, peg$currPos = 0, peg$reportedPos = 0, peg$cachedPos = 0, peg$cachedPosDetails = { line: 1, column: 1, seenCR: false }, peg$maxFailPos = 0, peg$maxFailExpected = [], peg$silentFails = 0, peg$result;
        if ("startRule" in options) {
            if (!(options.startRule in peg$startRuleFunctions)) {
                throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
            }
            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }
        function text() {
            return input.substring(peg$reportedPos, peg$currPos);
        }
        function offset() {
            return peg$reportedPos;
        }
        function line() {
            return peg$computePosDetails(peg$reportedPos).line;
        }
        function column() {
            return peg$computePosDetails(peg$reportedPos).column;
        }
        function expected(description) {
            throw peg$buildException(null, [{ type: "other", description: description }], peg$reportedPos);
        }
        function error(message) {
            throw peg$buildException(message, null, peg$reportedPos);
        }
        function peg$computePosDetails(pos) {
            function advance(details, startPos, endPos) {
                var p, ch;
                for (p = startPos; p < endPos; p++) {
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
                }
            }
            if (peg$cachedPos !== pos) {
                if (peg$cachedPos > pos) {
                    peg$cachedPos = 0;
                    peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
                }
                advance(peg$cachedPosDetails, peg$cachedPos, pos);
                peg$cachedPos = pos;
            }
            return peg$cachedPosDetails;
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
        function peg$buildException(message, expected, pos) {
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
                    }).replace(/[\u0180-\u0FFF]/g, function (ch) {
                        return '\\u0' + hex(ch);
                    }).replace(/[\u1080-\uFFFF]/g, function (ch) {
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
            var posDetails = peg$computePosDetails(pos), found = pos < input.length ? input.charAt(pos) : null;
            if (expected !== null) {
                cleanupExpected(expected);
            }
            return new SyntaxError(message !== null ? message : buildMessage(expected, found), expected, found, pos, posDetails.line, posDetails.column);
        }
        function peg$parsestart() {
            var s0;
            s0 = peg$parseor();
            return s0;
        }
        function peg$parseor() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            s1 = peg$parsesequence();
            if (s1 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 124) {
                    s2 = peg$c1;
                    peg$currPos++;
                }
                else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c2);
                    }
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$parseor();
                    if (s3 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c3(s1, s3);
                        s0 = s1;
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parsesequence();
            }
            return s0;
        }
        function peg$parsesequence() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            s1 = peg$parseprimary();
            if (s1 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                    s2 = peg$c4;
                    peg$currPos++;
                }
                else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c5);
                    }
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$parsesequence();
                    if (s3 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c6(s1, s3);
                        s0 = s1;
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parseprimary();
            }
            return s0;
        }
        function peg$parseprimary() {
            var s0;
            s0 = peg$parsechildRef();
            if (s0 === peg$FAILED) {
                s0 = peg$parsedoubleStar();
                if (s0 === peg$FAILED) {
                    s0 = peg$parsestar();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parsedoubleDollar();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parsedollar();
                        }
                    }
                }
            }
            return s0;
        }
        function peg$parsedollar() {
            var s0, s1;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 36) {
                s1 = peg$c7;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c8);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c9();
            }
            s0 = s1;
            return s0;
        }
        function peg$parsedoubleDollar() {
            var s0, s1;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c10) {
                s1 = peg$c10;
                peg$currPos += 2;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c11);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c12();
            }
            s0 = s1;
            return s0;
        }
        function peg$parsedoubleStar() {
            var s0, s1;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c13) {
                s1 = peg$c13;
                peg$currPos += 2;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c14);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c15();
            }
            s0 = s1;
            return s0;
        }
        function peg$parsestar() {
            var s0, s1;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 42) {
                s1 = peg$c16;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c17);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c18();
            }
            s0 = s1;
            return s0;
        }
        function peg$parsechildRef() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = [];
            if (peg$c20.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c21);
                }
            }
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    if (peg$c20.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c21);
                        }
                    }
                }
            }
            else {
                s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c22(s1);
            }
            s0 = s1;
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
            throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
        }
    }
    return {
        SyntaxError: SyntaxError,
        parse: parse
    };
})();
module.exports = mod;
//# sourceMappingURL=ramlselector.js.map