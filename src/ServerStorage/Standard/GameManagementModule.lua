-- putting global game state operation messages in warn()
-- putting individual player operation messages in print()

print( script:GetFullName().." executed" )

local GameManagement = {
}

-- Dungeon Life main game manager
game.Players.CharacterAutoLoads = false

local DebugXL           = require( game.ReplicatedStorage.Standard.DebugXL )
local HeroUtility       = require( game.ReplicatedStorage.Standard.HeroUtility )
local InstanceXL        = require( game.ReplicatedStorage.Standard.InstanceXL )
local MathXL            = require( game.ReplicatedStorage.Standard.MathXL )
local TableXL           = require( game.ReplicatedStorage.Standard.TableXL )
print( 'GameManagementModule: utilities includes succesful' )

local CharacterClientI  = require( game.ReplicatedStorage.CharacterClientI )
local DeveloperProducts = require( game.ReplicatedStorage.DeveloperProducts )
local FloorData         = require( game.ReplicatedStorage.FloorData )
local InventoryUtility  = require( game.ReplicatedStorage.InventoryUtility )
local MapTileData       = require( game.ReplicatedStorage.MapTileDataModule )
local MonsterUtility    = require( game.ReplicatedStorage.MonsterUtility )
local PossessionData    = require( game.ReplicatedStorage.PossessionData )
local RankForStars      = require( game.ReplicatedStorage.RankForStars )
print( 'GameManagementModule: ReplicatedStorage includes succesful' )


local AnalyticsXL       = require( game.ServerStorage.Standard.AnalyticsXL )
print( 'GameManagementModule: AnalyticsXL included')
local ChatMessages      = require( game.ServerStorage.Standard.ChatMessages )
print( 'GameManagementModule: ChatMessages included')
local Costumes          = require( game.ServerStorage.Standard.CostumesServer )
print( 'GameManagementModule: Costumes included')
local GameAnalyticsServer = require( game.ServerStorage.Standard.GameAnalyticsServer )
print( 'GameManagementModule: GameAnalyticsServer included')
local PlayerXL          = require( game.ServerStorage.Standard.PlayerXL )
print( 'GameManagementModule: ServerStorage.Standard includes succesful' )
local ToolCaches = require( game.ServerStorage.TS.ToolCaches ).ToolCaches

local CharacterI        = require( game.ServerStorage.CharacterI )
local Destructible      = require( game.ServerStorage.Standard.Destructible )
local Dungeon           = require( game.ServerStorage.DungeonModule )
local FurnishServer     = require( game.ServerStorage.FurnishServerModule )
local Heroes            = require( game.ServerStorage.Standard.HeroesModule )
local Inventory         = require( game.ServerStorage.InventoryModule )
local Monsters          = require( game.ServerStorage.MonstersModule )
print( 'GameManagementModule: ServerStorage includes succesful' )

local BlueprintUtility = require( game.ReplicatedStorage.TS.BlueprintUtility ).BlueprintUtility
local CharacterClasses = require( game.ReplicatedStorage.TS.CharacterClasses ).CharacterClasses
local CheatUtilityXL    = require( game.ReplicatedStorage.TS.CheatUtility )
local DungeonVoteUtility = require( game.ReplicatedStorage.TS.DungeonVoteUtility ).DungeonVoteUtility
local Hero = require( game.ReplicatedStorage.TS.HeroTS ).Hero
local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest
print( 'GameManagementModule: ReplicatedStorage.TS includes succesful' )

local Analytics = require( game.ServerStorage.TS.Analytics ).Analytics
local DestructibleServer = require( game.ServerStorage.TS.DestructibleServer ).DestructibleServer
local DungeonDeck = require( game.ServerStorage.TS.DungeonDeck ).DungeonDeck
local GameServer = require( game.ServerStorage.TS.GameServer ).GameServer
local HeroServer = require( game.ServerStorage.TS.HeroServer ).HeroServer
local MessageServer = require( game.ServerStorage.TS.MessageServer ).MessageServer
local MonsterServer = require( game.ServerStorage.TS.MonsterServer ).MonsterServer
local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer
local GameplayTestService = require( game.ServerStorage.TS.GameplayTestService ).GameplayTestService
print( 'GameManagementModule: ServerStorage.TS includes succesful' )

print( 'GameManagementModule processing')
local StarterGui = game.StarterGui

-- I have watched multiple heroes leave during a long prep; 60 is definitely too long. Sometimes they also get confused and wonder
-- why there's a black screen, I think, though that may have been legitimate bugginess.
-- We want *some* prep, though, particularly so after a TPK monsters can become heroes before we spawn the monsters and rebalance.
local preparationDuration = workspace.GameManagement.FastStart.Value and 5 or Places:getCurrentPlace().preparationDuration



local timeToThrowARodB = false

local vipPassId = 5185882  

local levelReadyB = false

local LevelResultEnum = 
{
	TPK            = "TPK",
	ExitReached    = "ExitReached",
	LoungeModeOver = "LoungeModeOver",
	BeatSuperboss  = "BeatSuperboss"
}

-- it's not like me to duplicate data by using this state information to try and decide if a player's character
-- is there or not, but there's too much stuff to track; we might have called a function that's building the
-- character but the character might not be around yet. Same on the way out.
local PCState =
{
	Limbo              = "Limbo",
	Respawning         = "Respawning",
	Exists             = "Exists",	
	-- I don't think we need 'Destroying' - we can count that as an existing for all intents and purposes until actually destroyed and in limbo
}

local PCStateRequest =
{
	None               = "None",
	NeedsRespawn       = "NeedsRespawn",
	NeedsDestruction   = "NeedsDestruction"	
}

local gameStateStart = tick()

local lastMonsterLevels = {} 


local function ChangeGameState( newState )
	local lastState = workspace.GameManagement.GameState.Value
	print("ChangeGameState from " .. lastState .. " to " .. newState )
	Analytics.ReportServerEvent( "GameStateChange", lastState, newState, workspace.GameManagement.GameStateTime.Value )
	workspace.GameManagement.GameState.Value = newState
	workspace.GameManagement.GameStateTime.Value = 0
	gameStateStart = tick()
	warn( workspace.GameManagement.GameState.Value )
end

ChangeGameState( "ServerInit" )

spawn(
	function()
		while wait() do
			workspace.GameManagement.GameStateTime.Value = tick() - gameStateStart
		end
	end )

-- data
local dungeonPlayersT = {}

local roundCounterN = 1

local heroExpressServerN = -100000

local reachedExitB = false
local beatSuperbossB = false

local levelSessionCounterN = 1

local currentPlayerInvitedToHero

local dungeonVotes = {}

local firstLevelB = true

GameManagement.levelStartTime = time()

-- error messages in a pcall do get reported; errors don't
-- testing to see what analytics report in a pcall
--pcall( function()
--	DebugXL:Error( "pcall error" )
--	local badRef
--	local badTbl = {}
--	badTbl[ badRef ] = "bad thing"
--end )


-- dungeon player class
local DungeonPlayer = {
	
}

function DungeonPlayer.new( player )
	return 
	{ 
		pcState = PCState.Limbo, 
		addingCompleteB = false,
		playerMonitoredB = false, 
		playerRemovedB = false,
		lastHeroDeathTime = time(), 
		guiLoadedB = false,
		chooseHeroREAckedB = false,
		signalledReadyB = false
	}
end


function DungeonPlayer:Get( player )
	if not dungeonPlayersT[ player ] then
		dungeonPlayersT[ player ] = DungeonPlayer.new( player )		
	end 
	return dungeonPlayersT[ player ] 
