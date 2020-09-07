
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Players, Workspace } from "@rbxts/services"

import * as InputXL from "ReplicatedStorage/Standard/InputXL"

import { ModelUtility } from "ReplicatedStorage/TS/ModelUtility"
import { BlueprintUtility } from "./BlueprintUtility"

type Character = Model

export namespace ClickableUI {
    export function updateClickableUIs(localPlayerTeam: Team, localCharacter: Character) {
        let chestGuiTemplate = Players.LocalPlayer.WaitForChild<PlayerGui>("PlayerGui").WaitForChild<ScreenGui>("HUDGui").WaitForChild<BillboardGui>("ChestGui")
        let buildingFolder = Workspace.WaitForChild<Folder>("Building")
        for (let furnishing of buildingFolder.GetChildren()) {
            if (furnishing.FindFirstChild<BasePart>("ClickBox")) {
                DebugXL.Assert(furnishing.IsA("Model"))
                if (furnishing.IsA("Model")) {
                    const whatTeams = BlueprintUtility.getBlueprintDatum(furnishing as Model).clickableByTeam
                    if( whatTeams!.has( localPlayerTeam.Name ) ) {
                        ClickableUI.handleClickableTooltip(furnishing as Model, localCharacter, chestGuiTemplate)
                    }
                }
            }
        }
    }

    export function handleClickableTooltip(clickable: Model, localCharacter: Character, chestGuiTemplate: BillboardGui ) {
        let origin = clickable.FindFirstChild<Part>("Origin")
        // no reason to assume it hasn't been destroyed or hasn't been created yet
        if (origin) {
            let chestGui = origin.FindFirstChild<BillboardGui>("ChestGui")
            let lidOpen = clickable.FindFirstChild("LidOpen") as BoolValue
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
                let holdingTool = localCharacter.FindFirstChildWhichIsA("Tool")
                let distance = (ModelUtility.getPrimaryPartCFrameSafe(localCharacter!).p.sub(origin.Position)).Magnitude
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
}
