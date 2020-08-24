
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

// can use a namespace because no method functions
// only partially typed so far - doing on an as-needed basis


declare interface RarityInfoI  // information about a given rarity
{
    nameS: string
    color3: Color3
}

declare namespace PossessionData   // namespace for info about possessions
{
    interface PossessionDatumI
    {
        idS: string
        readableNameS: string
        imageId: string
        publishValueB?: boolean
        defaultHideAccessoriesB: boolean 
        flavor: PossessionData.FlavorEnum
        baseToolS?: string
        heroesCanOpenB?: boolean
        baseDamageN?: number
        furnishingType?: PossessionData.FurnishingEnum
        damagePerLevelN?: number
        healthPerLevelN?: number
        balanceAgainstNumHeroesB?: boolean
        textureSwapId?: string
        getReadableName: ( self: PossessionDatumI )=>string
        clickableByTeam?: Set<string>
        buildCostN?: number
    }

    interface SkinDatumI extends PossessionDatumI
    {
        baseToolS: string
        textureSwapId: string
    }

    enum FlavorEnum
    {
        Currency   = "Currency",
		Furnishing = "Furnishing",
		Hero       = "Hero",
		Monster    = "Monster",
		Stats      = "Stats",
		Tool       = "Tool",
		Skin       = "Skin",
		Expansion  = "Expansion"    
    }

	enum FurnishingEnum  
	{
		BossSpawn    = "Boss Spawn",
		Spawn        = "Spawn",
		Treasure     = "Treasure",
		Barrier      = "Barrier",
		Cosmetic     = "Cosmetic",
		Lighting     = "Lighting",
		WaterFeature = "Water Feature",
		Trap         = "Trap"
	} 
    /* =
    {
        Sword1H:
        {
            idS           : "Sword1H",
            readableNameS : "One Handed Sword",
            imageId       : "http://www.roblox.com/asset/?id=124987047",
            tagsT : { monster : true, hero : true, held : true },
        },
    }*/

    let dataT: { [k:string]: PossessionDatumI }
    let dataA: PossessionDatumI[]
    let raritiesT: RarityInfoI[]
}

export = PossessionData