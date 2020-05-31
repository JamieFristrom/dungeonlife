
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { Players, Teams, Workspace } from '@rbxts/services'

import * as CharacterI from 'ServerStorage/Standard/CharacterI'
import * as Heroes from "ServerStorage/Standard/HeroesModule"
import * as Inventory from 'ServerStorage/Standard/InventoryModule'
import * as GameAnalyticsServer from 'ServerStorage/Standard/GameAnalyticsServer'

import * as CharacterUtility from 'ReplicatedStorage/Standard/CharacterUtility'
import * as MathXL from 'ReplicatedStorage/Standard/MathXL'

import { BalanceData } from 'ReplicatedStorage/TS/BalanceDataTS'
import { CharacterClasses } from 'ReplicatedStorage/TS/CharacterClasses'
import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'
import { Hero } from 'ReplicatedStorage/TS/HeroTS'
import { Randomisher } from 'ReplicatedStorage/TS/Randomisher'

import { HeroServer } from './HeroServer'
import { PlayerServer } from './PlayerServer'
import { RandomGear } from './RandomGear'

const lootDropRE = Workspace.FindFirstChild<Folder>("Signals")!.FindFirstChild<RemoteEvent>("LootDropRE")!

const playerLootRandomishers = new Map<Readonly<Player>, Randomisher>()
const playerPotionRandomishers = new Map<Readonly<Player>, Randomisher>()

const HeroTeam = Teams.FindFirstChild<Team>('Heroes')!
DebugXL.Assert(HeroTeam !== undefined)

export namespace LootServer {

    // returns string for telemetry
    export function drop(targetLevel: number, earningPlayer: Readonly<Player>, boosted: boolean) {
        if (earningPlayer.Team !== HeroTeam) {
            DebugXL.logW('Gameplay', earningPlayer.GetFullName() + ' turned monster before getting loot')
            return ""
        }
        const heroRecord = CharacterI.GetPCDataWait(earningPlayer)  // this looks like it could lock up fairly easily
        if (!(heroRecord instanceof Hero)) {
            return ""
        }
        const heroLevel = heroRecord.getActualLevel()
        const flexTool = RandomGear.ChooseRandomGearForPlayer(
            math.floor(heroLevel / 3),
            math.floor(targetLevel / 3),
            earningPlayer,
            heroRecord,
            Inventory.BoostActive(earningPlayer),
            boosted)

        if (!flexTool) {
            return ""
        }
        DebugXL.Assert(flexTool.levelN >= 1)
        const activeSkins = Inventory.GetActiveSkinsWait(earningPlayer)
        lootDropRE.FireClient(earningPlayer, "item", flexTool, activeSkins)
        Heroes.RecordTool(earningPlayer, flexTool)

        return "EnhanceLvl" + flexTool.getTotalEnhanceLevels() + ":" + "RelativeLvl" + (flexTool.getActualLevel() - heroLevel)
    }

    export function monsterDrop(monsterLevel: number, monsterClassS: string, wasMob: boolean, lastAttackingPlayer?: Readonly<Player>) {
        if (!lastAttackingPlayer) {
            return
        }
        let odds = CharacterClasses.monsterStats[monsterClassS].dropItemPctN * BalanceData.itemDropRateModifierN / HeroTeam.GetPlayers().size()
        DebugXL.logD("Loot", "MonsterDrop level " + monsterLevel + "; odds: " + odds)
        let boostInPlay = false
        for (let [_, player] of Object.entries(HeroTeam.GetPlayers())) {
            if (Inventory.BoostActive(lastAttackingPlayer)) {
                odds *= 2
                boostInPlay = true
            }
        }

        if (!playerLootRandomishers.has(lastAttackingPlayer)) {
            playerLootRandomishers.set(lastAttackingPlayer, new Randomisher(7))
        }
        const dieRoll = playerLootRandomishers.get(lastAttackingPlayer)!.next0to1()
        if (dieRoll <= odds) {
            const playerCharacterKey = PlayerServer.getCharacterKeyFromPlayer(lastAttackingPlayer)
            if (playerCharacterKey) {
                const actualLevel = PlayerServer.getActualLevel(playerCharacterKey)
                if (actualLevel) {
                    const averageLevel = (monsterLevel + actualLevel) / 2
                    DebugXL.logD("Loot", "Loot:MonsterDrop HIT: " + lastAttackingPlayer.Name + ": odds: " + odds + "; dieRoll: " + dieRoll)
                    LootServer.drop(averageLevel, lastAttackingPlayer, boostInPlay && (dieRoll >= odds / 2))
                }
            }
        }
    }

    export function chestDrop(targetLevel: number, player: Player) { // opening player ! currently used 
        structureDrop(
            targetLevel,
            player,
            BalanceData.chestDropRateModifierN,
            BalanceData.healthPotionBaseDropChance,
            BalanceData.magicPotionBaseDropChance)
    }

    
    export function destructibleDrop(destructible: Model) {
        const attackingPlayer = CharacterUtility.GetLastAttackingPlayer(destructible)
        if( !attackingPlayer ) {
            return
        }
        const hero = PlayerServer.getCharacterRecordFromPlayer(attackingPlayer)
        DebugXL.Assert(hero instanceof Hero)
        if (hero && hero instanceof Hero) {
            const targetLevel = math.floor(hero.getActualLevel() * 1.5)
            structureDrop(
                targetLevel,
                attackingPlayer,
                BalanceData.destructibleDropRateModifier,
                0,
                0)
        }
    }

