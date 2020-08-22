
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { CharacterRecordI } from "ReplicatedStorage/TS/CharacterRecord"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"

type Character = Model

declare class CharacterClientIClass {
    GetPossessionSlot(ignored: CharacterRecordI, possession: FlexTool): number
    GetPossessionFromSlot(characterDataT: CharacterRecordI, slotN: number): FlexTool
    ValidTarget(attackingTeam: Team, defendingInstance: Instance): boolean
}

declare let CharacterClientI: CharacterClientIClass

export = CharacterClientI