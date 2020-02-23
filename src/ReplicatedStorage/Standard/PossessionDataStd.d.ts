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
        heroesCanOpenB?: boolean
        baseDamageN?: number
        damagePerLevelN?: number
        healthPerLevelN?: number
        balanceAgainstNumHeroesB?: boolean
        getReadableName: ( self: PossessionDatumI )=>string
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