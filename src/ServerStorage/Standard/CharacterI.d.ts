import { PC } from "ReplicatedStorage/TS/PCTS"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";

declare interface DamageTags
{
    spell?: boolean
    ranged?: boolean
    close?: boolean
}

declare class CharacterIClass
{
    DetermineFlexToolDamage( player: Player, flexTool: FlexTool ) : [ number, boolean ]
    TakeDirectDamage( hitCharacter: Model, damage: number, attackingPlayer: Player, damageTagsT: DamageTags ) : void
    TakeFlexToolDamage( hitCharacter: Model, attackingPlayer: Player, flexTool: FlexTool ) : void
//    TakeToolDamage( hitCharacter: Model, tool: Tool ): void
    GetPCDataWait( player: Player ): PC
}

declare let CharacterI:  CharacterIClass

export = CharacterI