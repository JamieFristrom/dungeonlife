import { FlexTool } from ".\\FlexToolTS"
import { GearPool, CharacterRecordI } from "./CharacterRecord"
import { HeroStatBlockI } from "ReplicatedStorage/TS/CharacterClasses"
import { HeroStable } from "./HeroStableTS"
//import { AssetManifest } from "ReplicatedFirst/TS/AssetManifest"

//
// heroes
//

export interface RawHeroDataI  // because hero data may be obsolete it can be missing fields
{
	statsT: HeroStatBlockI
    idS: string
	gearPool?: GearPool
	itemsT?: { [k: string]: FlexTool }  // retained for accessing persistent data using old schema
}

export interface HeroI extends CharacterRecordI
{
	statsT: HeroStatBlockI
}

export interface HeroClassI // rerolling so I don't have to rewrite item tables as maps. extends HeroI
{
    idS: string
    readableNameS: string
    imageId: string
//	itemsT: { [k: string]: FlexTool }  // retained for accessing persistent data using old schema
	itemPool: GearPool
    walkSpeedN: number
    jumpPowerN: number
	statsT: HeroStatBlockI
	badges: number[]
	gamePassId?: number
}

