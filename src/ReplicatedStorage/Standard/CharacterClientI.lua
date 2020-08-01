
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local TableXL         = require( game.ReplicatedStorage.Standard.TableXL )

local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest


-- the interface between encapsulated game components and this particular game's specific characters;
-- it needs to be modified for every game
local CharacterClientI = {}

CharacterClientI.maxSlots = 4

-- do we want to check force field here?
function CharacterClientI:ValidTarget( attackingTeam, targetCharacter )
	DebugXL:Assert( attackingTeam:IsA('Team') )
	DebugXL:Assert( self == CharacterClientI )
	if Places.getCurrentPlace() == Places.places.Underhaven then return false end	
--	--print( "Checking "..targetCharacter.Name.." target validity" )
	local targetPlayer    = game.Players:GetPlayerFromCharacter( targetCharacter )
	if not targetPlayer then  -- must be some dungeon furnishing, heroes can attack but monsters can't
		return attackingTeam == game.Teams.Heroes
	else
--		--print( "ValidTarget? Attacker "..attackingCharacter.Name.." team "..tostring( attackingPlayer.Team ).." defender "..targetCharacter.Name.." team "..tostring( targetPlayer.Team ) )
		return attackingTeam ~= targetPlayer.Team
	end	
end


function CharacterClientI:GetValidTargets( attackingTeam )
	DebugXL:Assert( attackingTeam:IsA('Team') )
	DebugXL:Assert( self == CharacterClientI )
	return TableXL:FindAllInAWhere( game.CollectionService:GetTagged("CharacterTag"),
		function( character ) return CharacterClientI:ValidTarget( attackingTeam, character ) end )
end


-- went back and forth on whether item should point to slot or vice-versa.  
-- attaching the index to the tool data itself:
-- * if not careful, get two items in the same slot
-- * more coding
-- * easier to pass remotely
-- having a separate array of slots containing references to their tools
-- * if not careful, get one item in multiple slots
-- * harder to pass remotely (an internal reference in a structure gets duplicated in the deep copy)

-- returns item and possessionsKey which you could well need

function CharacterClientI:GetPossessionFromSlot( characterDataT, slotN )  -- returns item, key or nil, nil
	return unpack( characterDataT.gearPool:getFromSlot( slotN ) )
end


function CharacterClientI:GetPossessionSlot( characterDataT, possession )
	-- way 1
	return possession.slotN
	
	-- way 2
--	for i, item in pairs( characterDataT.slotsT ) do
--		if item == possession then
--			return i
--		end
--	end
--	return nil
end


-- use nil itemKey to clear slot
function CharacterClientI:AssignPossessionToSlot( characterDataT, itemKey, slotN )
	characterDataT.gearPool:assignToSlot( itemKey, slotN )
end


function CharacterClientI:GetEquipFromSlot( characterDataT, equipSlot )
	return unpack( characterDataT.gearPool:getFromEquipSlot( equipSlot ) )
end


function CharacterClientI:GetEquipped( possession )
	return possession.equippedB
end


function CharacterClientI:GetWornWalkSpeedMul( defenderDataT )
	return defenderDataT.gearPool:getWornWalkSpeedMul()
end


function CharacterClientI:GetWornJumpPowerMul( defenderDataT )
	return defenderDataT.gearPool:getWornJumpPowerMul()
end


function CharacterClientI:DetermineDamageReduction( character, defenderDataT, incomingDamage, damageTagsT )
	DebugXL:Assert( type(damageTagsT)=="table" )
	local reducedDamage = incomingDamage
	if character:FindFirstChild( "AuraOfCourage" ) then
--		--print( "Aura of courage" )
		reducedDamage = incomingDamage * ( 1 - character.AuraOfCourage.Value.X )
	end
		
--	--print( "reducedDamage: "..reducedDamage )
	local totalDefense = 0
	for attackType, _ in pairs( damageTagsT ) do
		totalDefense = totalDefense + defenderDataT:getTotalDefense( attackType )
	end
		
	-- armor never does more than 50% DR, so 1st level creatures hitting a fully armored 9th level guy don't accuse him of hacking for one thing
	reducedDamage = math.max( reducedDamage * 0.5, reducedDamage - totalDefense )  
	
--	local damageReport = "Damage reduction: "..character:GetFullName()..". incoming: "..incomingDamage.."; defense: "..totalDefense.."; reduced: "..reducedDamage
--	--print( damageReport )
		
	return reducedDamage
end 



return CharacterClientI
