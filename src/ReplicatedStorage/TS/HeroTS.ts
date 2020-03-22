import { Workspace, Teams } from "@rbxts/services";

import { HeroStatBlockI, CharacterClasses } from "./CharacterClasses"
import { HeroI } from "./HeroClassesTS"
import { FlexTool } from "./FlexToolTS";
import { ToolData } from "./ToolDataTS"
import { ObjectXL } from "./ObjectXLTS"
import { CharacterRecord, GearPool } from "./CharacterRecord"
import { Enhancements } from "./EnhancementsTS";
import { DebugXL } from "./DebugXLTS";


let nerfTest = 100000  // test nerfing to this level


export class Hero extends CharacterRecord implements HeroI
{   
    static readonly globalHeroLevelCap = 70

    static readonly xpForLevelMultiplier = 1.5

    // now the servers cap levels
    // static readonly levelCapN = 15

    // public idS: string
    // public readableNameS: string
    // public imageId: string
    // public walkSpeedN: number
    // public jumpPowerN: number
    public statsT: HeroStatBlockI

    protected shopT: { [k:string]: FlexTool } | undefined   // was technically defined as a map before but they way it was implemented was thus so it will work without needing to add new constructor to GearPool
    public lastShopResetOsTime = 0 
    public lastShopResetLevel = 0
    public currentSlot = -1

    public shopPool: GearPool = new GearPool({})
   
    constructor( heroId: string, stats: HeroStatBlockI, startingItems: FlexTool[] )
    {
        super( heroId, 
            //heroPrototype.imageId, 
            //heroPrototype.walkSpeedN, 
            //heroPrototype.jumpPowerN, 
            startingItems )
        this.statsT = ObjectXL.clone( stats )
    }        

    static convertFromPersistent( rawHeroData: HeroI, storageVersion: number )
    {
        // at first I was thinking leave the persistent data in the old format when I created these item pools, but then it seemed
        // more likely there would be bugs if I was constantly converting back and forth
        let hero = setmetatable( rawHeroData, Hero as LuaMetatable<HeroI> ) as Hero
        if( !hero.gearPool )
        {
            DebugXL.Assert( storageVersion < 4 )
            DebugXL.Assert( hero.itemsT !== undefined )  
            if( hero.itemsT )          
            {
                hero.gearPool = new GearPool( hero.itemsT )
                hero.itemsT = undefined
            }
        }
        else
        {
            setmetatable( hero.gearPool, GearPool as LuaMetatable<GearPool> )
            hero.gearPool.forEach( item => FlexTool.objectify( item ) )
        }

        if( !hero.shopPool )
        {
            DebugXL.Assert( storageVersion < 4 )
            DebugXL.Assert( hero.shopT !== undefined )  
            if( hero.shopT )          
            {
                hero.shopPool = new GearPool( hero.shopT )
                hero.shopT = undefined
            }
            else
            {
                // somehow this is possible
                hero.shopPool = new GearPool({})
            }
        }
        else
        {
            setmetatable( hero.shopPool, GearPool as LuaMetatable<GearPool> )
            hero.shopPool.forEach( item => FlexTool.objectify( item ) ) 
        }
        if( !hero.statsT.goldN )
        {
            hero.statsT.goldN = 0
        }

        return hero
    }

    static convertFromRemote( rawHeroData: HeroI )
    {
        let hero = setmetatable( rawHeroData, Hero as LuaMetatable<HeroI> ) as Hero
        DebugXL.Assert( hero.itemsT === undefined )
        setmetatable( hero.gearPool, GearPool as LuaMetatable<GearPool> )
        setmetatable( hero.shopPool, GearPool as LuaMetatable<GearPool> )
        hero.gearPool.forEach( item => FlexTool.objectify( item ) )
        hero.shopPool.forEach( item => FlexTool.objectify( item ) )

        return hero
    }
    

