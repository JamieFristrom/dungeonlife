--[[
	
	FlexibleTools
	
	This allows us to create a variety of custom tools on the fly, starting with a base tool and adjusting it.
	They'll have new tooltip names like "Level 5 Masterwork Broadsword of Ice", we'll be able to swap out different tools
	and effects depending on what kind of damage they do and a player's Secrets, and they'll have various parameters
	like how much ice damage they do etc.
	
	This is fundamentally done by having a token in the tool referring to a data entry in a table. 
	This table is on the server, so for information that a client needs about the tool it has to be put into the tool
	itself when the tool object is created; while that means duplication of data it also increases encapsulation of the tool code.
	 
	* We still need to copy that data into the player character's persistent inventory... 
	** or maybe we have a saved data store of tools; that seems like good database design even though it also seems unwieldy
	** (every entry would be its own key so the write requests wouldn't get throttled)
	** need to provide guids for the weapons in that case
	** still seems extreme since there'll be thousands of base swords in there --that will never get deleted--
	
	And trying to keep the implementation private because I'm not at all sure I'm going to make the right choice here.
	
	Making sure that guids or keys of the sort are internal
	
--]]
print( script:GetFullName().." executed" )
	

local DebugXL           = require( game.ReplicatedStorage.Standard.DebugXL )
local FlexEquipUtility  = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local MathXL		    = require( game.ReplicatedStorage.Standard.MathXL )
local TableXL           = require( game.ReplicatedStorage.Standard.TableXL )
local ToolXL            = require( game.ReplicatedStorage.Standard.ToolXL )
print( 'FlexibleToolsModule: ReplicatedStorage.Standard imports succesful')

local CharacterI        = require( game.ServerStorage.CharacterI )
local Inventory         = require( game.ServerStorage.InventoryModule )
local MechanicalEffects = require( game.ServerStorage.Standard.MechanicalEffects )
print( 'FlexibleToolsModule: ServerStorage imports succesful')

local Enhancements = require( game.ReplicatedStorage.TS.EnhancementsTS ).Enhancements
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData
print( 'FlexibleToolsModule: ReplicatedStorage imports succesful')

local FlexibleToolsServer = require( game.ServerStorage.TS.FlexibleToolsServer ).FlexibleToolsServer
print( 'FlexibleToolsModule: ServerStorage.TS imports succesful')

local FlexibleTools = {}

-- toolT instance base data includes:
---- level
---- possessiondata record
---- enhancements
----- enhancements are an array of effect and some number of stats, probably just one. +25 Ice Damage might look like {"IceDamage", bonusN = 25}
----- and 10 damage / 5 seconds Poison might look like {"Poison", bonusN = 10, durationN = 5} 
---- (I don't think secrets are going to be bound to an individual weapon. They'll either be on or off. If they're on,
----  the Get...() functions below need to return the appropriately adjusted thing. But we want this to be a layer *under*
----  playercharacter. So SecretsModule will have to be its own thing.)
-- so toolT schema:
--  { 
--    baseDataS = ...,
--    levelN = ...,  
--    enhancementsA = { { flavorS = ..., bonusS = ... }, 
--                      { flavorS = ..., effectStrengthN = ... }, 
--                      ... 
--                    }
--  }



--------------------------------------------------------------------------------------------------------------------
-- Local Functions
--------------------------------------------------------------------------------------------------------------------
-- parallels enhancement flavor table in FlexToolsUtility:
-- note.  lua math.log() defaults to natural log, not log 10

-- be careful with the damage mul func
-- it gets multiplied by the base damage
-- so you'll have nonlinear effects if you scale it by level
FlexibleTools.enhancementFlavorsT =
{
	fire     = 
	{ --typeS = "damage", prefixS = "Flaming", suffixS = "Fire", 
		mechanicalEffect = MechanicalEffects.DamageOverTime, 
		cosmeticEffect = game.ServerStorage.CharacterFX.Burn,
	}, 
	cold     = 
	{ --typeS = "damage", prefixS = "Cold", suffixS = "Ice",
		mechanicalEffect = MechanicalEffects.Slow, 
		cosmeticEffect = game.ServerStorage.CharacterFX.Frost, 
	},  -- duration
	radiant  = 
	{ -- typeS = "damage", prefixS = "Radiant", suffixS = "Radiance", 
		mechanicalEffect = MechanicalEffects.DamageInstant, 
		cosmeticEffect = game.ServerStorage.CharacterFX.RadiantBurst,
	},
--	haste = {
--		mechanicalEffect = MechanicalEffects.Accelerate,
--		cosmeticEffect   = game.ServerStorage.CharacterFX.Trail,
--	}

	explosive = {-- typeS  = "special", prefixS = "Explosive", suffixS = nil, 
		mechanicalEffect = MechanicalEffects.Explosion,
		cosmeticEffect   = nil,  -- mechanical effect also handles cosmetic
	},
	-- lifesteal,
	-- regeneration,
	-- vorpal (crit likely) / savage

	str      = { 
	},
	dex      = { 
	},
	con      = { 
	},
	will     = {
	},
	health   = { typeS = "derivedStat", prefixS = "Healthy", suffixS = "Health" },
	mana     = { typeS = "derivedStat", prefixS = "Spiritual", suffixS = "Mana" }--]]
}

