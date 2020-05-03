import { ActiveSkinSetI } from "ReplicatedStorage/TS/SkinTypes";
import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'

type Character = Model

export interface CreateToolParamsI
{
    toolInstanceDatumT: FlexTool
    destinationCharacter: Character  // this is not my favorite choice, because a character model is a costume that can change
    activeSkinsT: ActiveSkinSetI
    possessionsKey: string
}

