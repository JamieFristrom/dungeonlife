
import { Workspace, RunService } from "@rbxts/services"
warn( "DUNGEON LIFE 12/28" )
warn( "Open source version handles preloads correct" )

let loadingStructure = script.Parent!.Parent!.WaitForChild<Part>("LoadingStructure")
let waitingImage = loadingStructure.WaitForChild("BillboardGui").WaitForChild("LogoFrame").WaitForChild<ImageLabel>("WaitingImage")
loadingStructure.Parent = Workspace
RunService.RenderStepped.Connect(()=>
{
	let currentCamera = Workspace.CurrentCamera!
	currentCamera.CFrame = loadingStructure.CFrame
	waitingImage.Rotation = tick() * 10 % 360;
})


let starterGui = game.WaitForChild<StarterGui>("StarterGui") 
starterGui.SetCoreGuiEnabled( Enum.CoreGuiType.Backpack, false )
starterGui.SetCoreGuiEnabled( Enum.CoreGuiType.PlayerList, false )

/*
-- luacheck: ignore
local loadingStructure = script.Parent.Parent.LoadingStructure;
local waitingImage = loadingStructure:WaitForChild("BillboardGui"):WaitForChild("WaitingImage");
loadingStructure.Parent = workspace;
game["Run Service"].RenderStepped:Connect(function()
	workspace.CurrentCamera.CFrame = loadingStructure.CFrame;
	waitingImage.Rotation = tick() * 10 % 360;
end);
local starterGui = game:WaitForChild("StarterGui") 
starterGui:SetCoreGuiEnabled( Enum.CoreGuiType.Backpack, false )
starterGui:SetCoreGuiEnabled( Enum.CoreGuiType.PlayerList, false )
*/