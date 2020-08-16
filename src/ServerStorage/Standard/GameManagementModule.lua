
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

-- putting global game state operation messages in warn()
-- putting individual player operation messages in print()

local GameManagement = {
}

-- Dungeon Life main game manager
game.Players.CharacterAutoLoads = false

local InstanceXL        = require( game.ReplicatedStorage.Standard.InstanceXL )
local MathXL            = require( game.ReplicatedStorage.Standard.MathXL )

DebugXL:logD(LogArea.GameManagement,  'GameManagementModule: utilities requires succesful' )

local DeveloperProducts = require( game.ReplicatedStorage.DeveloperProducts )
local FloorData         = require( game.ReplicatedStorage.FloorData )
local InventoryUtility  = require( game.ReplicatedStorage.InventoryUtility )
local PossessionData    = require( game.ReplicatedStorage.PossessionData )
local RankForStars      = require( game.ReplicatedStorage.RankForStars )
DebugXL:logD(LogArea.GameManagement, 'GameManagementModule: ReplicatedStorage requires succesful' )


local AnalyticsXL       = require( game.ServerStorage.Standard.AnalyticsXL )
DebugXL:logD(LogArea.GameManagement, 'GameManagementModule: AnalyticsXL included')
--local ChatMessages      = require( game.ServerStorage.Standard.ChatMessages )
--DebugXL:logD(LogArea.GameManagement, 'GameManagementModule: ChatMessages included')
local Costumes          = require( game.ServerStorage.Standard.CostumesServer )
DebugXL:logD(LogArea.GameManagement, 'GameManagementModule: Costumes included')
--local GameAnalyticsServer = require( game.ServerStorage.Standard.GameAnalyticsServer )
--DebugXL:logD(LogArea.GameManagement, 'GameManagementModule: GameAnalyticsServer included')
local PlayerXL          = require( game.ServerStorage.Standard.PlayerXL )
DebugXL:logD(LogArea.GameManagement, 'GameManagementModule: ServerStorage.Standard requires succesful' )
local ToolCaches = require( game.ServerStorage.TS.ToolCaches ).ToolCaches

local CharacterI        = require( game.ServerStorage.CharacterI )
local Dungeon           = require( game.ServerStorage.DungeonModule )
local FurnishServer     = require( game.ServerStorage.FurnishServerModule )
local Heroes            = require( game.ServerStorage.Standard.HeroesModule )
local Inventory         = require( game.ServerStorage.InventoryModule )
local Monsters          = require( game.ServerStorage.MonstersModule )
DebugXL:logD(LogArea.GameManagement, 'GameManagementModule: ServerStorage requires succesful' )

local BlueprintUtility = require( game.ReplicatedStorage.TS.BlueprintUtility ).BlueprintUtility
local CharacterClasses = require( game.ReplicatedStorage.TS.CharacterClasses ).CharacterClasses
local CheatUtilityXL    = require( game.ReplicatedStorage.TS.CheatUtility )
local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest
local PlayerUtility = require( game.ReplicatedStorage.TS.PlayerUtility ).PlayerUtility
DebugXL:logD(LogArea.GameManagement, 'GameManagementModule: ReplicatedStorage.TS requires succesful' )

local Analytics = require( game.ServerStorage.TS.Analytics ).Analytics
local DestructibleServer = require( game.ServerStorage.TS.DestructibleServer ).DestructibleServer
local DungeonDeck = require( game.ServerStorage.TS.DungeonDeck ).DungeonDeck
local Furnisher = require( game.ServerStorage.TS.Furnisher ).Furnisher
local GameServer = require( game.ServerStorage.TS.GameServer ).GameServer
local HeroServer = require( game.ServerStorage.TS.HeroServer ).HeroServer
local MessageServer = require( game.ServerStorage.TS.MessageServer ).MessageServer
local MobServer = require( game.ServerStorage.TS.MobServer ).MobServer
local MonsterServer = require( game.ServerStorage.TS.MonsterServer ).MonsterServer
local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer
local TeamStyleChoice = require( game.ServerStorage.TS.PlayerServer ).TeamStyleChoice
local SkinUtility = require( game.ServerStorage.TS.SkinUtility ).SkinUtility

-- is there a one-line way to require a bunch of objects from a single file?
local DungeonPlayer = require( game.ServerStorage.TS.DungeonPlayer ).DungeonPlayer
DebugXL:logD(LogArea.GameManagement, 'GameManagementModule: ServerStorage.TS requires succesful' )

