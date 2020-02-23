print( script:GetFullName().." executed" )

local DebugXL          = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL       = require( game.ReplicatedStorage.Standard.InstanceXL )
local MathXL           = require( game.ReplicatedStorage.Standard.MathXL )
local SoundXL          = require( game.ReplicatedStorage.Standard.SoundXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL ) 

local FlexibleTools    = require( game.ServerStorage.Standard.FlexibleToolsModule )
local Loot             = require( game.ServerStorage.LootModule )

local CharacterI       = require( game.ServerStorage.CharacterI )
local Ghost            = require( game.ServerStorage.GhostModule )
local Inventory        = require( game.ServerStorage.InventoryModule )

local BalanceData      = require( game.ReplicatedStorage.TS.BalanceDataTS ).BalanceData
local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )
local CharacterUtility = require( game.ReplicatedStorage.Standard.CharacterUtility )
local FlexEquipUtility  = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local HeroUtility      = require( game.ReplicatedStorage.Standard.HeroUtility )
local MonsterUtility   = require( game.ReplicatedStorage.MonsterUtility )
local PossessionData   = require( game.ReplicatedStorage.PossessionData )

local AnalyticsXL      = require( game.ServerStorage.Standard.AnalyticsXL )
local CharacterXL      = require( game.ServerStorage.Standard.CharacterXL )
local CostumesServer   = require( game.ServerStorage.Standard.CostumesServer )
local GameAnalyticsServer = require( game.ServerStorage.Standard.GameAnalyticsServer )
local PlayerXL         = require( game.ServerStorage.Standard.PlayerXL )

local CharacterClasses = require( game.ReplicatedStorage.TS.CharacterClasses ).CharacterClasses
local FlexTool = require( game.ReplicatedStorage.TS.FlexToolTS ).FlexTool
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData
local Monster = require( game.ReplicatedStorage.TS.Monster ).Monster
local PC = require( game.ReplicatedStorage.TS.PCTS ).PC
local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest

local Analytics = require( game.ServerStorage.TS.Analytics).Analytics
local GameplayTestService = require( game.ServerStorage.TS.GameplayTestService ).GameplayTestService
local HeroServer = require( game.ServerStorage.TS.HeroServer ).HeroServer
local MonsterServer = require( game.ServerStorage.TS.MonsterServer ).MonsterServer
local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer

-- for balance tuning:


-- after the calibrate-level-for-number-of-players-plus-time-plus-depth change I tried 1.25 / 0.3 but that seemed too easy so took it back to 1.5 / 0.4

local healthModifierN = BalanceData.monsterHealthMultiplierN
local damageModifierN = BalanceData.monsterDamageMultiplierN   -- after the auto balancing change a level 4 skeleton was taking a lot of strikes to do in a level 1 warrior at 0.3

local levelTimeDifficultyK = BalanceData.levelTimeDifficultyK

local isHighLevelServer = Places:getCurrentPlace().maxGrowthLevel > 8
local monsterHealthPerLevelN = isHighLevelServer and BalanceData.monsterHealthPerLevelHighLevelServerN or BalanceData.monsterHealthPerLevelN
local monsterDefaultDamagePerLevelBonusN = isHighLevelServer and BalanceData.monsterDefaultDamagePerLevelBonusHighLevelServerN or BalanceData.monsterDefaultDamagePerLevelBonusN

-- 0.666 as of 9/3
-- tripled damage on 11/16 because I cut weapon level in third

monsterHealthPerLevelN = monsterHealthPerLevelN * 0.666
monsterDefaultDamagePerLevelBonusN = monsterDefaultDamagePerLevelBonusN * 2

local Monsters = {}

--local playerCharactersT = {} 

local function PCKey( player ) return player end


local function GiveWeapon( character, player, flexToolPrototype )
	local flexToolRaw = TableXL:DeepCopy( flexToolPrototype )
	local flexTool = FlexTool:objectify( flexToolRaw ) 
	flexTool.levelN = math.ceil( Monsters:GetLevelN( character ) * BalanceData.monsterWeaponLevelMultiplierN )  -- made ceil to make sure no 0 level weapon
	PlayerServer.pcs[ player ]:giveTool( flexTool )
end


