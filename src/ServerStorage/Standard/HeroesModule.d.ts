import { HeroStable } from "ReplicatedStorage/TS/HeroStableTS";
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";
import { Hero } from "ReplicatedStorage/TS/HeroTS"

declare class HeroesModule
{
    GetSavedPlayerCharactersWait( player: Player ) : HeroStable
    AdjustGold( player: Player, amount: number, analyticsItemIdS: string, analyticsItemTypeS: string ) : void
    SaveHeroesWait( player: Player ) : void
    RecordTool( player: Player, flexToolInst: FlexTool ) : void
    GetPCDataWait( player: Player ) : Hero
}

declare let heroesModule: HeroesModule

export = heroesModule