    static levelForExperience( xp: number )
    {
        let levelN  = ( ( math.floor( xp / 100 ) / Hero.xpForLevelMultiplier + 1 ) ** ( 1 / 2.9 ) - 1 ) * 3 + 1
        levelN = math.floor( levelN )
        levelN = math.min( Hero.globalHeroLevelCap, levelN )
        return levelN
    }

    // you can think of the exponent as how much we fuck later players but you could also think of it as how much we make it
    // easier on new players
    static totalExperienceForLevel( level: number )
    {
        let xp = ( math.ceil( ( ( ( ( level - 1 ) / 3 + 1 ) ** 2.9 ) - 1 ) * Hero.xpForLevelMultiplier ) * 100 )
        return xp
    }

    static experienceDeltaForNextLevel( level: number )
    {
        return Hero.totalExperienceForLevel( level + 1 ) - Hero.totalExperienceForLevel( level )
    }

    static experienceFromLastLevel( experience: number )
    {
        return experience - Hero.totalExperienceForLevel( Hero.levelForExperience( experience ) )
    }

    static experienceFromLastLevelToNext( experienceN: number )
    {
        return Hero.experienceDeltaForNextLevel( Hero.levelForExperience( experienceN ) )
    }

    getTeam()
    {
        return Teams.FindFirstChild<Team>('Heroes')!
    }

    updateStoredData( oldVersion: number, newVersion: number, player: Player )
    {
        // this was an adjustment from 11/7
        // so that players who had been playing past max level would still have something to do once we added the level 20 server
        if( !oldVersion || ( oldVersion <= 1 ) )
        {
           this.statsT.experienceN = math.min( this.statsT.experienceN, Hero.totalExperienceForLevel( 15 ) )
        }
        
        //-- only later did I smack myself on the forehead and ask why don't all tools have empty enhancementsA arrays
        let itemPool = this.gearPool
        this.gearPool.forEach( function( flexToolInst, k)
        {
            //-- you may have an obsolete item; a lot of players are rocking HelmetWinged's
            if( flexToolInst.baseDataS === "MonsterSprint" || !ToolData.dataT[ flexToolInst.baseDataS ] )
            {
                itemPool.delete( k )
                warn( player.Name+" had nonexistent item "+flexToolInst.baseDataS+". Removing." )
            }
            else
            {
                if( ToolData.dataT[ flexToolInst.baseDataS ].dropLikelihoodN <= 0 )
                    DebugXL.Error( "Player has drop likelihood 0 item " + flexToolInst.baseDataS )

                if( !flexToolInst.enhancementsA )
                    flexToolInst.enhancementsA = []
                
                // later updated so every enhancement had to have a level
                flexToolInst.enhancementsA.forEach( enhance => {
                    if( !enhance.levelN )
                    {
                        warn( player.Name+" had obsolete "+enhance.flavorS+". Updating.")
                        enhance.levelN = 1
                    }
                });
            }
        } )

        if( !this.lastShopResetOsTime )
            this.lastShopResetOsTime = 0
        if( !this.lastShopResetLevel )
            this.lastShopResetLevel = 0

    }

    getActualLevel()
    {
        return Hero.levelForExperience( this.statsT.experienceN )
    }

    // overrides abstract
    getLocalLevel()
    {
        //return this.getActualLevel()  // nerfing disabled 
        return math.min( this.getActualLevel(), Hero.getCurrentMaxHeroLevel(), nerfTest )
    }

