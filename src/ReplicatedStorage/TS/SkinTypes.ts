import { AssetManifest } from "ReplicatedFirst/TS/AssetManifest";

export interface ActiveSkinSetI { [k:string]: SkinTypeEnum }

export declare interface SkinInfoI
{
    idS: string
    readableNameS: string
    imageId: string
	tagsT: { [k:string]: boolean }
	upperBodyAttackAnimNames: string[]
	fullBodyAttackAnimNames: string[]
	windUpAttackAnimName?: string
}


export enum SkinTypeEnum {
    Sword1H = "Sword1H",
    Sword2H = "Sword2H",
    Axe1H = "Axe1H",
    Axe2H = "Axe2H",
    Claws = "Claws",
    Bow = "Bow",
    Crossbow = "Crossbow",        
    Bomb = "Bomb",
    Maul = "Maul",
    Staff = "Staff",
    MagicBolt = "MagicBolt",
    MagicBarrier = "MagicBarrier",
    ClothTorso = "ClothTorso",
    ClothLegs = "ClothLegs",
    LeatherTorso = "LeatherTorso",
    LeatherLegs = "LeatherLegs",
    ArmorLightTorso = "ArmorLightTorso",
    ArmorLightLegs = "ArmorLightLegs",
    ArmorHeavyTorso = "ArmorHeavyTorso",
    ArmorHeavyLegs = "ArmorHeavyLegs",
    Hat = "Hat",
    Helmet = "Helmet",
    Unskinnable = "Unskinnable"
}