local function GiveUniqueWeapon( character, player, potentialWeaponsA )
	if #potentialWeaponsA == 0 then
		DebugXL:Error( character.Name.." of class "..CharacterClientI:GetCharacterClass( player ).." has no potential weapons" )
	end
	local toolData        = TableXL:Map( potentialWeaponsA, function( weaponNameS ) return ToolData.dataT[ weaponNameS ] end )
	local dropLikelihoods = TableXL:Map( toolData, function( x ) return x.monsterStartGearBiasN end )
	if TableXL:GetN( dropLikelihoods ) == 0 then
		DebugXL:Error( character.Name.." has no drop likelihoods" )
	end
	local toolN = MathXL:RandomBiasedInteger( dropLikelihoods )
	local weaponTemplate = toolData[ toolN ]
	if not weaponTemplate then
		DebugXL:Dump( potentialWeaponsA )
		DebugXL:Dump( toolData )
		DebugXL:Dump( dropLikelihoods )
		DebugXL:Error( character.Name.." weapon template nil.")
	end

	-- slot here is hotbar slot
	local _slotN = nil
	if CharacterClientI:GetCharacterClass( player )~="Werewolf" then
		_slotN = PlayerServer.pcs[ player ]:countTools() + 1
	end
	local flexToolInst = { baseDataS = weaponTemplate.idS, 
		levelN = math.max( 1, math.floor( Monsters:GetLevelN( character ) * BalanceData.monsterWeaponLevelMultiplierN ) ), 
		enhancementsA = {}, 
		slotN = _slotN }
	local flexTool = FlexTool:objectify( flexToolInst )
	PlayerServer.pcs[ player ]:giveTool( flexTool )

	TableXL:RemoveFirstElementFromA( potentialWeaponsA, weaponTemplate.idS )
	return flexToolInst
end 


function Monsters:GetPCDataWait( player )
	while not PlayerServer.pcs[ PCKey( player ) ] do wait() end
	return PlayerServer.pcs[ PCKey( player ) ]			
end


-- can return nil
function Monsters:GetPCData( player )
	return PlayerServer.pcs[ PCKey( player ) ]
end


local monstersForHeroT = {}


function Monsters:CharacterAddedWait( character, player, timeSinceLevelStart )
	DebugXL:Assert( self == Monsters )
--	CharacterXL:CharacterAdded( character )
--	--print("Waiting to load character "..character.Name.." appearance" )

	local humanoid = character.Humanoid
	
	player.StarterGear:ClearAllChildren()
	player.Backpack:ClearAllChildren()
--	warn( "Clearing "..player.Name.."'s backpack" )
	
	-- not sure why we need this before AppearanceLoadedWait
--	local monstersT = PossessionData:GetDataAOfFlavor( PossessionData.FlavorEnum.Monster )
--	local monsterDatum = PossessionData.dataT.Orc
	local monsterClass = CharacterClientI:GetCharacterClass( player )
--	local monsterClass = MathXL:RandomKey( legalMonsterClassesSet )
	DebugXL:Assert( monsterClass ~= "" ) 
	local monsterDatum = CharacterClasses.monsterStats[ monsterClass ]
	DebugXL:Assert( monsterDatum )

	local forceField = InstanceXL.new( "ForceField", { Parent = character, Name = "ForceField" } )
	if not monsterDatum.invulnerableB then	
		game.Debris:AddItem( forceField, 2 )
	end
	

	
	-- if they outnumber us 3 to 1 we want them to not be next level
	-- if it's one on one we want thpem to be level 3 to our level 1
	
	-- so chance of being next level = 1 - ( ratio - 1 ) / 2
