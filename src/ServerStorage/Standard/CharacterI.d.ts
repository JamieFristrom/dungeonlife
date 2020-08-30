
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { CharacterRecordI } from "ReplicatedStorage/TS/CharacterRecord"
import { DamageTags } from "ReplicatedStorage/TS/DamageTags"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { ServerContextI } from "ServerStorage/TS/ServerContext"

type Character = Model

declare class CharacterIClass {
    SetCharacterClass(player: Player, characterClass: string): void
    DetermineFlexToolDamage(player: Player, flexTool: FlexTool): [number, boolean]
    TakeDirectDamage(context: ServerContextI, hitCharacter: Model, damage: number, attackingCharacter: Character | undefined, damageTagsT: DamageTags): void
    TakeFlexToolDamage(context: ServerContextI, hitCharacter: Model, attackingCharacter: Character, flexTool: FlexTool, tool?: Tool): void
    //    TakeToolDamage( hitCharacter: Model, tool: Tool ): void
    GetPCDataWait(player: Player): CharacterRecordI
}

declare let CharacterI: CharacterIClass

export = CharacterI