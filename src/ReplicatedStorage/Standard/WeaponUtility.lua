local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )

local CharacterUtility = require( game.ReplicatedStorage.Standard.CharacterUtility )
local DebugXL          = require( game.ReplicatedStorage.Standard.DebugXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL )

local WeaponUtility = {}


function WeaponUtility:GetTargetPoint( targetCharacter )
	if targetCharacter.PrimaryPart then
		return targetCharacter:GetPrimaryPartCFrame().p
	else
		return Vector3.new( math.huge, math.huge, math.huge )  -- will probably be out of range
	end
end


-- returns { targetcharacter, range }
-- function WeaponUtility:FindClosestTargetInCone( attackingCharacter, coneDot ) 
-- 	DebugXL.logD('Combat', 'FindClosestTargetInCone for '..attackingCharacter:GetFullName())
-- 	local enemyCharacters = TableXL:FindAllInAWhere( game.CollectionService:GetTagged("CharacterTag"),
-- 		function( v ) return CharacterClientI:ValidTarget( attackingCharacter, v ) end )
-- 	local targetsInCone = TableXL:FindAllInAWhere( enemyCharacters, function( targetCharacter ) 
-- 			if not targetCharacter.PrimaryPart then return false end 
-- 			if targetCharacter:FindFirstChild("ForceField") then return false end
-- 			if not targetCharacter:FindFirstChild("Head") then return false end
-- 			local facingTargetV3 = ( WeaponUtility:GetTargetPoint( targetCharacter ) - attackingCharacter:GetPrimaryPartCFrame().p ).Unit
-- 			local pcLookV3       = attackingCharacter:GetPrimaryPartCFrame().lookVector
-- 			local dot            = facingTargetV3:Dot( pcLookV3 )
-- 			return dot >= coneDot
-- 		end )
-- --	for _, character in pairs( targetsInCone ) do
-- --			--print( "TargetInCone: "..character.Name )
-- --	end	
-- 	local bestTarget, bestFitN = TableXL:FindBestFitMin( targetsInCone, function( targetCharacter ) 
-- 		local deltaV3 = WeaponUtility:GetTargetPoint( targetCharacter ) - attackingCharacter:GetPrimaryPartCFrame().p
-- 		deltaV3 = Vector3.new( deltaV3.X, 0, deltaV3.Z )
-- 	return deltaV3.Magnitude end )
	
-- 	return { bestTarget, bestFitN }
-- end


-- -- garbage collection
-- spawn( function()
-- 	while wait(1) do
-- 		for player, _ in pairs( cooldownFinishTime ) do
-- 			if not player.Parent then 
-- 				cooldownFinishTime[ player ] = nil
-- 				cooldownDurationN[ player ] = nil
-- 				walkSpeedMulsN[ player ] = nil
-- 			end
-- 		end
-- 	end
-- end)


return WeaponUtility


