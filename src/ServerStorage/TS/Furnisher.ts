
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import * as FloorData from "ReplicatedStorage/Standard/FloorData"
import PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import * as FurnishServer from "ServerStorage/Standard/FurnishServerModule"
import { Workspace } from '@rbxts/services'

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
}