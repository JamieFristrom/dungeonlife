
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { InstanceUtility } from "ReplicatedStorage/TS/InstanceUtility"

import { ServerStorage } from "@rbxts/services"

let createdChild = InstanceUtility.findOrCreateChild<NumberValue>( ServerStorage, "TestChild", "NumberValue")
DebugXL.Assert( createdChild !== undefined )
DebugXL.Assert( createdChild.Parent === ServerStorage )

let duplicatedChild = InstanceUtility.findOrCreateChild<NumberValue>( ServerStorage, "TestChild", "NumberValue")
DebugXL.Assert( duplicatedChild !== undefined )
DebugXL.Assert( duplicatedChild === createdChild )

createdChild.Destroy()