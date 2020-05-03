local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )

local DebugXL          = require( game.ReplicatedStorage.Standard.DebugXL )


local MonsterUtility = {}

function MonsterUtility:GetClassWait( monsterCharacter )
	local player = game.Players:GetPlayerFromCharacter( monsterCharacter )
	if player then
		return CharacterClientI:WaitForCharacterClass( player )
	else
		return "DungeonLord" 
	end
end

return MonsterUtility
