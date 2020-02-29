print( script:GetFullName().." executed" )

local DebugXL          = require( game.ReplicatedStorage.Standard.DebugXL )
local MathXL           = require( game.ReplicatedStorage.Standard.MathXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL )

local CharacterI       = require( game.ServerStorage.CharacterI )
local FlexibleTools    = require( game.ServerStorage.Standard.FlexibleToolsModule )
local Inventory        = require( game.ServerStorage.InventoryModule )

local GameAnalyticsServer = require( game.ServerStorage.Standard.GameAnalyticsServer )
local Heroes           = require( game.ServerStorage.Standard.HeroesModule )

local BalanceData = require( game.ReplicatedStorage.TS.BalanceDataTS ).BalanceData
local CharacterClasses = require( game.ReplicatedStorage.TS.CharacterClasses ).CharacterClasses
local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )
local FlexEquipUtility = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local PossessionData = require( game.ReplicatedStorage.PossessionData )

local FlexTool = require( game.ReplicatedStorage.TS.FlexToolTS ).FlexTool
local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest
local Randomisher = require( game.ReplicatedStorage.TS.Randomisher ).Randomisher
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData

local GameplayTestService = require( game.ServerStorage.TS.GameplayTestService ).GameplayTestService
local HeroServer = require( game.ServerStorage.TS.HeroServer ).HeroServer
local MessageServer = require( game.ServerStorage.TS.MessageServer ).MessageServer
local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer
local RandomGear = require( game.ServerStorage.TS.RandomGear ).RandomGear

local itemDropRateModifierN  = BalanceData.itemDropRateModifierN -- 0.75
local healthPotionDropChance = BalanceData.healthPotionBaseDropChance -- 0.4
local magicPotionDropChance  = BalanceData.magicPotionBaseDropChance -- 0.2


local Loot = {}

local playerPotionRandomishers = {}
local playerLootRandomishers = {}


function Loot:Drop( targetLevel, player, deprecated, worldPosV3, _boostedB )
	DebugXL:Assert( self == Loot )

	local hero = CharacterI:GetPCDataWait( player )
		
	local playerLevel = hero:getActualLevel()

	local flexTool = RandomGear.ChooseRandomGearForPlayer( math.floor( playerLevel / 3 ), 
		math.floor( targetLevel / 3 ), 
		player,
		hero, 
		Inventory:BoostActive( player ),
		_boostedB )
		
	if not flexTool then
		return ""
	end

	local _destinationV3
	local _destinationPlayer
	if player and player.Team == game.Teams.Heroes then
--		--print( "Loot intended for "..player.Name )
		_destinationPlayer = player
	else
		warn( player.Name.." must have become monster before they got their loot" )
		return ""
	end
	
	DebugXL:Assert( flexTool.levelN >= 1 )
	local activeSkinsT = Inventory:GetActiveSkinsWait( _destinationPlayer ).hero 
	if player then
		workspace.Signals.LootDropRE:FireClient( player, "item", flexTool, activeSkinsT, worldPosV3 )

		Heroes:RecordTool( player, flexTool )
	end

	return "EnhanceLvl"..flexTool:getTotalEnhanceLevels()..":".."RelativeLvl"..(flexTool:getActualLevel()-playerLevel)
end


