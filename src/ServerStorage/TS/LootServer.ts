
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Players, Teams, Workspace } from "@rbxts/services"

import * as Inventory from "ServerStorage/Standard/InventoryModule"
import * as GameAnalyticsServer from "ServerStorage/Standard/GameAnalyticsServer"

import * as CharacterUtility from "ReplicatedStorage/Standard/CharacterUtility"
import * as MathXL from "ReplicatedStorage/Standard/MathXL"

import { BalanceData } from "ReplicatedStorage/TS/BalanceDataTS"
import { CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { Randomisher } from "ReplicatedStorage/TS/Randomisher"

import { PlayerServer, PlayerTracker } from "./PlayerServer"
import { RandomGear } from "./RandomGear"
import { HeroesManagerI } from "ServerStorage/Standard/HeroesManagerI"

import { ServerContextI } from "ServerStorage/TS/ServerContext"
import { MainContext } from "./MainContext"
import { Math } from "ReplicatedStorage/TS/Math"


type Character = Model

const lootDropRE = (Workspace.FindFirstChild("Signals")!.FindFirstChild("LootDropRE") as RemoteEvent|undefined)!

const playerLootRandomishers = new Map<Readonly<Player>, Randomisher>()
const playerPotionRandomishers = new Map<Readonly<Player>, Randomisher>()

const HeroTeam = (Teams.FindFirstChild("Heroes") as Team|undefined)!
DebugXL.Assert(HeroTeam !== undefined)

export namespace LootServer {

    // returns string for telemetry
    export function drop(
        heroMgr: HeroesManagerI,
        targetLevel: number,
        earningPlayer: Readonly<Player>,
        itemDroppedDueToBoost: boolean,
        heroRecord: Hero,
        boostActive: boolean) {

        DebugXL.Assert(type(targetLevel) === "number")
        DebugXL.Assert(earningPlayer.IsA("Player"))
        DebugXL.Assert(type(itemDroppedDueToBoost) === "boolean")
        const heroLevel = heroRecord.getActualLevel()
        const flexTool = RandomGear.ChooseRandomGearForPlayer(
            math.floor(heroLevel / 3),
            math.floor(targetLevel / 3),
            earningPlayer,
            heroRecord,
            boostActive,
            itemDroppedDueToBoost)

        DebugXL.Assert(!flexTool || flexTool.levelN >= 1)
        return flexTool
    }

    export function checkMonsterDrop(heroMgr: HeroesManagerI, monster: Character) {
        const lastAttackingPlayer = CharacterUtility.GetLastAttackingPlayer(monster)
        if (lastAttackingPlayer) {
            const characterRecord = PlayerServer.getCharacterRecordFromCharacter(monster)
            DebugXL.Assert(characterRecord !== undefined)
            if (characterRecord) {
                const wasMob = !Players.GetPlayerFromCharacter(monster)
                LootServer.monsterDrop(heroMgr, characterRecord.getLocalLevel(), characterRecord.idS, wasMob, lastAttackingPlayer)
            }
        }
        DebugXL.logV(LogArea.Gameplay, "Loot, if any, dropped")
    }

    export function monsterDrop(heroMgr: HeroesManagerI, monsterLevel: number, monsterClassS: string, wasMob: boolean, lastAttackingPlayer?: Readonly<Player>) {
        if (!lastAttackingPlayer) {
            return
        }
        let odds = CharacterClasses.monsterStats[monsterClassS].dropItemPctN * BalanceData.itemDropRateModifierN / HeroTeam.GetPlayers().size()
        DebugXL.logD(LogArea.Items, "MonsterDrop level " + monsterLevel + "; odds: " + odds)
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
            const pcRecord = PlayerServer.getCharacterRecordFromPlayer(lastAttackingPlayer)
            if (pcRecord) {
                // I bet you could change to a monster before you finish doing damage - wishlist fix. save character key in lastAttacking
                if (pcRecord instanceof Hero) {
                    const actualLevel = pcRecord.getActualLevel()
                    if (actualLevel) {
                        const averageLevel = (monsterLevel + actualLevel) / 2
                        DebugXL.logD(LogArea.Items, "Loot:MonsterDrop HIT: " + lastAttackingPlayer.Name + ": odds: " + odds + "; dieRoll: " + dieRoll)
                        const flexTool = LootServer.drop(
                            heroMgr,
                            averageLevel,
                            lastAttackingPlayer,
                            boostInPlay && (dieRoll >= odds / 2),
                            pcRecord,
                            boostInPlay)
                        if (flexTool) {
                            lootDropRE.FireClient(lastAttackingPlayer, "item", flexTool, Inventory.GetActiveSkinsWait(lastAttackingPlayer))
                            heroMgr.RecordTool(MainContext.get(), lastAttackingPlayer, pcRecord, flexTool)
                        }
                    }
                }
            }
        }
    }

    export function chestDrop(context: ServerContextI, heroMgr: HeroesManagerI, targetLevel: number, player: Player) { // opening player ! currently used 
        structureDrop(
            context,
            heroMgr,
            targetLevel,
            player,
            BalanceData.chestDropRateModifierN,
            BalanceData.healthPotionBaseDropChance,
            BalanceData.magicPotionBaseDropChance)
    }


    export function destructibleDrop(context: ServerContextI, heroMgr: HeroesManagerI, lootPct: number, attackingPlayer: Player) {
        const hero = context.getPlayerTracker().getCharacterRecordFromPlayer(attackingPlayer)
        //        DebugXL.Assert(hero instanceof Hero)    // making it easy for testing code. and maybe one day we'll want monsters to be able to smash things anyway
        if (hero && hero instanceof Hero) {
            const targetLevel = math.floor(hero.getActualLevel() * 1.5)
            structureDrop(
                context,
                heroMgr,
                targetLevel,
                attackingPlayer,
                lootPct,
                0,
                0)
        }
    }

    export function structureDrop(
        context: ServerContextI,
        heroMgr: HeroesManagerI,
        targetLevel: number,
        player: Player,
        lootOdds: number,
        healthOdds: number,
        manaOdds: number) {

        const lootB = false

        let eventStr = "ChestDrop:"  // level 1

        const hero = context.getPlayerTracker().getCharacterRecordFromPlayer(player)
        if (hero instanceof Hero) {

            let boostInPlay = false
            if (context.getInventoryMgr().BoostActive(player)) {
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
            // looks like the design here is you always get mana, health, or gold and maybe also gear
            const dieRoll = randomisher.next0to1()
            if (dieRoll <= lootOdds) {
                const flexTool = LootServer.drop(
                    heroMgr,
                    targetLevel,
                    player,
                    boostInPlay && (dieRoll >= lootOdds / 2),  // whether or not this item dropped because it was boosted
                    hero,
                    boostInPlay);
                if (flexTool) {
                    lootDropRE.FireClient(player, "item", flexTool, context.getInventoryMgr().GetActiveSkinsWait(player))
                    heroMgr.RecordTool(context, player, hero, flexTool)
                }

            }
            let potionB = LootServer.checkForPotionDrop(heroMgr, player, hero, healthOdds, "Healing")
            if (!potionB) {
                potionB = LootServer.checkForPotionDrop(heroMgr, player, hero, manaOdds, "Mana")
            }
            if (potionB) {
                GameAnalyticsServer.RecordDesignEvent(player, "ChestDrop:Potion")  // possible to call two events
            }

            if (!lootB && !potionB) {
                //MessageServer.PostMessageByKey( player, "Empty", false )
                //a little gold as a consolation prize
                const dieSize = math.ceil(hero.getActualLevel() / 3) // 20 -> 1,7 + 0, 7 or 7.5 expected value. sounds ok 
                const gold = MathXL.RandomInteger(1, dieSize) + MathXL.RandomInteger(0, dieSize)  // 0 in second die is intentional so it's possible to get only 1

                hero.adjustGold(gold, player, "Drop", "Chest")
                lootDropRE.FireClient(player, "gold", gold)

                heroMgr.SaveHeroesWait(context.getPlayerTracker(), player)
                //		GameAnalyticsServer.RecordDesignEvent( player, "ChestDrop:Empty" )
            }
        }
    }


    export function checkForPotionDrop(heroMgr: HeroesManagerI, player: Readonly<Player>, pcData: Hero, dropChance: number, potionIdS: string) {
        if (!player) { return false }
        if (player.Team === HeroTeam) {
            DebugXL.logV(LogArea.Items, "Loot intended for " + player.Name)
        } else {
            warn(player.Name + " must have become monster before they got their loot")
            return false
        }

        //        const pcData = heroMgr.GetPCDataWait(player)

        const potionsN = pcData.gearPool.countIf((item) => item.baseDataS === potionIdS)

        // chance of drop depends on ratio of monster level to your level
        // we don't want to give a level 10 hero lots of potions for killing level 1 monsters
        // and we also don't want players to stockpile, so we gradually reduce the chances of that over time

        // there used to be a fairly gentle sqrt there, but stockpiling was a thing; inverse may be too harsh though, in particular that second potion 
        // having a fifty percent lower chance than the first means you really should finish your potion before you kill a monster

        // want a function that drops off sharply as monsters get too easy for you (you don't deserve potion for that) but is ! extreme as 
        // monsters get harder, asymptote out.

        const timeSinceLevelStart = (Workspace.FindFirstChild("GameManagement")!.FindFirstChild("LevelTimeElapsed") as NumberValue|undefined)!.Value
        const potionLikelihoodMulForLoitering = (BalanceData.potionLoiteringHalfLifeN) / (BalanceData.potionLoiteringHalfLifeN + timeSinceLevelStart)

        // same level vs same level: 1
        // level 2 vs level 1 ( 8 vs 7 ): 1.13 	 
        // level 3 vs level 1 ( 9 vs 7 ): 1.25
        // level 4 vs level 1 ( 10 vs 7 ): 1.35
        // level 8 vs level 1 ( 14 vs 7 ): 1.69
        // level 15 vs level 1 ( 21 vs 7): 2.09
        // level 1 vs level 2 ( 7 vs 8 ): 0.87
        const potionMulForStockpile = math.pow(1 / (potionsN + 1), BalanceData.potionDropGammaN)
        const potionDropChanceN = Math.clamp(dropChance * potionLikelihoodMulForLoitering * potionMulForStockpile, 0, 0.6)
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
            heroMgr.RecordTool(MainContext.get(), player, pcData, _toolInstanceDatumT)
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