FlexibleTools.enhancementFlavorsA = {}
for key, element in pairs( FlexibleTools.enhancementFlavorsT ) do
	element.keyS = key
	table.insert( FlexibleTools.enhancementFlavorsA, element )
end

--------------------------------------------------------------------------------------------------------------------
-- Local Functions
--------------------------------------------------------------------------------------------------------------------


--------------------------------------------------------------------------------------------------------------------
-- Flexible Tool Functions
--------------------------------------------------------------------------------------------------------------------
-- gets instance data
function FlexibleTools:GetToolInst( toolObj )  -- fixme, this was a terrible name. Should be called GetFlexTool, it doesn't return a Tool instance
	return FlexibleToolsServer.getFlexTool( toolObj )
end

function FlexibleTools:GetToolInstFromId( toolObj )
	return FlexibleToolsServer.getFlexToolFromId( toolObj )
end

function FlexibleTools:GetToolBaseData( toolObj )
	return FlexibleToolsServer.getToolBaseData( toolObj )
end

function FlexibleTools:GetFlexToolBaseData( flexToolInst )
	return FlexibleToolsServer.getFlexToolBaseData( flexToolInst )
end

function FlexibleTools:GetToolLevelRequirement( toolO )
	return FlexibleTools:GetToolInst( toolO ):getLevelRequirement()
end

