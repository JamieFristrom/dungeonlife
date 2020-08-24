
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Teams, Players, Workspace } from "@rbxts/services"

import * as InputXL from "ReplicatedStorage/Standard/InputXL"

import { ModelUtility } from "ReplicatedStorage/TS/ModelUtility"
import { BlueprintUtility } from "ReplicatedStorage/TS/BlueprintUtility"

let localPlayer = Players.LocalPlayer!
let chestGuiTemplate = script.Parent!.Parent!.WaitForChild("ChestGui")

let buildingFolder = Workspace.WaitForChild<Folder>("Building")

function handleClickableTooltip(chest: Model) {
    let origin = chest.FindFirstChild<Part>("Origin")
    DebugXL.Assert(origin !== undefined)
    if (origin) {
        let chestGui = origin.FindFirstChild<BillboardGui>("ChestGui")
        let lidOpen = chest.FindFirstChild("LidOpen") as BoolValue
        if (lidOpen && lidOpen.Value === true) {
            if (chestGui) {
                chestGui.Parent = undefined
            }
        }
        else {
            if (!chestGui) {
                chestGui = chestGuiTemplate.Clone() as BillboardGui
                chestGui.Parent = origin
            }
            chestGui.FindFirstChild<GuiObject>("ButtonIcon")!.Visible = false
            let holdingTool = localPlayer.Character!.FindFirstChildWhichIsA("Tool")
            let distance = (ModelUtility.getPrimaryPartCFrameSafe(localPlayer.Character!).p.sub(origin.Position)).Magnitude
            if (distance < 20) {
                let instructions = chestGui.FindFirstChild<TextLabel>("Instructions")
                DebugXL.Assert(instructions !== undefined)
                if (instructions) {
                    chestGui.Enabled = true
                    if (holdingTool) {
                        instructions.Text = "Put away tool to open"
                    }
                    else {
                        if (distance > 10) {
                            instructions.Text = "Come closer to open"
                        }
                        else {
                            if (InputXL.UsingGamepad()) {
                                instructions.Text = ""
                                chestGui.FindFirstChild<GuiObject>("ButtonIcon")!.Visible = true
                            }
                            else {
                                instructions.Text = "Click to open"
                            }
                        }
                    }
                }
                else {
                    chestGui.Enabled = false
                }
            }
        }
    }
}

let booya = 0

while (true) {
    wait(0.25)
    if (localPlayer.Team ) {
        if (localPlayer.Character && localPlayer.Character.PrimaryPart) {
            for (let furnishing of buildingFolder.GetChildren()) {
                if(furnishing.Name==="WeaponsRack") {
                    booya++
                }
                if (furnishing.FindFirstChild<BasePart>("ClickBox")) {
                    DebugXL.Assert(furnishing.IsA("Model"))
                    if (furnishing.IsA("Model")) {
                        const whatTeams = BlueprintUtility.getBlueprintDatum(furnishing as Model).clickableByTeam
                        if( whatTeams!.has( localPlayer.Team!.Name ) ) {
                            handleClickableTooltip(furnishing as Model)
                        }
                    }
                }
            }
        }
    }
}
