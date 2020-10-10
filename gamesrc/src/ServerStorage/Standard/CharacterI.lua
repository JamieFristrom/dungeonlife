
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local InstanceXL        = require( game.ReplicatedStorage.Standard.InstanceXL )

local CharacterClientI  = require( game.ReplicatedStorage.CharacterClientI )
print( "CharacterI: CharacterClientI required succesfully" )
local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer
print( "CharacterI: PlayerServer required succesfully" )
local CharacterServer = require( game.ServerStorage.TS.CharacterServer ).CharacterServer

local FlexTool = require( game.ReplicatedStorage.TS.FlexToolTS ).FlexTool
local Hero = require( game.ReplicatedStorage.TS.HeroTS ).Hero
local Monster = require( game.ReplicatedStorage.TS.Monster ).Monster

local TableXL = require( game.ReplicatedStorage.Standard.TableXL )

local MainContext = require( game.ServerStorage.TS.MainContext ).MainContext

-- *** deliberately does not require heroes or monsters in the header to avoid circular requires ***

-- the interface between encapsulated game components and this particular game"s specific characters;
-- it needs to be modified for every game
local CharacterI = {}


-- it's kind of sad we pass the flexTool _and_ the tool all the way to the effects resolution
function CharacterI:TakeFlexToolDamage( context, hitCharacter, attackingCharacter, flexTool, tool )
	DebugXL:Assert( self == CharacterI )
	DebugXL:Assert( hitCharacter:IsA("Model"))
	DebugXL:Assert( attackingCharacter:IsA("Model") )
	DebugXL:Assert( TableXL:InstanceOf( flexTool, FlexTool ) )
	DebugXL:Assert( not tool or tool:IsA("Tool"))

	DebugXL:logD( LogArea.Combat, "TakeFlexToolDamage attackingPlayer: "..attackingCharacter.Name.." hitCharacter: "..hitCharacter.Name )
	local hitHumanoid = hitCharacter:FindFirstChild("Humanoid")
	if hitHumanoid then
		local hitPlayer = game.Players:GetPlayerFromCharacter( hitCharacter )
		local attackingCharacterRecord = context:getPlayerTracker():getCharacterRecordFromCharacter( attackingCharacter )
		if not hitPlayer or hitPlayer.Team ~= attackingCharacterRecord:getTeam() then
			CharacterServer.setLastAttacker( hitCharacter, attackingCharacter )
			local attackingPlayer = game.Players:GetPlayerFromCharacter( attackingCharacter )
		
			-- ...it"s almost polymorphic...  wishlist fix
			if TableXL:InstanceOf( attackingCharacterRecord, Hero ) then	
				DebugXL:logV( LogArea.Combat, "Hero damaging monster" )	
				DebugXL:Assert( attackingPlayer )
				if attackingPlayer then
					require( game.ServerStorage.Standard.HeroesModule ):DoFlexToolDamage( context, attackingCharacterRecord, attackingCharacter, flexTool, hitHumanoid, tool )
				end
			elseif TableXL:InstanceOf( attackingCharacterRecord, Monster ) then
				-- can"t just use tool"s parent to determine attacking character because it might be lingering
				-- damage from a tool that has been put away
				DebugXL:logV( LogArea.Combat, "Monster damaging hero" )	
				require( game.ServerStorage.MonstersModule ):DoFlexToolDamage( context, attackingCharacter, flexTool, hitHumanoid, tool ) 
			else
				DebugXL:Error( "Null character record doing damage")
			end
		end
	end
end

-- does not *set* the attacking player - only uses attacking player for informational purposes
-- this never crits, which means splash damage never crits, which means bombs never crit
function CharacterI:TakeDirectDamage( context, hitCharacter, damage, attackingCharacter, damageTagsT )
	DebugXL:Assert( hitCharacter:IsA("Model") )
	DebugXL:Assert( type(damage)=="number" )
	local hitHumanoid = hitCharacter:FindFirstChild("Humanoid")
	DebugXL:Assert( hitHumanoid )
	if hitHumanoid then
		DebugXL:logV( LogArea.Combat, "CharacterI:TakeDirectDamage - hitHumanoid "..hitHumanoid:GetFullName()..","..damage..","
			..(attackingCharacter and attackingCharacter.Name or "unknown player") )
		local hitPlayer = game.Players:GetPlayerFromCharacter( hitCharacter )
		local attackingPlayer = game.Players:GetPlayerFromCharacter( attackingCharacter )
		local attackingTeam = attackingPlayer and attackingPlayer.Team or game.Teams.Monsters
		if not hitPlayer or hitPlayer.Team ~= attackingTeam then         -- if we don't know the attacking player's team damage happens. can monsters set structures on fire this way?
