
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"
import { Monster } from "ReplicatedStorage/TS/Monster"

import { TestUtility } from "ReplicatedStorage/TS/TestUtility"

// test setting / retrieving record
{
    let testTracker = new PlayerTracker()
    let testPlayer = TestUtility.createTestPlayer()
    let testRecord = new Monster("Orc", [], 1)
    spawn(() => {
        testTracker.setCharacterRecordForPlayer(testPlayer, testRecord)
    })
    wait(1)
    let retrievedRecord = testTracker.getCharacterRecordFromPlayer(testPlayer)
    TestUtility.assertTrue(testRecord === retrievedRecord)
    TestUtility.cleanTestPlayer(testPlayer)
}

// test publishing class
{
    let testTracker = new PlayerTracker()
    let testPlayer = TestUtility.createTestPlayer()
    spawn(() => {
        testTracker.publishCharacterClass(testPlayer, "Necromancer")
    })
    wait(1)
    let leaderstats = (testPlayer.FindFirstChild("leaderstats") as Model|undefined)!
    TestUtility.assertTrue(leaderstats !== undefined);
    TestUtility.assertTrue((leaderstats.FindFirstChild("Class") as StringValue).Value === "Necromancer")
    TestUtility.cleanTestPlayer(testPlayer)
}

// test publishing level
{
    let testTracker = new PlayerTracker()
    let testPlayer = TestUtility.createTestPlayer()
    spawn(() => {
        testTracker.publishLevel(testPlayer, 666, 333)
    })
    wait(1)
    let leaderstats = (testPlayer.FindFirstChild("leaderstats") as Model|undefined)!
    TestUtility.assertTrue(leaderstats !== undefined);
    TestUtility.assertTrue((leaderstats.FindFirstChild("Level") as StringValue).Value === "666 (333)")
    TestUtility.cleanTestPlayer(testPlayer)
}