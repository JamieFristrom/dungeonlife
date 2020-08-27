
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)

import { DebugSettings } from "ReplicatedStorage/TS/DebugSettings"

// Deliberately putting this in a place where it won't be imported everywhere and cause a 90 second rebuild whenever we want 
// to change our logging settings
DebugXL.setDefaultLogLevel(DebugSettings.defaultLogLevel)
for( let thing of DebugSettings.logLevelsForTag ) {
    DebugXL.setLogLevel(thing[1], thing[0])
}