--	local upgradeLevel = 0
--	if #game.Teams.Heroes:GetPlayers() >= 1 then
--		local monsterRatio = #game.Teams.Monsters:GetPlayers() / #game.Teams.Heroes:GetPlayers()
--		local chanceOfNextLevel = 1 - ( monsterRatio - 1 ) / 2
--		if MathXL:RandomNumber() < chanceOfNextLevel then upgradeLevel = 1 end
--	end
	
	-- say you have a level 2, level 10, and level 15 player in the same level
	-- you can't just have a bunch of monsters around level 11
	-- you need some level 2, some level 10, and some level 15 monsters
	-- maybe then with adjustments
	-- so:
	local monsterLevel = 1
	local heroes = game.Teams.Heroes:GetPlayers()
	if #heroes >= 1 then
		if monsterDatum.tagsT.Superboss or monsterDatum.tagsT.Boss then
			monsterLevel = MonsterServer.determineBossSpawnLevel( monsterDatum )
		else
			monsterLevel = MonsterServer.determineMonsterSpawnLevel( player )
		end	
	end

	-- give the monster weapons in a bit; we need to adjust their starting levels
	local pcData = Monster.new( monsterClass,
		{},
		monsterLevel )

	Monsters:Initialize( character, player, pcData:getWalkSpeed(), monsterDatum, monsterLevel )


	PlayerServer.pcs[ PCKey( player ) ] = pcData

	-- starting gear
	local startingItems = CharacterClasses.startingItems[ monsterClass ]
	if startingItems then
		for _, weapon in pairs( startingItems ) do
			GiveWeapon( character, player, weapon )
		end
	end
		
	local potentialWeaponsA = TableXL:OneLevelCopy( monsterDatum.potentialWeaponsA )
	for i = 1, monsterDatum.numWeaponsN do
		GiveUniqueWeapon( character, player, potentialWeaponsA )
	end
	
	--actually giving monsters armor was a bad idea:  it makes bigger slower weapons OP, makes your damage bubbles look smaller, better to just
	--increase their hit points
	if monsterClass == "Werewolf" then
		local inventory = Inventory:GetWait( player )
		local hideAccessoriesB = inventory and inventory.settingsT.monstersT[ monsterClass ].hideAccessoriesB
		pcData:giveRandomArmor( hideAccessoriesB )
	end
	
	-- make sure you don't just have a one-shot weapon
	
	if pcData:countTools() == 1 then  -- one for armor, one for the possible one shot
		if pcData.gearPool:get("item1").baseDataS == "Bomb" then
			GiveUniqueWeapon( character, player, potentialWeaponsA )			
		end
	end

	-- it's possible player has left or reset or whatever by the time they get here
	if not humanoid.Parent then 
		warn( "Aborting Monsters:CharacterAddedWait due to missing humanoid")
		return pcData  -- avoiding crashes
	end

	if monsterDatum.ghostifyB then
		Ghost:Ghostify( character )
	end
	if monsterDatum.auraColor3 then
		require( game.ServerStorage.CharacterFX.AuraGlow ):Activate( character, MathXL.hugeish, monsterDatum.auraColor3 )
	end
	if monsterDatum.colorify3 then
		CostumesServer:Colorify( character, monsterDatum.colorify3 )
	end
	CostumesServer:Scale( character, monsterDatum.scaleN )
			
	workspace.Signals.HotbarRE:FireClient( player, "Refresh", pcData )
	-- it's possible that by the time we get here the character will have been tapped to be changed to a hero in which case
	-- its class will be gone.  Bail if that happens.  Todo: rewrite game and player loops so they're sequential
	if Monsters:GetClass( character )=="" then 
		warn( "Aborting Monsters:CharacterAddedWait due to missing class")
		return pcData
	end
--	--print( "Estimating damage for "..character.Name.." of class "..monsterClass.." "..(toolForXPPurposes and toolForXPPurposes.Name or "no tool" ) )
	local totalDamageEstimate = 0
	pcData.gearPool:forEach( function( possession ) 
		if ToolData.dataT[ possession.baseDataS ].damageNs then
			local damageN1, damageN2 = unpack( FlexEquipUtility:GetDamageNs( possession, 1, 1 ) )
			local average = ( damageN1 + damageN2 ) / 2
			totalDamageEstimate = totalDamageEstimate + average
		end
	end )
	totalDamageEstimate = totalDamageEstimate / pcData:countTools()
	local damageBonusN = monsterDatum.baseDamageBonusN + monsterLevel * 0.15 -- monsterDatum.damageBonusPerLevelN  -- not using anymore to keep xp same after nerfing high level server monsters
	totalDamageEstimate = totalDamageEstimate + totalDamageEstimate * damageBonusN
	 
