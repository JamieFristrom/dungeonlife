
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
import { RunService } from '@rbxts/services'
DebugXL.logI(LogArea.Executed, script.Name)

export namespace DebugSettings {
    export const inlineErrors = RunService.IsStudio()   // should be false in ship
    export const defaultLogLevel = LogLevel.Warning
    export const logLevelsForTag: [LogArea, LogLevel][] = [
        //[LogArea.Combat,LogLevel.Verbose],
        //[LogArea.Gameplay, LogLevel.Verbose],
        //[LogArea.Executed,LogLevel.Info],
        //[LogArea.Requires,LogLevel.Verbose],
        //[LogArea.UI, LogLevel.Info],
        //[LogArea.Characters, LogLevel.Verbose],
        //[LogArea.GameManagement, LogLevel.Verbose],
        //[LogArea.Inventory, LogLevel.Verbose]
        //[LogArea.Structures, LogLevel.Verbose]
    ]
}