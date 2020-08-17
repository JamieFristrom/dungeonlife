
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI(LogArea.Executed, script.Name)

import { SuperbossManager } from "ServerStorage/TS/SuperbossManager"
import { TestUtility, TypicalTestSetup } from "ReplicatedStorage/TS/TestUtility";
import Costumes from "ServerStorage/Standard/CostumesServer";
import { ServerStorage, Teams } from "@rbxts/services";
import Monsters from "ServerStorage/Standard/MonstersModule";
import { MobServer } from "ServerStorage/TS/MobServer";
import { PlayerTracker } from "ServerStorage/TS/PlayerServer";

// unit tests on manager
{
    // assert that superboss isn't defeated until they're defeated
    let superbossMgr = new SuperbossManager()
    let character = TestUtility.getTestCharacter()
    superbossMgr.noteSuperbossSpawned(character, 1)
    TestUtility.assertTrue(!superbossMgr.superbossDefeated(1), "New character not defeated")
}

{
    // assert that superboss is defeated when their health <= 0
    let superbossMgr = new SuperbossManager()
    let character = TestUtility.getTestCharacter()
    superbossMgr.noteSuperbossSpawned(character, 2)
    character.FindFirstChild<Humanoid>("Humanoid")!.Health = 0
    TestUtility.assertTrue(superbossMgr.superbossDefeated(2), "Health 0 superboss defeated")
}

{
    // assert that superboss that is lost is defeated
    let superbossMgr = new SuperbossManager()
    let character = TestUtility.getTestCharacter()
    superbossMgr.noteSuperbossSpawned(character, 3)
    character.Parent = undefined
    TestUtility.assertTrue(superbossMgr.superbossDefeated(3), "lost superboss defeated")
}

{
    // assert that superboss that is destroyed is defeated
    let superbossMgr = new SuperbossManager()
    let character = TestUtility.getTestCharacter()
    superbossMgr.noteSuperbossSpawned(character, 4)
    character.Destroy()
    TestUtility.assertTrue(superbossMgr.superbossDefeated(4), "destroyed superboss defeated")
}

{
    // assert that superboss destroyed in a previous session doesn't count 
    let superbossMgr = new SuperbossManager()
    let character = TestUtility.getTestCharacter()
    superbossMgr.noteSuperbossSpawned(character, 1)
    character.Destroy()
    TestUtility.assertTrue(!superbossMgr.superbossDefeated(2), "destroyed superboss previous session not defeated")
}

// integration test of golden path  - player superboss
{
    let testSetup = new TypicalTestSetup()
    let superbossMgr = new SuperbossManager() 
    testSetup.player.Team = Teams.FindFirstChild<Team>("Monsters")
    testSetup.playerTracker.setClassChoice(testSetup.player, "CyclopsSuper")

    let testCharacter = Costumes.LoadCharacter(
        testSetup.player,
        [ServerStorage.FindFirstChild<Folder>("Monsters")!.FindFirstChild<Model>("CyclopsSuper")!],
        {},
        true,
        undefined,
        new CFrame()
    )
    DebugXL.Assert(testCharacter !== undefined)  // this would be a malfunction in the test system, not a test assert
    if (testCharacter) {
        Monsters.PlayerCharacterAddedWait(testSetup.inventory, testCharacter, testSetup.player, testSetup.playerTracker, superbossMgr, 1)
        TestUtility.assertTrue(!superbossMgr.superbossDefeated(1), "Superboss not defeated yet")
        testCharacter.Destroy()
        TestUtility.assertTrue(superbossMgr.superbossDefeated(1), "Superboss defeated")
        TestUtility.assertTrue(!superbossMgr.superbossDefeated(2), "Superboss next level not yet defeated")
        // let's make a new superboss
        let testCharacter2 = Costumes.LoadCharacter(
            testSetup.player,
            [ServerStorage.FindFirstChild<Folder>("Monsters")!.FindFirstChild<Model>("CyclopsSuper")!],
            {},
            true,
            undefined,
            new CFrame()
        )
        DebugXL.Assert(testCharacter2 !== undefined)  // this would be a malfunction in the test system, not a test assert
        if (testCharacter2) {
            Monsters.PlayerCharacterAddedWait(testSetup.inventory, testCharacter2, testSetup.player, testSetup.playerTracker, superbossMgr, 2)
            TestUtility.assertTrue(!superbossMgr.superbossDefeated(2), "Superboss next level not yet defeated after spawn")
            testCharacter2.Destroy()
            TestUtility.assertTrue(superbossMgr.superbossDefeated(2), "Superboss next level not yet defeated after spawn")
        }
    }

    // clean
    testSetup.clean()
}

// integration test of golden path  - mob superboss
{
    let superbossMgr = new SuperbossManager()
    let playerTracker = new PlayerTracker()
    let testCharacter = MobServer.spawnMob(playerTracker,"CyclopsSuper", superbossMgr, 1)
    DebugXL.Assert(testCharacter !== undefined)  // this would be a malfunction in the test system, not a test assert
    DebugXL.Assert(testCharacter.Parent !== undefined)  // this would be a malfunction in the test system, not a test assert
    if (testCharacter) {
        TestUtility.assertTrue(!superbossMgr.superbossDefeated(1), "Superboss not defeated yet")
        testCharacter.Destroy()
        TestUtility.assertTrue(superbossMgr.superbossDefeated(1), "Superboss defeated")
        TestUtility.assertTrue(!superbossMgr.superbossDefeated(2), "Superboss next level not yet defeated")
        // let's make a new superboss
        let testCharacter2 = MobServer.spawnMob(playerTracker, "CyclopsSuper", superbossMgr, 2)
        DebugXL.Assert(testCharacter2 !== undefined)  // this would be a malfunction in the test system, not a test assert
        if (testCharacter2) {
            TestUtility.assertTrue(!superbossMgr.superbossDefeated(2), "Superboss next level not yet defeated after spawn")
            testCharacter2.Destroy()
            TestUtility.assertTrue(superbossMgr.superbossDefeated(2), "Superboss next level not yet defeated after spawn")
        }
    }
}