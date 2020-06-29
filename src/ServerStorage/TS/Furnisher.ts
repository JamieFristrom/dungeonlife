
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import * as FloorData from "ReplicatedStorage/Standard/FloorData"
import PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import * as FurnishServer from "ServerStorage/Standard/FurnishServerModule"


export namespace Furnisher {
    
    export function furnishWithRandomSpawns( numHeroes: number ) {
        const bossBlueprints = FloorData.CurrentFloor().availableBlueprintsT.keys().filter( 
            (blueprint)=>PossessionData.dataT[blueprint].furnishingType === PossessionData.FurnishingEnum.BossSpawn );
        const spawnData = bossBlueprints.map( (blueprint)=>PossessionData.dataT[blueprint] )
        if( spawnData.size()>= 1 ) {
            FurnishServer.PlaceSpawns( spawnData, 1 )
        }

        const spawnBlueprints = FloorData.CurrentFloor().availableBlueprintsT.keys().filter(
            (blueprint)=>PossessionData.dataT[blueprint].furnishingType === PossessionData.FurnishingEnum.Spawn );
        const spawnFromList = spawnBlueprints.map( (blueprint)=>PossessionData.dataT[blueprint])
        DebugXL.Assert( spawnFromList.size()>=1 )
        if( spawnFromList.size()>=1 ) {
            FurnishServer.PlaceSpawns( spawnFromList, numHeroes+3-spawnData.size() )
        }
    }
}