end


-- hack
local GameManagementRemote = {}

function GameManagementRemote.AcknowledgeGuiLoaded( player )
	DungeonPlayer:Get( player ).guiLoadedB = true

	--print( player.Name.." gui acknowledged" )
end

workspace.Signals.GameManagementRE.OnServerEvent:Connect( function( player, funcName, ... )
	GameManagementRemote[ funcName ]( player, ... )
end)
warn( "Time until GameManagementRE connected: "..time() )

workspace.Signals.ChooseHeroRE.OnServerEvent:Connect( function( player, code )
	DebugXL:Assert( code == "ack")
	print( player.Name.." ChooseHeroRE acknowledged" )
	DungeonPlayer:Get( player ).chooseHeroREAckedB = true
end )


-- utility

local function GetMonsterSpawns()
	return game.CollectionService:GetTagged("MonsterSpawn")
end


-- player loops
local function HeroAdded( character, player )
	local pcData, characterKey = Heroes:CharacterAdded( character, player )
	local character = player.Character   -- CharacterAdded calls costume change which destroys old character. 
	DebugXL:logI( 'Gameplay', "Checking for courage auras for "..character.Name )
	if( Places.getCurrentPlace() ~= Places.places.Underhaven )then
		if character:FindFirstChild("AuraOfCourage") then
			print("Aura found")
			MessageServer.PostMessageByKey( player, 
				"MsgAuraOfDefense", true, 0.0001 )  
		elseif pcData:getActualLevel() > pcData:getLocalLevel() then
			MessageServer.PostMessageByKey( player, "MsgTooHighLevel", true, 0.0001 )
			--in theory, already done each time a hero is chosen:
			--PlayerServer.publishLevel( player, pcData:getLocalLevel(), pcData:getActualLevel() )
		elseif not FloorData:CurrentFloor().exitStaircaseB then
			MessageServer.PostMessageByKey( player, "MsgSuperboss" )
		elseif workspace.GameManagement.DungeonDepth.Value == 1 then
			MessageServer.PostMessageByKey( player,
				"MsgWelcomeHero" )
		end	
	end
	return pcData, characterKey
end


local function MonsterAddedWait( character, player )
--	--print( "Monster added "..player.Name )
	local pcData, characterKey = Monsters:PlayerCharacterAddedWait( character, player, time() - GameManagement.levelStartTime )
	DebugXL:Assert( pcData )
	if not character:FindFirstChild("Humanoid") then return pcData end
	if not Inventory:PlayerInTutorial( player ) then
		if workspace.GameManagement.DungeonDepth.Value > 0 then  		-- if you're in the lobby it doesn't matter what you are and that message is just distracting. Maybe we should automake you a dungeon lord in that case
			if MonsterUtility:GetClassWait( character ) == "DungeonLord" then
				if workspace.GameManagement.PreparationCountdown.Value > 0 then
					MessageServer.PostMessageByKey( player, "MsgWelcomeMonster" )				
				else
					MessageServer.PostMessageByKey( player, "MsgWelcomeDungeonLord" )
				end
			else
				local class = MonsterUtility:GetClassWait( character )
				if not PossessionData.dataT[ class ].readableNameS then
					DebugXL:Error( character.Name.." class "..class.." has no readableName" )
					return
				end
				local lastLevel = lastMonsterLevels[ player ]
				local thisLevel = Monsters:GetLevelN( characterKey )
				if lastLevel then
					if thisLevel > lastLevel then
						MessageServer.PostMessageByKey( player, "LevelUp" )
					end
				end
				if( Places.getCurrentPlace() ~= Places.places.Underhaven )then
					MessageServer.PostParameterizedMessage( player, "MsgIdentifyMonster", { level = thisLevel, class = class } )
				end
				lastMonsterLevels[ player ] = thisLevel
			end
		end
	end
	return pcData, characterKey
end


local function SetupPCWait( startingCharacterModel, player )
	local characterKey = 0
	local pcData 
	if player.Team == game.Teams.Heroes then
		DebugXL:logD('Character','Adding hero character')
		pcData, characterKey = HeroAdded( startingCharacterModel, player )
	else
		DebugXL:logD('Character','Adding monster character')
		pcData, characterKey = MonsterAddedWait( startingCharacterModel, player )
	end
	if not pcData then
		DebugXL:Error( player.Name.." failed to add character: "..tostring( player.Team))
	end
	startingCharacterModel = nil  -- because it could be invalid at this point; the costume may have changed
	local character = player.Character

	player.Backpack:ClearAllChildren()
	ToolCaches.updateToolCache( characterKey, pcData )

	-- needs to come after costume applied or head gets replaced; apply costume probably sets it up for us, but not if dungeonlord
	if not character:FindFirstChild("CharacterLight") then
		if FloorData:CurrentFloor().characterLightN > 0 then
			local characterLight = game.ServerStorage.CharacterLight:Clone()
			characterLight.Handle.PointLight.Range = 	FloorData:CurrentFloor().characterLightN
			characterLight.Parent = character
		end
	end
end


local function MarkPlayersCharacterForDestruction( player )
	print( player.Name.." marked for destruction" )
--	--print( debug.traceback())
	DungeonPlayer:Get( player ).pcStateRequest = PCStateRequest.NeedsDestruction
end


function GameManagement:LevelReady()
	return levelReadyB 
end


-- this is stupid but I had typescript compilation problems I didn't want to bother figuring out
function GameManagement:SetLevelReady( _readyB )
	levelReadyB = _readyB	
end

function GameManagement:MarkPlayersCharacterForRespawn( player, optionalRespawnPart )
	print( player.Name.." marked for respawn" )
	if optionalRespawnPart then
		DebugXL:Assert( optionalRespawnPart:IsA("BasePart") )
	end
	DebugXL:Assert( GameManagement:LevelReady() )
	if not GameManagement:LevelReady() then
		warn( debug.traceback() )
	end
	if player.Parent then
		DungeonPlayer:Get( player ).pcStateRequest = PCStateRequest.NeedsRespawn 
		DungeonPlayer:Get( player ).respawnPart = optionalRespawnPart
	end
end 


local function TPK()
	local allHeroesDeadB = true
	-- if #game.Teams.Heroes:GetPlayers()==0 then return false end  -- it doesn't count as a tpk if there are no heroes. But why not?
	for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do		
		if player.Character then			
			if player.Character:FindFirstChild("Humanoid") then
				if player.Character.Humanoid.Health > 0 then
					if Heroes:HeroChosen( player ) then
						allHeroesDeadB = false
						break					
					else
--						--print( player.Name.." not HeroChosen" )
					end
				else
--					--print( player.Name.." health 0" )
				end
			else
--				--print( player.Name.." no humanoid" )
			end
		else
--			--print( player.Name.." character missing" )
		end
		-- maybe you're dead or maybe you're a fresh hero about to be reassembled
		if DungeonPlayer:Get( player ).pcState == PCState.Respawning then
			allHeroesDeadB = false
		end
	end
	return allHeroesDeadB
end



