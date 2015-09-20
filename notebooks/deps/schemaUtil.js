var xmlutil = require('./xmlutil');
var lru = require("lrucache");
var ZSchema = require("z-schema");
var ValidationResult = (function () {
    function ValidationResult() {
    }
    return ValidationResult;
})();
exports.ValidationResult = ValidationResult;
var globalCache = lru(400);
var validator = new ZSchema();
var useLint = true;
var JSONSchemaObject = (function () {
    function JSONSchemaObject(schema) {
        this.schema = schema;
        if (!schema || schema.trim().length == 0 || schema.trim().charAt(0) != '{') {
            throw new Error("Invalid JSON schema content");
        }
        var jsonSchemaObject;
        try {
            var jsonSchemaObject = JSON.parse(schema);
        }
        catch (err) {
            throw new Error("It is not JSON schema");
        }
        if (!jsonSchemaObject) {
            return;
        }
        try {
            var api = require('json-schema-compatibility');
            jsonSchemaObject = api.v4(jsonSchemaObject);
        }
        catch (e) {
            throw new Error('Can not parse schema' + schema);
        }
        delete jsonSchemaObject['$schema'];
        delete jsonSchemaObject['required'];
        this.jsonSchema = jsonSchemaObject;
    }
    JSONSchemaObject.prototype.getType = function () {
        return "source.json";
    };
    JSONSchemaObject.prototype.validate = function (content) {
        var key = content + this.schema;
        var c = globalCache.get(key);
        if (c) {
            if (c instanceof Error) {
                throw c;
            }
            return;
        }
        var valid = validator.validate(JSON.parse(content), this.jsonSchema);
        var errors = validator.getLastErrors();
        if (errors && errors.length > 0) {
            var res = new Error("Content is not valid according to schema:" + errors.map(function (x) { return x.message + " " + x.params; }).join(", "));
            res.errors = errors;
            globalCache.set(key, res);
            throw res;
        }
        globalCache.set(key, 1);
    };
    return JSONSchemaObject;
})();
exports.JSONSchemaObject = JSONSchemaObject;
var XMLSchemaObject = (function () {
    function XMLSchemaObject(schema) {
        this.schema = schema;
        if (schema.charAt(0) != '<') {
            throw new Error("Invalid JSON schema");
        }
        xmlutil(schema);
    }
    XMLSchemaObject.prototype.getType = function () {
        return "text.xml";
    };
    XMLSchemaObject.prototype.validate = function (content) {
        xmlutil(content);
    };
    return XMLSchemaObject;
})();
exports.XMLSchemaObject = XMLSchemaObject;
function getJSONSchema(content) {
    var rs = useLint ? globalCache.get(content) : false;
    if (rs) {
        return rs;
    }
    var res = new JSONSchemaObject(content);
    globalCache.set(content, res);
}
exports.getJSONSchema = getJSONSchema;
function getXMLSchema(content) {
    var rs = useLint ? globalCache.get(content) : false;
    if (rs) {
        return rs;
    }
    var res = new XMLSchemaObject(content);
    if (useLint) {
        globalCache.set(content, res);
    }
}
exports.getXMLSchema = getXMLSchema;
function createSchema(content) {
    var rs = useLint ? globalCache.get(content) : false;
    if (rs) {
        return rs;
    }
    try {
        var res = new JSONSchemaObject(content);
        if (useLint) {
            globalCache.set(content, res);
        }
        return res;
    }
    catch (e) {
        try {
            var res = new XMLSchemaObject(content);
            if (useLint) {
                globalCache.set(content, res);
            }
            return res;
        }
        catch (e) {
            if (useLint) {
                globalCache.set(content, new Error("Can not parse schema"));
            }
            return null;
        }
    }
}
exports.createSchema = createSchema;
//# sourceMappingURL=schemaUtil.js.map