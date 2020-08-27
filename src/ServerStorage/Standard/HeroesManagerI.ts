
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md
import { HeroStable } from "ReplicatedStorage/TS/HeroStableTS"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { ServerContextI } from "ServerStorage/TS/ServerContext"

export interface HeroesManagerI {
    GetSavedPlayerCharactersWait(player: Player): HeroStable
    AdjustGold(player: Player, amount: number, analyticsItemIdS: string, analyticsItemTypeS: string): void
    DoDirectDamage(context: ServerContextI, attackingPlayer: Player, damage: number, targetHumanoid: Humanoid, crit: boolean): void
    SaveHeroesWait(player: Player): void
    RecordTool(context: ServerContextI, player: Player, heroRecord: Hero, flexToolInst: FlexTool): void
    GetPCDataWait(player: Player): Hero
    NewDungeonLevel(player: Player, newDungeonLevel: number): void
}

