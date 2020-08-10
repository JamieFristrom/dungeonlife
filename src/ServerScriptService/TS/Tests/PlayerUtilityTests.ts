
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { InstanceUtility } from "ReplicatedStorage/TS/InstanceUtility"
import { PlayerUtility } from "ReplicatedStorage/TS/PlayerUtility"

import { ServerStorage } from "@rbxts/services"

let testWorkspace = InstanceUtility.findOrCreateChild<Folder>(ServerStorage, "TestWorkspace", "Folder")
PlayerUtility.publishClientValues( testWorkspace as unknown as Player, 666, 665, "Godly", true  )
let leaderstats = testWorkspace.FindFirstChild<Model>("leaderstats")!
DebugXL.Assert( leaderstats !== undefined )
DebugXL.Assert( testWorkspace.FindFirstChild<NumberValue>("BuildPoints")!.Value === 666)
DebugXL.Assert( leaderstats.FindFirstChild<StringValue>("Rank")!.Value==="Godly")
DebugXL.Assert( leaderstats.FindFirstChild<StringValue>("VIP")!.Value==="VIP")
DebugXL.Assert( testWorkspace.FindFirstChild<NumberValue>("HeroRespawnCountdown")!.Value===665)
// cleanup
testWorkspace.Destroy()