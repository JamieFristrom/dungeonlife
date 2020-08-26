
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { InstanceUtility } from "ReplicatedStorage/TS/InstanceUtility"

import { ServerStorage } from "@rbxts/services"
import { TestUtility } from "ServerStorage/TS/TestUtility"

let createdChild = InstanceUtility.findOrCreateChild<NumberValue>( ServerStorage, "TestChild", "NumberValue")
TestUtility.assertTrue( createdChild !== undefined )
TestUtility.assertTrue( createdChild.Parent === ServerStorage )

let duplicatedChild = InstanceUtility.findOrCreateChild<NumberValue>( ServerStorage, "TestChild", "NumberValue")
TestUtility.assertTrue( duplicatedChild !== undefined )
TestUtility.assertTrue( duplicatedChild === createdChild )

createdChild.Destroy()