
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { CharacterClass } from "ReplicatedStorage/TS/CharacterClasses"

type Character = Model

declare class CharacterClientIClass {
    GetPossessionSlot(ignored: CharacterRecord, possession: FlexTool): number
    GetPossessionFromSlot(characterDataT: CharacterRecord, slotN: number): FlexTool
    ValidTarget(attackingTeam: Team, defendingInstance: Instance): boolean
}

declare let CharacterClientI: CharacterClientIClass

export = CharacterClientI