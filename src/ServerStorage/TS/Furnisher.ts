
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import * as FloorData from "ReplicatedStorage/Standard/FloorData"
import PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import * as FurnishServer from "ServerStorage/Standard/FurnishServerModule"
import { Workspace, ReplicatedStorage, Teams } from "@rbxts/services"
import Dungeon from "ServerStorage/Standard/DungeonModule"
import FurnishUtility from "ReplicatedStorage/Standard/FurnishUtility"
import MathXL from "ReplicatedStorage/Standard/MathXL"
import { MonsterServer } from "ServerStorage/TS/MonsterServer"

import { ServerContextI } from "ServerStorage/TS/ServerContext"
import { DungeonMap } from "ReplicatedStorage/TS/DungeonMap"
import { MainContext } from "./MainContext"
import { CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses"
import { PlayerServer } from "./PlayerServer"
import CharacterI from "ServerStorage/Standard/CharacterI"

const buildingFolder = Workspace.WaitForChild<Folder>("Building")

export namespace Furnisher {
    export function countFurnishingsOfType(furnishingType: PossessionData.FurnishingEnum) {
        return buildingFolder.GetChildren().filter((furnishing) => {
            const possessionNameObj = furnishing.FindFirstChild<StringValue>("PossessionName")
            DebugXL.Assert(possessionNameObj !== undefined)
            if (possessionNameObj) {
                if (!PossessionData.dataT[possessionNameObj.Value]) {
                    DebugXL.Error(possessionNameObj.Value + " doesn't exist in PossessionData")
                }
                else {
                    return PossessionData.dataT[possessionNameObj.Value].furnishingType === furnishingType
                }
            }
            return false
        }).size()
    }

    export function furnishWithFurnishingsOfType(availableBlueprints: Map<string, Boolean>, expectedTotal: number, furnishingType: PossessionData.FurnishingEnum) {
        const existingCount = countFurnishingsOfType(furnishingType)
        if (existingCount < expectedTotal) {
            const bossBlueprints = availableBlueprints.keys().filter(
                (blueprint) => PossessionData.dataT[blueprint].furnishingType === furnishingType);
            const spawnData = bossBlueprints.map((blueprint) => PossessionData.dataT[blueprint])
            if (spawnData.size() >= 1) {
                FurnishServer.PlaceSpawns(spawnData, expectedTotal - existingCount)
                return expectedTotal
            }
        }
        return existingCount
    }

    // this gets called twice; once when the level is created and once when the heroes are ready in case the monsters
    // didn't place enough spawn points or a hero arrived late
    // so it checks to see if the right amount of spawns are there and adds more if necessary
    export function furnishWithRandomSpawns(numHeroes: number) {
        const bossCount = furnishWithFurnishingsOfType(FloorData.CurrentFloor().availableBlueprintsT, 1, PossessionData.FurnishingEnum.BossSpawn)
        furnishWithFurnishingsOfType(FloorData.CurrentFloor().availableBlueprintsT, numHeroes + 3 / (bossCount + 1), PossessionData.FurnishingEnum.Spawn)
    }

    // exposing for test
    export function clientInitiatedFurnish(
        context: ServerContextI,
        map: DungeonMap,
        player: Player,
        name: string,
        position: Vector3,
        rotation: number) {

        if (context.getGameMgr().LevelReady()) {
            const furnishingDatum = PossessionData.dataT[name]
            if (furnishingDatum.buildCostN! <= player.FindFirstChild<NumberValue>("BuildPoints")!.Value) {
                const [ instance, _ ] = FurnishServer.Furnish(context, map, player, name, position, rotation)
                if (instance) {  // many reasons it can fail
                    MonsterServer.adjustBuildPoints(player, -furnishingDatum.buildCostN!)

                    if (furnishingDatum.buildCostN! < 0) {
                        // how many of those have you already built? The first time you build, you get 1 ruby. Second time, 50% chance. Third time, 33% chance. Etc
                        const [_, personalN] = FurnishUtility.CountFurnishings(name, player)
                        const odds = math.sqrt(1 / personalN)
                        if (MathXL.RandomNumber() <= odds) {
                            context.getInventoryMgr().AdjustCount(player, "Stars", 1, "Build", name)
                            context.getInventoryMgr().EarnRubies(player, 1, "Build", name)
                        }
                    }

                    // if( it's a spawn point trigger respawn
                    if (furnishingDatum.furnishingType === PossessionData.FurnishingEnum.Spawn ||
                        furnishingDatum.furnishingType === PossessionData.FurnishingEnum.BossSpawn) {


                            // kludge to prevent superboss player from ruining last level
                        const monsterInfo = CharacterClasses.monsterStats[PlayerServer.getCharacterClass(player)]
                        if (! monsterInfo || ! monsterInfo.tagsT["Superboss"] ) {   // letting heroes build for debug purposes
                            player.Team = Teams.FindFirstChild<Team>("Monsters") // necessery in Underhaven
                            // wishlist: pull from data file instead of object
                            const monsterSpawn = instance.FindFirstChild<BasePart>("MonsterSpawn")!
                            const className = monsterSpawn.FindFirstChild<StringValue>("CharacterClass")!.Value
                            CharacterI.SetCharacterClass(player, className)
                            context.getGameMgr().MarkPlayersCharacterForRespawn(player, monsterSpawn)
                        }
                    }
                    return instance
                }
            }
        }
        return undefined
    }

    ReplicatedStorage.WaitForChild<Folder>("Shared Instances")
        .WaitForChild<Folder>("Remotes")
        .WaitForChild<RemoteFunction>("PlaceInstanceRF")
        .OnServerInvoke = (player: Player, ...args) => {
            clientInitiatedFurnish(MainContext.get(), Dungeon.GetMap(), player, args[0] as string, args[1] as Vector3, args[2] as number)
        }

}