
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Workspace, Players } from "@rbxts/services"


import * as CheatUtilityXL from "ReplicatedStorage/TS/CheatUtility"
import { LogService } from '@rbxts/services'


const debugGui = script.Parent!.Parent!
const debugMenuButton = debugGui.WaitForChild<TextButton>("DebugMenuButton")
const standardFolder = Workspace.WaitForChild<Folder>("Standard")
const debugGuiRE = standardFolder.WaitForChild<RemoteEvent>("DebugGuiRE")
const errorReport = debugGui.WaitForChild<Frame>("ErrorReport")
const output = errorReport.WaitForChild<TextLabel>("Output")

const debugMenu = script.Parent!.Parent!.WaitForChild<Frame>("DebugMenu")
const testMobTPExploit = debugMenu.WaitForChild<TextButton>("TestMobTPExploit")

while (!Players.LocalPlayer) {
	wait(1)
}

for( let button of debugMenu.GetChildren()) {
	if( button.IsA("TextButton")) {
		button.Text = button.Name
	}
}

if (CheatUtilityXL.PlayerWhitelisted(Players.LocalPlayer)) {

	debugMenuButton.Visible = true

	debugGuiRE.OnClientEvent.Connect((errorMessage) => {
		output.Text = "Server Error:\n" + errorMessage
		errorReport.Visible = true
	})

	LogService.MessageOut.Connect((message, messageType) => {
		if (messageType === Enum.MessageType.MessageError) {
			output.Text = "Client Error:\n" + message
			errorReport.Visible = true
		}
	})
}
else {
	debugMenuButton.Visible = false
}

testMobTPExploit.MouseButton1Click.Connect(() => {
	const mobsFolder = Workspace.WaitForChild<Folder>("Mobs")
	for (let mob of mobsFolder.GetChildren()) {
		if (mob.IsA("Model")) {
			mob.SetPrimaryPartCFrame(new CFrame())
		}
	}
})


