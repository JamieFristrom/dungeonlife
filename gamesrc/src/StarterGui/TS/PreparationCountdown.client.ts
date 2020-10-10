
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Workspace, Players } from '@rbxts/services'

const playerGui = script.Parent!.Parent! as PlayerGui
const topGui = (playerGui.WaitForChild("TopGui") as ScreenGui)
const preparationCountdownLabel = (topGui.WaitForChild("PreparationCountdown") as TextLabel)
const preparationCountdownValueObj = (Workspace.WaitForChild("GameManagement").WaitForChild("PreparationCountdown") as NumberValue)

const localHeroPreparationCountdownObj = (Players.LocalPlayer.WaitForChild("HeroRespawnCountdown") as NumberValue)

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
