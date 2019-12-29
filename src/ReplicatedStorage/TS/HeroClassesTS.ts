import { FlexToolI } from ".\\FlexToolTS"
import { PCI } from ".\\PCTS"
import { AssetManifest } from "ReplicatedFirst/TS/AssetManifest"

//import { AssetManifest } from "ReplicatedFirst/TS/AssetManifest"

//
// heroes
//


export interface HeroStatBlockI
{
    [key:string] : number
    strN: number
    dexN: number
    willN: number
    conN: number
	experienceN: number
	goldN: number
    deepestDungeonLevelN: number
    totalTimeN: number
}

export interface HeroI extends PCI
{
	statsT: HeroStatBlockI
}

export interface HeroClassI // rerolling so I don't have to rewrite item tables as maps. extends HeroI
{
    idS: string
    readableNameS: string
    imageId: string
    itemsT: { [k: string]: FlexToolI }
    walkSpeedN: number
    jumpPowerN: number
	statsT: HeroStatBlockI
	badges: number[]
	gamePassId?: number
}

export namespace HeroClasses {
	export let heroClassPrototypes: { [ k: string ]: HeroClassI } =
	{
		Warrior:
		{
			idS           : "Warrior",
			readableNameS : "Warrior",
	//		descriptionS  : "Recommended for new players. Tough and likes to fight up close",
			imageId       : "http://www.roblox.com/asset/?id=11440361",
			itemsT :
			{ 
				item1   :  { baseDataS : "Broadsword", levelN : 1, enhancementsA: [], slotN : 1 }, // --, enhancementsA : { { flavorS : "explosive", seconds : 5, dps : 10 } } },
				item2   :  { baseDataS : "Healing",    levelN : 1, enhancementsA: [] },
				item3   :  { baseDataS : "ScaleTorso", levelN : 3, enhancementsA: [], equippedB : true },
				item4   :  { baseDataS : "ScaleLegs", levelN : 3, enhancementsA: [], equippedB : true },
	/*
	--				item3   :  { baseDataS : "PlateTorso", levelN : 3, enhancementsA: [] }, 
	--				item4   :  { baseDataS : "PlateLegs", levelN : 3, enhancementsA: [] }, 
	--				item5   :  { baseDataS : "HelmetFull", levelN : 1, enhancementsA: [], equippedB : true }, 
	--				item6   :  { baseDataS : "HelmetHalf", levelN : 1, enhancementsA: [] }, 
	--				item7   :  { baseDataS : "HoodLeather", levelN : 1, enhancementsA: [] }, 
	--				item8   :  { baseDataS : "HatCloth", levelN : 1, enhancementsA: [] }, 
	--				item9   :  { baseDataS : "LeatherTorso", levelN : 1, enhancementsA: [] }, 
	--				item10   :  { baseDataS : "LeatherLegs", levelN : 1, enhancementsA: [] }, 
	--				item11   :  { baseDataS : "ClothTorso", levelN : 1, enhancementsA: [] }, 
	--				item12   :  { baseDataS : "ClothLegs", levelN : 1, enhancementsA: [] }, 
	--				item13   :  { baseDataS : "ChainTorso", levelN : 1, enhancementsA: [] }, 
	--				item14   :  { baseDataS : "ChainLegs", levelN : 1, enhancementsA: [] }, 
	--				{ baseDataS : "MagicBarrier", levelN : 1, enhancementsA : { { flavorS : "fire", seconds : 5, dps : 1 } } },
	*/
				// munchkin:
				// item5 : { baseDataS: "Greatsword", levelN: 16, enhancementsA: [ { flavorS: "fire", levelN: 4 } ] },
				// item6 : { baseDataS : "PlateTorso", levelN : 41, enhancementsA: [ { flavorS: "con", levelN: 4} ] }, 
				// item7 : { baseDataS : "PlateLegs", levelN : 39, enhancementsA: [ { flavorS: "con", levelN: 4} ] }, 
				// item8 : { baseDataS : "HelmetFull", levelN : 36, enhancementsA: [ { flavorS: "con", levelN: 4} ] }, 
				// item9 : { baseDataS : "Crossbow", levelN: 16, enhancementsA: [ { flavorS: "explosive", levelN: 4 } ] },
				// item10   : { baseDataS : "MagicHealing", levelN : 16, enhancementsA: [], slotN : 2 },

				// level 8    munchkin:
				/*
				item1 : { baseDataS: "Greatsword", levelN: 8, enhancementsA: [ { flavorS: "fire", levelN: 4 } ] },

				// 19 defense health 402
				//item2 : { baseDataS : "PlateTorso", levelN : 18, enhancementsA: [ { flavorS: "con", levelN: 4} ] } , 
				//item3 : { baseDataS : "PlateLegs", levelN : 15, enhancementsA: [ { flavorS: "con", levelN: 4} ] }, 
				//item4 : { baseDataS : "HelmetFull", levelN : 12, enhancementsA: [ { flavorS: "con", levelN: 4} ] }, 


				item2 : { baseDataS : "PlateTorso", levelN : 16, enhancementsA: [] } , 
				item3 : { baseDataS : "PlateLegs", levelN : 16, enhancementsA: [] }, 
				item4 : { baseDataS : "HelmetFull", levelN : 16, enhancementsA: [ { flavorS: "con", levelN: 4} ] }, 

				item5 : { baseDataS : "Crossbow", levelN: 8, enhancementsA: [ { flavorS: "explosive", levelN: 4 } ] },
				item6   : { baseDataS : "MagicHealing", levelN : 2, enhancementsA: [], slotN : 2 },*/
			},
			statsT :
			{
				strN 			 : 11,  //-- means if you draw a level 3 weapon you have a choice between putting in strength or con when you hit level 2
				dexN 		     : 10,
				conN 		     : 14,
				willN 		     : 10,
				experienceN      : 0,
				goldN            : 0,
				deepestDungeonLevelN : 1,
				totalTimeN       : 0,
			},
			walkSpeedN      : 12,
			jumpPowerN      : 35,
			badges: [ 2124442021, 2124442022, 2124442023, 2124442024 ]
		},
		Rogue:
		{
			idS           : "Rogue",
			readableNameS : "Rogue",
	//		descriptionS  : "Stays back and fights from a distance",
			imageId       : "http://www.roblox.com/asset/?id=16215840",
			itemsT :
			{ 
				item1   : { baseDataS : "Crossbow",   levelN : 3, enhancementsA: [], slotN : 1 },//-- enhancementsA : { { flavorS : "explosive", seconds : 0, dps : 10 } } }, 
	//			item1   : { baseDataS : "Longbow",   levelN : 3, enhancementsA: [], slotN : 1 },//-- enhancementsA : { { flavorS : "explosive", seconds : 0, dps : 10 } } }, 
				//--	}, --  enhancementsA : {  { flavorS : "cold", seconds : 1, dps : 5 } } },
				item2   : { baseDataS : "Shortsword", levelN : 3, enhancementsA: [], slotN : 2 }, 
				item3   : { baseDataS : "Healing",    levelN : 1, enhancementsA: [] },
				item4   : { baseDataS : "LeatherTorso", levelN : 3, enhancementsA: [], equippedB : true },
				item5   : { baseDataS : "LeatherLegs", levelN : 3, enhancementsA: [], equippedB : true },
				item6   : { baseDataS : "MagicSprint", levelN : 3, enhancementsA: [], slotN : 3 },
				//item7   : { baseDataS : "DaggersDual",   levelN : 1, slotN : 4, enhancementsA : [ { flavorS : "fire", levelN: 1 }, { flavorS: "cold", levelN: 1} ] }, 
			},
			statsT :
			{
				strN 			 : 10,
				dexN 		     : 15,
				conN 		     : 10,
				willN 		     : 10,
				experienceN      : 0,
				goldN            : 0,
				deepestDungeonLevelN : 1,
				totalTimeN       : 0,				
			},
			walkSpeedN      : 12,  
			jumpPowerN      : 35,
			badges: [ 2124442025, 2124442026, 2124442027, 2124442028 ]
		},
		Mage:
		{
			idS           : "Mage",			
			readableNameS : "Mage",
	//		descriptionS  : "Hardest to play! Uses powerful spells...until their magic runs out",
			imageId       : "rbxassetid://1495371626",
			itemsT :
			{ 
				item1   : { baseDataS : "Staff",     levelN : 3, enhancementsA: [], slotN : 1 },
				item2   : { baseDataS : "MagicBolt", levelN : 3, enhancementsA: [], slotN : 2 },
	//			item2   : { baseDataS : "MagicBolt", levelN : 1, enhancementsA: [ { flavorS: "explosive", levelN: 1 }, { flavorS: "fire", levelN: 1} ], slotN : 2 },
				item3   : { baseDataS : "Healing",   levelN : 1, enhancementsA: [] },
				item4   : { baseDataS : "Mana",      levelN : 1, enhancementsA: [] },
				item5   : { baseDataS : "ClothTorso", levelN : 3, enhancementsA: [], equippedB : true },
				item6   : { baseDataS : "ClothLegs", levelN : 3, enhancementsA: [], equippedB : true },
			},
			statsT :
			{
				strN 			 : 10,
				dexN 		     : 10,
				conN 		     : 10,
				willN 		     : 15,
				experienceN      : 0,
				goldN            : 0,
				deepestDungeonLevelN : 1,
				totalTimeN       : 0,				
			},
			walkSpeedN      : 12,  
			jumpPowerN      : 35,
			badges: [ 2124442009, 2124442010, 2124442011, 2124442012 ]
		},
		Barbarian:
		{
			idS           : "Barbarian",
			readableNameS : "Barbarian",
	//		descriptionS  : "Does more close combat damage than any other hero class",
			imageId       : AssetManifest.ImageHeroBarbarian,
			itemsT :
			{ 
				item1   : { baseDataS : "Axe",      levelN : 2, enhancementsA : [ { flavorS : "explosive", levelN : 1 } ], slotN : 1 },
				item2   : { baseDataS : "Healing",   levelN : 1, enhancementsA: [] },
				item3   : { baseDataS : "LeatherTorso", levelN : 1, enhancementsA: [], equippedB : true },
				item4   : { baseDataS : "LeatherLegs", levelN : 1, enhancementsA: [], equippedB : true },
			},
			statsT :
			{
				strN 			 : 15,
				dexN 		     : 10,
				conN 		     : 10,
				willN 		     : 10,
				experienceN      : 0,
				goldN            : 0,
				deepestDungeonLevelN : 1,
				totalTimeN       : 0,				
			},
			walkSpeedN      : 12,  
			jumpPowerN      : 35,
			badges: [ 2124442013, 2124442014, 2124442015, 2124442016 ],
			gamePassId      : 5190525		// must match possessiondata
		},		
		Priest:
		{
			idS           : "Priest",
			readableNameS : "Priest",
	//		descriptionS  : "Can magically heal and is extra strong against creatures of darkness",
			imageId       : AssetManifest.ImageHeroPriest,
			itemsT :
			{ 
				item1   : { baseDataS : "Mace",         levelN : 1, enhancementsA: [ { flavorS : "radiant", levelN : 1 } ], slotN : 1 }, 
				item2   : { baseDataS : "MagicHealing", levelN : 1, enhancementsA: [], slotN : 2 },
				item3   : { baseDataS : "ChainTorso", levelN : 2, enhancementsA: [], equippedB : true },
				item4   : { baseDataS : "ChainLegs", levelN : 2, enhancementsA: [], equippedB : true },
			},
			statsT :
			{
				strN 			 : 12,
				dexN 		     : 10,
				conN 		     : 12,
				willN 		     : 11,  
				experienceN      : 0,
				goldN            : 0,
				deepestDungeonLevelN : 1,
				totalTimeN       : 0,				
			},
			walkSpeedN      : 12,  
			jumpPowerN      : 35,
			badges: [2124442017, 2124442018, 2124442019, 2124442020],
			gamePassId     : 5188279,			  // must match possessiondata
		}
	}		

	//	-- alchemist?... a spell that makes bombs? a spell that makes potions?
} 