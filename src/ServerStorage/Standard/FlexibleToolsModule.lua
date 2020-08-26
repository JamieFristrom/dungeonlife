
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())
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
local FlexEquipUtility  = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local TableXL           = require( game.ReplicatedStorage.Standard.TableXL )
local ToolXL            = require( game.ReplicatedStorage.Standard.ToolXL )
print( 'FlexibleToolsModule: ReplicatedStorage.Standard imports succesful')

local CharacterI        = require( game.ServerStorage.CharacterI )
local MechanicalEffects = require( game.ServerStorage.Standard.MechanicalEffects )
print( 'FlexibleToolsModule: ServerStorage imports succesful')

local CharacterRecord = require( game.ReplicatedStorage.TS.CharacterRecord ).CharacterRecord
local Enhancements = require( game.ReplicatedStorage.TS.EnhancementsTS ).Enhancements
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
function FlexibleTools:GetFlexToolFromInstance( toolObj ) 
	return FlexibleToolsServer.getFlexTool( toolObj )
end

function FlexibleTools:GetToolBaseData( toolObj )
	return FlexibleToolsServer.getToolBaseData( toolObj )
end

function FlexibleTools:GetFlexToolBaseData( flexToolInst )
	return FlexibleToolsServer.getFlexToolBaseData( flexToolInst )
end

function FlexibleTools:GetToolLevelRequirement( toolO )
	return FlexibleTools:GetFlexToolFromInstance( toolO ):getLevelRequirement()
end

-- destination can be a player or it can be a point in the world
-- if point in the world the format is { parentO = parent, positionV3 = position } 
function FlexibleTools:CreateTool( params )

	DebugXL:Assert( self == FlexibleTools )
	return FlexibleToolsServer.createTool( params )
end


-- function FlexibleTools:RemoveToolWait( character, tool )
-- 	DebugXL:Assert( character:IsA("Model") )
-- 	local characterRecord = PlayerServer.getCharacterRecordFromCharacter( character )
-- 	characterRecord:removeTool( )
-- 	local toolServerData = FlexibleToolsServer.getFlexToolAccessor( tool )
-- 	DebugXL:Assert( player == toolServerData.player )
	
-- 	local pcData = CharacterI:GetPCDataWait( player )
-- 	-- possible the player has been killed since we threw a bomb, so check first:
-- 	if pcData then
-- 		DebugXL:Assert( pcData.gearPool:get( toolServerData.possessionsKey ) == toolServerData.flexToolInst )		
-- 		pcData.gearPool:delete( toolServerData.possessionsKey )
-- 	else
-- 		warn( "Couldn't find pcData for "..player.Name )
-- 	end
	
-- 	tool:Destroy()		
			
-- 	-- refresh client:			
-- 	if player.Team == game.Teams.Heroes then
-- 		require( game.ServerStorage.Standard.HeroesModule ):SaveHeroesWait( player )		
-- 	else
-- 		DebugXL:Assert( pcData )
-- 		workspace.Signals.HotbarRE:FireClient( player, "Refresh", pcData )
-- 	end
-- end


-- we may want to be more data driven about this where the Roblox world tools in backpacks and
-- on the ground is just the view to the internal document, but for now...
function FlexibleTools:GetToolInstanceDatum( toolObject )
	DebugXL:Assert( self == FlexibleTools )
	return FlexibleToolsServer.getFlexToolAccessor( toolObject ).flexToolInst
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
	local flexToolInst     = FlexibleTools:GetFlexToolFromInstance( toolObj )
	return FlexEquipUtility:GetDamageNs( flexToolInst, actualLevel, maxLevel )

end


-- returns entire array of enhancements
function FlexibleTools:GetEnhancements( toolObj ) 
	DebugXL:Assert( self == FlexibleTools )
	return FlexibleTools:GetFlexToolFromInstance( toolObj ).enhancementsA or {}
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
	
	local explosiveEnhancementIdx = FlexibleTools:GetExplosiveEnhancementIdx( toolObj )
	
	local owningPlayer = ToolXL:GetOwningPlayer( toolObj )
	if owningPlayer then
		if explosiveEnhancementIdx then
			local pcData = CharacterI:GetPCDataWait( owningPlayer )
			local actualLevel = pcData:getActualLevel()
			local localLevel = pcData:getLocalLevel()
	
			MechanicalEffects.Explosion( positionV3,  
				FlexibleTools:GetEnhancementDamage( FlexibleTools:GetFlexToolFromInstance( toolObj ), explosiveEnhancementIdx, actualLevel, localLevel ),
				Enhancements.enhancementFlavorInfos.explosive.radiusFunc( FlexibleTools:GetFlexToolFromInstance( toolObj ):getLocalLevel( actualLevel, localLevel ) ),
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


function FlexibleTools:ResolveFlexToolEffects( attackingCharacterRecord, toolInstanceDatum, targetHumanoid, tool )
	DebugXL:Assert( targetHumanoid:IsA("Humanoid"))
	DebugXL:Assert( not tool or tool:IsA("Tool"))
	
	local actualLevel = attackingCharacterRecord:getActualLevel()
	local localLevel = attackingCharacterRecord:getLocalLevel()
	
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
					tool )
				local cosmeticEffect = FlexibleTools.enhancementFlavorsT[ enhancement.flavorS ].cosmeticEffect
				local targetChar = targetHumanoid.Parent
				if targetChar.PrimaryPart then
					require( cosmeticEffect ):Activate( targetChar, durationN )
				end
			end
		end	
	end
end
		

return FlexibleTools
