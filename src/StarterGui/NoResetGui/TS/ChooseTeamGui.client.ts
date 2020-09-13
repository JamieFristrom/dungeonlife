
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

let serverButton = (noResetGui.WaitForChild("LeftButtonColumn").WaitForChild("Server") as GuiButton)
serverButton.Visible = false

// code for choosing team
const chooseTeamFrame = (noResetGui.WaitForChild("ChooseTeam") as Frame)
const chooseTeamGrid = (chooseTeamFrame.WaitForChild("Grid") as Frame)
const closeButton = (chooseTeamFrame.WaitForChild("CloseButton") as ImageButton)

const chooseTeamButton = (script.Parent!.Parent!.WaitForChild("LeftButtonColumn").WaitForChild("ChooseTeam") as TextButton)

const choiceKeys = ["HeroChoice", "MonsterChoice", "DungeonLordChoice"]
const choiceFrames = choiceKeys.map((key) => (chooseTeamGrid.WaitForChild(key) as Frame))
const choiceImageButtons = choiceFrames.map((frame) => (frame.WaitForChild("Image") as ImageButton))
const choiceTextButtons = choiceFrames.map((frame) => (frame.WaitForChild("Choose") as TextButton))

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