-- destination can be a player or it can be a point in the world
-- if point in the world the format is { parentO = parent, positionV3 = position } 
function FlexibleTools:CreateTool( params )

	DebugXL:Assert( self == FlexibleTools )
	return FlexibleToolsServer.createTool( params )
	--[[
	local toolInstanceDatumT = params.toolInstanceDatumT
	local destinationPlayer  = params.destinationPlayer
	local destinationV3      = params.destinationV3
	local activeSkinsT       = params.activeSkinsT
	local _possessionsKey     = params.possessionsKey
	
--	--print( "Creating "..toolInstanceDatumT.baseDataS.." for "..destinationPlayer.Name )
	
	local toolId = ServeToolId()
	FlexibleToolsServer.setFlexToolInst( toolId, { flexToolInst = toolInstanceDatumT, player = destinationPlayer, possessionsKey = _possessionsKey } )
	
	-- if tool doesn't have enhancements add an empty array so we don't have to constantly check if enhancementsA is nil
	if not toolInstanceDatumT.enhancementsA then toolInstanceDatumT.enhancementsA = {} end
	
	local toolBaseDatum = ToolData.dataT[ toolInstanceDatumT.baseDataS ]
	if not toolBaseDatum then DebugXL:Error( "Unable to find possession "..toolInstanceDatumT.baseDataS ) end
	
	local baseToolS = toolBaseDatum.baseToolS
	local textureSwapId 
	if not toolBaseDatum.skinType then
		DebugXL:Error( toolBaseDatum.idS .. " has no skinType" )
	else
		if activeSkinsT[ toolBaseDatum.skinType ] then
			local reskin = PossessionData.dataT[ activeSkinsT[ toolBaseDatum.skinType ] ]
			if reskin then
				baseToolS = reskin.baseToolS
				textureSwapId = reskin.textureSwapId
			end
		end
	end
	
	local newToolInstance = game.ServerStorage.Tools[ baseToolS ]:Clone()
	FlexTool:retexture( newToolInstance, textureSwapId )
	
	local nonDefaultFX = false
	for i, enhancement in ipairs( toolInstanceDatumT.enhancementsA ) do
--		local enhancementFlavorDatum = FlexibleTools.enhancementFlavorsT[ enhancement.flavorS ]
--		if i%2 == 1 or not enhancementFlavorDatum.suffixS then
--			baseNameS = enhancementFlavorDatum.prefixS .. " " .. baseNameS
--		else
--			if i <= 2 then
--				baseNameS = baseNameS .. " of " .. enhancementFlavorDatum.suffixS
--			else
--				baseNameS = baseNameS .. " and " .. enhancementFlavorDatum.suffixS
--			end
--		end
		
		for _, descendant in pairs( newToolInstance:GetDescendants() ) do
			if descendant.Name == "FX"..enhancement.flavorS then
				if descendant:IsA("Script") then
					descendant.Disabled = false
				else
					descendant.Enabled = true
					nonDefaultFX = true
				end
			end
		end				
	end
	
	if nonDefaultFX then
		-- remove default effects
		for _, descendant in pairs( newToolInstance:GetDescendants() ) do
			if descendant.Name == "FXdefault" then
				descendant.Enabled = false
			end
		end			
	end

	newToolInstance.CanBeDropped = false
	
	-- attach tool id to tool 
	InstanceXL.new( "NumberValue", { Name="ToolId", Parent=newToolInstance, Value=toolId } )
	-- attach inventory slot so we can find it on the client
	InstanceXL.new( "StringValue", { Name="PossessionKey", Parent=newToolInstance, Value=_possessionsKey })
	
	-- we'll need to be able to adjust these for heroes with buffs
	InstanceXL.new( "NumberValue", { Name="Range", Parent=newToolInstance, Value=FlexibleTools:GetToolRangeN( newToolInstance ) } )
	InstanceXL.new( "NumberValue", { Name="Cooldown", Parent=newToolInstance, Value=FlexibleTools:GetCooldownN( newToolInstance ) } )
	InstanceXL.new( "NumberValue", { Name="ManaCost", Parent=newToolInstance, Value=FlexibleTools:GetManaCostN( newToolInstance ) } )
	InstanceXL.new( "NumberValue", { Name="WalkSpeedMul", Parent=newToolInstance, Value=toolBaseDatum.walkSpeedMulN } )
	
	if destinationPlayer then
--		local toolA  = newToolInstance
--		toolA.Parent = destinationPlayer:WaitForChild("StarterGear")

		-- we're using Roblox's backpack as a holding space for tools to combat lag; if we equip a weapon that exists on
		-- the server
-- 		if destinationPlayer.Character then
-- 			local humanoid = destinationPlayer.Character:FindFirstChild("Humanoid")
-- 			if humanoid then
-- 				humanoid:UnequipTools()
-- 				-- for _, tool in pairs( destinationPlayer.Character:GetChildren()) do
-- 				-- 	if tool:IsA("Tool") then
-- 				-- 		tool:Destroy()
-- 				-- 	end
-- 				-- end
-- 				-- wait()
							
-- --				humanoid:EquipTool( newToolInstance )
-- 	--			--print( "Tool equipped" )
-- 			end 
-- 		end
		newToolInstance.Parent = destinationPlayer.Backpack
		--		newToolInstance:Clone().Parent = destinationPlayer:WaitForChild("StarterGear")
	else
		DebugXL:Error("Need to specify a destination or player")
	end
	
	return newToolInstance
	--]]