DebugXL:logD(LogArea.GameManagement, 'GameManagementModule processing')
local StarterGui = game.StarterGui

-- I have watched multiple heroes leave during a long prep; 60 is definitely too long. Sometimes they also get confused and wonder
-- why there's a black screen, I think, though that may have been legitimate bugginess.
-- We want *some* prep, though, particularly so after a TPK monsters can become heroes before we spawn the monsters and rebalance.
local preparationDuration = workspace.GameManagement.FastStart.Value and 10 or Places:getCurrentPlace().preparationDuration

local heroDeathSavoringSecondsK = 4

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


local gameStateStart = tick()

local lastMonsterLevels = {} 


local function ChangeGameState( newState )
	local lastState = workspace.GameManagement.GameState.Value
	DebugXL:logD(LogArea.GameManagement,"ChangeGameState from " .. lastState .. " to " .. newState )
	Analytics.ReportServerEvent( "GameStateChange", lastState, newState, workspace.GameManagement.GameStateTime.Value )
	workspace.GameManagement.GameState.Value = newState
	workspace.GameManagement.GameStateTime.Value = 0
	gameStateStart = tick()
	DebugXL:logW(LogArea.GameManagement, 'New state: ' .. workspace.GameManagement.GameState.Value )
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





function DungeonPlayer:Get( player )
	if not dungeonPlayersT[ player ] then
		dungeonPlayersT[ player ] = DungeonPlayer.new( player.UserId )		
	end 
	return dungeonPlayersT[ player ] 
end


-- hack
local GameManagementRemote = {}

function GameManagementRemote.AcknowledgeGuiLoaded( player )
	DungeonPlayer:Get( player ).guiLoadedB = true

	DebugXL:logV(LogArea.GameManagement, player.Name.." gui acknowledged" )
end

workspace.Signals.GameManagementRE.OnServerEvent:Connect( function( player, funcName, ... )
	GameManagementRemote[ funcName ]( player, ... )
end)
DebugXL:logW(LogArea.GameManagement, "Time until GameManagementRE connected: "..time() )

