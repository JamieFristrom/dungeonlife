import { ActiveSkinSetI } from "ReplicatedStorage/TS/SkinTypes";
import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'

export interface CreateToolParamsI
{
    toolInstanceDatumT: FlexTool
    destinationPlayer: Player
    activeSkinsT: ActiveSkinSetI
    possessionsKey: string
}

