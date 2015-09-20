var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var util = require('./index');
var Opt = require('./Opt');
var _ = require("underscore");
var ramlPathMatch = require('./raml-path-match');
function opt(v) {
    return new Opt(v);
}
function wrap(api) {
    return new Api(api);
}
exports.wrap = wrap;
var AbstractNode = (function () {
    function AbstractNode() {
        util.lazyprops(this, function (k) { return true; });
    }
    AbstractNode.prototype.allDirectChildren = function () {
        return [];
    };
    AbstractNode.prototype.visit = function (iter) {
        iter(this);
        this.allDirectChildren().forEach(function (x) { return x.visit(iter); });
    };
    AbstractNode.prototype.visitAndCollectInstancesOf = function (c) {
        var arr = [];
        this.visit(function (n) { return util.ifInstanceOf(n, c, function (x) { return arr.push(x); }); });
        return arr;
    };
    return AbstractNode;
})();
exports.AbstractNode = AbstractNode;
var SchemaDef = (function () {
    function SchemaDef(_name, _content) {
        var _this = this;
        this._name = _name;
        this._content = _content;
        this.name = function () { return _this._name; };
        this.content = function () { return _this._content; };
        this.wrapped = function () { return null; };
    }
    return SchemaDef;
})();
exports.SchemaDef = SchemaDef;
var WrappedSchema = (function () {
    function WrappedSchema() {
    }
    return WrappedSchema;
})();
var JSONSchema = (function () {
    function JSONSchema() {
    }
    return JSONSchema;
})();
var XSDSchema = (function () {
    function XSDSchema() {
    }
    return XSDSchema;
})();
var Api = (function (_super) {
    __extends(Api, _super);
    function Api(data) {
        var _this = this;
        _super.call(this);
        this.data = data;
        this.title = function () { return opt(_this.data.title); };
        this.version = function () { return opt(_this.data.version); };
        this.baseUri = function () { return opt(_this.data.baseUri); };
        this.baseUriParameters = function () { return Param.build(3 /* baseUri */, _this.data.baseUriParameters); };
        this.uriParameters = function () { return Param.build(2 /* uri */, _this.data.uriParameters); };
        this.protocols = function () { return ProtocolHelper.build(_this.data.protocols); };
        this.resources = function () { return util.asArray(_this.data.resources).map(function (x) { return new Resource(x, _this); }); };
        this.mediaType = function () { return opt(_this.data.mediaType); };
        this.schemas = function () {
            var schemaMap = util.flattenArrayOfObjects(_this.data.schemas || []);
            return util.toTuples(schemaMap).map(function (x) { return new SchemaDef(x[0], x[1]); });
        };
        this.securitySchemas = function () {
            var schemaMap = util.flattenArrayOfObjects(_this.data.securitySchemes || []);
            return util.toTuples(schemaMap).map(function (x) { return new SecuritySchemaDef(x[0], x[1], _this); });
        };
        this.documentation = function () { return DocumentationItem.build(_this.data.documentation); };
        this.allResources = function () { return _this.visitAndCollectInstancesOf(Resource); };
        this.allMethods = function () { return _this.visitAndCollectInstancesOf(Method); };
        this.findResourceById = function (id) { return opt(_.find(_this.allResources(), function (x) { return id.equals(x.id()); })); };
        this.findMethodById = function (id) { return opt(_.find(_this.allMethods(), function (x) { return id.equals(x.id()); })); };
        this.findSchemaByName = function (name) { return new Opt(_.find(_this.schemas(), function (x) { return x.name() == name; })); };
        this.findSchemaByContent = function (content) { return new Opt(_.find(_this.schemas(), function (x) { return x.content() == content; })); };
    }
    Api.prototype.allDirectChildren = function () {
        return [].concat(this.resources());
    };
    Api.prototype.securedBy = function () {
        if (!this.data.securedBy) {
            return [];
        }
        return this.data.securedBy.map(function (securedBy) {
            return opt(typeof securedBy === 'string' ? securedBy : securedBy && Object.keys(securedBy)[0]);
        });
    };
    return Api;
})(AbstractNode);
exports.Api = Api;
var SecuritySchemaType = (function () {
    function SecuritySchemaType(_data) {
        var _this = this;
        this._data = _data;
        this.type = function () { return new Opt(_this._data.type); };
        this.queryParameters = function () { return Param.build(0 /* query */, _this._data.describedBy ? _this._data.describedBy.queryParameters : undefined); };
        this.headers = function () { return Param.build(4 /* header */, _this._data.describedBy ? _this._data.describedBy.headers : undefined); };
    }
    return SecuritySchemaType;
})();
exports.SecuritySchemaType = SecuritySchemaType;
var BasicSecuritySchemaType = (function (_super) {
    __extends(BasicSecuritySchemaType, _super);
    function BasicSecuritySchemaType(_data) {
        _super.call(this, _data);
    }
    return BasicSecuritySchemaType;
})(SecuritySchemaType);
exports.BasicSecuritySchemaType = BasicSecuritySchemaType;
var SecuritySchemaDef = (function () {
    function SecuritySchemaDef(_name, _data, _api) {
        var _this = this;
        this._name = _name;
        this._data = _data;
        this._api = _api;
        this.name = function () { return _this._name; };
        this.type = function () {
            if (_this._data.type.trim() == "Basic Authentication") {
                return new BasicSecuritySchemaType(_this._data);
            }
            return new SecuritySchemaType(_this._data);
        };
    }
    SecuritySchemaDef.prototype.settings = function () {
        return this._data.settings || {};
    };
    SecuritySchemaDef.prototype.describedBy = function () {
        return this._data.describedBy || {};
    };
    SecuritySchemaDef.prototype.api = function () {
        return this._api;
    };
    return SecuritySchemaDef;
})();
exports.SecuritySchemaDef = SecuritySchemaDef;
var DocumentationItem = (function () {
    function DocumentationItem(data) {
        var _this = this;
        this.data = data;
        this.title = function () { return _this.data.title; };
        this.content = function () { return new MarkdownString(_this.data.content); };
    }
    DocumentationItem.build = function (items) {
        return util.asArray(items).map(function (x) { return new DocumentationItem(x); });
    };
    return DocumentationItem;
})();
exports.DocumentationItem = DocumentationItem;
var ParamValue = (function () {
    function ParamValue(key, value) {
        this.key = key;
        this.value = value;
    }
    return ParamValue;
})();
exports.ParamValue = ParamValue;
var Resource = (function (_super) {
    __extends(Resource, _super);
    function Resource(data, _api, _parent) {
        var _this = this;
        _super.call(this);
        this.data = data;
        this._api = _api;
        this._parent = _parent;
        this.id = function () { return new RamlId(_this.completeRelativeUri()); };
        this.api = function () { return _this._api; };
        this.relativeUri = function () { return _this.data.relativeUri; };
        this.description = function () { return opt(_this.data.description).map(function (x) { return new MarkdownString((x)); }); };
        this.parent = function () { return opt(_this._parent); };
        this.methods = function () { return (_this.data.methods || []).map(function (x) { return new Method(x, _this); }); };
        this.resources = function () { return util.asArray(_this.data.resources).map(function (x) { return new Resource(x, _this.api(), _this); }); };
        this.uriParameters = function () { return _.sortBy(Param.build(2 /* uri */, _this.data.uriParameters), function (x) { return _this.relativeUri().indexOf(x.name()); }); };
        this.baseUriParameters = function () { return Param.build(3 /* baseUri */, _this.data.baseUriParameters); };
        this.completeRelativeUri = function () { return _this.parent().map(function (p) { return p.completeRelativeUri(); }).getOrElse("") + _this.relativeUri(); };
        this.matchUri = function (apiRootRelativeUri) {
            var allParameters = {};
            var resource = _this;
            while (true) {
                var map = resource.data.uriParameters;
                if (map) {
                    Object.keys(map).forEach(function (x) { return allParameters[x] = map[x]; });
                }
                if (!resource.parent().isDefined()) {
                    break;
                }
                resource = resource.parent().getOrThrow();
            }
            var result = ramlPathMatch(_this.completeRelativeUri(), allParameters, {})(apiRootRelativeUri);
            if (result) {
                return opt(Object.keys(result.params).map(function (x) {
                    return new ParamValue(x, result['params'][x]);
                }));
            }
            return Opt.empty();
        };
        this.segments = function () {
            var result = [];
            var r = _this;
            do {
                result.push(r);
                r = r.parent().getOrElse(null);
            } while (r);
            result = result.reverse();
            return result;
        };
    }
    Resource.prototype.resourceType = function () {
        var type = this.data.type;
        if (typeof type === 'string') {
            return new Opt(type);
        }
        return new Opt(type && Object.keys(type)[0]);
    };
    Resource.prototype.allDirectChildren = function () {
        return [].concat(this.methods(), this.resources());
    };
    Resource.prototype.absoluteUri = function () {
        return this.parent().map(function (x) { return x.absoluteUri(); }).getOrElse('') + this.relativeUri();
    };
    Resource.prototype.absoluteUriParameters = function () {
        return this.parent().map(function (x) { return x.absoluteUriParameters(); }).getOrElse([]).concat(this.uriParameters());
    };
    return Resource;
})(AbstractNode);
exports.Resource = Resource;
var RamlId = (function () {
    function RamlId(_value) {
        var _this = this;
        this._value = _value;
        this.value = function () { return _this._value; };
        this.equals = function (other) { return _this.value() === other.value(); };
    }
    return RamlId;
})();
exports.RamlId = RamlId;
var Method = (function (_super) {
    __extends(Method, _super);
    function Method(data, _resource) {
        var _this = this;
        _super.call(this);
        this.data = data;
        this._resource = _resource;
        this.id = function () { return new RamlId(_this.resource().completeRelativeUri() + " " + _this.method().toLowerCase()); };
        this.api = function () { return _this._resource.api(); };
        this.resource = function () { return _this._resource; };
        this.method = function () { return _this.data.method; };
        this.description = function () { return opt(_this.data.description).map(function (x) { return new MarkdownString(x); }); };
        this.protocols = function () { return ProtocolHelper.build(_this.data.protocols); };
        this.queryParameters = function () { return Param.build(0 /* query */, _this.data.queryParameters); };
        this.headers = function () { return Param.build(4 /* header */, _this.data.headers); };
        this.responses = function () { return Object.keys(_this.data.responses || {}).map(function (statusCode) { return new Response(_this, statusCode, _this.data.responses[statusCode]); }); };
        this.bodies = function () { return Object.keys(_this.data.body || {}).map(function (mtype) { return new Body(_this, mtype, _this.data.body[mtype]); }); };
        this.getConsolidatedParameterList = function (inherited) {
            if (inherited === void 0) { inherited = false; }
            return [];
        };
    }
    Method.prototype.traits = function () {
        if (!this.data.is) {
            return [];
        }
        return this.data.is.map(function (is) {
            return typeof is === 'string' ? is : Object.keys(is)[0];
        });
    };
    Method.prototype.securedBy = function () {
        if (!this.data.securedBy) {
            return [];
        }
        return this.data.securedBy.map(function (securedBy) {
            return opt(typeof securedBy === 'string' ? securedBy : securedBy && Object.keys(securedBy)[0]);
        });
    };
    return Method;
})(AbstractNode);
exports.Method = Method;
var Response = (function (_super) {
    __extends(Response, _super);
    function Response(_method, _code, _data) {
        var _this = this;
        _super.call(this);
        this._method = _method;
        this._code = _code;
        this._data = _data;
        this.code = function () { return _this._code; };
        this.isOkRange = function () { return (Number(_this.code()) < 300 && Number(_this.code()) >= 200); };
        this.bodies = function () { return Object.keys(_this._data ? (_this._data.body || {}) : {}).map(function (mtype) { return new Body(_this._method, mtype, _this._data.body[mtype]); }); };
    }
    return Response;
})(AbstractNode);
exports.Response = Response;
var Body = (function (_super) {
    __extends(Body, _super);
    function Body(_method, _mediaType, _data) {
        var _this = this;
        _super.call(this);
        this._method = _method;
        this._mediaType = _mediaType;
        this._data = _data;
        this.example = function () { return opt(_this._data && _this._data.example); };
        this.formParameters = function () { return (_this._formData && _this._formData.formParameters) ? Param.build(1 /* form */, _this._formData.formParameters) : []; };
        this._formData = this._data;
    }
    Body.prototype.mediaType = function () {
        return this._mediaType;
    };
    Body.prototype.schema = function () {
        if (this._data != null) {
            if (this._data.schema) {
                var s = this._method.api().findSchemaByName(this._data.schema);
                if (s.isDefined()) {
                    return s;
                }
                s = this._method.api().findSchemaByContent(this._data.schema);
                if (s.isDefined()) {
                    return s;
                }
                var d = new SchemaDef(this._data.schema, this._data.schema);
                return opt(d);
            }
        }
        return opt();
    };
    return Body;
})(AbstractNode);
exports.Body = Body;
var MarkdownString = (function () {
    function MarkdownString(_value) {
        var _this = this;
        this._value = _value;
        this.value = function () { return _this._value; };
    }
    return MarkdownString;
})();
exports.MarkdownString = MarkdownString;
(function (ParamLocation) {
    ParamLocation[ParamLocation["query"] = 0] = "query";
    ParamLocation[ParamLocation["form"] = 1] = "form";
    ParamLocation[ParamLocation["uri"] = 2] = "uri";
    ParamLocation[ParamLocation["baseUri"] = 3] = "baseUri";
    ParamLocation[ParamLocation["header"] = 4] = "header";
})(exports.ParamLocation || (exports.ParamLocation = {}));
var ParamLocation = exports.ParamLocation;
(function (Protocol) {
    Protocol[Protocol["HTTP"] = 0] = "HTTP";
    Protocol[Protocol["HTTPS"] = 1] = "HTTPS";
})(exports.Protocol || (exports.Protocol = {}));
var Protocol = exports.Protocol;
var ProtocolHelper;
(function (ProtocolHelper) {
    var xxx = {
        "HTTP": 0 /* HTTP */,
        "HTTPS": 1 /* HTTPS */
    };
    function build(values) {
        return (values = values ? values : []).map(function (x) { return xxx[x.toUpperCase()]; });
    }
    ProtocolHelper.build = build;
})(ProtocolHelper || (ProtocolHelper = {}));
var Param = (function (_super) {
    __extends(Param, _super);
    function Param(_location, _name, _data) {
        var _this = this;
        _super.call(this);
        this._location = _location;
        this._name = _name;
        this._data = _data;
        this.name = function () { return _this._name; };
        this.location = function () { return _this._location; };
        this.definitions = function () { return _this._data.map(function (p) { return ParamDef.build(_this, p); }); };
        this.required = function () { return _this.definitions().every(function (x) { return x.required(); }); };
        this.validate = function (v) { return false; };
        if (this.definitions().length === 0)
            throw new Error("Parameter with no definitions");
    }
    Param.build = function (location, parameterMap) {
        return Object.keys(parameterMap || {}).map(function (name) { return new Param(location, name, util.asArray(parameterMap[name])); });
    };
    return Param;
})(AbstractNode);
exports.Param = Param;
var ParamDef = (function () {
    function ParamDef(_param, _data) {
        var _this = this;
        this._param = _param;
        this._data = _data;
        this.param = function () { return _this._param; };
        this.type = function () { return _this._data.type || 'string'; };
        this.required = function () { return _this._data.required === true; };
        this.enum = function () { return opt(_this._data.enum); };
    }
    ParamDef.prototype.description = function () {
        return opt(this._data.description).map(function (x) { return new MarkdownString(x); });
    };
    ParamDef.prototype.displayName = function () {
        return this._data.displayName;
    };
    ParamDef.prototype.default = function () {
        return opt(this._data.default);
    };
    ParamDef.prototype.example = function () {
        return opt(this._data.example);
    };
    ParamDef.prototype.repeat = function () {
        return this._data.repeat === true;
    };
    ParamDef.prototype.min = function () {
        return opt(this._data.minimum);
    };
    ParamDef.prototype.max = function () {
        return opt(this._data.maximum);
    };
    ParamDef.prototype.minLength = function () {
        return opt(this._data.minLength);
    };
    ParamDef.prototype.maxLength = function () {
        return opt(this._data.maxLength);
    };
    ParamDef.prototype.pattern = function () {
        return opt(this._data.pattern);
    };
    ParamDef.build = function (param, data) {
        return new ParamDef(param, data);
    };
    ParamDef.constructors = {
        "string": ParamDef_string,
        "boolean": ParamDef_boolean,
        "integer": ParamDef_number,
        "number": ParamDef_integer
    };
    return ParamDef;
})();
exports.ParamDef = ParamDef;
var ParamDef_string = (function (_super) {
    __extends(ParamDef_string, _super);
    function ParamDef_string() {
        _super.apply(this, arguments);
    }
    return ParamDef_string;
})(ParamDef);
exports.ParamDef_string = ParamDef_string;
var ParamDef_boolean = (function (_super) {
    __extends(ParamDef_boolean, _super);
    function ParamDef_boolean() {
        _super.apply(this, arguments);
    }
    return ParamDef_boolean;
})(ParamDef);
exports.ParamDef_boolean = ParamDef_boolean;
var ParamDef_number = (function (_super) {
    __extends(ParamDef_number, _super);
    function ParamDef_number() {
        _super.apply(this, arguments);
    }
    return ParamDef_number;
})(ParamDef);
exports.ParamDef_number = ParamDef_number;
var ParamDef_integer = (function (_super) {
    __extends(ParamDef_integer, _super);
    function ParamDef_integer() {
        _super.apply(this, arguments);
    }
    return ParamDef_integer;
})(ParamDef_number);
exports.ParamDef_integer = ParamDef_integer;
//# sourceMappingURL=Raml08Wrapper.js.map