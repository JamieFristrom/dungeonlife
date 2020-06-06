// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI('Executed', script.Name)

import { ContextActionService, Players, Workspace } from "@rbxts/services";

import { GameplayTestUtility } from "ReplicatedStorage/TS/GameplayTestUtility"

import * as InventoryClient from "ReplicatedStorage/Standard/InventoryClientStd"
import * as MouseOver from "ReplicatedStorage/Standard/MouseOver"

let playerGui = Players.LocalPlayer!.WaitForChild('PlayerGui')
let audio = playerGui.WaitForChild("Audio")
let uiClick = audio.WaitForChild("UIClick") as Sound
let uiHover = audio.WaitForChild("UIHover") as Sound

let heroesRE = Workspace.WaitForChild('Signals').WaitForChild('HeroesRE') as RemoteEvent

function PotionEvent(inputState: Enum.UserInputState, funcName: string) {
    if (inputState === Enum.UserInputState.Begin) {
        //print( funcName )
        uiClick.Play()
        heroesRE.FireServer(funcName)
    }
}


let potionbarL = script.Parent!.Parent!.WaitForChild("PotionbarL") as Frame
let potionbarR = script.Parent!.Parent!.WaitForChild("PotionbarR") as Frame

potionbarL.GetPropertyChangedSignal("Visible").Connect(() => {
    if (potionbarL.Visible) {
        ContextActionService.BindAction("PotionHeal", (_: string, inputState: Enum.UserInputState) => { PotionEvent(inputState, "TakeBestHealthPotion") }, false, Enum.KeyCode.Q, Enum.KeyCode.ButtonL1)
    }
    else {
        ContextActionService.UnbindAction("PotionHeal")
    }
})


potionbarR.GetPropertyChangedSignal("Visible").Connect(() => {
    if (potionbarR.Visible) {
        ContextActionService.BindAction("PotionMana", (_: string, inputState: Enum.UserInputState) => { PotionEvent(inputState, "TakeBestManaPotion") }, false, Enum.KeyCode.E, Enum.KeyCode.ButtonR1)
    }
    else {
        ContextActionService.UnbindAction("PotionMana")
    }
})