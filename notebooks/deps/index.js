var _ = require("underscore");
var Opt = require('./Opt');
exports.defined = function (x) { return (x !== null) && (x !== undefined); };
function flattenArrayOfObjects(x) {
    var res = {};
    x.forEach(function (v) { return Object.keys(v).forEach(function (k) { return res[k] = v[k]; }); });
    return res;
}
exports.flattenArrayOfObjects = flattenArrayOfObjects;
function find(xs, f) {
    return new Opt(_.find(xs || [], f));
}
exports.find = find;
exports.isInstance = function (v, C) { return (v instanceof C) ? [v] : []; };
exports.ifInstanceOf = function (v, C, f) { return (v instanceof C) ? f(v) : null; };
function toTuples(map) {
    return Object.keys(map).map(function (k) { return [k, map[k]]; });
}
exports.toTuples = toTuples;
function fromTuples(tuples) {
    var obj = {};
    tuples.forEach(function (x) { return obj[x[0]] = x[1]; });
    return obj;
}
exports.fromTuples = fromTuples;
exports.collectInstancesOf = function (xs, C) { return tap([], function (res) { return xs.forEach(function (v) { return exports.ifInstanceOf(v, C, function (x) { return res.push(x); }); }); }); };
exports.collectInstancesOfInMap = function (map, C) {
    return Object.keys(map).map(function (k) { return [k, map[k]]; }).filter(function (x) { return x[1] instanceof C; }).map(function (x) { return x; });
};
exports.asArray = function (v) { return exports.defined(v) ? ((v instanceof Array) ? v : [v]) : []; };
exports.shallowCopy = function (obj) { return tap({}, function (copy) { return Object.keys(obj).forEach(function (k) { return copy[k] = obj[k]; }); }); };
exports.flatMap = function (xs, f) { return exports.flatten(xs.map(f)); };
exports.flatten = function (xss) { return Array.prototype.concat.apply([], xss); };
exports.takeWhile = function (xs, f) { return tap([], function (res) {
    for (var i = 0; i < xs.length; i++) {
        if (!f(xs[i]))
            break;
        res.push(xs[i]);
    }
}); };
function tap(v, f) {
    f(v);
    return v;
}
exports.tap = tap;
function kv(obj, iter) {
    if (typeof obj === 'object')
        Object.keys(obj).forEach(function (k) { return iter(k, obj[k]); });
}
exports.kv = kv;
function indexed(objects, key, delKey) {
    if (delKey === void 0) { delKey = false; }
    var obj = {};
    objects.forEach(function (original) {
        var copy = exports.shallowCopy(original);
        if (delKey)
            delete copy[key];
        obj[original[key]] = copy;
    });
    return obj;
}
exports.indexed = indexed;
function stringEndsWith(str, search) {
    var dif = str.length - search.length;
    return dif >= 0 && str.lastIndexOf(search) === dif;
}
exports.stringEndsWith = stringEndsWith;
function stringStartsWith(str, search) {
    return str.length - search.length >= 0 && str.substring(0, search.length) === search;
}
exports.stringStartsWith = stringStartsWith;
function lazypropkeyfilter(k) {
    return k[k.length - 1] == "_";
}
exports.lazypropkeyfilter = lazypropkeyfilter;
function lazyprop(obj, key, func) {
    var result, ready = false;
    obj[key] = function () {
        if (!ready) {
            ready = true;
            result = func.apply(obj);
        }
        return result;
    };
}
function lazyprops(obj, keyfilter) {
    if (keyfilter === void 0) { keyfilter = lazypropkeyfilter; }
    for (var k in obj) {
        if (keyfilter(k)) {
            exports.ifInstanceOf(obj[k], Function, function (vf) { return (vf.length === 0) ? lazyprop(obj, k, vf) : null; });
        }
    }
}
exports.lazyprops = lazyprops;
function iff(v, f) {
    if (v !== undefined)
        f(v);
}
exports.iff = iff;
function isRAMLUrl(str) {
    if (typeof str !== 'string' || str == '')
        return false;
    return stringEndsWith(str, ".raml");
}
exports.isRAMLUrl = isRAMLUrl;
function getAllRequiredExternalModulesFromCode(code) {
    var match;
    var mods = [];
    var r1 = new RegExp("require\\('([^']+)'\\)", "gi");
    while (match = r1.exec(code)) {
        mods.push(match[1]);
    }
    var r2 = new RegExp('require\\("([^"]+)"\\)', "gi");
    while (match = r2.exec(code)) {
        mods.push(match[1]);
    }
    mods = _.unique(mods).filter(function (x) { return x != ""; });
    mods.sort();
    return mods;
}
exports.getAllRequiredExternalModulesFromCode = getAllRequiredExternalModulesFromCode;
exports.serial = (function () {
    var i = 0;
    return function () { return i++; };
})();
function isEssential(arg) {
    return typeof arg !== 'undefined' && arg != null;
}
exports.isEssential = isEssential;
//# sourceMappingURL=index.js.map