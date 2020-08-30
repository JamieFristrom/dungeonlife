
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { ServerContextI } from "ServerStorage/TS/ServerContext"
import { Character } from "ReplicatedStorage/TS/ModelUtility"

declare class CharacterXLClass {
    DamageOverTimeFor(character: Character, dps: number, seconds: number, attackingPlayer: Player): void
    ProcessCharacter(context: ServerContextI, character: Character, deltaT: number): void
    SpeedMulFor(character: Character, walkPct: number, cooldownPct: number, duration: number): void
}

declare let CharacterXL: CharacterXLClass

export = CharacterXL