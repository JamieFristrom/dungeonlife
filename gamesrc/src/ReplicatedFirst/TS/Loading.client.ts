
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { Workspace, RunService } from "@rbxts/services"
warn("DUNGEON LIFE 10/8/2020")
warn("Fixed hero save")

let loadingStructure = (script.Parent!.Parent!.WaitForChild("LoadingStructure") as Part)
let waitingImage = (loadingStructure.WaitForChild("BillboardGui").WaitForChild("LogoFrame").WaitForChild("WaitingImage") as ImageLabel)
loadingStructure.Parent = Workspace
RunService.RenderStepped.Connect(() => {
	let currentCamera = Workspace.CurrentCamera!
	currentCamera.CFrame = loadingStructure.CFrame
	waitingImage.Rotation = tick() * 10 % 360;
})


let starterGui = (game.WaitForChild("StarterGui") as StarterGui)
starterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false)
starterGui.SetCoreGuiEnabled(Enum.CoreGuiType.PlayerList, false)
