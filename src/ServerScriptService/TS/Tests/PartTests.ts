
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Workspace, ReplicatedStorage } from "@rbxts/services"

import { ModelUtility } from "ReplicatedStorage/TS/ModelUtility";
import { TestUtility } from "ReplicatedStorage/TS/TestUtility";

{   // make sure nothing unanchored
    for (let descendant of Workspace.GetDescendants()) {
        if (descendant.IsA("BasePart"))
            if (!descendant.Anchored) {
                DebugXL.logW(LogArea.Parts, descendant.GetFullName() + " is not anchored")
            }
    }

    // test getting cframe of a bad model
    let errorMessage = ""
    const modelNoPrimaryPart = (ReplicatedStorage.WaitForChild("TestObjects").WaitForChild("ModelNoPrimaryPart") as Model)
    DebugXL.catchErrors((message) => {
        errorMessage = message
    })
    const cframe = ModelUtility.getPrimaryPartCFrameSafe(modelNoPrimaryPart)
    DebugXL.stopCatchingErrors()
    TestUtility.assertTrue(cframe !== undefined)
    TestUtility.assertTrue(cframe.Position === new Vector3(0, 0, 0))
    TestUtility.assertTrue(errorMessage === "ReplicatedStorage.TestObjects.ModelNoPrimaryPart is missing its PrimaryPart")
}