end


function FlexibleTools:RemoveToolWait( player, tool )
	local toolId = tool.ToolId.Value
	local toolServerData = FlexibleToolsServer.getFlexToolAccessor( toolId )
	DebugXL:Assert( player == toolServerData.player )
	
	local pcData = CharacterI:GetPCDataWait( player )
	-- possible the player has been killed since we threw a bomb, so check first:
	if pcData then
		DebugXL:Assert( pcData.gearPool:get( toolServerData.possessionsKey ) == toolServerData.flexToolInst )		
		pcData.gearPool:delete( toolServerData.possessionsKey )
	else
		warn( "Couldn't find pcData for "..player.Name )
	end
	
	tool:Destroy()		
			
	-- refresh client:			
	if player.Team == game.Teams.Heroes then
		require( game.ServerStorage.Standard.HeroesModule ):SaveHeroesWait( player )		
	else
		DebugXL:Assert( pcData )
		workspace.Signals.HotbarRE:FireClient( player, "Refresh", pcData )
	end
end


-- we may want to be more data driven about this where the Roblox world tools in backpacks and
-- on the ground is just the view to the internal document, but for now...
function FlexibleTools:GetToolInstanceDatum( toolObject )
	DebugXL:Assert( self == FlexibleTools )
	local toolId = toolObject.ToolId.Value
	return FlexibleToolsServer.getFlexToolAccessor( toolId ).flexToolInst
end

---------------------------------------------------------------------------------------------------------------------------------
-- Functions to get data out of tool. Useful for when a player swings a sword, etc.
---------------------------------------------------------------------------------------------------------------------------------
-- this returns the base data from the possession record; stats have not been adjusted for level. that's done functionally on the fly
function FlexibleTools:GetWeaponTypeS( toolObj ) 
	DebugXL:Assert( self == FlexibleTools )
	return FlexibleTools:GetToolBaseData( toolObj ).equipType
end


function FlexibleTools:GetDamageNs( toolObj, actualLevel, maxLevel )
	DebugXL:Assert( self == FlexibleTools )
	local flexToolInst     = FlexibleTools:GetToolInst( toolObj )
	return FlexEquipUtility:GetDamageNs( flexToolInst, actualLevel, maxLevel )

end


-- returns entire array of enhancements
function FlexibleTools:GetEnhancements( toolObj ) 
	DebugXL:Assert( self == FlexibleTools )
	return FlexibleTools:GetToolInst( toolObj ).enhancementsA or {}
end


function FlexibleTools:GetExplosiveEnhancementIdx( toolObj )
	DebugXL:Assert( self == FlexibleTools )
	local enhancementsA = FlexibleTools:GetEnhancements( toolObj )
	local explosiveEnhancement = TableXL:FindWhere( enhancementsA, function( v ) return v.flavorS == "explosive" end )
	if explosiveEnhancement then
		local explosiveEnhanceIdx = TableXL:FindFirstElementIdxInA( enhancementsA, explosiveEnhancement )
		return explosiveEnhanceIdx
	end
	return nil
end


function FlexibleTools:CreateExplosionIfNecessary( toolObj, positionV3 )
	DebugXL:Assert( self == FlexibleTools )
	
	-- temp error suppression; this probably means the player put their crossbow away immediately after firing
	if not toolObj:FindFirstChild("ToolId") then return end
		
	local explosiveEnhancementIdx = FlexibleTools:GetExplosiveEnhancementIdx( toolObj )
	
	local owningPlayer = ToolXL:GetOwningPlayer( toolObj )
	if owningPlayer then
		if explosiveEnhancementIdx then
			local pcData = CharacterI:GetPCDataWait( owningPlayer )
			local actualLevel = pcData:getActualLevel()
			local localLevel = pcData:getLocalLevel()
	
			MechanicalEffects.Explosion( positionV3,  
				FlexibleTools:GetEnhancementDamage( FlexibleTools:GetToolInst( toolObj ), explosiveEnhancementIdx, actualLevel, localLevel ),
				Enhancements.enhancementFlavorInfos.explosive.radiusFunc( FlexibleTools:GetToolInst( toolObj ):getLocalLevel( actualLevel, localLevel ) ),
				ToolXL:GetOwningPlayer( toolObj ) )
		end
	end
