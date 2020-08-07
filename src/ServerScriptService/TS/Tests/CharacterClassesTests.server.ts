
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { CharacterClass, CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses"

// test number of hero classes
const numStartingStatBlocks = Object.keys( CharacterClasses.heroStartingStats ).size()
DebugXL.Assert( numStartingStatBlocks === 5 )
