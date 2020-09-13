
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import * as MathXL from "ReplicatedStorage/Standard/MathXL"
import * as FloorData from "ReplicatedStorage/Standard/FloorData"

import { PlacesManifest } from "ReplicatedStorage/TS/PlacesManifest"

import { Workspace } from "@rbxts/services"

const gameManagement = (Workspace.FindFirstChild('GameManagement') as Folder | undefined)!
const DungeonDepthValueObj = gameManagement.FindFirstChild('DungeonDepth') as NumberValue
const DungeonFloorValueObj = gameManagement.FindFirstChild('DungeonFloor') as NumberValue

const disableShuffle = PlacesManifest.getCurrentPlace().maxAllowedLevel <= 4

export class DungeonDeckClass {
    floorForDepth = new Array<number>()

    constructor() {
        this.shuffle("Subdweller Colony")
    }

    shuffle(dungeonName: string) {
        // let numNonbossLevels = 0  // for testing superboss level 
        const numNonbossLevels = 3

        // always put the boss level on the bottom
        // if it's winter's crypt, always put the palace on the top - 
        const startingDeck = new Array<number>()
        let floorIdx = 0

        let bossFloorIdx = 6  // safe default in case of bug
        for (; floorIdx < FloorData.floorsA.size(); floorIdx++) {
            if (dungeonName === FloorData.floorsA[floorIdx].dungeonNameS)
                if (FloorData.floorsA[floorIdx].exitStaircaseB) {
                    startingDeck.push(floorIdx + 1)  // lua is going to be reading the starting deck and therefore wants 1 based indices
                }
                else {
                    bossFloorIdx = floorIdx
                    break
                }
        }
        this.floorForDepth = []
        for (let i = 0; i < numNonbossLevels; i++) {
            const cardIdx = disableShuffle ? i : MathXL.RandomInteger(0, startingDeck.size() - 1)
            this.floorForDepth.push(startingDeck[cardIdx])
            startingDeck.remove(cardIdx)
        }

        // push boss level
        // we stopped on the floor with the boss for this level
        this.floorForDepth.push(bossFloorIdx + 1)  // lua is going to be reading the starting deck and therefore wants 1 based indices

        // set dungeon to start
        DungeonDepthValueObj.Value = 1
        DungeonFloorValueObj.Value = this.floorForDepth[0]
    }

    goToNextFloor() {
        DungeonDepthValueObj.Value++
        DebugXL.Assert(DungeonDepthValueObj.Value <= this.floorForDepth.size())
        DungeonDepthValueObj.Value = math.min(DungeonDepthValueObj.Value, this.floorForDepth.size())
        DungeonFloorValueObj.Value = this.floorForDepth[DungeonDepthValueObj.Value - 1]
        return DungeonDepthValueObj.Value
    }

    getCurrentDepth(): number {
        return DungeonDepthValueObj.Value
    }
}

export const DungeonDeck = new DungeonDeckClass()