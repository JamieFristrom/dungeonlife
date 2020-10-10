
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local WerewolfUtility = {}

-- assumes that character is a werewolf;  non-werewolves are considered undercover
function WerewolfUtility:IsUndercover( character )
	DebugXL:Assert( character:IsA("Model") )
	return not character:FindFirstChild("Werewolf Head") 
end

return WerewolfUtility
