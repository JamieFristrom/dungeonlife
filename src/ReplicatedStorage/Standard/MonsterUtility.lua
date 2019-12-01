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

--
--function MonsterUtility:GetLevel( monsterCharacter )
--	DebugXL:Assert( monsterCharacter:IsA("Model") )
--	local configurations = monsterCharacter:FindFirstChild("Configurations") 
--	if configurations then
--		local levelValueO = configurations:FindFirstChild("Level")
--		if levelValueO then
--			return levelValueO.Value
--		end
--	end
--	return 1
--end

return MonsterUtility
