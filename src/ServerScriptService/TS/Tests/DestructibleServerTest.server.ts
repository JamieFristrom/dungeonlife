import { RunService, CollectionService, Workspace } from "@rbxts/services"

import * as InstanceXL from "ReplicatedStorage/Standard/InstanceXL"
import * as MathXL from "ReplicatedStorage/Standard/MathXL"
import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import { DestructibleServer } from "ServerStorage/TS/DestructibleServer"
import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
import { BalanceData } from "ReplicatedStorage/TS/BalanceDataTS"
import { GameplayTestService } from "ServerStorage/TS/GameplayTestService"

function TestDestructible( destructibleName: string, heroAvgLevel: number, numHeroes: number, dungeonDepth: number )
{
    const balanceAgainstNumHeroes = PossessionData.dataT[destructibleName].balanceAgainstNumHeroesB
    let destructible = InstanceXL.CreateInstance( 'Model', {}, false ) as Model
    InstanceXL.CreateInstance( 'StringValue', { Parent: destructible, Name: 'PossessionName', Value: destructibleName }, false )
    let humanoid = InstanceXL.CreateInstance( 'Humanoid', { Parent: destructible }, false ) as Humanoid
    CollectionService.AddTag( destructible, 'Destructible' )
    destructible.Parent = Workspace
    // tags make things hard to test; this will have side effects on the existing models
    DestructibleServer.calibrateAllDestructiblesHealth( heroAvgLevel, numHeroes, dungeonDepth )
    // structure health multiplier from 0.33 to 2
    const structureHealthMultiplier = BalanceData.structureHealthMultiplier
    // since stats haven't been locked down just testing that the formula does what I think the formula does
    const correctAnswer = ( heroAvgLevel + BalanceData.effective0LevelStrength ) * // hero average level
        PossessionData.dataT[destructibleName].healthPerLevelN! * 
        structureHealthMultiplier * 
        ( balanceAgainstNumHeroes? numHeroes: 1) *  // num heroes
        ( 1 + BalanceData.dungeonFloorDifficultyK * dungeonDepth )  // depth 3
    if( correctAnswer === 0 )
    {
        DebugXL.Assert( humanoid.MaxHealth > 0 )
    }
    else
    {
        // if our formula was in the exact same order as the internal formula we could use ===
        // instead using ApproxEqual, that'll let us move things around a bit without hassle
        DebugXL.Assert( MathXL.ApproxEqual( humanoid.MaxHealth, correctAnswer, 0.001 ) )
    }
    DebugXL.Assert( humanoid.Health === humanoid.MaxHealth )
    destructible.Destroy()
}

if( RunService.IsStudio())
{
    wait(1)

    TestDestructible( 'TrapDoors', 0, 0, 0 )
    TestDestructible( 'TrapDoors', 7, 2, 3 )
    TestDestructible( 'GargoyleFountain', 7, 2, 3 )
    TestDestructible( 'Gate', 7, 1, 3 )
    TestDestructible( 'Fence', 5, 3, 1 )
    TestDestructible( 'Barrel', 5, 3, 4 )
}