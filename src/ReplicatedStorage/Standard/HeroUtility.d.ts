import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"

declare class HeroUtilityClass
{
    CountNonPotionGear( pcData: CharacterRecord ) : number
}

declare let HeroUtility: HeroUtilityClass

export = HeroUtility