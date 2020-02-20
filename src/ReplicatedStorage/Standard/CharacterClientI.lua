print( script:GetFullName().." executed" )

local DebugXL         = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL      = require( game.ReplicatedStorage.Standard.InstanceXL )
local TableXL         = require( game.ReplicatedStorage.Standard.TableXL )

local BalanceData     = require( game.ReplicatedStorage.TS.BalanceDataTS ).BalanceData
local FlexEquipUtility = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local PossessionData  = require( game.ReplicatedStorage.PossessionData )

local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData

local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest


-- the interface between encapsulated game components and this particular game's specific characters;
-- it needs to be modified for every game
local CharacterClientI = {}

CharacterClientI.maxSlots = 4

-- do we want to check force field here?
function CharacterClientI:ValidTarget( attackingCharacter, targetCharacter )
	DebugXL:Assert( self == CharacterClientI )
	if Places.getCurrentPlace() == Places.places.Underhaven then return false end	
--	--print( "Checking "..targetCharacter.Name.." target validity" )
	local attackingPlayer = game.Players:GetPlayerFromCharacter( attackingCharacter )
	local targetPlayer    = game.Players:GetPlayerFromCharacter( targetCharacter )
	if not attackingPlayer then return true end
	if not targetPlayer then  -- must be some dungeon furnishing, heroes can attack but monsters can't
		return attackingPlayer.Team == game.Teams.Heroes
	else
--		--print( "ValidTarget? Attacker "..attackingCharacter.Name.." team "..tostring( attackingPlayer.Team ).." defender "..targetCharacter.Name.." team "..tostring( targetPlayer.Team ) )
		return attackingPlayer.Team ~= targetPlayer.Team
	end	
end


function CharacterClientI:GetValidTargets( attackingCharacter )
	DebugXL:Assert( self == CharacterClientI )
	return TableXL:FindAllInAWhere( game.CollectionService:GetTagged("Character"),
		function( character ) return CharacterClientI:ValidTarget( attackingCharacter, character ) end )
end


-- returns "" if no class
function CharacterClientI:GetCharacterClass( player )
	DebugXL:Assert( self==CharacterClientI )
	DebugXL:Assert( player:IsA("Player") )
	return player:FindFirstChild("CharacterClass") and player.CharacterClass.Value or ""
end


-- doesn't return until class is legit;  takes player rather than character
-- I'm surprised this has never locked up on me...  wishlist fix
function CharacterClientI:WaitForCharacterClass( player )
	DebugXL:Assert( self==CharacterClientI )
	DebugXL:Assert( player:IsA("Player") )
	while not player:FindFirstChild("CharacterClass") or player.CharacterClass.Value == "" do wait() end
	return player.CharacterClass.Value
end

-- getting rid of this, it's too unreliable

-- it's ugly using the string value in the leaderstats (we keep it a string for prettiness purposes when we
-- don't know your level) but trying to centralize the level concept on the player not the character so this
-- works before your character spawns
-- 0 means unknown - kept it a number so in cases where it's not important it will still work
--[[
function CharacterClientI:GetLevel( player )
	local levelValueObj = player.leaderstats:FindFirstChild("Level")
	--DebugXL:Assert( levelValueObj )  seems like when characters are first showing up this pops annoyingly
	if levelValueObj then
		if levelValueObj.Value == "" then
			return 0
		else
			return tonumber( levelValueObj.Value )
		end
	end
	-- this way had a problem that if the character wasn't available yet we didn't know your level:
--	if player.Team == game.Teams.Heroes then
--		return require( game.ReplicatedStorage.Standard.HeroUtility ):GetLevel( player )
--	elseif player.Team == game.Teams.Monsters then
--		return require( game.ReplicatedStorage.MonsterUtility ):GetLevel( player.Character )
--	end
	return 0
end
--]]


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
	return unpack( characterDataT.itemPool:getFromSlot( slotN ) )
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
	characterDataT.itemPool:assignToSlot( itemKey, slotN )
end


function CharacterClientI:GetEquipFromSlot( characterDataT, equipSlot )
	return unpack( characterDataT.itemPool:getFromEquipSlot( equipSlot ) )
end


function CharacterClientI:GetEquipped( possession )
	return possession.equippedB
end


function CharacterClientI:GetWornWalkSpeedMul( defenderDataT )
	return defenderDataT.itemPool:getWornWalkSpeedMul()
end


function CharacterClientI:GetWornJumpPowerMul( defenderDataT )
	return defenderDataT.itemPool:getWornJumpPowerMul()
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
