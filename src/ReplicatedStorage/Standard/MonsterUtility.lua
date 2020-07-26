
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )

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
