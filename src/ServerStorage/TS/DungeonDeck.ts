let version = "my loknar. mine."

import * as MathXL from "ReplicatedStorage/Standard/MathXL"
import * as FloorData from "ReplicatedStorage/Standard/FloorData"

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
import { Workspace } from "@rbxts/services";
import { PlacesManifest } from "ReplicatedStorage/TS/PlacesManifest"
import { GameplayTestService } from "./GameplayTestService"

let gameManagement = Workspace.FindFirstChild<Folder>('GameManagement')!
let DungeonDepthValueObj = gameManagement.FindFirstChild('DungeonDepth') as NumberValue
let DungeonFloorValueObj = gameManagement.FindFirstChild('DungeonFloor') as NumberValue

let disableShuffle = PlacesManifest.getCurrentPlace().maxAllowedLevel <= 4

export class DungeonDeckClass
{
    floorForDepth = new Array<number>()

    constructor()
    {
        this.shuffle( "Subdweller Colony" )
    }

    shuffle( dungeonName: string )
    {   
//        let numNonbossLevels = 0  // for testing superboss level
        let numNonbossLevels = 3 

        // always put the boss level on the bottom
        // if it's winter's crypt, always put the palace on the top - 
        let startingDeck = new Array<number>()
        let floorIdx = 0

        let bossFloorIdx = 6  // safe default in case of bug
        for( ; floorIdx<FloorData.floorsA.size(); floorIdx++ )
        {
            if( dungeonName === FloorData.floorsA[floorIdx].dungeonNameS )
                if( FloorData.floorsA[floorIdx].exitStaircaseB ) {
                    startingDeck.push( floorIdx+1 )  // lua is going to be reading the starting deck and therefore wants 1 based indices
                }
                else {
                    bossFloorIdx = floorIdx
                    break
                }
        }
        this.floorForDepth = []
        for( let i=0; i<numNonbossLevels; i++ ) {           
            let cardIdx = disableShuffle ? i : MathXL.RandomInteger( 0, startingDeck.size()-1 )
            this.floorForDepth.push( startingDeck[cardIdx] )
            startingDeck.splice( cardIdx, 1 )
        }

        // push boss level
        // we stopped on the floor with the boss for this level
        this.floorForDepth.push( bossFloorIdx+1 )  // lua is going to be reading the starting deck and therefore wants 1 based indices

        // set dungeon to start
        DungeonDepthValueObj.Value = 1
        DungeonFloorValueObj.Value = this.floorForDepth[ 0 ]
    }

    goToNextFloor()
    {
        DungeonDepthValueObj.Value++
        DebugXL.Assert( DungeonDepthValueObj.Value <= this.floorForDepth.size() )
        DungeonDepthValueObj.Value = math.min( DungeonDepthValueObj.Value, this.floorForDepth.size() )
        DungeonFloorValueObj.Value = this.floorForDepth[ DungeonDepthValueObj.Value-1 ]
        return DungeonDepthValueObj.Value
    }

    getCurrentDepth() : number
    {
        return DungeonDepthValueObj.Value
    }
}

export let DungeonDeck = new DungeonDeckClass()