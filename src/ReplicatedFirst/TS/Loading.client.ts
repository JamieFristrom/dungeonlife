
import { Workspace, RunService } from "@rbxts/services"
warn("DUNGEON LIFE 7/5/2020")
warn("Server owned mob parts arg")

let loadingStructure = script.Parent!.Parent!.WaitForChild<Part>("LoadingStructure")
let waitingImage = loadingStructure.WaitForChild("BillboardGui").WaitForChild("LogoFrame").WaitForChild<ImageLabel>("WaitingImage")
loadingStructure.Parent = Workspace
RunService.RenderStepped.Connect(() => {
	let currentCamera = Workspace.CurrentCamera!
	currentCamera.CFrame = loadingStructure.CFrame
	waitingImage.Rotation = tick() * 10 % 360;
})


let starterGui = game.WaitForChild<StarterGui>("StarterGui")
starterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false)
starterGui.SetCoreGuiEnabled(Enum.CoreGuiType.PlayerList, false)
