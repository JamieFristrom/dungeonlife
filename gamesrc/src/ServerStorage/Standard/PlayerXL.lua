
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local MathXL           = require( game.ReplicatedStorage.Standard.MathXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL )
local CharacterPhysics = require( game.ReplicatedStorage.Standard.CharacterPhysics )
DebugXL:logD( LogArea.Requires, 'PlayerXL: ReplicatedStorage require succesful' )
local CharacterI       = require( game.ServerStorage.CharacterI )
DebugXL:logD( LogArea.Requires, 'PlayerXL: CharacterI require succesful' )
local AnalyticsXL      = require( game.ServerStorage.Standard.AnalyticsXL )
DebugXL:logD( LogArea.Requires, 'PlayerXL: AnalyticxXL require succesful' )
local GameAnalyticsServer = require( game.ServerStorage.Standard.GameAnalyticsServer )
DebugXL:logD( LogArea.Requires, 'PlayerXL: GameAnalyticsServer require succesful' )
local Costumes         = require( game.ServerStorage.Standard.CostumesServer )
DebugXL:logD( LogArea.Requires, 'PlayerXL: Costumes require succesful' )
local Inventory        = require( game.ServerStorage.Standard.InventoryModule )
DebugXL:logD( LogArea.Requires, 'PlayerXL: ReplicatedStorage require succesful' )

local CharacterClasses = require( game.ReplicatedStorage.TS.CharacterClasses ).CharacterClasses
DebugXL:logD( LogArea.Requires, 'PlayerXL: ReplicatedStorage.TS require succesful' )

local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer
DebugXL:logD( LogArea.Requires, 'PlayerXL: ServerStorage.TS require succesful' )

local PlayerXL = {}

local antiteleportCheckPeriodN = 0.25

local PlayerT = {}

function PlayerT.new()
	local playerT = {
		appearanceLoadedB = false
	}
	return playerT
end

local playerTs = {}

-- roblox's hasappearanceloaded seems to return true even after you reset a character and it is reinserting assets,
-- and HasAppearanceLoaded can be accidentally skipped if we're not On It, so I've created this alternate method for 
-- telling if we're done loading
function PlayerXL:HasAppearanceLoaded( player )
	return player.UserId < 0 or ( playerTs[ player ] and playerTs[ player ].appearanceLoadedB )
end

-- doesn't include pants/shirts
-- now that we have our own custom LoadCharacter this only works with the very first load, but that's currently all we use it for

function PlayerXL:AppearanceLoadedWait( player )
	local startTick = tick()
	while not PlayerXL:HasAppearanceLoaded( player ) do
		if tick() - startTick > 10 then return end            -- we'll save a weird costume for the werewolf, worst case scenario
		wait() 
	end
--	AnalyticsXL:ReportHistogram( player, "Duration: AppearanceLoadedWait", tick() - startTick, 1, "second", player.Name, true)
end

-- from the not terribly useful article http://wiki.roblox.com/index.php?title=Stopping_speed_hackers
-- keeping errors doubly wrapped for local testing purposes
local function Punish( player )
	AnalyticsXL:ReportEvent( player, "Speeding violation", player.UserId, player.Name, 1, false )
--	spawn( function() DebugXL:Error( player.UserId.." speeding violation") end )--Print in Server Console and send to Google Analytics
	if playerTs[ player ] then  -- bypassing in test. wishlist: don't bypass
		if playerTs[ player ].violations then
			table.insert( playerTs[ player ].violations, tick() )
			if #playerTs[ player ].violations > 10 then
	--			-- Should never fail, as we don't check RobloxLocked players
	--			-- Even if it fails, punish() is called in a pcall() so it's safe anyway
	--			player:Kick()
				spawn( function() DebugXL:Error( player.UserId.." possibly speed/tp hacking") end ) --Print in Server Console and send to Google Analytics
			end
		else
			playerTs[ player ].violations = { tick() }
		end 
	end
end

