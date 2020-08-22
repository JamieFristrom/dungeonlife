
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local HeroUtility      = require( game.ReplicatedStorage.Standard.HeroUtility )

local FlexibleTools    = require( game.ServerStorage.Standard.FlexibleToolsModule )

local Heroes           = require( game.ServerStorage.Standard.HeroesModule )

local WeaponServer = {}

-- check tool usability and put away if illegal
function WeaponServer:CheckRequirements( tool, player )
	-- although this code should work as-is with monsters, there is some bug in it that I wasn't able to track down
	-- so, since monsters should always be able to use their tools *anyway*, taking the easy way out: 
	if player==nil then return true end
	if player.Team == game.Teams.Monsters then return true end
	
	local flexToolInst     = FlexibleTools:GetFlexToolFromInstance( tool )
	local pcData = Heroes:GetPCDataWait( player )
	if pcData:canUseGear(flexToolInst) then return true end
	local humanoid = player.Character:FindFirstChild("Humanoid")
		-- not sure we need this now that we have custom inventory:
	delay( 0.1, function() if humanoid then humanoid:UnequipTools() end end )
	return false
end


return WeaponServer
