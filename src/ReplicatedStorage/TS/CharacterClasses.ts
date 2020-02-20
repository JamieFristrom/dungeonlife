// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { AssetManifest } from "ReplicatedFirst/TS/AssetManifest"

import { FlexTool, ToolDefinition } from "./FlexToolTS"

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

export interface CharacterClassI
{
    readonly idS: string
    //imageId: string
    readonly ghostifyB?: boolean
    readonly walkSpeedN: number
    readonly jumpPowerN: number
    // readonly statsT?: HeroStatBlockI
    // readonly monsterStats?: MonsterStatBlockI
	readonly badges?: number[]
	readonly gamePassId?: number
}

export interface MonsterStatBlockI
{
    readonly prototypeObj?: string //  : "Sasquatch",
    readonly scaleN: number //         : 1,
    readonly baseHealthN: number //     : 35,  // 38 seemed to high
    //readonly baseManaN: number //       : 0,  // currently all monsters have infinite mana
    //manaPerLevelN: number //   : 0,  // currently all monsters have infinite mana
    //minLevelN       : 1,  // deprecated
    //maxLevelN       : 5,
    readonly baseDamageBonusN: number //     : 1,   // sasquatches are big and tough but no ranged
    ////damageBonusPerLevelN : 0.015,  // deprecated
    readonly dropGoldPctN: number //    : 0.2,
    readonly baseGoldN: number //       : 1,
    readonly goldPerLevelN: number //   : 1,	
    readonly dropItemPctN: number // 	: 0.14,
    readonly tagsT: { [k: string]: boolean } //           : {},	
    readonly numWeaponsN: number //    : 1,								
    readonly potentialWeaponsA: string[] // : { "Claws", "Club" }, 
    readonly defaultHideAccessoriesB: boolean // : true,

    // optionals
    //readonly soloLevelN?: number  // unused
    readonly auraColor3?: Color3
    readonly fogDistanceN?: number 
    readonly invulnerableB?: boolean
    readonly victoryBadgeId?: number
}

/**
    The data for different character classes, both hero and monster.
 */
