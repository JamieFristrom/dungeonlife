
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { CollectionService, Workspace } from "@rbxts/services"

import FurnishServer from "ServerStorage/Standard/FurnishServerModule"
import Heroes from "ServerStorage/Standard/HeroesModule"

import { DestructibleServer } from "ServerStorage/TS/DestructibleServer"
import { TestContext } from "ServerStorage/TS/TestContext"

import InstanceXL from "ReplicatedStorage/Standard/InstanceXL"
import MathXL from "ReplicatedStorage/Standard/MathXL"
import PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"
import FurnishUtility from "ReplicatedStorage/Standard/FurnishUtility"

import { BalanceData } from "ReplicatedStorage/TS/BalanceDataTS"
import { MapUtility } from "ReplicatedStorage/TS/DungeonMap"
import { FloorInfo } from "ReplicatedStorage/TS/FloorInfo"
import { TestUtility } from "ReplicatedStorage/TS/TestUtility"
import { PlayerUtility } from "ReplicatedStorage/TS/PlayerUtility"


function TestDestructibleCorrectHealth(destructibleName: string, heroAvgLevel: number, numHeroes: number, dungeonDepth: number) {
    const balanceAgainstNumHeroes = PossessionData.dataT[destructibleName].balanceAgainstNumHeroesB
    let destructible = InstanceXL.CreateInstance("Model", {}, false) as Model
    InstanceXL.CreateInstance("StringValue", { Parent: destructible, Name: "PossessionName", Value: destructibleName }, false)
    let humanoid = InstanceXL.CreateInstance("Humanoid", { Parent: destructible }, false) as Humanoid
    CollectionService.AddTag(destructible, "Destructible")
    destructible.Parent = Workspace
    // tags make things hard to test; this will have side effects on the existing models
    DestructibleServer.calibrateAllDestructiblesHealth(heroAvgLevel, numHeroes, dungeonDepth)
    // structure health multiplier from 0.33 to 2
    const structureHealthMultiplier = BalanceData.structureHealthMultiplier
    // since stats haven't been locked down just testing that the formula does what I think the formula does
    const correctAnswer = (heroAvgLevel + BalanceData.effective0LevelStrength) * // hero average level
        PossessionData.dataT[destructibleName].healthPerLevelN! *
        structureHealthMultiplier *
        (balanceAgainstNumHeroes ? numHeroes : 1) *  // num heroes
        (1 + BalanceData.dungeonFloorDifficultyK * dungeonDepth)  // depth 3
    if (correctAnswer === 0) {
        TestUtility.assertTrue(humanoid.MaxHealth > 0)
    }
    else {
        // if our formula was in the exact same order as the internal formula we could use ===
        // instead using ApproxEqual, that'll let us move things around a bit without hassle
        TestUtility.assertTrue(MathXL.ApproxEqual(humanoid.MaxHealth, correctAnswer, 0.001))
    }
    TestUtility.assertTrue(humanoid.Health === humanoid.MaxHealth)
    destructible.Destroy()
}

function TestDestructibility(structureName: string) {
    let testSetup = new TestContext()
    testSetup.getInventoryMock().itemsT[structureName] = 1
    PlayerUtility.setBuildPoints(testSetup.getPlayer(), 1000)
    let map = MapUtility.makeEmptyMap(5)
    let [model, structure] = FurnishServer.Furnish(testSetup, new FloorInfo(), map, testSetup.getPlayer(), structureName, new Vector3(0, 0, 0), 0)
    TestUtility.assertTrue(FurnishUtility.CountFurnishings(structureName, testSetup.getPlayer())[1] === 1, "Client built 1 orc spawn")
    TestUtility.assertTrue(model !== undefined)
    let humanoid = model.FindFirstChild<Humanoid>("Humanoid")
    TestUtility.assertTrue(humanoid !== undefined, "Destructible structure has humanoid")
    if (humanoid) {
        Heroes.DoDirectDamage(testSetup, testSetup.getPlayer(), 10000, humanoid, false)
        TestUtility.assertTrue(humanoid.Health <= 0)
    }
    Workspace.FindFirstChild<Folder>("Building")!.ClearAllChildren()
    testSetup.clean()
}
// are destructible thing destructible

TestDestructibility("Barrel")
TestDestructibility("Fence")
TestDestructibility("GargoyleFountain")
TestDestructibility("Gate")
TestDestructibility("SpawnGhost")
TestDestructibility("SpawnOrc")
TestDestructibility("SpawnNecromancer")
TestDestructibility("SpawnGremlin")
TestDestructibility("SpawnSasquatch")
TestDestructibility("SpawnSkeleton")
TestDestructibility("SpawnWerewolf")
TestDestructibility("SpawnZombie")
TestDestructibility("WeaponsRack")
// trap doors are tested in DungeonTests

// why not use a loop? So if I accidentally make something undestructible by, say, commenting out a line in its data it will
// be flagged here
wait(1)

TestDestructibleCorrectHealth("TrapDoors", 0, 0, 0)
TestDestructibleCorrectHealth("TrapDoors", 7, 2, 3)
TestDestructibleCorrectHealth("GargoyleFountain", 7, 2, 3)
TestDestructibleCorrectHealth("Gate", 7, 1, 3)
TestDestructibleCorrectHealth("Fence", 5, 3, 1)
TestDestructibleCorrectHealth("Barrel", 5, 3, 4)