    export function structureDrop(targetLevel: number, player: Player, lootOdds: number, healthOdds: number, manaOdds: number) {
        const lootB = false

        let eventStr = "ChestDrop:"  // level 1

        let boostInPlay = false
        if (Inventory.BoostActive(player)) {
            lootOdds = lootOdds * 2
            boostInPlay = true
            //print( "Loot drop odds doubled to "+odds )		
        }
        let randomisher = playerLootRandomishers.get(player)
        if (!randomisher) {
            randomisher = new Randomisher(7)
            playerLootRandomishers.set(player, randomisher)
        }
        let lootEventStr = ""
        const dieRoll = randomisher.next0to1()
        if (dieRoll <= lootOdds) {
            let lootB = true
            lootEventStr = LootServer.drop(targetLevel, player, boostInPlay && (dieRoll >= lootOdds / 2))
            if (lootEventStr !== "") {
                if (boostInPlay) {
                    eventStr = eventStr + "Boost:"
                }
            } else {
                {
                    eventStr = eventStr + "NoBoost:"
                }
                eventStr = eventStr + "Loot:" + lootEventStr
                GameAnalyticsServer.RecordDesignEvent(player, eventStr)
            }
        }
        let potionB = LootServer.checkForPotionDrop(player, healthOdds, "Healing")
        if (!potionB) {
            potionB = LootServer.checkForPotionDrop(player, manaOdds, "Mana")
        }
        if (potionB) {
            GameAnalyticsServer.RecordDesignEvent(player, "ChestDrop:Potion")  // possible to call two events
        }

        if (!lootB && !potionB) {
            //MessageServer.PostMessageByKey( player, "Empty", false )
            //a little gold as a consolation prize
            const hero = CharacterI.GetPCDataWait(player)
            if (hero instanceof Hero) {
                const dieSize = math.ceil(hero.getActualLevel() / 3) // 20 -> 1,7 + 0, 7 or 7.5 expected value. sounds ok 
                const gold = MathXL.RandomInteger(1, dieSize) + MathXL.RandomInteger(0, dieSize)  // 0 in second die is intentional so it's possible to get only 1

                HeroServer.adjustGold(player, hero, gold, "Drop", "Chest")
                lootDropRE.FireClient(player, "gold", gold)

                Heroes.SaveHeroesWait(player)
                //		GameAnalyticsServer.RecordDesignEvent( player, "ChestDrop:Empty" )
            }
        }
    }


    export function checkForPotionDrop(player: Readonly<Player>, dropChance: number, potionIdS: string) {
        if (!player) { return false }
        if (player.Team === HeroTeam) {
            DebugXL.logV("Loot", "Loot intended for " + player.Name)
        } else {
            warn(player.Name + " must have become monster before they got their loot")
            return false
        }

        const pcData = Heroes.GetPCDataWait(player)

        const potionsN = pcData.gearPool.countIf((item) => item.baseDataS === potionIdS)

        // chance of drop depends on ratio of monster level to your level
        // we don't want to give a level 10 hero lots of potions for killing level 1 monsters
        // and we also don't want players to stockpile, so we gradually reduce the chances of that over time

        // there used to be a fairly gentle sqrt there, but stockpiling was a thing; inverse may be too harsh though, in particular that second potion 
        // having a fifty percent lower chance than the first means you really should finish your potion before you kill a monster

        // want a function that drops off sharply as monsters get too easy for you (you don't deserve potion for that) but is ! extreme as 
        // monsters get harder, asymptote out.

        const timeSinceLevelStart = Workspace.FindFirstChild<Folder>("GameManagement")!.FindFirstChild<NumberValue>("LevelTimeElapsed")!.Value
        const potionLikelihoodMulForLoitering = (BalanceData.potionLoiteringHalfLifeN) / (BalanceData.potionLoiteringHalfLifeN + timeSinceLevelStart)

        // same level vs same level: 1
        // level 2 vs level 1 ( 8 vs 7 ): 1.13 	 
        // level 3 vs level 1 ( 9 vs 7 ): 1.25
        // level 4 vs level 1 ( 10 vs 7 ): 1.35
        // level 8 vs level 1 ( 14 vs 7 ): 1.69
        // level 15 vs level 1 ( 21 vs 7): 2.09
        // level 1 vs level 2 ( 7 vs 8 ): 0.87
        const potionMulForStockpile = math.pow(1 / (potionsN + 1), BalanceData.potionDropGammaN)
        const potionDropChanceN = math.clamp(dropChance * potionLikelihoodMulForLoitering * potionMulForStockpile, 0, 0.6)
        //	//print( "Potion calc: loitering: "+potionLikelihoodMulForLoitering+"; level "+monsterLevel+"/"+playerLevel+": "+potionLikelihoodForMonsterDifficulty+"; stockpile("+potionsN+"): "+potionMulForStockpile+"; total: "+potionDropChanceN )
        let randomisher = playerPotionRandomishers.get(player)
        if (!randomisher) {
            randomisher = new Randomisher(7)
            playerPotionRandomishers.set(player, randomisher)
        }

        const dieRoll = randomisher.next0to1()

        if (dieRoll <= potionDropChanceN) {
            const _toolInstanceDatumT = new FlexTool(potionIdS, 1, [])

            DebugXL.Assert(player !== undefined)
            Heroes.RecordTool(player, _toolInstanceDatumT)
            wait(1)  // super kludgey way to make sure potions and gear drops don't 100% overlap		

            lootDropRE.FireClient(player, "item", _toolInstanceDatumT, {})

            return true
        }
        return false
    }


    Players.PlayerRemoving.Connect(() => {
        wait(2)
        for (let k of Object.keys(playerLootRandomishers)) {
            if (!k.Parent) {
                playerLootRandomishers.delete(k)
            }
        }
        for (let k of Object.keys(playerPotionRandomishers)) {
            if (!k.Parent) {
                playerPotionRandomishers.delete(k)
            }
        }
    })
}