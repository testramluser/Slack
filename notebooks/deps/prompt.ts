/// <reference path="./typings/tsd.d.ts" />

/**
 * Created by kor on 27/03/15.
 */

import env = require('./executionEnvironment')

function prompt(message:string){
    return env.execCfgPrompt(message)
}

export=prompt;