--			--print( attackingPlayer.Name.." hits "..hitCharacter.Name.." for "..damage )
			if attackingTeam == game.Teams.Heroes then		
				require( game.ServerStorage.Standard.HeroesModule ):DoDirectDamage( context, attackingPlayer, damage, hitHumanoid, false )
			else
				-- can"t just use tool"s parent to determine attacking character because it might be lingering
				-- damage from a tool that has been put away
				require( game.ServerStorage.MonstersModule ):DoDirectDamage( context, attackingPlayer, damage, hitHumanoid, damageTagsT, false ) 
			end
		end
	end
end


-- NOTE: returns packed pair { damage: number, crit: bool }
-- used by bombs, doesn't work with mobs yet
function CharacterI:DetermineFlexToolDamage( player, flexTool )
	-- still uses MainContext. If we want bombs under test we'll need to fix
	local characterRecord = PlayerServer.getCharacterRecordFromPlayer(player)
	if TableXL.InstanceOf( characterRecord, Hero ) then
		return require( game.ServerStorage.Standard.HeroesModule ):DetermineFlexToolDamageN( player, flexTool, false )
	else 
--		return require( game.ServerStorage.MonstersModule ):DetermineFlexToolDamageN( player.Character, flexTool )
		return require( game.ServerStorage.MonstersModule ):CalculateDamageN( 
			characterRecord:getClass(), 
			characterRecord:getLocalLevel(),
			flexTool )
	end		
end


-- wishlist fix; keep a copy of the monster data with the monster to match how we do it with characters
-- then this function would refer to that instead of the source data
function CharacterI:GetBaseWalkSpeed( character )
	DebugXL:Assert( self == CharacterI )
	local player = game.Players:GetPlayerFromCharacter( character )	
	if player then  -- target dummies don't have players
		local pc = CharacterI:GetPCDataWait( player )
		if pc then
			return pc:getWalkSpeed() or 12
		end
	end
	return 12
end


function CharacterI:GetBaseJumpPower( character )
	local player = game.Players:GetPlayerFromCharacter( character )
	if player then
		local pc = CharacterI:GetPCDataWait( player )
		if pc then
			return pc:getJumpPower()
		end		
		
	end
	return 35
end


function CharacterI:SetCharacterClass( player, classS )  -- use "" for no class
	DebugXL:Assert( self==CharacterI )
	PlayerServer.setClassChoice( player, classS )
end


function CharacterI:ChangeTeam( player, newTeam )
	if player.Team ~= newTeam then
		pcall( function()
			player.Team = newTeam
		end )
		PlayerServer.setClassChoice( player, "NullClass" )
		InstanceXL.new( "StringValue", { Name = "Level", Value = "", Parent = player.leaderstats }, true )
	end
end


function CharacterI:GetPCDataWait( player )
	return PlayerServer.getCharacterRecordFromPlayerWait( player )
end


-- can return nil
function CharacterI:GetPCData( player )
	return PlayerServer.getCharacterRecordFromPlayer( player )
end


-- returns item and possessions key
function CharacterI:GetHotbarToolDatum( player, hotbarSlotN )
	return CharacterClientI:GetPossessionFromSlot( CharacterI:GetPCDataWait( player ), hotbarSlotN )
end


-- we want this to be called every time costume changes so we can use Roblox CharacterAdded
local function TagPlayer( player )
	player.CharacterAdded:Connect( function( character )
		game.CollectionService:AddTag( character, "CharacterTag" )		
	end)
	if player.Character then 
		game.CollectionService:AddTag( player.Character, "CharacterTag" )
	end	
end

for _, player in pairs( game.Players:GetPlayers() ) do TagPlayer( player ) end 
game.Players.PlayerAdded:Connect( function( player )
	TagPlayer( player )
end)


return CharacterI
