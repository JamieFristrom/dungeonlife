import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";

declare interface DamageTags
{
    spell?: boolean
    ranged?: boolean
    close?: boolean
}

type Character = Model

declare class CharacterIClass
{
    DetermineFlexToolDamage( player: Player, flexTool: FlexTool ) : [ number, boolean ]
    TakeDirectDamage( hitCharacter: Model, damage: number, attackingPlayer: Player, damageTagsT: DamageTags ) : void
    TakeFlexToolDamage( hitCharacter: Model, attackingCharacter: Character, attackingTeam: Team, flexTool: FlexTool ) : void
//    TakeToolDamage( hitCharacter: Model, tool: Tool ): void
    GetPCDataWait( player: Player ): CharacterRecord
}

declare let CharacterI:  CharacterIClass

export = CharacterI