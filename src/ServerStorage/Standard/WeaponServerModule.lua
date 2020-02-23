local DebugXL          = require( game.ReplicatedStorage.Standard.DebugXL )

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )
local FlexEquipUtility  = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local HeroUtility      = require( game.ReplicatedStorage.Standard.HeroUtility )

local FlexibleTools    = require( game.ServerStorage.Standard.FlexibleToolsModule )

local Heroes           = require( game.ServerStorage.Standard.HeroesModule )

local Hero = require( game.ReplicatedStorage.TS.HeroTS ).Hero

local WeaponServer = {}

-- check tool usability and put away if illegal
function WeaponServer:CheckRequirements( tool, player )
	-- although this code should work as-is with monsters, there is some bug in it that I wasn't able to track down
	-- so, since monsters should always be able to use their tools *anyway*, taking the easy way out: 
	if player.Team == game.Teams.Monsters then return true end
	
	local flexToolInst     = FlexibleTools:GetToolInst( tool )
	local pcData = Heroes:GetPCDataWait( player )
	if HeroUtility:CanUseWeapon( pcData, flexToolInst ) then return true end
	local humanoid = player.Character:FindFirstChild("Humanoid")
		-- not sure we need this now that we have custom inventory:
	delay( 0.1, function() if humanoid then humanoid:UnequipTools() end end )
	return false
--	return true -- fixme, should return false when you can't really use weapon to stop hackers. But there's a weird bug with this code so
	-- I'm deactivating it for now
end


return WeaponServer