function ChooseHeroWait( player )
	CharacterI:SetCharacterClass( player, "" )
	PlayerServer.publishLevel( player, 1, 1 )

	-- or you're doing hero express
	while workspace.GameManagement.PreparationCountdown.Value > 0 or player.HeroExpressPreparationCountdown.Value > 0 do				
		if CharacterClientI:GetCharacterClass( player ) ~= "" then
			-- we made a decision
			--player.HeroChoiceTimeLeft.Value = 0
			return
		end
		--player:WaitForChild("HeroChoiceTimeLeft").Value = math.ceil( countdown - ( time() - startCountdownTick ) )
		wait( 0.25 )
		player.HeroExpressPreparationCountdown.Value = math.max( player.HeroExpressPreparationCountdown.Value - 0.25, 0 ) 
	end
	-- you don't get to prepare if you waited for default
	player.HeroExpressPreparationCountdown.Value = 0
	workspace.Signals.ChooseHeroRE:FireClient( player, "DefaultHeroChosen" )
--	player.HeroChoiceTimeLeft.Value = 0
	Heroes:ChooseDefaultHeroWait( player )
end	


local function ChangeHeroToMonster( player )
	local myDungeonPlayerT = DungeonPlayer:Get( player )	
	myDungeonPlayerT.lastHeroDeathTime = time()
	local localTick = time()
	-- if the rest of the characters die while we're lying in pieces
	while GameManagement:LevelReady() and time() < localTick + 5 do
		wait()
	end
	CharacterI:ChangeTeam( player, game.Teams.Monsters )							
	player.BuildPoints.Value = Places.getCurrentPlace().startingBuildPoints
end


local function ChangeMonsterToHero( designatedMonsterPlayer, loadCharacterB )
	DebugXL:Assert( Inventory:GetCount( designatedMonsterPlayer, "Tutorial" ) >= 3 )
	print( "Changing "..designatedMonsterPlayer.Name.." to hero" )
	MarkPlayersCharacterForDestruction( designatedMonsterPlayer )	
	CharacterI:ChangeTeam( designatedMonsterPlayer, game.Teams.Heroes )  -- this will automatically launch Choose dialog on client
	
	print("ChooseHeroRE:FireClient:ChooseHero:"..designatedMonsterPlayer.Name)
	spawn( function()
		while not DungeonPlayer:Get( designatedMonsterPlayer ).chooseHeroREAckedB do wait(0.1) end
		print("ChooseHeroRE:FireClient:ChooseHero:"..designatedMonsterPlayer.Name.." fired")
		workspace.Signals.ChooseHeroRE:FireClient( designatedMonsterPlayer, "ChooseHero" )
	end )
	
	designatedMonsterPlayer.BuildPoints.Value = Places.getCurrentPlace().startingBuildPoints
	
	-- destroy all the furnishings I've added so I a) don't know where they are and b) am not encouraged, as a monster, to not create them
	-- this is probably automatic now that a TPK starts over
	for _, furnishing in pairs( workspace.Building:GetChildren() ) do
		if furnishing.creator.Value == designatedMonsterPlayer then
			-- leave floor-type furnishings because it'll be a pain to restore the floor
			if PossessionData.dataT[ BlueprintUtility.getPossessionName( furnishing ) ].placementType ~= PossessionData.PlacementTypeEnum.Floor then
				furnishing:Destroy()
			end
		end
	end
	
	spawn( function() 
		ChooseHeroWait( designatedMonsterPlayer ) 
		-- wait for them to setup gear
		while designatedMonsterPlayer.HeroExpressPreparationCountdown.Value > 0 do
			wait(0.25)
			designatedMonsterPlayer.HeroExpressPreparationCountdown.Value = math.max( designatedMonsterPlayer.HeroExpressPreparationCountdown.Value - 0.25, 0 ) 		
		end
		if loadCharacterB then
			if workspace.GameManagement.GameState.Value == "LevelPlaying" then-- GameManagement:LevelReady() then
				GameManagement:MarkPlayersCharacterForRespawn( designatedMonsterPlayer )
			end
		end
	end )
end


local function InviteMonsterToBeHeroWait( player )
	DebugXL:Assert( currentPlayerInvitedToHero == nil )
	
	currentPlayerInvitedToHero = player
	player.HeroInviteCountdown.Value = 10
	-- doing this the less accurate way because I want external agents to be able to cancel countdown as well
	while player.HeroInviteCountdown.Value > 0 and player.Parent do
		wait(1)
		player.HeroInviteCountdown.Value = player.HeroInviteCountdown.Value - 1
	end
	-- whether or not you deny invitation you'll have your hero express available for next round
	-- ignored as of 12/3
	player.HeroExpressReady.Value = true
	if DungeonPlayer:Get( player ) then
		DungeonPlayer:Get( player ).lastHeroDeathTime = time()
	end

	currentPlayerInvitedToHero = nil
end


function GameManagement:DenyHeroInvite( player )
	player.HeroInviteCountdown.Value = 0
end


-- used by constant hero churn version; waits up to 10 seconds for each player considering whether they want to be hero
local function ChangeMonstersToHeroIfNecessaryWait( loadCharacterB )
--	warn( "Choosing heroes" )
	if #game.Players:GetPlayers() > 1 then
--		--print( "More than one player" )
		if #game.Teams.Heroes:GetPlayers() < GameServer.numHeroesNeeded() then
--			--print( "Insufficient heroes" )
			local heroRoundPairsA
			-- don't iterate over dungeonPlayersT because there's a chance there's a record for a player who has left in there
			heroRoundPairsA = {}
			for _, player in pairs( game.Players:GetPlayers() ) do
				if player.Team == game.Teams.Monsters  
					and DungeonPlayer:Get( player ).addingCompleteB 
					and Inventory:GetCount( player, "Tutorial" ) >= 3 then
					table.insert( heroRoundPairsA, { k = player, v = DungeonPlayer:Get( player ) } )
				end
			end
	
			if #heroRoundPairsA >= 1 then
				table.sort( heroRoundPairsA, function( x1, x2 ) return x1.v.lastHeroDeathTime < x2.v.lastHeroDeathTime end )		
				local designatedMonsterPlayer = heroRoundPairsA[ 1 ].k
				if not Inventory:PlayerInTutorial( designatedMonsterPlayer ) then           -- looks like we leave tutorial peeps at the front of the line indefinitely
					--print( "Found non dungeonlord monster "..designatedMonsterPlayer.Name )
					local heroRoundPair = table.remove( heroRoundPairsA, 1 )
					--print( "Inviting "..designatedMonsterPlayer.Name.." to hero" )
					InviteMonsterToBeHeroWait( designatedMonsterPlayer )
				end
			end
		end
	else
--		--print( "One player" )
		if workspace.GameManagement.TestHero.Value then
			if game.Players:GetPlayers()[1].Team ~= game.Teams.Heroes then
				ChangeMonsterToHero( game.Players:GetPlayers()[1] )
			end	
		end
	end
end


-- used by non-constant-hero-churn version
local function ChangeMonstersToHeroIfNecessary( loadCharacterB )
--	warn( "Choosing heroes" )
	if #game.Players:GetPlayers() > 1 then
--		--print( "More than one player" )
		local heroRoundPairsA
		-- don't iterate over dungeonPlayersT because there's a chance there's a record for a player who has left in there
		heroRoundPairsA = {}
		for _, player in pairs( game.Players:GetPlayers() ) do
			if player.Team == game.Teams.Monsters  
				and DungeonPlayer:Get( player ).addingCompleteB 
				and Inventory:GetCount( player, "Tutorial" ) >= 3 then
				table.insert( heroRoundPairsA, { k = player, v = DungeonPlayer:Get( player ) } )
			end
		end

		table.sort( heroRoundPairsA, function( x1, x2 ) return x1.v.lastHeroDeathTime < x2.v.lastHeroDeathTime end )		
		while #game.Teams.Heroes:GetPlayers() < GameServer.numHeroesNeeded() do
