
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Workspace, ReplicatedStorage } from "@rbxts/services"

import { ModelUtility } from "ReplicatedStorage/TS/ModelUtility";

{   // make sure nothing unanchored
    for (let descendant of Workspace.GetDescendants()) {
        if (descendant.IsA("BasePart"))
            if (!descendant.Anchored) {
                DebugXL.logW(LogArea.Parts, descendant.GetFullName() + " is not anchored")
            }
    }

    // test getting cframe of a bad model
    let errorMessage = ""
    const modelNoPrimaryPart = ReplicatedStorage.WaitForChild<Folder>("TestObjects").WaitForChild<Model>("ModelNoPrimaryPart")
    DebugXL.catchErrors((message) => {
        errorMessage = message
    })
    const cframe = ModelUtility.getPrimaryPartCFrameSafe(modelNoPrimaryPart)
    DebugXL.stopCatchingErrors()
    DebugXL.Assert(cframe !== undefined)
    DebugXL.Assert(cframe.p === new Vector3(0, 0, 0))
    DebugXL.Assert(errorMessage === "ReplicatedStorage.TestObjects.ModelNoPrimaryPart is missing its PrimaryPart")

 
}