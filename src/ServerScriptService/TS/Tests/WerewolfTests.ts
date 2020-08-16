
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea, LogLevel } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import * as Monsters from "ServerStorage/Standard/MonstersModule"

import { TestUtility } from "ReplicatedStorage/TS/TestUtility"
import { PlayerTracker } from "ServerStorage/TS/PlayerServer"
import { InventoryManagerStub, InventoryDataStoreStub } from "ServerStorage/TS/InventoryManagerStub"

import * as Costumes from "ServerStorage/Standard/CostumesServer"
import * as PlayerXL from "ServerStorage/Standard/PlayerXl"
import * as Werewolf from "ServerStorage/Standard/WerewolfModule"

import { ReplicatedStorage, ServerStorage } from "@rbxts/services"

// test werewolf toggle
{
    // arrange
    let playerDummy = TestUtility.getTestPlayer()
    //const testCharacter = ReplicatedStorage.FindFirstChild<Folder>("TestObjects")!.FindFirstChild<Model>("AnimationDummy")!.Clone()
    let testPlayerTracker = new PlayerTracker
    TestUtility.saveCostumeStub(playerDummy)
    testPlayerTracker.setClassChoice(playerDummy, "Werewolf")

    // starting as a werewolf
    let testCharacter = Costumes.LoadCharacter(
        playerDummy,
        [ServerStorage.FindFirstChild<Folder>("Monsters")!.FindFirstChild<Model>("Werewolf")!],
        {},
        true,
        undefined,
        new CFrame()
    )
    // PlayerXL.LoadCharacterWait( testPlayerTracker, playerDummy )
    DebugXL.Assert(testCharacter !== undefined)
    if (testCharacter) {
        let testInventoryMgr = new InventoryManagerStub()
        Monsters.PlayerCharacterAddedWait(testInventoryMgr, testCharacter, playerDummy, testPlayerTracker)

        // act
        Werewolf.ToggleForm(testPlayerTracker, testInventoryMgr, playerDummy)

        // assert
        DebugXL.Assert(playerDummy.Character!.FindFirstChild("Werewolf Head") === undefined)

        // act again (not being a control freak about one assert per test)
        Werewolf.ToggleForm(testPlayerTracker, testInventoryMgr, playerDummy)

        // assert
        DebugXL.Assert(playerDummy.Character!.FindFirstChild("Werewolf Head") !== undefined)
    }

    // clean
    TestUtility.cleanTestPlayer(playerDummy)
}