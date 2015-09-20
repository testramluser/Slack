var ramlSanitize = require('./raml-sanitize');
var ramlValidate = require('./raml-validate');
var REGEXP_MATCH = {
    number: '[-+]?\\d+(?:\\.\\d+)?',
    integer: '[-+]?\\d+',
    date: '(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), \\d{2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \\d{4} (?:[0-1]\\d|2[0-3]):[0-5]\\d:[0-5]\\d GMT',
    boolean: '(?:true|false)'
};
var ESCAPE_CHARACTERS = /([.*+?=^!:${}()|[\]\/\\])/g;
var REGEXP_REPLACE = new RegExp([
    '([.\\/])?\\{([^}]+)\\}',
    ESCAPE_CHARACTERS.source
].join('|'), 'g');
function toRegExp(path, parameters, keys, options) {
    var end = options.end !== false;
    var strict = options.strict;
    var flags = '';
    if (!options.sensitive) {
        flags += 'i';
    }
    var route = path.replace(REGEXP_REPLACE, function (match, prefix, key, escape) {
        if (escape) {
            return '\\' + escape;
        }
        keys.push({
            name: key,
            prefix: prefix || '/'
        });
        prefix = prefix ? '\\' + prefix : '';
        var param = parameters[key];
        var capture = param && REGEXP_MATCH[param.type] || '[^' + (prefix || '\\/') + ']+';
        var optional = param && param.required === false;
        if (Array.isArray(param.enum) && param.enum.length) {
            capture = '(?:' + param.enum.map(function (value) {
                return String(value).replace(ESCAPE_CHARACTERS, '\\$1');
            }).join('|') + ')';
        }
        return prefix + '(' + capture + ')' + (optional ? '?' : '');
    });
    var endsWithSlash = path.charAt(path.length - 1) === '/';
    if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
    }
    if (end) {
        route += '$';
    }
    else {
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
    }
    return new RegExp('^' + route + (end ? '$' : ''), flags);
}
function decodeParam(param) {
    try {
        return decodeURIComponent(param);
    }
    catch (_) {
        var err = new Error('Failed to decode param "' + param + '"');
        err.status = 400;
        throw err;
    }
}
function ramlPathMatch(path, parameters, options) {
    options = options || {};
    if (path === '/' && options.end === false) {
        return truth;
    }
    parameters = parameters || {};
    var keys = [];
    var re = toRegExp(path, parameters, keys, options);
    var sanitize = ramlSanitize()(parameters);
    var validate = ramlValidate()(parameters);
    return function (pathname) {
        var m = re.exec(pathname);
        if (!m) {
            return false;
        }
        if (parameters['mediaTypeExtension']) {
            if (m.length > 1 && !m[m.length - 1]) {
                var beforeLast = m[m.length - 2];
                var ind = beforeLast.lastIndexOf('.');
                if (ind >= 0) {
                    m[m.length - 2] = beforeLast.substring(0, ind);
                    m[m.length - 1] = beforeLast.substring(ind);
                }
            }
        }
        var path = m[0];
        var params = {};
        for (var i = 1; i < m.length; i++) {
            var key = keys[i - 1];
            var param = m[i];
            params[key.name] = param == null ? param : decodeParam(param);
        }
        params = sanitize(params);
        if (!validate(params).valid) {
            return false;
        }
        return {
            path: path,
            params: params
        };
    };
}
function truth(path) {
    return { path: '', params: {} };
}
module.exports = ramlPathMatch;
//# sourceMappingURL=raml-path-match.js.map