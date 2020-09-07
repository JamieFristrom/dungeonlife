
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { PlayerUtility } from "ReplicatedStorage/TS/PlayerUtility"

import { TestUtility, TestContext } from "ServerStorage/TS/TestUtility"

{
    let testContext = new TestContext()
    PlayerUtility.publishClientValues(testContext.getPlayer(), 666, 665, "Godly", true)
    let leaderstats = testContext.getPlayer().FindFirstChild<Model>("leaderstats")!
    TestUtility.assertTrue(leaderstats !== undefined)
    TestUtility.assertMatching(666, PlayerUtility.getBuildPoints(testContext.getPlayer()), "Build points set properly")
    TestUtility.assertTrue(leaderstats.FindFirstChild<StringValue>("Rank")!.Value === "Godly")
    TestUtility.assertTrue(leaderstats.FindFirstChild<StringValue>("VIP")!.Value === "VIP")
    TestUtility.assertTrue(testContext.getPlayer().FindFirstChild<NumberValue>("HeroRespawnCountdown")!.Value === 665)

    // cleanup
    testContext.clean()
}

