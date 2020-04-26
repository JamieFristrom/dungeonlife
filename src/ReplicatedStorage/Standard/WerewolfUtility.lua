local DebugXL           = require( game.ReplicatedStorage.Standard.DebugXL )

local CharacterClientI  = require( game.ReplicatedStorage.CharacterClientI )



local WerewolfUtility = {}

-- assumes that character is a werewolf;  non-werewolves are considered undercover
function WerewolfUtility:IsUndercover( character )
	DebugXL:Assert( character:IsA("Model") )
	return not character:FindFirstChild("Werewolf Head") 
end

return WerewolfUtility