--			--print( "Insufficient heroes" )
			local foundOneB = false
			for i = 1, #heroRoundPairsA do   
				--print( "Hero round pair "..i )
				if not Inventory:PlayerInTutorial( heroRoundPairsA[i].k ) then
					--print( "Found non dungeonlord monster "..heroRoundPairsA[i].k.Name )
					local heroRoundPair = table.remove( heroRoundPairsA, i )
					local designatedMonsterPlayer = heroRoundPair.k
					print( "Changing "..designatedMonsterPlayer.Name.." to hero" )
					if heroRoundPair.v.lastHeroDeathTime > 0 then
						-- we got here naturally and will be allowed to use hero express next time we're a monster
						-- ignored as of 12/3
						designatedMonsterPlayer.HeroExpressReady.Value = true
					end
					ChangeMonsterToHero( designatedMonsterPlayer, loadCharacterB )
					foundOneB = true
					break
				end
			end
			if not foundOneB then break end
		end
	else
--		--print( "One player" )
		if workspace.GameManagement.TestHero.Value then
			if #game.Players:GetPlayers() > 0 then   -- after all players left still performing some shutdown stuff
				if game.Players:GetPlayers()[1].Team ~= game.Teams.Heroes then
					ChangeMonsterToHero( game.Players:GetPlayers()[1] )
				end	
			end
		end
	end
end
	

-- for debug purposes:
local crashPlayer


local function DistanceToNearestHeroXZ( v3 )
	local heroCharacters = TableXL:FindAllInAWhere( game.Teams.Heroes:GetPlayers(), function( player )
		return player.Character and player.Character.PrimaryPart end )

	local bestFit, bestFitness = TableXL:FindBestFitMin( heroCharacters, function( player )
		local deltaV3 = player.Character.PrimaryPart.Position - v3
		deltaV3 = Vector3.new( deltaV3.X, 0, deltaV3.Z )
		return deltaV3.Magnitude
	end)
	
	return bestFit and bestFitness or math.huge
end

-- what happens if there's a TPK while player is choosing their hero, you ask?
-- answer: there can't be.
	