end


function FlexibleTools:GetDamageEnhancements( toolObj )	
	DebugXL:Assert( self == FlexibleTools )
--	--print( "GetDamageEnhancements toolObj ", toolObj:GetFullName() )
	local allEnhancementsA = FlexibleTools:GetEnhancements( toolObj )
--	DebugX.Dump( allEnhancementsA )
	return TableXL:FindAllInAWhere( allEnhancementsA, 
		function(enhancement) 
			return Enhancements.enhancementFlavorInfos[ enhancement.flavorS ].typeS == "damage" 
		end )
end


function FlexibleTools:GetAdjToolStat( toolObj, statName )
	DebugXL:Assert( self == FlexibleTools )
	local toolBaseData = FlexibleTools:GetToolBaseData( toolObj )
	local adjStat = toolBaseData[statName]
	return adjStat
end

function FlexibleTools:GetAdjFlexToolStat( flexToolInst, statName )
	DebugXL:Assert( self == FlexibleTools )
	local toolBaseData = FlexibleTools:GetFlexToolBaseData( flexToolInst )
	local adjStat = toolBaseData[statName]
	return adjStat
end


--------------------------------------------------------------------------------------------------------------------
-- Function to create random tools
--------------------------------------------------------------------------------------------------------------------
function FlexibleTools:AddEnhancement( toolInstanceDatum, enhancementKeyS )
	DebugXL:Assert( self == FlexibleTools )
	
	local toolPossessionDatum = ToolData.dataT[ toolInstanceDatum.baseDataS ]
	-- being locked down by a melee weapon is no fun, might as well be instant kill. actually same goes for a ranged
	-- weapon
	if enhancementKeyS == "explosive" and ( toolInstanceDatum.baseDataS == "Bomb" or toolInstanceDatum.baseDataS == "MagicBarrier" ) then return end
	
	-- if enhancement already there then level it up
	for _, enhancement in pairs( toolInstanceDatum.enhancementsA ) do
		if enhancement.flavorS == enhancementKeyS then
			enhancement.levelN = enhancement.levelN + 1
			return
		end
	end
	
	-- otherwise it's new
	local newEnhancement = {}
	newEnhancement.flavorS = enhancementKeyS
	newEnhancement.levelN = 1

	table.insert( toolInstanceDatum.enhancementsA, newEnhancement )
end

