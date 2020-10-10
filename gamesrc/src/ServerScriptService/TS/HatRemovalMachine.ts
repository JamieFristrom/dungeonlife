
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI(LogArea.Executed, script.Name)

import { Workspace } from "@rbxts/services";

Workspace.ChildAdded.Connect((child) => {
    if (child.IsA("Hat")) {
        child.Destroy()
    }
})