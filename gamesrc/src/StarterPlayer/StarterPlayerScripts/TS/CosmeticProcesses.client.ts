
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { RunService, Workspace } from "@rbxts/services";
import { ModelUtility } from "ReplicatedStorage/TS/ModelUtility";

let buildingFolder = (Workspace.WaitForChild("Building") as Folder)

buildingFolder.ChildAdded.Connect((thing) => {
    if (thing.Name === "SpawnNecromancer" || thing.Name === "SpawnDaemonSuper") {
        let rotatingBit = (thing.WaitForChild("RotatingBit") as Model)
        while (!rotatingBit.PrimaryPart) wait()
        let startCFrame = ModelUtility.getPrimaryPartCFrameSafe(rotatingBit)
        let connection = RunService.RenderStepped.Connect(() => {
            if (!rotatingBit.Parent || !rotatingBit.PrimaryPart) {
                connection.Disconnect()
            }
            else {
                let rads = tick() / 4
                rotatingBit.SetPrimaryPartCFrame(startCFrame.mul(CFrame.fromEulerAnglesYXZ(0, rads % (math.pi * 2), 0)))
            }
        })
    }
})
