
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea, LogLevel } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import * as Monsters from "ServerStorage/Standard/MonstersModule"

import { TestUtility, TypicalTestSetup } from "ReplicatedStorage/TS/TestUtility"
import { SuperbossManager } from "ServerStorage/TS/SuperbossManager"

import * as Costumes from "ServerStorage/Standard/CostumesServer"
import * as Werewolf from "ServerStorage/Standard/WerewolfModule"

import { ServerStorage, Teams } from "@rbxts/services"

// test werewolf toggle
{
    // arrange
    let testSetup = new TypicalTestSetup()
    testSetup.player.Team = Teams.FindFirstChild<Team>("Monsters")
    testSetup.playerTracker.setClassChoice(testSetup.player, "Werewolf")

    // starting as a werewolf
    let testCharacter = Costumes.LoadCharacter(
        testSetup.player,
        [ServerStorage.FindFirstChild<Folder>("Monsters")!.FindFirstChild<Model>("Werewolf")!],
        {},
        true,
        undefined,
        new CFrame()
    )
    DebugXL.Assert(testCharacter !== undefined)  // this would be a malfunction in the test system, not a test assert
    if (testCharacter) {
        Monsters.PlayerCharacterAddedWait(testSetup.inventory, testCharacter, testSetup.player, testSetup.playerTracker, new SuperbossManager(), 1)

        // act
        Werewolf.ToggleForm(testSetup.playerTracker, testSetup.inventory, testSetup.player)

        // assert
        TestUtility.assertTrue(testSetup.player.Character!.FindFirstChild("Werewolf Head") === undefined)

        // act again (not being a control freak about one assert per test)
        Werewolf.ToggleForm(testSetup.playerTracker, testSetup.inventory, testSetup.player)

        // assert
        TestUtility.assertTrue(testSetup.player.Character!.FindFirstChild("Werewolf Head") !== undefined)
    }

    // clean
    testSetup.clean()
}