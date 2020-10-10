
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())
import { ChestClientManager } from "ReplicatedStorage/TS/ChestClient"
import { WeaponsRackClientManager } from "ReplicatedStorage/TS/WeaponsRackClient"

ChestClientManager.run()
WeaponsRackClientManager.run()