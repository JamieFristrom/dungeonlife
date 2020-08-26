
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea, LogLevel } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import * as Monsters from "ServerStorage/Standard/MonstersModule"

import { TestUtility, TestContext } from "ServerStorage/TS/TestUtility"
import { SuperbossManager } from "ServerStorage/TS/SuperbossManager"

import * as Costumes from "ServerStorage/Standard/CostumesServer"
import * as Werewolf from "ServerStorage/Standard/WerewolfModule"

import { ServerStorage, Teams } from "@rbxts/services"

// test werewolf toggle
{
    // arrange
    let testSetup = new TestContext()
    testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Monsters")
    testSetup.getPlayerTracker().setClassChoice(testSetup.getPlayer(), "Werewolf")

    // starting as a werewolf
    let testCharacter = testSetup.makeTestPlayerCharacter("Werewolf")

    DebugXL.Assert(testCharacter !== undefined)  // this would be a malfunction in the test system, not a test assert
    if (testCharacter) {
        Monsters.PlayerCharacterAddedWait(testSetup.getInventoryMgr(), testCharacter, testSetup.getPlayer(), testSetup.getPlayerTracker(), new SuperbossManager(), 1)

        // act
        Werewolf.ToggleForm(testSetup.getPlayerTracker(), testSetup.getInventoryMgr(), testSetup.getPlayer())

        // assert
        TestUtility.assertTrue(testSetup.getPlayer().Character!.FindFirstChild("Werewolf Head") === undefined)
        // assert has weapons in slots
        const characterRecord = testSetup.getPlayerTracker().getCharacterRecordFromCharacter(testCharacter)
        const item1Key = characterRecord.getPossessionKeyFromSlot(1)
        TestUtility.assertTrue(item1Key!==undefined, "Werewolf has weapon 1")
        const item2Key = characterRecord.getPossessionKeyFromSlot(2)
        TestUtility.assertTrue(item1Key!==undefined, "Werewolf has weapon 2")

        // act again (not being a control freak about one assert per test)
        Werewolf.ToggleForm(testSetup.getPlayerTracker(), testSetup.getInventoryMgr(), testSetup.getPlayer())

        // assert
        TestUtility.assertTrue(testSetup.getPlayer().Character!.FindFirstChild("Werewolf Head") !== undefined)
        const item3Key = characterRecord.getPossessionKeyFromSlot(1)
        TestUtility.assertTrue(item1Key!==undefined, "Werewolf in human form has weapon 1")
    }

    // clean
    testSetup.clean()
}