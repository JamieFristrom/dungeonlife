
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())


--[[
	
	Heroes
	
	Functions to handle the PC, its stats, and its persistence
	
--]]

local CheatUtilityXL    = require( game.ReplicatedStorage.TS.CheatUtility )
local MathXL			= require( game.ReplicatedStorage.Standard.MathXL )
local InstanceXL    	= require( game.ReplicatedStorage.Standard.InstanceXL )
local TableXL           = require( game.ReplicatedStorage.Standard.TableXL )

local BalanceData       = require( game.ReplicatedStorage.TS.BalanceDataTS ).BalanceData
local CharacterClientI  = require( game.ReplicatedStorage.CharacterClientI )
local FlexEquipUtility  = require( game.ReplicatedStorage.Standard.FlexEquipUtility )

local CharacterI        = require( game.ServerStorage.CharacterI )
local FlexibleTools     = require( game.ServerStorage.Standard.FlexibleToolsModule )
local FlexEquip         = require( game.ServerStorage.FlexEquipModule )
local Inventory         = require( game.ServerStorage.InventoryModule )

local DataStore2        = require( game.ServerStorage.Standard.DataStore2 )
local GameAnalyticsServer = require( game.ServerStorage.Standard.GameAnalyticsServer )

local HeroUtility 		= require( game.ReplicatedStorage.Standard.HeroUtility )

local CharacterClasses = require( game.ReplicatedStorage.TS.CharacterClasses ).CharacterClasses
local FlexTool = require( game.ReplicatedStorage.TS.FlexToolTS ).FlexTool
local Hero = require( game.ReplicatedStorage.TS.HeroTS ).Hero
local HeroStable = require( game.ReplicatedStorage.TS.HeroStableTS ).HeroStable
local GearPool = require( game.ReplicatedStorage.TS.CharacterRecord ).GearPool
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData

local Analytics = require( game.ServerStorage.TS.Analytics ).Analytics
local CharacterServer = require( game.ServerStorage.TS.CharacterServer ).CharacterServer
local HeroServer = require( game.ServerStorage.TS.HeroServer ).HeroServer
local MessageServer = require( game.ServerStorage.TS.MessageServer ).MessageServer
local MonsterServer = require( game.ServerStorage.TS.MonsterServer ).MonsterServer
local PlacesServer = require( game.ServerStorage.TS.PlacesServerTS ).PlacesServer
local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer
local SkinUtility = require( game.ServerStorage.TS.SkinUtility ).SkinUtility
local ToolCaches = require( game.ServerStorage.TS.ToolCaches ).ToolCaches

DebugXL:logD(LogArea.Requires, "HeroesModule requires succesful")

local PhysicsService = game.PhysicsService


local playerOverrideId = nil


local Heroes = {}

-- unlike the way I converted Inventory to datastore2, here I'm keeping a cache of the cache  :P
-- it was easier to integrate that way, and less awkward get/set in every function
	
local savedPlayerCharactersT = {}  -- persistent player characters that can be chosen / resurrected

local function PCKey( player ) return player end


local birthTickT = {}

function GetSavedPlayerCharactersWait( player )
	local startTick = tick()
	while not savedPlayerCharactersT[ PCKey( player ) ] do 
		wait()
		if not player.Parent then
			-- returning a stub so consumer functions can continue dumb and happy
			warn( "GetSavedPlayerChractersWait for parentless player "..player.Name )
			return { heroesA = {} }
		end 
		if tick() - startTick > 30 then
			DebugXL:Error( "GetSavedPlayerChractersWait timed out for player: could be really bad - kicking" )
			player:Kick( "Unable to load data from Roblox server" )
			-- might mean heroes never loaded, and then your choose hero window will try to help you make a new one, 
			-- and what will happen then?
			return { heroesA = {} }
		end
	end	
	return savedPlayerCharactersT[ PCKey( player ) ]
end


function Heroes:GetPCDataWait( player )
	DebugXL:Assert( player )
	return PlayerServer.getCharacterRecordFromPlayerWait( player )

end

-- can return nil
function Heroes:GetPCData( player )
	return PlayerServer.getPlayerCharacterRecords( player )
end


function Heroes:SaveHeroesWait( player )
	DebugXL:Assert( self == Heroes )
	DebugXL:Assert( player )
--	--print( "Saving "..player.Name.."'s heroes" )
	--Heroes:RecordPackContents( player )

	-- this is a good opportunity to refresh the current hero if there is one
	local cr = PlayerServer.getCharacterRecordFromPlayer( player )
	if( cr )then
		workspace.Signals.HeroesRE:FireClient( player, "RefreshSheet", cr )
		workspace.Signals.HotbarRE:FireClient( player, "Refresh", cr )
	end


	if not playerOverrideId then
		local heroStore = DataStore2( "Heroes", player )
		heroStore:Set( savedPlayerCharactersT[ PCKey( player ) ] )
	end

end

