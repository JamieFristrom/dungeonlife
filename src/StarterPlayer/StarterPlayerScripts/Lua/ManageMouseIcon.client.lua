print( script:GetFullName().." executed" )

local InputXL       = require( game.ReplicatedStorage.Standard.InputXL )
local WeaponUtility = require( game.ReplicatedStorage.Standard.WeaponUtility )

local UserInputService = game:GetService("UserInputService")

local localPlayer = game.Players.LocalPlayer

local defaultMouseIconId = localPlayer:GetMouse().Icon

local mouseIconCooldownIdA =
{
	"rbxassetid://2253173429",    -- 1
	"rbxassetid://2253173823",    -- 2
	"rbxassetid://2253174167",    -- 3
	"rbxassetid://2253174551",    -- 4
	"rbxassetid://2253175029",    -- 5
	"rbxassetid://2253175379",    -- 6
	"rbxassetid://2253175681",    -- 7
	"rbxassetid://2253175973",    -- 8
	"rbxassetid://2253176277",    -- 9
	"rbxassetid://2253176563",    -- 10
	"rbxassetid://2253176872",    -- 11
	"rbxassetid://2253177216",	  -- 12
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
				localPlayer:GetMouse().Icon = "rbxgameasset://Images/CrosshairCursor"
			else
				localPlayer:GetMouse().Icon = defaultMouseIconId
			end
		end
	end
end)

