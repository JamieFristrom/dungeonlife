
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { HeroStable } from "ReplicatedStorage/TS/HeroStableTS";
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";
import { Hero } from "ReplicatedStorage/TS/HeroTS"

declare class HeroesModule {
    GetSavedPlayerCharactersWait(player: Player): HeroStable
    AdjustGold(player: Player, amount: number, analyticsItemIdS: string, analyticsItemTypeS: string): void
    SaveHeroesWait(player: Player): void
    RecordTool(player: Player, flexToolInst: FlexTool): void
    GetPCDataWait(player: Player): Hero
    NewDungeonLevel(player: Player, newDungeonLevel: number): void
}

declare let heroesModule: HeroesModule

export = heroesModule