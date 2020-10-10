
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Players } from "@rbxts/services"

import { ClickableUI } from "ReplicatedStorage/TS/ClickableUI"

let localPlayer = Players.LocalPlayer!

while (true) {
    wait(0.25)
    if (localPlayer.Team ) {
        if (localPlayer.Character && localPlayer.Character.PrimaryPart) {
            ClickableUI.updateClickableUIs( localPlayer.Team, localPlayer.Character )
        }
    }
}
