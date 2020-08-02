
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local InstanceXL       = require( game.ReplicatedStorage.Standard.InstanceXL )
local MathXL           = require( game.ReplicatedStorage.Standard.MathXL )
local SoundXL          = require( game.ReplicatedStorage.Standard.SoundXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL )

local Ghost            = require( game.ServerStorage.GhostModule )
local Inventory        = require( game.ServerStorage.InventoryModule )

local BalanceData      = require( game.ReplicatedStorage.TS.BalanceDataTS ).BalanceData
local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )
local FlexEquipUtility  = require( game.ReplicatedStorage.Standard.FlexEquipUtility )

local AnalyticsXL      = require( game.ServerStorage.Standard.AnalyticsXL )
local CostumesServer   = require( game.ServerStorage.Standard.CostumesServer )
local GameAnalyticsServer = require( game.ServerStorage.Standard.GameAnalyticsServer )

local CharacterClasses = require( game.ReplicatedStorage.TS.CharacterClasses ).CharacterClasses
local FlexTool = require( game.ReplicatedStorage.TS.FlexToolTS ).FlexTool
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData
local Monster = require( game.ReplicatedStorage.TS.Monster ).Monster

local LootServer       = require( game.ServerStorage.TS.LootServer).LootServer
local MonsterServer = require( game.ServerStorage.TS.MonsterServer ).MonsterServer
local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer

-- for balance tuning:


-- after the calibrate-level-for-number-of-players-plus-time-plus-depth change I tried 1.25 / 0.3 but that seemed too easy so took it back to 1.5 / 0.4

local damageModifierN = BalanceData.monsterDamageMultiplierN   -- after the auto balancing change a level 4 skeleton was taking a lot of strikes to do in a level 1 warrior at 0.3

local monsterDefaultDamagePerLevelBonusN = MonsterServer.isHighLevelServer() and BalanceData.monsterDefaultDamagePerLevelBonusHighLevelServerN or BalanceData.monsterDefaultDamagePerLevelBonusN

-- 0.666 as of 9/3
-- tripled damage on 11/16 because I cut weapon level in third

monsterDefaultDamagePerLevelBonusN = monsterDefaultDamagePerLevelBonusN * 2

local Monsters = {}

--local playerCharactersT = {}

local function GiveWeapon( characterKey, flexToolPrototype )	
	local flexToolRaw = TableXL:DeepCopy( flexToolPrototype )
	local flexTool = FlexTool:objectify( flexToolRaw )
	flexTool.levelN = math.ceil( Monsters:GetLevelN( characterKey ) * BalanceData.monsterWeaponLevelMultiplierN )  -- made ceil to make sure no 0 level weapon
	PlayerServer.getCharacterRecord( characterKey ):giveFlexTool( flexTool )
end


local function GiveUniqueWeapon( characterKey, potentialWeaponsA )
	if #potentialWeaponsA == 0 then
		DebugXL:logE( LogArea.Items, PlayerServer.getName( characterKey ).." | "..PlayerServer.getCharacterRecord( characterKey ).idS.." has no potential weapons" )
	end
	local toolData        = TableXL:Map( potentialWeaponsA, function( weaponNameS ) return ToolData.dataT[ weaponNameS ] end )
	local dropLikelihoods = TableXL:Map( toolData, function( x ) return x.monsterStartGearBiasN end )
	if TableXL:GetN( dropLikelihoods ) == 0 then
		DebugXL:logE( LogArea.Items, PlayerServer.getName( characterKey ).." has no drop likelihoods" )
	end
	local toolN = MathXL:RandomBiasedInteger1toN( dropLikelihoods )
	local weaponTemplate = toolData[ toolN ]
	if not weaponTemplate then
		DebugXL:Dump( potentialWeaponsA )
		DebugXL:Dump( toolData )
		DebugXL:Dump( dropLikelihoods )
		DebugXL:Error( PlayerServer.getName( characterKey ).." weapon template nil.")
	end

	-- slot here is hotbar slot
	local _slotN = nil

	local characterRecord = PlayerServer.getCharacterRecord( characterKey )
	-- hack to keep werewolf alternate weapons out of hotbar slot
	if characterRecord.idS~="Werewolf" then
		_slotN = PlayerServer.getCharacterRecord( characterKey ):countTools() + 1
	end

	local flexToolInst = { baseDataS = weaponTemplate.idS,
		levelN = math.max( 1, math.floor( Monsters:GetLevelN( characterKey ) * BalanceData.monsterWeaponLevelMultiplierN ) ),
		enhancementsA = {},
		slotN = _slotN }
	local flexTool = FlexTool:objectify( flexToolInst )
	characterRecord:giveFlexTool( flexTool )

	TableXL:RemoveFirstElementFromA( potentialWeaponsA, weaponTemplate.idS )
	return flexToolInst
end


function Monsters:GetPCDataWait( characterKey )
	return PlayerServer.getCharacterRecordWait( characterKey )
end

local monstersForHeroT = {}


