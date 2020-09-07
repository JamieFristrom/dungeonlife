
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import FurnishServer from "ServerStorage/Standard/FurnishServerModule"
import Dungeon from "ServerStorage/Standard/DungeonModule"

import { TestContext } from "ServerStorage/TS/TestContext"
import { Furnisher } from "ServerStorage/TS/Furnisher"

import FurnishUtility from "ReplicatedStorage/Standard/FurnishUtility"
import PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import { FloorInfo } from "ReplicatedStorage/TS/FloorInfo"
import { MapUtility } from "ReplicatedStorage/TS/DungeonMap"
import { PlayerUtility } from "ReplicatedStorage/TS/PlayerUtility"
import { TestUtility } from "ReplicatedStorage/TS/TestUtility"

// unable to place furnishing doesn't crash
{
    let testSetup = new TestContext()
    testSetup.getInventoryMock().itemsT["SpawnOrc"] = 1
    PlayerUtility.setBuildPoints(testSetup.getPlayer(), 1000)
    let map = MapUtility.makeEmptyMap(1)
    Furnisher.clientInitiatedFurnish(testSetup, map, testSetup.getPlayer(), "SpawnOrc", new Vector3(0, 0, 0), 0)
    TestUtility.assertTrue(FurnishUtility.CountFurnishings("SpawnOrc", testSetup.getPlayer())[1] === 0, "Client failed to build orc spawn out of bounds")
    testSetup.clean()
}
// placing a furnishing works
{
    let testSetup = new TestContext()
    testSetup.getInventoryMock().itemsT["SpawnOrc"] = 1
    PlayerUtility.setBuildPoints(testSetup.getPlayer(), 1000)
    let map = MapUtility.makeEmptyMap(5)
    Furnisher.clientInitiatedFurnish(testSetup, map, testSetup.getPlayer(), "SpawnOrc", new Vector3(0, 0, 0), 0)
    TestUtility.assertTrue(FurnishUtility.CountFurnishings("SpawnOrc", testSetup.getPlayer())[1] === 1, "Client built 1 orc spawn")
    testSetup.clean()
}
// placing a superboss spawn works; not client initiated
{
    let testSetup = new TestContext()
    const bossFloorInfo = new FloorInfo(false, new Map<string, boolean>([["SpawnCyclopsSuper", true]]))
    Dungeon.BuildWait(testSetup, bossFloorInfo, (player) => { })
    PlayerUtility.setBuildPoints(testSetup.getPlayer(), 1000)
    let map = MapUtility.makeEmptyMap(5)
    FurnishServer.PlaceSpawns(bossFloorInfo, [PossessionData.dataT["SpawnCyclopsSuper"]], 1)
    TestUtility.assertTrue(FurnishUtility.CountFurnishings("SpawnCyclopsSuper")[0] === 1, "Client built 1 superboss spawn")
    testSetup.clean()
}

