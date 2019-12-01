import { HeroStable } from "ReplicatedStorage/TS/HeroStableTS";
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";

declare class HeroesModule
{
    GetSavedPlayerCharactersWait( player: Player ) : HeroStable
    
    AdjustGold( player: Player, amount: number, analyticsItemIdS: string, analyticsItemTypeS: string ) : void

    RecordTool( player: Player, flexToolInst: FlexTool ) : void
}

declare let heroesModule: HeroesModule

export = heroesModule