function Monsters:PlayerCharacterAddedWait( character, player )
	DebugXL:Assert( self == Monsters )
	print("Waiting to load character "..character.Name.." appearance" )

	player.StarterGear:ClearAllChildren()
	player.Backpack:ClearAllChildren()
--	warn( "Clearing "..player.Name.."'s backpack" )

	local monsterClass = PlayerServer.getClassChoice( player )

	local humanoid = character.Humanoid
	DebugXL:Assert( monsterClass ~= "NullClass" )
	
	local monsterDatum = CharacterClasses.monsterStats[ monsterClass ]
	DebugXL:Assert( monsterDatum )

	local forceField = InstanceXL.new( "ForceField", { Parent = character, Name = "ForceField" } )
	if not monsterDatum.invulnerableB then
		game.Debris:AddItem( forceField, 2 )
	end

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
	local characterRecord = Monster.new( monsterClass,
		{},
		monsterLevel )

	PlayerServer.publishLevel( player, monsterLevel, monsterLevel )
	local characterKey = PlayerServer.setCharacterRecordForPlayer( player, characterRecord )
	Monsters:Initialize( character, characterKey, characterRecord:getWalkSpeed(), monsterClass, false )

	-- todo: add werewolf mobs that can switch looks?
	if monsterClass == "Werewolf" then
		local inventory = Inventory:GetWait( player )
		local hideAccessoriesB = inventory and inventory.settingsT.monstersT[ monsterClass ].hideAccessoriesB
		characterRecord:giveRandomArmor( hideAccessoriesB )
	end

	-- it's possible player has left or reset or whatever by the time they get here
	if not humanoid.Parent then
		warn( "Aborting Monsters:PlayerCharacterAddedWait due to missing humanoid")
		return characterRecord, characterKey  -- avoiding crashes
	end

	workspace.Signals.HotbarRE:FireClient( player, "Refresh", characterRecord )
	-- it's possible that by the time we get here the character will have been tapped to be changed to a hero in which case
	-- its class will be gone.  Bail if that happens.  Todo: rewrite game and player loops so they're sequential
	if Monsters:GetClass( character )=="" then
		warn( "Aborting Monsters:PlayerCharacterAddedWait due to missing class")
		return characterRecord, characterKey
	end
--	
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
	return characterRecord, characterKey
end


function Monsters:GetClass( monsterCharacter )
	DebugXL:Assert( self == Monsters )
	DebugXL:Assert( monsterCharacter:IsA("Model") )
	DebugXL:Assert( monsterCharacter.Parent ~= nil )
	local characterRecord = PlayerServer.getCharacterRecordFromCharacter( monsterCharacter )
	return characterRecord.idS

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
-- 	local flexToolInst = FlexibleTools:GetFlexToolFromInstance( toolO )
-- 	return Monsters:DetermineFlexToolDamageN( monsterCharacter, flexToolInst )
-- end

-- returns { damageN, critB } pair
function Monsters:DetermineFlexToolDamageN( monsterCharacter, flexToolInst )
	DebugXL:Assert( self == Monsters )
	local characterKey = PlayerServer.getCharacterKeyFromCharacterModel( monsterCharacter )
	return Monsters:CalculateDamageN( Monsters:GetClass( monsterCharacter ), Monsters:GetLevelN( characterKey ), flexToolInst )
end


function Monsters:GetLevelN( characterKey )
	return PlayerServer.getLocalLevel( characterKey )
end


function Monsters:Died( monster )
	MonsterServer.died( monster )
	LootServer.checkMonsterDrop( monster )
end


function Monsters:Initialize( monsterCharacterModel, characterKey, walkSpeedN, monsterClass, isMob )
	DebugXL:Assert( self == Monsters )

	local monsterDatum = CharacterClasses.monsterStats[ monsterClass ]
	DebugXL:Assert( monsterDatum )
	-- wishlist, don't use Configurations, it's just one more object that might get unattached
