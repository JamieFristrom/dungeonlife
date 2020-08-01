
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'

import { CharacterClass, CharacterClasses } from './CharacterClasses'
DebugXL.logI(LogArea.Executed, script.GetFullName())

export namespace SpawnerUtility {
    export function getClassToSpawn(spawnerPart: BasePart) {
        const valueObj = spawnerPart.FindFirstChild<StringValue>("CharacterClass")
        DebugXL.Assert(valueObj !== undefined)
        if (valueObj) {
            const charClass = valueObj.Value as CharacterClass
            DebugXL.Assert(CharacterClasses.classData[charClass] !== undefined)
            if (CharacterClasses.classData[charClass]) {
                return charClass
            }
        }
        return "NullClass"
    }
}