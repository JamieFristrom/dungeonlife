import { SkinTypeEnum } from "./SkinTypes"

import { AssetManifest } from "ReplicatedFirst/TS/AssetManifest"

export namespace ToolData
{
    // wishlist, we could have "Held" and "Power" as parts of this and make the sort easier
    export enum EquipSlotEnum 
	{
		Torso  = "Torso",
		Legs   = "Legs",
		Head   = "Head",
//		Neck   = "Neck",
//		RingR  = "RingR",
//		RingL  = "RingL",
//-		Shield = "Shield"
    }
    
    // have to keep these  lowercase enum strings what they are or search through entire lua codebase and fix up
    export enum EquipTypeEnum
    {
        Armor = "armor",
        Melee = "melee",
        Ranged = "ranged",
        Spell = "spell",  // combat spell. you don't necessarily hold it; that depends on use type. A barrier is a spell and usetype 'power'
        Power = "power",  // whereas a buff is a power and usetype 'power'  sorry for the confusion, me
        Potion = "potion"
    }

    // and this maps from the lowercase strings to readable strings.  :P
    export let equipTypeNames: { [k:string]:string } =
    { 
        melee: "Close",
        ranged: "Ranged",
        spell: "Spell",
        potion: "Potion",
        power: "Power",
        armor: "Armor",
        jewelry: "Jewelry"
    }    

    interface LevelNamePairing { [index: number]: string }

    export interface ToolDatumI
    {
        idS: string
        minLevelN: number
        readableNameS: string
        namePlural: boolean
        equipType: EquipTypeEnum
        useTypeS: string
        skinType: SkinTypeEnum
        dropLikelihoodN: number
        imageId: string
        namePerLevel?: LevelNamePairing
        priceMulN: number  // ignored on some items

        statReqS?: string   // armor or weapon

        // armor
        baseEquipS?: string                   // this could be refactored with baseTool
        equipSlot?: EquipSlotEnum
        walkSpeedMulN: number
        jumpPowerMulN: number
        baseDefensesT?: { [k:string]: number }

        // weapon
        baseToolS?: string
        damageNs?: [number, number]
        cooldownN?: number
        critChanceN?: number
        monsterStartGearBiasN?: number
        rangeN?: number
        blastRadiusN?: number
        manaCostN?: number
        manaCostPerLevelN?: number
        effectDurationN?: number

        // potions
        effectStrengthN?: number
        effectBonusPerLevelN?: number
        descriptionArgs?: ( me:ToolDatumI, level:number ) => (number | string)[]
        durationFunc?: ( me:ToolDatumI, level:number ) => number
    }

