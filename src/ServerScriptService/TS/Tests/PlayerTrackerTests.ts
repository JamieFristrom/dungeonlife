
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"
import { Monster } from "ReplicatedStorage/TS/Monster"

import { Players } from "@rbxts/services"
import { TestUtility } from "ReplicatedStorage/TS/TestUtility"

// test setting / retrieving record
{
    let testTracker = new PlayerTracker()
    let testPlayer = TestUtility.getTestPlayer()
    let testRecord = new Monster("Orc", [], 1)
    spawn( ()=>{
        testTracker.setCharacterRecordForPlayer(testPlayer, testRecord)
    })
    wait(1)
    let retrievedRecord = testTracker.getCharacterRecordFromPlayer(testPlayer)
    TestUtility.assertTrue(testRecord === retrievedRecord)
    TestUtility.cleanTestPlayer( testPlayer )
}

// test publishing class
{
    let testTracker = new PlayerTracker()
    let testPlayer = TestUtility.getTestPlayer()
    spawn( ()=>{
        testTracker.publishCharacterClass(testPlayer, "Necromancer")
    })
    wait(1)    
    let leaderstats = testPlayer.FindFirstChild<Model>("leaderstats")!
    TestUtility.assertTrue( leaderstats !== undefined )
    TestUtility.assertTrue( leaderstats.FindFirstChild<StringValue>("Class")!.Value === "Necromancer")
    TestUtility.cleanTestPlayer( testPlayer )
}

// test publishing level
{
    let testTracker = new PlayerTracker()
    let testPlayer = TestUtility.getTestPlayer()
    spawn( ()=>{
        testTracker.publishLevel(testPlayer, 666, 333)
    })
    wait(1)    
    let leaderstats = testPlayer.FindFirstChild<Model>("leaderstats")!
    TestUtility.assertTrue( leaderstats !== undefined )
    TestUtility.assertTrue( leaderstats.FindFirstChild<StringValue>("Level")!.Value === "666 (333)")
    TestUtility.cleanTestPlayer( testPlayer )
}