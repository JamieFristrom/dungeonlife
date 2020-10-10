
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { HeroStable } from "ReplicatedStorage/TS/HeroStableTS"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { HeroesManagerI } from "./HeroesManagerI"

import { ServerContextI } from "ServerStorage/TS/ServerContext"
import { PlayerTracker } from "ServerStorage/TS/PlayerServer"

declare class HeroesManager implements HeroesManagerI {
    AdjustGold(player: Player, amount: number, analyticsItemIdS: string, analyticsItemTypeS: string): void
    DoDirectDamage(context: ServerContextI, attackingPlayer: Player, damage: number, targetHumanoid: Humanoid, crit: boolean): void
    GetPCDataWait(player: Player): Hero
    ForceSave(player: Player): void
    GetSavedPlayerCharactersWait(player: Player): HeroStable
    PlayerAdded(player: Player): void
    RecordTool(context: ServerContextI, player: Player, heroRecord: Hero, flexToolInst: FlexTool): void
    SaveHeroesWait(playerTracker: PlayerTracker, player: Player): void
    SetNewDungeonLevel(player: Player, hero: Hero, newDungeonLevel: number): void
}

declare let Heroes: HeroesManager

export = Heroes