-- we watch and handle the character in a loop rather than let events trigger changes
-- so things don't overlap
local function MonitorPlayer( player )
	local myDungeonPlayerT = DungeonPlayer:Get( player )
	myDungeonPlayerT.playerMonitoredB = true
	local monitorCyclesN = 0
	local beDungeonlordB = false 
	while not myDungeonPlayerT.playerRemovingB do
		local status, err = DisableablePcall( function()
			DebugXL:logI( 'MonitorPlayer',  player.Name.." monitoring lifetime" )
			myDungeonPlayerT.pcState = PCState.Limbo
			--while not GameManagement:LevelReady() do wait() end
			-- if time to be a hero
			--print( player.Name.." waiting for respawn order" )
			while myDungeonPlayerT.pcStateRequest ~= PCStateRequest.NeedsRespawn do wait() end
			myDungeonPlayerT.pcStateRequest = PCStateRequest.None
			local levelSessionN = levelSessionCounterN  -- for testing purposes
			DebugXL:logI( 'MonitorPlayer', player.Name.." beginning respawn" )
			myDungeonPlayerT.pcState = PCState.Respawning
			if not GameManagement:LevelReady() then
				DebugXL:Error( "Level not ready when "..player.Name.." triggered respawn" )
			end
			while not GameManagement:LevelReady() do wait() end
			DebugXL:logV( 'MonitorPlayer', player.Name.." can respawn because level is ready" )
			local spawnPart = myDungeonPlayerT.respawnPart
			--myDungeonPlayerT.respawnPart = nil
			
			-- megabosses override. well, this got ugly, mostly a dupe of below
			local monsterSpawns = FurnishServer:GetMonsterSpawners()
			--print( "Untrimmed monster spawn list for"..player.Name )
			--DebugXL:Dump( monsterSpawns )

			if player.Team == game.Teams.Monsters then
				if beDungeonlordB or workspace.GameManagement.PreparationCountdown.Value > 0 or 
					( Inventory:PlayerInTutorial( player ) and Inventory:GetCount( player, "TimeInvested" )<=450 ) then -- once they've been playing for 10 minutes just give up on trying to tutorialize them
					--print( "No megaboss check")
					-- megaboss don't override
				else
					--print( "Megaboss check")
					for i, spawner in pairs( monsterSpawns ) do
						if spawner.OneUse.Value then
							--print( "Found a boss spawn for "..player.Name ) 
							if spawner.LastPlayer.Value == nil then
								--print( "Unoccupied" )
								if CharacterClasses.monsterStats[ spawner.CharacterClass.Value ].tagsT.Superboss then
									--print( "Megaboss" )
									spawnPart = spawner
									spawner.LastPlayer.Value = player
									CharacterI:SetCharacterClass( player, spawnPart.CharacterClass.Value )
									break
								end
							end								
						end
					end
				end
			end

			-- choose a respawn if we don't have one
			if not spawnPart then
				if player.Team == game.Teams.Heroes then
					local customSpawns = game.CollectionService:GetTagged("CustomSpawn")
					spawnPart = TableXL:FindFirstWhere( customSpawns, function(x) return x.Team.Value==game.Teams.Heroes end )
					--spawnPart = workspace.StaticEnvironment.HeroSpawn
				else
					local monsterSpawnN = #monsterSpawns
					DebugXL:Assert( monsterSpawnN > 0 )

					if beDungeonlordB or workspace.GameManagement.PreparationCountdown.Value > 0 or 
						 ( Inventory:PlayerInTutorial( player ) and Inventory:GetCount( player, "TimeInvested" )<=450 ) then -- once they've been playing for 10 minutes just give up on trying to tutorialize them
						-- while heroes are prepping start off as "DungeonLord"; invulnerable monster that just builds
						spawnPart = monsterSpawns[ MathXL:RandomInteger( 1, monsterSpawnN ) ]
						CharacterI:SetCharacterClass( player, "DungeonLord" )
						beDungeonlordB = false
					else			
						-- bosses take priority
						local acceptableSpawns = {}
						for i, spawner in pairs( monsterSpawns ) do
							if spawner.OneUse.Value then
								--print( "Found a boss spawn for "..player.Name ) 
								if spawner.LastPlayer.Value == nil then
									--print( "Unoccupied" )
									spawnPart = spawner
									break
								end								
								table.remove( monsterSpawns, i )
							elseif DistanceToNearestHeroXZ( spawner.Position ) > MapTileData.tileWidthN * 2.5 then
								table.insert( acceptableSpawns, spawner )
							else
								--print( "Spawner at "..tostring(spawner.Position).." too close to hero" )
							end
						end
						if not spawnPart then
							--print( "Acceptable spawn list for"..player.Name )
							--DebugXL:Dump( acceptableSpawns )
							--print( "Fallback spawn list for"..player.Name )
							--DebugXL:Dump( monsterSpawns )
							if #acceptableSpawns > 0 then
								spawnPart = acceptableSpawns[ MathXL:RandomInteger( 1, #acceptableSpawns ) ]
							else
								-- couldn't find a spot far away from us, give up and spawn close
								spawnPart = monsterSpawns[ MathXL:RandomInteger( 1, #monsterSpawns ) ]
							end
						end
						CharacterI:SetCharacterClass( player, spawnPart.CharacterClass.Value )
					end
				end
			end
			--print( player.Name.." has spawnPart" )
			
			-- fixme; something's going wrong here
			if levelSessionCounterN ~= levelSessionN then
				local diagS = "Session changed in the middle of "..player.Name.."'s spawn. levelSessionCounterN: "..
					levelSessionCounterN.." levelSessionN: "..levelSessionN.." monitorCyclesN: "..monitorCyclesN.." gameStateDesc: "..workspace.GameManagement.GameState.Value
				DebugXL:Error( diagS )
			end
			DebugXL:logI( 'MonitorPlayer', player.Name.." calling LoadCharacterWait" )
			
			PlayerXL:LoadCharacterWait( player, 
				nil, 
				spawnPart, 
				levelSessionN,   -- for debugging
				function() return levelSessionCounterN end )  -- for debugging
			-- possible respawn failed here
			if player.Character then
				myDungeonPlayerT.pcState = PCState.Exists
				DebugXL:logI( 'MonitorPlayer', player.Name.." spawned character" )

			--		-- wait until time to change
				
				while wait() do
					local playerCharacter = player.Character
					if playerCharacter then  
						local humanoid = player.Character:FindFirstChild("Humanoid")
						-- test what happens if monitor crashes
						if crashPlayer == player then
							crashPlayer = nil
							local tbl = { [nil]=0 }
						end
						
						if not player.Parent then 
							myDungeonPlayerT.playerMonitoredB = false 
							return 
						end
						if not humanoid or not humanoid.Parent or humanoid.Health <= 0 then
							-- monster dead
							if player.Team == game.Teams.Heroes then
								Inventory:AdjustCount( player, "HeroDeaths", 1 )
								local localTick = time()
--								GameAnalyticsServer.ServerEvent( { ["category"] = "progression", ["event_id"] = "Fail:SubdwellerColony:"..tostring(workspace.GameManagement.DungeonFloor.Value) }, player )
								Heroes:Died( player )  
								-- if the rest of the characters die while we're lying in pieces
								while GameManagement:LevelReady() and time() < localTick + 2 do
									wait()
								end
								playerCharacter.Parent = nil

								ChangeHeroToMonster( player )
								-- we don't need to keep heroes as dungeon lords if we're constantly churning
								beDungeonlordB = true
							else
								local localTick = time()
								Monsters:Died( playerCharacter )  -- fixme: this needs to be called for AI NPC mobs as well
								-- if the rest of the characters die while we're lying in pieces
								while GameManagement:LevelReady() and time() < localTick + 2 do
									wait()
								end
								-- character might be gone by now
								playerCharacter.Parent = nil
							end
							-- we don't want to do this if it was a tpk, but tpk cleanup should change it back
							if GameManagement:LevelReady() then
								GameManagement:MarkPlayersCharacterForRespawn( player )
							end
							DebugXL:logI( 'MonitorPlayer', player.Name.." lifetime ended in death" ) 
							break
						end
						if myDungeonPlayerT.pcStateRequest == PCStateRequest.NeedsDestruction then
							player.Character:Destroy()
							DebugXL:logI( 'MonitorPlayer', player.Name.." lifetime aborted:"..myDungeonPlayerT.pcState ) 
							break				
						end
						if  myDungeonPlayerT.pcStateRequest == PCStateRequest.NeedsRespawn then
							player.Character:Destroy()
							DebugXL:logI( 'MonitorPlayer', player.Name.." lifetime aborted:"..myDungeonPlayerT.pcState ) 
							break
						end
						-- not promotion requested
						-- not dead
						-- not end-of-level 
						wait()
					else
						DebugXL:logI( 'MonitorPlayer', player.Name.." character nil, recycling monitor.")
						break
					end
				end
			else
				DebugXL:logI( 'MonitorPlayer', player.Name.." spawn failed, recycling monitor." )
			end
			monitorCyclesN = monitorCyclesN + 1
		end )  -- end pcall
	
		if not status then
			-- things really fucked up!  emergency!
			-- clean up the best we can
			if( err )then
				DebugXL:Error( "Monitor failure: "..err )
			else
				DebugXL:Error( "Monitor failure: UNKNOWN ERR" )
			end

			wait()  -- we need this otherwise it's possible to get stuck in a loop without any waits and lock the server 
			if player.Parent then
				if player.Character then
					player.Character:Destroy()					
				end
				if myDungeonPlayerT.pcStateRequest == PCStateRequest.None then
					-- we probably need to respawn
					GameManagement:MarkPlayersCharacterForRespawn( player )
				end 
			else
				myDungeonPlayerT.playerMonitoredB = false				
				return
			end
		end	
	end
	myDungeonPlayerT.playerMonitoredB = false				
end


local function PlayerCharactersMissing()
	local pcsMissing = false
	for _, player in pairs( game.Players:GetPlayers() ) do
		-- if dungeonPlayersT hasn't ben initialized for players I"m not going to count that as missing in case something goes wrong, long load time, whatever
		if DungeonPlayer:Get( player ) then
			if DungeonPlayer:Get( player ).pcState ~= PCState.Exists then   -- going to count respawning as not there yet
				pcsMissing = true
			end 
		end
--		if not player.Character or not player.Character.Parent then  -- this doesn't really tell us if it's respawning or destroying 
--			pcsMissing = true 
--		end
	end
	return pcsMissing	
end


local function PlayerCharactersExist()
	local pcsExist = false
	for _, player in pairs( game.Players:GetPlayers() ) do
		DebugXL:Assert( DungeonPlayer:Get( player ).pcState )
		if DungeonPlayer:Get( player ).pcState then
			if DungeonPlayer:Get( player ).pcState ~= PCState.Limbo then
				DebugXL:logI( "Players", player.Name.." still exists state "..DungeonPlayer:Get( player ).pcState.."; request "..DungeonPlayer:Get( player ).pcStateRequest )
				pcsExist = true
				break
			end 
		end
--		if player.Character and player.Character.Parent then   -- this doesn't tell us if it's respawning
--			pcsExist = true 
--		end
	end
	return pcsExist
end
	
		
local function SaveOriginalPlayerCostumeWait( player )
	DebugXL:Assert( player:IsA("Player") )
	PlayerXL:AppearanceLoadedWait( player )
--	if not player:HasAppearanceLoaded() then
--		if player.UserId >= 0 then   -- doesn't work in client-server testing
--			--print("Waiting for "..player.Name.." appearance to load")
--			player.CharacterAppearanceLoaded:Wait()
--		end
--	end
	while not player.Character do wait() end	
	InstanceXL:CreateSingleton( "BoolValue", { Name = "HideCharacter", Value = true, Parent = player.Character } )
	Costumes:SaveCostumeWait( player )
	warn( player.Name.." original costume saved")
end

	
local function PlayerAdded( player )
	local startTime = time()	
	InstanceXL:CreateSingleton( "NumberValue", { Value = Places.getCurrentPlace().startingBuildPoints, Name = "BuildPoints", Parent = player } )
	local leaderstats = InstanceXL:CreateSingleton( "Model", { Name = "leaderstats", Parent = player } )
	local starsN = Inventory:GetCount( player, "Stars" )
	InstanceXL:CreateSingleton( "StringValue", { Name = "Rank", Parent = leaderstats, Value = RankForStars:GetRankForStars( starsN ) } ) 
	InstanceXL:CreateSingleton( "StringValue", { Name = "VIP", Parent = leaderstats, Value = DeveloperProducts:UserOwnsGamePassWait( player, DeveloperProducts.vipPassId ) and "VIP" or "" } )

	-- ignored as of 12/3
	InstanceXL:CreateSingleton( "BoolValue", { 
		Value = true,-- #game.Players:GetPlayers() == 1,  	-- very first player can use hero express for their farming pleasure 
		Name = "HeroExpressReady", 
		Parent = player } )
	InstanceXL:CreateSingleton( "NumberValue", { Name = "HeroInviteCountdown", Value = 0, Parent = player } )
	InstanceXL:CreateSingleton( "NumberValue", { Name = "HeroExpressPreparationCountdown", Value = 0, Parent = player } )		

	-- they logged out already?  awww
	if not player.Parent then return end

	-- hack: we need to spawn your avatar once right away to initialize the UI
	--print( "Begin initial LoadCharacter for "..player.Name )	
	local status, err = pcall( function()
		DebugXL:logI('CharacterModel', "Loading character model for "..player.Name)
		player:LoadCharacter()  -- this seems to still be throwing an error even though we check on the previous line. thanks Roblox
		DebugXL:logI('CharacterModel', "Character model load returned for "..player.Name)
	end )	
	if not status then
		if not player.Parent then 
			warn( player.Name.." left game before LoadCharacter finished" )
		else
			DebugXL:Error( player.Name.." problem loading character: "..err )
		end
		return
	end
	--print( "Initial LoadCharacter for "..player.Name.." finished" )	
	--AnalyticsXL:ReportHistogram( player, "Duration: Initial Player Load", time() - startTime, 1, "second", player.Name, true)

	SaveOriginalPlayerCostumeWait( player )
		
	--and we can't destroy the avatar because then the UI might not finish loading
	startTime = time()	
	while not DungeonPlayer:Get( player ).guiLoadedB do 
		if time() - startTime > 30 then  -- player, name, category, label, integer, includeDevsB
			AnalyticsXL:ReportEvent( player, "Gui Unacknowledged", player.Name, "", 1, true)
			break
		end
		wait(0.1) 
	end	
	AnalyticsXL:ReportHistogram( player, "Duration: Gui Acknowledged", time() - startTime, 1, "second", "", true)

	
	-- rather than destroy your character, we'll keep the screen black when you're on the wrong team
	-- you'll spawn in the holding pit
	--while not player.Character do wait() end
--	if DungeonPlayer:Get( player ).guiLoadedB then   -- if we failed to load the interface, better be safe and not destroy the character for now	
--		player.Character:Destroy()
--	end
	
	PlayerServer.customCharacterAddedConnect( player, function( character )
		--print( "Character added: "..character.Name )
		SetupPCWait( character, player )
	end)
		
	pcall( function()
		player.Team = game.Teams.Monsters
	end )

	spawn( function() MonitorPlayer( player ) end )
	
	DungeonPlayer:Get( player ).addingCompleteB = true
	print( player.Name.." adding complete" )
	-- is safe because if we're between levels it won't respawn
	
	if GameManagement:LevelReady() then
		GameManagement:MarkPlayersCharacterForRespawn( player )
	end 
end


local function PlayerRemoving( player )
	DungeonPlayer:Get( player ).playerRemovingB = true
end


for _, player in pairs( game.Players:GetPlayers() ) do spawn( function() PlayerAdded( player ) end ) end
game.Players.PlayerAdded:Connect( PlayerAdded )


-- game loop



-- Lounge mode means there are monsters doing tutorials or hanging out and nobody is eligible to be a hero yet
-- as soon there's 2 players and one of them has finished tutorial we can go
local function LoungeModeOver()
	warn( "LoungeModeOver still being executed" )
	if #game.Teams.Heroes:GetPlayers()==0 then
		if #game.Players:GetPlayers()>=2 then
			for _, player in pairs( game.Teams.Monsters:GetPlayers() ) do
				local class = CharacterClientI:GetCharacterClass( player )
				if class ~= "DungeonLord" and class ~= "" then
					return true
				end 
			end
		end
	end
	return false
end


-- old busted
--local function RemoveCharactersWait()
--	for _, player in pairs( game.Players:GetPlayers() ) do
--		MarkPlayersCharacterForDestruction( player )
--	end
--	while PlayerCharactersExist() do wait() end
--end


-- new hotness
local function RemoveCharactersWait()
	local startTime = time()
	while PlayerCharactersExist() do 
		for _, player in pairs( game.Players:GetPlayers() ) do			
			if DungeonPlayer:Get( player ).pcStateRequest ~= PCStateRequest.NeedsDestruction and DungeonPlayer:Get( player ).pcState ~= PCState.Limbo then
				MarkPlayersCharacterForDestruction( player )
			end
		end
		wait() 
		if time() - startTime > 15 then
			-- emergency abort
			-- what's going on
			local doubleCheck = false
			for _, player in pairs( game.Players:GetPlayers() ) do
				DebugXL:Assert( DungeonPlayer:Get( player ).pcState )
				if DungeonPlayer:Get( player ).pcState then
					if DungeonPlayer:Get( player ).pcState ~= PCState.Limbo then
						local character = player.Character
						local characterParent = character and character.Parent or nil
						DebugXL:Error( "RemoveCharactersWait() timed out:".. player.Name.." still exists state "..DungeonPlayer:Get( player ).pcState.."; request "..DungeonPlayer:Get( player ).pcStateRequest.." character ".. tostring( character ) .."; character parent ".. tostring( characterParent ) )
						doubleCheck = true
					end 
				end
			end			
			if not doubleCheck then
				DebugXL:Error( "RemoveCharactersWait() timed out even though nobody exists" )
			end
			break
		end
	end
end


local function LoadCharactersWait()
	DebugXL:Assert( GameManagement:LevelReady() )
	for _, player in pairs( game.Players:GetPlayers() ) do	
		-- this is only called when we go from preparation to actual play; monsters need to stay what they are and jump back to a spawn point
		GameManagement:MarkPlayersCharacterForRespawn( player, DungeonPlayer:Get( player ).respawnPart )
	end
	while PlayerCharactersMissing() do wait() end
end


local function LoadHeroesWait()
	DebugXL:Assert( GameManagement:LevelReady() )
	for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do		
		GameManagement:MarkPlayersCharacterForRespawn( player )
	end
	while PlayerCharactersMissing() do wait() end  -- what happens when new player shows up?  Do they get appropriately created as monster?
end


function GameManagement:ReachedExit( player )
	if player.Team == game.Teams.Heroes then
		
		Inventory:AdjustCount( player, "NewLevels", 1 )		
		workspace.Standard.MessageGuiXL.MessageRE:FireAllClients( "NextFloor", { player.Name }, false )
		
		reachedExitB = true
		return true
	end
	return false
end


function GameManagement:BeatSuperboss()
	warn("BeatSuperboss()")

	firstLevelB = true

	--print( "Awarding end of dungeon" )
	for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
		Heroes:AwardExperienceWait( player, HeroServer.getDifficultyLevel() * 100, "Progress", "Superboss" )
	end
	
	beatSuperbossB = true
end



local function LoadLevelWait()
	Dungeon:BuildWait( function( player ) return GameManagement:ReachedExit( player ) end )
	FurnishServer:FurnishWithRandomSpawns()
	FurnishServer:FurnishWithRandomChests()
	levelSessionCounterN = levelSessionCounterN + 1
	levelReadyB = true
end



local function PlayLevelWait()
	reachedExitB = false
	beatSuperbossB = false
	GameManagement.levelStartTime = time()
--	LoadLevelWait()
--	LoadHeroesWait()
	LoadCharactersWait()	
	-- for _, player in pairs( game.Teams.Heroes:GetPlayers()) do
	-- 	GameAnalyticsServer.ServerEvent( { ["category"] = "progression", ["event_id"] = "Start:SubdwellerColony:"..tostring(workspace.GameManagement.DungeonFloor.Value) }, player )
	-- end

	ChangeGameState( "LevelPlaying" )
	
	local averageHeroLocalLevel = HeroServer.getAverageHeroLocalLevel()
	local numHeroes = #game.Teams.Heroes:GetPlayers()
	local dungeonDepth = DungeonDeck.getCurrentDepth()
	DestructibleServer.calibrateAllDestructiblesHealth( averageHeroLocalLevel, numHeroes, dungeonDepth )
	
	warn( "All characters loaded. Playing." )
	local levelResult
	-- wait for level to be complete either through TPK 
	-- (includes all heroes leaving before monster promoted)
	-- or heroes getting to next level 
	MonsterServer.resetLevelBalancer()
	lastMonsterLevels = {}
	while wait() do 
		workspace.GameManagement.LevelTimeElapsed.Value = time() - GameManagement.levelStartTime	
		MonsterServer.awardTeamXPForTimeElapsed()

		if timeToThrowARodB then
			--DebugXL:Error( "This won't shut down server will it?" )
			local emptyTable = {}
			emptyTable[ nil ] = 'die'
		end
		if TPK() then
			levelResult = LevelResultEnum.TPK
			break
--		elseif LoungeModeOver() then
--			levelResult = LevelResultEnum.LoungeModeOver
--			break
		-- probably didn't need to duplicate state here with bools *and* a state variable
		elseif reachedExitB then		
			local newDungeonDepth = DungeonDeck:goToNextFloor()
			--print( "Awarding next level awards" )
			for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
--				GameAnalyticsServer.ServerEvent( { ["category"] = "progression", ["event_id"] = "Complete:SubdwellerColony:"..tostring(workspace.GameManagement.DungeonFloor.Value) }, player )
				Heroes:NewDungeonLevel( player, newDungeonDepth )
				Heroes:AwardExperienceWait( player, HeroServer.getDifficultyLevel() * 100, "Progress", "Floor" )
				Inventory:AdjustCount( player, "Stars", 10, "Progress", "Floor" )
				Inventory:EarnRubies( player, 10, "Progress", "Floor" )
			end
			for _, player in pairs( game.Teams.Monsters:GetPlayers() ) do
				Monsters:AdjustBuildPoints( player, 50 )
			end
				
			levelResult = LevelResultEnum.ExitReached
			break
		elseif beatSuperbossB then
			warn( "Setting BeatSuperboss state" )
			levelResult = LevelResultEnum.BeatSuperboss
			break
		end
	end
	
	levelReadyB = false
	for _, playerData in pairs( dungeonPlayersT ) do
		playerData.signalledReadyB = false
	end
	
	RemoveCharactersWait()
	HeroServer.resetCurrentLevelCap()
	print( "Level finished and swept" )
	return levelResult
end


local function SpawnMonsters()
	DebugXL:Assert( GameManagement:LevelReady() )
	for _, player in pairs( game.Teams.Monsters:GetPlayers() ) do
		GameManagement:MarkPlayersCharacterForRespawn( player )
	end	
end


local function InviteMonstersToBeHeroesWhileNecessaryWait()
	while #game.Teams.Heroes:GetPlayers() < GameServer.numHeroesNeeded() and workspace.GameManagement.PreparationCountdown.Value > 0 do
		ChangeMonstersToHeroIfNecessaryWait()
		wait(0.1)		
	end
end


local function HeroesChooseCharactersWait()
	-- this is allowed to migrate to next phase if HeroExpress hero hasn't finished choosing yet - they get all of their 60 seconds
	-- actually I don't know why they have a time limit at all ... though I guess it's a good thing otherwise they could gunk up a hero
	-- slot forever
	local done = false
	
	-- don't invite people to be heroes on the last floor, that sucks
	if( FloorData:CurrentFloor().exitStaircaseB )then
		spawn( InviteMonstersToBeHeroesWhileNecessaryWait )
	end
		
	local startCountdownTime = time()
	while not done do
		workspace.GameManagement.PreparationCountdown.Value = math.ceil( preparationDuration - ( time() - startCountdownTime ) )
		done = true
		for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
			if CharacterClientI:GetCharacterClass( player )=="" then
				done = false
				break
			end
			-- if you're hero expressing, throw your lot in with the group timer here; everyone spawns at the same time 
			-- at end of prep phase
			player.HeroExpressPreparationCountdown.Value = 0
		end
		if done then
			
			-- but are we *really* done?
			-- once they've been chosen, we begin if time has run out 
			if workspace.GameManagement.PreparationCountdown.Value <= 0 then
				-- yeah, we're definitely really done
				break
			end
			-- or if all the heroes have signalled they're ready
			for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
				if not DungeonPlayer:Get( player ).signalledReadyB then
					done = false
					break
				end
			end	
		end
		wait()
	end
	workspace.GameManagement.PreparationCountdown.Value = 0
end


local protectionDisabled = false
function DisableablePcall( func )
	if protectionDisabled then
		func()
		return true, ""
	else
		return pcall( func )
	end
end


function GameManagement:MonitorPlayerbase()
	while true do
		ChangeMonstersToHeroIfNecessaryWait()
		wait(0.1)
	end
end


function DungeonVoteState()
	-- dungeonVotes = {}
	-- workspace.GameManagement.VoteCountdown.Value = workspace.GameManagement.FastStart.Value and 2 or 10
	-- ChangeGameState( "DungeonVote" )
	-- while( workspace.GameManagement.VoteCountdown.Value > 0 )do
	-- 	wait(1)
	-- 	workspace.GameManagement.VoteCountdown.Value = math.max( workspace.GameManagement.VoteCountdown.Value-1, 0 )
	-- end			
	-- local pollResults = DungeonVoteUtility.ProcessVotes( dungeonVotes )
	-- workspace.Signals.VoteRE:FireAllClients( "ShowPollResults", pollResults )
	-- local dungeonNum 
	-- if( pollResults[1] < pollResults[2] )then
	-- 	dungeonNum = 1
	-- elseif( pollResults[1] > pollResults[2] )then
	-- 	dungeonNum = 0
	-- else
	-- 	dungeonNum = MathXL:RandomInteger( 0, 1 )
	-- end
	local dungeonNum = MathXL:RandomInteger( 0, 1 )
	if dungeonNum==0 then
		DungeonDeck:shuffle("Subdweller Colony")
	else
		DungeonDeck:shuffle("Winter's Crypt")
	end
end


function GameManagement:Play()
	-- if something goes wrong in the core loop it's probably best to kick everyone
	local status, err = DisableablePcall( function()

		-- wait until at least one player is ready
		local weHavePlayerB = false
		while not weHavePlayerB do
			wait()
			for _, player in pairs( game.Players:GetPlayers() ) do
				if DungeonPlayer:Get( player ).addingCompleteB then
					weHavePlayerB = true
				end
			end
		end

		while true do
			-- set up lounge and wait while heroes choose their characters
			workspace.GameManagement.PreparationCountdown.Value = preparationDuration    -- it doesn't actually start counting down right away, but this reminds the very first hero not to wait their full thing

			if firstLevelB then
				DungeonVoteState()
				firstLevelB = false
			end

			ChangeGameState( "Lobby" )

			LoadLevelWait()  -- so monsters can start building while waiting
			ChangeGameState( "MonstersToHeroes" )

			roundCounterN = roundCounterN + 1			
	
			-- heroes from last round don't have to choose but do have to prepare
			for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
				warn( "Triggering PrepareHero for "..player.Name )
				if player.HeroExpressPreparationCountdown.Value <= 0 then 
					workspace.Signals.ChooseHeroRE:FireClient( player, "PrepareHero" )
				end
			end
			
			if workspace.GameManagement.DungeonDepth.Value <= 1 then  -- after a TPK, don't give players choice about becoming heroes
				ChangeMonstersToHeroIfNecessary( false )
			end
			-- spawn the unlucky ones

			ChangeGameState( "SpawnMonsters" )

			SpawnMonsters()		

			ChangeGameState( "InviteMonstersToBeHeroes" )

			-- wait until there's at least one hero before starting preparation countdown
			-- it's pretty rare that there won't be; you either brought a living hero from the previous level or they've been chosen
			-- due to TPK. 
			while #game.Teams.Heroes:GetPlayers() <= 0 do
				wait(0.1)
--		--		ChooseStartingHeroesWait()  -- maybe somebody will come in later that will make a nice hero or be worth promoting someone to hero
--					ChangeMonstersToHeroIfNecessaryWait( false )  -- this one asks for confirmation, but goes one at a time every 10 sec, and the last one may go past the preparation time			
				ChangeMonstersToHeroIfNecessary( false )    -- this one doesn't give them a choice
			end

			ChangeGameState( "HeroesChooseCharactersWait" )

			GameServer.askPlayersToRate()

			HeroesChooseCharactersWait()

			ChangeGameState( "RemoveCharactersWait" )

			RemoveCharactersWait()  -- a little awkward when the first player joins

			wait(2)  -- a little breath between each round

			ChangeGameState( "PlayLevelWait" )
	
			local levelResult = PlayLevelWait()
			if levelResult == LevelResultEnum.TPK then
				workspace.Standard.MessageGuiXL.MessageRE:FireAllClients( "TotalPartyKill", nil, false )
				firstLevelB = true
				-- and reset dungeon points
				for _, player in pairs( game.Players:GetPlayers() ) do
					-- hack for tutorial, make sure they keep enough points for that orc spawn
					local inventory = Inventory:GetWait( player )
					if inventory and InventoryUtility:IsInTutorial( inventory ) then
						player.BuildPoints.Value = 200
					else
						player.BuildPoints.Value = Places.getCurrentPlace().startingBuildPoints
					end
				end
			elseif levelResult == LevelResultEnum.BeatSuperboss then
				warn( "Changing heroes" )			
				for _, hero in pairs( game.Teams.Heroes:GetPlayers()) do
					warn( "Changing "..hero.Name.." to monster" )
					if hero.HeroExpressPreparationCountdown.Value <= 0 then  -- if you started a hero express right before the boss was beat, let you get on with your bad self
						ChangeHeroToMonster( hero )
					end
				end
			end
			
			ChangeGameState( "SessionEnd"..levelResult )

			wait(2)
		end
	end )
	-- oh no!  something terrible has happened
	DebugXL:Error( "Error in core game loop! "..err )
	while true do
		for _, player in pairs( game.Players:GetPlayers() ) do
			player:Kick( "Server failure" )
			wait()
		end		
	end
end


function GameManagement:BecomeHero( player )
	if workspace.GameManagement.PreparationCountdown.Value == 0 then
		player.HeroExpressPreparationCountdown.Value = 45
	else	
		player.HeroExpressPreparationCountdown.Value = 0
	end
	ChangeMonsterToHero( player, true ) 				
end


-- you may use Hero Express if you *didn't* use Hero Express to get to your last hero run
function GameManagement:HeroExpress( player )
	-- want to communicate it to the server
	-- ignored as of 12/3
	player.HeroExpressReady.Value = true
	
	-- there is a chance that right as they click the button they'll be promoted to hero anyway, so check:
	if player.Team ~= game.Teams.Heroes then
		-- if making him a hero right now would still mean fewer heroes than monsters, then let's do it
		-- new way, 12/3, only available if there aren't too many heroes already. If people juke the box and 
--		if #game.Players:GetPlayers()==1 or ( #game.Teams.Heroes:GetPlayers() + 1 <= #game.Teams.Monsters:GetPlayers() - 1 ) then
		if #game.Players:GetPlayers()==1 or ( #game.Teams.Monsters:GetPlayers() >= 2 ) then
--			ChatMessages:SayMessage( player.Name .. " used Hero Express" )
			GameManagement:BecomeHero( player )
		else
			-- otherwise jump to the front of the line. A question is if a second hero cuts to the front of the line
			-- they shouldn't end up in front of the first hero - so how do we make sure that doesn't happen
			-- the answer:  heroExpressServerN is a really low number. So when a hero cuts in line they'll get a lower number
			-- than all the plebes. But if another hero does the same thing their number will be higher than the previous
			-- expresser	
			if DungeonPlayer:Get( player ).lastHeroDeathTime >= 0 then
				DungeonPlayer:Get( player ).lastHeroDeathTime = heroExpressServerN
				heroExpressServerN = heroExpressServerN + 1
				MessageServer.PostMessageByKey( player, "HeroExpressLine", false )
			else
				-- they're already in line. unfortunately we took their money anyway;
				-- if this comes up a lot we'll have to fix it
				DebugXL:Error( player.Name.." paid twice for same hero express" )
			end
		end
	end
end 


-- this may seem odd but I'm going to try letting it leak and see what happens
-- at some point the size of the dungeonPlayers dictionary might become unwieldy but it's probably a log search and not too bad?
-- I doubt it will leak faster than the known Roblox sound memory leaks

---- garbage collection
--spawn( function()
--	while wait(0.1) do
--		for player, _ in pairs( dungeonPlayersT ) do
--			if not player.Parent and not DungeonPlayer:Get( player ).playerMonitoredB then
--				--print( "Collection dungeonPlayersT[] garbage for "..player.Name )
--				dungeonPlayersT[ player ] = nil
--			end
--		end
--	end
--end )


local MainRemote = {}

function MainRemote.BuffBuildPointsForTutorial( player )
	if Inventory:PlayerInTutorial( player ) and player.BuildPoints.Value < 200 then
		player.BuildPoints.Value = 200
	end
end


function MainRemote.CrashPlayer( player )
	if CheatUtilityXL:PlayerWhitelisted( player ) then
		warn( "Crashing "..player.Name )
		crashPlayer = player
	end
end


function MainRemote.SignalReady( player )
	local myDungeonPlayerT = dungeonPlayersT[ player ]
	myDungeonPlayerT.signalledReadyB= true
	player.HeroExpressPreparationCountdown.Value = 0	
end


function MainRemote.TestCoreLoopError( player )
	if CheatUtilityXL:PlayerWhitelisted( player ) then
		timeToThrowARodB = true
	end
end


function MainRemote.AcceptHeroInvite( player )
	if currentPlayerInvitedToHero == player then
		GameManagement:BecomeHero( player )
		player.HeroInviteCountdown.Value = 0	
	end	
end


function MainRemote.DenyHeroInvite( player )
	GameManagement:DenyHeroInvite( player )
end

function MainRemote.ForceHero( player )
    print("ForceHeroServer")
	if Places.getCurrentPlace() == Places.places.Underhaven then
		player.HeroExpressPreparationCountdown.Value = math.huge
		ChangeMonsterToHero( player, true )
	end
end

function MainRemote.DungeonVote( player, dungeon )
	dungeonVotes[ player ] = dungeon
end

workspace.Signals.MainRE.OnServerEvent:Connect( function( player, funcName, ... )
	MainRemote[ funcName ]( player, ... )
end)



return GameManagement
