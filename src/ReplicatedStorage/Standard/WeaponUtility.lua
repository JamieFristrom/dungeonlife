local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )

local CharacterUtility = require( game.ReplicatedStorage.Standard.CharacterUtility )
local DebugXL          = require( game.ReplicatedStorage.Standard.DebugXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL )

local WeaponUtility = {}

-- it is nonobvious how to both have IsCoolingDown check IsFrozen and have this not mess things
-- up when playing from studio without messy code. From the local/client scripts we could pass in something
-- different than a player except for IsCoolingDown, so we could have a flag or something that tells
-- us to save to a different variable ...
	
-- it's redundant having these be tables on the client side
local cooldownDurationN = {}
local walkSpeedMulsN = {}
local cooldownFinishTime = {}
	
function WeaponUtility:GetAdjustedCooldown( player, cooldownDurationN )
	local adjCooldown = cooldownDurationN / CharacterUtility:GetSlowCooldownPct( player.Character )
	DebugXL:Assert( adjCooldown < 1000 )
	return adjCooldown
end


function WeaponUtility:StartCooldown( player, _cooldownDurationN, walkSpeedMulN )
	if not cooldownFinishTime[ player ] or ( time() + _cooldownDurationN > cooldownFinishTime[ player ] ) then
		-- wishlist; update cooldown on the fly, so when you thaw you go back to full speed
		_cooldownDurationN = WeaponUtility:GetAdjustedCooldown( player, _cooldownDurationN )
		cooldownFinishTime[ player ] = time() + _cooldownDurationN 
		cooldownDurationN[ player ] = _cooldownDurationN
		walkSpeedMulsN[ player ] = walkSpeedMulN
	end
end


function WeaponUtility:CooldownPctRemaining( player )
	DebugXL:Assert( player:IsA("Player") )
	if cooldownFinishTime[ player ] then
		return math.max( ( cooldownFinishTime[ player ] - time() ) / cooldownDurationN[ player ], 0 )		
	else
		return 0
	end
end


function WeaponUtility:LastWeaponWalkSpeedMul( player )
	return walkSpeedMulsN[ player ]
end


function WeaponUtility:IsCoolingDown( player )
	return CharacterUtility:IsFrozen( player.Character ) or WeaponUtility:CooldownPctRemaining( player ) > 0
end


function WeaponUtility:CooldownWait( player, cooldownDurationN, walkSpeedMulN )
	local startTime = time()
	WeaponUtility:StartCooldown( player, cooldownDurationN, walkSpeedMulN )
	while WeaponUtility:IsCoolingDown( player ) do wait() end
--	--print( player.Name.." took "..time()-startTime.." seconds to cool down" )
end


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


-- garbage collection
spawn( function()
	while wait(1) do
		for player, _ in pairs( cooldownFinishTime ) do
			if not player.Parent then 
				cooldownFinishTime[ player ] = nil
				cooldownDurationN[ player ] = nil
				walkSpeedMulsN[ player ] = nil
			end
		end
	end
end)


return WeaponUtility


