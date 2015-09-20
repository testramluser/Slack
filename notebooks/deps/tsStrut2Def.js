var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var tsStruct = require('./tsStructureParser');
var def = require('./definitionSystem');
var _ = require("underscore");
var khttp = require("know-your-http-well");
var FieldWrapper = (function () {
    function FieldWrapper(_field, _clazz) {
        this._field = _field;
        this._clazz = _clazz;
    }
    FieldWrapper.prototype.name = function () {
        return this._field.name;
    };
    FieldWrapper.prototype.range = function () {
        return this._clazz.getModule().typeFor(this._field.type, this._clazz);
    };
    FieldWrapper.prototype.isMultiValue = function () {
        return this._field.type.typeKind == tsStruct.TypeKind.ARRAY;
    };
    FieldWrapper.prototype.isKey = function () {
        return _.find(this._field.annotations, function (x) { return x.name == "MetaModel.key"; }) != null;
    };
    FieldWrapper.prototype.isSimpleValue = function () {
        return _.find(this._field.annotations, function (x) { return x.name == "MetaModel.value"; }) != null;
    };
    FieldWrapper.prototype.annotations = function () {
        return this._field.annotations;
    };
    return FieldWrapper;
})();
var FieldConstraint = (function () {
    function FieldConstraint(_field, _clazz) {
        this._field = _field;
        this._clazz = _clazz;
    }
    FieldConstraint.prototype.name = function () {
        return this._field.name;
    };
    FieldConstraint.prototype.value = function () {
        return this._field.valueConstraint;
    };
    return FieldConstraint;
})();
var ClassWrapper = (function () {
    function ClassWrapper(_clazz, mw) {
        this._clazz = _clazz;
        this.mw = mw;
    }
    ClassWrapper.prototype.typeMeta = function () {
        return this._clazz.annotations;
    };
    ClassWrapper.prototype.path = function () {
        return this.mw.path();
    };
    ClassWrapper.prototype.getModule = function () {
        return this.mw;
    };
    ClassWrapper.prototype.typeArgs = function () {
        return this._clazz.typeParameters;
    };
    ClassWrapper.prototype.typConstraints = function () {
        var _this = this;
        return this._clazz.typeParameterConstraint.map(function (x) {
            if (x) {
                return _this.mw.classForName(x);
            }
            return null;
        });
    };
    ClassWrapper.prototype.methods = function () {
        return this._clazz.methods;
    };
    ClassWrapper.prototype.name = function () {
        return this._clazz.name;
    };
    ClassWrapper.prototype.members = function () {
        var _this = this;
        return this._clazz.fields.filter(function (x) { return x.valueConstraint == null; }).map(function (x) { return new FieldWrapper(x, _this); });
    };
    ClassWrapper.prototype.constraints = function () {
        var _this = this;
        return this._clazz.fields.filter(function (x) { return x.valueConstraint != null; }).map(function (x) { return new FieldConstraint(x, _this); });
    };
    ClassWrapper.prototype.isSubTypeOf = function (of) {
        if (this == of) {
            return true;
        }
        var _res = false;
        this.getAllSuperTypes().forEach(function (x) {
            if (!_res) {
                _res = _res || x.isSubTypeOf(of);
            }
        });
        return _res;
    };
    ClassWrapper.prototype.getExtendsClauses = function () {
        return this._clazz.extends;
    };
    ClassWrapper.prototype.getSuperTypes = function () {
        var _this = this;
        var result = [];
        this._clazz.extends.forEach(function (x) {
            var tp = _this.mw.classForName(x.typeName);
            if (tp) {
                result.push(tp);
            }
        });
        return result;
    };
    ClassWrapper.prototype.getAllSuperTypes = function () {
        var _this = this;
        var result = [];
        this._clazz.extends.forEach(function (x) {
            var tp = _this.mw.classForName(x.typeName);
            if (tp) {
                var mm = tp.getAllSuperTypes();
                result.push(tp);
                result.concat(mm);
            }
        });
        return _.unique(result);
    };
    return ClassWrapper;
})();
var AbstractSimpleWrapper = (function () {
    function AbstractSimpleWrapper() {
    }
    AbstractSimpleWrapper.prototype.members = function () {
        return [];
    };
    AbstractSimpleWrapper.prototype.methods = function () {
        return [];
    };
    AbstractSimpleWrapper.prototype.isSubTypeOf = function (of) {
        return false;
    };
    AbstractSimpleWrapper.prototype.getSuperTypes = function () {
        return [];
    };
    AbstractSimpleWrapper.prototype.getAllSuperTypes = function () {
        return [];
    };
    AbstractSimpleWrapper.prototype.name = function () {
        return null;
    };
    AbstractSimpleWrapper.prototype.constraints = function () {
        return [];
    };
    AbstractSimpleWrapper.prototype.typeMeta = function () {
        return [];
    };
    AbstractSimpleWrapper.prototype.getModule = function () {
        throw new Error("Not implemented");
    };
    return AbstractSimpleWrapper;
})();
var EnumWrapper = (function (_super) {
    __extends(EnumWrapper, _super);
    function EnumWrapper(_clazz, mw) {
        _super.call(this);
        this._clazz = _clazz;
        this.mw = mw;
    }
    EnumWrapper.prototype.getModule = function () {
        return this.mw;
    };
    EnumWrapper.prototype.values = function () {
        return this._clazz.members;
    };
    EnumWrapper.prototype.name = function () {
        return this._clazz.name;
    };
    return EnumWrapper;
})(AbstractSimpleWrapper);
var UnionWrapper = (function (_super) {
    __extends(UnionWrapper, _super);
    function UnionWrapper(_clazz, mw) {
        _super.call(this);
        this._clazz = _clazz;
        this.mw = mw;
    }
    UnionWrapper.prototype.elements = function () {
        return this._clazz;
    };
    UnionWrapper.prototype.name = function () {
        return this._clazz.map(function (x) { return x.name(); }).join("|");
    };
    return UnionWrapper;
})(AbstractSimpleWrapper);
var ModuleWrapper = (function () {
    function ModuleWrapper(_univers) {
        var _this = this;
        this._univers = _univers;
        this.name2Class = {};
        this.namespaceToMod = {};
        this._classes = [];
        _univers.classes.forEach(function (x) {
            var c = new ClassWrapper(x, _this);
            _this._classes.push(c);
            _this.name2Class[x.name] = c;
            if (x.moduleName) {
                _this.name2Class[x.moduleName + "." + x.name] = c;
            }
        });
        _univers.enumDeclarations.forEach(function (x) {
            var c = new EnumWrapper(x, _this);
            _this._classes.push(c);
            _this.name2Class[x.name] = c;
        });
    }
    ModuleWrapper.prototype.typeFor = function (t, ow) {
        var _this = this;
        switch (t.typeKind) {
            case tsStruct.TypeKind.BASIC:
                var bt = t;
                var typeName = bt.typeName;
                if (typeName == "string") {
                    typeName = "StringType";
                }
                if (typeName == "number") {
                    typeName = "NumberType";
                }
                if (typeName == "boolean") {
                    typeName = "BooleanType";
                }
                var ti = _.indexOf(ow.typeArgs(), typeName);
                if (ti != -1) {
                    var cnst = ow.typConstraints()[ti];
                    if (!cnst) {
                        return this.classForName("ValueType");
                    }
                    return cnst;
                }
                return this.classForName(typeName);
            case tsStruct.TypeKind.UNION:
                var ut = t;
                return new UnionWrapper(ut.options.map(function (x) { return _this.typeFor(x, ow); }), this);
            case tsStruct.TypeKind.ARRAY:
                var at = t;
                return this.typeFor(at.base, ow);
        }
        return null;
    };
    ModuleWrapper.prototype.path = function () {
        return this._univers.name;
    };
    ModuleWrapper.prototype.classForName = function (name, stack) {
        var _this = this;
        if (stack === void 0) { stack = {}; }
        if (!name) {
            return null;
        }
        var result = this.name2Class[name];
        if (!result && !stack[this.path()]) {
            stack[this.path()] = this;
            var nmsp = name.indexOf(".");
            if (nmsp != -1) {
                var actualMod = this.namespaceToMod[name.substring(0, nmsp)];
                if (!actualMod) {
                    throw new Error();
                }
                return actualMod.classForName(name.substring(nmsp + 1), stack);
            }
            Object.keys(this.namespaceToMod).forEach(function (x) {
                if (x != "MetaModel") {
                    var nm = _this.namespaceToMod[x].classForName(name, stack);
                    if (nm) {
                        result = nm;
                    }
                }
            });
        }
        return result;
    };
    ModuleWrapper.prototype.classes = function () {
        return this._classes;
    };
    return ModuleWrapper;
})();
var wrapperToType = function (range, u) {
    if (range) {
        var rangeType;
        if (range instanceof UnionWrapper) {
            var uw = range;
            rangeType = new def.UnionType(uw.elements().map(function (x) { return wrapperToType(x, u); }));
        }
        else {
            rangeType = u.type(range.name());
        }
        return rangeType;
    }
    else {
        return;
    }
};
var registerClasses = function (m, u) {
    var valueType = m.classForName("ValueType");
    m.classes().forEach(function (x) {
        if (x instanceof EnumWrapper) {
            var et = new def.EnumType(x.name(), u, x.getModule().path());
            et.values = x.values();
            u.register(et);
            return;
        }
        if (x.isSubTypeOf(valueType)) {
            var st = x.getAllSuperTypes();
            st.push(x);
            var refTo = null;
            var scriptingHook = null;
            st.forEach(function (t) {
                var cs = t.getExtendsClauses();
                cs.forEach(function (z) {
                    if (z.typeKind == tsStruct.TypeKind.BASIC) {
                        var bas = z;
                        if (bas.basicName == 'Reference') {
                            var of = bas.typeArguments[0];
                            refTo = of.typeName;
                        }
                        if (bas.basicName == 'ScriptingHook') {
                            var of = bas.typeArguments[0];
                            scriptingHook = of.basicName;
                        }
                    }
                });
            });
            if (refTo) {
                var ref = new def.ReferenceType(x.name(), x.getModule().path(), refTo, u);
                u.register(ref);
            }
            if (scriptingHook) {
                var sc = new def.ScriptingHookType(x.name(), x.getModule().path(), scriptingHook, u);
                u.register(sc);
            }
            var vt = new def.ValueType(x.name(), u, x.getModule().path());
            u.register(vt);
        }
        else {
            var gt = new def.NodeClass(x.name(), u, x.getModule().path());
            u.register(gt);
        }
    });
};
var registerEverything = function (m, u) {
    m.classes().forEach(function (x) {
        x.getSuperTypes().forEach(function (y) {
            var tp0 = u.type(x.name());
            var tp1 = u.type(y.name());
            if (!tp0 || !tp1) {
                var tp0 = u.type(x.name());
                var tp1 = u.type(y.name());
                throw new Error();
            }
            u.registerSuperClass(tp0, tp1);
        });
    });
    m.classes().forEach(function (x) {
        var tp = u.type(x.name());
        x.typeMeta().forEach(function (a) {
            if (a.name == 'MetaModel.declaresSubTypeOf') {
                var rangeType = wrapperToType(x, u);
                rangeType.setExtendedTypeName(a.arguments[0]);
            }
            if (a.name == 'MetaModel.nameAtRuntime') {
                var rangeType = wrapperToType(x, u);
                rangeType.setNameAtRuntime(a.arguments[0]);
            }
            if (a.name == 'MetaModel.description') {
                var rangeType = wrapperToType(x, u);
                rangeType.withDescription(a.arguments[0]);
            }
            if (a.name == 'MetaModel.inlinedTemplates') {
                var rangeType = wrapperToType(x, u);
                rangeType.setInlinedTemplates(true);
            }
            if (a.name == 'MetaModel.requireValue') {
                var rangeType = wrapperToType(x, u);
                rangeType.withContextRequirement("" + a.arguments[0], "" + a.arguments[1]);
            }
            if (a.name == 'MetaModel.referenceIs') {
                var rangeType = wrapperToType(x, u);
                rangeType.withReferenceIs("" + a.arguments[0]);
            }
            if (a.name == 'MetaModel.actuallyExports') {
                var rangeType = wrapperToType(x, u);
                rangeType.withActuallyExports("" + a.arguments[0]);
            }
            if (a.name == 'MetaModel.convertsToGlobalOfType') {
                var rangeType = wrapperToType(x, u);
                rangeType.withConvertsToGlobal("" + a.arguments[0]);
            }
            if (a.name == 'MetaModel.allowAny') {
                var rangeType = wrapperToType(x, u);
                rangeType.withAllowAny();
            }
            if (a.name == 'MetaModel.allowQuestion') {
                var rangeType = wrapperToType(x, u);
                rangeType.withAllowQuestion();
            }
            if (a.name == 'MetaModel.functionalDescriminator') {
                var r1 = wrapperToType(x, u);
                r1.withFunctionalDescriminator("" + a.arguments[0]);
            }
            if (a.name == 'MetaModel.alias') {
                var at = wrapperToType(x, u);
                at.addAlias("" + a.arguments[0]);
            }
            if (a.name == 'MetaModel.consumesRefs') {
                var at = wrapperToType(x, u);
                at.setConsumesRefs(true);
            }
            if (a.name == 'MetaModel.canInherit') {
                var nc = wrapperToType(x, u);
                nc.withCanInherit("" + a.arguments[0]);
            }
            if (a.name == 'MetaModel.definingPropertyIsEnough') {
                var nc = wrapperToType(x, u);
                nc.definingPropertyIsEnough("" + a.arguments[0]);
            }
        });
        x.members().forEach(function (x) {
            var range = x.range();
            if (!x.range()) {
                range = x.range();
            }
            var rangeType = wrapperToType(range, u);
            if (rangeType == null) {
                console.log(range + ":" + x.name());
            }
            createProp(x, tp, rangeType);
        });
        x.methods().forEach(function (x) {
            var at = tp;
            at.addMethod(x.name, x.text);
        });
        x.constraints().forEach(function (x) {
            if (x.value().isCallConstraint) {
                throw new Error();
            }
            var mm = x.value();
            tp.addRequirement(x.name(), "" + mm.value);
        });
    });
    u.types().forEach(function (x) {
        if (x instanceof def.AbstractType) {
            var at = x;
            at.getAliases().forEach(function (y) { return u.registerAlias(y, at); });
        }
    });
};
var processModule = function (ts, u, used, declared) {
    if (ts.name.indexOf("metamodel.ts") != -1) {
        return;
    }
    if (declared[ts.name]) {
        return declared[ts.name];
    }
    var m = new ModuleWrapper(ts);
    used[ts.name] = m;
    declared[ts.name] = m;
    Object.keys(ts.imports).forEach(function (x) {
        var pMod = ts.imports[x];
        if (used[pMod.name]) {
            m.namespaceToMod[x] = used[pMod.name];
            return;
        }
        var vMod = processModule(pMod, u, used, declared);
        m.namespaceToMod[x] = vMod;
    });
    used[ts.name] = null;
    return m;
};
function toDefSystem(ts) {
    var u = new def.Universe("");
    var c = {};
    processModule(ts, u, {}, c);
    Object.keys(c).forEach(function (x) {
        registerClasses(c[x], u);
    });
    Object.keys(c).forEach(function (x) {
        registerEverything(c[x], u);
    });
    u.types().forEach(function (x) {
        if (x instanceof def.NodeClass) {
            var cl = x;
            cl.properties().forEach(function (y) {
                var t = y.range();
                if (!t.isValueType()) {
                    t.properties().forEach(function (p0) {
                        if (p0.isKey()) {
                            var kp = p0.keyPrefix();
                            if (kp) {
                                y.withKeyRestriction(kp);
                                y.merge();
                            }
                            var eo = p0.getEnumOptions();
                            if (eo) {
                                y.withEnumOptions(eo);
                                y.merge();
                            }
                        }
                    });
                }
            });
            if (cl.isGlobalDeclaration()) {
                if (cl.getActuallyExports() && cl.getActuallyExports() != "$self") {
                    var tp = cl.property(cl.getActuallyExports()).range();
                    if (tp.isValueType()) {
                        var vt = tp;
                        vt.setGloballyDeclaredBy(cl);
                    }
                }
                if (cl.getConvertsToGlobal()) {
                    var tp = u.getType(cl.getConvertsToGlobal());
                    if (tp.isValueType()) {
                        var vt = tp;
                        vt.setGloballyDeclaredBy(cl);
                    }
                }
            }
        }
    });
    return u;
}
exports.toDefSystem = toDefSystem;
var annotationHandlers = {
    key: function (a, f) {
        f.withFromParentKey();
        f.withKey(true);
    },
    value: function (a, f) {
        f.withFromParentValue();
    },
    canBeValue: function (a, f) {
        f.withCanBeValue();
    },
    unmerged: function (a, f) {
        f.unmerge();
    },
    startFrom: function (a, f) {
        f.withKeyRestriction(a.arguments[0]);
        f.merge();
    },
    oneOf: function (a, f) {
        f.withEnumOptions(a.arguments[0]);
    },
    oftenKeys: function (a, f) {
        f.withOftenKeys(a.arguments[0]);
    },
    embeddedInMaps: function (a, f) {
        f.withEmbedMap();
    },
    system: function (a, f) {
        f.withSystem(true);
    },
    required: function (a, f) {
        if (a.arguments[0] != 'false') {
            f.withRequired(true);
        }
    },
    setsContextValue: function (a, f) {
        f.addChildValueConstraint(new def.ChildValueConstraint("" + a.arguments[0], "" + a.arguments[1]));
    },
    defaultValue: function (a, f) {
        f.setDefaultVal("" + a.arguments[0]);
    },
    extraMetaKey: function (a, f) {
        if (a.arguments[0] == "statusCodes") {
            f.withOftenKeys(khttp.statusCodes.map(function (x) { return x.code; }));
            f.setValueDocProvider(function (name) {
                var s = _.find(khttp.statusCodes, function (x) { return x.code == name; });
                if (s) {
                    return (name + ":" + s.description);
                }
                return null;
            });
        }
        if (a.arguments[0] == "annotationTargets") {
            var targets = f.domain().universe().types().filter(function (x) { return !x.isValueType(); }).map(function (x) { return x.name(); });
            targets.push("Parameter");
            targets.push("Field");
            f.withEnumOptions(targets);
        }
        if (a.arguments[0] == "headers") {
            f.setValueSuggester(function (x) {
                console.log(x);
                var c = x.property().getChildValueConstraints();
                if (_.find(c, function (x) {
                    return x.name == "location" && x.value == "Params.ParameterLocation.HEADERS";
                })) {
                    return khttp.headers.map(function (x) { return x.header; });
                }
                return null;
            });
            f.setValueDocProvider(function (name) {
                var s = _.find(khttp.headers, function (x) { return x.header == name; });
                if (s) {
                    return (name + ":" + s.description);
                }
                return null;
            });
        }
        if (a.arguments[0] == "methods") {
            f.setValueDocProvider(function (name) {
                var s = _.find(khttp.methods, function (x) { return x.method == name.toUpperCase(); });
                if (s) {
                    return (name + ":" + s.description);
                }
                return null;
            });
        }
    },
    requireValue: function (a, f) {
        f.withContextRequirement("" + a.arguments[0], "" + a.arguments[1]);
    },
    allowMultiple: function (a, f) {
        f.withMultiValue(true);
    },
    selector: function (a, f) {
        f.setSelector("" + a.arguments[0]);
    },
    constraint: function (a, f) {
    },
    newInstanceName: function (a, f) {
        f.withNewInstanceName("" + a.arguments[0]);
    },
    declaringFields: function (a, f) {
        f.withThisPropertyDeclaresFields();
    },
    describesAnnotation: function (a, f) {
        f.withDescribes(a.arguments[0]);
    },
    allowNull: function (a, f) {
        f.withAllowNull();
    },
    descriminatingProperty: function (a, f) {
        f.withDescriminating(true);
    },
    description: function (a, f) {
        f.withDescription("" + a.arguments[0]);
    },
    issue: function (a, f) {
        f.withIssue("" + a.arguments[0]);
    },
    inherited: function (a, f) {
        f.withInherited(true);
    },
    version: function (a, f) {
        f.withVersion("" + a.arguments[0]);
    },
    needsClarification: function (a, f) {
        f.withClarify("" + a.arguments[0]);
    },
    thisFeatureCovers: function (a, f) {
        f.withThisFeatureCovers("" + a.arguments[0]);
    },
    valueRestriction: function (a, f) {
        f.withValueRewstrinction("" + a.arguments[0], "" + a.arguments[1]);
    },
    grammarTokenKind: function (a, f) {
        f.withPropertyGrammarType("" + a.arguments[0]);
    },
    canInherit: function (a, f) {
        f.withInheritedContextValue("" + a.arguments[0]);
    },
    canBeDuplicator: function (a, f) {
        f.setCanBeDuplicator();
    }
};
function recordAnnotation(p, a) {
    annotationHandlers[a.name](a, p);
}
exports.recordAnnotation = recordAnnotation;
var processAnnotations = function (x, p) {
    x.annotations().forEach(function (x) {
        var nm = x.name.substring(x.name.lastIndexOf(".") + 1);
        if (!annotationHandlers[nm]) {
            console.log("Can not find handler for:");
        }
        annotationHandlers[nm](x, p);
    });
};
function createProp(x, clazz, t) {
    var p = def.prop(x.name(), "", clazz, t);
    if (x.isMultiValue()) {
        p.withMultiValue(true);
    }
    p.unmerge();
    if (!t.isValueType()) {
        t.properties().forEach(function (p0) {
            if (p0.isKey()) {
                var kp = p0.keyPrefix();
                if (kp) {
                    p.withKeyRestriction(kp);
                    p.merge();
                }
                var eo = p0.getEnumOptions();
                if (eo) {
                    p.withEnumOptions(eo);
                    p.merge();
                }
            }
        });
    }
    processAnnotations(x, p);
}
//# sourceMappingURL=tsStrut2Def.js.map