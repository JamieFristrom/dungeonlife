import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"

declare class HeroUtilityClass
{
    CountNonPotionGear( pcData: CharacterRecord ) : number
    CanUseGear( pcData: CharacterRecord, flexTool: FlexTool ): boolean
}

declare let HeroUtility: HeroUtilityClass

export = HeroUtility