export namespace CharacterClasses {
	export const classData: { [ k: string ]: CharacterClassI } =
	{
		Warrior:
		{
			idS           : "Warrior",
			//readableNameS : "Warrior",
//			imageId       : "http://www.roblox.com/asset/?id:11440361",
			walkSpeedN      : 12,
			jumpPowerN      : 35,
			badges: [ 2124442021, 2124442022, 2124442023, 2124442024 ]
		},
		Rogue:
		{
			idS           : "Rogue",
			//readableNameS : "Rogue",
			//imageId       : "http://www.roblox.com/asset/?id:16215840",
			walkSpeedN      : 12,  
			jumpPowerN      : 35,
			badges: [ 2124442025, 2124442026, 2124442027, 2124442028 ]
		},
		Mage:
		{
			idS           : "Mage",			
			//readableNameS : "Mage",
			//imageId       : "rbxassetid://1495371626",
			walkSpeedN      : 12,  
			jumpPowerN      : 35,
			badges: [ 2124442009, 2124442010, 2124442011, 2124442012 ]
		},
		Barbarian:
		{
			idS           : "Barbarian",
			//readableNameS : "Barbarian",
			//imageId       : AssetManifest.ImageHeroBarbarian,
			walkSpeedN      : 12,  
			jumpPowerN      : 35,
			badges: [ 2124442013, 2124442014, 2124442015, 2124442016 ],
			gamePassId      : 5190525		// must match possessiondata
		},		
		Priest:
		{
			idS           : "Priest",
			//readableNameS : "Priest",
			//imageId       : AssetManifest.ImageHeroPriest,
			walkSpeedN      : 12,  
			jumpPowerN      : 35,
			badges: [2124442017, 2124442018, 2124442019, 2124442020],
			gamePassId     : 5188279,			  // must match possessiondata
		},
        // monsters
        DungeonLord:
        {
            idS             : "DungeonLord",
            //readableNameS   : "Dungeon Lord"
            ghostifyB       : false,
            walkSpeedN      : 14,
            jumpPowerN      : 35,						
        },
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-
        // monsters
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-
        // felt like Damage bonus per level was too low across the board as of 10/6
        // while most monsters Base Damage Bonus is there just to make sure they keep pace with the heroes damage bonuses for stats
        // and to crank their damage up linearly faster than the heroes per level to stay ahead of their enhanced weapons
        // some monsters, like the gremlins and bosses, use their BDB to make the monsters more powerful relative to others
        // current the damageBonusPerLevel is constant - that may be a mistake, but I've seen that having it high can make 
        // a monster way too powerful, frex the gremlin's bombs.  It will nonlinearly combine with the scaling weapon power when a monster gets higher level
        
        // I don't want bosses attacks to be *too* much higher than their regular counterparts. 
        BlueheadDragon:
        {
            idS             : "BlueheadDragon",			
            //readableNameS   : "Bluehead Dragon",			
            walkSpeedN      : 8,  
            jumpPowerN      : 18,
        },		
        CrystalDaemon:
        {
            // make immune to cold, wishlist
            idS             : "CrystalDaemon",			
            //readableNameS   : "Crystal Daemon",			
            walkSpeedN      : 11,  
            jumpPowerN      : 30,
        },			
        CrystalDaemonSuper:
        {
            // make immune to cold
            idS             : "CrystalDaemonSuper",			
            //readableNameS   : "Demon King Winter",			
            walkSpeedN      : 11,  
            jumpPowerN      : 30,
        },			
        Cyclops:
        {
            idS           : "Cyclops",
            //readableNameS : "Cyclops",
            walkSpeedN      : 12,  
            jumpPowerN      : 15,
        },
        CyclopsSuper:
        {
            idS           : "CyclopsSuper",
            //readableNameS : "Queen Cyclops",
            walkSpeedN      : 12,  
            jumpPowerN      : 15,
        },			
        // try to keep up with the heroes who get magical loot
        Zombie:
        {   // can see 'brains' 
            idS           : "Zombie",  
            //readableNameS : "Zombie", 
            walkSpeedN      : 11,
            jumpPowerN      : 0,
        },
        Skeleton:
        {
            idS           : "Skeleton",
            //readableNameS : "Skeleton",
            walkSpeedN      : 13,
            jumpPowerN      : 40,
        },		
        Werewolf:
        {
            idS             : "Werewolf",
            //readableNameS   : "Werewolf",
            walkSpeedN      : 10,
            jumpPowerN      : 60,			
        },
        Ghost:
        {
            idS           : "Ghost",
            ghostifyB       : true,
            walkSpeedN      : 12,
            jumpPowerN      : 35,			
        },
        Gremlin:
        {
            idS           : "Gremlin",
            //readableNameS : "Gremlin",
            ghostifyB       : false,
            walkSpeedN      : 14,  // 16 was too high - rogues couldn't stay ahead of them and neither could players with aura of courage - 10/29
            jumpPowerN      : 60,			
        },
        Orc:
        {
            idS           : "Orc",
            //readableNameS : "Orc",
            walkSpeedN      : 12,  
            jumpPowerN      : 35,						
        },
        Necromancer:
        {
            idS           : "Necromancer",
            //readableNameS : "Necromancer",
            walkSpeedN      : 12,  
            jumpPowerN      : 35,						
        },		
        Sasquatch:
        {
            idS           : "Sasquatch",
            //readableNameS : "Sasquatch",
            walkSpeedN      : 12, 
            jumpPowerN      : 35,						 
        }
    }
    
    export const heroStartingStats: { [ k: string ]: HeroStatBlockI } =
    {
        Warrior:
        {
            strN 			 : 11,  //// means if you draw a level 3 weapon you have a choice between putting in strength or con when you hit level 2
            dexN 		     : 10,
            conN 		     : 14,
            willN 		     : 10,
            experienceN      : 0,
            goldN            : 0,
            deepestDungeonLevelN : 1,
            totalTimeN       : 0,
        },
		Rogue:
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
		Mage:
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
		Barbarian:
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
		Priest:
		{
            strN 			 : 12,
            dexN 		     : 10,
            conN 		     : 12,
            willN 		     : 11,  
            experienceN      : 0,
            goldN            : 0,
            deepestDungeonLevelN : 1,
            totalTimeN       : 0,				
        }
    }

