
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'

import { TestContext, TestUtility } from 'ServerStorage/TS/TestUtility'
import { Furnisher } from 'ServerStorage/TS/Furnisher'

import { MapUtility } from 'ReplicatedStorage/TS/DungeonMap'

import FurnishUtility from 'ReplicatedStorage/Standard/FurnishUtility'
import InstanceXL from 'ReplicatedStorage/Standard/InstanceXL'

import { Workspace } from '@rbxts/services'


// unable to place furnishing doesn't crash
{
    let testSetup = new TestContext()
    testSetup.getInventoryMock().itemsT["SpawnOrc"] = 1
    InstanceXL.CreateSingleton("NumberValue", { Name: "BuildPoints", Parent: testSetup.getPlayer(), Value: 1000 })
    let map = MapUtility.makeEmptyMap(1)
    Furnisher.clientInitiatedFurnish(testSetup, map, testSetup.getPlayer(), "SpawnOrc", new Vector3(0, 0, 0), 0)
    TestUtility.assertTrue(FurnishUtility.CountFurnishings("SpawnOrc", testSetup.getPlayer())[1] === 0, "Client failed to build orc spawn out of bounds")
    testSetup.clean()
}
// placing a furnishing works
{
    let testSetup = new TestContext()
    testSetup.getInventoryMock().itemsT["SpawnOrc"] = 1
    InstanceXL.CreateSingleton("NumberValue", { Name: "BuildPoints", Parent: testSetup.getPlayer(), Value: 1000 })
    let map = MapUtility.makeEmptyMap(5)
    Furnisher.clientInitiatedFurnish(testSetup, map, testSetup.getPlayer(), "SpawnOrc", new Vector3(0, 0, 0), 0)
    TestUtility.assertTrue(FurnishUtility.CountFurnishings("SpawnOrc", testSetup.getPlayer())[1] === 1, "Client built 1 orc spawn")
    Workspace.FindFirstChild<Folder>("Building")!.ClearAllChildren()
    testSetup.clean()
}

