print( script:GetFullName().." executed" )

local DebugXL           = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL        = require( game.ReplicatedStorage.Standard.InstanceXL )

local CharacterClientI  = require( game.ReplicatedStorage.CharacterClientI )
print( "CharacterI: CharacterClientI required succesfully" )
local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer
print( "CharacterI: PlayerServer required succesfully" )

-- *** deliberately does not require heroes or monsters in the header to avoid circular requires ***

-- the interface between encapsulated game components and this particular game's specific characters;
-- it needs to be modified for every game
local CharacterI = {}

-- it's ok to pass nil player. at some point we'll want certain mobs (magical creations) to pass their owner player for xp purposes
function CharacterI:SetLastAttackingPlayer( character, player )
	DebugXL:Assert( character:IsA("Model"))
	DebugXL:Assert( character.Parent ~= nil )
	local humanoid = character:FindFirstChild("Humanoid")
	if humanoid then
		InstanceXL:CreateSingleton( "ObjectValue", { Name = "creator", Parent = humanoid, Value = player } )
	end
end



function CharacterI:TakeFlexToolDamage( hitCharacter, attackingCharacter, attackingTeam, flexTool )
	DebugXL:Assert( self == CharacterI )
	DebugXL:Assert( attackingCharacter:IsA('Model') )
	DebugXL:Assert( attackingTeam:IsA('Team') )
	DebugXL:logD( 'Combat', 'TakeFlexToolDamage attackingPlayer: '..attackingCharacter.Name..' hitCharacter: '..hitCharacter.Name )
	local hitHumanoid = hitCharacter:FindFirstChild("Humanoid")
	if hitHumanoid then
		local hitPlayer = game.Players:GetPlayerFromCharacter( hitCharacter )
		if not hitPlayer or hitPlayer.Team ~= attackingTeam then
			local attackingPlayer = game.Players:GetPlayerFromCharacter( attackingCharacter )
			CharacterI:SetLastAttackingPlayer( hitCharacter, attackingPlayer )
			
			if attackingTeam == game.Teams.Heroes then	
				DebugXL:logV( 'Combat', 'Hero damaging monster' )	
				DebugXL:Assert( attackingPlayer )
				if( attackingPlayer )then
					require( game.ServerStorage.Standard.HeroesModule ):DoFlexToolDamage( attackingPlayer, flexTool, hitHumanoid )
				end
			else
				-- can't just use tool's parent to determine attacking character because it might be lingering
				-- damage from a tool that has been put away
				DebugXL:logV( 'Combat', 'Monster damaging hero' )	
				require( game.ServerStorage.MonstersModule ):DoFlexToolDamage( attackingCharacter, flexTool, hitHumanoid ) 
			end
		end
	end
end

-- does not *set* the attacking player - only uses attacking player for informational purposes
-- this never crits, which means splash damage never crits, which means bombs never crit
function CharacterI:TakeDirectDamage( hitCharacter, damage, attackingPlayer, damageTagsT )
	local hitHumanoid = hitCharacter:FindFirstChild("Humanoid")
	DebugXL:Assert( hitHumanoid )
	if hitHumanoid then
		DebugXL:logV( 'Combat', 'CharacterI:TakeDirectDamage - hitHumanoid '..hitHumanoid:GetFullName()..','..damage..','..attackingPlayer.Name )
		local hitPlayer = game.Players:GetPlayerFromCharacter( hitCharacter )
		if not hitPlayer or hitPlayer.Team ~= attackingPlayer.Team then
--			--print( attackingPlayer.Name.." hits "..hitCharacter.Name.." for "..damage )
			if attackingPlayer.Team == game.Teams.Heroes then		
				require( game.ServerStorage.Standard.HeroesModule ):DoDirectDamage( attackingPlayer, damage, hitHumanoid, false )
			else
				-- can't just use tool's parent to determine attacking character because it might be lingering
				-- damage from a tool that has been put away
				require( game.ServerStorage.MonstersModule ):DoDirectDamage( attackingPlayer, damage, hitHumanoid, damageTagsT, false ) 
			end
		end
	end
end


-- NOTE: returns packed pair { damage: number, crit: bool }
function CharacterI:DetermineFlexToolDamage( player, flexTool )
	if player.Team == game.Teams.Heroes then
		return require( game.ServerStorage.Standard.HeroesModule ):DetermineFlexToolDamageN( player, flexTool, false )
	else 
		return require( game.ServerStorage.MonstersModule ):DetermineFlexToolDamageN( player.Character, flexTool )
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
	DebugXL:Assert( player:IsA("Player") )
--	--print( "Setting "..player.Name.." character class to "..classS )
	InstanceXL.new( "StringValue", { Name = "CharacterClass", Value = classS, Parent = player }, true )
	
	-- whoops, duplicated data
	InstanceXL.new( "StringValue", { Name = "Class", Parent = player.leaderstats, Value = classS }, true )

end


function CharacterI:ChangeTeam( player, newTeam )
	if player.Team ~= newTeam then
		CharacterI:SetCharacterClass( player, "" )
		InstanceXL.new( "StringValue", { Name = "Level", Value = "", Parent = player.leaderstats }, true )
	end
	pcall( function()
		player.Team = newTeam
	end )
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
