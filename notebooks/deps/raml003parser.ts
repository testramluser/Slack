
import hl=require('./highLevelAST')
export var WRAPPER_PROPERTY = "__$wrapper__";

export interface BasicNode{

    parent():BasicNode

    highLevel():hl.IHighLevelNode
}

export class BasicNodeImpl implements BasicNode{

    constructor(protected _node:hl.IHighLevelNode){
        _node[WRAPPER_PROPERTY] = this;
    }

    parent():BasicNode{
        var parent = this._node.parent()
        return parent ? parent[WRAPPER_PROPERTY] : null;
    }

    highLevel():hl.IHighLevelNode{
        return this._node;
    }
}

        export interface RAMLLanguageElement extends BasicNode{

        /**
         *
         **/
         //displayName
         displayName(  ):string


        /**
         *
         **/
         //description
         description(  ):MarkdownString


        /**
         *
         **/
         //annotations
         annotations(  ):AnnotationRef[]
}

export class RAMLLanguageElementImpl extends BasicNodeImpl implements RAMLLanguageElement{

        /**
         *
         **/
         //displayName
         displayName(  ):string{var attr = this._node.attr('displayName');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //description
         description(  ):MarkdownString{var attr = this._node.attr('description');
                if (attr) {
                    var v = new MarkdownStringImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //annotations
         annotations(  ):AnnotationRef[]{var attrs = this._node.attributes('annotations');
                if (attrs) {
                    return attrs.map(x=>new AnnotationRefImpl(x));
                }
                return [];}
}

export interface ValueType{

        /**
         *
         **/
         //value
         value(  ):string
}

export class ValueTypeImpl implements ValueType{

        /**
         *
         **/
         //constructor
         constructor( protected attr:hl.IAttribute ){}


        /**
         *
         **/
         //value
         value(  ):string{return this.attr.value()}
}

export interface NumberType extends ValueType{}

export class NumberTypeImpl extends ValueTypeImpl implements NumberType{}

export interface BooleanType extends ValueType{}

export class BooleanTypeImpl extends ValueTypeImpl implements BooleanType{}

export interface Reference extends ValueType{}

export class ReferenceImpl extends ValueTypeImpl implements Reference{}

export interface ResourceTypeRef extends Reference{}

export class ResourceTypeRefImpl extends ReferenceImpl implements ResourceTypeRef{}

export interface TraitRef extends Reference{}

export class TraitRefImpl extends ReferenceImpl implements TraitRef{}

export interface SecuritySchemaRef extends Reference{}

export class SecuritySchemaRefImpl extends ReferenceImpl implements SecuritySchemaRef{}

export interface AnnotationRef extends Reference{}

export class AnnotationRefImpl extends ReferenceImpl implements AnnotationRef{}

export interface DataElementRef extends Reference{}

export class DataElementRefImpl extends ReferenceImpl implements DataElementRef{}

export interface ramlexpression extends ValueType{}

export class ramlexpressionImpl extends ValueTypeImpl implements ramlexpression{}

export interface AnnotationTarget extends ValueType{}

export class AnnotationTargetImpl extends ValueTypeImpl implements AnnotationTarget{}

export interface pointer extends ValueType{}

export class pointerImpl extends ValueTypeImpl implements pointer{}

export interface StringType extends ValueType{}

export class StringTypeImpl extends ValueTypeImpl implements StringType{

        /**
         *
         **/
         //constructor
         constructor( protected attr:hl.IAttribute ){super(attr);}
}

export interface UriTemplate extends StringType{}

export class UriTemplateImpl extends StringTypeImpl implements UriTemplate{}

export interface RelativeUri extends UriTemplate{}

export class RelativeUriImpl extends UriTemplateImpl implements RelativeUri{}

export interface FullUriTemplate extends UriTemplate{}

export class FullUriTemplateImpl extends UriTemplateImpl implements FullUriTemplate{}

export interface FixedUri extends StringType{}

export class FixedUriImpl extends StringTypeImpl implements FixedUri{}

export interface ContentType extends StringType{}

export class ContentTypeImpl extends StringTypeImpl implements ContentType{}

export interface ValidityExpression extends StringType{}

export class ValidityExpressionImpl extends StringTypeImpl implements ValidityExpression{}

export interface DateFormatSpec extends StringType{}

export class DateFormatSpecImpl extends StringTypeImpl implements DateFormatSpec{}

export interface FunctionalInterface extends StringType{}

export class FunctionalInterfaceImpl extends StringTypeImpl implements FunctionalInterface{}

export interface SchemaString extends StringType{}

export class SchemaStringImpl extends StringTypeImpl implements SchemaString{}

export interface JSonSchemaString extends SchemaString{}

export class JSonSchemaStringImpl extends SchemaStringImpl implements JSonSchemaString{}

export interface XMLSchemaString extends SchemaString{}

export class XMLSchemaStringImpl extends SchemaStringImpl implements XMLSchemaString{}

export interface ExampleString extends StringType{}

export class ExampleStringImpl extends StringTypeImpl implements ExampleString{}

export interface ScriptingHook extends StringType{}

export class ScriptingHookImpl extends StringTypeImpl implements ScriptingHook{}

export interface SecuritySchemaHook extends ScriptingHook{}

export class SecuritySchemaHookImpl extends ScriptingHookImpl implements SecuritySchemaHook{}

export interface RAMLPointer extends StringType{}

export class RAMLPointerImpl extends StringTypeImpl implements RAMLPointer{}

export interface RAMLSelector extends StringType{}

export class RAMLSelectorImpl extends StringTypeImpl implements RAMLSelector{}

export interface MimeType extends StringType{}

export class MimeTypeImpl extends StringTypeImpl implements MimeType{}

export interface MarkdownString extends StringType{}

export class MarkdownStringImpl extends StringTypeImpl implements MarkdownString{

        /**
         *
         **/
         //constructor
         constructor( protected attr:hl.IAttribute ){super(attr);}
}

export interface DocumentationItem extends RAMLLanguageElement{

        /**
         *
         **/
         //title
         title(  ):string


        /**
         *
         **/
         //content
         content(  ):MarkdownString
}

export class DocumentationItemImpl extends RAMLLanguageElementImpl implements DocumentationItem{

        /**
         *
         **/
         //title
         title(  ):string{var attr = this._node.attr('title');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //content
         content(  ):MarkdownString{var attr = this._node.attr('content');
                if (attr) {
                    var v = new MarkdownStringImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface ScriptSpec extends RAMLLanguageElement{

        /**
         *
         **/
         //language
         language(  ):string


        /**
         *
         **/
         //content
         content(  ):string
}

export class ScriptSpecImpl extends RAMLLanguageElementImpl implements ScriptSpec{

        /**
         *
         **/
         //language
         language(  ):string{var attr = this._node.attr('language');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //content
         content(  ):string{var attr = this._node.attr('content');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface ApiDescription extends RAMLLanguageElement{

        /**
         *
         **/
         //apiFiles
         apiFiles(  ):Api[]


        /**
         *
         **/
         //script
         script(  ):ScriptSpec[]


        /**
         *
         **/
         //type
         "type"(  ):string
}

export class ApiDescriptionImpl extends RAMLLanguageElementImpl implements ApiDescription{

        /**
         *
         **/
         //apiFiles
         apiFiles(  ):Api[]{
                var elements = this._node.elementsOfKind('apiFiles');
                if(elements) {
                    return elements.map(x=> new ApiImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //script
         script(  ):ScriptSpec[]{
                var elements = this._node.elementsOfKind('script');
                if(elements) {
                    return elements.map(x=> new ScriptSpecImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //type
         "type"(  ):string{var attr = this._node.attr('type');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface CallbackAPIDescription extends ApiDescription{

        /**
         *
         **/
         //callbackFor
         callbackFor(  ):Api
}

export class CallbackAPIDescriptionImpl extends ApiDescriptionImpl implements CallbackAPIDescription{

        /**
         *
         **/
         //callbackFor
         callbackFor(  ):Api{
                var v = this._node.element('callbackFor');
                if(!v){
                    return null;
                }
                return new ApiImpl(v);
            }
}

export interface RAMLProject extends RAMLLanguageElement{

        /**
         *
         **/
         //relatedProjects
         relatedProjects(  ):RAMLProject[]


        /**
         *
         **/
         //declaredApis
         declaredApis(  ):ApiDescription[]


        /**
         *
         **/
         //license
         license(  ):string


        /**
         *
         **/
         //overview
         overview(  ):string


        /**
         *
         **/
         //url
         url(  ):string
}

export class RAMLProjectImpl extends RAMLLanguageElementImpl implements RAMLProject{

        /**
         *
         **/
         //relatedProjects
         relatedProjects(  ):RAMLProject[]{
                var elements = this._node.elementsOfKind('relatedProjects');
                if(elements) {
                    return elements.map(x=> new RAMLProjectImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //declaredApis
         declaredApis(  ):ApiDescription[]{
                var elements = this._node.elementsOfKind('declaredApis');
                if(elements) {
                    return elements.map(x=> new ApiDescriptionImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //license
         license(  ):string{var attr = this._node.attr('license');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //overview
         overview(  ):string{var attr = this._node.attr('overview');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //url
         url(  ):string{var attr = this._node.attr('url');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface SecuritySchemaType extends RAMLLanguageElement{

        /**
         *
         **/
         //requiredSettings
         requiredSettings(  ):DataElement[]


        /**
         *
         **/
         //describedBy
         describedBy(  ):SecuritySchemaPart
}

export class SecuritySchemaTypeImpl extends RAMLLanguageElementImpl implements SecuritySchemaType{

        /**
         *
         **/
         //requiredSettings
         requiredSettings(  ):DataElement[]{
                var elements = this._node.elementsOfKind('requiredSettings');
                if(elements) {
                    return elements.map(x=> new DataElementImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //describedBy
         describedBy(  ):SecuritySchemaPart{
                var v = this._node.element('describedBy');
                if(!v){
                    return null;
                }
                return new SecuritySchemaPartImpl(v);
            }
}

export interface DataElement extends RAMLLanguageElement{

        /**
         *
         **/
         //name
         name(  ):string


        /**
         *
         **/
         //type
         "type"(  ):string[]


        /**
         *
         **/
         //location
         location(  ):ModelLocation


        /**
         *
         **/
         //locationKind
         locationKind(  ):LocationKind


        /**
         *
         **/
         //default
         "default"(  ):string


        /**
         *
         **/
         //sendDefaultByClient
         sendDefaultByClient(  ):boolean


        /**
         *
         **/
         //example
         example(  ):string[]


        /**
         *
         **/
         //repeat
         repeat(  ):boolean


        /**
         *
         **/
         //collectionFormat
         collectionFormat(  ):string


        /**
         *
         **/
         //required
         required(  ):boolean


        /**
         *
         **/
         //scope
         scope(  ):string[]


        /**
         *
         **/
         //xml
         xml(  ):XMLInfo


        /**
         *
         **/
         //validWhen
         validWhen(  ):ramlexpression


        /**
         *
         **/
         //requiredWhen
         requiredWhen(  ):ramlexpression
}

export class DataElementImpl extends RAMLLanguageElementImpl implements DataElement{

        /**
         *
         **/
         //name
         name(  ):string{var attr = this._node.attr('name');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //type
         "type"(  ):string[]{var attrs = this._node.attributes('type');
                if (attrs) {
                    return attrs.map(x=>x.value());
                }
                return [];}


        /**
         *
         **/
         //location
         location(  ):ModelLocation{var attr = this._node.attr('location');
                if (attr) {
                    var v = new ModelLocationImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //locationKind
         locationKind(  ):LocationKind{var attr = this._node.attr('locationKind');
                if (attr) {
                    var v = new LocationKindImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //default
         "default"(  ):string{var attr = this._node.attr('default');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //sendDefaultByClient
         sendDefaultByClient(  ):boolean{var attr = this._node.attr('sendDefaultByClient');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //example
         example(  ):string[]{var attrs = this._node.attributes('example');
                if (attrs) {
                    return attrs.map(x=>x.value());
                }
                return [];}


        /**
         *
         **/
         //repeat
         repeat(  ):boolean{var attr = this._node.attr('repeat');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //collectionFormat
         collectionFormat(  ):string{var attr = this._node.attr('collectionFormat');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //required
         required(  ):boolean{var attr = this._node.attr('required');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //scope
         scope(  ):string[]{var attrs = this._node.attributes('scope');
                if (attrs) {
                    return attrs.map(x=>x.value());
                }
                return [];}


        /**
         *
         **/
         //xml
         xml(  ):XMLInfo{
                var v = this._node.element('xml');
                if(!v){
                    return null;
                }
                return new XMLInfoImpl(v);
            }


        /**
         *
         **/
         //validWhen
         validWhen(  ):ramlexpression{var attr = this._node.attr('validWhen');
                if (attr) {
                    var v = new ramlexpressionImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //requiredWhen
         requiredWhen(  ):ramlexpression{var attr = this._node.attr('requiredWhen');
                if (attr) {
                    var v = new ramlexpressionImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface ModelLocation{}

export class ModelLocationImpl implements ModelLocation{

        /**
         *
         **/
         //constructor
         constructor( protected attr:hl.IAttribute ){}
}

export interface LocationKind{}

export class LocationKindImpl implements LocationKind{

        /**
         *
         **/
         //constructor
         constructor( protected attr:hl.IAttribute ){}
}

export interface XMLInfo extends BasicNode{

        /**
         *
         **/
         //name
         name(  ):string


        /**
         *
         **/
         //namespace
         namespace(  ):FixedUri


        /**
         *
         **/
         //prefix
         prefix(  ):string


        /**
         *
         **/
         //attribute
         attribute(  ):boolean


        /**
         *
         **/
         //wrapped
         wrapped(  ):boolean
}

export class XMLInfoImpl extends BasicNodeImpl implements XMLInfo{

        /**
         *
         **/
         //name
         name(  ):string{var attr = this._node.attr('name');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //namespace
         namespace(  ):FixedUri{var attr = this._node.attr('namespace');
                if (attr) {
                    var v = new FixedUriImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //prefix
         prefix(  ):string{var attr = this._node.attr('prefix');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //attribute
         attribute(  ):boolean{var attr = this._node.attr('attribute');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //wrapped
         wrapped(  ):boolean{var attr = this._node.attr('wrapped');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface FileParameter extends DataElement{

        /**
         *
         **/
         //fileTypes
         fileTypes(  ):ContentType[]


        /**
         *
         **/
         //minLength
         minLength(  ):number


        /**
         *
         **/
         //maxLength
         maxLength(  ):number
}

export class FileParameterImpl extends DataElementImpl implements FileParameter{

        /**
         *
         **/
         //fileTypes
         fileTypes(  ):ContentType[]{var attrs = this._node.attributes('fileTypes');
                if (attrs) {
                    return attrs.map(x=>new ContentTypeImpl(x));
                }
                return [];}


        /**
         *
         **/
         //minLength
         minLength(  ):number{var attr = this._node.attr('minLength');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //maxLength
         maxLength(  ):number{var attr = this._node.attr('maxLength');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface ArrayField extends DataElement{

        /**
         *
         **/
         //items
         items(  ):DataElementRef[]


        /**
         *
         **/
         //uniqueItems
         uniqueItems(  ):boolean


        /**
         *
         **/
         //minItems
         minItems(  ):number


        /**
         *
         **/
         //maxItems
         maxItems(  ):number
}

export class ArrayFieldImpl extends DataElementImpl implements ArrayField{

        /**
         *
         **/
         //items
         items(  ):DataElementRef[]{var attrs = this._node.attributes('items');
                if (attrs) {
                    return attrs.map(x=>new DataElementRefImpl(x));
                }
                return [];}


        /**
         *
         **/
         //uniqueItems
         uniqueItems(  ):boolean{var attr = this._node.attr('uniqueItems');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //minItems
         minItems(  ):number{var attr = this._node.attr('minItems');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //maxItems
         maxItems(  ):number{var attr = this._node.attr('maxItems');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface UnionField extends DataElement{

        /**
         *
         **/
         //typePropertyName
         typePropertyName(  ):string


        /**
         *
         **/
         //oneOf
         oneOf(  ):pointer[]
}

export class UnionFieldImpl extends DataElementImpl implements UnionField{

        /**
         *
         **/
         //typePropertyName
         typePropertyName(  ):string{var attr = this._node.attr('typePropertyName');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //oneOf
         oneOf(  ):pointer[]{var attrs = this._node.attributes('oneOf');
                if (attrs) {
                    return attrs.map(x=>new pointerImpl(x));
                }
                return [];}
}

export interface ObjectField extends DataElement{

        /**
         *
         **/
         //properties
         properties(  ):DataElement[]


        /**
         *
         **/
         //minProperties
         minProperties(  ):number


        /**
         *
         **/
         //maxProperties
         maxProperties(  ):number


        /**
         *
         **/
         //additionalProperties
         additionalProperties(  ):DataElement


        /**
         *
         **/
         //patternProperties
         patternProperties(  ):DataElement[]


        /**
         *
         **/
         //typePropertyName
         typePropertyName(  ):pointer
}

export class ObjectFieldImpl extends DataElementImpl implements ObjectField{

        /**
         *
         **/
         //properties
         properties(  ):DataElement[]{
                var elements = this._node.elementsOfKind('properties');
                if(elements) {
                    return elements.map(x=> new DataElementImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //minProperties
         minProperties(  ):number{var attr = this._node.attr('minProperties');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //maxProperties
         maxProperties(  ):number{var attr = this._node.attr('maxProperties');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //additionalProperties
         additionalProperties(  ):DataElement{
                var v = this._node.element('additionalProperties');
                if(!v){
                    return null;
                }
                return new DataElementImpl(v);
            }


        /**
         *
         **/
         //patternProperties
         patternProperties(  ):DataElement[]{
                var elements = this._node.elementsOfKind('patternProperties');
                if(elements) {
                    return elements.map(x=> new DataElementImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //typePropertyName
         typePropertyName(  ):pointer{var attr = this._node.attr('typePropertyName');
                if (attr) {
                    var v = new pointerImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface StrElement extends DataElement{

        /**
         *
         **/
         //pattern
         pattern(  ):string


        /**
         *
         **/
         //minLength
         minLength(  ):number


        /**
         *
         **/
         //maxLength
         maxLength(  ):number


        /**
         *
         **/
         //enum
         enum(  ):string[]
}

export class StrElementImpl extends DataElementImpl implements StrElement{

        /**
         *
         **/
         //pattern
         pattern(  ):string{var attr = this._node.attr('pattern');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //minLength
         minLength(  ):number{var attr = this._node.attr('minLength');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //maxLength
         maxLength(  ):number{var attr = this._node.attr('maxLength');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //enum
         enum(  ):string[]{var attrs = this._node.attributes('enum');
                if (attrs) {
                    return attrs.map(x=>x.value());
                }
                return [];}
}

export interface WrappedJSON extends DataElement{

        /**
         *
         **/
         //schema
         schema(  ):SchemaString
}

export class WrappedJSONImpl extends DataElementImpl implements WrappedJSON{

        /**
         *
         **/
         //schema
         schema(  ):SchemaString{var attr = this._node.attr('schema');
                if (attr) {
                    var v = new SchemaStringImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface WrappedXML extends DataElement{

        /**
         *
         **/
         //schema
         schema(  ):SchemaString
}

export class WrappedXMLImpl extends DataElementImpl implements WrappedXML{

        /**
         *
         **/
         //schema
         schema(  ):SchemaString{var attr = this._node.attr('schema');
                if (attr) {
                    var v = new SchemaStringImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface BooleanElement extends DataElement{}

export class BooleanElementImpl extends DataElementImpl implements BooleanElement{}

export interface NumberElement extends DataElement{

        /**
         *
         **/
         //minimum
         minimum(  ):number


        /**
         *
         **/
         //maximum
         maximum(  ):number


        /**
         *
         **/
         //enum
         enum(  ):string[]


        /**
         *
         **/
         //format
         format(  ):string
}

export class NumberElementImpl extends DataElementImpl implements NumberElement{

        /**
         *
         **/
         //minimum
         minimum(  ):number{var attr = this._node.attr('minimum');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //maximum
         maximum(  ):number{var attr = this._node.attr('maximum');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //enum
         enum(  ):string[]{var attrs = this._node.attributes('enum');
                if (attrs) {
                    return attrs.map(x=>x.value());
                }
                return [];}


        /**
         *
         **/
         //format
         format(  ):string{var attr = this._node.attr('format');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface IntegerElement extends NumberElement{

        /**
         *
         **/
         //format
         format(  ):string
}

export class IntegerElementImpl extends NumberElementImpl implements IntegerElement{

        /**
         *
         **/
         //format
         format(  ):string{var attr = this._node.attr('format');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface RAMLPointerElement extends DataElement{

        /**
         *
         **/
         //target
         target(  ):RAMLSelector
}

export class RAMLPointerElementImpl extends DataElementImpl implements RAMLPointerElement{

        /**
         *
         **/
         //target
         target(  ):RAMLSelector{var attr = this._node.attr('target');
                if (attr) {
                    var v = new RAMLSelectorImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface RAMLExpression extends DataElement{}

export class RAMLExpressionImpl extends DataElementImpl implements RAMLExpression{}

export interface ScriptHookElement extends DataElement{

        /**
         *
         **/
         //declararedIn
         declararedIn(  ):string


        /**
         *
         **/
         //interfaceName
         interfaceName(  ):string
}

export class ScriptHookElementImpl extends DataElementImpl implements ScriptHookElement{

        /**
         *
         **/
         //declararedIn
         declararedIn(  ):string{var attr = this._node.attr('declararedIn');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //interfaceName
         interfaceName(  ):string{var attr = this._node.attr('interfaceName');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface SchemaElement extends DataElement{}

export class SchemaElementImpl extends DataElementImpl implements SchemaElement{}

export interface ExampleElement extends DataElement{}

export class ExampleElementImpl extends DataElementImpl implements ExampleElement{}

export interface DateElement extends DataElement{

        /**
         *
         **/
         //dateFormat
         dateFormat(  ):DateFormatSpec
}

export class DateElementImpl extends DataElementImpl implements DateElement{

        /**
         *
         **/
         //dateFormat
         dateFormat(  ):DateFormatSpec{var attr = this._node.attr('dateFormat');
                if (attr) {
                    var v = new DateFormatSpecImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface HasNormalParameters extends RAMLLanguageElement{

        /**
         *
         **/
         //queryParameters
         queryParameters(  ):DataElement[]


        /**
         *
         **/
         //headers
         headers(  ):DataElement[]
}

export class HasNormalParametersImpl extends RAMLLanguageElementImpl implements HasNormalParameters{

        /**
         *
         **/
         //queryParameters
         queryParameters(  ):DataElement[]{
                var elements = this._node.elementsOfKind('queryParameters');
                if(elements) {
                    return elements.map(x=> new DataElementImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //headers
         headers(  ):DataElement[]{
                var elements = this._node.elementsOfKind('headers');
                if(elements) {
                    return elements.map(x=> new DataElementImpl(x));
                }
                else {
                    return null;
                }
            }
}

export interface ResourceBase extends HasNormalParameters{

        /**
         *
         **/
         //methods
         methods(  ):Method[]


        /**
         *
         **/
         //is
         is(  ):TraitRef[]


        /**
         *
         **/
         //type
         "type"(  ):ResourceTypeRef


        /**
         *
         **/
         //securedBy
         securedBy(  ):SecuritySchemaRef[]


        /**
         *
         **/
         //uriParameters
         uriParameters(  ):DataElement[]
}

export class ResourceBaseImpl extends HasNormalParametersImpl implements ResourceBase{

        /**
         *
         **/
         //methods
         methods(  ):Method[]{
                var elements = this._node.elementsOfKind('methods');
                if(elements) {
                    return elements.map(x=> new MethodImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //is
         is(  ):TraitRef[]{var attrs = this._node.attributes('is');
                if (attrs) {
                    return attrs.map(x=>new TraitRefImpl(x));
                }
                return [];}


        /**
         *
         **/
         //type
         "type"(  ):ResourceTypeRef{var attr = this._node.attr('type');
                if (attr) {
                    var v = new ResourceTypeRefImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //securedBy
         securedBy(  ):SecuritySchemaRef[]{var attrs = this._node.attributes('securedBy');
                if (attrs) {
                    return attrs.map(x=>new SecuritySchemaRefImpl(x));
                }
                return [];}


        /**
         *
         **/
         //uriParameters
         uriParameters(  ):DataElement[]{
                var elements = this._node.elementsOfKind('uriParameters');
                if(elements) {
                    return elements.map(x=> new DataElementImpl(x));
                }
                else {
                    return null;
                }
            }
}

export interface MethodBase extends HasNormalParameters{

        /**
         *
         **/
         //responses
         responses(  ):Response[]


        /**
         *
         **/
         //body
         body(  ):BodyLike[]


        /**
         *
         **/
         //protocols
         protocols(  ):string[]


        /**
         *
         **/
         //is
         is(  ):TraitRef[]


        /**
         *
         **/
         //securedBy
         securedBy(  ):SecuritySchemaRef[]
}

export interface Method extends MethodBase{

        /**
         *
         **/
         //method
         method(  ):string
}

export class MethodBaseImpl extends HasNormalParametersImpl implements MethodBase{

        /**
         *
         **/
         //responses
         responses(  ):Response[]{
                var elements = this._node.elementsOfKind('responses');
                if(elements) {
                    return elements.map(x=> new ResponseImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //body
         body(  ):BodyLike[]{
                var elements = this._node.elementsOfKind('body');
                if(elements) {
                    return elements.map(x=> new BodyLikeImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //protocols
         protocols(  ):string[]{var attrs = this._node.attributes('protocols');
                if (attrs) {
                    return attrs.map(x=>x.value());
                }
                return [];}


        /**
         *
         **/
         //is
         is(  ):TraitRef[]{var attrs = this._node.attributes('is');
                if (attrs) {
                    return attrs.map(x=>new TraitRefImpl(x));
                }
                return [];}


        /**
         *
         **/
         //securedBy
         securedBy(  ):SecuritySchemaRef[]{var attrs = this._node.attributes('securedBy');
                if (attrs) {
                    return attrs.map(x=>new SecuritySchemaRefImpl(x));
                }
                return [];}
}

export class MethodImpl extends MethodBaseImpl implements Method{

        /**
         *
         **/
         //method
         method(  ):string{var attr = this._node.attr('method');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface ResourceType extends ResourceBase{

        /**
         *
         **/
         //name
         name(  ):string


        /**
         *
         **/
         //usage
         usage(  ):string
}

export class ResourceTypeImpl extends ResourceBaseImpl implements ResourceType{

        /**
         *
         **/
         //name
         name(  ):string{var attr = this._node.attr('name');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //usage
         usage(  ):string{var attr = this._node.attr('usage');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface Resource extends ResourceBase{

        /**
         *
         **/
         //relativeUri
         relativeUri(  ):RelativeUri


        /**
         *
         **/
         //resources
         resources(  ):Resource[]
}

export class ResourceImpl extends ResourceBaseImpl implements Resource{

        /**
         *
         **/
         //relativeUri
         relativeUri(  ):RelativeUri{var attr = this._node.attr('relativeUri');
                if (attr) {
                    var v = new RelativeUriImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //resources
         resources(  ):Resource[]{
                var elements = this._node.elementsOfKind('resources');
                if(elements) {
                    return elements.map(x=> new ResourceImpl(x));
                }
                else {
                    return null;
                }
            }
}

export interface Response extends RAMLLanguageElement{

        /**
         *
         **/
         //code
         code(  ):string


        /**
         *
         **/
         //headers
         headers(  ):DataElement[]


        /**
         *
         **/
         //body
         body(  ):BodyLike[]
}

export class ResponseImpl extends RAMLLanguageElementImpl implements Response{

        /**
         *
         **/
         //code
         code(  ):string{var attr = this._node.attr('code');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //headers
         headers(  ):DataElement[]{
                var elements = this._node.elementsOfKind('headers');
                if(elements) {
                    return elements.map(x=> new DataElementImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //body
         body(  ):BodyLike[]{
                var elements = this._node.elementsOfKind('body');
                if(elements) {
                    return elements.map(x=> new BodyLikeImpl(x));
                }
                else {
                    return null;
                }
            }
}

export interface BodyLike extends RAMLLanguageElement{

        /**
         *
         **/
         //mediaType
         mediaType(  ):MimeType


        /**
         *
         **/
         //schema
         schema(  ):SchemaString


        /**
         *
         **/
         //example
         example(  ):ExampleString


        /**
         *
         **/
         //examples
         examples(  ):ExampleSpec[]


        /**
         *
         **/
         //formParameters
         formParameters(  ):DataElement[]
}

export class BodyLikeImpl extends RAMLLanguageElementImpl implements BodyLike{

        /**
         *
         **/
         //mediaType
         mediaType(  ):MimeType{var attr = this._node.attr('mediaType');
                if (attr) {
                    var v = new MimeTypeImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //schema
         schema(  ):SchemaString{var attr = this._node.attr('schema');
                if (attr) {
                    var v = new SchemaStringImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //example
         example(  ):ExampleString{var attr = this._node.attr('example');
                if (attr) {
                    var v = new ExampleStringImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //examples
         examples(  ):ExampleSpec[]{
                var elements = this._node.elementsOfKind('examples');
                if(elements) {
                    return elements.map(x=> new ExampleSpecImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //formParameters
         formParameters(  ):DataElement[]{
                var elements = this._node.elementsOfKind('formParameters');
                if(elements) {
                    return elements.map(x=> new DataElementImpl(x));
                }
                else {
                    return null;
                }
            }
}

export interface ExampleSpec extends RAMLLanguageElement{

        /**
         *
         **/
         //content
         content(  ):string


        /**
         *
         **/
         //isFormal
         isFormal(  ):boolean


        /**
         *
         **/
         //name
         name(  ):string


        /**
         *
         **/
         //condition
         condition(  ):ramlexpression
}

export class ExampleSpecImpl extends RAMLLanguageElementImpl implements ExampleSpec{

        /**
         *
         **/
         //content
         content(  ):string{var attr = this._node.attr('content');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //isFormal
         isFormal(  ):boolean{var attr = this._node.attr('isFormal');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //name
         name(  ):string{var attr = this._node.attr('name');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //condition
         condition(  ):ramlexpression{var attr = this._node.attr('condition');
                if (attr) {
                    var v = new ramlexpressionImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface Body extends BodyLike{}

export class BodyImpl extends BodyLikeImpl implements Body{}

export interface XMLBody extends Body{

        /**
         *
         **/
         //schema
         schema(  ):XMLSchemaString
}

export class XMLBodyImpl extends BodyImpl implements XMLBody{

        /**
         *
         **/
         //schema
         schema(  ):XMLSchemaString{var attr = this._node.attr('schema');
                if (attr) {
                    var v = new XMLSchemaStringImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface JSONBody extends Body{

        /**
         *
         **/
         //schema
         schema(  ):JSonSchemaString
}

export class JSONBodyImpl extends BodyImpl implements JSONBody{

        /**
         *
         **/
         //schema
         schema(  ):JSonSchemaString{var attr = this._node.attr('schema');
                if (attr) {
                    var v = new JSonSchemaStringImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface Trait extends MethodBase{

        /**
         *
         **/
         //name
         name(  ):string


        /**
         *
         **/
         //usage
         usage(  ):string
}

export class TraitImpl extends MethodBaseImpl implements Trait{

        /**
         *
         **/
         //name
         name(  ):string{var attr = this._node.attr('name');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //usage
         usage(  ):string{var attr = this._node.attr('usage');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface SecuritySchemaPart extends MethodBase{}

export class SecuritySchemaPartImpl extends MethodBaseImpl implements SecuritySchemaPart{}

export interface SecuritySchemaSettings extends RAMLLanguageElement{

        /**
         *
         **/
         //authentificationConfigurator
         authentificationConfigurator(  ):SecuritySchemaHook
}

export class SecuritySchemaSettingsImpl extends RAMLLanguageElementImpl implements SecuritySchemaSettings{

        /**
         *
         **/
         //authentificationConfigurator
         authentificationConfigurator(  ):SecuritySchemaHook{var attr = this._node.attr('authentificationConfigurator');
                if (attr) {
                    var v = new SecuritySchemaHookImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface Oath1SecurySchemaSettings extends SecuritySchemaSettings{

        /**
         *
         **/
         //requestTokenUri
         requestTokenUri(  ):FixedUri


        /**
         *
         **/
         //authorizationUri
         authorizationUri(  ):FixedUri


        /**
         *
         **/
         //tokenCredentialsUri
         tokenCredentialsUri(  ):FixedUri
}

export class Oath1SecurySchemaSettingsImpl extends SecuritySchemaSettingsImpl implements Oath1SecurySchemaSettings{

        /**
         *
         **/
         //requestTokenUri
         requestTokenUri(  ):FixedUri{var attr = this._node.attr('requestTokenUri');
                if (attr) {
                    var v = new FixedUriImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //authorizationUri
         authorizationUri(  ):FixedUri{var attr = this._node.attr('authorizationUri');
                if (attr) {
                    var v = new FixedUriImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //tokenCredentialsUri
         tokenCredentialsUri(  ):FixedUri{var attr = this._node.attr('tokenCredentialsUri');
                if (attr) {
                    var v = new FixedUriImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface Oath2SecurySchemaSettings extends SecuritySchemaSettings{

        /**
         *
         **/
         //accessTokenUri
         accessTokenUri(  ):FixedUri


        /**
         *
         **/
         //authorizationUri
         authorizationUri(  ):FixedUri


        /**
         *
         **/
         //authorizationGrants
         authorizationGrants(  ):string[]


        /**
         *
         **/
         //scopes
         scopes(  ):string[]
}

export class Oath2SecurySchemaSettingsImpl extends SecuritySchemaSettingsImpl implements Oath2SecurySchemaSettings{

        /**
         *
         **/
         //accessTokenUri
         accessTokenUri(  ):FixedUri{var attr = this._node.attr('accessTokenUri');
                if (attr) {
                    var v = new FixedUriImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //authorizationUri
         authorizationUri(  ):FixedUri{var attr = this._node.attr('authorizationUri');
                if (attr) {
                    var v = new FixedUriImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //authorizationGrants
         authorizationGrants(  ):string[]{var attrs = this._node.attributes('authorizationGrants');
                if (attrs) {
                    return attrs.map(x=>x.value());
                }
                return [];}


        /**
         *
         **/
         //scopes
         scopes(  ):string[]{var attrs = this._node.attributes('scopes');
                if (attrs) {
                    return attrs.map(x=>x.value());
                }
                return [];}
}

export interface ApiKey extends SecuritySchemaSettings{

        /**
         *
         **/
         //in
         "in"(  ):string


        /**
         *
         **/
         //parameterName
         parameterName(  ):string
}

export class ApiKeyImpl extends SecuritySchemaSettingsImpl implements ApiKey{

        /**
         *
         **/
         //in
         "in"(  ):string{var attr = this._node.attr('in');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //parameterName
         parameterName(  ):string{var attr = this._node.attr('parameterName');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface SecuritySchema extends RAMLLanguageElement{

        /**
         *
         **/
         //name
         name(  ):string


        /**
         *
         **/
         //type
         "type"(  ):string


        /**
         *
         **/
         //description
         description(  ):MarkdownString


        /**
         *
         **/
         //describedBy
         describedBy(  ):SecuritySchemaPart


        /**
         *
         **/
         //settings
         settings(  ):SecuritySchemaSettings
}

export class SecuritySchemaImpl extends RAMLLanguageElementImpl implements SecuritySchema{

        /**
         *
         **/
         //name
         name(  ):string{var attr = this._node.attr('name');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //type
         "type"(  ):string{var attr = this._node.attr('type');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //description
         description(  ):MarkdownString{var attr = this._node.attr('description');
                if (attr) {
                    var v = new MarkdownStringImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //describedBy
         describedBy(  ):SecuritySchemaPart{
                var v = this._node.element('describedBy');
                if(!v){
                    return null;
                }
                return new SecuritySchemaPartImpl(v);
            }


        /**
         *
         **/
         //settings
         settings(  ):SecuritySchemaSettings{
                var v = this._node.element('settings');
                if(!v){
                    return null;
                }
                return new SecuritySchemaSettingsImpl(v);
            }
}

export interface Oath2 extends SecuritySchema{

        /**
         *
         **/
         //settings
         settings(  ):Oath2SecurySchemaSettings
}

export class Oath2Impl extends SecuritySchemaImpl implements Oath2{

        /**
         *
         **/
         //settings
         settings(  ):Oath2SecurySchemaSettings{
                var v = this._node.element('settings');
                if(!v){
                    return null;
                }
                return new Oath2SecurySchemaSettingsImpl(v);
            }
}

export interface Oath1 extends SecuritySchema{}

export class Oath1Impl extends SecuritySchemaImpl implements Oath1{}

export interface Basic extends SecuritySchema{}

export class BasicImpl extends SecuritySchemaImpl implements Basic{}

export interface Digest extends SecuritySchema{}

export class DigestImpl extends SecuritySchemaImpl implements Digest{}

export interface Custom extends SecuritySchema{}

export class CustomImpl extends SecuritySchemaImpl implements Custom{}

export interface AnnotationType extends RAMLLanguageElement{

        /**
         *
         **/
         //name
         name(  ):string


        /**
         *
         **/
         //parameters
         parameters(  ):DataElement[]


        /**
         *
         **/
         //allowMultiple
         allowMultiple(  ):boolean


        /**
         *
         **/
         //allowedTargets
         allowedTargets(  ):AnnotationTarget[]
}

export class AnnotationTypeImpl extends RAMLLanguageElementImpl implements AnnotationType{

        /**
         *
         **/
         //name
         name(  ):string{var attr = this._node.attr('name');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //parameters
         parameters(  ):DataElement[]{
                var elements = this._node.elementsOfKind('parameters');
                if(elements) {
                    return elements.map(x=> new DataElementImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //allowMultiple
         allowMultiple(  ):boolean{var attr = this._node.attr('allowMultiple');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //allowedTargets
         allowedTargets(  ):AnnotationTarget[]{var attrs = this._node.attributes('allowedTargets');
                if (attrs) {
                    return attrs.map(x=>new AnnotationTargetImpl(x));
                }
                return [];}
}

export interface Library extends RAMLLanguageElement{

        /**
         *
         **/
         //title
         title(  ):string


        /**
         *
         **/
         //name
         name(  ):string


        /**
         *
         **/
         //schemas
         schemas(  ):GlobalSchema[]


        /**
         *
         **/
         //models
         models(  ):DataElement[]


        /**
         *
         **/
         //examples
         examples(  ):GlobalExample[]


        /**
         *
         **/
         //traits
         traits(  ):Trait[]


        /**
         *
         **/
         //resourceTypes
         resourceTypes(  ):ResourceType[]


        /**
         *
         **/
         //annotationTypes
         annotationTypes(  ):AnnotationType[]


        /**
         *
         **/
         //securitySchemaTypes
         securitySchemaTypes(  ):SecuritySchemaType[]


        /**
         *
         **/
         //securitySchemes
         securitySchemes(  ):SecuritySchema[]


        /**
         *
         **/
         //uses
         uses(  ):Library[]
}

export class LibraryImpl extends RAMLLanguageElementImpl implements Library{

        /**
         *
         **/
         //title
         title(  ):string{var attr = this._node.attr('title');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //name
         name(  ):string{var attr = this._node.attr('name');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //schemas
         schemas(  ):GlobalSchema[]{
                var elements = this._node.elementsOfKind('schemas');
                if(elements) {
                    return elements.map(x=> new GlobalSchemaImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //models
         models(  ):DataElement[]{
                var elements = this._node.elementsOfKind('models');
                if(elements) {
                    return elements.map(x=> new DataElementImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //examples
         examples(  ):GlobalExample[]{
                var elements = this._node.elementsOfKind('examples');
                if(elements) {
                    return elements.map(x=> new GlobalExampleImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //traits
         traits(  ):Trait[]{
                var elements = this._node.elementsOfKind('traits');
                if(elements) {
                    return elements.map(x=> new TraitImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //resourceTypes
         resourceTypes(  ):ResourceType[]{
                var elements = this._node.elementsOfKind('resourceTypes');
                if(elements) {
                    return elements.map(x=> new ResourceTypeImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //annotationTypes
         annotationTypes(  ):AnnotationType[]{
                var elements = this._node.elementsOfKind('annotationTypes');
                if(elements) {
                    return elements.map(x=> new AnnotationTypeImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //securitySchemaTypes
         securitySchemaTypes(  ):SecuritySchemaType[]{
                var elements = this._node.elementsOfKind('securitySchemaTypes');
                if(elements) {
                    return elements.map(x=> new SecuritySchemaTypeImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //securitySchemes
         securitySchemes(  ):SecuritySchema[]{
                var elements = this._node.elementsOfKind('securitySchemes');
                if(elements) {
                    return elements.map(x=> new SecuritySchemaImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //uses
         uses(  ):Library[]{
                var elements = this._node.elementsOfKind('uses');
                if(elements) {
                    return elements.map(x=> new LibraryImpl(x));
                }
                else {
                    return null;
                }
            }
}

export interface RAMLSimpleElement extends BasicNode{}

export class RAMLSimpleElementImpl extends BasicNodeImpl implements RAMLSimpleElement{}

export interface GlobalExample extends RAMLSimpleElement{

        /**
         *
         **/
         //key
         key(  ):string


        /**
         *
         **/
         //value
         value(  ):ExampleString
}

export class GlobalExampleImpl extends RAMLSimpleElementImpl implements GlobalExample{

        /**
         *
         **/
         //key
         key(  ):string{var attr = this._node.attr('key');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //value
         value(  ):ExampleString{var attr = this._node.attr('value');
                if (attr) {
                    var v = new ExampleStringImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface ImportDeclaration extends RAMLSimpleElement{

        /**
         *
         **/
         //key
         key(  ):string


        /**
         *
         **/
         //value
         value(  ):Library
}

export class ImportDeclarationImpl extends RAMLSimpleElementImpl implements ImportDeclaration{

        /**
         *
         **/
         //key
         key(  ):string{var attr = this._node.attr('key');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //value
         value(  ):Library{
                var v = this._node.element('value');
                if(!v){
                    return null;
                }
                return new LibraryImpl(v);
            }
}

export interface GlobalSchema extends RAMLSimpleElement{

        /**
         *
         **/
         //key
         key(  ):string


        /**
         *
         **/
         //value
         value(  ):SchemaString
}

export class GlobalSchemaImpl extends RAMLSimpleElementImpl implements GlobalSchema{

        /**
         *
         **/
         //key
         key(  ):string{var attr = this._node.attr('key');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //value
         value(  ):SchemaString{var attr = this._node.attr('value');
                if (attr) {
                    var v = new SchemaStringImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}
}

export interface Api extends Library{

        /**
         *
         **/
         //title
         title(  ):string


        /**
         *
         **/
         //definitionType
         definitionType(  ):string


        /**
         *
         **/
         //version
         version(  ):string


        /**
         *
         **/
         //baseUri
         baseUri(  ):FullUriTemplate


        /**
         *
         **/
         //baseUriParameters
         baseUriParameters(  ):DataElement[]


        /**
         *
         **/
         //protocols
         protocols(  ):string[]


        /**
         *
         **/
         //mediaType
         mediaType(  ):MimeType


        /**
         *
         **/
         //securedBy
         securedBy(  ):SecuritySchemaRef[]


        /**
         *
         **/
         //resources
         resources(  ):Resource[]


        /**
         *
         **/
         //documentation
         documentation(  ):DocumentationItem[]
}

export class ApiImpl extends LibraryImpl implements Api{

        /**
         *
         **/
         //title
         title(  ):string{var attr = this._node.attr('title');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //definitionType
         definitionType(  ):string{var attr = this._node.attr('definitionType');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //version
         version(  ):string{var attr = this._node.attr('version');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //baseUri
         baseUri(  ):FullUriTemplate{var attr = this._node.attr('baseUri');
                if (attr) {
                    var v = new FullUriTemplateImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //baseUriParameters
         baseUriParameters(  ):DataElement[]{
                var elements = this._node.elementsOfKind('baseUriParameters');
                if(elements) {
                    return elements.map(x=> new DataElementImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //protocols
         protocols(  ):string[]{var attrs = this._node.attributes('protocols');
                if (attrs) {
                    return attrs.map(x=>x.value());
                }
                return [];}


        /**
         *
         **/
         //mediaType
         mediaType(  ):MimeType{var attr = this._node.attr('mediaType');
                if (attr) {
                    var v = new MimeTypeImpl(attr);
                    return v;
                }
                else {
                    return null;
                }}


        /**
         *
         **/
         //securedBy
         securedBy(  ):SecuritySchemaRef[]{var attrs = this._node.attributes('securedBy');
                if (attrs) {
                    return attrs.map(x=>new SecuritySchemaRefImpl(x));
                }
                return [];}


        /**
         *
         **/
         //resources
         resources(  ):Resource[]{
                var elements = this._node.elementsOfKind('resources');
                if(elements) {
                    return elements.map(x=> new ResourceImpl(x));
                }
                else {
                    return null;
                }
            }


        /**
         *
         **/
         //documentation
         documentation(  ):DocumentationItem[]{
                var elements = this._node.elementsOfKind('documentation');
                if(elements) {
                    return elements.map(x=> new DocumentationItemImpl(x));
                }
                else {
                    return null;
                }
            }
}

export interface Overlay extends Api{

        /**
         *
         **/
         //masterRef
         masterRef(  ):string
}

export class OverlayImpl extends ApiImpl implements Overlay{

        /**
         *
         **/
         //masterRef
         masterRef(  ):string{var attr = this._node.attr('masterRef');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}

export interface Extension extends Api{

        /**
         *
         **/
         //masterRef
         masterRef(  ):string
}

export class ExtensionImpl extends ApiImpl implements Extension{

        /**
         *
         **/
         //masterRef
         masterRef(  ):string{var attr = this._node.attr('masterRef');
                if (attr) {
                    var v = attr.value();
                    return v;
                }
                else {
                    return null;
                }}
}
