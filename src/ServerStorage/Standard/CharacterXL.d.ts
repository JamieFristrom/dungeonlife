
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { ServerContextI } from "ServerStorage/TS/ServerContext"
import { Character } from "ReplicatedStorage/TS/ModelUtility"
declare class CharacterXLClass
{
    ProcessCharacter( context: ServerContextI, character: Character, deltaT: number ): void
    SpeedMulFor( character: Model, walkPct: number, cooldownPct: number, duration: number ): void
}

declare let CharacterXL: CharacterXLClass

export = CharacterXL