-- exporting for test
function PlayerXL:CharacterAdded(debugContext, player)
	debugContext:Assert( self==PlayerXL )
	debugContext:Assert( player:IsA("Player") )
	
	player.CharacterAppearanceLoaded:Connect( function()
		if player.Parent then    -- this sometimes fails. Because I player left as his character was loading in?
			playerTs[ player ].appearanceLoadedB = true         
		end
	end)

	local character = player.Character
	DebugXL:Assert( character )
	if character then
		-- antiteleport needs to be created for every costume change
		spawn( function()  		
			local primaryPart = character:WaitForChild("Head",0.25)
			if not primaryPart then
				debugContext:Error( "Where's My Head Baby? asks "..player.UserId )
				local humanoid = character:FindFirstChild("Humanoid") 
				if humanoid then
					humanoid.Health = 0
				end
				return
			end
			local location = primaryPart.Position
			while wait( antiteleportCheckPeriodN ) do
				local h = character:FindFirstChild( 'Humanoid' )
				if not character.Parent or not h or not (h.Health > 0) or not primaryPart.Parent then
					break
				end
				local newLoc = primaryPart.Position

				--local dis = math.sqrt((i.X - l.X)^2 + (i.Y - l.Y)^2 + (i.Z - l.Z)^2)
				
				-- keeping in two dimensions so falling won't violate
				local dis = math.sqrt((newLoc.X - location.X)^2 + (newLoc.Z - location.Z)^2)
				
				-- we might not have a pc sheet right now, it might be before we've spawned or during intermission
				local characterSpeed = 12
				local characterRecord = PlayerServer.getCharacterRecordFromPlayer( player )
				if characterRecord then
					characterSpeed = CharacterPhysics:CalculateWalkSpeed( character, CharacterI:GetPCDataWait( player ) )
				end
				local antiteleportSpeed = characterSpeed * antiteleportCheckPeriodN * 3.5 -- arbitrary fudge factor; 2.75 still getting complaints
				debugContext:Assert( antiteleportSpeed >= 0 )  -- if some day we have spells that change walk speed then we'll get false positives

				if dis > antiteleportSpeed  then
					Punish( player )   -- punishing here because they can still get treasure with the teleportation hack
					character:SetPrimaryPartCFrame( CFrame.new( location ) )
					character.PrimaryPart.Velocity = Vector3.new(0,0,0)
					newLoc = location
				end
				location = newLoc
			end
		end )		
	end
end

function PlayerAdded( player )
	while game.Workspace.GameManagement.TestsFinished.Value == false do
		wait(0.1)
	end

	playerTs[ player ] = PlayerT.new()
	
	-- now that we have our own custom LoadCharacter this only works with the very first load, but that's currently all we use it for
	player.CharacterAdded:Connect( function() 
		PlayerXL:CharacterAdded( DebugXL, player ) 
	end )
		
	player.CharacterRemoving:Connect( function()
		-- player gets removed before character
		if playerTs[ player ] then
			playerTs[ player ].appearanceLoadedB = false
		end
	end)

	local penultimateTeamChangeTime
	local ultimateTeamChangeTime
	
	player.Changed:Connect( function( property )
		DebugXL:logI( LogArea.Players, player.Name.." player changed property "..property )
		if property == "Team" then
			if ultimateTeamChangeTime then  -- ignore first team change
				GameAnalyticsServer.RecordDesignEvent( player, "TeamChange:"..player.Team.Name, time() - ultimateTeamChangeTime, 30, "secs" )
				if penultimateTeamChangeTime and player.Team == game.Teams.Monsters then
					GameAnalyticsServer.RecordDesignEvent( player, "MonsterHeroSession", time() - penultimateTeamChangeTime, 30, "secs" )
				end
			end
			penultimateTeamChangeTime = ultimateTeamChangeTime
			ultimateTeamChangeTime = time()
		end
	end )

end


for _, player in pairs( game.Players:GetPlayers() ) do
	spawn( function() PlayerAdded( player ) end )
end

game.Players.PlayerAdded:Connect( PlayerAdded )

-- garbage collection
spawn( function()
	while wait(0.5) do
		for player, _ in pairs( playerTs ) do
			if not player.Parent then
				playerTs[ player ] = nil
			end
		end
	end
end)

-- custom spawn system