function FlexibleTools:AddRandomEnhancements( toolInstanceDatum, boostB )	
	DebugXL:Assert( self == FlexibleTools )

	local equipData = ToolData.dataT[ toolInstanceDatum.baseDataS ]
	if equipData.equipType == "potion" or equipData.equipType == "power" then return end

	local numEnhancements = 0
		
	
	-- realized later if we don't adjust the diecap you can get some higher powered loot than you should at low
	-- levels... a level 3 sword is more likely to have 2 enchantments than just 1
	local dieCap
	local toolLevelN = toolInstanceDatum:getActualLevel()
	if toolLevelN > 4 then
		dieCap = 15
	elseif toolLevelN > 3 then
		dieCap = 14
	elseif toolLevelN > 2 then
		dieCap = 12
	elseif toolLevelN > 1 then
		dieCap = 9
	else
		dieCap = 5  -- theoretically nothing
	end
	 
	local enhancementDieRoll = MathXL:RandomInteger( 1, dieCap )
	if enhancementDieRoll >= 15 then    -- rolled a 14
		numEnhancements = 4
	elseif enhancementDieRoll >= 13 then      -- rolled a 13 or 14
		numEnhancements = 3
	elseif enhancementDieRoll >= 10 then  -- rolled a 10, or 11, 12
		numEnhancements = 2
	elseif enhancementDieRoll >= 6 then  -- rolled a 6, 7, or 8 or 9
		numEnhancements = 1
	else
		numEnhancements = 0             -- rolled a 1,2,3 or 4, 5
	end
	
	local boostedEnhancementsN = numEnhancements
	if boostB then
		if MathXL:RandomNumber()<0.5 then
			if numEnhancements < 4 then
				boostedEnhancementsN = numEnhancements + 1
			end
		end
	end
	
	local finalEnhancements = math.min( boostedEnhancementsN, toolInstanceDatum:getActualLevel() - 1 )
	if finalEnhancements > numEnhancements then
		toolInstanceDatum.boostedB = true
	end
	toolInstanceDatum.levelN = toolInstanceDatum.levelN - finalEnhancements
	DebugXL:Assert( toolInstanceDatum.levelN >= 1)
	local validEnhancements = TableXL:FindAllInTWhere( Enhancements.enhancementFlavorInfos, function( _, enhance )
		return enhance.allowedTypesT[ equipData.equipType ]
	end )
	
	for i=1,numEnhancements do
		if #toolInstanceDatum.enhancementsA==0 or MathXL:RandomNumber() < 0.5 then
			local newEnhancement = MathXL:RandomKey( validEnhancements )		
			FlexibleTools:AddEnhancement( toolInstanceDatum, newEnhancement )
		else
			-- 50% chance of secondary enhancements bolstering original ones. 
			local newEnhancementIdx = MathXL:RandomInteger( 1, #toolInstanceDatum.enhancementsA )
			local newEnhancement = toolInstanceDatum.enhancementsA[ newEnhancementIdx ].flavorS
			FlexibleTools:AddEnhancement( toolInstanceDatum, newEnhancement )			
		end
	end
end 

--
--function FlexibleTools:GetEffectDuration( toolInst, enhancementInfo )
--	local durationN = enhancementInfo.durationFunc( toolInst.levelN )
--	return durationN
--end


-- wishlist fix, using index instead of passing the enhancement itself made sense (don't want some other tools' enhancement)
-- but is easy to mess up, off by one errors and filtering doesn't work and suchlike
-- pls fix next time you're working on this function
function FlexibleTools:GetEnhancementDamage( toolInst, enhancementIdx, actualLevel, maxLevel )
	DebugXL:Assert( maxLevel )
	local damage1, damage2 = unpack( FlexEquipUtility:GetDamageNs( toolInst, actualLevel, maxLevel ) )
	print( "Base damage "..damage1.."-"..damage2.." for enhancement damage calc" )
	local damageAvg = ( damage1 + damage2 ) / 2
	local enhancement = toolInst.enhancementsA[ enhancementIdx ]
	local enhancementUtilityInfo = Enhancements.enhancementFlavorInfos[ enhancement.flavorS ]
	-- note this is level of enhancement, not tool
	local localEnhanceLvl = toolInst:getEnhanceLocalLevel( enhancementIdx-1 ) --, heroActualLevel )  -- adjust index for ts
	local result = enhancementUtilityInfo.damageMulFunc( localEnhanceLvl ) * damageAvg
	print( "Result damage: "..result )
	return result
end