    export const monsterStats: { [ k: string ]: MonsterStatBlockI } =
    {
        DungeonLord:
        {
            prototypeObj    : undefined,
            scaleN          : 1,
            fogDistanceN    : 300,    // fogDistanceN is how well a critter sees; it puts the fog plane there
            invulnerableB   : true,
            baseHealthN     : 10,
//                healthPerLevelN : 10,  
//                baseManaN       : 0,
//                minLevelN       : 2,
//                maxLevelN       : 5,	
            baseDamageBonusN     : 0,
            //damageBonusPerLevelN : 0.08,
            dropGoldPctN    : .2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN    : 0.12,		
            tagsT           : {},
            numWeaponsN     : 0,						
            potentialWeaponsA : [], 
            defaultHideAccessoriesB : false,
        },
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-
        // monsters
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-
        // felt like Damage bonus per level was too low across the board as of 10/6
        // while most monsters Base Damage Bonus is there just to make sure they keep pace with the heroes damage bonuses for stats
        // and to crank their damage up linearly faster than the heroes per level to stay ahead of their enhanced weapons
        // some monsters, like the gremlins and bosses, use their BDB to make the monsters more powerful relative to others
        // current the damageBonusPerLevel is constant - that may be a mistake, but I've seen that having it high can make 
        // a monster way too powerful, frex the gremlin's bombs.  It will nonlinearly combine with the scaling weapon power when a monster gets higher level
        
        // I don't want bosses attacks to be *too* much higher than their regular counterparts. 
        BlueheadDragon:
        {
            prototypeObj    : "BlueheadDragon",
            scaleN          : 2,
            baseHealthN     : 30,
    //			healthPerLevelN : 45,
            //baseManaN       : 30,
            //manaPerLevelN   : 20,
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
            //minLevelN       : 1,
            //maxLevelN       : 5,
            baseDamageBonusN : 1,      // is the only one that uses the dragon bolt, so doesn't need any bonus
            //damageBonusPerLevelN : 0.015,     // boss bonuses may seem high but keep in mind the cross-the-board monster nerfing in BalanceData
            dropGoldPctN    : 0.2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN 	: 1,
            tagsT           : { Boss: true },
            numWeaponsN     : 2,	
            potentialWeaponsA : [ "ClawsDragon", "DragonBolt" ], 
            defaultHideAccessoriesB : true,
        },		
        CrystalDaemon:
        {
            // make immune to cold, wishlist
            prototypeObj    : "CrystalDaemon",
            auraColor3      : new Color3( 0.25, 0.25, 0.5 ),
            scaleN          : 1.5,
            baseHealthN     : 35,// 60,  // giving him more hp than king because he's, well, kind of useless
    //			healthPerLevelN : 50,
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //minLevelN       : 1,
            //maxLevelN       : 5,
            baseDamageBonusN     : 1.5,   //  particularly high because they're slower than you, they have to corner you to hit
            //damageBonusPerLevelN : 0.015,  //  of course if you're playing a melee class you probably don't care
            dropGoldPctN    : 0.2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN 	: 1,
            tagsT           : { Boss: true, Dark: true },
            numWeaponsN     : 1,	
            //startingCountN  : 1, // only matters for blueprints
            potentialWeaponsA : [ "Greatsword" ], 
            defaultHideAccessoriesB : true,
                //flavor : PossessionData.FlavorEnum.Monster,
        },			
        CrystalDaemonSuper:
        {
            // make immune to cold
            prototypeObj    : "CrystalDaemonSuper",
            auraColor3      : new Color3( 0.25, 0.25, 0.5 ),
            scaleN          : 1.9,
            baseHealthN     : 33,// 60,
    //			healthPerLevelN : 50,
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //soloLevelN      : 10,
            //minLevelN       : 1,
            //maxLevelN       : 5,
            baseDamageBonusN     : 1.25,   //  not as high as his counterpart because he can sprint
            //damageBonusPerLevelN : 0.015,  //  of course if you're playing a melee class you probably don't care
            dropGoldPctN    : 0.2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN 	: 1,
            tagsT           : { Superboss: true, Dark: true },
            numWeaponsN     : 0,	
            //startingCountN  : 1, // only matters for blueprints
            potentialWeaponsA : [], 
            defaultHideAccessoriesB : true
        },			
        Cyclops:
        {
            prototypeObj  : "Cyclops",
            scaleN          : 1.75,
            baseHealthN     : 27,// 55,
    //			healthPerLevelN : 48,
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //minLevelN       : 1,
            //maxLevelN       : 5,
            baseDamageBonusN     : 1,  
            //damageBonusPerLevelN : 0.015,
            dropGoldPctN    : 0.2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN 	: 1,
            tagsT           : { Boss : true },	
            numWeaponsN     : 1,	
            //startingCountN  : 0, // only matters for blueprints
            potentialWeaponsA : [ "Club" ], 
            defaultHideAccessoriesB : true,
        },
        CyclopsSuper:
        {
            prototypeObj  : "CyclopsSuper",
            scaleN          : 1.9,
            baseHealthN     : 27,
            //healthPerLevelN : 50,
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //soloLevelN      : 10,
            baseDamageBonusN     : 1,  // leaving it same as cyclops because she has xbow
            //damageBonusPerLevelN : 0.015,
            dropGoldPctN    : 0.2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN 	: 1,
            tagsT           : { Superboss : true },	
            numWeaponsN     : 2,	
            //startingCountN  : 0, // only matters for blueprints
            victoryBadgeId : 2124428661,
            potentialWeaponsA : [ "Club", "Crossbow" ],  // the crossbow is what makes her super now
            defaultHideAccessoriesB : true,
        },			
        // try to keep up with the heroes who get magical loot
        Zombie:
        {   // can see 'brains' 
            prototypeObj  : "Zombie",
            scaleN          : 1,
            fogDistanceN    : 200,
            baseHealthN     : 45, //20,  // super tough, not a lot of damage
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
    //			healthPerLevelN : 10,  
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //minLevelN       : 1,
            //maxLevelN       : 4,	
            baseDamageBonusN     : 1,  // being consistent with these now unless we want to show a dramatic difference; these are imagining as if it's a character starting with 10 in the stat adding 2 every level
            //damageBonusPerLevelN : 0.015,
            dropGoldPctN    : .2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN    : 0.1,		
            tagsT           : { Dark : true },
            numWeaponsN     : 1,				
            potentialWeaponsA : [ "Claws" ],
            //startingCountN  : 1, // only matters for blueprints
            defaultHideAccessoriesB : false,
        },
        Skeleton:
        {
            prototypeObj  : "Skeleton",
            scaleN          : 1,
            fogDistanceN    : 150,
            baseHealthN     : 24, //10,
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
    //			healthPerLevelN : 6,  
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //minLevelN       : 2,
            //maxLevelN       : 5,	
            baseDamageBonusN     : 1,
            //damageBonusPerLevelN : 0.015,
            dropGoldPctN    : .2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN    : 0.12,		
            numWeaponsN     : 1,							
            tagsT           : { Dark : true },
            potentialWeaponsA : [ "Longbow", "Crossbow", "Bomb", "Broadsword", "Greatsword", "Axe", "Hatchet", "Mace" ], 
            //startingCountN  : 1, // only matters for blueprints
            defaultHideAccessoriesB : false,
        },		
        Werewolf:
        {
            prototypeObj    : "Werewolf",  // starting out werewolf; now that we spawn far away from hero we might be able to pull it off
            scaleN          : 1,
            fogDistanceN    : 150,
            baseHealthN     : 24, //10,
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
    //			healthPerLevelN : 6,
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //minLevelN       : 5,
            //maxLevelN       : math.huge,
            baseDamageBonusN     : 1,
            //damageBonusPerLevelN : 0.015,
            dropGoldPctN    : .2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN 	: 0.2,		
            tagsT           : { Dark : true },
            //powerCooldownN  : 10,
            numWeaponsN     : 1,										
            potentialWeaponsA : [ "Longbow", "Crossbow", "Broadsword", "Greatsword", "Axe", "Hatchet", "Mace" ], 
            //startingCountN  : 1, // only matters for blueprints
            defaultHideAccessoriesB : true,
        },
        Ghost:
        {
            prototypeObj : undefined,
            scaleN          : 1,
            auraColor3      : new Color3( 0.55, 0.55, 0.55 ),
            fogDistanceN    : 150,
            baseHealthN     : 24, //10,
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
    //			healthPerLevelN : 6,  
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //minLevelN       : 2,
            //maxLevelN       : 5,	
            baseDamageBonusN     : 1,
            //damageBonusPerLevelN : 0.015,
            dropGoldPctN    : .2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN    : 0.12,		
            tagsT           : { Dark : true },
            numWeaponsN     : 1,							
            potentialWeaponsA : [ "Longbow", "Crossbow", "Bomb", "Broadsword", "Greatsword", "Axe", "Mace" ], 
            //startingCountN  : 1, // only matters for blueprints
            defaultHideAccessoriesB : false
        },
        Gremlin:
        {
            prototypeObj  : "Gremlin",
            scaleN          : 0.7,
            fogDistanceN    : 150,
            baseHealthN     : 15, // they are supposed to be easy to kill because their base damage bonus is grossly high and they have bombs
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
    //			healthPerLevelN : 5,  
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //minLevelN       : 2,
            //maxLevelN       : 5,	
            baseDamageBonusN : 2,
            // effectively 2x damage  
            // grossly high to make up for them being one hit kills and being armed with shortswords - at 0.5 bdb it takes around 30 hits to kill a first level warrior
            //damageBonusPerLevelN : 0.0025,  // because Gremlins bombs got so nasty reduced their bab; it wouldn't be crazy to have 0 in here
            dropGoldPctN    : .2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN    : 0.12,		
            tagsT           : { },
            numWeaponsN     : 1,							
            potentialWeaponsA : [ "Shortsword", "Bomb" ], 
            //startingCountN  : 1, // only matters for blueprints
            defaultHideAccessoriesB : true,
        },
        Orc:
        {
            prototypeObj  : "Orc",
            scaleN          : 1,
            baseHealthN     : 32, // 15,
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
    //			healthPerLevelN : 6,
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //minLevelN       : 1,
            //maxLevelN       : 5,
            baseDamageBonusN     : 	1,
            //damageBonusPerLevelN : 0.015,
            dropGoldPctN    : 0.2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN 	: 0.14,
            tagsT           : {},	
            numWeaponsN     : 2,								
            potentialWeaponsA :  [ "Claws", "Longbow", "Crossbow", "Bomb", "Broadsword", "Greatsword", "Axe", "Hatchet", "Mace" ], 
            //startingCountN  : 1, // only matters for blueprints
            defaultHideAccessoriesB : true,
        },
        Necromancer:
        {
            prototypeObj  : "Necromancer",
            scaleN          : 1,
            baseHealthN     : 24,  // they were OP at 32 on 3/5, mostly because of barrier though. Also increased casting cost, // 15,
            auraColor3      : new Color3( 0.25, 0.0, 0.25 ),
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
    //			healthPerLevelN : 6,
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //minLevelN       : 1,
            //maxLevelN       : 5,
            baseDamageBonusN     : 1,
            //damageBonusPerLevelN : 0.015,
            dropGoldPctN    : 0.2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN 	: 0.14,
            tagsT           : {},	
            numWeaponsN     : 2,								
            potentialWeaponsA :  [ "NecroBolt", "NecroBarrier", "Staff" ],
            //startingCountN  : 1, // only matters for blueprints
            defaultHideAccessoriesB : true,
        },		
        Sasquatch:
        {
            prototypeObj  : "Sasquatch",
            scaleN          : 1,
            baseHealthN     : 35,  // 38 seemed to high
            //baseDefensesT : { melee : 3, ranged : 3, spell : 3 },  						
    //			healthPerLevelN : 10,
            //baseManaN       : 0,
            //manaPerLevelN   : 0,
            //minLevelN       : 1,
            //maxLevelN       : 5,
            baseDamageBonusN     : 1,   // sasquatches are big and tough but no ranged
            //damageBonusPerLevelN : 0.015,
            dropGoldPctN    : 0.2,
            baseGoldN       : 1,
            goldPerLevelN   : 1,	
            dropItemPctN 	: 0.14,
            tagsT           : {},	
            numWeaponsN     : 1,								
            potentialWeaponsA : [ "Claws", "Club" ], 
            //startingCountN  : 1, // only matters for blueprints
            defaultHideAccessoriesB : true,
        }
    }