-- aka 'new hero'
function Heroes:ChooseClass( player, classNameS )
	-- possible for player to pick a hero and have the choice made for them at same time, so check first
	--print( player.Name.." chose class "..classNameS )
	if PlayerServer.getCharacterRecordFromPlayer( player ) then warn( player.Name.." data was already set up!?" ) end -- could happen if you come right back after a death I suppose
	local pcData = Hero.new( classNameS,
		CharacterClasses.heroStartingStats[ classNameS ],
		CharacterClasses.startingItems[ classNameS ] ) -- TableXL:DeepCopy( heroDatum )

	PlayerServer.setCharacterRecordForPlayer( player, pcData )
	CharacterI:SetCharacterClass( player, classNameS )
	HeroServer.calculateCurrentLevelCapWait()
	HeroServer.republishAllHeroLevels()
	birthTickT[ player ] = tick()
	
	local savedPlayerCharacters = savedPlayerCharactersT[ PCKey( player ) ]
	if not savedPlayerCharacters then
		DebugXL:Assert( player.Parent == nil )
		return  
	end
	local slotN = #savedPlayerCharacters.heroesA
	table.insert( savedPlayerCharacters.heroesA, pcData )
	pcData.slotN = slotN

	HeroServer.repopulateShopIfNecessary( player, pcData )

	DebugXL:Assert( pcData)
	workspace.Signals.HotbarRE:FireClient( player, "Refresh", pcData )
	workspace.Signals.HeroesRE:FireClient( player, "RefreshSheet", pcData )

	Heroes:SaveHeroesWait( player )		
end


function Heroes:ChooseHero( player, slotN )
	if player.Team == game.Teams.Heroes then                             	-- protect against hackage   
		PlayerServer.setCharacterRecordForPlayer( player, savedPlayerCharactersT[ PCKey( player ) ].heroesA[ slotN ] )
		local pcData = PlayerServer.getCharacterRecordFromPlayer( player )
		pcData.slotN = slotN
		CharacterI:SetCharacterClass( player, pcData.idS )
		HeroServer.calculateCurrentLevelCapWait()
		HeroServer.republishAllHeroLevels()
		birthTickT[ player ] = tick()
	end
end


function Heroes:ChooseDefaultHeroWait( player )	
	local mySavedPlayerCharactersT = savedPlayerCharactersT[ PCKey( player ) ]
	-- player data can be cleaned up when the player leaves but before this script finishes executing
	-- I thought my garbage collection trick would solve that problem but no - the player is still a variable
	-- even if it no longer has a parent
	if mySavedPlayerCharactersT then
		--local slotRec = HeroUtility:GetRecommendation( player, mySavedPlayerCharactersT )
		--if not slotRec then slotRec = 1 end
		local slotRec = 1
		if slotRec == #mySavedPlayerCharactersT.heroesA + 1 then
			Heroes:ChooseClass( player, "Warrior" )			
		else
			Heroes:ChooseHero( player, slotRec )
		end
	end
end


function Heroes:CharacterAdded( character, player )
	DebugXL:Assert( self == Heroes )
	DebugXL:logD( LogArea.Characters, 'Heroes:CharacterAdded '..player.Name )
	-- it can take longer to get the datastore than to spawn your first hero
	local myPCData = PlayerServer.getCharacterRecordFromPlayerWait( player )
	-- we might still be looking at our old monster data when we get here
	while not myPCData.statsT do wait() end

	local playerHumanoid = character:WaitForChild("Humanoid")
	
	spawn( function()
		local forceField = InstanceXL.new( "ForceField", { Parent = character, Name = "ForceField" } )
		wait( 5 )
		forceField:Destroy() 
	end )		
		
	-- if hero doesn't have a potion, give them one
	local level = Hero:levelForExperience( myPCData.statsT.experienceN )

	local potionCount = myPCData.gearPool:countIf( function( possession ) return possession.baseDataS=="Healing" end )
	if potionCount==0 then
		GivePossession( player, myPCData, FlexTool.new( "Healing", math.max( 1, level ), {} ) ) 
	end
	
	-- if hero doesn't have a usable melee weapon, give them one
	local meleeWeaponCount = myPCData.gearPool:countIf( function( possession ) 
		return ToolData.dataT[ possession.baseDataS ].equipType=="melee" and myPCData:canUseGear( possession ) end )
	if meleeWeaponCount==0 then
		-- a weak melee weapon. a 1st level wizard could chuck their staff and rejoin and do all right... 
		GivePossession( player, myPCData, FlexTool.new( "Shortsword", math.max( 1, level-1 ), {} ) ) 
	end
		
	-- if new player who has never had boost, give them free boost
	Inventory:GiftOnce( player, "Boost", 900 )  -- 15 minutes might get them two hero runs
	-- kind of sad if you purchase boost yourself actually but very few players will know.
	-- maybe instead of doing the 'nil means never had it' method I could have added
	-- a couple new parameters 'reservedboost', 'reservedalphamail' etc.
	
	Heroes:ConfigureGear( player )

	-- needs to be no occlusion otherwise you can't see the health bars for sentries/animals
	-- with nested humanoids 
	playerHumanoid.NameOcclusion = Enum.NameOcclusion.NoOcclusion

	playerHumanoid.HealthDisplayDistance = 250
	playerHumanoid.NameDisplayDistance = 0
	
	PhysicsService:SetPartCollisionGroup( character.Head, "Hero" )
	PhysicsService:SetPartCollisionGroup( character.HumanoidRootPart, "Hero" )
		
	ConfigureCharacter( player )
	
	-- since this happens when the character is added, everyone has made their choice except for hero expressers
	-- to decide if we should cast Aura of Courage at first we just look at other heroes - a one-on-one game where an opponent is naturally
	-- high level doesn't count

	local dangerRatio = HeroServer.calculateDangerRatio( myPCData:getLocalLevel() )
	DebugXL:logI( LogArea.Gameplay, "HeroesModule: Danger ratio for "..player.Name..": "..dangerRatio )
	if dangerRatio >= 11/7 then
		local x = (dangerRatio - 11/7) / ( 21 / 7 )
		local dr = MathXL:Lerp( BalanceData.sidekickDamageReductionMin, BalanceData.sidekickDamageReductionMax, x )
		CharacterServer.giveAuraOfCourage( character, dr )
		print( player.Name.." Aura Of Courage DR: "..dr )
		local auraFX = require( game.ServerStorage.CharacterFX.AuraGlow ):Activate( character, MathXL.hugeish, Color3.new( 1, 1, 0 ) )
		character.AuraOfCourage.AncestryChanged:Connect( function( _, parent )
			if parent == nil then
				print( "Destroying aura of courage FX" ) 
				require( game.ServerStorage.CharacterFX.AuraGlow ):RemoveAllAuras( character )
			end
		end ) 
	end

	FlexEquip:ApplyEntireCostumeWait( PlayerServer.getPlayerTracker(), player, myPCData, Inventory:GetActiveSkinsWait( player ).hero )

	GameAnalyticsServer.RecordDesignEvent( player, "Spawn:Hero:"..PlayerServer.getCharacterClass( player ) )

	return myPCData, PlayerServer.getCharacterKeyFromPlayer( player )