function Loot:CheckForPotionDrop( player, dropChance, potionIdS, worldPosV3 )
	DebugXL:Assert( self == Loot )

	if not player then return false end		
	if player.Team == game.Teams.Heroes then
		print( "Loot intended for "..player.Name )
	else
		warn( player.Name.." must have become monster before they got their loot" )
		return false
	end

	local pcData = Heroes:GetPCDataWait( player )
	
	local potionsN = pcData.gearPool:countIf( function( item ) return item.baseDataS == potionIdS end )
	
	-- chance of drop depends on ratio of monster level to your level
	-- we don't want to give a level 10 hero lots of potions for killing level 1 monsters
	-- and we also don't want players to stockpile, so we gradually reduce the chances of that over time

	-- there used to be a fairly gentle sqrt there, but stockpiling was a thing; inverse may be too harsh though, in particular that second potion 
	-- having a fifty percent lower chance than the first means you really should finish your potion before you kill a monster
	
	-- want a function that drops off sharply as monsters get too easy for you (you don't deserve potion for that) but is not extreme as 
	-- monsters get harder, asymptote out.
	
	local timeSinceLevelStart = workspace.GameManagement.LevelTimeElapsed.Value 
	local potionLikelihoodMulForLoitering = ( BalanceData.potionLoiteringHalfLifeN ) / ( BalanceData.potionLoiteringHalfLifeN + timeSinceLevelStart )
	
	-- same level vs same level: 1
	-- level 2 vs level 1 ( 8 vs 7 ): 1.13 	 
	-- level 3 vs level 1 ( 9 vs 7 ): 1.25
	-- level 4 vs level 1 ( 10 vs 7 ): 1.35
	-- level 8 vs level 1 ( 14 vs 7 ): 1.69
	-- level 15 vs level 1 ( 21 vs 7): 2.09
	-- level 1 vs level 2 ( 7 vs 8 ): 0.87
	local potionMulForStockpile = math.pow( 1 / ( potionsN + 1 ), BalanceData.potionDropGammaN ) 
	local potionDropChanceN = math.clamp( dropChance * potionLikelihoodMulForLoitering * potionMulForStockpile, 0, 0.6 )  
--	--print( "Potion calc: loitering: "..potionLikelihoodMulForLoitering.."; level "..monsterLevel.."/"..playerLevel..": "..potionLikelihoodForMonsterDifficulty.."; stockpile("..potionsN.."): "..potionMulForStockpile.."; total: "..potionDropChanceN )
	if not playerPotionRandomishers[ player ] then
		playerPotionRandomishers[ player ] = Randomisher.new( 11 )
	end

	local dieRoll = playerPotionRandomishers[ player ]:next0to1()

	if dieRoll <= potionDropChanceN then
		local _toolInstanceDatumT = FlexTool.new( potionIdS, 1, {} )
	
		DebugXL:Assert( player )
		Heroes:RecordTool( player, _toolInstanceDatumT )
		wait(1)  -- super kludgey way to make sure potions and gear drops don't 100% overlap		

		workspace.Signals.LootDropRE:FireClient( player, "item", _toolInstanceDatumT, {}, worldPosV3 )
		
		return true
	end
	return false
end


function Loot:ChestDrop( targetLevel, player, worldPosV3 )  -- opening player not currently used
	local lootB = false
	local odds = BalanceData.chestDropRateModifierN  -- / #game.Teams.Heroes:GetPlayers() -- don't need to cut the chest chance by # of players because everyone has to visit

	local eventStr = "ChestDrop:"  -- level 1

	local boostInPlay = false
	if Inventory:BoostActive( player ) then
		odds = odds * 2
		boostInPlay = true
		--print( "Loot drop odds doubled to "..odds )		
	end
	if not playerLootRandomishers[ player ] then
		playerLootRandomishers[ player ] = Randomisher.new( 7 )
	end
	local dieRoll = playerLootRandomishers[ player ]:next0to1()
	local lootEventStr = ""
	if dieRoll <= odds then
		lootB = true
		lootEventStr = Loot:Drop( targetLevel, player, false, worldPosV3, boostInPlay and ( dieRoll >= odds / 2 ) )		
		if lootEventStr ~= "" then
			if boostInPlay then
				eventStr = eventStr.."Boost:"
			else
				eventStr = eventStr.."NoBoost:"
			end
			eventStr = eventStr .. "Loot:" .. lootEventStr
			GameAnalyticsServer.RecordDesignEvent( player, eventStr )
		end
	end
	local potionB = Loot:CheckForPotionDrop( player, healthPotionDropChance, "Healing", worldPosV3 )
	if not potionB then
		potionB = Loot:CheckForPotionDrop( player, magicPotionDropChance, "Mana", worldPosV3)
	end
	if potionB then
		GameAnalyticsServer.RecordDesignEvent( player, "ChestDrop:Potion" )  -- possible to call two events
	end

	if not lootB and not potionB then
		--MessageServer.PostMessageByKey( player, "Empty", false )
		--a little gold as a consolation prize
		local hero = CharacterI:GetPCDataWait( player )
		local dieSize = math.ceil( hero:getActualLevel() / 3 ) -- 20 -> 1,7 + 0, 7 or 7.5 expected value. sounds ok 
		local gold = MathXL:RandomInteger(1,dieSize) + MathXL:RandomInteger(0,dieSize)  -- 0 in second die is intentional so it's possible to get only 1
		HeroServer.adjustGold( player, hero, gold, "Drop", "Chest" )
		workspace.Signals.LootDropRE:FireClient( player, "gold", gold, worldPosV3 )
		Heroes:SaveHeroesWait( player )		 			
--		GameAnalyticsServer.RecordDesignEvent( player, "ChestDrop:Empty" )
	end
end


function Loot:MonsterDrop( monsterLevel, monsterClassS, lastAttackingPlayer, worldPosV3 )
	local odds = CharacterClasses.monsterStats[ monsterClassS ].dropItemPctN * itemDropRateModifierN / #game.Teams.Heroes:GetPlayers()
--	--print( "Loot:MonsterDrop level "..monsterLevel.."; odds: "..odds )
	for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
		local boostInPlay = false
		if Inventory:BoostActive( player ) then
			odds = odds * 2
			boostInPlay = true
	--			--print( "Loot drop odds doubled to "..odds )
		end
		if not playerLootRandomishers[ player ] then
			playerLootRandomishers[ player ] = Randomisher.new( 7 )
		end
		local dieRoll = playerLootRandomishers[ player ]:next0to1()	
		if dieRoll <= odds then
			local averageLevel = ( monsterLevel + PlayerServer.getActualLevel( player ) ) / 2
--			--print( "Loot:MonsterDrop HIT: "..player.Name..": odds: "..odds.."; dieRoll: "..dieRoll )
			Loot:Drop( averageLevel, player, false, worldPosV3, boostInPlay and ( dieRoll >= odds / 2 ) )		
	--			return   -- 			
		else
--			--print( "Loot:MonsterDrop miss: "..player.Name..": odds: "..odds.."; dieRoll: "..dieRoll )
		end
	end

	-- if lastAttackingPlayer then
	-- 	-- you still might get a potion even if you get loot;  otherwise boost will diminish your chance of finding potions
	-- 	-- boost does not effect potion chance
	-- 	-- chance to drop affected by how many potions they already have (use 'em or lose 'em.  use 'em or don't get any more of 'em anyway)
	-- 	if Loot:CheckForPotionDrop( lastAttackingPlayer, monsterLevel, healthPotionDropChance, "Healing", worldPosV3 ) then return end
	-- 	Loot:CheckForPotionDrop( lastAttackingPlayer, monsterLevel, magicPotionDropChance, "Mana", worldPosV3 )
	-- end
end
	
game.Players.PlayerRemoving:Connect( function()
	wait(2)
	for k, _ in pairs( playerLootRandomishers ) do
		if not k.Parent then
			playerLootRandomishers[ k ] = nil
		end
	end
	for k, _ in pairs( playerPotionRandomishers ) do
		if not k.Parent then
			playerLootRandomishers[ k ] = nil
		end
	end 
end )

return Loot