export let SkinTypes: { [k:string]:SkinInfoI} = 
{
	Sword1H      : 
	{
		idS           : "Sword1H",
		readableNameS : "One Handed Sword",
		imageId       : "http://www.roblox.com/asset/?id=124987047",
		tagsT:{ monster:true, hero:true, held:true },
		upperBodyAttackAnimNames: ['AttackOneHandUpperBody1', 'AttackOneHandUpperBody2'],
		fullBodyAttackAnimNames: ['AttackOneHand1','AttackOneHand2'],
		windUpAttackAnimName: 'WindUpOneHandUpperBody'
	},
	Sword2H     :
	{
		idS          : "Sword2H",
		readableNameS: "Two Handed Sword",
		imageId      : AssetManifest.ImageToolGreatsword,
		tagsT:{ monster:true, hero:true, held:true },
		upperBodyAttackAnimNames: ['AttackOneHandUpperBody1', 'AttackOneHandUpperBody2'],
		fullBodyAttackAnimNames: ['AttackOneHand1','AttackOneHand2'],
		windUpAttackAnimName: 'WindUpOneHandUpperBody'
	},
	Axe1H       :
	{
		idS          :"Axe1H",
		readableNameS:"One Handed Axe",
		imageId      :"https://www.roblox.com/asset-thumbnail/image?assetId=2266973230&width=420&height=420&format=png",
		tagsT:{ monster:true, hero:true, held:true },
		upperBodyAttackAnimNames: ['AttackOneHandUpperBody1', 'AttackOneHandUpperBody2'],
		fullBodyAttackAnimNames: ['AttackOneHand1','AttackOneHand2'],
		windUpAttackAnimName: 'WindUpOneHandUpperBody'
	},
	Axe2H       : 
	{
		idS          : "Axe2H",
		readableNameS: "Two Handed Axe",
		imageId      : "rbxassetid://12768177",
		tagsT: { monster: true, hero: true, held: true },
		upperBodyAttackAnimNames: ['AttackOneHandUpperBody1', 'AttackOneHandUpperBody2'],
		fullBodyAttackAnimNames: ['AttackOneHand1','AttackOneHand2'],
		windUpAttackAnimName: 'WindUpOneHandUpperBody'
	},
	Claws:
	{
		idS          : "Claws",
		readableNameS: "Dual Weapon",
		imageId      : AssetManifest.ImageToolClaws,
		tagsT: { monster: true, hero: true, held: true },
		upperBodyAttackAnimNames: ['AttackBothHands1'],
		fullBodyAttackAnimNames: ['AttackBothHands1'],		
	},
	Bow    : 
	{
		idS          : "Bow",
		readableNameS: "Bow",
		imageId      : "https://www.roblox.com/asset-thumbnail/image?assetId=2574560933&width=420&height=420&format=png",
		tagsT: { monster: true, hero: true, held: true },
		upperBodyAttackAnimNames: ['BowFire'],
		fullBodyAttackAnimNames: ['BowFire']
	},	
	Crossbow    : 
	{
		idS          : "Crossbow",
		readableNameS: "Crossbow",
		imageId      : "rbxassetid://16215840",
		tagsT: { monster: true, hero: true, held: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},	
	Bomb        : 
	{
		idS          : "Bomb",
		readableNameS: "Bomb",
		imageId      : "https://www.roblox.com/asset-thumbnail/image?assetId=2347448422&width=420&height=420&format=png",
		tagsT: { monster: true, hero: true, held: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},
	Maul        : 
	{
		idS          : "Maul",  // includes hammer and mace.  always one handed for now
		readableNameS: "Maul",
		imageId      : "rbxassetid://18409033",
		tagsT: { monster: true, hero: true, held: true },
		upperBodyAttackAnimNames: ['AttackOneHandUpperBody1', 'AttackOneHandUpperBody2'],
		fullBodyAttackAnimNames: ['AttackOneHand1','AttackOneHand2'],
		windUpAttackAnimName: 'WindUpOneHandUpperBody'
	},
	Staff       : 
	{
		idS          : "Staff",  
		readableNameS: "Staff",
		imageId      : "http://www.roblox.com/asset/?id=49367564",
		tagsT: { monster: true, hero: true, held: true },
		upperBodyAttackAnimNames: ['AttackOneHandUpperBody1', 'AttackOneHandUpperBody2'],
		fullBodyAttackAnimNames: ['AttackOneHand1','AttackOneHand2'],
		windUpAttackAnimName: 'WindUpOneHandUpperBody'
	},	
	MagicBolt        : 
	{
		idS          : "MagicBolt",
		readableNameS: "Magic Bolt",
		imageId      : "rbxassetid://1495371626",
		tagsT: { monster: true, hero: true, held: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},
	MagicBarrier:
	{
		idS          : "MagicBarrier",
		readableNameS: "Magic Barrier",
		imageId      : "rbxassetid://1498812207",
		tagsT: { monster: true, hero: true, held: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},
	ClothTorso:
	{
		idS          : "ClothTorso",
		readableNameS: "Cloth Shirt",
		imageId      : "https://www.roblox.com/asset-thumbnail/image?assetId=2486671858&width=420&height=420&format=png",
		tagsT: { hero: true, worn: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},
	ClothLegs:
	{
		idS          : "ClothLegs",
		readableNameS: "Cloth Pants",
		imageId      : "https://www.roblox.com/asset-thumbnail/image?assetId=2486800832&width=420&height=420&format=png",
		tagsT: { hero: true, worn: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},	
	LeatherTorso:
	{
		idS          : "LeatherTorso",
		readableNameS: "Leather Shirt",
		imageId      : "https://www.roblox.com/asset-thumbnail/image?assetId=2477615338&width=420&height=420&format=png",
		tagsT: { hero: true, worn: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},
	LeatherLegs:
	{
		idS          : "LeatherLegs",
		readableNameS: "Leather Pants",
		imageId      : "https://www.roblox.com/asset-thumbnail/image?assetId=2477475862&width=420&height=420&format=png",
		tagsT: { hero: true, worn: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},
	ArmorLightTorso:
	{
		idS          : "ArmorLightTorso",
		readableNameS: "Light Chest Armor",
		imageId      : "https://www.roblox.com/asset-thumbnail/image?assetId=2477662190&width=420&height=420&format=png",
		tagsT: { hero: true, worn: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},
	ArmorLightLegs:
	{
		idS          : "ArmorLightLegs",
		readableNameS: "Light Leg Armor",
		imageId      : "https://www.roblox.com/asset-thumbnail/image?assetId=2486666881&width=420&height=420&format=png",
		tagsT: { hero: true, worn: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},
	ArmorHeavyTorso:
	{
		idS          : "ArmorHeavyTorso",
		readableNameS: "Heavy Chest Armor",
		imageId      : "https://www.roblox.com/asset-thumbnail/image?assetId=2486613528&width=420&height=420&format=png",
		tagsT: { hero: true, worn: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},
	ArmorHeavyLegs:
	{
		idS          : "ArmorHeavyLegs",
		readableNameS: "Heavy Leg Armor",
		imageId: "https://www.roblox.com/asset-thumbnail/image?assetId=2486619131&width=420&height=420&format=png",
		tagsT: { hero: true, worn: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},	
	Hat:
	{
		idS          : "Hat",
		readableNameS: "Hat",
		imageId: "https://www.roblox.com/asset-thumbnail/image?assetId=2486682345&width=420&height=420&format=png",
		tagsT: { hero: true, worn: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},
	Helmet:
	{
		idS          : "Helmet",
		readableNameS: "Helmet",
		imageId: "https://www.roblox.com/asset-thumbnail/image?assetId=2486677488&width=420&height=420&format=png",
		tagsT: { hero: true, worn: true },
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	},			
//	MagicBeam:
//	{ 
//		idS          : "MagicBeam",
//		readableNameS: "Magic Beam",
//		imageId      : "",
//	}
	Unskinnable:
	{
		idS          : "Unskinnable",
		readableNameS: "",
		imageId      : "",
		tagsT: {},
		upperBodyAttackAnimNames: [],
		fullBodyAttackAnimNames: [],		
	}
}
