// stuff can be stuff
// todo:
//   award xp - check
//   make sure things that are taken into account in original balance system are still dealt with - I did those things for a reason
//      more monsters means start lower level - check
//      deeper in the dungeon is harder - check
//   adjust xp award depending on how much damage monster does - check

//   award xp for time passing  -- not sure it's necessary
//   award xp for heroes doing damage to structures - definitely exit, other things as well?  -- might make the skill importance of building structures worse

//   detect hero express

//   take skill into account - players who haven't been playing long should get bonuses

import { Teams, Workspace, Players } from "@rbxts/services";
import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI( 'Executed', script.Name )

import { BalanceData } from "ReplicatedStorage/TS/BalanceDataTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS"

import { PlayerServer } from "./PlayerServer";

import { MonsterDatumI } from "ReplicatedStorage/TS/MonsterDatum";
import { HeroServer } from "ServerStorage/TS/HeroServer"
import MathXL from "ReplicatedStorage/Standard/MathXL";

interface MonsterPlayerInfo
{
    heroMatch?: Hero           // what hero I chose to be balanced against
    damageDoneThisSpawn: number
    startingLevel: number 
    xpLevel: number   // no real reason to have separate variables except legacy
}

export namespace MonsterServer
{
    const monsterInfos = new Map<Player, MonsterPlayerInfo>()
    let lastTick = tick()

    const Heroes = Teams.FindFirstChild<Team>('Heroes')!
    const monsterTeam = Teams.FindFirstChild<Team>("Monsters")!


    function getMonsterInfo( player: Player )
    {
        let monsterInfo = monsterInfos.get( player )
        if( !monsterInfo ) 
        {
            monsterInfo = { heroMatch: undefined, damageDoneThisSpawn: 0, startingLevel: 1, xpLevel: 0 }
            monsterInfos.set( player, monsterInfo )
        }
        return monsterInfo
    }

    export function determineBossSpawnLevel( monsterDatum: MonsterDatumI )
    {
        let monsterLevel = 1

        const totalHeroLocalLevels = HeroServer.getTotalHeroEffectiveLocalLevels()
        DebugXL.logI( 'Gameplay', "Average hero level for boss difficulty calc: "+totalHeroLocalLevels)
        if( monsterDatum.tagsT.Boss )
        {
            monsterLevel = math.floor( totalHeroLocalLevels * 0.4 )  // 0.4 to 0.8
        }
        else
        {
            assert( monsterDatum.tagsT.Superboss )
            monsterLevel = math.floor( totalHeroLocalLevels * 0.8 ) // 0.8 to 1.2
        }

        return monsterLevel    
    }

    function determineMonsterSpawnLevelForHero( underwhelmedHero: Hero, numMonsters: number ) {
        const startingLevel = underwhelmedHero.getLocalLevel() 
        DebugXL.logI( 'Gameplay', "Hero level: "+startingLevel )

        const monsterTeam = Teams.FindFirstChild<Team>("Monsters")!
        const numHeroes = Heroes.GetPlayers().size()
        DebugXL.logI( 'Gameplay', "Hero level: "+startingLevel )

        const dungeonDepthObj = Workspace.FindFirstChild('GameManagement')!.FindFirstChild('DungeonDepth') as NumberValue
        // floor difficulty was 0.1 before 8/22. I'm pretty sure that's too low, but testing a wider spread anyhow to be sure
        // 0.1666 as of 9/3
        const dungeonFloorDifficultyK = BalanceData.dungeonFloorDifficultyK // GameplayTestService.getServerTestGroup( 'FloorDifficulty' ) * 0.0333 + 0.0666  
        const dungeonFloorDifficulty = dungeonDepthObj.Value * dungeonFloorDifficultyK + 1
        DebugXL.logI( 'Gameplay', `dungeonFloorDifficulty is ${dungeonFloorDifficulty} for ${dungeonFloorDifficultyK}` )

        // a level 1 hero should be able to take about 3 level 1 monsters and then some (because they respawn)

        // let's say that level 1 monsters are matched to 
        // not doing the effectiveStartingLevel thing - it would make sense if monsters were matched to characters but it doesn't, level 1 monsters are much weaker.
        // if a level 1 character has to be able to beat 3 level 1 monsters, then a level 8 character needs to be faced by 3 level 8 monsters - hence the *3, but there's
        // some wiggle room because monsters will level up
        const effectiveStartingLevel = startingLevel + BalanceData.effective0LevelStrength
        DebugXL.logI( 'Gameplay', "Effective starting level "+effectiveStartingLevel )

        // a factoid:  more monsters is harder than fewer monsters not just for outnumbering purposes but because it means less time from monster -> hero; a 9 player game is
        // a lot harder for the heroes than a 3 player game even though the outnumber is still 2-1. 
        // so starting level should be even lower in a 3 vs 6 than in a 1 vs 2.  If 1 vs 2 is a 0.5 rating, then 3 vs 6 should be... (0.5 + 0.16) / 2? 

        // it's not as simple as numHeroes / numMonsters -
        // 1 on 1 is theoretically easier for the hero because the time the monster spends looking for the hero is increased
        // but the monsters just seem way too hard at that level.  So I'm no longer
        //       monsters: 1     2     3     4     5     6     7
        //  heroes:  1     1     .5    .33   .25   .2  
        //  heroes:  2     1.5   .75   .5    
        //  heroes:  3     2     1     .66   .5
        // const outnumberedFactor = ( ( numHeroes + 1 ) / numMonsters ) / 2    // averaging in reciprocal
        const outnumberedFactor = numHeroes / numMonsters  
        const calculatedLevel = math.max( 1, math.floor( effectiveStartingLevel * dungeonFloorDifficulty * outnumberedFactor * BalanceData.monsterStartingLevelFactor - 1 ))  
        return calculatedLevel
    }

