import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"

declare class HeroUtilityClass
{
    CountNonPotionGear( pcData: CharacterRecord ) : number
}

declare let HeroUtility: HeroUtilityClass

export = HeroUtility