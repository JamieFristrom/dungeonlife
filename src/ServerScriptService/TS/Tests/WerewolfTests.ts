
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea, LogLevel } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Teams } from "@rbxts/services"

import Werewolf from "ServerStorage/Standard/WerewolfModule"
import Monsters from "ServerStorage/Standard/MonstersModule"

import { SuperbossManager } from "ServerStorage/TS/SuperbossManager"
import { TestContext } from "ServerStorage/TS/TestContext"

import { TestUtility } from "ReplicatedStorage/TS/TestUtility"

// test werewolf toggle
{
    // arrange
    let testSetup = new TestContext()
    testSetup.getPlayer().Team = (Teams.FindFirstChild("Monsters") as Team|undefined)
    testSetup.getPlayerTracker().setClassChoice(testSetup.getPlayer(), "Werewolf")

    // starting as a werewolf
    let testCharacter = testSetup.makeTestPlayerCharacter("Werewolf")

    DebugXL.Assert(testCharacter !== undefined)  // this would be a malfunction in the test system, not a test assert
    if (testCharacter) {
        Monsters.PlayerCharacterAddedWait(testSetup, testCharacter, testSetup.getPlayer(), new SuperbossManager(), 1)
        const characterRecord = testSetup.getPlayerTracker().getCharacterRecordFromCharacter(testCharacter)
        let itemKey = characterRecord.getPossessionKeyFromSlot(1)
        TestUtility.assertTrue(itemKey !== undefined, "Starting werewolf has weapon 1")
        itemKey = characterRecord.getPossessionKeyFromSlot(2)
        TestUtility.assertTrue(itemKey !== undefined, "Starting werewolf has weapon 2")

        // act
        Werewolf.ToggleForm(testSetup.getPlayerTracker(), testSetup.getInventoryMgr(), testSetup.getPlayer())

        // assert
        TestUtility.assertTrue(testSetup.getPlayer().Character!.FindFirstChild("Werewolf Head") === undefined, "Toggled werewolf has no wolf head")
        // assert has weapons in slots
        itemKey = characterRecord.getPossessionKeyFromSlot(1)
        TestUtility.assertTrue(itemKey !== undefined, "Undercover werewolf has weapon 1")
        itemKey = characterRecord.getPossessionKeyFromSlot(2)
        TestUtility.assertTrue(itemKey !== undefined, "Undercover werewolf has weapon 2")

        // act again (not being a control freak about one assert per test)
        Werewolf.ToggleForm(testSetup.getPlayerTracker(), testSetup.getInventoryMgr(), testSetup.getPlayer())

        // assert
        TestUtility.assertTrue(testSetup.getPlayer().Character!.FindFirstChild("Werewolf Head") !== undefined, "Reverted werewolf has wolf head")
        itemKey = characterRecord.getPossessionKeyFromSlot(1)
        TestUtility.assertTrue(itemKey !== undefined, "Reverted werewolf has weapon 1")
        itemKey = characterRecord.getPossessionKeyFromSlot(2)
        TestUtility.assertTrue(itemKey !== undefined, "Reverted werewolf has weapon 2")
    }

    // clean
    testSetup.clean()
}