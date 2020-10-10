
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";
import { ActiveSkinSetI } from "ReplicatedStorage/TS/SkinTypes"

declare namespace GearUI
{
    export function FillOutInfoFrame( itemInfoFrame: Frame, flexToolInst: FlexTool ): void

    export function PopulateGearFrame( gearFrame: Frame, 
        gearTemplate: Frame, 
        itemInfoFrame: Frame, 
        gearPairsA: [string,FlexTool][],
        activeSkinsT: ActiveSkinSetI,
        maxGearSlotsN: number, 
        onClickFunc: ( toolIdxKey: string )=>void ): void

}

export = GearUI