function FlexibleTools:ResolveFlexToolEffects( toolInstanceDatum, targetHumanoid, owningPlayer )
	local pcData = CharacterI:GetPCDataWait( owningPlayer )
	local actualLevel = pcData:getActualLevel()
	local localLevel = pcData:getLocalLevel()
	
	for i, enhancement in ipairs( toolInstanceDatum.enhancementsA ) do
		if Enhancements.enhancementFlavorInfos[ enhancement.flavorS ].typeS == "damage" then 
	--		--print( "Damage enhancement: ", enhancement.flavorS.." "..enhancement.dps )
			local character = targetHumanoid.Parent 
			local enhancementUtilityInfo = Enhancements.enhancementFlavorInfos[ enhancement.flavorS ]
			if not enhancementUtilityInfo.exclusiveTag or character:FindFirstChild( enhancementUtilityInfo.exclusiveTag ) then

				local durationN = enhancementUtilityInfo.durationFunc( enhancement.levelN )
				
				local effect = 0
				if enhancementUtilityInfo.damageMulFunc then
					effect = FlexibleTools:GetEnhancementDamage( toolInstanceDatum, i, actualLevel, localLevel )
				elseif enhancementUtilityInfo.effectFunc then
					effect = enhancementUtilityInfo.effectFunc( enhancement.levelN )
				end
				
				FlexibleTools.enhancementFlavorsT[ enhancement.flavorS ].mechanicalEffect( 
					targetHumanoid, 
					durationN, 
					effect, 
					owningPlayer )
				local cosmeticEffect = FlexibleTools.enhancementFlavorsT[ enhancement.flavorS ].cosmeticEffect
				local targetChar = targetHumanoid.Parent
				if targetChar.PrimaryPart then
					require( cosmeticEffect ):Activate( targetChar, durationN )
				end
			end
		end	
	end
end

function FlexibleTools:ResolveEffects( tool, targetHumanoid, owningPlayer )
	--print( "Determining damage enhancements. tool is ", tool:GetFullName() )	
	-- just damage enhancements; skip explosive, stat buffs 
	local toolInstanceDatum = FlexibleTools:GetToolInst( tool )
	--DebugX.Dump( enhancements )
	return FlexibleTools:ResolveFlexToolEffects( toolInstanceDatum, targetHumanoid, owningPlayer )	
end

-- recreate tool;  used when reskinned
			
function RecreateToolIfNecessary( tool, player, _activeSkinsT )
	local toolBaseData = FlexibleTools:GetToolBaseData( tool )
	local toolSkinType = toolBaseData.skinType
	local activeSkin = _activeSkinsT[ toolSkinType ]
	local _possessionsKey = FlexibleToolsServer.getFlexToolAccessor( tool.ToolId.Value ).possessionsKey
	DebugXL:Assert( FlexibleToolsServer.getFlexToolAccessor( tool.ToolId.Value ).player == player )
	-- oh look, I can use local functions to avoid the hassle of passing parameters
	local function RecreateTool()
		local _toolInstanceDatum = FlexibleTools:GetToolInstanceDatum( tool )
		if tool.Parent:IsA("Model") then
			if tool.Parent:FindFirstChild("Humanoid") then
				tool.Parent.Humanoid:UnequipTools()
			end
		end
		tool:Destroy()
		-- puts in your backpack and that's fine 
		FlexibleTools:CreateTool( {
			toolInstanceDatumT = _toolInstanceDatum,
			destinationPlayer  = player,
			activeSkinsT       = _activeSkinsT,
			possessionsKey     = _possessionsKey
		} )
	end
	
	if activeSkin then
		if activeSkin ~= tool.Name then  -- not the right tool for the job?
			RecreateTool()
		end
	else
		-- no active skin;  tool should revert to default if it's not already
		if tool.Name ~= toolBaseData.baseToolS then
			-- recreate tool
			RecreateTool()
		end
	end
end


function FlexibleTools:ReskinTools( player )
	-- check if any of player's weapons need reskinning
	local skinOwnerS = "monster"
	if player.Team == game.Teams.Heroes then
		skinOwnerS = "hero"
	end
	local allActiveSkinsT = Inventory:GetActiveSkinsWait( player )
	local _activeSkinsT = allActiveSkinsT[ skinOwnerS ]

	local heldTool = player.Character:FindFirstChildWhichIsA("Tool")
	if heldTool then
		RecreateToolIfNecessary( heldTool, player, _activeSkinsT )
	end

	for _, backpacktool in pairs( player.Backpack:GetChildren()) do
		RecreateToolIfNecessary( backpacktool, player, _activeSkinsT )
	end
end


return FlexibleTools
