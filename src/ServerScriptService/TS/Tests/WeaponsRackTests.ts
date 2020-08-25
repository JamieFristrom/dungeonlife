
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'

import { ReplicatedStorage, Workspace, Players, Teams } from "@rbxts/services"
import { WeaponsRack } from 'ServerStorage/TS/WeaponsRack'
import { TestUtility, TestContext } from 'ReplicatedStorage/TS/TestUtility'
import { Monster } from 'ReplicatedStorage/TS/Monster'
import FurnishServer from 'ServerStorage/Standard/FurnishServerModule'
import { MapUtility } from 'ReplicatedStorage/TS/DungeonMap'
import { ToolCaches } from 'ServerStorage/TS/ToolCaches'

// weapons racks don't give weapons to Dungeon Lords
{
    let testSetup = new TestContext()
    let clickable = ReplicatedStorage.FindFirstChild<Folder>("Shared Instances")!.FindFirstChild<Folder>("Placement Storage")!.FindFirstChild<Model>("WeaponsRack")!.Clone()
    clickable.Parent = Workspace.FindFirstChild<Folder>("Building")
    let rack = new WeaponsRack(testSetup, clickable)
    testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Monsters")
    let testRecord = new Monster("DungeonLord", [], 1);
    testSetup.getPlayerTracker().setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord);
    DebugXL.Assert(testRecord.gearPool.size() === 0)
    rack.use(testSetup.getPlayer())
    TestUtility.assertTrue(testRecord.gearPool.size() === 0, "Dungeon Lord clicked rack and got nothing")
    testSetup.clean()
}

// weapons rack clicked by monster gives monster enchanted weapon
{
    let testSetup = new TestContext()
    let clickable = ReplicatedStorage.FindFirstChild<Folder>("Shared Instances")!.FindFirstChild<Folder>("Placement Storage")!.FindFirstChild<Model>("WeaponsRack")!.Clone()
    clickable.Parent = Workspace.FindFirstChild<Folder>("Building")
    let rack = new WeaponsRack(testSetup, clickable)
    testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Monsters")
    let testRecord = new Monster("Orc", [], 1);
    testSetup.makeTestPlayerCharacter("Orc")
    testSetup.getPlayerTracker().setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord);
    DebugXL.Assert(testRecord.gearPool.size() === 0)
    rack.use(testSetup.getPlayer())
    TestUtility.assertTrue(testRecord.gearPool.countIf((flexTool) => flexTool.getTotalEnhanceLevels() > 0) > 0, "Monster clicked rack and got enchanted tools")
    testSetup.clean()
}

// weapons rack weapon goes in tool cache
{
    let testSetup = new TestContext()
    let clickable = ReplicatedStorage.FindFirstChild<Folder>("Shared Instances")!.FindFirstChild<Folder>("Placement Storage")!.FindFirstChild<Model>("WeaponsRack")!.Clone()
    clickable.Parent = Workspace.FindFirstChild<Folder>("Building")
    let rack = new WeaponsRack(testSetup, clickable)
    testSetup.makeTestPlayerCharacter("Orc")
    testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Monsters")
    let testRecord = new Monster("Orc", [], 1);
    testSetup.getPlayerTracker().setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord);
    DebugXL.Assert(testRecord.gearPool.size() === 0)
    rack.use(testSetup.getPlayer())
    TestUtility.assertTrue(testRecord.gearPool.countIf((flexTool) => flexTool.getTotalEnhanceLevels() > 0) > 0, "Monster clicked rack and got enchanted tools")
    TestUtility.assertTrue(ToolCaches.getToolCache(testSetup.getPlayer())!.FindFirstChild(testRecord.gearPool.getFromSlot(1)[0]!.baseDataS) !== undefined,
        "Weapon rack weapon in cache")
    testSetup.clean()
}

// test that creating is acknowledged by the client; this is an icky one, it can take a long time for the client to 
// spin up. If your PC is slower than mine this might fail on you intermittently?
{
    let testContext = new TestContext()
    testContext.getInventoryMock().itemsT["WeaponsRack"] = 1
    let [_, structure] = FurnishServer.Furnish(testContext, MapUtility.makeEmptyMap(5), testContext.getPlayer(), "WeaponsRack", new Vector3(0, 0, 0), 0)
    DebugXL.Assert(structure instanceof WeaponsRack)
    let weaponsRack = structure as WeaponsRack
    let startTime = tick()
    // wait the minimum amount of time possible, or 30 seconds
    while (tick() < startTime + 10) {
        if (weaponsRack.hasClientAcknowledged()) {
            break
        }
        wait()
    }
    DebugXL.Assert(weaponsRack.hasClientAcknowledged())
    testContext.clean()
}

{
    let testSetup = new TestContext()
    let clickable = ReplicatedStorage.FindFirstChild<Folder>("Shared Instances")!.FindFirstChild<Folder>("Placement Storage")!.FindFirstChild<Model>("WeaponsRack")!.Clone()
    clickable.Parent = Workspace.FindFirstChild<Folder>("Building")
    let rack = new WeaponsRack(testSetup, clickable)
    for (let i = 0; i < 10; i++) {
        testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Monsters")
        let testRecord = new Monster("Orc", [], 1);
        testSetup.makeTestPlayerCharacter("Orc")
        testSetup.getPlayerTracker().setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord);
        DebugXL.Assert(testRecord.gearPool.size() === 0)
        rack.use(testSetup.getPlayer())
        const [reward, _] = testRecord.gearPool.getFromSlot(1)
        TestUtility.assertTrue(reward!.baseDataS !== "ClawsWerewolf", "ClawsWerewolf inappropriate tool")
        TestUtility.assertTrue(reward!.baseDataS !== "ClawsDragon", "ClawsDragon inappropriate tool")
        TestUtility.assertTrue(reward!.baseDataS !== "DragonBolt", "DragonBolt inappropriate")
        TestUtility.assertTrue(reward!.baseDataS !== "NecroBolt", "NecroBolt inappropriate")
        const badjuju = ["str", "dex", "con", "will", "radiant"]
        for (let juju of badjuju) {
            TestUtility.assertTrue(reward!.enhancementsA.find((enhancement) => enhancement.flavorS === juju) === undefined, `Found unwanted enchantment ${juju}`)
        }
    }
    testSetup.clean()
}