/**
 * Created by Sviridov on 4/15/2015.
 */

//FIXME users.me() case2

export interface NameFilter{
    (schemaName:string):boolean
}
export interface IConfig{

    /**
     * if set to true it will be possible to pass numbers to string parameters
     * @type {boolean}
     */
    numberIsString:boolean
    /**
     * If it set to true system will create named interfaces for parameters defenition otherwise,
     * it will use structural types
     * Use named interfaces
     */
     createTypesForResources:boolean


    /**
     * If this option is set to true query parameters will be placed as second argument when method has body
     */
     queryParametersSecond:boolean


    /**
     * If this option is set to true .get() will be collapsed to ()
     */
    collapseGet:boolean

    /**
     * If this option is set to true method references will be collapsed if it is only method in the resource
     * foo.get() => foo()
     */
    collapseOneMethod:boolean

    /**
     * If this option is set to true media type parameters will be removed from declarations
     */
    collapseMediaTypes:boolean

    /**
     * For example, let resource 'somerRes' have GET, POST and PUT methods.
     * If 'false', generates get(), post() and put() for 'someResource'
     * If 'true', generates getSomeRes(), postSomeRes() and putSomeRes() for
     * parent of 'someRes'. If 'someRes' does not itself has child resources, it is not generated.
     * @type {boolean}
     */
    methodNamesAsPrefixes:boolean

    /**
     * If this option is set to 'true', the executor combines request and response into a HAR entry
     * and places it into the '__$harEntry__' field of ramlscript response.
     */
    storeHarEntry:boolean

    /**
     * If it set to true system will create named interfaces for parameters defenition otherwise,
     * it will use structural types
     * Use named interfaces
     */
    createTypesForParameters
    /**
     * It true geneartor will try to reuse parameter types when possible
     * and redeclare using type =
     */
    reuseTypeForParameters:boolean

    /**
     * If true will not reuse structural types for schemas
     */
    createTypesForSchemaElements:boolean

    /* It true geneartor will try to reuse parameter types when possible
     * and redeclare using type =
     */
    reuseTypesForSchemaElements:boolean

    /**
     * If 'true', exception is thrown for statuses > 399
     */
    throwExceptionOnIncorrectStatus:boolean

    /**
     * generate asynchronous client
     **/
    async:boolean

    debugOptions:{
        generateImplementation:boolean;
        generateSchemas:boolean;
        generateInterface:boolean;
        schemaNameFilter:NameFilter
    }

    /**
     * Whether to overwrite the 'node_modules' folder for the generated notebook.
     * If the folder is known to be consistent, the option may be set to 'false'
     * in order to save time.
     */
    overwriteModules:boolean
}