    export const startingItems: { [ k: string ]: ToolDefinition[] } =
	{
		Warrior:
		[
				{ baseDataS : "Broadsword", levelN : 1, enhancementsA: [], slotN : 1 }, // //, enhancementsA : { { flavorS : "explosive", seconds : 5, dps : 10 } } },
				{ baseDataS : "Healing",    levelN : 1, enhancementsA: [] },
				{ baseDataS : "ScaleTorso", levelN : 3, enhancementsA: [], equippedB : true },
                { baseDataS : "ScaleLegs", levelN : 3, enhancementsA: [], equippedB : true },
        ],
	/*
	//				item3   :  { baseDataS : "PlateTorso", levelN : 3, enhancementsA: [] }, 
	//				item4   :  { baseDataS : "PlateLegs", levelN : 3, enhancementsA: [] }, 
	//				item5   :  { baseDataS : "HelmetFull", levelN : 1, enhancementsA: [], equippedB : true }, 
	//				item6   :  { baseDataS : "HelmetHalf", levelN : 1, enhancementsA: [] }, 
	//				item7   :  { baseDataS : "HoodLeather", levelN : 1, enhancementsA: [] }, 
	//				item8   :  { baseDataS : "HatCloth", levelN : 1, enhancementsA: [] }, 
	//				item9   :  { baseDataS : "LeatherTorso", levelN : 1, enhancementsA: [] }, 
	//				item10   :  { baseDataS : "LeatherLegs", levelN : 1, enhancementsA: [] }, 
	//				item11   :  { baseDataS : "ClothTorso", levelN : 1, enhancementsA: [] }, 
	//				item12   :  { baseDataS : "ClothLegs", levelN : 1, enhancementsA: [] }, 
	//				item13   :  { baseDataS : "ChainTorso", levelN : 1, enhancementsA: [] }, 
	//				item14   :  { baseDataS : "ChainLegs", levelN : 1, enhancementsA: [] }, 
	//				{ baseDataS : "MagicBarrier", levelN : 1, enhancementsA : { { flavorS : "fire", seconds : 5, dps : 1 } } },
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

		Rogue:
        [
				{ baseDataS : "Crossbow",   levelN : 3, enhancementsA: [], slotN : 1 },//// enhancementsA : { { flavorS : "explosive", seconds : 0, dps : 10 } } }, 
	//			item1   : { baseDataS : "Longbow",   levelN : 3, enhancementsA: [], slotN : 1 },//// enhancementsA : { { flavorS : "explosive", seconds : 0, dps : 10 } } }, 
				////	}, //  enhancementsA : {  { flavorS : "cold", seconds : 1, dps : 5 } } },
				{ baseDataS : "Shortsword", levelN : 3, enhancementsA: [], slotN : 2 }, 
				{ baseDataS : "Healing",    levelN : 1, enhancementsA: [] },
				{ baseDataS : "LeatherTorso", levelN : 3, enhancementsA: [], equippedB : true },
				{ baseDataS : "LeatherLegs", levelN : 3, enhancementsA: [], equippedB : true },
				{ baseDataS : "MagicSprint", levelN : 3, enhancementsA: [], slotN : 3 },
				//item7   : { baseDataS : "DaggersDual",   levelN : 1, slotN : 4, enhancementsA : [ { flavorS : "fire", levelN: 1 }, { flavorS: "cold", levelN: 1} ] }, 
        ],
		Mage:
		[
				{ baseDataS : "Staff",     levelN : 3, enhancementsA: [], slotN : 1 },
				{ baseDataS : "MagicBolt", levelN : 3, enhancementsA: [], slotN : 2 },
	//			{ baseDataS : "MagicBolt", levelN : 1, enhancementsA: [ { flavorS: "explosive", levelN: 1 }, { flavorS: "fire", levelN: 1} ], slotN : 2 },
				{ baseDataS : "Healing",   levelN : 1, enhancementsA: [] },
				{ baseDataS : "Mana",      levelN : 1, enhancementsA: [] },
				{ baseDataS : "ClothTorso", levelN : 3, enhancementsA: [], equippedB : true },
				{ baseDataS : "ClothLegs", levelN : 3, enhancementsA: [], equippedB : true },
        ],
		Barbarian:
		[
            { baseDataS : "Axe",      levelN : 2, enhancementsA : [ { flavorS : "explosive", levelN : 1 } ], slotN : 1 },
            { baseDataS : "Healing",   levelN : 1, enhancementsA: [] },
            { baseDataS : "LeatherTorso", levelN : 1, enhancementsA: [], equippedB : true },
            { baseDataS : "LeatherLegs", levelN : 1, enhancementsA: [], equippedB : true },
        ],		
		Priest:
		[
            { baseDataS : "Mace",         levelN : 1, enhancementsA: [ { flavorS : "radiant", levelN : 1 } ], slotN : 1 }, 
            { baseDataS : "MagicHealing", levelN : 1, enhancementsA: [], slotN : 2 },
            { baseDataS : "ChainTorso", levelN : 2, enhancementsA: [], equippedB : true },
            { baseDataS : "ChainLegs", levelN : 2, enhancementsA: [], equippedB : true },
        ],
        // monsters
        CrystalDaemonSuper:
        [
            { baseDataS : "Greatsword", levelN : 1, enhancementsA : [ { flavorS : "cold", levelN : 4 } ], slotN : 1 },
            { baseDataS : "MonsterSprint", levelN : 1, enhancementsA : [], slotN : 2 },
        ],
        Werewolf:
        [
            { baseDataS : "ClawsWerewolf", levelN : 1, enhancementsA : [], slotN : 1 },
            { baseDataS : "TransformWerewolf", levelN : 1, enhancementsA : [], slotN : 2 },
        ]
    }
}