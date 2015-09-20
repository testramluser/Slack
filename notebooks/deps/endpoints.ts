/// <reference path="./typings/tsd.d.ts" />
import http = require('http');
import url = require('url');

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

var QUERY_PREFIX = "query_";
var HEADER_PREFIX = "header_";

var httpServer = null;

var sockets = [];

var services = {};

var getters = {};

var parsedUrl;

function addSocket(socket) {
    sockets[sockets.length] = socket;
}

function closeAllConnections() {
    sockets.forEach(socket => {
        socket.destroy();
    });

    sockets = [];
}

function doStuff(request, response) {
    parsedUrl = url.parse(request.url, true);

    var uri : string = parsedUrl.pathname;

    if(uri.indexOf("/kill") == 0) {
        response.end();

        httpServer.close();

        closeAllConnections();

        httpServer = null;

        console.log("Goodbye Cruel World!!!");

        return;
    }

    console.log("URI: " + uri);

    var service = services[uri];

    var getter = getters[uri];

    //applyRequest(service, request);

    response.end();
}

function applyRequest(service, request) {
    if(!service) {
        return;
    }

    var names = formalParameterList(service);

    var values = [];

    names.forEach(name => {
        values[values.length] = getParam(name, request);
    });

    service.apply(null, values);
}

function getParam(name, request) {
    if(name.indexOf(QUERY_PREFIX) == 0) {
        return parsedUrl.query[name.substr(QUERY_PREFIX.length)];
    }

    if(name.indexOf(HEADER_PREFIX) == 0) {
        return request.headers[name.substr(HEADER_PREFIX.length)]
    }

    if(name == 'body') {
        return request.body;
    }
}

function formalParameterList(fn) {
    var args=[];

    var fnText = fn.toString().replace(STRIP_COMMENTS, '');

    var argDecl = fnText.match(FN_ARGS);

    var r = argDecl[1].split(FN_ARG_SPLIT);

    for(var a in r){
        var arg = r[a];

        arg.replace(FN_ARG, function(all, underscore, name){
            args.push(name);
        });
    }

    return args;
}

export function exportService(service, requestGetter, relativeUrl) {
    if(!httpServer) {
        httpServer = http.createServer(doStuff);

        httpServer.on('connection', addSocket);

        httpServer.listen(9090);
    }

    services[relativeUrl] = service;

    getters[relativeUrl] = requestGetter;
}

export function setApi(api: any) {
    console.log('Api baseUrl: ' + api.baseUri().value());
}