workspace.Signals.ChooseHeroRE.OnServerEvent:Connect( function( player, code )
	DebugXL:Assert( code == "ack")
	DebugXL:logD(LogArea.GameManagement, player.Name.." ChooseHeroRE acknowledged" )
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
	DebugXL:logD( LogArea.Gameplay, "Checking for courage auras for "..character.Name )
	if( Places.getCurrentPlace() ~= Places.places.Underhaven )then
		if character:FindFirstChild("AuraOfCourage") then
			DebugXL:logD(LogArea.GameManagement,"Aura found")
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

function GameManagement:MonsterAddedWait( character, player, playerTracker, inTutorial )
--	DebugXL:logV(LogArea.GameManagement, "Monster added "..player.Name )
	local pcData, characterKey = Monsters:PlayerCharacterAddedWait( Inventory, character, player, playerTracker )
	DebugXL:Assert( pcData )
	if not character:FindFirstChild("Humanoid") then return pcData end
	if not inTutorial then
		if workspace.GameManagement.DungeonDepth.Value > 0 then  		-- if you're in the lobby it doesn't matter what you are and that message is just distracting. Maybe we should automake you a dungeon lord in that case
			local class = pcData.idS
			if class == "DungeonLord" then
				if workspace.GameManagement.PreparationCountdown.Value > 0 then
					MessageServer.PostMessageByKey( player, "MsgWelcomeMonster" )				
				else
					MessageServer.PostMessageByKey( player, "MsgWelcomeDungeonLord" )
				end
			else
				if not PossessionData.dataT[ class ].readableNameS then
					DebugXL:Error( character.Name.." class "..class.." has no readableName" )
					return
				end
				local lastLevel = lastMonsterLevels[ player ]
				local thisLevel = pcData:getLocalLevel()
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
		DebugXL:logD(LogArea.Characters,'Adding hero character')
		pcData, characterKey = HeroAdded( startingCharacterModel, player )
	else
		DebugXL:logD(LogArea.Characters,'Adding monster character')
		pcData, characterKey = GameManagement:MonsterAddedWait( startingCharacterModel, player, PlayerServer.getPlayerTracker(), Inventory:PlayerInTutorial( player ) )
	end
	if not pcData then
		DebugXL:Error( player.Name.." failed to add character: "..tostring( player.Team))
	end
	startingCharacterModel = nil  -- because it could be invalid at this point; the costume may have changed
	local character = player.Character

	player.Backpack:ClearAllChildren()
	ToolCaches.updateToolCache( PlayerServer.getPlayerTracker(), characterKey, pcData, SkinUtility.getCurrentSkinset(Inventory, player, pcData))

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
	DebugXL:logD(LogArea.GameManagement, player.Name.." marked for destruction" )
--	DebugXL:logV(LogArea.GameManagement, debug.traceback())
	DungeonPlayer:Get( player ):requestDestruction()
end


function GameManagement:LevelReady()
	return levelReadyB 
end


-- this is stupid but I had typescript compilation problems I didn't want to bother figuring out
function GameManagement:SetLevelReady( _readyB )
	levelReadyB = _readyB	
end

function GameManagement:MarkPlayersCharacterForRespawn( player, optionalRespawnPart )
	DebugXL:logD(LogArea.GameManagement, player.Name.." marked for respawn" )
	if optionalRespawnPart then
		DebugXL:Assert( optionalRespawnPart:IsA("BasePart") )
	end
	DebugXL:Assert( GameManagement:LevelReady() )
	if not GameManagement:LevelReady() then
		DebugXL:logW(LogArea.GameManagement, debug.traceback() )
	end
	if player.Parent then
		DungeonPlayer:Get( player ):requestRespawn()
		DungeonPlayer:Get( player ).respawnPart = optionalRespawnPart
	end
end 

local staticAllHeroesDeadB = true

local function TPK()	
	-- if #game.Teams.Heroes:GetPlayers()==0 then return false end  -- it doesn't count as a tpk if there are no heroes. But why not?
	local allHeroesDeadB = true
	for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do		
		if player.Character then			
			if player.Character:FindFirstChild("Humanoid") then
				if player.Character.Humanoid.Health > 0 then
					if Heroes:HeroChosen( player ) then
						allHeroesDeadB = false
						break					
					else
						DebugXL:logV(LogArea.GameManagement, player.Name.." not HeroChosen" )
					end
				else
					DebugXL:logV(LogArea.GameManagement, player.Name.." health 0" )
				end
			else
				DebugXL:logV(LogArea.GameManagement, player.Name.." no humanoid" )
			end
		else
			DebugXL:logV(LogArea.GameManagement, player.Name.." character missing" )
		end
		-- maybe you're dead or maybe you're a fresh hero about to be reassembled
		if DungeonPlayer:Get( player ):isRespawning() then
			allHeroesDeadB = false
		end
	end
	local TPKresult = not staticAllHeroesDeadB and allHeroesDeadB  -- only checking the change from someone alive to someone dead now
	staticAllHeroesDeadB = allHeroesDeadB
	return TPKresult
end



function KickoffChooseHero( player )
	PlayerServer.setClassChoice( player, "NullClass" )
	PlayerServer.publishLevel( player, 1, 1 )
	DungeonPlayer:Get( player ):kickoffChooseHero()
end	


local function ChangeHeroToMonster( player )
	local myDungeonPlayerT = DungeonPlayer:Get( player )	
	myDungeonPlayerT:markHeroDead()
	local localTick = time()
	-- if the rest of the characters die while we're lying in pieces
	while GameManagement:LevelReady() and time() < localTick + 5 do
		wait()
	end
	CharacterI:ChangeTeam( player, game.Teams.Monsters )							
	player.BuildPoints.Value = Places.getCurrentPlace().startingBuildPoints
end


local function ChangeMonsterToHero( designatedMonsterPlayer, loadCharacterB )
--	DebugXL:Assert( Inventory:GetCount( designatedMonsterPlayer, "Tutorial" ) >= 3 )
	DebugXL:logD(LogArea.GameManagement, "Changing "..designatedMonsterPlayer.Name.." to hero" )
	MarkPlayersCharacterForDestruction( designatedMonsterPlayer )	
	CharacterI:ChangeTeam( designatedMonsterPlayer, game.Teams.Heroes )  -- this will automatically launch Choose dialog on client
	
	DebugXL:logD(LogArea.GameManagement,"ChooseHeroRE:FireClient:ChooseHero:"..designatedMonsterPlayer.Name)
	spawn( function()
		while not DungeonPlayer:Get( designatedMonsterPlayer ).chooseHeroREAckedB do wait(0.1) end
		DebugXL:logD(LogArea.GameManagement,"ChooseHeroRE:FireClient:ChooseHero:"..designatedMonsterPlayer.Name.." fired")
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
		KickoffChooseHero( designatedMonsterPlayer ) 
		-- wait for them to setup gear
		-- while designatedMonsterPlayer.HeroRespawnCountdown.Value > 0 do
		-- 	wait(0.25)
		-- 	designatedMonsterPlayer.HeroRespawnCountdown.Value = math.max( designatedMonsterPlayer.HeroRespawnCountdown.Value - 0.25, 0 ) 		
		-- end
		-- if loadCharacterB then
		-- 	if workspace.GameManagement.GameState.Value == "LevelPlaying" then-- GameManagement:LevelReady() then
		-- 		GameManagement:MarkPlayersCharacterForRespawn( designatedMonsterPlayer )
		-- 	end
		-- end
	end )
end



-- for debug purposes:
local crashPlayer


-- what happens if there's a TPK while player is choosing their hero, you ask?
-- answer: there can't be.
	
-- we watch and handle the character in a loop rather than let events trigger changes
-- so things don't overlap
local function MonitorPlayer( player )
	local myDungeonPlayerT = DungeonPlayer:Get( player )
	myDungeonPlayerT.playerMonitoredB = true
	local monitorCyclesN = 0
	while not myDungeonPlayerT.playerRemovingB do
		local status, err = DisableablePcall( function()
			DebugXL:logD( LogArea.GameManagement,  player.Name.." monitoring lifetime" )
			myDungeonPlayerT:markDead()
			--while not GameManagement:LevelReady() do wait() end
			-- if time to be a hero
			DebugXL:logV(LogArea.GameManagement, player.Name.." waiting for respawn order" )
			GameServer.waitForRespawnRequest(player, myDungeonPlayerT)
			myDungeonPlayerT:markRespawnStart()
			local levelSessionN = levelSessionCounterN  -- for testing purposes
			DebugXL:logD( LogArea.GameManagement, player.Name.." beginning respawn" )
			if not GameManagement:LevelReady() then
				DebugXL:Error( "Level not ready when "..player.Name.." triggered respawn" )
			end
			while not GameManagement:LevelReady() do wait() end
			DebugXL:logV( LogArea.GameManagement, player.Name.." can respawn because level is ready" )
			local spawnPart = myDungeonPlayerT.respawnPart
			--myDungeonPlayerT.respawnPart = nil
			
			-- megabosses override. well, this got ugly, mostly a dupe of below
			local monsterSpawns = FurnishServer:GetMonsterSpawners()
			DebugXL:logV(LogArea.GameManagement, "Untrimmed monster spawn list for"..player.Name )
			--DebugXL:Dump( monsterSpawns )

			if player.Team == game.Teams.Monsters then
				if PlayerServer.getTeamStyleChoice(player)==TeamStyleChoice.DungeonLord or
					( Inventory:PlayerInTutorial( player ) and Inventory:GetCount( player, "TimeInvested" )<=450 ) then -- once they've been playing for 10 minutes just give up on trying to tutorialize them
					DebugXL:logV(LogArea.GameManagement, "No megaboss check")
					-- megaboss don't override
				else
					-- only be a megaboss when game goes so eager beavers don't snatch it away
					if workspace.GameManagement.PreparationCountdown.Value <= 0 then
						DebugXL:logV(LogArea.GameManagement, "Megaboss check")
						for i, spawner in pairs( monsterSpawns ) do
							if spawner.OneUse.Value then
								DebugXL:logV(LogArea.GameManagement, "Found a boss spawn for "..player.Name ) 
								if spawner.LastPlayer.Value == nil then
									DebugXL:logV(LogArea.GameManagement, "Unoccupied" )
									if CharacterClasses.monsterStats[ spawner.CharacterClass.Value ].tagsT.Superboss then
										DebugXL:logV(LogArea.GameManagement, "Megaboss" )
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
			end


			if not spawnPart then 
				spawnPart = GameServer.chooseSpawn(player, monsterSpawns)
			end
			DebugXL:logV(LogArea.GameManagement, player.Name.." has spawnPart" )
			
			if levelSessionCounterN ~= levelSessionN then
				local diagS = "Session changed in the middle of "..player.Name.."'s spawn. levelSessionCounterN: "..
					levelSessionCounterN.." levelSessionN: "..levelSessionN.." monitorCyclesN: "..monitorCyclesN.." gameStateDesc: "..workspace.GameManagement.GameState.Value
				DebugXL:Error( diagS )
			end
			DebugXL:logD( LogArea.GameManagement, player.Name.." calling LoadCharacterWait" )
			
			PlayerXL:LoadCharacterWait( PlayerServer.getPlayerTracker(),
				player, 
				nil, 
				spawnPart, 
				levelSessionN,   -- for debugging
				function() return levelSessionCounterN end )  -- for debugging
			-- possible respawn failed here
			if player.Character then
				myDungeonPlayerT:markRespawnFinish()
				DebugXL:logD( LogArea.GameManagement, player.Name.." spawned character" )

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
							if player.Team == game.Teams.Heroes then
								DebugXL:logD(LogArea.GameManagement,player.Name.." death detected")
								Inventory:AdjustCount( player, "HeroDeaths", 1 )
								local localTick = time()
--								GameAnalyticsServer.ServerEvent( { ["category"] = "progression", ["event_id"] = "Fail:SubdwellerColony:"..tostring(workspace.GameManagement.DungeonFloor.Value) }, player )
								Heroes:Died( player )  
								-- if the rest of the characters die while we're lying in pieces
								while GameManagement:LevelReady() and time() < localTick + heroDeathSavoringSecondsK do
									wait()
								end
								playerCharacter.Parent = nil
								-- now we stay the same team; when we day or respawn we get to re-choose
								DebugXL:logD(LogArea.GameManagement,player.Name.." death grace period over. Choosing hero.")
								workspace.Signals.ChooseHeroRE:FireClient( player, "ChooseHero" )
								-- putting you in limbo now otherwise it will trigger error in end-of-level watcher
								myDungeonPlayerT:markDead()

								KickoffChooseHero( player )

								--ChangeHeroToMonster( player )
							else
								local localTick = time()
								Monsters:Died( playerCharacter )  
								-- if the rest of the characters die while we're lying in pieces
								while GameManagement:LevelReady() and time() < localTick + 2 do
									wait()
								end
								-- character might be gone by now
								playerCharacter.Parent = nil
								-- we don't want to do this if it was a tpk, but tpk cleanup should change it back
								if GameManagement:LevelReady() then
									GameManagement:MarkPlayersCharacterForRespawn( player )
								end
							end
							DebugXL:logD( LogArea.GameManagement, player.Name.." lifetime ended in death" ) 
							break
						end
						if myDungeonPlayerT:needsDestruction() then
							player.Character:Destroy()
							DebugXL:logD( LogArea.GameManagement, player.Name.." lifetime aborted: needs destruction" ) 
							break				
						end
						if  myDungeonPlayerT:needsRespawn() then
							player.Character:Destroy()
							DebugXL:logD( LogArea.GameManagement, player.Name.." lifetime aborted: needs respawn") 
							break
						end
						-- not promotion requested
						-- not dead
						-- not end-of-level 
						wait()
					else
						DebugXL:logD( LogArea.GameManagement, player.Name.." character nil, recycling monitor.")
						break
					end
				end
			else
				DebugXL:logD( LogArea.GameManagement, player.Name.." spawn failed, recycling monitor." )
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
				-- we probably need to respawn
				GameManagement:MarkPlayersCharacterForRespawn( player )
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
			if DungeonPlayer:Get( player ):exists() then   -- going to count respawning as not there yet
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
		if DungeonPlayer:Get( player ):exists() then
			DebugXL:logD( LogArea.GameManagement, player.Name.." still exists" )
			pcsExist = true
			break
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
--			DebugXL:logV(LogArea.GameManagement,"Waiting for "..player.Name.." appearance to load")
--			player.CharacterAppearanceLoaded:Wait()
--		end
--	end
	while not player.Character do wait() end	
	InstanceXL:CreateSingleton( "BoolValue", { Name = "HideCharacter", Value = true, Parent = player.Character } )
	Costumes:SaveCostumeWait( player )
	DebugXL:logW(LogArea.GameManagement, player.Name.." original costume saved")
end

	
local function PlayerAdded( player )
	local startTime = time()	
	local starsN = Inventory:GetCount( player, "Stars" )
	PlayerUtility.publishClientValues( player, 
		100,
		0,
		RankForStars:GetRankForStars( starsN ), 
		DeveloperProducts:UserOwnsGamePassWait( player, DeveloperProducts.vipPassId ))

	-- ignored as of 12/3
	-- InstanceXL:CreateSingleton( "BoolValue", { 
	-- 	Value = true,-- #game.Players:GetPlayers() == 1,  	-- very first player can use hero express for their farming pleasure 
	-- 	Name = "HeroExpressReady", 
	-- 	Parent = player } )
	-- InstanceXL:CreateSingleton( "NumberValue", { Name = "HeroInviteCountdown", Value = 0, Parent = player } )

	-- they logged out already?  awww
	if not player.Parent then return end

	-- hack: we need to spawn your avatar once right away to initialize the UI
	DebugXL:logV(LogArea.GameManagement, "Begin initial LoadCharacter for "..player.Name )	
	local status, err = pcall( function()
		DebugXL:logD(LogArea.Characters, "Loading character model for "..player.Name)
		player:LoadCharacter()  -- this seems to still be throwing an error even though we check on the previous line. thanks Roblox
		DebugXL:logD(LogArea.Characters, "Character model load returned for "..player.Name)
	end )	
	if not status then
		if not player.Parent then 
			DebugXL:logW(LogArea.GameManagement, player.Name.." left game before LoadCharacter finished" )
		else
			DebugXL:Error( player.Name.." problem loading character: "..err )
		end
		return
	end
	DebugXL:logV(LogArea.GameManagement, "Initial LoadCharacter for "..player.Name.." finished" )	
	AnalyticsXL:ReportHistogram( player, "Duration: Initial Player Load", time() - startTime, 1, "second", player.Name, true)

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
		DebugXL:logV(LogArea.GameManagement, "Character added: "..character.Name )
		SetupPCWait( character, player )
	end)
		
	pcall( function()
		player.Team = game.Teams.Monsters
	end )

	spawn( function() MonitorPlayer( player ) end )
	
	DungeonPlayer:Get( player ).addingCompleteB = true
	DebugXL:logD(LogArea.GameManagement, player.Name.." adding complete" )
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
DebugXL:logI(LogArea.GameManagement, "GameManagementModule: PlayerAdded connected")

-- game loop



-- Lounge mode means there are monsters doing tutorials or hanging out and nobody is eligible to be a hero yet
-- as soon there's 2 players and one of them has finished tutorial we can go
local function LoungeModeOver()
	DebugXL:logW(LogArea.GameManagement, "LoungeModeOver still being executed" )
	if #game.Teams.Heroes:GetPlayers()==0 then
		if #game.Players:GetPlayers()>=2 then
			for _, player in pairs( game.Teams.Monsters:GetPlayers() ) do
				local class = PlayerServer.getCharacterClass( player )
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
			if not DungeonPlayer:Get( player ):needsDestruction() and not DungeonPlayer:Get( player ):inLimbo() then
				MarkPlayersCharacterForDestruction( player )
			end
		end
		wait() 
		if time() - startTime > 15 then
			-- emergency abort
			-- what's going on
			local doubleCheck = false
			for _, player in pairs( game.Players:GetPlayers() ) do
				if DungeonPlayer:Get( player ):exists() then
					local character = player.Character
					local characterParent = character and character.Parent or nil
					DebugXL:Error( "RemoveCharactersWait() timed out:".. player.Name.." still exists: character ".. tostring( character ) .."; character parent ".. tostring( characterParent ) )
					doubleCheck = true
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
		if player.Team == game.Teams.Monsters then -- heroes now get to choose when to spawn, they can spend as much time in the menu as they like
			GameManagement:MarkPlayersCharacterForRespawn( player, DungeonPlayer:Get( player ).respawnPart )
		end
	end
--	while PlayerCharactersMissing() do wait() end
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
		
		DebugXL:logI( LogArea.GameManagement, player.Name.." reached exit as Hero" )
		Inventory:AdjustCount( player, "NewLevels", 1 )		
		workspace.Standard.MessageGuiXL.MessageRE:FireAllClients( "NextFloor", { player.Name }, false )
		
		reachedExitB = true
		return true
	end
	return false
end


function GameManagement:DoBeatSuperbossStuff()
	DebugXL:logI(LogArea.GameManagement,"BeatSuperboss()")

	firstLevelB = true

	for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
		HeroServer.awardExperienceWait( player, HeroServer.getDifficultyLevel() * 100, "Progress", "Superboss" )
		Heroes:SaveHeroesWait( player )
	end
	
end



local function LoadLevelWait()
	MobServer.clearMobs()
	Dungeon:BuildWait( function( player ) 
		return GameManagement:ReachedExit( player ) 
	end )
	local numHeroes = #game.Teams.Heroes:GetPlayers()
	Furnisher.furnishWithRandomSpawns(numHeroes)
	FurnishServer:FurnishWithRandomChests()
	levelSessionCounterN = levelSessionCounterN + 1
	levelReadyB = true
end



local function PlayLevelWait()
	staticAllHeroesDeadB = true
	reachedExitB = false
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
	-- add more spawns if necessary
	Furnisher.furnishWithRandomSpawns(numHeroes)

	local dungeonDepth = DungeonDeck.getCurrentDepth()
	DestructibleServer.calibrateAllDestructiblesHealth( averageHeroLocalLevel, numHeroes, dungeonDepth )
	
	DebugXL:logW(LogArea.GameManagement, "All characters loaded. Playing." )
	local levelResult
	-- wait for level to be complete either through TPK 
	-- (includes all heroes leaving before monster promoted)
	-- or heroes getting to next level 
	MonsterServer.resetLevelBalancer()
	lastMonsterLevels = {}
	while wait() do 
		workspace.GameManagement.LevelTimeElapsed.Value = time() - GameManagement.levelStartTime	
		MobServer.spawnersUpdate(time())
		MonsterServer.awardTeamXPForTimeElapsed()

		if timeToThrowARodB then
			--DebugXL:Error( "This won't shut down server will it?" )
			local emptyTable = {}
			emptyTable[ nil ] = 'die'
		end
		if TPK() then
			DebugXL:logI(LogArea.GameManagement,"TPK detected")
			levelResult = LevelResultEnum.TPK
			-- give it some time. the player monitor and this should complete at roughly the same time
			-- and if I've coded it right then it won't matter which is done first
			wait(heroDeathSavoringSecondsK) 
			DebugXL:logI(LogArea.GameManagement,"TPK grace period over")
			break
		-- probably didn't need to duplicate state here with bools *and* a state variable
		elseif reachedExitB then		
			local newDungeonDepth = DungeonDeck:goToNextFloor()
			DebugXL:logV(LogArea.GameManagement, "Awarding next level awards" )
			for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
--				GameAnalyticsServer.ServerEvent( { ["category"] = "progression", ["event_id"] = "Complete:SubdwellerColony:"..tostring(workspace.GameManagement.DungeonFloor.Value) }, player )
				Heroes:NewDungeonLevel( player, newDungeonDepth )
				HeroServer.awardExperienceWait( player, HeroServer.getDifficultyLevel() * 100, "Progress", "Floor" )				
				Inventory:AdjustCount( player, "Stars", 10, "Progress", "Floor" )
				Inventory:EarnRubies( player, 10, "Progress", "Floor" )
				Heroes:SaveHeroesWait( player )
			end
			for _, player in pairs( game.Teams.Monsters:GetPlayers() ) do
				Monsters:AdjustBuildPoints( player, 50 )
			end
				
			levelResult = LevelResultEnum.ExitReached
			break
		elseif not FloorData.CurrentFloor().exitStaircaseB then
			if not MonsterServer.isThereLivingSuperboss() then
				DebugXL:logW(LogArea.GameManagement, "Setting BeatSuperboss state" )
				levelResult = LevelResultEnum.BeatSuperboss
				GameManagement:DoBeatSuperbossStuff()
				break
			end
		end
	end
	
	levelReadyB = false
	for _, playerData in pairs( dungeonPlayersT ) do
		playerData.signalledReadyB = false
	end
	
	RemoveCharactersWait()
	HeroServer.resetCurrentLevelCap()
	DebugXL:logD(LogArea.GameManagement, "Level finished and swept" )
	return levelResult
end


local function SpawnMonsters()
	DebugXL:Assert( GameManagement:LevelReady() )
	DebugXL:logV(LogArea.GameManagement, 'GameManagementModule SpawnMonsters()')
	for _, player in pairs( game.Teams.Monsters:GetPlayers() ) do
		GameManagement:MarkPlayersCharacterForRespawn( player )
	end	
end

--[[
local function InviteMonstersToBeHeroesWhileNecessaryWait()
	while #game.Teams.Heroes:GetPlayers() < GameServer.numHeroesNeeded() and workspace.GameManagement.PreparationCountdown.Value > 0 do
		ChangeMonstersToHeroIfNecessaryWait()
		wait(0.1)		
	end
end
]]



local protectionDisabled = false
function DisableablePcall( func )
	if protectionDisabled then
		func()
		return true, ""
	else
		return pcall( func )
	end
end

--[[
function GameManagement:MonitorPlayerbase()
	while true do
		ChangeMonstersToHeroIfNecessaryWait()
		wait(0.1)
	end
end
--]]


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
			
-- let the client handle this
--			GameServer.letHeroesPrepare()

			LoadLevelWait()  -- so monsters can start building while waiting
			ChangeGameState( "MonstersToHeroes" )

			roundCounterN = roundCounterN + 1			
				
			--[[
			if workspace.GameManagement.DungeonDepth.Value <= 1 then  -- after a TPK, don't give players choice about becoming heroes
				ChangeMonstersToHeroIfNecessary( false )
			end--]]
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
--				ChangeMonstersToHeroIfNecessary( false )    -- this one doesn't give them a choice
			end

			ChangeGameState( "HeroesChooseCharactersWait" )

			GameServer.askPlayersToRate()

			GameServer.preparationPhaseWait(preparationDuration)

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
	-- always have at least a 15 second spawn delay
	-- if workspace.GameManagement.PreparationCountdown.Value == 0 then
	-- 	player.HeroRespawnCountdown.Value = 45
	-- else	
	-- 	player.HeroRespawnCountdown.Value = 0
	-- end
	ChangeMonsterToHero( player, true ) 				
end

--[[
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
--]]

-- this may seem odd but I'm going to try letting it leak and see what happens
-- at some point the size of the dungeonPlayers dictionary might become unwieldy but it's probably a log search and not too bad?
-- I doubt it will leak faster than the known Roblox sound memory leaks

---- garbage collection
--spawn( function()
--	while wait(0.1) do
--		for player, _ in pairs( dungeonPlayersT ) do
--			if not player.Parent and not DungeonPlayer:Get( player ).playerMonitoredB then
--				DebugXL:logV(LogArea.GameManagement, "Collection dungeonPlayersT[] garbage for "..player.Name )
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
		DebugXL:logW(LogArea.GameManagement, "Crashing "..player.Name )
		crashPlayer = player
	end
end


function MainRemote.SignalReady( player )
	local myDungeonPlayerT = dungeonPlayersT[ player ]
	myDungeonPlayerT.signalledReadyB= true
	if player.Team==game.Teams.Heroes then 
		if PlayerServer.getCharacterClass( player )~="NullClass" then		
			GameManagement:MarkPlayersCharacterForRespawn( player )
		end
	end
	
--	player.HeroRespawnCountdown.Value = 0	
end


function MainRemote.TestCoreLoopError( player )
	if CheatUtilityXL:PlayerWhitelisted( player ) then
		timeToThrowARodB = true
	end
end


-- function MainRemote.AcceptHeroInvite( player )
-- 	if currentPlayerInvitedToHero == player then
-- 		GameManagement:BecomeHero( player )
-- 		--player.HeroInviteCountdown.Value = 0	
-- 	end	
-- end


function MainRemote.DenyHeroInvite( player )
	GameManagement:DenyHeroInvite( player )
end

function MainRemote.ForceHero( player )
    DebugXL:logD(LogArea.GameManagement,"ForceHeroServer")
	if Places.getCurrentPlace() == Places.places.Underhaven then
		ChangeMonsterToHero( player, true )
	end
end

function MainRemote.HeroChoice( player )
	PlayerServer.setTeamStyleChoice( player, TeamStyleChoice.Hero )
	if player.Team ~= game.Teams.Heroes then
		GameManagement:BecomeHero( player )
	end
end

function MainRemote.MonsterChoice( player )
	PlayerServer.setTeamStyleChoice( player, TeamStyleChoice.Monster )
	if player.Team ~= game.Teams.Monsters then	
		ChangeHeroToMonster( player )
	end
	if PlayerServer.getCharacterClass( player )=='DungeonLord' then
		GameManagement:MarkPlayersCharacterForRespawn( player )
	end
end

function MainRemote.DungeonLordChoice( player )
	PlayerServer.setTeamStyleChoice( player, TeamStyleChoice.DungeonLord )
	if player.Team ~= game.Teams.Monsters then
		ChangeHeroToMonster( player )
	end
	if PlayerServer.getCharacterClass( player )~='DungeonLord' then
		GameManagement:MarkPlayersCharacterForRespawn( player )
	end
end

function MainRemote.DungeonVote( player, dungeon )
	dungeonVotes[ player ] = dungeon
end

workspace.Signals.MainRE.OnServerEvent:Connect( function( player, funcName, ... )
	MainRemote[ funcName ]( player, ... )
end)



return GameManagement
