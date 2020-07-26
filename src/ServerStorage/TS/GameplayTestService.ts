import { Analytics } from "./Analytics"

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
import { TestGroups, TestInfoHolder } from "ReplicatedStorage/TS/GameplayTestUtility"

import * as MathXL from "ReplicatedStorage/Standard/MathXL"


export interface TestGroupInfo {
    name: string
    values: number
    locked?: number
}

export namespace GameplayTestService {

    let serverTestGroupData: {name:string, values:number}[] = 
    [
        /*{
            name: "NumDungeonLevels2",
            values: 6                        // anywhere from 2-7 levels total. For retention, 2 levels or 4 levels looks ideal (alpha 0.003!); for some reason 3 is not great. Saw a weird even-odd thing; 4 had the longest session length 
        },
        // these results for NumDungeonLevels2 are all significant: had to choose between playtime and satisfaction and went with satisfaction.
Number of levels per session	Average rating	Percent retention	Average first session length
2	2.898203593	0.032332564	615.3287671
3	2.928571429	0.012867647	562.442404
4	2.768518519	0.028089888	691.8924435
5	2.922824302	0.011827321	616.2696156
6	2.775656325	0.021718602	679.813617
7	2.71350365	0.011675824	669.9092559


        {  // no statistical difference on any metric
            name: "FixedWinterCastle",
            values: 2
        },
        {
            name: "EndlessLeveling",  
            // without rating mean 2.6, with 2.9, t stat -2.2; 1.6% retention with, .2% without?!? It seems like something must have broken in the non-endless one but I didn't see anything obvious
            // also 650 seconds vs 625 seconds though strangely 10x the number of samples : presumably because people are playing longer. Maybe outliers keep it going
            values: 2
        },
        {
            name: "LevelSpread",
            values: 5  // let's try anywhere from 4-8;
            // as of 8/28 - first impressions best for 3. vs 2 20% chance but versus other stats less
            // 0 dramatically improves retention, twice as good as other categories, chisq of 8.60391E-05
            // 0 also improves session length (667,573,559,530,594) - alpha easily 0.05 comparing 667 to 530
            // I thought about testing still lower levels but I don't want to alienate long-term players any more than that.
            // 8's a nice even number
        },*/
/*        {
            // it was clear that 4 was crazy
            name: "MonsterLevelUpForTime",   // when looking at juxtaposed with monsterdifficulty it appeared that 1 was a good bet; when looked at independently it was hard to tell
            values: 4
        }, 
        {
            // it was clear that 4 was crazy
            name: "MonsterLevelUpForKill",  // when looking at juxtaposed with monsterdifficulty it appeared that 3 was a good bet; when looked at independently it was hard to tell
            // additional notes: 11/2 - it's become part of the strategy to not kill the monsters, which is weird
            values: 4
        },*/
        /*
        {
            name: "ChestTrapDamage",  // for first impression, close to being 15% significant; 2.75/2.85/2.67/2.71/2.78; for retention not significant but 1 was good there too
            values: 5                  // for session length, close to being 15% significant; 572/586/568/624/579. #1 is best for ratings; #3 is best for session length, retention the same. 
        }        
        // by making these spreads might be able to spot trends that we couldn't if it was 0.5, 1, 1.5.  In general I think I want 0.33, 0.66, 1, 1.33, 1.66
        {
            // note to self - balance mechanics changed on 8/24, so we should probably filter >= 8/25 to get an idea of proper difficulty
            // another note to self - the chart of floor/monster difficulty to session length is interesting
            name: "FloorDifficulty",
            values: 7  // increased the dimension on 8/29, so that's where measurement needs to be done.  Significant differents in session lengths on 9/2 at noon; ratings differences not significant. 
            // 
        },
        {
            name: "MonsterDifficulty",
            values: 7
        },
        // decided on monsterdifficulty 1 and floordifficulty 3 - there was another weird sweet spot later but with a low sample size.
        // that said, I'd prefer the weaker monsters, and this goes with the monsterlevelup choices I made better
        {
            name: "HeroBossScrew2",
            values: 2
        },
        {
            name: "DynamicSuperbossDifficulty",
            values: 2
        },
        {
            name: "BossDifficultyFactor3",    
            // ratings: 2.74, 2.74, 2.78, 2.76, 2.81
            // session lengths: 554, 561, 564, 535, 554
            // retention: 4.1%, 3.0%, 2.8%, 3.5%, 3.2%
            values: 5
        },
        {
            name: "SuperbossDifficultyFactor3",
            // ratings: 2.76, 2.77, 2.77, 2.77, 2.75
            // lengths: 556, 569, 547, 560, 529
            // retention: 4.2%, 3.7%, 3.1%, 3.0%, 2.6%
            values: 5
        },
        {
            name: "Crits",  // ratings: 2.77 vs 2.82, lengths: 573 vs 543 :(, retention: no effect
            values: 2
        },        
        {
            name: "StructureHealthMultiplier",
            values: 5  // the lowest setting was popular.
            // ratings: 2.84, 2.69, 2.60, 2.82, 2.64
            // lengths: 479, 550, 514, 583, 588
            // retentions: 0.03, 0.03, 0.01, 0.02, 0.03 (not significant)
            // went with 0 though shorter sessions and might mean barriers/ fences underpowered (people were still using them though...)
        }*/
    ]

