var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Opt = require('./Opt');
var tsc = require('typescript-compiler');
var jsonix = require('jsonix');
var JSON2TS = require('./jsonschema2ts');
var XML = require('./xmlutil');
var TS = require('./TSDeclModel');
var ANY_TYPE = "__any_type__";
var SIMPLE_TYPE = "__simple_type__";
var XSD_2_TS_TYPE_MAP = {
    "ENTITIES": "string",
    "ENTITY": "string",
    "ID": "string",
    "IDREF": "string",
    "IDREFS": "string",
    "language": "string",
    "Name": "string",
    "NCName": "string",
    "NMTOKEN": "string",
    "NMTOKENS": "string",
    "normalizedString": "string",
    "QName": "string",
    "string": "string",
    "token": "string",
    "date": "string",
    "dateTime": "string",
    "duration": "string",
    "gDay": "string",
    "gMonth": "string",
    "gMonthDay": "string",
    "gYear": "string",
    "gYearMonth": "string",
    "time": "string",
    "anyURI": "string",
    "base64Binary": "string",
    "hexBinary": "string",
    "NOTATION": "string",
    "boolean": "boolean",
    "double": "number",
    "float": "number",
    "byte": "number",
    "decimal": "number",
    "int": "number",
    "integer": "number",
    "long": "number",
    "negativeInteger": "number",
    "nonNegativeInteger": "number",
    "nonPositiveInteger": "number",
    "positiveInteger": "number",
    "short": "number",
    "unsignedLong": "number",
    "unsignedInt": "number",
    "unsignedShort": "number",
    "unsignedByte": "number"
};
var XMLSchematToTS = (function () {
    function XMLSchematToTS(name, module, cfg) {
        this.simpleTypes = {};
        this.complexTypes = {};
        this.cfg = cfg;
        this.name = name.charAt(0).toUpperCase() + name.substr(1);
        this.name = this.name.replace("-", "");
        this.module = module;
    }
    XMLSchematToTS.prototype.parse = function (schema, appendHar) {
        if (appendHar === void 0) { appendHar = false; }
        var schemaObject = parseSchema(schema);
        return this.createInterface(schemaObject, appendHar);
    };
    XMLSchematToTS.prototype.createInterface = function (obj, appendHar) {
        var _this = this;
        var tsi = new TS.TSInterface(this.module ? this.module : TS.Universe, this.name);
        var result = new TS.AnyType();
        var rootElements = this.getRootElements(obj);
        rootElements.forEach(function (x) { return _this.processProperty(x, tsi, rootElements.length > 1); });
        if (this.generateHarEntry() && appendHar) {
            new JSON2TS.JSONSchematToTS("SomeType").appendHarEntry(tsi);
        }
        return tsi.toReference();
    };
    XMLSchematToTS.prototype.generateHarEntry = function () {
        return this.cfg ? this.cfg.storeHarEntry : false;
    };
    XMLSchematToTS.prototype.getRootElements = function (obj) {
        var _this = this;
        var objValue = obj['value'];
        var result = [];
        if (objValue) {
            var simpleTypes = objValue['simpleType'];
            if (simpleTypes) {
                simpleTypes.forEach(function (x) { return _this.simpleTypes[x.name] = x; });
            }
            var complexTypes = objValue['complexType'];
            if (complexTypes) {
                complexTypes.forEach(function (x) { return _this.complexTypes[x.name] = x; });
            }
            var rootElements = objValue['element'];
            if (rootElements) {
                result = rootElements.map(function (x) { return new ElementDescription(_this, x); });
            }
        }
        return result;
    };
    XMLSchematToTS.prototype.processElement = function (element, parent) {
        var _this = this;
        var typeOpt = element.type();
        while (typeOpt.isDefined()) {
            var eType = typeOpt.getOrThrow();
            var elements = eType.elements();
            elements.forEach(function (x) { return _this.processProperty(x, parent); });
            var attributes = eType.attributes();
            attributes.forEach(function (x) { return _this.processProperty(x, parent); });
            typeOpt = eType.base();
        }
    };
    XMLSchematToTS.prototype.processProperty = function (prop, parent, optional) {
        if (optional === void 0) { optional = false; }
        var propName = prop.isAttribute() ? '@' + prop.name() : prop.name();
        var pd = new TS.TSAPIElementDeclaration(parent, propName);
        pd.optional = optional || prop.optional();
        var eType = prop.type().getOrThrow();
        if (eType.isSimple()) {
            var xsdTypeName = eType.getBaseName();
            var tsTypeName = XSD_2_TS_TYPE_MAP[xsdTypeName.substring(xsdTypeName.indexOf(':') + 1)];
            if (!tsTypeName) {
                throw new Error("Unable to resolze XSD simple type: " + xsdTypeName);
            }
            pd.rangeType = new TS.TSSimpleTypeReference(pd, tsTypeName);
        }
        else {
            if (prop.isAttribute()) {
                throw new Error("Attribute with complex type occured in " + this.name);
            }
            if (eType.name() && ANY_TYPE == eType.name()) {
                pd.rangeType = new TS.AnyType();
            }
            else {
                var td = new TS.TSStructuralTypeReference(pd);
                this.processElement(prop, td);
                pd.rangeType = td.toReference();
            }
        }
        pd.rangeType.array = prop.isArray();
    };
    return XMLSchematToTS;
})();
exports.XMLSchematToTS = XMLSchematToTS;
var PropertyDescription = (function () {
    function PropertyDescription(owner, _object) {
        var _this = this;
        this.owner = owner;
        this._object = _object;
        this.name = function () { return _this._object['name']; };
    }
    PropertyDescription.prototype.type = function () {
        var typeName;
        var typeObject;
        var isSimple = false;
        if (this._object['type']) {
            var typeObj = this._object['type'];
            typeName = extractName(typeObj);
            var sType = this.owner.simpleTypes[typeName];
            if (sType) {
                typeObject = sType;
                isSimple = true;
            }
            var cType = this.owner.complexTypes[typeName];
            if (cType) {
                typeObject = cType;
            }
            if ((typeName.indexOf('xs:') == 0 || typeName.indexOf('xsd:') == 0)) {
                if (typeName.substring(typeName.indexOf(':') + 1) != 'any') {
                    isSimple = true;
                }
            }
        }
        else if (this._object['complexType']) {
            typeObject = this._object['complexType'];
        }
        else if (this._object['simpleType']) {
            typeObject = this._object['simpleType'];
        }
        var result = new TypeDescription(this.owner, typeName, isSimple, typeObject);
        return new Opt(result);
    };
    PropertyDescription.prototype.optional = function () {
        throw new Error("This method is abstract.");
    };
    PropertyDescription.prototype.isArray = function () {
        throw new Error("This method is abstract.");
    };
    PropertyDescription.prototype.isAttribute = function () {
        return false;
    };
    return PropertyDescription;
})();
var AttributeDescription = (function (_super) {
    __extends(AttributeDescription, _super);
    function AttributeDescription(owner, object) {
        _super.call(this, owner, object);
    }
    AttributeDescription.prototype.optional = function () {
        var otherAttributes = this._object['otherAttributes'];
        if (!otherAttributes) {
            return false;
        }
        var use = otherAttributes['use'];
        if (!use) {
            return false;
        }
        return use != 'required';
    };
    AttributeDescription.prototype.isArray = function () {
        return false;
    };
    AttributeDescription.prototype.isAttribute = function () {
        return true;
    };
    return AttributeDescription;
})(PropertyDescription);
var ElementDescription = (function (_super) {
    __extends(ElementDescription, _super);
    function ElementDescription(owner, object) {
        _super.call(this, owner, object);
    }
    ElementDescription.prototype.isArray = function () {
        var otherAttributes = this._object['otherAttributes'];
        if (!otherAttributes) {
            return false;
        }
        var maxOccurs = otherAttributes['maxOccurs'];
        if (!maxOccurs) {
            return false;
        }
        if (maxOccurs == 'unbounded') {
            return true;
        }
        try {
            var mo = parseInt(maxOccurs);
            return mo > 1;
        }
        catch (e) {
        }
        return false;
    };
    ElementDescription.prototype.optional = function () {
        var otherAttributes = this._object['otherAttributes'];
        if (!otherAttributes) {
            return true;
        }
        var minOccurs = otherAttributes['minOccurs'];
        if (!minOccurs) {
            return true;
        }
        try {
            var mo = parseInt(minOccurs);
            return mo == 0;
        }
        catch (e) {
        }
        return true;
    };
    return ElementDescription;
})(PropertyDescription);
var TypeDescription = (function () {
    function TypeDescription(owner, _name, _isSimple, _object) {
        var _this = this;
        this.owner = owner;
        this._name = _name;
        this._isSimple = _isSimple;
        this._object = _object;
        this.name = function () { return _this._name; };
        this.isSimple = function () { return _this._isSimple; };
        this.object = function () { return _this._object; };
    }
    TypeDescription.prototype.isChoice = function () {
        return this.object && (this.object['choice'] || (this.object['complexContent'] && this.object['complexContent']['choice']));
    };
    TypeDescription.prototype.elements = function () {
        var _this = this;
        var elementObjects = [];
        if (this._object) {
            elementObjects = this.collectElements(this._object);
            if (elementObjects.length == 0) {
                var complexContent = this.object['complexContent'];
                if (complexContent) {
                    elementObjects = this.collectElements(complexContent);
                }
            }
        }
        var result = elementObjects.map(function (x) { return new ElementDescription(_this.owner, x); });
        return result;
    };
    TypeDescription.prototype.attributes = function () {
        var _this = this;
        var result = [];
        if (this._object && this._object['attribute']) {
            result = this._object['attribute'].map(function (x) { return new AttributeDescription(_this.owner, x); });
        }
        return result;
    };
    TypeDescription.prototype.base = function () {
        if (!this._object) {
            return Opt.empty();
        }
        var baseObj;
        if (this._object['restriction']) {
            var restriction = this._object['restriction'];
            baseObj = restriction['base'];
        }
        else if (this._object['complexContent']) {
            var complexContent = this.object['complexContent'];
            var resExt = complexContent['restriction'] || complexContent['extension'];
            if (resExt) {
                baseObj = resExt['base'];
            }
        }
        if (!baseObj) {
            return Opt.empty();
        }
        var typeName = extractName(baseObj);
        var isSimple = false;
        var typeObject;
        var sType = this.owner.simpleTypes[typeName];
        if (sType) {
            typeObject = sType;
            isSimple = true;
        }
        var cType = this.owner.complexTypes[typeName];
        if (cType) {
            typeObject = cType;
        }
        if ((typeName.indexOf('xs:') == 0 || typeName.indexOf('xsd:') == 0)) {
            if (typeName.substring(typeName.indexOf(':') + 1) != 'any') {
                isSimple = true;
            }
        }
        var result = new TypeDescription(this.owner, typeName, isSimple, typeObject);
        return new Opt(result);
    };
    TypeDescription.prototype.getBaseName = function () {
        var typeOpt = new Opt(this);
        var result = '';
        while (typeOpt.isDefined()) {
            var t = typeOpt.getOrThrow();
            result = t.name();
            typeOpt = t.base();
        }
        return result;
    };
    TypeDescription.prototype.collectElements = function (obj) {
        var _this = this;
        var result = [];
        var containers = [obj['sequence'], obj['any'], obj['choice']];
        containers.filter(function (x) { return x; }).forEach(function (x) {
            if (x['element']) {
                result = result.concat(x['element']);
            }
            result = result.concat(_this.collectElements(x));
        });
        return result;
    };
    return TypeDescription;
})();
function extractName(typeObj) {
    var prefix = typeObj['prefix'];
    var localPart = typeObj['localPart'];
    var typeName = prefix + (prefix.length > 0 ? ':' : '') + localPart;
    return typeName;
}
;
function serializeToXML(obj, element) {
    var str = '';
    if (typeof (obj) == 'object') {
        var isRoot = !element;
        if (isRoot) {
            str += '<?xml version="1.0" encoding="UTF-8"?>';
        }
        else {
            str += '<' + element;
        }
        var attrKeys = [];
        var elementKeys = [];
        var allKeys = Object.keys(obj).forEach(function (x) {
            if (x.charAt(0) == '@') {
                attrKeys.push(x);
            }
            else {
                elementKeys.push(x);
            }
        });
        attrKeys.forEach(function (x) { return str += serializeToXML(obj[x], x); });
        if (!isRoot) {
            str += '>';
        }
        elementKeys.forEach(function (x, i) {
            if (i == 0 || !isRoot) {
                var value = obj[x];
                if (Array.isArray(value)) {
                    value.forEach(function (y, j) {
                        if (j == 0 || !isRoot) {
                            str += serializeToXML(y, x);
                        }
                    });
                }
                else if (value instanceof Object) {
                    str += serializeToXML(value, x);
                }
                else {
                    str += serializeToXML(value, x);
                }
            }
        });
        if (!isRoot) {
            str += '</' + element + '>';
        }
    }
    else {
        var isAttr = element && element.charAt(0) == '@';
        if (isAttr) {
            str += ' ' + element.substring(1) + '="';
        }
        else {
            str += '<' + element + '>';
        }
        str += obj.toString();
        if (isAttr) {
            str += '"';
        }
        else {
            str += '</' + element + '>';
        }
    }
    return str;
}
exports.serializeToXML = serializeToXML;
function rootElementName(schema) {
    var schemaObj = parseSchema(schema);
    var rootElements = new XMLSchematToTS('SomeType').getRootElements(schemaObj);
    if (rootElements.length == 0) {
        return Opt.empty();
    }
    return new Opt(rootElements[0].name());
}
exports.rootElementName = rootElementName;
function parseClassInstance(content, schema) {
    var schemaObj = parseSchema(schema);
    var rootElements = new XMLSchematToTS("SomeType").getRootElements(schemaObj);
    if (rootElements.length == 0) {
        return Opt.empty();
    }
    try {
        var xmlObj = XML(content);
    }
    catch (e) {
        return Opt.empty();
    }
    var keys = Object.keys(xmlObj);
    if (keys.length == 0) {
        return Opt.empty();
    }
    var key = keys[0];
    var result = {};
    result[key] = refineElement(xmlObj[key], rootElements[0]);
    return new Opt(result);
}
exports.parseClassInstance = parseClassInstance;
function refineElement(obj, element) {
    var t = element.type().getOrThrow();
    var isArray = element.isArray();
    var inArray = isArray && typeof (obj) == 'array' ? obj : [obj];
    var outArray = [];
    inArray.forEach(function (x) {
        if (t.isSimple()) {
            var simpleValue = refineSimpleValue(x, t);
            outArray.push(simpleValue);
        }
        else {
            outArray.push(x);
            var elements = t.elements();
            elements.forEach(function (y) {
                var name = y.name();
                var eObj = x[name];
                if (eObj) {
                    x[name] = refineElement(eObj, y);
                }
            });
            var attributes = t.attributes();
            attributes.forEach(function (y) {
                var name = '@' + y.name();
                var aObj = x[name];
                if (aObj) {
                    var at = y.type().getOrThrow();
                    x[name] = refineSimpleValue(aObj, at);
                }
            });
        }
    });
    if (isArray) {
        return outArray;
    }
    else {
        return outArray[0];
    }
}
function refineSimpleValue(x, t) {
    var typeName = t.name();
    var objStr = x.toString();
    if (typeName == 'number') {
        try {
            return Number(objStr);
        }
        catch (e) {
        }
    }
    else if (typeName == 'boolean') {
        if (objStr.toLowerCase() == 'true') {
            return true;
        }
        else if (objStr.toLowerCase() == 'false') {
            return false;
        }
    }
    return objStr;
}
function parseSchema(schema) {
    var XSD_1_0 = require('w3c-schemas').XSD_1_0;
    var context = new jsonix.Jsonix.Context([XSD_1_0]);
    var unmarshaller = context.createUnmarshaller();
    var schemaObject = unmarshaller.unmarshalString(schema);
    return schemaObject;
}
;
//# sourceMappingURL=xmlschema2ts.js.map