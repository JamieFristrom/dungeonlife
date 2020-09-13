
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { InstanceUtility } from "ReplicatedStorage/TS/InstanceUtility"
import { PlayerUtility } from "ReplicatedStorage/TS/PlayerUtility"

import { ServerStorage } from "@rbxts/services"
import { TestUtility } from "ReplicatedStorage/TS/TestUtility"

let testWorkspace = InstanceUtility.findOrCreateChild<Folder>(ServerStorage, "TestWorkspace", "Folder")
PlayerUtility.publishClientValues( testWorkspace as unknown as Player, 666, 665, "Godly", true  )
let leaderstats = (testWorkspace.FindFirstChild("leaderstats") as Model|undefined)!
TestUtility.assertTrue( leaderstats !== undefined )
TestUtility.assertTrue( (testWorkspace.FindFirstChild("BuildPointsTotal") as NumberValue|undefined)!.Value === 666)
TestUtility.assertTrue( (leaderstats.FindFirstChild("Rank") as StringValue|undefined)!.Value==="Godly")
TestUtility.assertTrue( (leaderstats.FindFirstChild("VIP") as StringValue|undefined)!.Value==="VIP")
TestUtility.assertTrue( (testWorkspace.FindFirstChild("HeroRespawnCountdown") as NumberValue|undefined)!.Value===665)
// cleanup
testWorkspace.Destroy()