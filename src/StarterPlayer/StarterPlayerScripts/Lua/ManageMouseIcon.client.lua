print( script:GetFullName().." executed" )

local InputXL       = require( game.ReplicatedStorage.Standard.InputXL )
local WeaponUtility = require( game.ReplicatedStorage.Standard.WeaponUtility )

local AssetManifest = require( game.ReplicatedFirst.TS.AssetManifest ).AssetManifest

local UserInputService = game:GetService("UserInputService")

local localPlayer = game.Players.LocalPlayer

local defaultMouseIconId = localPlayer:GetMouse().Icon

local mouseIconCooldownIdA =
{
	AssetManifest.ImageCooldownCursor01,
    AssetManifest.ImageCooldownCursor02,
    AssetManifest.ImageCooldownCursor03,
    AssetManifest.ImageCooldownCursor04,
    AssetManifest.ImageCooldownCursor05,
    AssetManifest.ImageCooldownCursor06,
    AssetManifest.ImageCooldownCursor07,
    AssetManifest.ImageCooldownCursor08,
    AssetManifest.ImageCooldownCursor09,
    AssetManifest.ImageCooldownCursor10,
    AssetManifest.ImageCooldownCursor11,
    AssetManifest.ImageCooldownCursor12
}

local function SetCooldownMouseIconId( cooldownFractionRemaining )
	local cooldownIconN = math.clamp( math.ceil( cooldownFractionRemaining * 12 ), 1, 12 )
	localPlayer:GetMouse().Icon = mouseIconCooldownIdA[ cooldownIconN ] 
end

game["Run Service"].RenderStepped:Connect( function()
	
	-- no controller dot on xbox when not necessary
	local mouseIcon = true	
	if InputXL:UsingGamepad() then
		if localPlayer.PlayerGui:FindFirstChild("StoreGui") then
			if localPlayer.PlayerGui.StoreGui:FindFirstChild("Main") then
				if localPlayer.PlayerGui.StoreGui.Main.Visible then
					mouseIcon = false
				end
			end
		end
		if localPlayer.PlayerGui:FindFirstChild("SkinGui") then
			if localPlayer.PlayerGui.SkinGui:FindFirstChild("Main") then
				if localPlayer.PlayerGui.SkinGui.Main.Visible then
					mouseIcon = false
				end
			end
		end
		if localPlayer.Team == game.Teams.Heroes and ( workspace.GameManagement.PreparationCountdown.Value > 0 or localPlayer.HeroExpressPreparationCountdown.Value > 0 ) then
			mouseIcon = false	
		end
	end
	UserInputService.MouseIconEnabled = mouseIcon
	
	local character = localPlayer.Character
	if character then
		if WeaponUtility:IsCoolingDown(localPlayer ) then
			SetCooldownMouseIconId( WeaponUtility:CooldownPctRemaining( localPlayer ) )
		else
			local tool = character:FindFirstChildWhichIsA( "Tool" ) 
			if tool then
				localPlayer:GetMouse().Icon = AssetManifest.ImageCrosshairCursor
			else
				localPlayer:GetMouse().Icon = defaultMouseIconId
			end
		end
	end
end)