    export function determineMobSpawnLevel( mobCap: number )
    {
        if( Heroes.GetPlayers().size()<=0 ) {
            return 1
        }
        // choose a random hero to match
        const heroes: Array<Hero> = []
        PlayerServer.getCharacterRecords().forEach( (c)=> { if( c instanceof Hero) heroes.push(c as Hero) } )  
        const myHero = heroes[ MathXL.RandomInteger(0, heroes.size()-1) ]
        return determineMonsterSpawnLevelForHero( myHero, mobCap )
    }

    // unlike heroes who are in a way starting at a highish level with their 1st level characters and then incrementally improving,
    // a level 2 monsters is pretty much twice as tough as a level 1 monster and so on; so we add effective0LevelStrength to player
    // level to get a toughness factor but don't subtract after running our difficulty calcs because that's how players work, not monsters
    export function determineMonsterSpawnLevel( player: Player )
    {
        DebugXL.logV( 'Gameplay', "Determining spawn level for "+player.Name )
        const monsterInfo = getMonsterInfo( player )
        const heroForMonster = monsterInfo.heroMatch
        let startingLevel = monsterInfo.startingLevel
        // wishlist fix - this is where we could detect if a new hero has been added to mix via hero express or late add
        if( !startingLevel || !heroForMonster || !PlayerServer.pcExists( heroForMonster ) )  // means once your target hero dies you get assigned a new one and you're matched at their existing level
        {
            // we are on the server so we should be able to just use pcdata without consulting team stats and without worrying about latency
            // find heroes who still exist ATM
            const heroes: Array<Hero> = []
            PlayerServer.getCharacterRecords().forEach( (c)=> { if( c instanceof Hero) heroes.push(c as Hero) } )  
            DebugXL.logI( 'Gameplay', "Matching hero and monster: " + heroes.size() + " hero records found" )
            if( heroes.size()>0 ) 
            {
                const numMonstersToEachHero = heroes.map( (hero) => monsterInfos.values().filter( ( v )=> v.heroMatch===hero ).size() )
                let minMonsters = math.huge
                let underwhelmedHeroIdx = -1
                for( let i=0; i<numMonstersToEachHero.size(); i++ )
                {
                    if( numMonstersToEachHero[i] < minMonsters )
                    {
                        minMonsters = numMonstersToEachHero[i]
                        underwhelmedHeroIdx = i
                    }
                }

                const underwhelmedHero = heroes[underwhelmedHeroIdx]            
                DebugXL.logV( 'Gameplay', "Matching hero to monster "+player.Name )
                monsterInfo.heroMatch = underwhelmedHero
               
                monsterInfo.startingLevel = determineMonsterSpawnLevelForHero( underwhelmedHero, monsterTeam.GetPlayers().size() ) // should we count dungeon lords or not?  let's say yes, because they'll be a threat before level is over
            }
            DebugXL.logI( 'Gameplay', "Level "+startingLevel)
            return startingLevel
        }
        else
        {
            // we've already got our assignment, in which case we level up depending on how much experience we've earned
            // starting guess rule-of-thumb; monsters should level up +1 once they've died ~n times, where n===number of monsters
            // it's not clear that lower level monsters should level faster than higher level monsters
            // it would be nice if it's offset rather than all monsters level at once
            const level = math.floor( monsterInfo.startingLevel + monsterInfo.xpLevel )
            //DebugXL.logI( 'Gameplay', "Monster xp: "+ monsterInfo.xpLevel +" + starting level "+monsterInfo.startingLevel+" equals Level "+level)
            return level

            // we have two competing interests when a monster dies on how much to level up the monster difficulty
            // is that monster cross-teaming?  just dying to let the hero have XP?  
            // is that monster a crappy player?  simply unable to land a hit?
            // it will be hard to tell the difference unless we look at their hit rate
            // what mitigates cross-teaming is that the whole monster *team* gets XP, unlike with Dungeon Points
            // 
        }
    }

