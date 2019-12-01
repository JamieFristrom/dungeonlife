import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";

import { ActiveSkinSetI } from "ReplicatedStorage/TS/SkinTypes";


declare class FlexEquipUtilityClass
{
    GetImageId( itemDatum: FlexTool, activeSkinsT: ActiveSkinSetI ) : string
    GetShortName( itemDatum: FlexTool, activeSkinsT: ActiveSkinSetI ): string
    GetRarityColor3( itemDatum: FlexTool ) : Color3
    GetAdjStat( itemDatum: FlexTool, statName: string ) : number
    GetManaCost( itemDatum: FlexTool ) : number
    GetDamageNs( itemDatum: FlexTool, actualLevel: number, currentMaxHeroLevel: number ) : [ number, number ]
}

declare let FlexEquipUtility: FlexEquipUtilityClass

export = FlexEquipUtility