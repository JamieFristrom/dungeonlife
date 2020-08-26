
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses"
import { TestUtility } from "ServerStorage/TS/TestUtility"

// test number of hero classes
const numStartingStatBlocks = Object.keys(CharacterClasses.heroStartingStats).size()
TestUtility.assertTrue(numStartingStatBlocks === 5)
