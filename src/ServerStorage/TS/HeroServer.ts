
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI('Executed', script.Name)

import * as GameAnalyticsServer from "ServerStorage/Standard/GameAnalyticsServer"
import * as Inventory from "ServerStorage/Standard/InventoryModule"

import { BadgeService, Teams, Workspace, Players } from "@rbxts/services";

import * as HeroUtility from "ReplicatedStorage/Standard/HeroUtility"
import * as MathXL from "ReplicatedStorage/Standard/MathXL"

import { Analytics } from "ServerStorage/TS/Analytics"
import { RandomGear } from "ServerStorage/TS/RandomGear"

import { BalanceData } from "ReplicatedStorage/TS/BalanceDataTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";
import { CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses"

import { MessageServer } from "./MessageServer"
import { PlayerServer } from "./PlayerServer"
DebugXL.logD('Requires', 'HeroServer imports finished')
let heroTeam = Teams.FindFirstChild<Team>('Heroes')!
DebugXL.Assert(heroTeam !== undefined)

let hotbarRE = Workspace.FindFirstChild('Signals')!.FindFirstChild<RemoteEvent>('HotbarRE')!
DebugXL.Assert(hotbarRE !== undefined)

let heroesRE = Workspace.FindFirstChild('Signals')!.FindFirstChild<RemoteEvent>('HeroesRE')!
DebugXL.Assert(hotbarRE !== undefined)

let levelSpreadK = 8

type Character = Model

export namespace HeroServer {
    const shopResetPeriod = 60 * 60 * 24

    export function repopulateShopIfNecessary(player: Player, hero: Hero) {
        let osTime = os.time()
        if ((math.floor(hero.lastShopResetOsTime / shopResetPeriod) < math.floor(osTime / shopResetPeriod)) ||
            (hero.getActualLevel() > hero.lastShopResetLevel)) {
            hero.shopPool.clear()
            for (let i = 0; i < 25; i++) {
                //DebugXL.logI( 'Items',( 'Shop item ' + i )
                let gearItem = undefined
                let duplicateCount = 0
                while (!gearItem) {
                    let newItem = RandomGear.ChooseRandomGearForPlayer(hero.getActualLevel() / 3,
                        math.ceil(hero.getActualLevel() / 3 * 1.5),
                        player,
                        hero,
                        false,
                        false)
                    if (newItem) {
                        let duplicate = false
                        hero.shopPool.forEach((storeItem: FlexTool) => {
                            // at least 900 checks by the time we're through. let's see if it's too slow, because I'm having problems iterating 
                            // through roblox-ts's map using any method but this which means I can't break. That said our best case scenario sucks
                            // even with break so maybe not that big a deal
                            if (newItem!.identical(storeItem!)) {
                                DebugXL.logI('Items', "HeroServer: Duplicate")
                                duplicateCount++
                                duplicate = true
                            }
                        })
                        if (!duplicate || duplicateCount > 20) {
                            gearItem = newItem
                        }
                    }
                }
                hero.shopPool.set("item" + i, gearItem)
            }
            hero.lastShopResetOsTime = osTime
            hero.lastShopResetLevel = hero.getActualLevel()
        }
    }

    export function adjustGold(player: Player, hero: Hero, amount: number, analyticItemType: string, analyticItemId: string) {
        DebugXL.Assert(amount + hero.statsT.goldN >= 0)
        hero.statsT.goldN = hero.statsT.goldN + amount
        GameAnalyticsServer.RecordResource(player, amount, amount > 0 ? "Source" : "Sink", "Gold", analyticItemType, analyticItemId)
    }

    export function buyItem(player: Player, hero: Hero, shopItemKey: string) {
        // make sure didn't click twice before finished processing
        let shopItem = hero.shopPool.get(shopItemKey)
        if (shopItem) {
            if (hero.statsT.goldN >= shopItem.getPurchasePrice()) {
                let gearCount = HeroUtility.CountNonPotionGear(hero)
                if (gearCount < Inventory.GetCount(player, "GearSlots")) {
                    HeroServer.adjustGold(player, hero, -shopItem.getPurchasePrice(), "Buy", shopItem.baseDataS)
                    hero.giveFlexTool(shopItem)
                    let totalPossessions = HeroUtility.CountNonPotionGear(hero)
                    Analytics.ReportEvent(player, 'BuyTool', shopItem.baseDataS, tostring(shopItem.levelN), totalPossessions)
                    hero.shopPool.delete(shopItemKey)
                }
            }
        }
    }

    export function awardBadgesForHero(player: Player, hero: Hero, experienceBonus: number) {
        // only works on server
        const possibleBadges = CharacterClasses.classData[hero.idS].badges
        DebugXL.Assert(possibleBadges !== undefined)
        if (possibleBadges) {
            const numBadges = math.floor(hero.getActualLevel() / 5)
            for (let i = 0; i < numBadges && i < possibleBadges.size(); i++) {
                BadgeService.AwardBadge(player.UserId, possibleBadges[i])
            }
        }
    }

    export function awardExperienceWait(player: Player,
        experienceBonus: number,
        analyticsItemType: string,
        analyticsItemId: string) {

        // being careful because somehow a player ended up with nan experience
        DebugXL.Assert(type(experienceBonus) === "number")
        DebugXL.Assert((experienceBonus === experienceBonus))
        if (MathXL.IsFinite(experienceBonus)) {
            if (Inventory.BoostActive(player)) {
                experienceBonus *= 2
            }
            const inventory = Inventory.GetWait(player)
            if (!inventory) { return }
            const xpRate = 0.5
            experienceBonus *= xpRate
            DebugXL.logD( "Gameplay", "Awarding (adjusted) "+experienceBonus+" xp to "+player.Name )	
            const pcData = PlayerServer.getCharacterRecordFromPlayer(player)
            // only if hero has chosen class yet
            if (pcData instanceof Hero) {  // // your hero could have gone out of scope while waiting to get inventory, or you might have just picked hero but not picked which one yet
                const pcDataStatsT = pcData.statsT
                const lastLevel = Hero.levelForExperience(pcDataStatsT.experienceN)

                // still being careful because somehow a player ended up with nan experience
                GameAnalyticsServer.RecordResource(player, math.ceil(experienceBonus), "Source", "XP", analyticsItemType, analyticsItemId)
                const newExperience = pcDataStatsT.experienceN + math.ceil(experienceBonus)
                DebugXL.Assert(MathXL.IsFinite(newExperience))
                if (!MathXL.IsFinite(newExperience)) { return }
                DebugXL.logI( "Gameplay", player.Name+" xp goes from "+pcDataStatsT.experienceN+" to "+newExperience)
                pcDataStatsT.experienceN = newExperience

                let newLevel = Hero.levelForExperience(pcDataStatsT.experienceN)
                if (newLevel > lastLevel) {
                    // prevent it from going up more than one level at a time
                    // there was no significant effect to do this extra work according to the analytics but I watched one guy
                    //- get to level 10 in one session which seems crazy
                    //- that was partly because I wasn't nerfed for some reason
                    newLevel = lastLevel + 1
                    // once you level discard extra experience; slows things down and won't accidentally jump multiple levels this way
                    pcDataStatsT.experienceN = Hero.totalExperienceForLevel(newLevel)

                    if (newLevel >= Hero.globalHeroLevelCap) {
                        MessageServer.PostMessageByKey(player, "MaximumLevel", false, 0, false)
                    }

                    MessageServer.PostMessageByKey(player, "LevelUpHero", false, 0, false)
                    const humanoid = player.Character!.FindFirstChild<Humanoid>("Humanoid")
                    if (humanoid) {
                        humanoid.Health = humanoid.MaxHealth
                        const manaValue = player.Character!.FindFirstChild<NumberValue>("ManaValue")
                        if (manaValue) {
                            manaValue.Value = player.Character!.FindFirstChild<NumberValue>("MaxManaValue")!.Value
                        }
                    }
                    const leaderstats = player.FindFirstChild<Folder>("leaderstats")
                    if (leaderstats) {
                        const levelValue = leaderstats.FindFirstChild<NumberValue>("Level")
                        if (levelValue) {
                            levelValue.Value = newLevel
                        }
                    }
                    HeroServer.repopulateShopIfNecessary(player, pcData)
                    HeroServer.awardBadgesForHero(player, pcData, experienceBonus)
                }
            }
        }
    }

    export function awardKillExperienceWait(killer: Player, xp: number, target: Character) {
        // we don't want to encourage kill stealing
        // we don't want 2 players to level up quite as fast as 1, so the game stays tough-ish for them
        // so we don't want to give the same value to everybody
        // but we also don't want to split it down the middle
        // temp: killer gets half xp, rest divided amongst other players whether they touched bad guy or not;
        // this is so the low level people on the floor don't get crazy points
        // so kill stealing is a thing; really we should keep track of how much damage each player does to a monster
        const numHeroes = heroTeam.GetPlayers().size()
        for (let hero of heroTeam.GetPlayers()) {
            if (hero === killer) {
                // give 50% to hero 
                const adjustedXP = xp / (numHeroes > 1 ? 2 : 1)
                DebugXL.logV("Gameplay", hero.Name+" gets "+adjustedXP)
                HeroServer.awardExperienceWait(hero, adjustedXP, "Kill", "Monster")
            }
            else {
                // split the rest amongst the others
                const adjustedXP = xp / 2 / math.max(1, numHeroes - 1) // math.max() prevents a div 0 if killer has left game
                DebugXL.logV("Gameplay", hero.Name+" gets "+adjustedXP)
                HeroServer.awardExperienceWait(hero, adjustedXP, "Kill:Shared", "Monster")
            }
        }
    }

    export function calculateCurrentLevelCapWait() {
        DebugXL.Assert(heroTeam !== undefined)
        if (heroTeam) {
            let minLevel = 1000
            PlayerServer.getPlayerCharacterRecords().forEach((pcData) => {
                if (pcData instanceof Hero) {
                    minLevel = math.min(minLevel, pcData.getActualLevel())
                }
            })
            minLevel += levelSpreadK
            warn('Setting hero level cap to ' + minLevel)
            Workspace.FindFirstChild('GameManagement')!.FindFirstChild<NumberValue>('CurrentMaxHeroLevel')!.Value = minLevel
        }
    }

    export function calculateDangerRatio(myLevel: number) {
        let dangerRatio = 1
        PlayerServer.getPlayerCharacterRecords().forEach((pcData) => {
            if (pcData instanceof Hero) {
                dangerRatio = math.max((pcData.getLocalLevel() + BalanceData.effective0LevelStrength) / (myLevel + BalanceData.effective0LevelStrength), dangerRatio)
            }
        })
        return dangerRatio
    }

    export function resetCurrentLevelCap() {
        warn('Resetting level cap')
        HeroServer.calculateCurrentLevelCapWait()
        HeroServer.republishAllHeroLevels()
    }

    export function getDifficultyLevel() {
        //// if you change difficulty mode, also change GameManagement module
        //        // on-the-fly-balancing-mode
        return math.floor(HeroServer.getAverageHeroLocalLevel())
    }

    export function getTotalHeroEffectiveLocalLevels() {
        let pcLevelSum = 0
        PlayerServer.getPlayerCharacterRecords().forEach((pcData) => {
            if (pcData instanceof Hero) {
                pcLevelSum += pcData.getLocalLevel() + BalanceData.effective0LevelStrength
            }
        })
        return pcLevelSum
    }

    export function getAverageHeroLocalLevel() {
        let pcLevelSum = 0
        let numHeroes = 0
        PlayerServer.getPlayerCharacterRecords().forEach((pcData) => {
            if (pcData instanceof Hero) {
                pcLevelSum += pcData.getLocalLevel()
                numHeroes++
            }
        })
        return numHeroes > 0 ? pcLevelSum / numHeroes : 1
    }


    export function republishAllHeroLevels() {
        heroTeam.GetPlayers().forEach((heroPlayer) => {
            let heroData = PlayerServer.getCharacterRecordFromPlayer(heroPlayer)
            // someone on hero team may not have picked their hero yet; check
            if (heroData) {
                if (heroData instanceof Hero) {
                    PlayerServer.publishLevel(heroPlayer,
                        heroData.getLocalLevel(), heroData.getActualLevel())
                    hotbarRE.FireClient(heroPlayer, "Refresh", heroData)
                    heroesRE.FireClient(heroPlayer, "RefreshSheet", heroData)
                }
            }
        })
    }

    function checkNerfingHealthWait() {
        let players = Players.GetPlayers()
        let minHeroLevel = 1000
        let maxHeroLevel = 1
        let anyNerfing = false
        for (let i = 0; i < players.size(); i++) {
            // not going to be careful with this diagnostic function
            let myLeaderstats = players[i].FindFirstChild<Folder>('leaderstats')
            if( myLeaderstats ) {   
                let classObj = myLeaderstats.FindFirstChild<StringValue>('Class')
                if (classObj !== undefined)  // might not have loaded in yet
                {
                    let levelObj = myLeaderstats.FindFirstChild<StringValue>('Level')
                    if (levelObj !== undefined) {
                        let classStr = classObj.Value
                        let levelStr = levelObj.Value
                        if (classStr === 'Rogue' || classStr === 'Mage' || classStr === 'Warrior' || classStr === 'Barbarian' || classStr === 'Priest') {
                            let localLevel = levelStr.match('%d+')[0] as unknown as number
                            // confusing because the string has () in it and () is also the code to capture a match:
                            // literal (, capture (, match, capture ), literal ):
                            let unnerfedLevel = levelStr.match('%((%d+)%)')[0] as unknown as number
                            if (unnerfedLevel !== undefined) anyNerfing = true
                            minHeroLevel = math.min(minHeroLevel, localLevel)
                            maxHeroLevel = math.max(maxHeroLevel, localLevel)
                        }
                    }
                }
            }
        }
        if (maxHeroLevel > minHeroLevel + levelSpreadK) {
            let officialMaxLevel = Workspace.FindFirstChild<Folder>('GameManagement')!.FindFirstChild<NumberValue>('CurrentMaxHeroLevel')!.Value
            DebugXL.Error(`Nerfing failure: minLevel: ${minHeroLevel}, maxLevel: ${maxHeroLevel}, officialMaxLevel: ${officialMaxLevel}, anyNerfing: ${anyNerfing}`)
            // wait ten minutes before reporting again
            wait(600)
        }
    }

    spawn(() => {
        for (; ;) {
            wait(30)
            checkNerfingHealthWait()
        }
    })
}