end


function GivePossession( player, myPCData, flexToolInst )
	local characterKey = PlayerServer.getCharacterKeyFromPlayer( player )
	if ToolData.dataT[ flexToolInst.baseDataS ].equipType == "potion" then
		myPCData:giveFlexTool( flexToolInst )
		ToolCaches.updateToolCache( PlayerServer.getPlayerTracker(), characterKey, myPCData, SkinUtility.getCurrentSkinset(Inventory, player, myPCData) )
	else		
		local gearCount = HeroUtility:CountNonPotionGear( myPCData )
		local givenB = false
		if gearCount < Inventory:GetCount( player, "GearSlots" ) then	
			myPCData:giveFlexTool( flexToolInst )
			local totalPossessions = HeroUtility:CountNonPotionGear( myPCData )
			Analytics.ReportEvent( player, 'GiveTool', flexToolInst.baseDataS, flexToolInst.levelN, totalPossessions )
			ToolCaches.updateToolCache( PlayerServer.getPlayerTracker(), characterKey, myPCData, SkinUtility.getCurrentSkinset(Inventory, player, myPCData) )
			givenB = true
		end  
		local gearCount = HeroUtility:CountNonPotionGear( myPCData )
		-- we make the count right away again so if they *just* filled up they still get a warning ( note we could just add one in theory but we've got the cycles so why not be careful, who knows what might happen)
		if gearCount >= Inventory:GetCount( player, "GearSlots" ) then
			MessageServer.PostMessageByKey( player, "OutOfGearSlots", false )
			if not givenB then
				-- looking specifically to see if we can correlate not getting the gear with player loss
				GameAnalyticsServer.RecordDesignEvent( player, "OutOfGearSlots" )
			end
		end
	end
end


function Heroes:Died( player )
--	warn( "Clearing "..player.Name.."'s backpack" )

	player.Backpack:ClearAllChildren()
	player.StarterGear:ClearAllChildren()
	
	local myPCData = PlayerServer.getCharacterRecordFromPlayer( player )
	local noteS = "User "..player.UserId.."; "
	if myPCData then
		-- which PC are they using?
		local mySavedPCs = savedPlayerCharactersT[ PCKey( player ) ]
		DebugXL:Assert( mySavedPCs )
		if mySavedPCs then		
			local heroIndex = TableXL:FindFirstElementIdxInA( mySavedPCs.heroesA, myPCData )
			DebugXL:Assert( heroIndex )
			if heroIndex then
				noteS = noteS .. "Hero "..heroIndex
			end
		end
	end
	noteS = noteS.."Num Players "..#game.Players:GetPlayers()

	local lifetime = PlayerServer.recordCharacterDeath( player, player.Character )
	if myPCData then
		if myPCData.statsT.totalTimeN then
			myPCData.statsT.totalTimeN = myPCData.statsT.totalTimeN + lifetime
		end
	end

	-- good opportunity to record progress, probably not overdoing
	Heroes:SaveHeroesWait( player )

	--  this can throw errors because the character is still active for a bit before the player is gone,
	--  so instead we do a garbage collection step later
	--  actually that makes it even worse...  
	--  PlayerServer.getCharacterRecordFromPlayer( player ) = nil	
end


function Heroes:GetExperienceWait( player )
	return Heroes:GetPCDataWait( player ).statsT.experienceN
end


function Heroes:ReconfigureDerivativeStats( character, myPCData, heldToolInst )
	local maxManaN   = myPCData:getMaxMana( heldToolInst )
	local maxHealthN = myPCData:getMaxHealth( heldToolInst )
	 
	local oldMaxMana
	if character:FindFirstChild("MaxManaValue") then
		oldMaxMana = character.MaxManaValue.Value
		if character:FindFirstChild("ManaValue") then
			-- not sure why you can have your MaxMana but not your Mana but it happens
			character.ManaValue.Value = math.max( 0, character.ManaValue.Value + maxManaN - oldMaxMana )
		end
	else
		oldMaxMana = maxManaN 
	end   
	InstanceXL.new( "NumberValue", { Parent = character, Name = "MaxManaValue", Value = maxManaN }, true )
	
--  by the time we get here we are duplicating data too late; now using leaderstats for character level acquisition
--	InstanceXL.new( "NumberValue", { Parent = character, Name = "Experience",   Value = myPCData.statsT.experienceN }, true )
	local humanoid = character:FindFirstChild("Humanoid")
	if humanoid then
		local oldMaxHealth = humanoid.MaxHealth
		humanoid.MaxHealth = maxHealthN
		humanoid.Health = math.max( 1, humanoid.Health + maxHealthN - oldMaxHealth )
	end	
end


function ConfigureCharacter( player )
	local character = player.Character
	if not character then return end
	local humanoid  = character:FindFirstChild("Humanoid")
	if not humanoid then return end
		
	local myPCData = PlayerServer.getCharacterRecordFromPlayer( player )	
	
	Heroes:ReconfigureDerivativeStats( character, myPCData )
	 
	InstanceXL.new( "NumberValue", { Parent = character, Name = "ManaValue", Value = character.MaxManaValue.Value }, true )
	humanoid.Health    = humanoid.MaxHealth		
	
----print( player.Name.." refreshing client hero data" )
	DebugXL:Assert( myPCData )
	workspace.Signals.HeroesRE:FireClient( player, "RefreshSheet", myPCData )
	workspace.Signals.HotbarRE:FireClient( player, "Refresh", myPCData )
end


-- make Gear match player data
-- treating the backpack tools as a cache for the possessions in your datastore
function Heroes:ConfigureGear( player )
	DebugXL:Assert( self == Heroes )
	player:WaitForChild("StarterGear"):ClearAllChildren()
	player:WaitForChild("Backpack"):ClearAllChildren()
end


-- to be called every time the game gives a hero a new tool (eg, loot drop or picking up tool in environment)
function Heroes:RecordTool( player, flexToolInst )
	local myPCData = Heroes:GetPCDataWait( player )

	GivePossession( player, myPCData, flexToolInst )
	Heroes:SaveHeroesWait( player )		 	
end


-- NOTE: returns packed pair damage, critB
function Heroes:DetermineFlexToolDamageN( myPCData, flexToolInst, critResistantB )
	DebugXL:Assert( self == Heroes )
	DebugXL:Assert( TableXL:InstanceOf( myPCData, Hero ) )
	DebugXL:Assert( TableXL:InstanceOf( flexToolInst, FlexTool ) )

	local damage1, damage2 = unpack( FlexEquipUtility:GetDamageNs( flexToolInst, myPCData:getActualLevel(), Hero:getCurrentMaxHeroLevel() ) )
	local typeS = flexToolInst:getBaseData().equipType
	local damageBonusN = HeroUtility:GetDamageBonus( myPCData, typeS, flexToolInst )
	local damageN = MathXL:RandomInteger( damage1, damage2 )
	local critB = ( not critResistantB ) and ( MathXL:RandomNumber() < BalanceData.baseCritChance )
	if( critB )then
		warn("critical")
		damageN = damage2 * 1.5
	end
	damageN = math.ceil( damageN + damageN * damageBonusN )
	return { damageN, critB }
end


function Heroes:GetAdjToolDamageEnhancements( player, tool )
	DebugXL:Assert( self == Heroes )
	-- you might have, say, a magic ring that does fire damage, for example, but for now
	-- we just go straight through to tool in question
	return FlexibleTools:GetDamageEnhancements( tool )
end


function Heroes:DetermineCooldownN( player, toolO )
	DebugXL:Assert( self == Heroes )
	return FlexibleTools:GetCooldownN( toolO )
end


function Heroes:DoDirectDamage( player, damage, targetHumanoid, critB )
	DebugXL:Assert( self == Heroes )
	if targetHumanoid.Health > 0 then
		--print( "Heroes:DoDirectDamage targetHumanoid health > 0" )
		
		targetHumanoid:TakeDamage( damage )
		--print( "Heroes:DoDirectDamage Damage done: "..damage )
		require( game.ServerStorage.Standard.HealthChange ):Activate( targetHumanoid.Parent, -damage, critB )		

		if targetHumanoid.Health <= 0 then
--		--print( targetHumanoid:GetFullName().." killed" )
			-- if we wanted more encapsulation we could have this be a function we registeredfixed
			local victimCharacter = targetHumanoid.Parent
			local victimPlayer = game.Players:GetPlayerFromCharacter( victimCharacter )
			local victimCharacterRecord = PlayerServer.getCharacterRecordFromCharacter( victimCharacter )
			if( victimCharacterRecord ) then  -- structures don't award xp
				local xpValue = MonsterServer.calculateXPReward( victimCharacterRecord, not victimPlayer )
				DebugXL:logD( LogArea.Gameplay, targetHumanoid:GetFullName().." kill experience awarded: starting value "..xpValue )
				HeroServer.awardKillExperienceWait( player, xpValue, targetHumanoid.Parent )
				Heroes:SaveHeroesWait( player )				
			end
			-- consolation prize for victim:
			if victimPlayer then
				require( game.ServerStorage.MonstersModule ):AdjustBuildPoints( victimPlayer, 50 )
				MonsterServer.awardTeamXPForMonsterKill( victimPlayer )
				
				Inventory:AdjustCount( victimPlayer, "Stars", 2, "Death", "Monster" )
				Inventory:EarnRubies( victimPlayer, 2, "Death", "Monster" )
			end
		end	
	end
end


-- if this game ever starts to pay for the time invested please fix this fucking mess
-- you might think, "But can't we get the character from the player?"
-- The player's character might theoretically change before this gets processed; we need the one that matches the flexToolInst
function Heroes:DoFlexToolDamage( attackerRecord, character, flexToolInst, targetHumanoid, tool )
	DebugXL:Assert( self == Heroes )
	DebugXL:Assert( character:IsA("Model") )
	DebugXL:Assert( TableXL:InstanceOf( flexToolInst, FlexTool ) )
	DebugXL:Assert( targetHumanoid:IsA("Humanoid"))
	DebugXL:Assert( not tool or tool:IsA("Tool"))
	
	if targetHumanoid.Health > 0 then

		FlexibleTools:ResolveFlexToolEffects( attackerRecord, flexToolInst, targetHumanoid, tool )  -- fixme: should use character, not player
		local critResistantB = targetHumanoid.Parent:FindFirstChild('DestructibleScript') -- structures don't get critted. it's weird
		local damageN, critB = unpack( Heroes:DetermineFlexToolDamageN( attackerRecord, flexToolInst, critResistantB ) )

		local targetCharacter = targetHumanoid.Parent
		local targetPlayer = game.Players:GetPlayerFromCharacter( targetCharacter )
		if targetPlayer then		-- for single-player testing purposes in debugger
			local defenderPCData = CharacterI:GetPCDataWait( targetPlayer )
			local weaponTypeS = flexToolInst:getBaseData().equipType
			damageN = CharacterClientI:DetermineDamageReduction( targetHumanoid.Parent, defenderPCData, damageN, { [weaponTypeS]=true } )
		end
--	--print( "Base damage: "..damage )
		local player = game.Players:GetPlayerFromCharacter(character)
		if player then
			Heroes:DoDirectDamage( player, damageN, targetHumanoid, critB )
		end
	end
end




function Heroes:NewDungeonLevel( player, newDungeonLevelN )
	DebugXL:Assert( self == Heroes )
	local pcData = PlayerServer.getCharacterRecordFromPlayer( player )
--	DebugXL:Assert( pcData )
	if pcData then
		pcData.statsT.deepestDungeonLevelN = math.max( pcData.statsT.deepestDungeonLevelN, newDungeonLevelN )
		Heroes:SaveHeroesWait( player )
	end
end


function Heroes:EnableEnhancementFX( player, tool, parent )
	DebugXL:Assert( self == Heroes )
	local enhancements = Heroes:GetAdjToolDamageEnhancements( player, tool )
	for i, enhancement in ipairs( enhancements ) do          --  enhancements have to be read in order to be consistent
		for i, child in ipairs( parent:GetChildren() ) do
			if string.lower( child.Name ) == enhancement.flavorS then
				child.Enabled = true
			end
		end 
	end 
end 

-- no longer used to discard tool, but
-- used by bomb to destroy itself



local function PlayerAdded( player )
	local startTime = time()	
	local heroStore = DataStore2( "Heroes", player, playerOverrideId )
	local savedPlayerCharacters = heroStore:Get( HeroStable.new() )
--	AnalyticsXL:ReportHistogram( player, "Duration: Inventory datastore get", time() - startTime, 1, "second", player.Name, true)
--	local savedPlayerCharacter = heroStore:GetAsync( "user"..player.UserId )
--	if not savedPlayerCharacter or not savedPlayerCharacter.versionN or savedPlayerCharacter.versionN < saveVersionN then
--		savedPlayerCharactersT[ PCKey( player ) ] = SavedPlayerCharacters.new()
--	else
--		savedPlayerCharactersT[ PCKey( player ) ] = savedPlayerCharacter
--	end

	-- this has to be fixed here before objectify objectifies your items
	for _, hero in pairs( savedPlayerCharacters.heroesA ) do
					
		-- once upon a time, stuff was stored in a sparse array called possessionsA.  If your hero used that old obsolete
		-- method, it's time to update to the new gearPool
		if hero.possessionsA then
			DebugXL:Assert( not hero.gearPool )
			hero.gearPool = GearPool.new()
			if not hero.toolKeyServerN then hero.toolKeyServerN = 1 end
			for i, item in pairs( hero.possessionsA ) do
				hero.gearPool:set( "item"..i, item )
				hero.toolKeyServerN = math.max( hero.toolKeyServerN, i+1 )
			end
			hero.possessionsA = nil
		end
	end

	HeroStable:convertFromPersistent( savedPlayerCharacters, player.Name )

	
	for _, hero in pairs( savedPlayerCharacters.heroesA ) do
				
		-- the magic nerfolator!  I lowered stats to 3 per level from 5 in the hopes it would reduce 
		-- power disparity, and am now reigning back in earlier players so *they're* not disparate from new heroes
		-- their level.  We can leave this in because it can prevent some cheating also
		local statPointsSpent = HeroUtility:GetStatPointsSpent( hero )
		local statPointsEarned = HeroUtility:StatPointsEarned( hero.statsT.experienceN )
		if statPointsSpent > statPointsEarned then
			-- divide appropriately and round
			-- a given stat wants newvalue = ( oldvalue - base ) * shouldHaveSpent / didSpend
			-- we'll then do floor, and the players will be able to spend their leftover points as desired
			hero.statsT.strN  = math.floor( ( hero.statsT.strN - 10 ) * statPointsEarned / statPointsSpent + 10 )  
			hero.statsT.dexN  = math.floor( ( hero.statsT.dexN - 10 ) * statPointsEarned / statPointsSpent + 10 )  
			hero.statsT.willN = math.floor( ( hero.statsT.willN - 10 ) * statPointsEarned / statPointsSpent + 10 )  
			hero.statsT.conN  = math.floor( ( hero.statsT.conN - 10 ) * statPointsEarned / statPointsSpent + 10 )  
		end

		hero.gearPool:purgeObsoleteItems()

		-- only later did I smack myself on the forehead and ask why don't all tools have empty enhancementsA arrays
		-- here we make that happen for old data
		hero.gearPool:forEach( function( flexToolInst, k )
			if not flexToolInst.enhancementsA then
				flexToolInst.enhancementsA = {}
			end
		end )

		-- once upon a time heroes didn't own their own jumpPowerN
		-- sad duplication of data that became necessary partway through the transition to typescript
		if not hero.jumpPowerN then
			hero.jumpPowerN = 35
		end

		HeroServer.awardBadgesForHero( player, hero )
	end

	savedPlayerCharacters:checkVersion( player )

	for _, hero in pairs( savedPlayerCharacters.heroesA ) do
		HeroServer.repopulateShopIfNecessary( player, hero )
	end

	savedPlayerCharactersT[ PCKey( player ) ] = savedPlayerCharacters
end


for _, player in pairs( game.Players:GetPlayers()) do spawn( function() PlayerAdded( player ) end ) end
game.Players.PlayerAdded:Connect( PlayerAdded )


function Heroes:PlayerAddedWait( player )
	-- moved back into player added connectino
end


function Heroes:PlayerRemovingWait( player )
	local savedPCs = GetSavedPlayerCharactersWait( player )
	if not savedPCs then return end  -- should be fine, currently this is only used for recommending characters
	for i, hero in ipairs( savedPCs.heroesA ) do
		GameAnalyticsServer.RecordDesignEvent( player, "GoldLeft:Hero"..i, hero.statsT.goldN, 25, "Gold25" )
	end
	Heroes:SaveHeroesWait( player )
end

game.Players.PlayerRemoving:Connect( function( player ) Heroes:PlayerRemovingWait( player ) end )

function Heroes:AdjustGold( player, amount, analyticsItemIdS, analyticsItemTypeS )
	local pcData = Heroes:GetPCDataWait( player )	
	HeroServer.adjustGold( player, pcData, amount, analyticsItemIdS, analyticsItemTypeS )
	Heroes:SaveHeroesWait( player )
end


local buyingGoldForHeroInSlot = {}

-- really not sure about tying gold to heroes
-- I did this extra work for what?
-- so people still have to either grind or pay on their later heroes rather than use their one badass hero to outfit them
-- which is weird because most action RPG's let you do that. Plus if I allow trading people can juke the system anyway.
-- well, I can always turn it off later. though then it will have been a waste of work
function Heroes:BuyGold( player, amount, analyticsItemIdS, analyticsItemTypeS )
	local slot = buyingGoldForHeroInSlot[ player ]
	DebugXL:Assert( slot )
	if slot then	
		local heroes = GetSavedPlayerCharactersWait( player )
		DebugXL:Assert( heroes.heroesA[ slot ] )
		if( heroes.heroesA[ slot ])then
			HeroServer.adjustGold( player, heroes.heroesA[ slot ], amount, analyticsItemIdS, analyticsItemTypeS )
			Heroes:SaveHeroesWait( player )
			buyingGoldForHeroInSlot[ player ] = nil
			return true
		end
	end
	return false
end


spawn( function()
	-- garbage collection
	-- only works if pckey is player;  need to use GetPlayerByUserId if we switch
	
	while wait(1) do
		for key, _ in pairs( savedPlayerCharactersT ) do
			if not key.Parent then
				print( "Removing "..key.Name.." from savedPlayerCharactersT" )
				savedPlayerCharactersT[ key ] = nil
			end 
		end
	end
end)
--------------------------------------------------------------------------------------------------------------------
-- Remote Dispatching
--------------------------------------------------------------------------------------------------------------------
--local remoteFolder  = ObjectX.Singleton( "Folder",      	{ Name = "Remote", Parent = game.Workspace } )
local pcEvent = workspace.Signals.HeroesRE
local pcFunc  = workspace.Signals.HeroesRF


local HeroRemote = {}
-- in hindsight I'd just cache the stats in player values. Or would I?
function HeroRemote.GetStatsWait( ... )
	return Heroes:GetPCDataWait( ... )
end


function HeroRemote.ChooseClass( ... )
	Heroes:ChooseClass( ... )
end


function HeroRemote.Wear( player, itemKey, equipB )
	local pcData = Heroes:GetPCDataWait( player )
	if not pcData then return end

	local item = pcData.gearPool:get( itemKey )
	if not item then return end  -- I guess it's possible to click throw away and then rapidly quick equip
	if item.equippedB ~= equipB then
		if equipB then
			if pcData:canUseGear( item ) then
				local equipSlot = ToolData.dataT[ item.baseDataS ].equipSlot
				local currentItem = CharacterClientI:GetEquipFromSlot( pcData, equipSlot )
				if currentItem then
					currentItem.equippedB = false
				end
			end
		end
		item.equippedB = equipB
		if player.Character then
			if player.Character.Parent then
				Heroes:ReconfigureDerivativeStats( player, pcData )
				HeroUtility:RecheckItemRequirements( pcData )
				FlexEquip:ApplyEntireCostumeWait( PlayerServer.getPlayerTracker(), player, pcData, Inventory:GetActiveSkinsWait( player ).hero )
			end
		end	
		Heroes:SaveHeroesWait( player )
	end
end


function HeroRemote.SpendStatPoint( player, stat )	
	local pcData = Heroes:GetPCDataWait( player )
	if not pcData then return end
	if HeroUtility:GetStatPointsSpent( pcData ) < HeroUtility:StatPointsEarned( pcData.statsT.experienceN ) then
		pcData.statsT[ stat ] = pcData.statsT[ stat ] + 1
		--pcData.statsT.statPointsSpentN = pcData.statsT.statPointsSpentN + 1  	
		--ConfigureCharacter( player )
		local character = player.Character
		Heroes:ReconfigureDerivativeStats( character, pcData )
		Heroes:SaveHeroesWait( player )
	else
		warn( "Overspent stat points. Probably lag." )
	end
end


function HeroRemote.TakeBestHealthPotion( player )
	local pcData = Heroes:GetPCDataWait( player )
	if not pcData then return end

	-- doing *after the wait*
	if not player.Character then return end
	if not player.Character:FindFirstChild("ManaValue") then return end
	if not player.Character:FindFirstChild("MaxManaValue") then return end
	if not player.Character:FindFirstChild("Humanoid") then return end
	
	local delta = player.Character.Humanoid.MaxHealth - player.Character.Humanoid.Health
	if delta <= 0 then return end  -- don't waste it if you don't need to
	
	local pot, k = unpack( pcData.gearPool:findIf( function( item ) return item.baseDataS == "Healing" end ) )
	if pot then
		local characterLevel = pcData:getLocalLevel()
		local character = player.Character
		-- potion efficacy is determined by level to make health munchkins not necessarily the best strategy
		local effectStrength = ToolData.dataT[ pot.baseDataS ].effectStrengthN + ToolData.dataT[ pot.baseDataS ].effectBonusPerLevelN * characterLevel 
		character.Humanoid.Health = math.min( character.Humanoid.Health + effectStrength,
			character.Humanoid.MaxHealth )
		
		require( game.ServerStorage.CharacterFX.MagicHealing ):Activate( character, Color3.new( 1, 0, 0 ) )
		require( game.ServerStorage.Standard.HealthChange ):Activate( character, effectStrength, false )		

		-- and good-bye potion
		pcData.gearPool:delete( k )
		Heroes:SaveHeroesWait( player )

		ToolCaches.publishPotions( player, pcData )		
	end
end


-- eh, different enough it would be a pain in the ass to abstract
function HeroRemote.TakeBestManaPotion( player )
	local pcData = Heroes:GetPCDataWait( player )
	if not pcData then return end
	if not player.Character then return end
	if not player.Character:FindFirstChild("ManaValue") then return end
	if not player.Character:FindFirstChild("MaxManaValue") then return end

	
	local delta = player.Character.MaxManaValue.Value - player.Character.ManaValue.Value
	if delta <= 0 then return end  -- don't waste it if you don't need to
	
	local pot, k = unpack( pcData.gearPool:findIf( function( item ) return item.baseDataS == "Mana" end ) )
	if pot then
		local characterLevel = pcData:getLocalLevel()
		local character = player.Character
		local effectStrength = ToolData.dataT[ pot.baseDataS ].effectStrengthN + ToolData.dataT[ pot.baseDataS ].effectBonusPerLevelN * characterLevel 
		character.ManaValue.Value = math.min( character.ManaValue.Value + effectStrength, 
			character.MaxManaValue.Value )
		require( game.ServerStorage.CharacterFX.MagicHealing ):Activate( character, Color3.new( 0, 0, 1 ) )
		-- and good-bye potion
		pcData.gearPool:delete( k )
		Heroes:SaveHeroesWait( player )
	end
end


function HeroRemote.GetDatum( player )
	return PlayerServer.getCharacterRecordFromPlayer( player ) 
end


function HeroRemote.GetSavedPlayerCharactersWait( player )
	return GetSavedPlayerCharactersWait( player )
end


-- immediately returns remaining heroes
function HeroRemote.DeleteHero( player, slotN )
	-- I don't think that this can be used to grief because only the owning player can call for themselves
	warn("DeleteHero "..slotN.." for "..player:GetFullName())
	table.remove( savedPlayerCharactersT[ PCKey( player ) ].heroesA, slotN )
	Heroes:SaveHeroesWait( player )
	return savedPlayerCharactersT[ PCKey( player ) ]
end


function HeroRemote.ChooseHero( ... )
	Heroes:ChooseHero( ... )
end 


function HeroRemote.AwardExperienceWait( player )
	if CheatUtilityXL:PlayerWhitelisted( player ) then
		local characterKey = PlayerServer.getCharacterKeyFromPlayer( player )
		HeroServer.awardExperienceWait( player, PlayerServer.getActualLevel( characterKey ) * 500, "Cheat", "Cheat" )
		Heroes:SaveHeroesWait( player )
	end
end


-- function HeroRemote.SaveHeroes( player )
-- 	if not playerOverrideId then
-- 		local heroStore = DataStore2( "Heroes", player )
-- 		heroStore:Save()
-- 	end
-- end


function HeroRemote.AssignItemToSlot( player, itemKey, slotN )
	local pcData = Heroes:GetPCDataWait( player )
	if not pcData then return end

	local item = pcData.gearPool:get( itemKey )
	if item then  -- it's possible to sell off a weapon and click on it in your inventory before it's gone and send other spurious commands
		if pcData:canUseGear( item ) then
			CharacterClientI:AssignPossessionToSlot( pcData, itemKey, slotN )
			
			local characterKey = PlayerServer.getCharacterKeyFromPlayer( player )
			ToolCaches.updateToolCache( PlayerServer.getPlayerTracker(), characterKey, pcData, SkinUtility.getCurrentSkinset(Inventory, player, pcData) )
			
			Heroes:SaveHeroesWait( player )
		end
	end
end


function HeroRemote.BuyItem( player, shopItemKey )
	local pcData = Heroes:GetPCDataWait( player )	
	if not pcData then return end

	HeroServer.buyItem( player, pcData, shopItemKey )
	Heroes:SaveHeroesWait( player )
end
		

function HeroRemote.SellItem( player, itemKey )
	local pcData = Heroes:GetPCDataWait( player )
	if not pcData then 
		DebugXL:Error( "Data unavailable for sell item "..itemKey.."; possibly they clicked button then died" )
		return 
	end

	-- possible to queue up two throw-away clicks, so check first
	local itemToBeSold = pcData.gearPool:get( itemKey )
	if itemToBeSold then
		if player.Parent then
			local goldAmount = itemToBeSold:getSellPrice()
			local resultsA = MessageServer.QueryBox( player, 
				"SellConfirmation", { item = itemToBeSold, amount = goldAmount },
				true,  -- needs ack
				0, -- no delay
				true, -- modal,
				"Yes",
				"No" )
			if resultsA and resultsA[1] == "Yes" then
				-- get data again because player might have reset while dialog was up
				local pcData = Heroes:GetPCDataWait( player )				
				local item = pcData:removeTool( itemKey )
				if item then
					HeroServer.adjustGold( player, pcData, item:getSellPrice(), "Sell", item.baseDataS )
					if item.equippedB then
						if player.Character then
							FlexEquip:ApplyEntireCostumeWait( PlayerServer.getPlayerTracker(), player, pcData, Inventory:GetActiveSkinsWait( player ).hero )
						end
					end
				end

				local characterKey = PlayerServer.getCharacterKeyFromPlayer( player )
				ToolCaches.updateToolCache( PlayerServer.getPlayerTracker(), characterKey, pcData, SkinUtility.getCurrentSkinset(Inventory, player, pcData) )

				Heroes:SaveHeroesWait( player )
			end
		end
	else
		DebugXL:Error( "Couldn't find item "..itemKey.."; maybe trying to sell twice" )
	end
end


function HeroRemote.PromptGoldBuy( player, slot, devProductData )
	if buyingGoldForHeroInSlot[ player ] then return end  -- don't do it if one is in process
	buyingGoldForHeroInSlot[ player ] = slot
	game:GetService("MarketplaceService"):PromptProductPurchase( player, devProductData.ID )
end


function HeroRemote.SetHideItem( player, itemKey, hideItemB )
	local pcData = Heroes:GetPCDataWait( player )
	if not pcData then return end

	-- possible to queue up two throw-away clicks, so check first
	local item = pcData.gearPool:get( itemKey )
	if item then
		if player.Parent then
			item.hideItemB = hideItemB
			if item.equippedB then
				if player.Character then
					FlexEquip:ApplyEntireCostumeWait( PlayerServer.getPlayerTracker(), player, pcData, Inventory:GetActiveSkinsWait( player ).hero )
				end
			end
		end
	end
end



function HeroRemote.SetHideAccessories( player, itemKey, hideAccessoriesB )
	local pcData = Heroes:GetPCDataWait( player )
	if not pcData then return end

	-- possible to queue up two throw-away clicks, so check first
	local item = pcData.gearPool:get( itemKey )
	if item then
		if player.Parent then
			item.hideAccessoriesB = hideAccessoriesB
			if item.equippedB then
				if player.Character then
					FlexEquip:ApplyEntireCostumeWait( PlayerServer.getPlayerTracker(), player, pcData, Inventory:GetActiveSkinsWait( player ).hero )
				end
			end
		end
	end
end


function HeroRemote.ServerSideTeleport( player, whereTo )
    PlacesServer:serverSideTeleport( player, whereTo, GetSavedPlayerCharactersWait( player ) )
end


local function DispatchFunc( player, funcName, ... ) 
	if HeroRemote[ funcName ] then
		print("Dispatched "..funcName.." for player "..player:GetFullName())
		return HeroRemote[ funcName ]( player, ... )
	else
		DebugXL:Error( "Attempt to call HeroRemote."..tostring( funcName ) )
	end
end


pcEvent.OnServerEvent:Connect( DispatchFunc )
pcFunc.OnServerInvoke = DispatchFunc



return Heroes