-- wishlist:
--   support teams
--   avoid stacking players
--   avoid obstructions without teleporting player to a different floor

local loadingCharacterBT = {}
local loadingCharacterCallstackT = {}


--[[

The flow for loading a charater is different from typical Roblox - we don't rely on their character added events
Instead, the flow looks like this:

	MonitorPlayer (from GameManagementModule)
		PlayerXL:LoadCharacterWait  -- your character model is created the first time here
			PlayerServer.callCharacterAdded 
				-- calls all the listeners on independent threads, which includes the very important:
				SetupCharacterWait (from GameManagementModule)
					HeroAdded   
						ApplyEntireCostumeWait -- likely resets your character model to put armor on you 
					or 
					MonsterAddedWait  -- if you're a werewolf probably resets your character model
					
--]]

function PlayerXL:LoadCharacterWait( playerTracker, player, optionalSpawnCF, optionalSpawnPart, levelSessionN, levelSessionFunc )
	DebugXL:logD( LogArea.Characters, "LoadCharacterWait "..player.Name )
	DebugXL:Assert( not ( optionalSpawnCF and optionalSpawnPart ) ) -- pass in a CF or a part (or neither), not both
	if loadingCharacterBT[ player ] then
		DebugXL:Error( "LoadCharacterWait called for "..player.Name.." when load is already in progress. Traceback: "..loadingCharacterCallstackT[ player ])
	end
	loadingCharacterBT[ player ] = true
	loadingCharacterCallstackT[ player ] = debug.traceback()
	
	local characterClassS = playerTracker:getClassChoiceWait( player )

	local chosenSpawn = nil
	if optionalSpawnPart then
		if optionalSpawnPart:IsDescendantOf( workspace ) then
			chosenSpawn = optionalSpawnPart
		end
	end

	-- bail if player left before here 
	if not player.Parent then 
		warn( "LoadCharacterWait exiting early becuase player allegedly left")
		return 
	end
	
	local spawnCF
	if optionalSpawnCF then
		spawnCF = optionalSpawnCF
	else
		if not chosenSpawn then
			local spawnPoints = game.CollectionService:GetTagged("CustomSpawn")
			local validSpawnPoints = TableXL:FindAllInAWhere( spawnPoints, function( spawnPoint ) 
				if not spawnPoint:FindFirstChild("LastPlayer") then
					DebugXL:Error( "Can't find LastPlayer for "..spawnPoint:GetFullName() )
				end
				return spawnPoint.Enabled.Value 
					and spawnPoint.Team.Value==player.Team 
					and ( spawnPoint.OneUse.Value == false or spawnPoint.LastPlayer.Value == nil ) 
					and spawnPoint:IsDescendantOf( workspace )
			end )
			if #validSpawnPoints <= 0 then
				DebugXL:logI( LogArea.Players, "Couldn't find unused spawn for "..player.Name )
				-- must be a monster/DL after all the spawn points have been cleared; spawn wherever you can, probably the hero point
				validSpawnPoints = spawnPoints
			end
			if characterClassS ~= "DungeonLord" then  -- dungeonlords spawn anywhere
				validSpawnPoints = TableXL:FindAllInAWhere( validSpawnPoints, function( element ) 
					return not element:FindFirstChild("CharacterClass") or element.CharacterClass.Value == characterClassS 
				end )
				if #validSpawnPoints <= 0 then
					DebugXL:logI( LogArea.GameManagement, "Couldn't find matching spawn" )
					-- it's possible that the level can reload while you're loading your character, in which case we find any emergency spawn point
					validSpawnPoints = TableXL:FindAllInAWhere( spawnPoints, function( element ) return element.Enabled.Value end )
				end
			end
			--
		
			local chosenSpawnN = MathXL:RandomInteger( 1, #validSpawnPoints )
			chosenSpawn  = validSpawnPoints[ chosenSpawnN ]
		end
		
		-- not sure why it could be missing but sometimes it can; maybe level resetting as someone is spawning?
		if chosenSpawn:FindFirstChild("SpawnSound") then
			chosenSpawn.SpawnSound:Play()
		end
		
		-- if this fires it is because the dungeon got rebuilt from under you
		-- why didn't the dungeon wait until you were respawned and re-destroyed before rebuilding?
		if levelSessionN ~= levelSessionFunc() then
			local diagS = "Session changed in the middle of "..player.Name.."'s spawn. levelSessionN: "..
				levelSessionN.." levelSessionFunc: "..levelSessionFunc().." team "..tostring( player.Team ).." characterClassS: "..characterClassS 
			DebugXL:Error( diagS )
		end

		-- this can happen when a monster becomes a hero when another character is trying to spawn
		-- it's harmless; the chosenSpawn still exists and its position can be accessed, you'll just spawn where it was
		-- if not chosenSpawn.Parent then
		-- 	DebugXL:Error( chosenSpawn.Name.." no longer in workspace. "..(levelSessionN == levelSessionFunc() and "but session didn't change" or "and sesssion changed" ) ) 
		-- end		

--		--DebugXL:logD( LogArea.Requires, "Player "..player.Name.." cframe will be set to spawn point "..chosenSpawn.Name )
		
		-- doesn't support rotated spawns yet
		local minX = chosenSpawn.Position.X - chosenSpawn.Size.X / 2
		local maxX = chosenSpawn.Position.X + chosenSpawn.Size.X / 2
		local minZ = chosenSpawn.Position.Z - chosenSpawn.Size.Z / 2
		local maxZ = chosenSpawn.Position.Z + chosenSpawn.Size.Z / 2
		local myX = MathXL:RandomNumber( minX, maxX )
		local myZ = MathXL:RandomNumber( minZ, maxZ )
		local myY = chosenSpawn.Position.Y + 6  -- hoping this is fine now that I've got the hipheight hack
		spawnCF = CFrame.new( myX, myY, myZ )
	end

	--DebugXL:logD( LogArea.Requires, "About to LoadCharacter "..player.Name ) 	
	local srcCharacter
	local noAttachSet = Costumes.allAttachmentsSet
	if player.Team == game.Teams.Monsters then
		local monsterPrototype = CharacterClasses.monsterStats[ characterClassS ].prototypeObj
		if monsterPrototype then
			srcCharacter = game.ServerStorage.Monsters:FindFirstChild(monsterPrototype)			
		end
		local inventory = Inventory:GetWait( player )
		if inventory then
			if not inventory.settingsT.monstersT[ characterClassS ].hideAccessoriesB then
				noAttachSet = {}
			end
		end
	end
	Costumes:LoadCharacter( player, { srcCharacter }, noAttachSet, true, nil, spawnCF )  -- when player.Character gets set, built-in Roblox CharacterAdded gets triggered
	-- 	end
	-- end
	-- if not srcCharacter then
	-- 	Costumes:LoadCharacter( player, {}, )
	-- 	player:LoadCharacter()  -- this is where built-in CharacterAdded gets triggered
	-- 	player.Character:SetPrimaryPartCFrame( spawnCF )	
	-- end
	DebugXL:Assert( player.Character )	

	--DebugXL:logD( LogArea.Requires, "Character loaded "..player.Name ) 	

	if characterClassS ~= "DungeonLord" then  	-- don't let dungeonlord use up thingy
		DebugXL:Assert( chosenSpawn )
		if chosenSpawn then
			local chosenSpawnLastCharacterValue = chosenSpawn:FindFirstChild("LastPlayer")
			if chosenSpawnLastCharacterValue then
	--			--DebugXL:logD( LogArea.Requires, "Marking spawn "..chosenSpawn:GetFullName().." used by "..player.Name )
				chosenSpawnLastCharacterValue.Value = player
			end
		end
	end
			
	--wait()

	playerTracker:callCharacterAdded( player, player.Character )

	loadingCharacterBT[ player ] = nil  -- less leaky than false	

	DebugXL:logD( LogArea.Characters, "LoadCharacterWait finished "..player.Name ) 	
			
	return player.Character
end




function FindPlayer(input)
	for i,v in pairs(game.Players:GetChildren()) do
		if v.Name:sub(0,input:len()):lower() == input:lower() then
			return v
		end
	end
	return nil
end


return PlayerXL