    export let dataA: ToolDatumI[] =
    [
        {
            idS            : "NullTool",
            readableNameS  : "NullTool",
            namePlural: false,
            minLevelN : 1,
            useTypeS : "held",
            equipType    : EquipTypeEnum.Melee,
            statReqS       : "dexN",
            skinType       : SkinTypeEnum.Sword1H,
            baseToolS      : "Shortsword",
            damageNs       :  [ 0, 0 ],  
            cooldownN      : 1,
            critChanceN    : 1, 
            rangeN         : 1,
            monsterStartGearBiasN : 0,
            dropLikelihoodN : 0,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1,
            imageId : "rbxassetid://124987047",
        },
        {
            idS : "PlateTorso",
            minLevelN : 4,
            readableNameS : "Plate Mail Shirt",
            namePlural: false,
            baseDefensesT : { melee : 2.75, ranged : 2.75, spell : 0 },  //	// 3 was too high  10/29		
            priceMulN: 1,
            walkSpeedMulN : 0.9,  
            jumpPowerMulN : 0,
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Torso,
            baseEquipS : "PlateTorso",
            statReqS : "conN",
            skinType : SkinTypeEnum.ArmorHeavyTorso,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2486613528&width=420&height=420&format=png",
        },
        {
            idS  : "PlateLegs",
            minLevelN : 4,
            readableNameS : "Plate Mail Leggings",
            namePlural: true,
            baseDefensesT : { melee : 2.75, ranged : 2.75, spell : 0 },     // 3 was too high 10/29	
            walkSpeedMulN : 0.9,  
            priceMulN: 1,
            jumpPowerMulN : 0,
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Legs,
            baseEquipS : "PlateLegs",
            statReqS : "conN",
            skinType : SkinTypeEnum.ArmorHeavyLegs,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2486619131&width=420&height=420&format=png",
        },		
        {
            idS : "ScaleTorso",
            minLevelN : 3,
            readableNameS : "Scale Mail Shirt",
            namePlural: false,
            walkSpeedMulN : 1,  // probably won't use this for armor
            priceMulN: 1,
            jumpPowerMulN : 0.9,
            baseDefensesT : { melee : 2, ranged : 2.5, spell : 0 },  			
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Torso,
            baseEquipS : "ScaleTorso",
            statReqS : "conN",
            skinType : SkinTypeEnum.ArmorLightTorso,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2477662190&width=420&height=420&format=png",
        },
        {
            idS : "ScaleLegs",
            minLevelN : 3,
            readableNameS : "Knee Guard Leggings",
            namePlural: true,
            baseDefensesT : { melee : 2, ranged : 2.5, spell : 0 },  			
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Legs,
            baseEquipS : "ScaleLegs",
            statReqS : "conN",
            skinType : SkinTypeEnum.ArmorLightLegs,
            
            walkSpeedMulN : 1,  // probably won't use this for armor
            jumpPowerMulN : 0.95,
            priceMulN: 1,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2486622421&width=420&height=420&format=png",
        },	
        {
            idS : "ChainTorso",
            minLevelN : 2,
            readableNameS : "Chain Mail Shirt",
            namePlural: false,
            baseDefensesT : { melee : 2.5, ranged : 2, spell : 0 },  			
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Torso,
            baseEquipS : "ChainTorso",
            statReqS : "conN",
            skinType : SkinTypeEnum.ArmorLightTorso,
            
            walkSpeedMulN : 1,  // probably won't use this for armor
            jumpPowerMulN : 0.9,
            priceMulN: 1,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2486802775&width=420&height=420&format=png",
        },
        {
            idS : "ChainLegs",
            minLevelN : 2,
            readableNameS : "Chain Mail Leggings",
            namePlural: false,
            baseDefensesT : { melee : 2.5, ranged : 2, spell : 0 },  			
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Legs,
            baseEquipS : "ChainLegs",
            statReqS : "conN",
            skinType : SkinTypeEnum.ArmorLightLegs,
            
            walkSpeedMulN : 1,  // probably won't use this for armor
            jumpPowerMulN : 0.9,
            priceMulN: 1,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2486666881&width=420&height=420&format=png",
        },				
        {
            idS : "LeatherTorso",
            minLevelN : 1,
            readableNameS : "Leather Vest",
            namePlural: false,
            baseDefensesT : { melee : 1.5, ranged : 2, spell : 1 },  		
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Torso,
            baseEquipS : "LeatherTorso",
            statReqS : "dexN",
            skinType : SkinTypeEnum.LeatherTorso,
            
            walkSpeedMulN : 1,  // probably won't use this for armor
            jumpPowerMulN : 1,
            priceMulN: 1,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2477615338&width=420&height=420&format=png",
        },		
        {
            idS : "LeatherLegs",
            minLevelN : 1,
            readableNameS : "Leather Legs",
            namePlural: true,
            baseDefensesT : { melee : 1.5, ranged : 2, spell : 1 },  			
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Legs,
            baseEquipS : "LeatherLegs",
            statReqS : "dexN",
            skinType : SkinTypeEnum.LeatherLegs,
            
            walkSpeedMulN : 1,  // probably won't use this for armor
            jumpPowerMulN : 1,
            priceMulN: 1,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2477475862&width=420&height=420&format=png",
        },	
        {
            idS : "ClothTorso",
            minLevelN : 1,
            readableNameS : "Ritual Shirt",
            namePlural: false,
            baseDefensesT : { melee : 1, ranged : 1.5, spell : 2 },  			

            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Torso,
            baseEquipS : "ClothTorso",
            statReqS : "willN",
            skinType : SkinTypeEnum.ClothTorso,
            
            walkSpeedMulN : 1,  // probably won't use this for armor
            jumpPowerMulN : 1,
            priceMulN: 1,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2486671858&width=420&height=420&format=png",
        },		
        {
            idS : "ClothLegs",
            minLevelN : 1,
            readableNameS : "Ritual Robe",
            namePlural: false,
            baseDefensesT : { melee : 1, ranged : 1.5, spell : 2 },  			
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Legs,
            baseEquipS : "ClothLegs",
            statReqS : "willN",
            skinType : SkinTypeEnum.ClothLegs,
            
            walkSpeedMulN : 1,  // probably won't use this for armor
            jumpPowerMulN : 1,
            priceMulN: 1,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2486800832&width=420&height=420&format=png",
        },		
        {
            idS : "HelmetHalf",
            minLevelN : 2,
            readableNameS : "Half Helm",
            namePlural: false,
            baseDefensesT : { melee : 1.5, ranged : 0, spell : 0 },  			
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Head,
            baseEquipS : "HelmetHalf",
            statReqS : "conN",
            skinType : SkinTypeEnum.Helmet,
            
            walkSpeedMulN : 1,  // probably won't use this for armor
            jumpPowerMulN : 1,
            priceMulN: 0.5,
            dropLikelihoodN : 1.5,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2486677488&width=420&height=420&format=png",
        },					
        {
            idS : "HelmetFull",
            minLevelN : 3,
            readableNameS : "Plate Helmet",
            namePlural: false,
            baseDefensesT : { melee : 1, ranged : 1, spell : 0 },  			
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Head,
            baseEquipS : "HelmetFull",
            statReqS : "conN",
            skinType : SkinTypeEnum.Helmet,
            
            walkSpeedMulN : 1,  // probably won't use this for armor
            jumpPowerMulN : 1,
            priceMulN: 0.5,
            dropLikelihoodN : 1.5,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2486679291&width=420&height=420&format=png",
        },				
        {
            idS : "HatCloth",
            minLevelN : 1,
            readableNameS : "Ritual Hat",
            namePlural: false,
            baseDefensesT : { melee : 0, ranged : 0, spell : 1 },  			
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Head,
            baseEquipS : "HatCloth",
            statReqS : "willN",
            skinType : SkinTypeEnum.Hat,
            
            walkSpeedMulN : 1,  // probably won't use this for armor
            jumpPowerMulN : 1,
            priceMulN: 0.4,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2486682345&width=420&height=420&format=png",
        },				
        {
            idS : "HoodLeather",
            minLevelN : 1,
            readableNameS : "Leather Hood",
            namePlural: false,
            baseDefensesT : { melee : 0, ranged : 1, spell : 0 },  			
            equipType : EquipTypeEnum.Armor,
            useTypeS : "worn",
            equipSlot : EquipSlotEnum.Head,
            baseEquipS : "HoodLeather",
            statReqS : "dexN",
            skinType : SkinTypeEnum.Hat,
            
            walkSpeedMulN : 1,  // probably won't use this for armor
            jumpPowerMulN : 1,
            priceMulN: 0.4,
            dropLikelihoodN : 1,						
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2486705176&width=420&height=420&format=png",
        },				
        {   
            idS            : "Claws",
            readableNameS  : "Claws",
            namePerLevel   : { [1] : "Claws" },
            namePlural: true,
            minLevelN : 1,
            equipType    : EquipTypeEnum.Melee,
            useTypeS : "held",
            statReqS       : "strN",
            skinType       : SkinTypeEnum.Claws,
            baseToolS      : "Claws",
            damageNs       : [ 7, 10 ], // 8.5 * 2 : 18 
            // on 10/30 introduced the freq mul way of addapting monster weapons for low damage / low cooldown, so making this dps
            // close to club and letting chips fall where they may
            
            cooldownN      : .5,
            critChanceN    : .03,  // dps estimate < 24  // algorithm: ( max * crit_chance * 1.5 + average * (1-crit_chance) ) / cooldownN
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 0,  // wishlist: make a player usable version that doesn't growl and looks metal
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            rangeN         : 6,			
            priceMulN: 1,
            imageId : AssetManifest.ImageToolClaws,
        },	
        {   
            idS            : "DaggersDual",
            readableNameS  : "Dual Daggers",
            namePerLevel   : { [1] : "Dual Daggers" },
            namePlural: true,
            minLevelN : 1,
            equipType    : EquipTypeEnum.Melee,
            useTypeS : "held",
            statReqS       : "dexN",
            skinType       : SkinTypeEnum.Claws,
            baseToolS      : "DaggersDual",
            damageNs       : [ 6, 11 ], // 8.5 * 2 : 18   -- higher dps than shortsword, lower range
            cooldownN      : .5,
            critChanceN    : .04,  // dps estimate < 24
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,  // wishlist: make a player usable version that doesn't growl and looks metal
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,
            rangeN         : 6,			
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2674833686&width=420&height=420&format=png",
        },	
        {   
            idS            : "ClawsWerewolf",
            readableNameS  : "Claws",
            namePerLevel   : { [1] : "Claws" },
            namePlural: true,
            minLevelN : 1,
            equipType    : EquipTypeEnum.Melee,
            useTypeS : "held",
            statReqS       : "strN",
            skinType       : SkinTypeEnum.Claws,
            baseToolS      : "Claws",
            damageNs       : [ 14, 20 ], // 8.5 * 2 : 18  // idea is werewolves get in close and shred you up 
            // on 10/30 introduced the freq mul way of addapting monster weapons for low damage / low cooldown, so making this dps
            // close to club and letting chips fall where they may
            
            cooldownN      : .5,
            critChanceN    : .03,  // dps estimate < 24
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 0,  // wishlist: make a player usable version that doesn't growl and looks metal
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,

            rangeN         : 6,			
            imageId : AssetManifest.ImageToolClaws,
        },			
        {   
            idS            : "ClawsDragon",
            readableNameS  : "Claws",
            namePerLevel   : { [1] : "Claws" },
            namePlural: true,
            minLevelN : 1,
            equipType    : EquipTypeEnum.Melee,
            useTypeS : "held",
            statReqS       : "strN",
            skinType       : SkinTypeEnum.Claws,
            baseToolS      : "Claws",
            damageNs       : [ 12, 24 ], // higher because you have to get in close
            cooldownN      : 1,
            critChanceN    : .03,  // dps estimate < 24
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 0,  // wishlist: make a player usable version that doesn't growl and looks metal
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,

            rangeN         : 10,			
            imageId : AssetManifest.ImageToolClaws,			
        },				
        {
            idS            : "Crossbow", 
            readableNameS  : "Crossbow",
            namePerLevel   : { [1] : "Light Crossbow", [8] : "Heavy Crossbow" },
            namePlural: false,
            minLevelN : 1,
            useTypeS : "held",
            equipType    : EquipTypeEnum.Ranged,
            statReqS       : "dexN",			
            skinType       : SkinTypeEnum.Crossbow,
            baseToolS      : "Crossbow",
            damageNs       : [ 22, 34 ],   // dps estimate 14; pro: ranged. con: usually miss  (20-25 OP)  
            // I incorrectly wrote that 14-20 is almost as strong as bolt, but bolt has a lower cooldown!
            // 10-16 was ok when skilled players where using the exploit, so it needs to be higher now, but 14-20 is too strong, almost as strong as bolt
            cooldownN      : 2,   
            critChanceN    : .06,  
            rangeN: 60,
            monsterStartGearBiasN : 2,
            dropLikelihoodN : 2,
            walkSpeedMulN   : 0.6,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,
            imageId : "rbxassetid://16215840",
        }, 
        {
            idS            : "Longbow", 
            readableNameS  : "Longbow",
            namePerLevel   : { [1] : "Long Bow" },
            namePlural: false,
            minLevelN : 1,
            useTypeS : "held",
            equipType    : EquipTypeEnum.Ranged,
            statReqS       : "dexN",			
            skinType       : SkinTypeEnum.Bow,
            baseToolS      : "Longbow",
            damageNs       : [ 9, 14 ],   // dps estimate 14.3; pro: ranged. con: usually miss  (20-25 OP)  
            // I incorrectly wrote that 14-20 is almost as strong as bolt, but bolt has a lower cooldown!
            // 10-16 was ok when skilled players where using the exploit, so it needs to be higher now, but 14-20 is too strong, almost as strong as bolt
            cooldownN      : 0.8,   
            critChanceN    : .05,  
            rangeN: 70,
            monsterStartGearBiasN : 2,
            dropLikelihoodN : 2,
            walkSpeedMulN   : 0.6,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2574560933&width=420&height=420&format=png",
        }, // 2 hits to kill z        
        {   
            idS            : "Bomb",
            readableNameS  : "Bomb",
            namePerLevel   : { [1] : "Bomb" },
            namePlural: false,
            minLevelN : 2,
            useTypeS : "held",
            equipType    : EquipTypeEnum.Ranged,
            statReqS       : "dexN",			
            skinType       : SkinTypeEnum.Bomb,
            baseToolS      : "Bomb",
            damageNs       : [ 14, 18 ],  // 20 - 32 would mean a first level gremlin could kill a first level hero in 3 hits; also made less swingy
            rangeN: 40,
            blastRadiusN   : 40,
            cooldownN      : 1,
            critChanceN    : 0,  // explosion code doesn't crit anyway
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 0.2,
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2347448422&width=420&height=420&format=png",
        }, // 2 hits to kill z		
        // Beams require less skill; immediately hits and does splash damage - 
        // Death ray damage used to be 24 / 36 - OP, you could create an unstoppable defense
        //		BeamWeapon :  {
        //			readableNameS  : "Beam Weapon",
        //			namePerLevel   : { [1] : "Ray" } , 
        //			equipType    : EquipTypeEnum.Ranged,
        //			baseToolS      : "Ray1",
        //			damageNs       : { 6, 7 },
        //			baseMinDamageN : 12,
        //			baseMaxDamageN : 14, 
        //			cooldownN      : .6, 
        //			rangeN         : 60, 
        //			effectDurationN : .6 ,
        //			dropLikelihoodN : 0.5,
        //			flavor : FlavorEnum.Tool,
        //	
        //		},
            
        // melee weapons //
        // Swords are good up-close and don't take much skill, and good for heart, but hard to choose your target
        {
            idS            : "Shortsword",
            readableNameS  : "Short Sword",
            namePerLevel   : { [1] : "Short Sword" },
            namePlural: false,
            minLevelN : 1,
            useTypeS : "held",
            equipType    : EquipTypeEnum.Melee,
            statReqS       : "dexN",
            skinType       : SkinTypeEnum.Sword1H,
            baseToolS      : "Shortsword",
            
            // a 3rd level shortsword should be a touch better than a 1st level broadsword so rogues have a decent melee weapon
            // 1st level broadsword dps = 20
            // 3rd level shortsword dps = 1.3 * 1st level shortsword dps
            // 1st level shortsword dps = 20 / 1.3 = 15.38
            // 1st level shortsword damage = dps * cooldown = 7.69. Let's call it 8
            // changed from [5, 9] to [6, 10 ] on 11/14
            damageNs       :  [ 5, 10 ],  
            
            cooldownN      : 0.5,
            critChanceN    : .07, 
            rangeN         : 7,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.4,
            imageId : "rbxassetid://124987047",
        },
        {
            idS            : "Broadsword",
            readableNameS  : "Broad Sword",
            namePerLevel   : { [1] : "Broad Sword", [8] : "Bastard Sword" },
            namePlural: false,
            minLevelN : 1,
            useTypeS : "held",
            equipType    : EquipTypeEnum.Melee,
            statReqS       : "strN",
            skinType       : SkinTypeEnum.Sword1H,			
            baseToolS      : "Broadsword",
            damageNs       : [ 8, 12 ],  // dps 10 / 0.5 : 20
            cooldownN      : 0.5,
            critChanceN    : .05, 
            rangeN         : 8,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,
            imageId : "rbxassetid://11440361",	
        },	
        {
            idS            : "Greatsword",
            readableNameS  : "Great Sword",
            namePerLevel   : { [1] : "Great Sword" },
            namePlural: false,
            minLevelN : 3,
            useTypeS : "held",
            equipType    : EquipTypeEnum.Melee,
            statReqS       : "strN",
            skinType       : SkinTypeEnum.Sword2H,			
            baseToolS      : "Greatsword",
            damageNs       : [ 8, 18 ],  // dps ~22 
            cooldownN      : 0.7,
            critChanceN    : .05, 
            rangeN         : 10,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,
            imageId : "rbxassetid://2319980778",	
        },			
        {
            idS            : "Staff",  // staves suck, you only use them if you have no other option, as designed
            readableNameS  : "Staff",
            namePerLevel   : { [1] : "Staff" },
            namePlural: false,
            minLevelN : 1,
            skinType       : SkinTypeEnum.Staff,			
            useTypeS : "held",
            equipType    : EquipTypeEnum.Melee,
            statReqS       : "willN",
            baseToolS      : "Staff",
            
            // a 3rd level shortsword should be a touch better than a 1st level broadsword so rogues have a decent melee weapon
            // 1st level broadsword dps = 20
            // 3rd level shortsword dps = 1.3 * 1st level shortsword dps
            // 1st level shortsword dps = 20 / 1.3 = 15.38
            // 1st level shortsword damage = dps * cooldown = 9.2
            // changed from [5, 9] to [7, 11 ] on 11/14

            damageNs       : [ 7, 11 ],  // 6.5 / 0.6 : 13.3 // level 3 staff needs to be a touch better than a level 1 broadsword 			
            cooldownN      : 0.6,
            
            critChanceN    : .03, 
            rangeN         : 7,
            monsterStartGearBiasN : 0,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.4,
            imageId : "rbxassetid://49367564",	
        },					
        // 'one handed' axe
        {
            idS             : "Hatchet",
            readableNameS   : "Hatchet",
            namePerLevel    : { [1] : "Hatchet", [8] : "Axe" },
            namePlural: false,
            minLevelN : 1,
            skinType  : SkinTypeEnum.Axe1H,			
            useTypeS : "held",
            equipType     : EquipTypeEnum.Melee,
            statReqS       : "strN",
            baseToolS       : "Hatchet",
            damageNs       : [ 6, 14 ],  // 10 / 0.55 : 18
            cooldownN      : 0.55,
            critChanceN    : .04, 
            rangeN         : 7,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,
            imageId : "https://www.roblox.com/asset-thumbnail/image?assetId=2266973230&width=420&height=420&format=png",
        },
        // 'two handed' axe
        {
            idS             : "Axe",
            readableNameS   : "Battle Axe",
            namePerLevel    : { [1] : "Battle Axe", [8] : "Great Axe" },
            namePlural: false,
            minLevelN : 3,
            skinType  : SkinTypeEnum.Axe2H,			
            useTypeS : "held",
            equipType     : EquipTypeEnum.Melee,
            baseToolS       : "Axe",
            statReqS       : "strN",
            damageNs       : [ 10, 20 ], // dps ~21 
            cooldownN : 0.8, 
            critChanceN : 0.04, 
            rangeN : 10,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,
            imageId : "rbxassetid://12768177",
        },		
        {   
            idS             : "Club", 
            readableNameS   : "Club",
            namePerLevel : { [1] : "Club" },
            namePlural: false,
            minLevelN : 1,
            skinType  : SkinTypeEnum.Maul,			
            useTypeS : "held",
            equipType : EquipTypeEnum.Melee,
            statReqS       : "strN",
            baseToolS : "Club",
            damageNs       : [ 12, 22 ],    // dps 17 / 0.9 : 18.8
            cooldownN : 0.9,  
            critChanceN : 0.02, 
            rangeN : 9,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.4,
            imageId : "http://www.roblox.com/asset/?id=12215459",
        },			
        {   
            idS             : "Mace", 
            readableNameS   : "Mace",
            namePerLevel : { [1] : "Mace" },
            namePlural: false,
            minLevelN : 2,
            skinType  : SkinTypeEnum.Maul,			
            useTypeS : "held",
            equipType : EquipTypeEnum.Melee,
            statReqS       : "strN",
            baseToolS : "Mace",
            damageNs       : [ 10, 12 ],  // dps 18 (+5 radiant should make up for it for clerics) 
            cooldownN : 0.6, 
            critChanceN : 0.03, 
            rangeN : 9,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,
            imageId : "http://www.roblox.com/asset/?id=18409033",  // tarnished mace thumbnail
        },	
        // aka scythes, Axes are good for threshing creeps
        //		TwoHandedAxe :            { 
        //			readableNameS   : "TwoHandedAxe",
        //			namePerLevel : { [ 1 ] : "Hatchet", [ 2 ] : "Small Axe", [ 4 ] : "Large Axe", [6] : "Scythe" },
        //			equipType : EquipTypeEnum.Melee,
        //			baseToolS : "Scythe1",
        //			damageNs       : { 15, 20 },  // cleaves but also slower so same as sword
        //			cooldownN : 0.4, 
        //			critChanceN : 0.02, 
        //			rangeN : 10,
        //			dropLikelihoodN : 1,
        //			flavor : FlavorEnum.Tool,
        //		 },


        // katanas are good for critting	
        // could be secret of Katana
        //		Katana :            {
        //			readableNameS   : "Katana", 
        //			namePerLevel : { [ 1 ] : "Katana" },
        //			equipType : EquipTypeEnum.Melee,
        //			baseToolS : "Katana1",
        //			damageNs       : { 14, 17 },
        //			// lower DPS than sword but higher range / crit makes it easier to hit with. precise
        //			cooldownN : 0.25, 
        //			critChanceN : .13, 
        //			rangeN : 20,
        //			dropLikelihoodN : 0.745,
        //			flavor : FlavorEnum.Tool,
        //		 },


        // should probably be secret of energy blade because don't have a much better idea to differentiate from sword
        //		EnergyBlade :       { 
        //			readableNameS   : "Energy Blade",
        //			namePerLevel : { [ 1 ] : "Energy Blade" },  
        //			equipType : EquipTypeEnum.Melee,
        //			baseToolS : "EnergyBlade1",
        //			damageNs       : { 14, 21 },
        //			cooldownN : 0.25, 
        //			critChanceN : .1, 
        //			rangeN : 10,
        //			dropLikelihoodN : 0.5,
        //			flavor : FlavorEnum.Tool,
        //		 },

        {
            idS : "DragonBolt",
            readableNameS   : "Magic Bolt",
            namePerLevel : { [1] : "Bolt" },
            namePlural: false,
            minLevelN : 1,
            useTypeS : "held",
            equipType : EquipTypeEnum.Spell, // dps 17 but slow
            statReqS       : "willN",			
            skinType  : SkinTypeEnum.MagicBolt,			
            baseToolS : "MagicBolt",
            damageNs       : [ 11, 18 ],
            cooldownN: 1,
            rangeN: 40,
            critChanceN: 0.04,
//            effectStrengthN : 20,
//            effectBonusPerLevelN : 2,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 0,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,
            imageId : "rbxassetid://1495371626",			
        },
        {
            idS : "NecroBolt",
            readableNameS   : "Necro Bolt",
            namePerLevel : { [1] : "Bolt" },
            namePlural: false,
            minLevelN : 1,
            useTypeS : "held",
            equipType : EquipTypeEnum.Spell, 
            statReqS       : "willN",			
            skinType  : SkinTypeEnum.MagicBolt,			
            baseToolS : "MagicBolt",
            damageNs       : [ 11, 18 ],  // balanced against longbow
            cooldownN: 1,
            rangeN: 40,
            critChanceN: 0.04,
            walkSpeedMulN   : 0.6,
            jumpPowerMulN: 1,  

//            effectStrengthN : 20,
//            effectBonusPerLevelN : 2,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 0,
            priceMulN: 1.5,
            imageId : "rbxassetid://1495371626",			
        },        
        {
            idS             : "MagicBolt",
            readableNameS   : "Magic Bolt",
            namePerLevel : { [1] : "Bolt" },
            namePlural: false,
            minLevelN : 1,
            useTypeS : "held",
            equipType : EquipTypeEnum.Spell, 
            statReqS : "willN",			
            skinType  : SkinTypeEnum.MagicBolt,			
            baseToolS : "MagicBolt",
            damageNs  : [ 16, 27 ],  // 22-38 was one-shotting level 1 gremlins; but since these #s I've made gremlins a touch more powerful though
            cooldownN: 1,
            critChanceN: 0.04,
        //			effectStrengthN : 20,
        //			effectBonusPerLevelN : 2,
            rangeN: 90,
            manaCostN : 7,                       // 10 too high, 5 a little too low
            manaCostPerLevelN : 1.5, 
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,
            imageId : "rbxassetid://1495371626",
        },
        {
            idS             : "MagicBarrier", 
            readableNameS   : "Magic Barrier",
            namePerLevel : { [1] : "Magic Barrier" },
            namePlural: false,
            minLevelN : 2,

            // this is confusing; it's a combat spell but you use it is a hotbar power.
            useTypeS : "power",
            equipType : EquipTypeEnum.Spell,

            statReqS : "willN",			
            skinType  : SkinTypeEnum.MagicBarrier,			
            baseToolS : "MagicBarrier",
            damageNs       :[ 30, 40 ],   
            rangeN: 20,
        //			effectStrengthN : 20,
        //			effectBonusPerLevelN : 2,		 
            //effectDurationN : 4, 
            critChanceN: 0,
            cooldownN : 1, 
            // 11/8: people are wanking about the barrier, cut mana cost in half from 20/4
            manaCostN : 10,
            manaCostPerLevelN : 2,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 0.5,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,            
            durationFunc : ( me, level ) => 1 + 8 * ( 1 - ( 1 / ( level / 5 + 1 ) ) ),  // level 1: 2.3, level 2: 3.3, level 3: 4, level 4: 4.5, level 30: 7.8

            imageId : "rbxassetid://1498812207",
        },
        {
            idS             : "NecroBarrier", 
            readableNameS   : "Necro Barrier",
            namePerLevel : { [1] : "Necro Barrier" },
            namePlural: false,
            minLevelN : 1,

            // this is confusing; it's a combat spell but you use it is a hotbar power.
            useTypeS : "power",
            equipType : EquipTypeEnum.Spell,

            statReqS : "willN",			
            skinType  : SkinTypeEnum.MagicBarrier,			
            baseToolS : "MagicBarrier",
            damageNs       :[ 30, 40 ],
            rangeN: 20,
        //			effectStrengthN : 20,
        //			effectBonusPerLevelN : 2,		 
            effectDurationN : 4, 
            cooldownN: 4, 
            critChanceN: 0,
            // 11/8: people are wanking about the barrier, cut mana cost in half from 20/4
            manaCostN : 0,
            manaCostPerLevelN : 0,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 0,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 1.5,
            durationFunc : ( me, level ) => 1 + 8 * ( 1 - ( 1 / ( level / 5 + 1 ) ) ),  // level 1: 2.3, level 2: 3.3, level 3: 4, level 4: 4.5, level 30: 7.8

            imageId : "rbxassetid://1498812207",
        },        
        //	
        //		Storm : {
        //			readableNameS   : "Magic Storm",		 
        //			equipType : EquipTypeEnum.Spell,
        //			namePerLevel : { [ 1 ] : "Storm" },
        //			baseToolS : "MagicStorm",	
        //			damageNs       : { 20, 30 },
        //			cooldownN : 2.5, 
        //			effectDurationN : 1.5, 
        //			effectStrengthN : 30,
        //			effectBonusPerLevelN : 3,		
        //			manaCostN : 30,
        //			dropLikelihoodN : 0.5,
        //			flavor : FlavorEnum.Tool,
        //		 },
        {   
            idS            : "MagicHealing",		// left this as MagicHealing to take away everybody's heal spells
            readableNameS  : "Healing Wisp",
            namePlural: false,
            minLevelN : 1,
            useTypeS : "power",
            equipType : EquipTypeEnum.Power,
            statReqS : "willN",			
            skinType  : SkinTypeEnum.Unskinnable,		
            cooldownN : 10, 
            effectStrengthN : 4,
            effectBonusPerLevelN : 0.666,		
            manaCostN : 12,   // couldn't raise this beyond this because it broke high-level characters
            manaCostPerLevelN : 2,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,  
            priceMulN: 2,
            rangeN: 15,  // someday we might want to make that flexible but nonlinear stuff is always hell
            durationFunc : ( me, level ) => 7 + 7 * ( 1 - ( 1 / ( level / 5 + 1 ) ) ),  
            descriptionArgs : ( me, level ) => [ (me.effectStrengthN! + me.effectBonusPerLevelN! * level), me.durationFunc!( me, level ) ],
            imageId : "rbxassetid://2908591784",
        },
        {   
            idS            : "HasteWisp",		
            readableNameS  : "Haste Wisp",
            namePlural: false,
            minLevelN : 1,
            useTypeS : "power",
            equipType : EquipTypeEnum.Power,
            statReqS : "willN",			
            skinType  : SkinTypeEnum.Unskinnable,		
            cooldownN : 10, 
            effectStrengthN : 0.20,
            effectBonusPerLevelN : 0.005,		
            manaCostN : 20,   // 
            manaCostPerLevelN : 0.5,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,
            priceMulN: 2,
            rangeN: 15,  // someday we might want to make that flexible but nonlinear stuff is always hell
            durationFunc : ( me, level ) => 10 + 10 * ( 1 - ( 1 / ( level / 5 + 1 ) ) ),  // level 1: 2.3, level 2: 3.3, level 3: 4, level 4: 4.5, level 30: 7.8
            descriptionArgs : ( me, level ) => [ (me.effectStrengthN! + me.effectBonusPerLevelN! * level)*100, me.durationFunc!( me, level ) ],
            imageId : "rbxassetid://2908591670",
        },
        {   
            idS            : "CurseWisp",		
            readableNameS  : "Curse Wisp",
            namePlural: false,
            minLevelN : 1,
            useTypeS : "power",
            equipType : EquipTypeEnum.Power,
            statReqS : "willN",			
            skinType  : SkinTypeEnum.Unskinnable,		
            cooldownN : 10, 
            effectStrengthN : 0.20,
            effectBonusPerLevelN : 0.005,		
            manaCostN : 20,   // 
            manaCostPerLevelN : 0.5,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,
            priceMulN: 2,
            rangeN: 15,  // someday we might want to make that flexible but nonlinear stuff is always hell
            durationFunc : ( me, level ) => 10 + 10 * ( 1 - ( 1 / ( level / 5 + 1 ) ) ),  // level 1: 2.3, level 2: 3.3, level 3: 4, level 4: 4.5, level 30: 7.8
            descriptionArgs : ( me, level ) => [ (me.effectStrengthN! + me.effectBonusPerLevelN! * level)*100, me.durationFunc!( me, level ) ],
            imageId : "rbxassetid://2908591476",
        },
        // {   
        //     idS            : "MagicHealing",		
        //     readableNameS  : "Heal Spell",
        //     namePlural: false,
        //     minLevelN : 1,
        //     useTypeS : "power",
        //     equipType : EquipTypeEnum.Power,
        //     statReqS : "willN",			
        //     skinType  : SkinTypeEnum.Unskinnable,		
        // //			baseToolS : "MagicHealing",
        //     // used to be 18 + 4 / level, 2.5 secs, mana cost 18 + 3 / level
        //     // a lot of people would end up with healing they couldn't use, os I cut it to a little over ~2/3 of that			
        //     cooldownN : 3, 
        //     // I'm not sure I brought this up with the 50% health increase from 10/30, but also worried it's a little too high anyway, as Heal is a must-have item, so only bringing it up 25%/33% from 24/6. --11/8
        //     effectStrengthN : 30,
        //     // 11/30: leaving this at 30/8 now that I've upped health and mana; should be more effective for arcane characters and less effective for not, right?
        //     effectBonusPerLevelN : 8,		
        //     manaCostN : 12,   // 
        //     manaCostPerLevelN : 2,
        //     monsterStartGearBiasN : 1,
        //     dropLikelihoodN : 1,
        //     walkSpeedMulN   : 1,
        //     priceMulN: 2,
        //     descriptionArgs : ( me, level ) => [ (me.effectStrengthN! + me.effectBonusPerLevelN! * level) ],
        //     imageId : "rbxassetid://2685885304"

        // },
        {   
            idS            : "MagicSprint",		
            readableNameS  : "Sprint Power",
            namePlural: false,
            minLevelN : 1,
            useTypeS : "power",
            equipType : EquipTypeEnum.Power,
            statReqS : "dexN",			
            skinType  : SkinTypeEnum.Unskinnable,		
            cooldownN : 2, 
            // 3/1 - was 1.33 but I decided for high level sprint it would be better to be faster but shorter
            effectStrengthN : 1.6,
            effectBonusPerLevelN : 0.01,		
            manaCostN : 16,   // 
            manaCostPerLevelN : 0.2,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 1,
            walkSpeedMulN   : 1,  // thought a moment about using the cooldown walkspeedmul to do the effect, but we want to bea ble to fire arrows while sprinting
            jumpPowerMulN: 1,
            priceMulN: 2,
            descriptionArgs : ( me, level ) => [ math.ceil( ( me.effectStrengthN! + me.effectBonusPerLevelN! * level - 1 ) * 100 ),
                me.durationFunc!( me, level ) ],
            //durationFunc : ( me, level ) => math.log( level + 1 ) * 3,
            // 2/18: old formula was math.log( level + 1 ) * 3:  2 seconds at level 1 and 10 seconds at level 30
            // decided I wanted an asymptote and 10 seconds is too long:
            // durationFunc : ( me, level ) => 8 * ( 1 - ( 1 / ( level + 1 ) ) ),  // level 1: 4, level 2: 6, level 3: 7, level 4: 7.something
            durationFunc : ( me, level ) => 8 * ( 1 - ( 1 / ( level / 4 + 1 ) ) ),  // level 1: 1.6, level 2: 2.6, level 3: 3.4, level 4: 4, level 30: 7

            imageId : "rbxassetid://2685885503",
        },	
        {   
            idS            : "MonsterSprint",		
            readableNameS  : "Sprint Power",
            namePlural: false,
            minLevelN : 1,
            useTypeS : "power",
            equipType : EquipTypeEnum.Power,
            statReqS : "dexN",			
            skinType  : SkinTypeEnum.Unskinnable,		
            cooldownN : 10, 
            // 3/1 - was 1.33 but I decided for high level sprint it would be better to be faster but shorter
            effectStrengthN : 1.6,    
            effectBonusPerLevelN : 0.01,		
            manaCostN : 0,   // 
            manaCostPerLevelN : 0,
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 0,
            walkSpeedMulN   : 1,  // thought a moment about using the cooldown walkspeedmul to do the effect, but we want to bea ble to fire arrows while sprinting
            jumpPowerMulN: 1,
            priceMulN: 2,
            descriptionArgs : ( me, level ) => [ math.ceil( ( me.effectStrengthN! + me.effectBonusPerLevelN! * level - 1 ) * 100 ),
                me.durationFunc!( me, level ) ],
            //durationFunc : ( me, level ) => math.log( level + 1 ) * 3,
            // 2/18: old formula was math.log( level + 1 ) * 3:  2 seconds at level 1 and 10 seconds at level 30
            // decided I wanted an asymptote and 10 seconds is too long:
            // durationFunc : ( me, level ) => 8 * ( 1 - ( 1 / ( level + 1 ) ) ),  // level 1: 4, level 2: 6, level 3: 7, level 4: 7.something
            durationFunc : ( me, level ) => 8 * ( 1 - ( 1 / ( level / 4 + 1 ) ) ),  // level 1: 1.6, level 2: 2.6, level 3: 3.4, level 4: 4, level 30: 7

            imageId : "rbxassetid://2685885503",
        },	
        {   
            idS            : "TransformWerewolf",		
            readableNameS  : "Transform",
            namePlural: false,
            minLevelN : 1,
            useTypeS : "power",
            equipType : EquipTypeEnum.Power,
            skinType  : SkinTypeEnum.Unskinnable,		
            cooldownN : 4, 
            dropLikelihoodN : 0,
            walkSpeedMulN   : 1,  // thought a moment about using the cooldown walkspeedmul to do the effect, but we want to bea ble to fire arrows while sprinting
            jumpPowerMulN: 1,
            priceMulN: 2,
            imageId : "rbxassetid://2688472960",
        },	
        // potions //
        {   // one use
            idS             : "Healing",
            // 11/29: we increased health from 54 + level * 6 + stat * 6 to 72 + level * 8 + stat * 6 so taking from 48/8 (or 8 * level) to 60/10; only a 10% increase
            // but potion spamming was supposedly a thing. Let's see how it goes.
            // 1/19: healing is too powerful
            effectStrengthN : 60,
            effectBonusPerLevelN : 10,    // it's character level, not item level with potions 
            baseToolS : "HealingPotion",	
            cooldownN : 0,	
            minLevelN: 1,
            readableNameS : "Healing Potion",
            namePlural: false,
            useTypeS : "potion",
            equipType : EquipTypeEnum.Potion,
            skinType  : SkinTypeEnum.Unskinnable,					
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 16,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,
            priceMulN: 1,
            descriptionArgs : ( me, level ) => [ me.effectStrengthN! + me.effectBonusPerLevelN! * level ],
            imageId : "rbxassetid://1509744360",
        },
        {
            idS: "Mana",             // one use
            // 11/29: increased from 24/6 because we increased mana / arcane from 4 to 6
            effectStrengthN : 36, 
            effectBonusPerLevelN : 9,   // it's character level, not item level with potions 
            baseToolS : "ManaPotion",
            minLevelN : 1,
            cooldownN : 0,	
            readableNameS : "Restore Potion",
            namePlural: false,
            useTypeS : "potion",
            equipType : EquipTypeEnum.Potion,
            skinType  : SkinTypeEnum.Unskinnable,					
            monsterStartGearBiasN : 1,
            dropLikelihoodN : 4,
            walkSpeedMulN   : 1,
            jumpPowerMulN: 1,
            priceMulN: 1,
            descriptionArgs : ( me, level ) => [ me.effectStrengthN! + me.effectBonusPerLevelN! * level ],
            imageId : "rbxassetid://1509744355",
        },
    ]

    export let dataT: { [k:string]: ToolDatumI } = {}

    dataA.forEach(element => {
        dataT[ element.idS ] = element
    });

    // dump weapon data
    dataA.filter(toolDatum => toolDatum.damageNs !== undefined).forEach(toolDatum => {
        if( toolDatum.critChanceN === undefined )
            warn(toolDatum.idS + " missing crit chance" )
        //else
            //print(toolDatum.idS + " " + toolDatum.damageNs![0] + " " + toolDatum.damageNs![1] + " " + toolDatum.critChanceN! + " " + toolDatum.cooldownN!)
    })
}

