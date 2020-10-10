
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Workspace, Players, Teams } from "@rbxts/services";
import { ModelUtility } from "ReplicatedStorage/TS/ModelUtility";

let localPlayer = Players.LocalPlayer!

let exitGuiTemplate = (script.Parent!.Parent!.WaitForChild("ExitGui") as BillboardGui)

for (; ;) {
    wait(0.25)
    if (localPlayer.Team === Teams.WaitForChild('Heroes')) {
        if (localPlayer.Character && localPlayer.Character.PrimaryPart) {
            let downStaircase = (Workspace.WaitForChild('Environment').FindFirstChild("DownStaircase") as Model|undefined)
            if (downStaircase) {
                let primaryPart = downStaircase.PrimaryPart
                if (primaryPart) {
                    let exitGui = (primaryPart.FindFirstChild("ExitGui") as BillboardGui|undefined)
                    if (!exitGui) {
                        exitGui = exitGuiTemplate.Clone()
                        exitGui.Parent = primaryPart
                        exitGui.Enabled = true
                    }
                    let distance = ModelUtility.getPrimaryPartCFrameSafe(localPlayer.Character).Position.sub(primaryPart.Position).Magnitude
                    exitGui.Enabled = distance < 30
                }
            }
        }
    }
}

