
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Players, Workspace } from "@rbxts/services"
import { PlayerUtility } from "ReplicatedStorage/TS/PlayerUtility"
import { PCClient } from "ReplicatedStorage/TS/PCClient"

import { getRuntimeCurtain } from "ReplicatedStorage/TS/CurtainGui"

let localPlayer = Players.LocalPlayer!
let playerGui = localPlayer.WaitForChild("PlayerGui") as PlayerGui

let noResetGui = playerGui.WaitForChild("NoResetGui") as ScreenGui

let serverButton = noResetGui.WaitForChild("LeftButtonColumn").WaitForChild<GuiButton>("Server")
serverButton.Visible = false

// code for choosing team
const chooseTeamFrame = noResetGui.WaitForChild<Frame>("ChooseTeam")
const chooseTeamGrid = chooseTeamFrame.WaitForChild<Frame>("Grid")
const closeButton = chooseTeamFrame.WaitForChild<ImageButton>("CloseButton")

const chooseTeamButton = script.Parent!.Parent!.WaitForChild("LeftButtonColumn").WaitForChild<TextButton>("ChooseTeam")

const choiceKeys = ["HeroChoice", "MonsterChoice", "DungeonLordChoice"]
const choiceFrames = choiceKeys.map((key) => chooseTeamGrid.WaitForChild<Frame>(key))
const choiceImageButtons = choiceFrames.map((frame) => frame.WaitForChild<ImageButton>("Image"))
const choiceTextButtons = choiceFrames.map((frame) => frame.WaitForChild<TextButton>("Choose"))

function makeTeamChoice(keyName: string) {
    mainRE.FireServer(keyName)
    chooseTeamFrame.Visible = false
}

for (let i = 0; i < choiceKeys.size(); i++) {
    const choiceKey = choiceKeys[i]
    choiceImageButtons[i].MouseButton1Click.Connect(() => { makeTeamChoice(choiceKey) })
    choiceTextButtons[i].MouseButton1Click.Connect(() => { makeTeamChoice(choiceKey) })
}

closeButton.MouseButton1Click.Connect(() => chooseTeamFrame.Visible = false)

let mainRE = Workspace.WaitForChild("Signals")!.WaitForChild("MainRE") as RemoteEvent

chooseTeamButton.MouseButton1Click.Connect(function () {
    DebugXL.logI(LogArea.UI, "Choose team button clicked")
    chooseTeamFrame.Visible = !chooseTeamFrame.Visible
})

// manage visibility
for (; ;) {
    wait(0.1)
    let curtain = getRuntimeCurtain()
    if ( curtain.getTransparency() > 0.99 && PlayerUtility.characterMatchesTeam(PCClient.pc, localPlayer.Team)) {
        chooseTeamButton.Visible = true
    }
    else {
        chooseTeamButton.Visible = false
        chooseTeamFrame.Visible = false
    }
}