--	InstanceXL.new( "Folder", { Parent = monster, Name = "Configurations" }, true )
--	InstanceXL.new( "NumberValue", { Parent = monster.Configurations, Name = "Level", Value = level }, true )

	local characterRecord = PlayerServer.getCharacterRecord( characterKey )
	local level = characterRecord:getActualLevel()
	--local standardHealth = enemyData.baseHealthN + enemyData.baseHealthN * monsterHealthPerLevelN * level   -- monster hit points accrete faster than weapon damage accretes
	local standardHealth = MonsterServer.calculateMaxHealth( monsterDatum, level, MonsterServer.isHighLevelServer()  )   -- monster hit points accrete faster than weapon damage accretes

	monsterCharacterModel.Humanoid.MaxHealth	= standardHealth

	--local standardMana = enemyData.baseManaN + enemyData.manaPerLevelN * level

	-- monsters have effectively infinite mana (their spells cost 0) but we still need the fields so there
	-- are no edge cases
	InstanceXL.new( "NumberValue", { Parent = monsterCharacterModel, Name = "ManaValue",    Value = 0 }, true )
	InstanceXL.new( "NumberValue", { Parent = monsterCharacterModel, Name = "MaxManaValue", Value = 0 }, true )

	monsterCharacterModel.Humanoid.WalkSpeed   = walkSpeedN

	monsterCharacterModel.Humanoid.Health		= monsterCharacterModel.Humanoid.MaxHealth

	for tag, _ in pairs( monsterDatum.tagsT ) do
		InstanceXL.new( "BoolValue", { Name = tag, Value = true, Parent = monsterCharacterModel }, true )
	end

	-- starting gear
	local startingItems = CharacterClasses.startingItems[ monsterClass ]
	if startingItems then
		for _, weapon in pairs( startingItems ) do
			GiveWeapon( characterKey, weapon )
		end
	end

	local potentialWeaponsA = TableXL:OneLevelCopy( monsterDatum.potentialWeaponsA )
	for i = 1, monsterDatum.numWeaponsN do
		GiveUniqueWeapon( characterKey, potentialWeaponsA )
	end

	-- make sure you don't just have a one-shot weapon
	if characterRecord:countTools() == 1 then  -- one for armor, one for the possible one shot
		if characterRecord.gearPool:get("item1").baseDataS == "Bomb" then
			GiveUniqueWeapon( characterKey, potentialWeaponsA )
		end
	end
	
	if monsterDatum.ghostifyB then
		Ghost:Ghostify( monsterCharacterModel )
	end
	if monsterDatum.auraColor3 then
		require( game.ServerStorage.CharacterFX.AuraGlow ):Activate( monsterCharacterModel, MathXL.hugeish, monsterDatum.auraColor3 )
	end
	if monsterDatum.colorify3 then
		CostumesServer:Colorify( monsterCharacterModel, monsterDatum.colorify3 )
	end
	CostumesServer:Scale( monsterCharacterModel, monsterDatum.scaleN )
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


function Monsters:DoDirectDamage( optionalDamagingPlayer, damage, targetHumanoid, damageTagsT, critB )
	DebugXL:Assert( self == Monsters )
	DebugXL:logD(LogArea.Combat, 'Monsters:DoDirectDamage('..( optionalDamagingPlayer and optionalDamagingPlayer.Name or 'null damaging player' )..
		','..damage..','..targetHumanoid:GetFullName()..')' )
	if targetHumanoid.Health > 0 then
		DebugXL:logV( LogArea.Combat, "Base damage: "..damage )
		
		local targetPC = targetHumanoid.Parent
		local targetPlayer = game.Players:GetPlayerFromCharacter( targetPC )

		-- while theoretically monsters only damage players this can throw an error because monsters can currently damage barriers
		if targetPlayer and targetPlayer.Parent then
			DebugXL:logV( LogArea.Combat, 'targetPlayer = '..targetPlayer.Name )
			local characterRecord = PlayerServer.getCharacterRecordFromPlayer( targetPlayer )
			DebugXL:Assert( characterRecord )  -- seriously, if the target player and their character is still around then there should be no way this can happen
			if characterRecord then
				damage = CharacterClientI:DetermineDamageReduction( targetHumanoid.Parent, characterRecord, damage, damageTagsT )
			end
		end
		DebugXL:logV( LogArea.Combat, targetHumanoid.Name..'humanoid:TakeDamage('..damage..')' )
		targetHumanoid:TakeDamage( damage )
		require( game.ServerStorage.Standard.HealthChange ):Activate( targetPC, -damage, critB )

		-- build points for damage done; promotes killstealing unfortunately but I didn't want the UI clutter
		-- for giving you stuff every hit, plus that would get you too much income, but I also don't want to give you points silently
		-- it's possible a mob or source of damage from a player who has left 
		if optionalDamagingPlayer then  -- it was somehow getting here from doing fire damage even though that checked; maybe there's a wait or yield between here and there
			MonsterServer.recordMonsterDamageDone( optionalDamagingPlayer, damage )
			if targetHumanoid.Health <= 0 then
				Monsters:AdjustBuildPoints( optionalDamagingPlayer, 30 )
				Inventory:AdjustCount( optionalDamagingPlayer, "Stars", 5, "Kill", "Hero" )
				Inventory:EarnRubies( optionalDamagingPlayer, 5, "Kill", "Hero" )
				Inventory:AdjustCount( optionalDamagingPlayer, "HeroKills", 1 )
			end
		end
	end
end

-- yes, this became a fucking mess
function Monsters:DoFlexToolDamage( character, flexTool, targetHumanoid )
	DebugXL:Assert( self == Monsters )
	DebugXL:logI(LogArea.Combat, 'Monsters:DoFlexToolDamage')
	if targetHumanoid.Health > 0 then
		local damageN, critB = unpack( Monsters:DetermineFlexToolDamageN( character, flexTool ) )
		local weaponTypeS = flexTool:getBaseData().equipType
		local optionalMonsterPlayer = game.Players:GetPlayerFromCharacter( character )
		Monsters:DoDirectDamage( optionalMonsterPlayer, damageN, targetHumanoid, { [weaponTypeS]=true }, critB )
	end
end

return Monsters
