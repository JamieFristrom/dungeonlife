
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI("Executed", script.GetFullName())

export namespace ModelUtility {
    // always returns a cframe but will return identity if primary part is missing
    export function getPrimaryPartCFrameSafe(model: Model) {
        DebugXL.Assert(model.IsA("Model"))
        const primaryPart = model.PrimaryPart
        if (primaryPart) {
            return primaryPart.CFrame
        }
        else {
            DebugXL.Error(model.GetFullName() + " is missing its PrimaryPart")
            return new CFrame()
        }
    }
}

export type Character = Model
