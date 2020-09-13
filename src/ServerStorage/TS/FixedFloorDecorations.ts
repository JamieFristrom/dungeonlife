
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import * as FloorData from "ReplicatedStorage/Standard/FloorData"
import { Workspace, ServerStorage } from "@rbxts/services";

export namespace FixedFloorDecorations {
    export function Setup() {
        FixedFloorDecorations.Clean()
        FloorData.CurrentFloor().fixedFloorDecorations.forEach(function (volFXName) {
            let volFXInst = (ServerStorage.FindFirstChild('FixedFloorDecorations')!.FindFirstChild(volFXName) as Instance|undefined)!.Clone()
            volFXInst.Parent = Workspace.FindFirstChild('FixedFloorDecorations')
        })
    }

    export function Clean() {
        Workspace.FindFirstChild('FixedFloorDecorations')!.ClearAllChildren()
    }
}