--	--print( "Estimate: "..damageEstimate )
	-- ( dividing by healthModifier quick and dirty way to make sure XP doesn't change when we adjust monster difficulty; want to keep those dials independent )
	-- ( actually...  do we?  If we're killing a lot of pukes we don't want to get as much exp as we would have if we were killing a lot of tougher creatures)
	local xp = humanoid.MaxHealth + pcData:getWalkSpeed() + totalDamageEstimate / damageModifierN
	xp = xp * BalanceData.heroXPMultiplierN
	
	InstanceXL.new( "NumberValue", { Name = "ExperienceReward", Value = xp, Parent = character }, true )
	
	DebugXL:Assert( type(monsterLevel)=="number" )
	GameAnalyticsServer.RecordDesignEvent( player, "Spawn:Monster:"..monsterClass, monsterLevel, 1, "level" )
	-- we keep the sounds in MonsterConfigurations because some monsters (ghost, dungeonlord) don't have models with
	-- sounds attached
	
	spawn( function()
		wait( math.random( 15, 45 ) )		
		while character.Parent do
			SoundXL:PlaySoundOnPart( game.ReplicatedStorage.MonsterConfigurations[ monsterClass ].Idle, 
				character.PrimaryPart )
			wait( math.random( 15, 45 ) )
		end
	end)
	return pcData
end


-- difference between this and MonsterUtility:GetClassWait is this doesn't wait
function Monsters:GetClass( monsterCharacter )
	DebugXL:Assert( self == Monsters )
	DebugXL:Assert( monsterCharacter:IsA("Model") )
	local player = game.Players:GetPlayerFromCharacter( monsterCharacter )
	-- it's possible for this to just fail ... maybe player leaves while character still referenced?
	if player then
		return CharacterClientI:GetCharacterClass( player )
	else
		return "DungeonLord"
	end
end

-- returns pair [ number, bool ]
function Monsters:CalculateDamageN( monsterClass, monsterLevelN, flexToolInst, postToAnalyticsB )
	local enemyData = CharacterClasses.monsterStats[ monsterClass ]
	if not enemyData then DebugXL:Error( "Couldn't find data for enemy "..monsterClass ) end
	local damage1, damage2 = unpack( FlexEquipUtility:GetDamageNs( flexToolInst, 1, 1 ))
	local damageBonusPerLevelN = enemyData.damageBonusPerLevelN
	if not damageBonusPerLevelN then
		damageBonusPerLevelN = monsterDefaultDamagePerLevelBonusN
	end
--	local damageBonusN = enemyData.baseDamageBonusN + monsterLevelN * damageBonusPerLevelN --enemyData.damageBonusPerLevelN 
--  3/25 - attempting to simplify, so monster levels are linear from 0, * instead of +
	local damageBonusN = enemyData.baseDamageBonusN * monsterLevelN * damageBonusPerLevelN --enemyData.damageBonusPerLevelN 

	local damageN = MathXL:RandomInteger( damage1, damage2 )
	local critB = MathXL:RandomNumber() < BalanceData.baseCritChance
	if( critB )then
		warn("critical")
		damageN = damage2 * 1.5
	end
	damageN = ( damageN + damageN * damageBonusN ) * damageModifierN 
	-- since heroes have armor and weapons have been balanced against armorless creatures to determine DPS, we make a small adjustment here
	-- to get weak fast weapons like the shortsword and claws a better chance to actually penetrate
	-- for example, if a club is doing 20 damage with a cooldown of 1
	-- we want a shortsword that does 10 damage with a cooldown of 0.5 to do more like 15
	-- 1 -> * 1, 0.75 -> * ~1.25, 0.5 -> * ~1.5, 0.25 -> * ~2...  
	-- so maybe divide by sqrt of cooldown:  
	-- 1       ,         * 1.15,         * 1.41,      -> * 2
	-- yep
	local freqModN = 1/ math.sqrt( ToolData.dataT[ flexToolInst.baseDataS ].cooldownN )
	damageN = math.ceil( damageN * freqModN )
	local damageReport = "Monster damage l"..monsterLevelN.." "..monsterClass.." l"..flexToolInst:getActualLevel().." "..flexToolInst.baseDataS..": "..damage1.."/"..damage2.." freqmod "..freqModN.."; bonus "..damageBonusN..": "..damageN 
--	--print( damageReport )
	if postToAnalyticsB then
		AnalyticsXL:ReportEvent( nil, "MonsterDamage", monsterClass, damageReport, damageN, true )
	end 
	return { damageN, critB }
end


-- unlike heroes, monsters have a generic damage bonus they apply to everything
-- function Monsters:DetermineDamageN( monsterCharacter, toolO )
-- 	DebugXL:Assert( self == Monsters )
-- 	local flexToolInst = FlexibleTools:GetToolInst( toolO )
-- 	return Monsters:DetermineFlexToolDamageN( monsterCharacter, flexToolInst )
-- end

-- returns { damageN, critB } pair
function Monsters:DetermineFlexToolDamageN( monsterCharacter, flexToolInst )
	DebugXL:Assert( self == Monsters )
	return Monsters:CalculateDamageN( Monsters:GetClass( monsterCharacter ), Monsters:GetLevelN( monsterCharacter ), flexToolInst )
end


function Monsters:GetLevelN( monster )
	local player = game.Players:GetPlayerFromCharacter( monster )
	if player then
		return PlayerServer.getLocalLevel( player )
	else
		return 1
	end
end


function Monsters:Died( player )
	local monster = player.Character
	--print( "Monster "..monster.Name.." died" )

	Inventory:AdjustCount( player, "MonsterDeaths", 1 )

	local monsterLevel = PlayerServer.getLocalLevel( player )
	
	-- drop item
	local monsterClass = Monsters:GetClass( monster )

	local monsterDatum = CharacterClasses.monsterStats[ monsterClass ]
	if not monsterDatum then
		DebugXL:Error( "Couldn't find monster "..monsterClass.." of player "..player.Name )
		return
	end
	local lastAttackingPlayer = CharacterUtility:GetLastAttackingPlayer( monster )
	local dropWhereV3 
	if( monster.PrimaryPart ) then
		dropWhereV3 = monster.PrimaryPart.Position 
	else
		--print( "Monster primary part not found" )
		if lastAttackingPlayer then
			if lastAttackingPlayer.Character then
				if lastAttackingPlayer.Character.PrimaryPart then
					dropWhereV3 = lastAttackingPlayer.Character.PrimaryPart.Position
				end
			end
		end
	end

	local lifetime = PlayerServer.recordCharacterDeath( player, player.Character )

	if monsterDatum.tagsT.Superboss then
		-- everybody gets credit & loot for the superboss but xp shared as usual
		for _, hero in pairs( game.Teams.Heroes:GetPlayers() ) do
			Inventory:AdjustCount( hero, "Kills"..monsterClass, 1 )
			Inventory:AdjustCount( player, "Stars", 20, "Kill", "Superboss" )
			Inventory:EarnRubies( player, 20, "Kill", "Superboss" )	
			-- GameAnalyticsServer.ServerEvent( {
			-- 	["category"] = "design",
			-- 	["event_id"] = "Kill:Shared:"..monsterClass 
			-- }, player )			
		end
		workspace.Standard.MessageGuiXL.MessageRE:FireAllClients( "SuperbossDefeated", { monsterDatum.readableNameS } )
		require( game.ServerStorage.GameManagementModule ):BeatSuperboss()
	else
		-- otherwise just the one who got the kill
		if lastAttackingPlayer then
			Inventory:AdjustCount( lastAttackingPlayer, "MonsterKills", 1 )
		end
	end
	-- give out loot even if we don't know who is responsible
	if lastAttackingPlayer then 
		Loot:MonsterDrop( monsterLevel, Monsters:GetClass( monster ), lastAttackingPlayer, dropWhereV3 )
	end
	--print( "Loot, if any, dropped" )
end


function Monsters:Initialize( monster, player, walkSpeedN, enemyData, level )
	DebugXL:Assert( self == Monsters )
	local AI

	-- wishlist, don't use Configurations, it's just one more object that might get unattached
--	InstanceXL.new( "Folder", { Parent = monster, Name = "Configurations" }, true )
--	InstanceXL.new( "NumberValue", { Parent = monster.Configurations, Name = "Level", Value = level }, true )
	PlayerServer.publishLevel( player, level, level )
	--local standardHealth = enemyData.baseHealthN + enemyData.baseHealthN * monsterHealthPerLevelN * level   -- monster hit points accrete faster than weapon damage accretes
	local standardHealth = enemyData.baseHealthN * monsterHealthPerLevelN * level   -- monster hit points accrete faster than weapon damage accretes

	monster.Humanoid.MaxHealth	= standardHealth 
		
	--local standardMana = enemyData.baseManaN + enemyData.manaPerLevelN * level
	
	-- monsters have effectively infinite mana (their spells cost 0) but we still need the fields so there
	-- are no edge cases
	InstanceXL.new( "NumberValue", { Parent = monster, Name = "ManaValue",    Value = 0 }, true )
	InstanceXL.new( "NumberValue", { Parent = monster, Name = "MaxManaValue", Value = 0 }, true )

	monster.Humanoid.WalkSpeed   = walkSpeedN
	
	monster.Humanoid.Health		= monster.Humanoid.MaxHealth
	
	for tag, _ in pairs( enemyData.tagsT ) do
		InstanceXL.new( "BoolValue", { Name = tag, Value = true, Parent = monster }, true )
	end	
	
	
	-- wait( 0.5 ) -- sometimes there's a delay in getting that teamcolor going
end

function Monsters:AdjustBuildPoints( player, amountN )
--  boost is only a hero thing now
--	if amountN > 0 then
--		if Inventory:GetCount( player, "Boost" )>0 then
--			amountN = amountN * 1.5
--		end
--	end
	player.BuildPoints.Value = player.BuildPoints.Value + amountN
end


function Monsters:DoDirectDamage( character, damage, targetHumanoid, damageTagsT, critB )
	DebugXL:Assert( self == Monsters )
	if targetHumanoid.Health > 0 then
--		--print( "Base damage: "..damage )
-- got messy
		local targetPC = targetHumanoid.Parent
		local targetPlayer = game.Players:GetPlayerFromCharacter( targetPC )

		-- while theoretically monsters only damage players this can throw an error because monsters can currently damage barriers
		if targetPlayer then		
			damage = CharacterClientI:DetermineDamageReduction( targetHumanoid.Parent, CharacterI:GetPCDataWait( targetPlayer ), damage, damageTagsT )
		end
--		--print( character.Name.." damage reduced to "..damage )
		targetHumanoid:TakeDamage( damage )
		require( game.ServerStorage.CharacterFX.HealthChange ):Activate( targetPC, -damage, critB )

		-- build points for damage done; promotes killstealing unfortunately but I didn't want the UI clutter
		-- for giving you stuff every hit, plus that would get you too much income, but I also don't want to give you points silently
		local player = game.Players:GetPlayerFromCharacter( character )
		if player then  -- it was somehow getting here from doing fire damage even though that checked; maybe there's a wait or yield between here and there
			MonsterServer.recordMonsterDamageDone( player, damage )
			if targetHumanoid.Health <= 0 then
				Monsters:AdjustBuildPoints( player, 30 )
				Inventory:AdjustCount( player, "Stars", 5, "Kill", "Hero" )
				Inventory:EarnRubies( player, 5, "Kill", "Hero" )
				Inventory:AdjustCount( player, "HeroKills", 1 )		
			end
		end
	end		
end


-- yes, this became a fucking mess
function Monsters:DoFlexToolDamage( character, flexTool, targetHumanoid )
	DebugXL:Assert( self == Monsters )
	if targetHumanoid.Health > 0 then
		local damageN, critB = unpack( Monsters:DetermineFlexToolDamageN( character, flexTool ) )
		local weaponTypeS = flexTool:getBaseData().equipType
		Monsters:DoDirectDamage( character, damageN, targetHumanoid, { [weaponTypeS]=true }, critB )
	end		
end


-- function Monsters:DoDamage( character, tool, targetHumanoid )
-- 	DebugXL:Assert( self == Monsters )
-- 	if targetHumanoid.Health > 0 then
-- 		local damageN = Monsters:DetermineDamageN( character, tool )
-- 		local weaponTypeS = FlexibleTools:GetToolBaseData( tool ).equipType
-- 		Monsters:DoDirectDamage( character, damageN, targetHumanoid, { [weaponTypeS]=true } )
-- 	end		
-- end


spawn( function()
	while wait(1) do
		for key, _ in pairs( PlayerServer.pcs ) do
			if not key.Parent then
				print( "Removing "..key.Name.." from PlayerServer.pcs" )
				PlayerServer.pcs[ key ] = nil
			end 
		end		
	end
end)


return Monsters
