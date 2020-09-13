
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { TestContext } from "ServerStorage/TS/TestContext"

import { PlayerUtility } from "ReplicatedStorage/TS/PlayerUtility"
import { TestUtility } from "ReplicatedStorage/TS/TestUtility"

{
    let testContext = new TestContext()
    PlayerUtility.publishClientValues(testContext.getPlayer(), 666, 665, "Godly", true)
    let leaderstats = (testContext.getPlayer().FindFirstChild("leaderstats") as Model|undefined)!
    TestUtility.assertTrue(leaderstats !== undefined)
    TestUtility.assertMatching(666, PlayerUtility.getBuildPoints(testContext.getPlayer()), "Build points set properly")
    TestUtility.assertTrue((leaderstats.FindFirstChild("Rank") as StringValue|undefined)!.Value === "Godly")
    TestUtility.assertTrue((leaderstats.FindFirstChild("VIP") as StringValue|undefined)!.Value === "VIP")
    TestUtility.assertTrue((testContext.getPlayer().FindFirstChild("HeroRespawnCountdown") as NumberValue|undefined)!.Value === 665)

    // cleanup
    testContext.clean()
}

