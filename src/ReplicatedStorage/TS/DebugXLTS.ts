
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

/*

  DebugXL

  Debug eXtended Library. It excels. It's extra large.

  Additional debug functions to augment roblox

  Jamie_Fristrom @happionlabs

*/

import { RunService } from "@rbxts/services"

// borrowing from Android
export enum LogLevel {
    Error,
    Warning,
    Info,
    Debug,
    Verbose
}

class DebugXLC {
    static readonly logLevelPrefixes: string[] = ['E','W','I','D','V']

    private defaultLogLevel = LogLevel.Warning

    private logLevelForTag = new Map<string,LogLevel>([
        ['Combat',LogLevel.Debug],
        ['Mobs',LogLevel.Info],
        ['Executed',LogLevel.Info],
//        ['UI', LogLevel.Info],
//        ['GameManagement',LogLevel.Verbose]
    ])

    Error( message: string )
    {
        let callstackS = debug.traceback()
        if( false ) //--game["Run Service"]:IsStudio() )
            error( message )
        else
            spawn( () => { this.log( LogLevel.Error, script.Name, message+" "+callstackS ) } ) // -- so analytics will pick it up
    }

    Assert(conditionB: boolean) {
        if (!conditionB)
            this.Error("Assertion failed")
    }

    DumpToStr(variable: unknown) {
        let str = ""
        if (typeIs(variable, "table")) {
            let tbl = variable as { [index: string]: unknown }
            for (let [k, v] of Object.entries(tbl)) {
                str += (k + ": " + tostring(v)) + "\n"
                str += this.DumpToStr(v)
            }
        }
        else {
            str += tostring(variable) + "\n"
        }
        return str
    }

    Dump(variable: unknown) {
        this.log(LogLevel.Info, script.Name, this.DumpToStr(variable))
    }

    setLogLevel(newLogLevel: LogLevel, tag?: string) {
        if (tag) {
            this.logLevelForTag.set(tag, newLogLevel)
        }
        else {
            this.defaultLogLevel = newLogLevel
        }
    }

    getLogLevelForTag(tag: string) {
        const logLevelForTag = this.logLevelForTag.get(tag)
        return logLevelForTag ? logLevelForTag : this.defaultLogLevel
    }

    log(logLevel: LogLevel, tag: string, message: string) {
        const cliSrvPrefix = (RunService.IsServer()?'Srv':'')+(RunService.IsClient()?'Cli':'')  // in run mode they can both be true
        if (!message) {
            error( `${cliSrvPrefix}-E/${tag}: MISSING MESSAGE` )
        }
        else if (logLevel <= this.getLogLevelForTag(tag)) {
            let prefix = DebugXLC.logLevelPrefixes[logLevel]
            if (logLevel <= LogLevel.Error)
                error( `${cliSrvPrefix}-${prefix}/${tag}: ${message}` )
            else if (logLevel <= LogLevel.Warning)
                warn( `${cliSrvPrefix}-${prefix}/${tag}: ${message}` )
            else
                print( `${cliSrvPrefix}-${prefix}/${tag}: ${message}`)
        }
    }

    logE( tag: string, message: string )
    {
        this.log( LogLevel.Error, tag, message )
    }

    logW(tag: string, message: string) {
        this.log(LogLevel.Warning, tag, message)
    }

    logI(tag: string, message: string) {
        this.log(LogLevel.Info, tag, message)
    }

    logD(tag: string, message: string) {
        this.log(LogLevel.Debug, tag, message)
    }

    logV(tag: string, message: string) {
        this.log(LogLevel.Verbose, tag, message)
    }

    setDefaultLogLevel(logLevel: LogLevel) {
        this.defaultLogLevel = logLevel
    }

    stringifyInstance( inst: Instance | undefined )
    {
        return inst ? inst.Name : '(nil)'
    }

    stringifyInstanceArray( instArray: Instance[] )
    {
        return instArray.isEmpty() ? '[]' :
            '['+instArray.map( (inst)=>this.stringifyInstance(inst) ).reduce( (a, b)=>a+','+b )+']'
    }
}



export let DebugXL = new DebugXLC()
