
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

/*

  DebugXL

  Debug eXtended Library. It excels. It's extra large.

  Additional debug functions to augment roblox

  Jamie_Fristrom @happionlabs

*/

import { RunService } from "@rbxts/services"
import { DebugI } from "ReplicatedStorage/TS/DebugI"

// borrowing from Android
export enum LogLevel {
    Error,
    Warning,
    Info,
    Debug,
    Verbose
}

export enum LogArea {
    Admin,
    Analytics,
    Characters,
    Config,
    Combat,           // los, damage, weapons, armor
    Datastore,
    Gameplay,         // levelling, xp
    GameManagement,   // game flow, overall game state
    Error,            // for untagged errors
    Executed,         // has this script begun execution?
    Inventory,
    Items,
    Mobs,             // mob behavior but not spawning
    MobSpawn,         // mob spawning
    Network,          // replication
    Players,
    Parts,
    Spawner,          // spawner furnishing behavior, both mob and non-mob
    Structures,
    Test,
    Requires,         // tracking which files have been succesfully required/imported
    UI,               // 
}

class DebugXLC implements DebugI {
    static readonly logLevelPrefixes: string[] = ['E', 'W', 'I', 'D', 'V']

    private inlineErrors = false  // should not be true in ship, because will halt execution of scripts, but it's useful for finding exactly where assertions fire when debugging

    // Change these settings in ReplicatedStorage/TS/DebugSettings, not here.
    // You'll avoid a long rebuild and your changes will actually take.
    private defaultLogLevel = LogLevel.Error
    private logLevelForTag = new Map<LogArea, LogLevel>([])

    private testErrorCatcher?: (message: string) => void

    Error(message: string) {
        let callstackS = debug.traceback()
        if (this.testErrorCatcher) {
            this.testErrorCatcher(message)
        } else {
            if (this.inlineErrors) {
                this.log(LogLevel.Error, LogArea.Error, script.Name + ": " + message + " " + callstackS)
            }
            else {
                spawn(() => { this.log(LogLevel.Error, LogArea.Error, script.Name + ": " + message + " " + callstackS) }) // -- so analytics will pick it up
            }
        }
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

    Dump(variable: unknown, tag: LogArea) {
        this.log(LogLevel.Info, tag, this.DumpToStr(variable))
    }

    dumpCallstack(logLevel: LogLevel, tag: LogArea) {
        const callstackStr = debug.traceback()
        this.log(logLevel, tag, callstackStr)
    }

    setLogLevel(newLogLevel: LogLevel, tag?: LogArea) {
        if (tag) {
            this.logLevelForTag.set(tag, newLogLevel)
        }
        else {
            this.defaultLogLevel = newLogLevel
        }
    }

    getLogLevelForTag(tag: LogArea) {
        const logLevelForTag = this.logLevelForTag.get(tag)
        return logLevelForTag ? logLevelForTag : this.defaultLogLevel
    }

    log(logLevel: LogLevel, tag: LogArea, message: string) {
        let cliSrvPrefix = (RunService.IsServer() ? 'Srv' : '')
        cliSrvPrefix += (RunService.IsClient() ? 'Cli' : '')  // in run mode they can both be true
        if (!message) {
            error(`${cliSrvPrefix}-E/${tag}: MISSING MESSAGE`)
        }
        else if (logLevel <= this.getLogLevelForTag(tag)) {
            let prefix = DebugXLC.logLevelPrefixes[logLevel]
            let tagString = LogArea[tag]
            if (logLevel <= LogLevel.Error)
                error(`${cliSrvPrefix}-${prefix}/${tagString}: ${message}`)
            else if (logLevel <= LogLevel.Warning)
                warn(`${cliSrvPrefix}-${prefix}/${tagString}: ${message}`)
            else
                print(`${cliSrvPrefix}-${prefix}/${tagString}: ${message}`)
        }
    }

    logE(tag: LogArea, message: string) {
        this.log(LogLevel.Error, tag, message)
    }

    logW(tag: LogArea, message: string) {
        this.log(LogLevel.Warning, tag, message)
    }

    logI(tag: LogArea, message: string) {
        this.log(LogLevel.Info, tag, message)
    }

    logD(tag: LogArea, message: string) {
        this.log(LogLevel.Debug, tag, message)
    }

    logV(tag: LogArea, message: string) {
        this.log(LogLevel.Verbose, tag, message)
    }

    setDefaultLogLevel(logLevel: LogLevel) {
        this.defaultLogLevel = logLevel
    }

    stringifyInstance(inst: Instance | undefined) {
        return inst ? inst.Name : '(nil)'
    }

    stringifyInstanceArray(instArray: Instance[]) {
        return instArray.isEmpty() ? '[]' :
            '[' + instArray.map((inst) => this.stringifyInstance(inst)).reduce((a, b) => a + ',' + b) + ']'
    }

    catchErrors(errorCatcher: (message: string) => void) {
        DebugXL.Assert(!this.testErrorCatcher)
        this.testErrorCatcher = errorCatcher
    }

    stopCatchingErrors() {
        DebugXL.Assert(this.testErrorCatcher !== undefined)
        this.testErrorCatcher = undefined
    }

    catchErrorsInline(inlineErrors: boolean) {
        this.inlineErrors = inlineErrors
    }
}

export let DebugXL = new DebugXLC()

DebugXL.Dump(LogArea, LogArea.Config)
