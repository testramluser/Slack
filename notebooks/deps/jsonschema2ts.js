var TS = require('./TSDeclModel');
var JSONSchematToTS = (function () {
    function JSONSchematToTS(name, module, cfg) {
        this.cfg = cfg;
        this.name = name.charAt(0).toUpperCase() + name.substr(1);
        this.name = this.name.replace("-", "");
        this.module = module;
    }
    JSONSchematToTS.prototype.generateHarEntry = function () {
        return this.cfg ? this.cfg.storeHarEntry : false;
    };
    JSONSchematToTS.prototype.parse = function (schema, appendHar) {
        var _this = this;
        if (appendHar === void 0) { appendHar = false; }
        var obj = JSON.parse(schema);
        if (obj['type'] == 'array') {
            var items = obj['items'];
            if (items) {
                var itemsArray;
                if (items instanceof Array) {
                    itemsArray = items;
                }
                else {
                    itemsArray = [items];
                }
                var ref = new TS.AnyType();
                var i = 0;
                itemsArray.forEach(function (x) { return ref = ref.union(_this.createInterface(x, appendHar, itemsArray.length > 1 ? '' + i++ : '')); });
                ref.array = true;
                ref.locked = true;
                return ref;
            }
        }
        return this.createInterface(obj, appendHar);
    };
    JSONSchematToTS.prototype.createInterface = function (obj, appendHar, index) {
        if (appendHar === void 0) { appendHar = false; }
        if (index === void 0) { index = ''; }
        if (obj['patternProperties'] && obj['patternProperties'].length > 0) {
            return new TS.AnyType();
        }
        var tsi = new TS.TSInterface(this.module ? this.module : TS.Universe, this.name + index);
        this.processNode(obj, tsi);
        if (this.generateHarEntry() && appendHar) {
            this.appendHarEntry(tsi);
        }
        return tsi.toReference();
    };
    JSONSchematToTS.prototype.appendHarEntry = function (tsi) {
        this.processNode(exports.HAR_ENTRY_SCHEMA, tsi);
    };
    JSONSchematToTS.prototype.replace = function (original) {
        return original;
    };
    JSONSchematToTS.prototype.createTypeDeclaration = function (pd) {
        var td = new TS.TSStructuralTypeReference(pd);
        td.locked = true;
        return td;
    };
    JSONSchematToTS.prototype.processNode = function (obj, tsi) {
        var _this = this;
        for (var prop in obj.properties) {
            var pd = new TS.TSAPIElementDeclaration(tsi, prop);
            var propObj = obj.properties[prop];
            var tv = propObj["type"];
            var rv = propObj["required"];
            if (!rv) {
                pd.optional = true;
            }
            if (tv == "array") {
                var t = new TS.AnyType();
                pd.rangeType = t;
                var items = [];
                if (propObj.items) {
                    if (propObj.items instanceof Array) {
                        items = propObj.items;
                    }
                    else {
                        items = items.concat(propObj.items);
                    }
                }
                items.filter(function (x) { return x["type"]; }).forEach(function (x) {
                    var tp = x["type"];
                    var st = null;
                    if (tp == 'object' && x.patternProperties && Object.keys(x.patternProperties).length > 0) {
                        st = new TS.AnyType();
                    }
                    else {
                        if (_this.isPrimitive(tp)) {
                            st = new TS.TSSimpleTypeReference(pd, tp);
                        }
                        else {
                            var td = _this.createTypeDeclaration(pd);
                            _this.processNode(x, td);
                            st = _this.replace(td).toReference();
                        }
                    }
                    st.array = true;
                    st.locked = true;
                    pd.rangeType = pd.rangeType.union(st);
                });
            }
            else if (tv === "object") {
                var st = null;
                if (propObj.patternProperties && Object.keys(propObj.patternProperties).length > 0) {
                    st = new TS.AnyType();
                }
                else {
                    var q = this.createTypeDeclaration(pd);
                    this.processNode(propObj, q);
                    st = this.replace(q).toReference();
                }
                pd.rangeType = st;
            }
            else {
                tv = this.cleanUpTypeDecl(tv);
                pd.rangeType = new TS.TSSimpleTypeReference(pd, tv);
            }
        }
    };
    JSONSchematToTS.prototype.cleanUpTypeDecl = function (tv) {
        if (tv == null) {
            tv = "string";
        }
        tv = tv.toString();
        if (tv.indexOf(",") != -1) {
            tv = "string";
        }
        if (tv.indexOf(" ") != -1) {
            tv = "string";
        }
        if (tv == "integer") {
            tv = "number";
        }
        if (tv == "null") {
            tv = "string";
        }
        if (tv != "string" && tv != "number" && tv != "boolean" && tv != "any[]") {
            tv = "string";
        }
        return tv;
    };
    JSONSchematToTS.prototype.isPrimitive = function (tp) {
        return tp === "string" || tp === "number";
    };
    return JSONSchematToTS;
})();
exports.JSONSchematToTS = JSONSchematToTS;
exports.HAR_ENTRY_SCHEMA = {
    "properties": {
        __$harEntry__: {
            "type": "object",
            "required": false,
            "properties": {
                "response": {
                    "type": "object",
                    "required": true,
                    "properties": {
                        "content": {
                            "type": "object",
                            "required": true,
                            "properties": {
                                "text": {
                                    "type": "string",
                                    "required": true
                                }
                            }
                        },
                        "status": {
                            "type": "number",
                            "required": true
                        }
                    }
                },
                "request": {
                    "type": "object",
                    "required": true
                }
            }
        }
    }
};
//# sourceMappingURL=jsonschema2ts.js.map