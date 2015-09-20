var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var tsutil = require('./tsutil');
var util = require('./index');
var RamlWrapper = require('./Raml08Wrapper');
var TS = require('./TSDeclModel');
var JS2TS = require('./jsonschema2ts');
var XML2TS = require('./xmlschema2ts');
var Config = (function () {
    function Config() {
        this.numberIsString = true;
        this.createTypesForResources = true;
        this.queryParametersSecond = true;
        this.collapseGet = false;
        this.collapseOneMethod = false;
        this.collapseMediaTypes = false;
        this.methodNamesAsPrefixes = false;
        this.storeHarEntry = true;
        this.createTypesForParameters = true;
        this.reuseTypeForParameters = true;
        this.createTypesForSchemaElements = true;
        this.reuseTypesForSchemaElements = true;
        this.throwExceptionOnIncorrectStatus = false;
        this.async = false;
        this.debugOptions = {
            generateImplementation: true,
            generateSchemas: true,
            generateInterface: true,
            schemaNameFilter: function (name) {
                return true;
            },
            resourcePathFilter: null
        };
        this.overwriteModules = true;
    }
    return Config;
})();
exports.Config = Config;
exports.HAR_ENTRY_FIELD_NAME = '__$harEntry__';
exports.MEDIA_TYPE_SUFFIX = 'mediaTypeSuffix';
exports.MEDIA_TYPE_EXTENSION = 'mediaTypeExtension';
function raml2ts(api, cfg) {
    if (cfg === void 0) { cfg = new Config; }
    var mod = new ShortStyleModelBuilder(cfg).buildConversion()(api);
    var content = new DefaultModelSerializer(api, cfg).buildConversion()(mod);
    var content = "export function createApi(" + getPDecl(api) + "):Api{\n    return new ApiImpl(" + getPcalls(api) + ");\n}\n" + content + "\n";
    return content;
}
exports.raml2ts = raml2ts;
function getPDecl(api) {
    var result = [];
    api.baseUriParameters().forEach(function (x) {
        if (x.name() == "version") {
            return;
        }
        result.push(x.name() + ":string");
    });
    return result.join(",");
}
function getPcalls(api) {
    var result = [];
    api.baseUriParameters().forEach(function (x) {
        if (x.name() == "version") {
            return;
        }
        result.push(x.name());
    });
    return result.join(",");
}
function toComment(descriptionFromRAML) {
    var arrayOfLines = descriptionFromRAML.getOrElse(new RamlWrapper.MarkdownString("")).value().match(/[^\r\n]+/g);
    if (arrayOfLines != null) {
        if (arrayOfLines.length > 1) {
            var result = "";
            arrayOfLines.forEach(function (x) { return result += "*" + (x.length > 0 && x.charAt(0) == '/') ? ' ' + x : x + "\n"; });
            return result;
        }
    }
    return descriptionFromRAML.getOrElse(new RamlWrapper.MarkdownString("")).value();
}
var TSResourceMappedApiElement = (function (_super) {
    __extends(TSResourceMappedApiElement, _super);
    function TSResourceMappedApiElement(p, name, originalResource) {
        _super.call(this, p, name);
        this.originalResource = originalResource;
    }
    TSResourceMappedApiElement.prototype.absolutePath = function () {
        return this.originalResource.completeRelativeUri();
    };
    TSResourceMappedApiElement.prototype.commentCode = function () {
        return "\n        /**\n         * " + toComment(this.originalResource.description()) + "\n         * @ramlpath " + this.absolutePath() + "\n         **/\n\n\n         ";
    };
    return TSResourceMappedApiElement;
})(TS.TSAPIElementDeclaration);
var TSFullyMappedApiElement = (function (_super) {
    __extends(TSFullyMappedApiElement, _super);
    function TSFullyMappedApiElement(p, name, originalMethod) {
        var _this = this;
        _super.call(this, p, name, originalMethod.resource());
        this.returnStr = function () {
            if (_this.rangeType) {
                var rangeStr = _this.rangeType.serializeToString();
                if (_this.isFunction() && _this._config && _this._config.async) {
                    return ':Promise<' + rangeStr + '>';
                }
                else {
                    return ':' + rangeStr;
                }
            }
            else {
                return '';
            }
        };
        this.originalMethod = originalMethod;
    }
    TSFullyMappedApiElement.prototype.commentCode = function () {
        return "\n        /**\n         * " + toComment(this.originalMethod.description()) + "\n         * @ramlpath " + this.absolutePath() + "  " + this.originalMethod.method() + "\n         **/\n         ";
    };
    return TSFullyMappedApiElement;
})(TSResourceMappedApiElement);
function escapedName(name) {
    name = name.indexOf('/') == 0 ? name.substring(1) : name;
    name = name.replace(/[\{\}]/g, '');
    name = tsutil.escapeToIdentifier(name);
    name = name.replace(exports.MEDIA_TYPE_SUFFIX, "");
    name = name.replace(exports.MEDIA_TYPE_EXTENSION, "");
    return name;
}
exports.escapedName = escapedName;
function firstToUpper(q) {
    if (q.length == 0) {
        return q;
    }
    return q.charAt(0).toUpperCase() + q.substr(1);
}
var CollapsingJSONToTSConvertor = (function (_super) {
    __extends(CollapsingJSONToTSConvertor, _super);
    function CollapsingJSONToTSConvertor(name, owner) {
        _super.call(this, name, owner.module, owner.cfg);
        this.owner = owner;
    }
    CollapsingJSONToTSConvertor.prototype.createTypeDeclaration = function (pd) {
        var onm = firstToUpper(escapedName(this.name)) + firstToUpper(escapedName(pd.name));
        var nm = onm;
        var num = 0;
        while (this.module.getInterface(nm).isDefined()) {
            num++;
            nm = onm + num;
        }
        return new TS.TSInterface(this.module, nm);
    };
    CollapsingJSONToTSConvertor.prototype.replace = function (original) {
        if (this.owner.cfg.reuseTypesForSchemaElements) {
            this.owner.collapseToTypeAliasOrAdd(original);
        }
        else {
            this.module.addChild(original);
        }
        return _super.prototype.replace.call(this, original);
    };
    return CollapsingJSONToTSConvertor;
})(JS2TS.JSONSchematToTS);
var ResourceMappedReference = (function (_super) {
    __extends(ResourceMappedReference, _super);
    function ResourceMappedReference(p, _resourceInterface) {
        _super.call(this, p, _resourceInterface.name);
        this._resourceInterface = _resourceInterface;
    }
    ResourceMappedReference.prototype.resourceInterface = function () {
        return this._resourceInterface;
    };
    ResourceMappedReference.prototype.isFunctor = function () {
        return this._resourceInterface.isFunctor();
    };
    ResourceMappedReference.prototype.getFunctor = function () {
        return this._resourceInterface.getFunctor();
    };
    ResourceMappedReference.prototype.children = function () {
        return this._resourceInterface.children();
    };
    return ResourceMappedReference;
})(TS.TSSimpleTypeReference);
var ResourceMappedInterface = (function (_super) {
    __extends(ResourceMappedInterface, _super);
    function ResourceMappedInterface(p, name, _resource) {
        _super.call(this, p, name);
        this._resource = _resource;
    }
    ResourceMappedInterface.prototype.resource = function () {
        return this._resource;
    };
    ResourceMappedInterface.prototype.toReference = function () {
        return new ResourceMappedReference(TS.Universe, this);
    };
    return ResourceMappedInterface;
})(TS.TSInterface);
function emitParameter(cfg, x) {
    return cfg.collapseMediaTypes ? (x.name() != exports.MEDIA_TYPE_SUFFIX && x.name() != exports.MEDIA_TYPE_EXTENSION) : true;
}
exports.emitParameter = emitParameter;
var ShortStyleModelBuilder = (function () {
    function ShortStyleModelBuilder(cfg) {
        var _this = this;
        this.inlinable = function (r, resType) { return r.methods().length === 1; };
        this.schemas = [];
        this.schemaContentToSchema = {};
        this.schemaNameToSchema = {};
        this.typeHashToType = {};
        this.num = 0;
        this.raml2TSModel = function (api) {
            var mod = new TS.TSAPIModule(TS.Universe, _this.cfg);
            _this.module = mod;
            if (_this.cfg.debugOptions.generateSchemas) {
                var sh = api.schemas();
                if (_this.cfg.debugOptions.schemaNameFilter) {
                    sh = sh.filter(function (x) { return _this.cfg.debugOptions.schemaNameFilter(x.name()); });
                }
                sh.forEach(function (x) {
                    try {
                        var conv = _this.cfg.createTypesForSchemaElements ? new CollapsingJSONToTSConvertor(x.name(), _this) : new JS2TS.JSONSchematToTS(x.name(), _this.module);
                        var td = conv.parse(x.content());
                        _this.addSchema(td, x.name(), x.content());
                    }
                    catch (e) {
                    }
                });
            }
            var oldCfg = TS.Universe.getConfig();
            TS.Universe.setConfig(_this.cfg);
            if (_this.cfg.debugOptions.generateInterface) {
                var apidecl = new TS.TSInterface(mod, "Api");
                _this.processChildResources(apidecl, api);
            }
            TS.Universe.setConfig(oldCfg);
            return mod;
        };
        this.typesMap = {
            "integer": "number",
            "string": "string",
            "boolean": "boolean",
            "number": "number",
            "file": "string",
            "date": "string"
        };
        this.cfg = cfg;
    }
    ShortStyleModelBuilder.prototype.processResource = function (container, r, resType) {
        var _this = this;
        var uriParameters = r.uriParameters().filter(function (x) { return _this.collapse(x); }).map(function (p) {
            var defaultExt;
            var pName = p.name();
            if (pName == exports.MEDIA_TYPE_SUFFIX || pName == exports.MEDIA_TYPE_EXTENSION) {
                var extensions = {};
                p.definitions().filter(function (def) { return def.enum().isDefined(); }).forEach(function (def) { return def.enum().getOrThrow().map(function (v) { return v.toString(); }).forEach(function (v) {
                    if (v.toLowerCase().indexOf('json') >= 0) {
                        extensions['json'] = v;
                    }
                    else if (v.toLowerCase().indexOf('xml') >= 0) {
                        extensions['xml'] = v;
                    }
                    else {
                        extensions['default'] = v;
                    }
                }); });
                ['default', 'xml', 'json'].forEach(function (ext) {
                    if (extensions[ext]) {
                        defaultExt = extensions[ext];
                    }
                });
            }
            return new TS.Param(res, p.name(), TS.ParamLocation.URI, _this.getParamType(p), defaultExt);
        });
        var processResource = true;
        if (this.cfg.methodNamesAsPrefixes) {
            r.methods().sort(this.methodComparator).forEach(function (m) { return _this.customizeMethod(container, m, false, uriParameters); });
            processResource = r.resources().length > 0;
        }
        if (processResource) {
            if (!resType) {
                var relativeUri = r.relativeUri();
                if (relativeUri.length == 1) {
                    resType = container;
                }
                else {
                    var res = new TSResourceMappedApiElement(container, escapedName(relativeUri), r);
                    resType = this.createResourceType(res);
                    res.rangeType = resType.toReference();
                    res.parameters = uriParameters;
                }
            }
            this.processChildResources(resType, r);
        }
        if (!this.cfg.methodNamesAsPrefixes && resType) {
            r.methods().sort(this.methodComparator).forEach(function (m) { return _this.customizeMethod(resType, m, _this.inlinable(r, resType)); });
        }
        return resType;
    };
    ShortStyleModelBuilder.prototype.methodComparator = function (m1, m2) {
        var methodOrder = {
            'options': 1,
            'delete': 2,
            'patch': 3,
            'put': 4,
            'post': 5,
            'get': 6
        };
        var i1 = methodOrder[m1.method()];
        var i2 = methodOrder[m2.method()];
        i1 = i1 ? i1 : 0;
        i2 = i2 ? i2 : 0;
        return i2 - i1;
    };
    ShortStyleModelBuilder.prototype.processChildResources = function (resType, r) {
        var _this = this;
        var map = {};
        r.resources().forEach(function (x) {
            var uri = x.relativeUri();
            var keyUri = uri.replace('{' + exports.MEDIA_TYPE_EXTENSION + '}', '').replace('{' + exports.MEDIA_TYPE_SUFFIX + '}', '');
            var arr = map[keyUri];
            if (!arr) {
                arr = [];
                map[keyUri] = arr;
            }
            if (uri != keyUri) {
                map[keyUri] = [x].concat(arr);
            }
            else {
                arr.push(x);
            }
        });
        Object.keys(map).forEach(function (x) {
            var arr = map[x];
            var childResType = _this.processResource(resType, arr[0]);
            for (var i = 1; i < arr.length; i++) {
                _this.processResource(resType, arr[i], childResType);
            }
        });
    };
    ShortStyleModelBuilder.prototype.createResourceType = function (meth) {
        if (this.cfg.createTypesForResources) {
            var mz = meth.name;
            if (!mz) {
                mz = "Unknown";
            }
            var onm = firstToUpper(mz) + "Resource";
            var nm = onm;
            var num = 0;
            while (this.module.getInterface(nm).isDefined()) {
                num++;
                nm = onm + num;
            }
            return new ResourceMappedInterface(this.module, nm, meth);
        }
        return new TS.TSStructuralTypeReference(meth);
    };
    ShortStyleModelBuilder.prototype.collapse = function (x) {
        return emitParameter(this.cfg, x);
    };
    ShortStyleModelBuilder.prototype.convertTypeName = function (tp) {
        if (tp == "integer") {
            return "number;";
        }
        if (this.cfg.numberIsString) {
            if (tp == "string") {
                return "string|number|boolean;";
            }
        }
        return tp;
    };
    ShortStyleModelBuilder.prototype.addSchema = function (schema, name, content) {
        this.schemas.push(schema);
        this.schemaContentToSchema[content] = schema;
        this.schemaNameToSchema[name] = schema;
    };
    ShortStyleModelBuilder.prototype.createSchema = function (name, content, mediaType, appendHar) {
        if (appendHar === void 0) { appendHar = false; }
        try {
            if (this.cfg.debugOptions.schemaNameFilter) {
                if (!this.cfg.debugOptions.schemaNameFilter(content)) {
                    return new TS.TSInterface(TS.Universe, "Dummy").toReference();
                }
            }
            var tr;
            var iName = escapedName(name);
            if (mediaType.indexOf('json') >= 0) {
                tr = new JS2TS.JSONSchematToTS(iName, this.module, this.cfg).parse(content, appendHar);
            }
            else if (mediaType.indexOf('xml') >= 0) {
                tr = new XML2TS.XMLSchematToTS(iName, this.module, this.cfg).parse(content, appendHar);
            }
            this.addSchema(tr, name, content);
            return tr;
        }
        catch (e) {
            console.log(e.stack);
        }
    };
    ShortStyleModelBuilder.prototype.schemas2ts = function (bodies, appendHar) {
        var _this = this;
        var result = new TS.AnyType();
        var jsonSchemas = bodies.filter(function (x) { return x.mediaType().indexOf("json") >= 0; }).map(function (x) { return x.schema(); }).filter(function (x) { return x.isDefined(); }).map(function (x) { return x.value(); });
        if (jsonSchemas.length > 0) {
            jsonSchemas.forEach(function (x) { return result = result.union(_this.schema2ts(x, 'json', appendHar)); });
            if (this.cfg && this.cfg.collapseMediaTypes) {
                return result;
            }
        }
        var xmlSchemas = bodies.filter(function (x) { return x.mediaType().indexOf("xml") >= 0; }).map(function (x) { return x.schema(); }).filter(function (x) { return x.isDefined(); }).map(function (x) { return x.value(); });
        xmlSchemas.forEach(function (x) { return result = result.union(_this.schema2ts(x, 'xml', appendHar)); });
        return result;
    };
    ShortStyleModelBuilder.prototype.schema2ts = function (nm, mediaType, appendHar) {
        if (appendHar === void 0) { appendHar = false; }
        return this.schemaNameToSchema[nm.name()] || this.schemaContentToSchema[nm.content()] || this.createSchema(nm.name(), nm.content(), mediaType, appendHar);
    };
    ShortStyleModelBuilder.prototype.customizeMethod = function (parent, ramlMethod, doInline, uriParameters) {
        var _this = this;
        var methodName = escapedName(ramlMethod.method());
        ;
        if (this.cfg.methodNamesAsPrefixes) {
            methodName = methodName + firstToUpper(escapedName(ramlMethod.resource().relativeUri()));
        }
        else if (((ramlMethod.method() === "get") && this.cfg.collapseGet) || (doInline && this.cfg.collapseOneMethod)) {
            methodName = "";
        }
        var method = new TSFullyMappedApiElement(parent, methodName, ramlMethod);
        var ptype = new TS.TSStructuralTypeReference(method);
        if (this.cfg.createTypesForParameters) {
            if (parent.parent() instanceof TSResourceMappedApiElement) {
                var tn = firstToUpper(parent.parent().name) + firstToUpper(method.name) + "Options";
                ptype = new TS.TSInterface(TS.Universe, (tn));
            }
            else {
                var tn = firstToUpper(parent.name) + firstToUpper(method.name) + "Options";
                ptype = new TS.TSInterface(TS.Universe, (tn));
            }
        }
        this.processParameters(ptype, ramlMethod.queryParameters(), "");
        this.processParameters(ptype, ramlMethod.headers(), "header_");
        if (ramlMethod.bodies()) {
            ramlMethod.bodies().forEach(function (x) { return _this.processParameters(ptype, x.formParameters(), "form_"); });
        }
        if (this.cfg.reuseTypeForParameters) {
            this.collapseToTypeAliasOrAdd(ptype);
        }
        var responseBodies = [];
        ramlMethod.responses().filter(function (x) { return x.isOkRange(); }).forEach(function (x) { return responseBodies = responseBodies.concat(x.bodies()); });
        var returnType = this.schemas2ts(responseBodies, true);
        var bodyType = this.schemas2ts(ramlMethod.bodies(), false);
        var opParam = new TS.Param(method, "options", TS.ParamLocation.OPTIONS, ptype.toReference());
        opParam.optional = ptype.canBeOmmited();
        method.parameters.push(opParam);
        if (!(bodyType instanceof TS.AnyType)) {
            method.parameters.push(new TS.Param(method, "payload", TS.ParamLocation.BODY, bodyType));
        }
        if (this.cfg.queryParametersSecond) {
            method.parameters = method.parameters.reverse();
        }
        if (uriParameters) {
            method.parameters = uriParameters.concat(method.parameters);
        }
        method.rangeType = returnType;
    };
    ShortStyleModelBuilder.prototype.generateFormSchema = function (body, method) {
        var segment = '';
        var segments = method.resource().completeRelativeUri().split('/');
        for (var i = segments.length - 1; i >= 0; i--) {
            var str = segments[i];
            if (str.trim().length == 0) {
                continue;
            }
            var ind = str.indexOf('{');
            if (ind == 0) {
                continue;
            }
            else if (ind < 0) {
                ind = str.length;
            }
            segment = str.substring(0, ind);
            break;
        }
        var oName = firstToUpper(escapedName(segment)) + firstToUpper(method.method()) + "Form";
        var name = oName;
        var i = 1;
        while (this.module.getInterface(name).isDefined()) {
            name = oName + i++;
        }
        var tsi = new TS.TSInterface(this.module, name);
        body.formParameters().forEach(function (x) {
            var pd = new TS.TSAPIElementDeclaration(tsi, x.name());
            pd.optional = !x.required();
            var definitions = x.definitions();
            if (definitions.length == 1) {
                var propType = tsutil.ramlType2TSType(definitions[0].type());
                pd.rangeType = new TS.TSSimpleTypeReference(pd, propType);
            }
            else {
                pd.rangeType = new TS.AnyType();
                definitions.forEach(function (d) {
                    var propType = tsutil.ramlType2TSType(d.type());
                    var st = new TS.TSSimpleTypeReference(pd, propType);
                    pd.rangeType.union(st);
                });
            }
        });
        return tsi.toReference();
    };
    ShortStyleModelBuilder.prototype.collapseToTypeAliasOrAdd = function (ptype) {
        var hash = ptype.hash();
        var ptasInt = ptype;
        var et = this.typeHashToType[hash];
        if (et) {
            var onm = ptasInt.name;
            var nm = onm;
            var num = 0;
            while (this.module.getInterface(nm).isDefined()) {
                num++;
                nm = onm + num;
            }
            new TS.TSTypeAssertion(this.module, nm, et.toReference());
        }
        else {
            this.typeHashToType[hash] = ptasInt;
            this.module.addChild(ptasInt);
        }
    };
    ShortStyleModelBuilder.prototype.processParameters = function (ptype, actualParameters, namePref) {
        var _this = this;
        actualParameters.forEach(function (actualParameter) {
            var p = new TS.TSAPIElementDeclaration(ptype, namePref + actualParameter.name());
            p.rangeType = _this.getParamType(actualParameter);
            p.optional = !actualParameter.required();
        });
    };
    ShortStyleModelBuilder.prototype.buildConversion = function () {
        return this.raml2TSModel;
    };
    ShortStyleModelBuilder.prototype.getParamType = function (actualParameter) {
        var _this = this;
        var tp = new TS.AnyType();
        actualParameter.definitions().forEach(function (x) { return tp = tp.union(new TS.TSSimpleTypeReference(TS.Universe, _this.mapRamlType(x.type()))); });
        return tp;
    };
    ShortStyleModelBuilder.prototype.mapRamlType = function (ramlType) {
        var result = this.typesMap[ramlType];
        if (!result) {
            result = "string";
        }
        return result;
    };
    return ShortStyleModelBuilder;
})();
var DefaultGenerator = (function () {
    function DefaultGenerator() {
        this.strings = [];
    }
    DefaultGenerator.prototype.append = function (s) {
        this.strings.push(s);
    };
    DefaultGenerator.prototype.getResult = function () {
        return this.strings.join("");
    };
    return DefaultGenerator;
})();
var ImplementationGenerator = (function () {
    function ImplementationGenerator(cfg) {
        this.generatedDeclarations = [];
        this.generatedCode = [];
        this.isInP = false;
        this.level = 0;
        this.isInPatch = false;
        this.isInFunct = false;
        this.isInFunction = false;
        this.cfg = cfg;
    }
    ImplementationGenerator.prototype.betweenElements = function () {
        if (this.level > 1) {
            this.generatedCode.push(",\n");
        }
    };
    ImplementationGenerator.prototype.getResult = function () {
        return this.generatedCode.join("");
    };
    ImplementationGenerator.prototype.startTypeDeclaration = function (decl) {
        var _this = this;
        this.generatedCode.push("\n{\n");
        this.isInP = this.isInPatch;
        this.isInPatch = false;
        if (this.level == 0) {
            this.generateDeclarations();
            this.level++;
            decl.children().forEach(function (x) { return _this.writePatchPart(x, "(<any>this)", false); });
            this.generatedCode.push("}\n");
            this.level--;
        }
        this.level++;
        return true;
    };
    ImplementationGenerator.prototype.genInvoke = function () {
        return;
        "invoke(path:string,method:string,obj:any){\n            env.registerApi(this.declaration())\n            return this.inv(path,method,obj)\n         }";
    };
    ImplementationGenerator.prototype.generateConstructorParameters = function () {
        return "op:any={}";
    };
    ImplementationGenerator.prototype.generateOpAssignment = function () {
        return "this.options=op;";
    };
    ImplementationGenerator.prototype.generateDeclarations = function () {
        this.generatedCode.push("\n            private inv:invoker\n            private options:any\n            " + this.genInvoke() + "\n            constructor(" + this.generateConstructorParameters() + "inv:invoker=null/*fixme*/){\n\n            " + this.generateOpAssignment() + "\n            ");
    };
    ImplementationGenerator.prototype.endTypeDeclaration = function (decl) {
        this.generatedCode.push("\n" + " /* type ending */ }" + "\n");
        this.level--;
        this.isInPatch = this.isInP;
    };
    ImplementationGenerator.prototype.startVisitElement = function (decl) {
        if (!this.isInPatch) {
            this.generatedCode.push("" + decl.name);
        }
        if (decl.rangeType != null && decl.rangeType.isFunctor()) {
            this.generateFunctionInline(decl);
            return false;
        }
        if (decl.isFunction()) {
            if (!this.isInPatch && !this.isInFunction) {
                this.generatedCode.push(this.level > 1 ? ":" : (this.isInFunct ? ":any =" : "="));
            }
            this.generatedCode.push(decl.paramStr(true));
            this.generatedCode.push("=>{\n");
            this.generatedCode.push("var res=<any> \n");
            if (decl.rangeType) {
                if (decl.rangeType instanceof TS.TSSimpleTypeReference || decl.rangeType instanceof TS.TSUnionTypeReference) {
                    if (!(decl.rangeType instanceof ResourceMappedReference)) {
                        this.generateCall(decl);
                    }
                    else {
                        if (decl.rangeType instanceof ResourceMappedReference) {
                            this.subResourceProxyCreation(decl, decl.rangeType);
                        }
                    }
                }
            }
            else {
                throw new Error("Range type is not defined");
            }
        }
        else {
            if (decl.rangeType instanceof ResourceMappedReference) {
                var q = decl;
                var ref = decl.rangeType;
                if (ref.resourceInterface().isFunctor()) {
                    var c = this.isInFunct;
                    this.isInFunct = true;
                    var funct = ref.resourceInterface().getFunctor();
                    funct.visit(this);
                    this.isInFunct = c;
                    return false;
                }
                else {
                    if (!this.isInPatch) {
                        this.generatedCode.push("=");
                    }
                    this.subResourceProxyCreation(decl, ref);
                }
            }
            else {
                throw new Error("Should not happen");
            }
        }
        return true;
    };
    ImplementationGenerator.prototype.subResourceProxyCreation = function (decl, ref) {
        var _this = this;
        this.generatedCode.push("new " + ref.name + "Impl(");
        decl.parameters.forEach(function (x) { return _this.generatedCode.push(x.name + ","); });
        this.generatedCode.push("this)\n");
        var p = null;
        this.genSubResource(decl, p, ref);
    };
    ImplementationGenerator.prototype.genSubResource = function (decl, p, ref) {
        var rimplGen = new ResourceImplementationGenerator(decl, p, this.cfg);
        if (ref.resourceInterface) {
            ref.resourceInterface().visit(rimplGen);
        }
        this.generatedDeclarations = this.generatedDeclarations.concat(rimplGen.generatedDeclarations);
        this.generatedDeclarations.push("class " + ref.name + "Impl\n" + rimplGen.getResult());
    };
    ImplementationGenerator.prototype.generateFunctionInline = function (decl) {
        var c = this.isInFunct;
        var isInFucntion = this.isInFunction;
        this.isInFunct = true;
        if (decl.isFunction()) {
            this.generatedCode.push(decl.paramStr() + ":any" + (this.isInPatch ? "=>" : "") + "{\n");
            this.generatedCode.push("var result:any= ");
            this.isInFunction = true;
        }
        var funct = decl.rangeType.getFunctor();
        if (funct != null) {
            funct.visit(this);
        }
        else {
            this.generatedCode.push("{}\n");
        }
        if (decl.isFunction()) {
            this.writePatchPart(decl, "result", true);
            this.generatedCode.push("return result\n");
            this.generatedCode.push("}\n");
        }
        this.isInFunct = c;
        this.isInFunction = isInFucntion;
    };
    ImplementationGenerator.prototype.generateCall = function (decl) {
        if (decl instanceof TSFullyMappedApiElement) {
            var q = decl;
            var ru = q.originalResource.completeRelativeUri();
            if (this.cfg.collapseMediaTypes) {
                ru = ru.replace("{" + exports.MEDIA_TYPE_SUFFIX + "}", "JSON");
                ru = ru.replace("{" + exports.MEDIA_TYPE_EXTENSION + "}", ".json");
            }
            var resolvedUrl = this.urlTemplate(ru, decl);
            this.generatedCode.push("this.invoke(" + resolvedUrl + ",'" + q.originalMethod.method() + "',{\n");
            this.generatedCode.push(q.parameters.filter(function (x) { return !x.isEmpty(); }).map(function (x) { return ("\"" + x.name + "\":") + x.name + "\n"; }).join(", "));
            this.generatedCode.push('});\n');
        }
        else {
            throw new Error("Should never happen");
        }
    };
    ImplementationGenerator.prototype.urlTemplate = function (ru, decl) {
        var s1 = "`";
        for (var i = 0; i < ru.length; i++) {
            var c = ru.charAt(i);
            if (c == '{') {
                s1 = s1 + "$";
            }
            s1 += c;
        }
        s1 += '`';
        return s1;
    };
    ImplementationGenerator.prototype.writePatch = function (decl, path) {
        var _this = this;
        if (decl.rangeType) {
            decl.rangeType.children().forEach(function (x) {
                if (x.rangeType != null && x.rangeType.isFunctor()) {
                    x.rangeType.children().forEach(function (y) {
                        if (!y.isAnonymousFunction()) {
                            var newPath = path + "." + x.name + "." + y.name;
                            _this.generatedCode.push(newPath + "=");
                            _this.writePatchDetails(y);
                            _this.writePatchPart(y, newPath, false);
                        }
                    });
                }
            });
        }
    };
    ImplementationGenerator.prototype.writePatchDetails = function (y) {
        var ts = this.isInPatch;
        this.isInPatch = true;
        y.visit(this);
        this.isInPatch = ts;
        this.generatedCode.push(";\n");
    };
    ImplementationGenerator.prototype.writePatchPart = function (x, path, functionAllowed) {
        var _this = this;
        if (x.rangeType != null && x.rangeType.isFunctor() && (!x.isFunction() || functionAllowed)) {
            x.rangeType.children().forEach(function (y) {
                if (!y.isAnonymousFunction()) {
                    var newPath = path + "." + (!functionAllowed ? (x.name + ".") : "") + y.name;
                    _this.generatedCode.push(newPath + "=");
                    _this.writePatchDetails(y);
                }
            });
        }
    };
    ImplementationGenerator.prototype.endVisitElement = function (decl) {
        if (decl.isFunction()) {
            this.writePatch(decl, "res");
            this.generatedCode.push("return res;/*d*" + decl.name + "*/}");
            this.generatedCode.push("\n");
        }
    };
    return ImplementationGenerator;
})();
var ApiImplementationGenerator = (function (_super) {
    __extends(ApiImplementationGenerator, _super);
    function ApiImplementationGenerator(_api, cfg) {
        _super.call(this, cfg);
        this._api = _api;
    }
    ApiImplementationGenerator.prototype.generateDeclarations = function () {
        var burl = (this._api.baseUri().isDefined() ? this._api.baseUri().value() : null).trim();
        if (util.stringEndsWith(burl, '/')) {
            burl = burl.substring(0, burl.length - 1);
        }
        this.generatedCode.push("private baseUrl:string='" + burl + "'\n");
        this.generatedCode.push("private cfgEncoded=/*CONFIGENCODEDSTART*/" + JSON.stringify(this.cfg) + ";/*CONFIGENCODEDEND*/\n");
        this.generatedCode.push("private apiEncoded=/*APIENCODEDSTART*/" + JSON.stringify(this._api) + ";/*APIENCODEDEND*/\n");
        this.generatedCode.push("declaration():RamlWrapper.Api{var api : RamlWrapper.Api = new RamlWrapper.Api(<any>this.apiEncoded.data); endpoints.setApi(api); return api;}\n");
        this.generatedCode.push("authentificate(schemaName:string, options?:any){}\n");
        this.generateAuthentification();
        this.generateBaseUrlResolveCall();
        this.generatedCode.push("\n            private inv:executor.APIExecutor\n            private options:any\n            " + this.genInvoke() + "\n            authenticate(schemaName?:string,options?:any):any{return null;}\n            constructor(" + this.generateConstructorParameters() + "){\n            this.inv=new executor.APIExecutor(this.declaration(),this.baseUrlResolved(),<any>this.cfgEncoded);\n            " + this.generateOpAssignment() + "\n            ");
    };
    ApiImplementationGenerator.prototype.genInvoke = function () {
        var executeMethod = this.cfg && this.cfg.async ? 'executeAsync' : 'execute';
        return "\n        invoke(path:string,method:string,obj:any){\n            env.registerApi(this.declaration())\n            return this.inv." + executeMethod + "(this.baseUrlResolved()+path,method,obj)\n        }";
    };
    ApiImplementationGenerator.prototype.generateParameterReplace = function () {
        var _this = this;
        var result = "";
        this._api.baseUriParameters().forEach(function (x) {
            if (x.name() == "version") {
                result = result + "burl=burl.replace('{" + x.name() + "}'," + "'" + (_this._api.version().isDefined() ? _this._api.version().value() : 1) + "')\n";
            }
            else {
                result = result + "burl=burl.replace('{" + x.name() + "}'," + "this._" + x.name() + ")\n";
            }
        });
        return result;
    };
    ApiImplementationGenerator.prototype.generateOpAssignment = function () {
        return "";
    };
    ApiImplementationGenerator.prototype.generateBaseUrlResolveCall = function () {
        this.generatedCode.push("baseUrlResolved():string{\n        var burl=this.baseUrl;\n        " + this.generateParameterReplace() + "\n        return burl;\n        }");
    };
    ApiImplementationGenerator.prototype.generateConstructorParameters = function () {
        var result = [];
        this._api.baseUriParameters().forEach(function (x) {
            if (x.name() == "version") {
                return;
            }
            result.push("private _" + x.name() + ":string");
        });
        return result.join(',');
    };
    ApiImplementationGenerator.prototype.generateAuthentification = function () {
        this.generatedCode.push("log(vName:string,val:any){this.inv.log(vName,val);return val;}");
    };
    return ApiImplementationGenerator;
})(ImplementationGenerator);
var ResourceImplementationGenerator = (function (_super) {
    __extends(ResourceImplementationGenerator, _super);
    function ResourceImplementationGenerator(_decl, _parent, cfg) {
        _super.call(this, cfg);
        this._decl = _decl;
        this._parent = _parent;
    }
    ResourceImplementationGenerator.prototype.urlTemplate = function (url, decl) {
        var methodUrlParameters = {};
        if (this.cfg.methodNamesAsPrefixes && decl.isFunction()) {
            decl.parameters.forEach(function (x) {
                if (x.location === TS.ParamLocation.URI) {
                    methodUrlParameters[x.name] = true;
                }
            });
        }
        var s1 = "`";
        for (var i = 0; i < url.length; i++) {
            var c = url.charAt(i);
            if (c == '{') {
                var ind = url.indexOf('}', i);
                ind = ind < 0 ? url.length : ind;
                var paramName = url.substring(i + 1, ind);
                s1 += this.isInPatch || methodUrlParameters[paramName] ? "${" : "${this.";
            }
            else {
                s1 += c;
            }
        }
        s1 += '`';
        return s1;
    };
    ResourceImplementationGenerator.prototype.subResourceProxyCreation = function (decl, ref) {
        var _this = this;
        this.generatedCode.push("new " + ref.name + "Impl(");
        var c = this;
        var declArray = [];
        while (c) {
            if (c._decl.parameters && c._decl.parameters.length > 0) {
                declArray.push(c._decl);
            }
            c = c._parent;
        }
        declArray.reverse().forEach(function (x) { return x.parameters.filter(function (p) { return p.name != exports.MEDIA_TYPE_EXTENSION && p.name != exports.MEDIA_TYPE_SUFFIX; }).forEach(function (p) { return _this.generatedCode.push("this." + p.name + ","); }); });
        decl.parameters.forEach(function (x) { return _this.generatedCode.push(x.name + ","); });
        this.generatedCode.push("this)\n");
        var p = this;
        this.genSubResource(decl, p, ref);
    };
    ResourceImplementationGenerator.prototype.extraParams = function () {
        var q = this;
        var declArray = [];
        for (var q = this; q; q = q._parent) {
            declArray.push(q._decl);
        }
        var str = '';
        declArray.reverse().forEach(function (x, i) { return x.parameters.forEach(function (p) {
            var pName = p.name;
            var isExt = pName == exports.MEDIA_TYPE_EXTENSION || pName == exports.MEDIA_TYPE_SUFFIX;
            if (isExt && i < declArray.length - 1) {
                return;
            }
            str += "private " + pName + ', ';
        }); });
        return str;
    };
    ResourceImplementationGenerator.prototype.generateDeclarations = function () {
        var extraParams = this.extraParams();
        var mtCorrectingCommand = '';
        if (extraParams.indexOf('mediaTypeExtension') >= 0) {
            mtCorrectingCommand = "if(this.mediaTypeExtension){\n                if(this.mediaTypeExtension.length>0){\n                    this.mediaTypeExtension = (\".\" + this.mediaTypeExtension).replace(\"..\",\".\")\n                }\n            }";
        }
        this.generatedCode.push("\n\n            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}\n            constructor(" + extraParams + " private _parent:{invoke(path:string,method:string,obj:any):void}){\n                " + mtCorrectingCommand + "\n            ");
    };
    return ResourceImplementationGenerator;
})(ImplementationGenerator);
var MetadataGenerator = (function (_super) {
    __extends(MetadataGenerator, _super);
    function MetadataGenerator() {
        _super.apply(this, arguments);
    }
    MetadataGenerator.prototype.startTypeDeclaration = function (decl) {
        this.append("{/*ts*/");
        return true;
    };
    MetadataGenerator.prototype.endTypeDeclaration = function (decl) {
        this.append("}");
    };
    MetadataGenerator.prototype.betweenElements = function () {
        this.append(",");
    };
    MetadataGenerator.prototype.startVisitElement = function (decl) {
        if (decl.isFunction()) {
        }
        else {
        }
        return true;
    };
    MetadataGenerator.prototype.endVisitElement = function (decl) {
        this.append("}");
    };
    return MetadataGenerator;
})(DefaultGenerator);
var DefaultModelSerializer = (function () {
    function DefaultModelSerializer(_api, cfg) {
        var _this = this;
        this._api = _api;
        this.tsModule2Src = function (mod) {
            var ig = new ApiImplementationGenerator(_this._api, _this.cfg);
            if (_this.cfg.debugOptions.generateImplementation) {
                mod.getInterface("Api").value().visit(ig);
            }
            mod.getInterface("Api").getOrThrow().addCode("declaration():RamlWrapper.Api");
            mod.getInterface("Api").getOrThrow().addCode("authenticate(schemaName?:string,options?:any):any");
            mod.getInterface("Api").value().addCode("log(vName:string,val:any)");
            var ret = "\n            " + (_this.cfg.storeHarEntry ? 'export interface UnknownResponse{ ' + exports.HAR_ENTRY_FIELD_NAME + ' : har.Entry }' : '') + "\n            export interface payloadType{}\n            export interface responseType{}\n            export interface invoker{ (url:String,method:string,options:any):any; }\n            export class ApiImpl implements Api " + ig.getResult() + "\n            ";
            var schemas = "";
            mod.children().forEach(function (x) { return schemas += x.serializeToString(); });
            ret = ig.generatedDeclarations.join("") + schemas + ret;
            ret += "\n var meta={}";
            return "import RamlWrapper=require('./Raml08Wrapper')\n        import executor=require('./executor')\n        import env=require('./executionEnvironment')\n        import endpoints=require('./endpoints')\n\n        env.setPath(__dirname);\n        env.getReportManager().setLogPath(__dirname);\n\n            " + ret;
        };
        this.cfg = cfg;
    }
    DefaultModelSerializer.prototype.buildConversion = function () {
        return this.tsModule2Src;
    };
    return DefaultModelSerializer;
})();
//# sourceMappingURL=raml2ts.js.map