
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { Workspace, Players } from '@rbxts/services'

const playerGui = script.Parent!.Parent! as PlayerGui
const topGui = playerGui.WaitForChild<ScreenGui>("TopGui")
const preparationCountdownLabel = topGui.WaitForChild<TextLabel>("PreparationCountdown")
const preparationCountdownValueObj = Workspace.WaitForChild<Folder>("GameManagement").WaitForChild<NumberValue>("PreparationCountdown")

const localHeroPreparationCountdownObj = Players.LocalPlayer.WaitForChild<NumberValue>("HeroRespawnCountdown")

for (; ;) {
    wait(0.1)
    const preparationRemaining = math.ceil(math.max(preparationCountdownValueObj.Value, localHeroPreparationCountdownObj.Value))
    if (preparationRemaining > 0) {
        preparationCountdownLabel.Visible = true
        preparationCountdownLabel.Text = "Preparation " + preparationRemaining
    }
    else {
        preparationCountdownLabel.Visible = false
    }
}
