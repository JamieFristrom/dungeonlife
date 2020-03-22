import { ActiveSkinSetI } from "ReplicatedStorage/TS/SkinTypes";
import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'

type Character = Model

export interface CreateToolParamsI
{
    toolInstanceDatumT: FlexTool
    destinationCharacter: Character
    activeSkinsT: ActiveSkinSetI
    possessionsKey: string
}