    export function resetLevelBalancer()
    {
        monsterInfos.clear()
        lastTick = tick()
    }

    export function awardTeamXPForTimeElapsed()
    {
        const thisTick = tick()
        const elapsedTicks = thisTick - lastTick
        const heroLevelSum = PlayerServer.getCharacterRecords().values().map( (pcdata)=>
        {
            const result = (pcdata instanceof Hero) ? pcdata.getLocalLevel() + BalanceData.effective0LevelStrength : 0
            return result 
        } ).reduce( (a,b)=> a+b
        , 0 )
        // at 0.05 in a 1 vs 1 against a level 1 hero, you will level up after 1.5 minutes or so
        // was 0.15 before 8/22 - BalanceData.monsterLevelTimeXPFactor
        const monsterLevelTimeXPFactor = 0.1 // ( GameplayTestService.getServerTestGroup( 'MonsterLevelUpForTime' )+1 ) * 0.05

        const monsterIndividualXP = heroLevelSum * elapsedTicks * monsterLevelTimeXPFactor  / 60 / monsterTeam.GetPlayers().size()
        monsterInfos.forEach( mpi => mpi.xpLevel += monsterIndividualXP )
        lastTick = thisTick
    }

    export function awardTeamXPForMonsterKill( monsterPlayer: Player )
    {
        const monsterInfo = getMonsterInfo( monsterPlayer )
        // we're ignoring potions here but that should more or less factor out
        const monsterTeam = Teams.FindFirstChild<Team>("Monsters")!
        let heroHealthSum = 0
        let heroLevelSum = 0
        Heroes.GetPlayers().forEach( heroPlayer => 
        {
            const pc = heroPlayer.Character
            if( pc )
            {
                const humanoid = pc.FindFirstChild<Humanoid>("Humanoid")
                if( humanoid )
                {
                    heroHealthSum += humanoid.MaxHealth
                    const heroLevel = PlayerServer.getLocalLevel( PlayerServer.getCharacterKeyFromPlayer( heroPlayer ) )
                    if( heroLevel )
                        heroLevelSum += heroLevel + BalanceData.effective0LevelStrength  // monster level; it's what we want rather than getLocalLevel
                }
            }
        })
        
        // let damagePct = monsterInfo.damageDoneThisSpawn / heroHealthSum
        // // "an average lone monster should be able to do 50% damage to the heroes" (because there are health potions)
        // // so if damage is 0 we level up the most, (100%)  (1-0) => 1
        // // if damage is 50 we level up just a little (50%?)  (1-.25) => 0.5  -- we want the leveling to be visible, and we're dividing by # of monsters 
        // // if damage is 100 we level up almost none (0%)
        // // but we always want to level up *some*
        // // so 
        // // 100% left, level up 1 / number of monsters
        // // 
        // let monsterXPRateK = 2  
        // let monsterTeamXP = ( 1 - damagePct ) * monsterXPRateK / monsterTeam.GetPlayers().size()   // at ** 8 -> 0.
        const pctDamageDone = monsterInfo.damageDoneThisSpawn / heroHealthSum
        // was 0.25 before 8/22; people were complaining about how fast monsters level so trying a spread, don't know how much is time and how much is diff though
        const difficultyFactor = 0.3 // ( GameplayTestService.getServerTestGroup('MonsterLevelUpForKill') + 1 ) * 0.08
        warn( `difficulty factor ${difficultyFactor}` )
        const scary = heroLevelSum * ( 1 - pctDamageDone ) * difficultyFactor
        const monsterIndividualXP = scary / monsterTeam.GetPlayers().size()
        // result: we level up faster the higher level the heroes are
        // a single level 1 hero has 74 + localLevel * 8 + this.getAdjBaseStat( "conN", heldToolInst ) * 6 or 82+60 = 142 health, 10th level probably more like 220 + 90 or 300
        // let's see how that goes

        monsterInfos.forEach( mpi => mpi.xpLevel += monsterIndividualXP )

        DebugXL.logI( 'Gameplay', "Monster team xp. Damage "+monsterInfo.damageDoneThisSpawn+" of "+heroHealthSum+". New value "+monsterIndividualXP )
        monsterInfo.damageDoneThisSpawn = 0
    }

    export function recordMonsterDamageDone( monsterPlayer: Player, amount: number )
    {
        const monsterInfo = getMonsterInfo( monsterPlayer )
        monsterInfo.damageDoneThisSpawn += amount
        //DebugXL.logI( 'Gameplay', "Monster did "+amount+" damage" )
    }
}