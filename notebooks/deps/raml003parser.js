var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
exports.WRAPPER_PROPERTY = "__$wrapper__";
var BasicNodeImpl = (function () {
    function BasicNodeImpl(_node) {
        this._node = _node;
        _node[exports.WRAPPER_PROPERTY] = this;
    }
    BasicNodeImpl.prototype.parent = function () {
        var parent = this._node.parent();
        return parent ? parent[exports.WRAPPER_PROPERTY] : null;
    };
    BasicNodeImpl.prototype.highLevel = function () {
        return this._node;
    };
    return BasicNodeImpl;
})();
exports.BasicNodeImpl = BasicNodeImpl;
var RAMLLanguageElementImpl = (function (_super) {
    __extends(RAMLLanguageElementImpl, _super);
    function RAMLLanguageElementImpl() {
        _super.apply(this, arguments);
    }
    RAMLLanguageElementImpl.prototype.displayName = function () {
        var attr = this._node.attr('displayName');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    RAMLLanguageElementImpl.prototype.description = function () {
        var attr = this._node.attr('description');
        if (attr) {
            var v = new MarkdownStringImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    RAMLLanguageElementImpl.prototype.annotations = function () {
        var attrs = this._node.attributes('annotations');
        if (attrs) {
            return attrs.map(function (x) { return new AnnotationRefImpl(x); });
        }
        return [];
    };
    return RAMLLanguageElementImpl;
})(BasicNodeImpl);
exports.RAMLLanguageElementImpl = RAMLLanguageElementImpl;
var ValueTypeImpl = (function () {
    function ValueTypeImpl(attr) {
        this.attr = attr;
    }
    ValueTypeImpl.prototype.value = function () {
        return this.attr.value();
    };
    return ValueTypeImpl;
})();
exports.ValueTypeImpl = ValueTypeImpl;
var NumberTypeImpl = (function (_super) {
    __extends(NumberTypeImpl, _super);
    function NumberTypeImpl() {
        _super.apply(this, arguments);
    }
    return NumberTypeImpl;
})(ValueTypeImpl);
exports.NumberTypeImpl = NumberTypeImpl;
var BooleanTypeImpl = (function (_super) {
    __extends(BooleanTypeImpl, _super);
    function BooleanTypeImpl() {
        _super.apply(this, arguments);
    }
    return BooleanTypeImpl;
})(ValueTypeImpl);
exports.BooleanTypeImpl = BooleanTypeImpl;
var ReferenceImpl = (function (_super) {
    __extends(ReferenceImpl, _super);
    function ReferenceImpl() {
        _super.apply(this, arguments);
    }
    return ReferenceImpl;
})(ValueTypeImpl);
exports.ReferenceImpl = ReferenceImpl;
var ResourceTypeRefImpl = (function (_super) {
    __extends(ResourceTypeRefImpl, _super);
    function ResourceTypeRefImpl() {
        _super.apply(this, arguments);
    }
    return ResourceTypeRefImpl;
})(ReferenceImpl);
exports.ResourceTypeRefImpl = ResourceTypeRefImpl;
var TraitRefImpl = (function (_super) {
    __extends(TraitRefImpl, _super);
    function TraitRefImpl() {
        _super.apply(this, arguments);
    }
    return TraitRefImpl;
})(ReferenceImpl);
exports.TraitRefImpl = TraitRefImpl;
var SecuritySchemaRefImpl = (function (_super) {
    __extends(SecuritySchemaRefImpl, _super);
    function SecuritySchemaRefImpl() {
        _super.apply(this, arguments);
    }
    return SecuritySchemaRefImpl;
})(ReferenceImpl);
exports.SecuritySchemaRefImpl = SecuritySchemaRefImpl;
var AnnotationRefImpl = (function (_super) {
    __extends(AnnotationRefImpl, _super);
    function AnnotationRefImpl() {
        _super.apply(this, arguments);
    }
    return AnnotationRefImpl;
})(ReferenceImpl);
exports.AnnotationRefImpl = AnnotationRefImpl;
var DataElementRefImpl = (function (_super) {
    __extends(DataElementRefImpl, _super);
    function DataElementRefImpl() {
        _super.apply(this, arguments);
    }
    return DataElementRefImpl;
})(ReferenceImpl);
exports.DataElementRefImpl = DataElementRefImpl;
var ramlexpressionImpl = (function (_super) {
    __extends(ramlexpressionImpl, _super);
    function ramlexpressionImpl() {
        _super.apply(this, arguments);
    }
    return ramlexpressionImpl;
})(ValueTypeImpl);
exports.ramlexpressionImpl = ramlexpressionImpl;
var AnnotationTargetImpl = (function (_super) {
    __extends(AnnotationTargetImpl, _super);
    function AnnotationTargetImpl() {
        _super.apply(this, arguments);
    }
    return AnnotationTargetImpl;
})(ValueTypeImpl);
exports.AnnotationTargetImpl = AnnotationTargetImpl;
var pointerImpl = (function (_super) {
    __extends(pointerImpl, _super);
    function pointerImpl() {
        _super.apply(this, arguments);
    }
    return pointerImpl;
})(ValueTypeImpl);
exports.pointerImpl = pointerImpl;
var StringTypeImpl = (function (_super) {
    __extends(StringTypeImpl, _super);
    function StringTypeImpl(attr) {
        _super.call(this, attr);
        this.attr = attr;
    }
    return StringTypeImpl;
})(ValueTypeImpl);
exports.StringTypeImpl = StringTypeImpl;
var UriTemplateImpl = (function (_super) {
    __extends(UriTemplateImpl, _super);
    function UriTemplateImpl() {
        _super.apply(this, arguments);
    }
    return UriTemplateImpl;
})(StringTypeImpl);
exports.UriTemplateImpl = UriTemplateImpl;
var RelativeUriImpl = (function (_super) {
    __extends(RelativeUriImpl, _super);
    function RelativeUriImpl() {
        _super.apply(this, arguments);
    }
    return RelativeUriImpl;
})(UriTemplateImpl);
exports.RelativeUriImpl = RelativeUriImpl;
var FullUriTemplateImpl = (function (_super) {
    __extends(FullUriTemplateImpl, _super);
    function FullUriTemplateImpl() {
        _super.apply(this, arguments);
    }
    return FullUriTemplateImpl;
})(UriTemplateImpl);
exports.FullUriTemplateImpl = FullUriTemplateImpl;
var FixedUriImpl = (function (_super) {
    __extends(FixedUriImpl, _super);
    function FixedUriImpl() {
        _super.apply(this, arguments);
    }
    return FixedUriImpl;
})(StringTypeImpl);
exports.FixedUriImpl = FixedUriImpl;
var ContentTypeImpl = (function (_super) {
    __extends(ContentTypeImpl, _super);
    function ContentTypeImpl() {
        _super.apply(this, arguments);
    }
    return ContentTypeImpl;
})(StringTypeImpl);
exports.ContentTypeImpl = ContentTypeImpl;
var ValidityExpressionImpl = (function (_super) {
    __extends(ValidityExpressionImpl, _super);
    function ValidityExpressionImpl() {
        _super.apply(this, arguments);
    }
    return ValidityExpressionImpl;
})(StringTypeImpl);
exports.ValidityExpressionImpl = ValidityExpressionImpl;
var DateFormatSpecImpl = (function (_super) {
    __extends(DateFormatSpecImpl, _super);
    function DateFormatSpecImpl() {
        _super.apply(this, arguments);
    }
    return DateFormatSpecImpl;
})(StringTypeImpl);
exports.DateFormatSpecImpl = DateFormatSpecImpl;
var FunctionalInterfaceImpl = (function (_super) {
    __extends(FunctionalInterfaceImpl, _super);
    function FunctionalInterfaceImpl() {
        _super.apply(this, arguments);
    }
    return FunctionalInterfaceImpl;
})(StringTypeImpl);
exports.FunctionalInterfaceImpl = FunctionalInterfaceImpl;
var SchemaStringImpl = (function (_super) {
    __extends(SchemaStringImpl, _super);
    function SchemaStringImpl() {
        _super.apply(this, arguments);
    }
    return SchemaStringImpl;
})(StringTypeImpl);
exports.SchemaStringImpl = SchemaStringImpl;
var JSonSchemaStringImpl = (function (_super) {
    __extends(JSonSchemaStringImpl, _super);
    function JSonSchemaStringImpl() {
        _super.apply(this, arguments);
    }
    return JSonSchemaStringImpl;
})(SchemaStringImpl);
exports.JSonSchemaStringImpl = JSonSchemaStringImpl;
var XMLSchemaStringImpl = (function (_super) {
    __extends(XMLSchemaStringImpl, _super);
    function XMLSchemaStringImpl() {
        _super.apply(this, arguments);
    }
    return XMLSchemaStringImpl;
})(SchemaStringImpl);
exports.XMLSchemaStringImpl = XMLSchemaStringImpl;
var ExampleStringImpl = (function (_super) {
    __extends(ExampleStringImpl, _super);
    function ExampleStringImpl() {
        _super.apply(this, arguments);
    }
    return ExampleStringImpl;
})(StringTypeImpl);
exports.ExampleStringImpl = ExampleStringImpl;
var ScriptingHookImpl = (function (_super) {
    __extends(ScriptingHookImpl, _super);
    function ScriptingHookImpl() {
        _super.apply(this, arguments);
    }
    return ScriptingHookImpl;
})(StringTypeImpl);
exports.ScriptingHookImpl = ScriptingHookImpl;
var SecuritySchemaHookImpl = (function (_super) {
    __extends(SecuritySchemaHookImpl, _super);
    function SecuritySchemaHookImpl() {
        _super.apply(this, arguments);
    }
    return SecuritySchemaHookImpl;
})(ScriptingHookImpl);
exports.SecuritySchemaHookImpl = SecuritySchemaHookImpl;
var RAMLPointerImpl = (function (_super) {
    __extends(RAMLPointerImpl, _super);
    function RAMLPointerImpl() {
        _super.apply(this, arguments);
    }
    return RAMLPointerImpl;
})(StringTypeImpl);
exports.RAMLPointerImpl = RAMLPointerImpl;
var RAMLSelectorImpl = (function (_super) {
    __extends(RAMLSelectorImpl, _super);
    function RAMLSelectorImpl() {
        _super.apply(this, arguments);
    }
    return RAMLSelectorImpl;
})(StringTypeImpl);
exports.RAMLSelectorImpl = RAMLSelectorImpl;
var MimeTypeImpl = (function (_super) {
    __extends(MimeTypeImpl, _super);
    function MimeTypeImpl() {
        _super.apply(this, arguments);
    }
    return MimeTypeImpl;
})(StringTypeImpl);
exports.MimeTypeImpl = MimeTypeImpl;
var MarkdownStringImpl = (function (_super) {
    __extends(MarkdownStringImpl, _super);
    function MarkdownStringImpl(attr) {
        _super.call(this, attr);
        this.attr = attr;
    }
    return MarkdownStringImpl;
})(StringTypeImpl);
exports.MarkdownStringImpl = MarkdownStringImpl;
var DocumentationItemImpl = (function (_super) {
    __extends(DocumentationItemImpl, _super);
    function DocumentationItemImpl() {
        _super.apply(this, arguments);
    }
    DocumentationItemImpl.prototype.title = function () {
        var attr = this._node.attr('title');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    DocumentationItemImpl.prototype.content = function () {
        var attr = this._node.attr('content');
        if (attr) {
            var v = new MarkdownStringImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return DocumentationItemImpl;
})(RAMLLanguageElementImpl);
exports.DocumentationItemImpl = DocumentationItemImpl;
var ScriptSpecImpl = (function (_super) {
    __extends(ScriptSpecImpl, _super);
    function ScriptSpecImpl() {
        _super.apply(this, arguments);
    }
    ScriptSpecImpl.prototype.language = function () {
        var attr = this._node.attr('language');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ScriptSpecImpl.prototype.content = function () {
        var attr = this._node.attr('content');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return ScriptSpecImpl;
})(RAMLLanguageElementImpl);
exports.ScriptSpecImpl = ScriptSpecImpl;
var ApiDescriptionImpl = (function (_super) {
    __extends(ApiDescriptionImpl, _super);
    function ApiDescriptionImpl() {
        _super.apply(this, arguments);
    }
    ApiDescriptionImpl.prototype.apiFiles = function () {
        var elements = this._node.elementsOfKind('apiFiles');
        if (elements) {
            return elements.map(function (x) { return new ApiImpl(x); });
        }
        else {
            return null;
        }
    };
    ApiDescriptionImpl.prototype.script = function () {
        var elements = this._node.elementsOfKind('script');
        if (elements) {
            return elements.map(function (x) { return new ScriptSpecImpl(x); });
        }
        else {
            return null;
        }
    };
    ApiDescriptionImpl.prototype["type"] = function () {
        var attr = this._node.attr('type');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return ApiDescriptionImpl;
})(RAMLLanguageElementImpl);
exports.ApiDescriptionImpl = ApiDescriptionImpl;
var CallbackAPIDescriptionImpl = (function (_super) {
    __extends(CallbackAPIDescriptionImpl, _super);
    function CallbackAPIDescriptionImpl() {
        _super.apply(this, arguments);
    }
    CallbackAPIDescriptionImpl.prototype.callbackFor = function () {
        var v = this._node.element('callbackFor');
        if (!v) {
            return null;
        }
        return new ApiImpl(v);
    };
    return CallbackAPIDescriptionImpl;
})(ApiDescriptionImpl);
exports.CallbackAPIDescriptionImpl = CallbackAPIDescriptionImpl;
var RAMLProjectImpl = (function (_super) {
    __extends(RAMLProjectImpl, _super);
    function RAMLProjectImpl() {
        _super.apply(this, arguments);
    }
    RAMLProjectImpl.prototype.relatedProjects = function () {
        var elements = this._node.elementsOfKind('relatedProjects');
        if (elements) {
            return elements.map(function (x) { return new RAMLProjectImpl(x); });
        }
        else {
            return null;
        }
    };
    RAMLProjectImpl.prototype.declaredApis = function () {
        var elements = this._node.elementsOfKind('declaredApis');
        if (elements) {
            return elements.map(function (x) { return new ApiDescriptionImpl(x); });
        }
        else {
            return null;
        }
    };
    RAMLProjectImpl.prototype.license = function () {
        var attr = this._node.attr('license');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    RAMLProjectImpl.prototype.overview = function () {
        var attr = this._node.attr('overview');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    RAMLProjectImpl.prototype.url = function () {
        var attr = this._node.attr('url');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return RAMLProjectImpl;
})(RAMLLanguageElementImpl);
exports.RAMLProjectImpl = RAMLProjectImpl;
var SecuritySchemaTypeImpl = (function (_super) {
    __extends(SecuritySchemaTypeImpl, _super);
    function SecuritySchemaTypeImpl() {
        _super.apply(this, arguments);
    }
    SecuritySchemaTypeImpl.prototype.requiredSettings = function () {
        var elements = this._node.elementsOfKind('requiredSettings');
        if (elements) {
            return elements.map(function (x) { return new DataElementImpl(x); });
        }
        else {
            return null;
        }
    };
    SecuritySchemaTypeImpl.prototype.describedBy = function () {
        var v = this._node.element('describedBy');
        if (!v) {
            return null;
        }
        return new SecuritySchemaPartImpl(v);
    };
    return SecuritySchemaTypeImpl;
})(RAMLLanguageElementImpl);
exports.SecuritySchemaTypeImpl = SecuritySchemaTypeImpl;
var DataElementImpl = (function (_super) {
    __extends(DataElementImpl, _super);
    function DataElementImpl() {
        _super.apply(this, arguments);
    }
    DataElementImpl.prototype.name = function () {
        var attr = this._node.attr('name');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    DataElementImpl.prototype["type"] = function () {
        var attrs = this._node.attributes('type');
        if (attrs) {
            return attrs.map(function (x) { return x.value(); });
        }
        return [];
    };
    DataElementImpl.prototype.location = function () {
        var attr = this._node.attr('location');
        if (attr) {
            var v = new ModelLocationImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    DataElementImpl.prototype.locationKind = function () {
        var attr = this._node.attr('locationKind');
        if (attr) {
            var v = new LocationKindImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    DataElementImpl.prototype["default"] = function () {
        var attr = this._node.attr('default');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    DataElementImpl.prototype.sendDefaultByClient = function () {
        var attr = this._node.attr('sendDefaultByClient');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    DataElementImpl.prototype.example = function () {
        var attrs = this._node.attributes('example');
        if (attrs) {
            return attrs.map(function (x) { return x.value(); });
        }
        return [];
    };
    DataElementImpl.prototype.repeat = function () {
        var attr = this._node.attr('repeat');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    DataElementImpl.prototype.collectionFormat = function () {
        var attr = this._node.attr('collectionFormat');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    DataElementImpl.prototype.required = function () {
        var attr = this._node.attr('required');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    DataElementImpl.prototype.scope = function () {
        var attrs = this._node.attributes('scope');
        if (attrs) {
            return attrs.map(function (x) { return x.value(); });
        }
        return [];
    };
    DataElementImpl.prototype.xml = function () {
        var v = this._node.element('xml');
        if (!v) {
            return null;
        }
        return new XMLInfoImpl(v);
    };
    DataElementImpl.prototype.validWhen = function () {
        var attr = this._node.attr('validWhen');
        if (attr) {
            var v = new ramlexpressionImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    DataElementImpl.prototype.requiredWhen = function () {
        var attr = this._node.attr('requiredWhen');
        if (attr) {
            var v = new ramlexpressionImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return DataElementImpl;
})(RAMLLanguageElementImpl);
exports.DataElementImpl = DataElementImpl;
var ModelLocationImpl = (function () {
    function ModelLocationImpl(attr) {
        this.attr = attr;
    }
    return ModelLocationImpl;
})();
exports.ModelLocationImpl = ModelLocationImpl;
var LocationKindImpl = (function () {
    function LocationKindImpl(attr) {
        this.attr = attr;
    }
    return LocationKindImpl;
})();
exports.LocationKindImpl = LocationKindImpl;
var XMLInfoImpl = (function (_super) {
    __extends(XMLInfoImpl, _super);
    function XMLInfoImpl() {
        _super.apply(this, arguments);
    }
    XMLInfoImpl.prototype.name = function () {
        var attr = this._node.attr('name');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    XMLInfoImpl.prototype.namespace = function () {
        var attr = this._node.attr('namespace');
        if (attr) {
            var v = new FixedUriImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    XMLInfoImpl.prototype.prefix = function () {
        var attr = this._node.attr('prefix');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    XMLInfoImpl.prototype.attribute = function () {
        var attr = this._node.attr('attribute');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    XMLInfoImpl.prototype.wrapped = function () {
        var attr = this._node.attr('wrapped');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return XMLInfoImpl;
})(BasicNodeImpl);
exports.XMLInfoImpl = XMLInfoImpl;
var FileParameterImpl = (function (_super) {
    __extends(FileParameterImpl, _super);
    function FileParameterImpl() {
        _super.apply(this, arguments);
    }
    FileParameterImpl.prototype.fileTypes = function () {
        var attrs = this._node.attributes('fileTypes');
        if (attrs) {
            return attrs.map(function (x) { return new ContentTypeImpl(x); });
        }
        return [];
    };
    FileParameterImpl.prototype.minLength = function () {
        var attr = this._node.attr('minLength');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    FileParameterImpl.prototype.maxLength = function () {
        var attr = this._node.attr('maxLength');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return FileParameterImpl;
})(DataElementImpl);
exports.FileParameterImpl = FileParameterImpl;
var ArrayFieldImpl = (function (_super) {
    __extends(ArrayFieldImpl, _super);
    function ArrayFieldImpl() {
        _super.apply(this, arguments);
    }
    ArrayFieldImpl.prototype.items = function () {
        var attrs = this._node.attributes('items');
        if (attrs) {
            return attrs.map(function (x) { return new DataElementRefImpl(x); });
        }
        return [];
    };
    ArrayFieldImpl.prototype.uniqueItems = function () {
        var attr = this._node.attr('uniqueItems');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ArrayFieldImpl.prototype.minItems = function () {
        var attr = this._node.attr('minItems');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ArrayFieldImpl.prototype.maxItems = function () {
        var attr = this._node.attr('maxItems');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return ArrayFieldImpl;
})(DataElementImpl);
exports.ArrayFieldImpl = ArrayFieldImpl;
var UnionFieldImpl = (function (_super) {
    __extends(UnionFieldImpl, _super);
    function UnionFieldImpl() {
        _super.apply(this, arguments);
    }
    UnionFieldImpl.prototype.typePropertyName = function () {
        var attr = this._node.attr('typePropertyName');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    UnionFieldImpl.prototype.oneOf = function () {
        var attrs = this._node.attributes('oneOf');
        if (attrs) {
            return attrs.map(function (x) { return new pointerImpl(x); });
        }
        return [];
    };
    return UnionFieldImpl;
})(DataElementImpl);
exports.UnionFieldImpl = UnionFieldImpl;
var ObjectFieldImpl = (function (_super) {
    __extends(ObjectFieldImpl, _super);
    function ObjectFieldImpl() {
        _super.apply(this, arguments);
    }
    ObjectFieldImpl.prototype.properties = function () {
        var elements = this._node.elementsOfKind('properties');
        if (elements) {
            return elements.map(function (x) { return new DataElementImpl(x); });
        }
        else {
            return null;
        }
    };
    ObjectFieldImpl.prototype.minProperties = function () {
        var attr = this._node.attr('minProperties');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ObjectFieldImpl.prototype.maxProperties = function () {
        var attr = this._node.attr('maxProperties');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ObjectFieldImpl.prototype.additionalProperties = function () {
        var v = this._node.element('additionalProperties');
        if (!v) {
            return null;
        }
        return new DataElementImpl(v);
    };
    ObjectFieldImpl.prototype.patternProperties = function () {
        var elements = this._node.elementsOfKind('patternProperties');
        if (elements) {
            return elements.map(function (x) { return new DataElementImpl(x); });
        }
        else {
            return null;
        }
    };
    ObjectFieldImpl.prototype.typePropertyName = function () {
        var attr = this._node.attr('typePropertyName');
        if (attr) {
            var v = new pointerImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return ObjectFieldImpl;
})(DataElementImpl);
exports.ObjectFieldImpl = ObjectFieldImpl;
var StrElementImpl = (function (_super) {
    __extends(StrElementImpl, _super);
    function StrElementImpl() {
        _super.apply(this, arguments);
    }
    StrElementImpl.prototype.pattern = function () {
        var attr = this._node.attr('pattern');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    StrElementImpl.prototype.minLength = function () {
        var attr = this._node.attr('minLength');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    StrElementImpl.prototype.maxLength = function () {
        var attr = this._node.attr('maxLength');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    StrElementImpl.prototype.enum = function () {
        var attrs = this._node.attributes('enum');
        if (attrs) {
            return attrs.map(function (x) { return x.value(); });
        }
        return [];
    };
    return StrElementImpl;
})(DataElementImpl);
exports.StrElementImpl = StrElementImpl;
var WrappedJSONImpl = (function (_super) {
    __extends(WrappedJSONImpl, _super);
    function WrappedJSONImpl() {
        _super.apply(this, arguments);
    }
    WrappedJSONImpl.prototype.schema = function () {
        var attr = this._node.attr('schema');
        if (attr) {
            var v = new SchemaStringImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return WrappedJSONImpl;
})(DataElementImpl);
exports.WrappedJSONImpl = WrappedJSONImpl;
var WrappedXMLImpl = (function (_super) {
    __extends(WrappedXMLImpl, _super);
    function WrappedXMLImpl() {
        _super.apply(this, arguments);
    }
    WrappedXMLImpl.prototype.schema = function () {
        var attr = this._node.attr('schema');
        if (attr) {
            var v = new SchemaStringImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return WrappedXMLImpl;
})(DataElementImpl);
exports.WrappedXMLImpl = WrappedXMLImpl;
var BooleanElementImpl = (function (_super) {
    __extends(BooleanElementImpl, _super);
    function BooleanElementImpl() {
        _super.apply(this, arguments);
    }
    return BooleanElementImpl;
})(DataElementImpl);
exports.BooleanElementImpl = BooleanElementImpl;
var NumberElementImpl = (function (_super) {
    __extends(NumberElementImpl, _super);
    function NumberElementImpl() {
        _super.apply(this, arguments);
    }
    NumberElementImpl.prototype.minimum = function () {
        var attr = this._node.attr('minimum');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    NumberElementImpl.prototype.maximum = function () {
        var attr = this._node.attr('maximum');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    NumberElementImpl.prototype.enum = function () {
        var attrs = this._node.attributes('enum');
        if (attrs) {
            return attrs.map(function (x) { return x.value(); });
        }
        return [];
    };
    NumberElementImpl.prototype.format = function () {
        var attr = this._node.attr('format');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return NumberElementImpl;
})(DataElementImpl);
exports.NumberElementImpl = NumberElementImpl;
var IntegerElementImpl = (function (_super) {
    __extends(IntegerElementImpl, _super);
    function IntegerElementImpl() {
        _super.apply(this, arguments);
    }
    IntegerElementImpl.prototype.format = function () {
        var attr = this._node.attr('format');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return IntegerElementImpl;
})(NumberElementImpl);
exports.IntegerElementImpl = IntegerElementImpl;
var RAMLPointerElementImpl = (function (_super) {
    __extends(RAMLPointerElementImpl, _super);
    function RAMLPointerElementImpl() {
        _super.apply(this, arguments);
    }
    RAMLPointerElementImpl.prototype.target = function () {
        var attr = this._node.attr('target');
        if (attr) {
            var v = new RAMLSelectorImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return RAMLPointerElementImpl;
})(DataElementImpl);
exports.RAMLPointerElementImpl = RAMLPointerElementImpl;
var RAMLExpressionImpl = (function (_super) {
    __extends(RAMLExpressionImpl, _super);
    function RAMLExpressionImpl() {
        _super.apply(this, arguments);
    }
    return RAMLExpressionImpl;
})(DataElementImpl);
exports.RAMLExpressionImpl = RAMLExpressionImpl;
var ScriptHookElementImpl = (function (_super) {
    __extends(ScriptHookElementImpl, _super);
    function ScriptHookElementImpl() {
        _super.apply(this, arguments);
    }
    ScriptHookElementImpl.prototype.declararedIn = function () {
        var attr = this._node.attr('declararedIn');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ScriptHookElementImpl.prototype.interfaceName = function () {
        var attr = this._node.attr('interfaceName');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return ScriptHookElementImpl;
})(DataElementImpl);
exports.ScriptHookElementImpl = ScriptHookElementImpl;
var SchemaElementImpl = (function (_super) {
    __extends(SchemaElementImpl, _super);
    function SchemaElementImpl() {
        _super.apply(this, arguments);
    }
    return SchemaElementImpl;
})(DataElementImpl);
exports.SchemaElementImpl = SchemaElementImpl;
var ExampleElementImpl = (function (_super) {
    __extends(ExampleElementImpl, _super);
    function ExampleElementImpl() {
        _super.apply(this, arguments);
    }
    return ExampleElementImpl;
})(DataElementImpl);
exports.ExampleElementImpl = ExampleElementImpl;
var DateElementImpl = (function (_super) {
    __extends(DateElementImpl, _super);
    function DateElementImpl() {
        _super.apply(this, arguments);
    }
    DateElementImpl.prototype.dateFormat = function () {
        var attr = this._node.attr('dateFormat');
        if (attr) {
            var v = new DateFormatSpecImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return DateElementImpl;
})(DataElementImpl);
exports.DateElementImpl = DateElementImpl;
var HasNormalParametersImpl = (function (_super) {
    __extends(HasNormalParametersImpl, _super);
    function HasNormalParametersImpl() {
        _super.apply(this, arguments);
    }
    HasNormalParametersImpl.prototype.queryParameters = function () {
        var elements = this._node.elementsOfKind('queryParameters');
        if (elements) {
            return elements.map(function (x) { return new DataElementImpl(x); });
        }
        else {
            return null;
        }
    };
    HasNormalParametersImpl.prototype.headers = function () {
        var elements = this._node.elementsOfKind('headers');
        if (elements) {
            return elements.map(function (x) { return new DataElementImpl(x); });
        }
        else {
            return null;
        }
    };
    return HasNormalParametersImpl;
})(RAMLLanguageElementImpl);
exports.HasNormalParametersImpl = HasNormalParametersImpl;
var ResourceBaseImpl = (function (_super) {
    __extends(ResourceBaseImpl, _super);
    function ResourceBaseImpl() {
        _super.apply(this, arguments);
    }
    ResourceBaseImpl.prototype.methods = function () {
        var elements = this._node.elementsOfKind('methods');
        if (elements) {
            return elements.map(function (x) { return new MethodImpl(x); });
        }
        else {
            return null;
        }
    };
    ResourceBaseImpl.prototype.is = function () {
        var attrs = this._node.attributes('is');
        if (attrs) {
            return attrs.map(function (x) { return new TraitRefImpl(x); });
        }
        return [];
    };
    ResourceBaseImpl.prototype["type"] = function () {
        var attr = this._node.attr('type');
        if (attr) {
            var v = new ResourceTypeRefImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    ResourceBaseImpl.prototype.securedBy = function () {
        var attrs = this._node.attributes('securedBy');
        if (attrs) {
            return attrs.map(function (x) { return new SecuritySchemaRefImpl(x); });
        }
        return [];
    };
    ResourceBaseImpl.prototype.uriParameters = function () {
        var elements = this._node.elementsOfKind('uriParameters');
        if (elements) {
            return elements.map(function (x) { return new DataElementImpl(x); });
        }
        else {
            return null;
        }
    };
    return ResourceBaseImpl;
})(HasNormalParametersImpl);
exports.ResourceBaseImpl = ResourceBaseImpl;
var MethodBaseImpl = (function (_super) {
    __extends(MethodBaseImpl, _super);
    function MethodBaseImpl() {
        _super.apply(this, arguments);
    }
    MethodBaseImpl.prototype.responses = function () {
        var elements = this._node.elementsOfKind('responses');
        if (elements) {
            return elements.map(function (x) { return new ResponseImpl(x); });
        }
        else {
            return null;
        }
    };
    MethodBaseImpl.prototype.body = function () {
        var elements = this._node.elementsOfKind('body');
        if (elements) {
            return elements.map(function (x) { return new BodyLikeImpl(x); });
        }
        else {
            return null;
        }
    };
    MethodBaseImpl.prototype.protocols = function () {
        var attrs = this._node.attributes('protocols');
        if (attrs) {
            return attrs.map(function (x) { return x.value(); });
        }
        return [];
    };
    MethodBaseImpl.prototype.is = function () {
        var attrs = this._node.attributes('is');
        if (attrs) {
            return attrs.map(function (x) { return new TraitRefImpl(x); });
        }
        return [];
    };
    MethodBaseImpl.prototype.securedBy = function () {
        var attrs = this._node.attributes('securedBy');
        if (attrs) {
            return attrs.map(function (x) { return new SecuritySchemaRefImpl(x); });
        }
        return [];
    };
    return MethodBaseImpl;
})(HasNormalParametersImpl);
exports.MethodBaseImpl = MethodBaseImpl;
var MethodImpl = (function (_super) {
    __extends(MethodImpl, _super);
    function MethodImpl() {
        _super.apply(this, arguments);
    }
    MethodImpl.prototype.method = function () {
        var attr = this._node.attr('method');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return MethodImpl;
})(MethodBaseImpl);
exports.MethodImpl = MethodImpl;
var ResourceTypeImpl = (function (_super) {
    __extends(ResourceTypeImpl, _super);
    function ResourceTypeImpl() {
        _super.apply(this, arguments);
    }
    ResourceTypeImpl.prototype.name = function () {
        var attr = this._node.attr('name');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ResourceTypeImpl.prototype.usage = function () {
        var attr = this._node.attr('usage');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return ResourceTypeImpl;
})(ResourceBaseImpl);
exports.ResourceTypeImpl = ResourceTypeImpl;
var ResourceImpl = (function (_super) {
    __extends(ResourceImpl, _super);
    function ResourceImpl() {
        _super.apply(this, arguments);
    }
    ResourceImpl.prototype.relativeUri = function () {
        var attr = this._node.attr('relativeUri');
        if (attr) {
            var v = new RelativeUriImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    ResourceImpl.prototype.resources = function () {
        var elements = this._node.elementsOfKind('resources');
        if (elements) {
            return elements.map(function (x) { return new ResourceImpl(x); });
        }
        else {
            return null;
        }
    };
    return ResourceImpl;
})(ResourceBaseImpl);
exports.ResourceImpl = ResourceImpl;
var ResponseImpl = (function (_super) {
    __extends(ResponseImpl, _super);
    function ResponseImpl() {
        _super.apply(this, arguments);
    }
    ResponseImpl.prototype.code = function () {
        var attr = this._node.attr('code');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ResponseImpl.prototype.headers = function () {
        var elements = this._node.elementsOfKind('headers');
        if (elements) {
            return elements.map(function (x) { return new DataElementImpl(x); });
        }
        else {
            return null;
        }
    };
    ResponseImpl.prototype.body = function () {
        var elements = this._node.elementsOfKind('body');
        if (elements) {
            return elements.map(function (x) { return new BodyLikeImpl(x); });
        }
        else {
            return null;
        }
    };
    return ResponseImpl;
})(RAMLLanguageElementImpl);
exports.ResponseImpl = ResponseImpl;
var BodyLikeImpl = (function (_super) {
    __extends(BodyLikeImpl, _super);
    function BodyLikeImpl() {
        _super.apply(this, arguments);
    }
    BodyLikeImpl.prototype.mediaType = function () {
        var attr = this._node.attr('mediaType');
        if (attr) {
            var v = new MimeTypeImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    BodyLikeImpl.prototype.schema = function () {
        var attr = this._node.attr('schema');
        if (attr) {
            var v = new SchemaStringImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    BodyLikeImpl.prototype.example = function () {
        var attr = this._node.attr('example');
        if (attr) {
            var v = new ExampleStringImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    BodyLikeImpl.prototype.examples = function () {
        var elements = this._node.elementsOfKind('examples');
        if (elements) {
            return elements.map(function (x) { return new ExampleSpecImpl(x); });
        }
        else {
            return null;
        }
    };
    BodyLikeImpl.prototype.formParameters = function () {
        var elements = this._node.elementsOfKind('formParameters');
        if (elements) {
            return elements.map(function (x) { return new DataElementImpl(x); });
        }
        else {
            return null;
        }
    };
    return BodyLikeImpl;
})(RAMLLanguageElementImpl);
exports.BodyLikeImpl = BodyLikeImpl;
var ExampleSpecImpl = (function (_super) {
    __extends(ExampleSpecImpl, _super);
    function ExampleSpecImpl() {
        _super.apply(this, arguments);
    }
    ExampleSpecImpl.prototype.content = function () {
        var attr = this._node.attr('content');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ExampleSpecImpl.prototype.isFormal = function () {
        var attr = this._node.attr('isFormal');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ExampleSpecImpl.prototype.name = function () {
        var attr = this._node.attr('name');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ExampleSpecImpl.prototype.condition = function () {
        var attr = this._node.attr('condition');
        if (attr) {
            var v = new ramlexpressionImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return ExampleSpecImpl;
})(RAMLLanguageElementImpl);
exports.ExampleSpecImpl = ExampleSpecImpl;
var BodyImpl = (function (_super) {
    __extends(BodyImpl, _super);
    function BodyImpl() {
        _super.apply(this, arguments);
    }
    return BodyImpl;
})(BodyLikeImpl);
exports.BodyImpl = BodyImpl;
var XMLBodyImpl = (function (_super) {
    __extends(XMLBodyImpl, _super);
    function XMLBodyImpl() {
        _super.apply(this, arguments);
    }
    XMLBodyImpl.prototype.schema = function () {
        var attr = this._node.attr('schema');
        if (attr) {
            var v = new XMLSchemaStringImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return XMLBodyImpl;
})(BodyImpl);
exports.XMLBodyImpl = XMLBodyImpl;
var JSONBodyImpl = (function (_super) {
    __extends(JSONBodyImpl, _super);
    function JSONBodyImpl() {
        _super.apply(this, arguments);
    }
    JSONBodyImpl.prototype.schema = function () {
        var attr = this._node.attr('schema');
        if (attr) {
            var v = new JSonSchemaStringImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return JSONBodyImpl;
})(BodyImpl);
exports.JSONBodyImpl = JSONBodyImpl;
var TraitImpl = (function (_super) {
    __extends(TraitImpl, _super);
    function TraitImpl() {
        _super.apply(this, arguments);
    }
    TraitImpl.prototype.name = function () {
        var attr = this._node.attr('name');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    TraitImpl.prototype.usage = function () {
        var attr = this._node.attr('usage');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return TraitImpl;
})(MethodBaseImpl);
exports.TraitImpl = TraitImpl;
var SecuritySchemaPartImpl = (function (_super) {
    __extends(SecuritySchemaPartImpl, _super);
    function SecuritySchemaPartImpl() {
        _super.apply(this, arguments);
    }
    return SecuritySchemaPartImpl;
})(MethodBaseImpl);
exports.SecuritySchemaPartImpl = SecuritySchemaPartImpl;
var SecuritySchemaSettingsImpl = (function (_super) {
    __extends(SecuritySchemaSettingsImpl, _super);
    function SecuritySchemaSettingsImpl() {
        _super.apply(this, arguments);
    }
    SecuritySchemaSettingsImpl.prototype.authentificationConfigurator = function () {
        var attr = this._node.attr('authentificationConfigurator');
        if (attr) {
            var v = new SecuritySchemaHookImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return SecuritySchemaSettingsImpl;
})(RAMLLanguageElementImpl);
exports.SecuritySchemaSettingsImpl = SecuritySchemaSettingsImpl;
var Oath1SecurySchemaSettingsImpl = (function (_super) {
    __extends(Oath1SecurySchemaSettingsImpl, _super);
    function Oath1SecurySchemaSettingsImpl() {
        _super.apply(this, arguments);
    }
    Oath1SecurySchemaSettingsImpl.prototype.requestTokenUri = function () {
        var attr = this._node.attr('requestTokenUri');
        if (attr) {
            var v = new FixedUriImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    Oath1SecurySchemaSettingsImpl.prototype.authorizationUri = function () {
        var attr = this._node.attr('authorizationUri');
        if (attr) {
            var v = new FixedUriImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    Oath1SecurySchemaSettingsImpl.prototype.tokenCredentialsUri = function () {
        var attr = this._node.attr('tokenCredentialsUri');
        if (attr) {
            var v = new FixedUriImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return Oath1SecurySchemaSettingsImpl;
})(SecuritySchemaSettingsImpl);
exports.Oath1SecurySchemaSettingsImpl = Oath1SecurySchemaSettingsImpl;
var Oath2SecurySchemaSettingsImpl = (function (_super) {
    __extends(Oath2SecurySchemaSettingsImpl, _super);
    function Oath2SecurySchemaSettingsImpl() {
        _super.apply(this, arguments);
    }
    Oath2SecurySchemaSettingsImpl.prototype.accessTokenUri = function () {
        var attr = this._node.attr('accessTokenUri');
        if (attr) {
            var v = new FixedUriImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    Oath2SecurySchemaSettingsImpl.prototype.authorizationUri = function () {
        var attr = this._node.attr('authorizationUri');
        if (attr) {
            var v = new FixedUriImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    Oath2SecurySchemaSettingsImpl.prototype.authorizationGrants = function () {
        var attrs = this._node.attributes('authorizationGrants');
        if (attrs) {
            return attrs.map(function (x) { return x.value(); });
        }
        return [];
    };
    Oath2SecurySchemaSettingsImpl.prototype.scopes = function () {
        var attrs = this._node.attributes('scopes');
        if (attrs) {
            return attrs.map(function (x) { return x.value(); });
        }
        return [];
    };
    return Oath2SecurySchemaSettingsImpl;
})(SecuritySchemaSettingsImpl);
exports.Oath2SecurySchemaSettingsImpl = Oath2SecurySchemaSettingsImpl;
var ApiKeyImpl = (function (_super) {
    __extends(ApiKeyImpl, _super);
    function ApiKeyImpl() {
        _super.apply(this, arguments);
    }
    ApiKeyImpl.prototype["in"] = function () {
        var attr = this._node.attr('in');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ApiKeyImpl.prototype.parameterName = function () {
        var attr = this._node.attr('parameterName');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return ApiKeyImpl;
})(SecuritySchemaSettingsImpl);
exports.ApiKeyImpl = ApiKeyImpl;
var SecuritySchemaImpl = (function (_super) {
    __extends(SecuritySchemaImpl, _super);
    function SecuritySchemaImpl() {
        _super.apply(this, arguments);
    }
    SecuritySchemaImpl.prototype.name = function () {
        var attr = this._node.attr('name');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    SecuritySchemaImpl.prototype["type"] = function () {
        var attr = this._node.attr('type');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    SecuritySchemaImpl.prototype.description = function () {
        var attr = this._node.attr('description');
        if (attr) {
            var v = new MarkdownStringImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    SecuritySchemaImpl.prototype.describedBy = function () {
        var v = this._node.element('describedBy');
        if (!v) {
            return null;
        }
        return new SecuritySchemaPartImpl(v);
    };
    SecuritySchemaImpl.prototype.settings = function () {
        var v = this._node.element('settings');
        if (!v) {
            return null;
        }
        return new SecuritySchemaSettingsImpl(v);
    };
    return SecuritySchemaImpl;
})(RAMLLanguageElementImpl);
exports.SecuritySchemaImpl = SecuritySchemaImpl;
var Oath2Impl = (function (_super) {
    __extends(Oath2Impl, _super);
    function Oath2Impl() {
        _super.apply(this, arguments);
    }
    Oath2Impl.prototype.settings = function () {
        var v = this._node.element('settings');
        if (!v) {
            return null;
        }
        return new Oath2SecurySchemaSettingsImpl(v);
    };
    return Oath2Impl;
})(SecuritySchemaImpl);
exports.Oath2Impl = Oath2Impl;
var Oath1Impl = (function (_super) {
    __extends(Oath1Impl, _super);
    function Oath1Impl() {
        _super.apply(this, arguments);
    }
    return Oath1Impl;
})(SecuritySchemaImpl);
exports.Oath1Impl = Oath1Impl;
var BasicImpl = (function (_super) {
    __extends(BasicImpl, _super);
    function BasicImpl() {
        _super.apply(this, arguments);
    }
    return BasicImpl;
})(SecuritySchemaImpl);
exports.BasicImpl = BasicImpl;
var DigestImpl = (function (_super) {
    __extends(DigestImpl, _super);
    function DigestImpl() {
        _super.apply(this, arguments);
    }
    return DigestImpl;
})(SecuritySchemaImpl);
exports.DigestImpl = DigestImpl;
var CustomImpl = (function (_super) {
    __extends(CustomImpl, _super);
    function CustomImpl() {
        _super.apply(this, arguments);
    }
    return CustomImpl;
})(SecuritySchemaImpl);
exports.CustomImpl = CustomImpl;
var AnnotationTypeImpl = (function (_super) {
    __extends(AnnotationTypeImpl, _super);
    function AnnotationTypeImpl() {
        _super.apply(this, arguments);
    }
    AnnotationTypeImpl.prototype.name = function () {
        var attr = this._node.attr('name');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    AnnotationTypeImpl.prototype.parameters = function () {
        var elements = this._node.elementsOfKind('parameters');
        if (elements) {
            return elements.map(function (x) { return new DataElementImpl(x); });
        }
        else {
            return null;
        }
    };
    AnnotationTypeImpl.prototype.allowMultiple = function () {
        var attr = this._node.attr('allowMultiple');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    AnnotationTypeImpl.prototype.allowedTargets = function () {
        var attrs = this._node.attributes('allowedTargets');
        if (attrs) {
            return attrs.map(function (x) { return new AnnotationTargetImpl(x); });
        }
        return [];
    };
    return AnnotationTypeImpl;
})(RAMLLanguageElementImpl);
exports.AnnotationTypeImpl = AnnotationTypeImpl;
var LibraryImpl = (function (_super) {
    __extends(LibraryImpl, _super);
    function LibraryImpl() {
        _super.apply(this, arguments);
    }
    LibraryImpl.prototype.title = function () {
        var attr = this._node.attr('title');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    LibraryImpl.prototype.name = function () {
        var attr = this._node.attr('name');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    LibraryImpl.prototype.schemas = function () {
        var elements = this._node.elementsOfKind('schemas');
        if (elements) {
            return elements.map(function (x) { return new GlobalSchemaImpl(x); });
        }
        else {
            return null;
        }
    };
    LibraryImpl.prototype.models = function () {
        var elements = this._node.elementsOfKind('models');
        if (elements) {
            return elements.map(function (x) { return new DataElementImpl(x); });
        }
        else {
            return null;
        }
    };
    LibraryImpl.prototype.examples = function () {
        var elements = this._node.elementsOfKind('examples');
        if (elements) {
            return elements.map(function (x) { return new GlobalExampleImpl(x); });
        }
        else {
            return null;
        }
    };
    LibraryImpl.prototype.traits = function () {
        var elements = this._node.elementsOfKind('traits');
        if (elements) {
            return elements.map(function (x) { return new TraitImpl(x); });
        }
        else {
            return null;
        }
    };
    LibraryImpl.prototype.resourceTypes = function () {
        var elements = this._node.elementsOfKind('resourceTypes');
        if (elements) {
            return elements.map(function (x) { return new ResourceTypeImpl(x); });
        }
        else {
            return null;
        }
    };
    LibraryImpl.prototype.annotationTypes = function () {
        var elements = this._node.elementsOfKind('annotationTypes');
        if (elements) {
            return elements.map(function (x) { return new AnnotationTypeImpl(x); });
        }
        else {
            return null;
        }
    };
    LibraryImpl.prototype.securitySchemaTypes = function () {
        var elements = this._node.elementsOfKind('securitySchemaTypes');
        if (elements) {
            return elements.map(function (x) { return new SecuritySchemaTypeImpl(x); });
        }
        else {
            return null;
        }
    };
    LibraryImpl.prototype.securitySchemes = function () {
        var elements = this._node.elementsOfKind('securitySchemes');
        if (elements) {
            return elements.map(function (x) { return new SecuritySchemaImpl(x); });
        }
        else {
            return null;
        }
    };
    LibraryImpl.prototype.uses = function () {
        var elements = this._node.elementsOfKind('uses');
        if (elements) {
            return elements.map(function (x) { return new LibraryImpl(x); });
        }
        else {
            return null;
        }
    };
    return LibraryImpl;
})(RAMLLanguageElementImpl);
exports.LibraryImpl = LibraryImpl;
var RAMLSimpleElementImpl = (function (_super) {
    __extends(RAMLSimpleElementImpl, _super);
    function RAMLSimpleElementImpl() {
        _super.apply(this, arguments);
    }
    return RAMLSimpleElementImpl;
})(BasicNodeImpl);
exports.RAMLSimpleElementImpl = RAMLSimpleElementImpl;
var GlobalExampleImpl = (function (_super) {
    __extends(GlobalExampleImpl, _super);
    function GlobalExampleImpl() {
        _super.apply(this, arguments);
    }
    GlobalExampleImpl.prototype.key = function () {
        var attr = this._node.attr('key');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    GlobalExampleImpl.prototype.value = function () {
        var attr = this._node.attr('value');
        if (attr) {
            var v = new ExampleStringImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return GlobalExampleImpl;
})(RAMLSimpleElementImpl);
exports.GlobalExampleImpl = GlobalExampleImpl;
var ImportDeclarationImpl = (function (_super) {
    __extends(ImportDeclarationImpl, _super);
    function ImportDeclarationImpl() {
        _super.apply(this, arguments);
    }
    ImportDeclarationImpl.prototype.key = function () {
        var attr = this._node.attr('key');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ImportDeclarationImpl.prototype.value = function () {
        var v = this._node.element('value');
        if (!v) {
            return null;
        }
        return new LibraryImpl(v);
    };
    return ImportDeclarationImpl;
})(RAMLSimpleElementImpl);
exports.ImportDeclarationImpl = ImportDeclarationImpl;
var GlobalSchemaImpl = (function (_super) {
    __extends(GlobalSchemaImpl, _super);
    function GlobalSchemaImpl() {
        _super.apply(this, arguments);
    }
    GlobalSchemaImpl.prototype.key = function () {
        var attr = this._node.attr('key');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    GlobalSchemaImpl.prototype.value = function () {
        var attr = this._node.attr('value');
        if (attr) {
            var v = new SchemaStringImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    return GlobalSchemaImpl;
})(RAMLSimpleElementImpl);
exports.GlobalSchemaImpl = GlobalSchemaImpl;
var ApiImpl = (function (_super) {
    __extends(ApiImpl, _super);
    function ApiImpl() {
        _super.apply(this, arguments);
    }
    ApiImpl.prototype.title = function () {
        var attr = this._node.attr('title');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ApiImpl.prototype.definitionType = function () {
        var attr = this._node.attr('definitionType');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ApiImpl.prototype.version = function () {
        var attr = this._node.attr('version');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    ApiImpl.prototype.baseUri = function () {
        var attr = this._node.attr('baseUri');
        if (attr) {
            var v = new FullUriTemplateImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    ApiImpl.prototype.baseUriParameters = function () {
        var elements = this._node.elementsOfKind('baseUriParameters');
        if (elements) {
            return elements.map(function (x) { return new DataElementImpl(x); });
        }
        else {
            return null;
        }
    };
    ApiImpl.prototype.protocols = function () {
        var attrs = this._node.attributes('protocols');
        if (attrs) {
            return attrs.map(function (x) { return x.value(); });
        }
        return [];
    };
    ApiImpl.prototype.mediaType = function () {
        var attr = this._node.attr('mediaType');
        if (attr) {
            var v = new MimeTypeImpl(attr);
            return v;
        }
        else {
            return null;
        }
    };
    ApiImpl.prototype.securedBy = function () {
        var attrs = this._node.attributes('securedBy');
        if (attrs) {
            return attrs.map(function (x) { return new SecuritySchemaRefImpl(x); });
        }
        return [];
    };
    ApiImpl.prototype.resources = function () {
        var elements = this._node.elementsOfKind('resources');
        if (elements) {
            return elements.map(function (x) { return new ResourceImpl(x); });
        }
        else {
            return null;
        }
    };
    ApiImpl.prototype.documentation = function () {
        var elements = this._node.elementsOfKind('documentation');
        if (elements) {
            return elements.map(function (x) { return new DocumentationItemImpl(x); });
        }
        else {
            return null;
        }
    };
    return ApiImpl;
})(LibraryImpl);
exports.ApiImpl = ApiImpl;
var OverlayImpl = (function (_super) {
    __extends(OverlayImpl, _super);
    function OverlayImpl() {
        _super.apply(this, arguments);
    }
    OverlayImpl.prototype.masterRef = function () {
        var attr = this._node.attr('masterRef');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return OverlayImpl;
})(ApiImpl);
exports.OverlayImpl = OverlayImpl;
var ExtensionImpl = (function (_super) {
    __extends(ExtensionImpl, _super);
    function ExtensionImpl() {
        _super.apply(this, arguments);
    }
    ExtensionImpl.prototype.masterRef = function () {
        var attr = this._node.attr('masterRef');
        if (attr) {
            var v = attr.value();
            return v;
        }
        else {
            return null;
        }
    };
    return ExtensionImpl;
})(ApiImpl);
exports.ExtensionImpl = ExtensionImpl;
//# sourceMappingURL=raml003parser.js.map