import { FlexTool } from ".\\FlexToolTS"
import { ItemPool, PCI } from ".\\PCTS"
import { HeroStatBlockI } from "ReplicatedStorage/TS/CharacterClasses"
//import { AssetManifest } from "ReplicatedFirst/TS/AssetManifest"

//
// heroes
//


export interface HeroI extends PCI
{
	statsT: HeroStatBlockI
}

export interface HeroClassI // rerolling so I don't have to rewrite item tables as maps. extends HeroI
{
    idS: string
    readableNameS: string
    imageId: string
	itemsT: { [k: string]: FlexTool }  // retained for accessing persistent data using old schema
	itemPool: ItemPool
    walkSpeedN: number
    jumpPowerN: number
	statsT: HeroStatBlockI
	badges: number[]
	gamePassId?: number
}