    let playerTestGroupData = 
    [
/*        {
            name: "FreeHeroExpress",
            values: 2,
            locked: 1   // concluded that it might help - seemed significant with rankings, not so much with time played or retention, though it looked promising at first
        },
        {
            name: "DelayButtonReveal",
            values: 2,
            locked: 0   // concluded that it didn't help and might actually make things worse. surprising
        },
        {
            name: "DelayButtonReveal2",
            values: 2
        },
        {
            name: "InitialDailyAward",  // rated higher alpha 30%, retained alpha 5%
            values: 2
        },
        {
            name: "InstantHeroExpress",  // almost no effect on any metric; made retention worse p 6%
            values: 2,
        },
        {
            name: "DelayPlaceButtonReveal",  // this one really did help initial session length so finally got there
            values: 2
        },
        {
            name: "ClassesLocked",
            values: 3  // 0: nothing locked; 1: mage locked; 2: rogue locked
        }
        {
            name: "PremiumClasses",
            values: 2
        },   // locking out the classes, even when we made premiumclasses play to win rather than pay to win, made the game worse.  Premium classes didn't seem to help 
        {
            name: "ClickyPotions",
            values: 2
        },   // made it worse for some reason 
        {
            name: "JuicyButtons",  // .05 higher rating alpha 30%, but chisq mysteriously lower retention (10% alpha) so better cancel
            values: 2
        },*/
               /* {
            name: "ServerSwitchInvites",  // nonsignificant but makes less sense now that we have endless leveling
            values: 2
        },
        {
            name: "FreeGearSlots",  // hard to believe but no significant effect, retention marginally up, session length/ratings marginally down
            values: 2               
        },
        {
            name: "XPRate",   // no significant effect on retention or first impression or last impression or average impression (1 was marginally higher though)
            values: 4         // or first session length! Jeez.  
            // But a value of 2 had a 20% ish longer total time than 0 or 3...not super significant but probably means we should keep it at 2
        },
        {
            name: "XPWraps",  // no significant effect on total time or in first impression or retention (30%)
            values: 2
        }
/*        {
            name: "TutorialVoiceover",  // rated higher: 10% alpha, and when filtered for English practically DOUBLE retention!
            values: 2
        }*/
        {
            name: "NoDifferenceA",  // 8/9 star rating: for 520 df t of -6 (alpha of over 0.5); 5 second diff in session length; eyeballing retention looked the same
            values: 2
        },

    ]

    let testGroups = new Map<Player,TestGroups>()
    let serverTestGroups: TestGroups = new Map<string,number>()

    export function playerAdded( player: Player, testInfoHolder: TestInfoHolder  ) {
        if( !testInfoHolder.testGroups ) {
            // choose test groups for new player
            testInfoHolder.testGroups = new Map<string,number>()
        }
        let existingGroups = testInfoHolder.testGroups
        for( let testGroup of playerTestGroupData ) {
            if( !existingGroups.has( testGroup.name ) ) {
                let value = MathXL.RandomInteger( 0, testGroup.values-1 )
                existingGroups.set( testGroup.name, value )
                Analytics.ReportEvent( player, "AssignTestGroup", testGroup.name, "", value )
            }
        }
    }

    for( let testGroup of serverTestGroupData ) {
        let value = MathXL.RandomInteger( 0, testGroup.values-1 )
        serverTestGroups.set( testGroup.name, value )
        Analytics.ReportServerEvent( "ServerTestGroup", testGroup.name, "", value )
    }

    export function getServerTestGroup( testGroup: string ) {
        let result = serverTestGroups.get( testGroup )
        DebugXL.Assert( result !== undefined )
        return result ? result : 0
    }

    export function getServerTestGroups() { 
        return serverTestGroups
    }

    export function setServerTestGroup( testGroup: string, newValue: number ) {
        // for debugging only
        DebugXL.Assert( serverTestGroups.has( testGroup ) )
        serverTestGroups.set( testGroup, newValue )
    }
}