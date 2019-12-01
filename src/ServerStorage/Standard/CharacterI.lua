print( script:GetFullName().." executed" )

local CharacterUtility  = require( game.ReplicatedStorage.Standard.CharacterUtility )
local DebugXL           = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL        = require( game.ReplicatedStorage.Standard.InstanceXL )
local TableXL           = require( game.ReplicatedStorage.Standard.TableXL )
local ToolXL            = require( game.ReplicatedStorage.Standard.ToolXL )

local PossessionData    = require( game.ReplicatedStorage.PossessionData )

local CharacterClientI  = require( game.ReplicatedStorage.CharacterClientI )

local HeroClasses = require( game.ReplicatedStorage.TS.HeroClassesTS ).HeroClasses
local heroClassPrototypes = HeroClasses.heroClassPrototypes

-- *** deliberately does not require heroes or monsters in the header to avoid circular requires ***

-- the interface between encapsulated game components and this particular game's specific characters;
-- it needs to be modified for every game
local CharacterI = {}


function CharacterI:SetLastAttackingPlayer( character, player )
	DebugXL:Assert( character:IsA("Model"))
	DebugXL:Assert( player:IsA("Player"))
	local humanoid = character:FindFirstChild("Humanoid")
	if humanoid then
		InstanceXL:CreateSingleton( "ObjectValue", { Name = "creator", Parent = humanoid, Value = player } )
	end
end



-- function CharacterI:TakeToolDamage( hitCharacter, tool )
-- 	DebugXL:Assert( self == CharacterI )
-- 	local attackingPlayer = ToolXL:GetOwningPlayer( tool )
-- 	--DebugXL:Assert( attackingPlayer )  -- no npcs for now, but it's quite possible character has destroyed and player is inaccessible
-- 	if attackingPlayer then	
-- 		--print( "TakeToolDamage attackingPlayer "..attackingPlayer.Name )
-- 		local hitHumanoid = hitCharacter:FindFirstChild("Humanoid")
-- 		if hitHumanoid then
-- 			--print( "TakeToolDamage hitHumanoid "..hitCharacter.Name )
-- 			local hitPlayer = game.Players:GetPlayerFromCharacter( hitCharacter )
-- 			if not hitPlayer or hitPlayer.Team ~= attackingPlayer.Team then
-- 				CharacterI:SetLastAttackingPlayer( hitCharacter, attackingPlayer )
				
-- 				if attackingPlayer.Team == game.Teams.Heroes then		
-- 					require( game.ServerStorage.Standard.HeroesModule ):DoDamage( attackingPlayer, tool, hitHumanoid )
-- 				else
-- 					-- can't just use tool's parent to determine attacking character because it might be lingering
-- 					-- damage from a tool that has been put away
-- 					local attackingCharacter = attackingPlayer.Character
-- 					require( game.ServerStorage.MonstersModule ):DoDamage( attackingCharacter, tool, hitHumanoid ) 
-- 				end
-- 			end
-- 		end
-- 	end
-- end


function CharacterI:TakeFlexToolDamage( hitCharacter, attackingPlayer, flexTool )
	DebugXL:Assert( self == CharacterI )
	local hitHumanoid = hitCharacter:FindFirstChild("Humanoid")
	if hitHumanoid then
		local hitPlayer = game.Players:GetPlayerFromCharacter( hitCharacter )
		if not hitPlayer or hitPlayer.Team ~= attackingPlayer.Team then
			CharacterI:SetLastAttackingPlayer( hitCharacter, attackingPlayer )
			
			if attackingPlayer.Team == game.Teams.Heroes then		
				require( game.ServerStorage.Standard.HeroesModule ):DoFlexToolDamage( attackingPlayer, flexTool, hitHumanoid )
			else
				-- can't just use tool's parent to determine attacking character because it might be lingering
				-- damage from a tool that has been put away
				local attackingCharacter = attackingPlayer.Character
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
		local hitPlayer = game.Players:GetPlayerFromCharacter( hitCharacter )
		if not hitPlayer or hitPlayer.Team ~= attackingPlayer.Team then
--			--print( attackingPlayer.Name.." hits "..hitCharacter.Name.." for "..damage )
			if attackingPlayer.Team == game.Teams.Heroes then		
				require( game.ServerStorage.Standard.HeroesModule ):DoDirectDamage( attackingPlayer, damage, hitHumanoid, false )
			else
				-- can't just use tool's parent to determine attacking character because it might be lingering
				-- damage from a tool that has been put away
				local attackingCharacter = attackingPlayer.Character
				require( game.ServerStorage.MonstersModule ):DoDirectDamage( attackingCharacter, damage, hitHumanoid, damageTagsT, false ) 
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
			DebugXL:Assert( pc.walkSpeedN )
			return pc.walkSpeedN or 12
		end
--		local characterClass = CharacterClientI:GetCharacterClass( player )
--		-- there is a moment when a monster is promoted to a hero where the character still
--		-- exists but its character class has been erased
--		if characterClass == "" then
--			return 12
--		elseif characterClass == "Werewolf" then
--			if player.Character:FindFirstChild("Werewolf Head") then
--				return PossessionData.dataT[ characterClass ].walkSpeedN			
--			else
--				return 12
--			end
--		else
--			return PossessionData.dataT[ characterClass ].walkSpeedN
--		end
	end
	return 12
end


function CharacterI:GetBaseJumpPower( character )
	local player = game.Players:GetPlayerFromCharacter( character )
	if player then
		local pc = CharacterI:GetPCDataWait( player )
		if pc then
			return pc.jumpPowerN
		end		
		
--		local characterClass = CharacterClientI:GetCharacterClass( player )
--		-- there is a moment when a monster is promoted to a hero where the character still
--		-- exists but its character class has been erased
--		if characterClass == "" then
--			return 35
--		else
--			return PossessionData.dataT[ characterClass ].jumpPowerN
--		end
--	else
--		return 35
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
	if player.Team == game.Teams.Heroes then
		-- hackity hack hack
		local pcData = require( game.ServerStorage.Standard.HeroesModule ):GetPCDataWait( player )
		-- it's possible hero went out of scope while we were waiting, in which case it will be nil. let's return the monster data instead in that case
		if pcData then return pcData end
	end
	return require( game.ServerStorage.MonstersModule ):GetPCDataWait( player )
end


-- can return nil
function CharacterI:GetPCData( player )
	if player.Team == game.Teams.Heroes then
		return require( game.ServerStorage.Standard.HeroesModule ):GetPCData( player )
	else
		return require( game.ServerStorage.MonstersModule ):GetPCData( player )
	end
end


-- returns item and possessions key
function CharacterI:GetHotbarToolDatum( player, hotbarSlotN )
	return CharacterClientI:GetPossessionFromSlot( CharacterI:GetPCDataWait( player ), hotbarSlotN )
end


-- we want this to be called every time costume changes so we can use Roblox CharacterAdded
local function TagPlayer( player )
	player.CharacterAdded:Connect( function( character )
		game.CollectionService:AddTag( character, "Character" )		
	end)
	if player.Character then 
		game.CollectionService:AddTag( player.Character, "Character" )
	end	
end

for _, player in pairs( game.Players:GetPlayers() ) do TagPlayer( player ) end 
game.Players.PlayerAdded:Connect( function( player )
	TagPlayer( player )
end)


return CharacterI