    private getStatBonus(stat: string, heldToolInst: FlexTool | undefined, ignoreEquipSlot?: ToolData.EquipSlotEnum ) {
        let bonusSum = 0;
        this.gearPool.forEach(function (item) {
            if( item.equippedB )
            {
                if( item.getEquipSlot() !== ignoreEquipSlot )
                {
                    let statEnhances = item.enhancementsA.filter(enhancement => enhancement.flavorS + "N" === stat);
                    // going to use actual level instead of local level here because partial numbers for increases don't make super sense
                    // it makes stat boosting equipment fairly powerful
                    // also easier to process
                    let bonuses = statEnhances.map( enhance => Enhancements.enhancementFlavorInfos[ enhance.flavorS ].effectFunc!( enhance.levelN ) )
                    bonuses.forEach( bonus => bonusSum += bonus )
                }
            }
        });
        if (heldToolInst) {
            let statEnhances = heldToolInst.enhancementsA.filter(enhancement => enhancement.flavorS + "N" === stat);
            let bonuses = statEnhances.map( enhance => Enhancements.enhancementFlavorInfos[ enhance.flavorS ].effectFunc!( enhance.levelN ) )
            bonuses.forEach( bonus => bonusSum += bonus )
        }
        return bonusSum;
    }

    getActualAdjBaseStat( stat: string, ignoreEquipSlot?: ToolData.EquipSlotEnum )
    {
        let statN = this.statsT[ stat ]
       
        let bonus = this.getStatBonus(stat, undefined, ignoreEquipSlot);
 
        return statN + bonus
    }


    getAdjBaseStat( stat: string, heldToolInst?: FlexTool )
    {
        // adjust for max level
        let statN = this.statsT[ stat ]
        let placeLevelCap = Hero.getCurrentMaxHeroLevel()
        if( this.getActualLevel() > placeLevelCap ) 
        {
            let statsT = CharacterClasses.heroStartingStats[ this.idS ]
            DebugXL.Assert( statsT !== undefined )
            if( statsT )
            {
                let originalBaseStat = statsT[ stat ]
                statN = math.floor( ( statN - originalBaseStat ) * placeLevelCap / this.getActualLevel() + originalBaseStat )
            }
        }

        let bonus = this.getStatBonus(stat, heldToolInst)

        return statN + bonus
            
    }

    getTotalDefense( attackType: string )
    {
        let sum = 0
        let actualLevel = this.getActualLevel()
        this.gearPool.forEach( function( equip, k )
        {
            if( equip.equippedB )
            {
                sum = sum + equip.getHeroDefense( attackType, actualLevel, Hero.getCurrentMaxHeroLevel() )   // actual level is the difference from PC version
            }
        } )
        return sum
    }
 
    getMaxMana( heldToolInst: FlexTool )
    {
        return this.getAdjBaseStat( "willN", heldToolInst ) * 6
    }

    getMaxHealth( heldToolInst: FlexTool )
    {
        let localLevel = math.min( this.getActualLevel(), Hero.getCurrentMaxHeroLevel() )
        return math.floor( 74 + localLevel * 8 / 3 + this.getAdjBaseStat( "conN", heldToolInst ) * 6 )//HeroUtility:GetAdjBaseStat( pcData, "conN", heldToolInst ) * 6
    }
    // -- 8/21/18: dividing by 3 because level is multiplied by 3
    //-- 11/25:  changing health / stat point back to 4 - my reasoning is pointing points into health has a much bigger effect on your bottom line than putting
    //  into other stats, because it affects not only the highest level thing you can hold but also gives a much larger + increase on combat ratio 
    //  (you can last 4 times as long by putting all your points into health, but you can only kill marginally faster by putting all your points into another stat)
    //-- 10/30;  +50% health and damage for everyone
    //-- 11/28;  making a tough nerf that I did once before and backed out of because scary ratings happened that were probably entirely unrelated to the nerf
    //           but I kept the starting hp the same by going from 54 - 74


    // every hero has their own shop
    getShopItems()
    {
        return this.shopPool.makeSortedList()
    }

    static getCurrentMaxHeroLevel()
    {
        let currentMaxHeroLevelNumberValue = Workspace.FindFirstChild('GameManagement')!.FindFirstChild<NumberValue>('CurrentMaxHeroLevel')!
        return currentMaxHeroLevelNumberValue.Value 
    }
}
