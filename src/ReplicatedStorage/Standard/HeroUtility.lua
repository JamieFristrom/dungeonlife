--[[
	HeroUtility
	
	Utility functions for handling player character data
--]]
local DebugXL               = require( game.ReplicatedStorage.Standard.DebugXL )
local MathXL				= require( game.ReplicatedStorage.Standard.MathXL )
local TableXL               = require( game.ReplicatedStorage.Standard.TableXL )

local CharacterClientI      = require( game.ReplicatedStorage.CharacterClientI )
local FlexEquipUtility       = require( game.ReplicatedStorage.Standard.FlexEquipUtility )

local PossessionData	= require( game.ReplicatedStorage.PossessionData )

local Hero = require( game.ReplicatedStorage.TS.HeroTS ).Hero
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData

--local FlexTool = require( game.ReplicatedStorage.TS.FlexToolTS ).FlexTool

local HeroUtility = {}

----------------------------------------------------------------------------------------------------------------------------------
-- experience points
--
-- This code is hard to read; it is this way because I want to store one and only one value for character xp.
-- I don't want to keep a separate level stat, or stats for how much xp you've gotten on the way to your next level,
-- that is all computed functionally when needed.  Doing this to reduce possibility of duplication-of-data bugs.
----------------------------------------------------------------------------------------------------------------------------------

--HeroUtility.xpForLevelMultiplier = 1.5  -- moved to TS

--HeroUtility.levelCapN = 15  -- moved to TS

HeroUtility.statNamesT = 
{
	strN  = "Strong",
	dexN  = "Sharp",
	conN  = "Tough",
	willN = "Arcane",
	mana  = "Magic"
	-- and health equals health
}

-- we start you at position 3 on the fibonacci sequence so going from level 2 to 3 isn't twice the cost of going from level 1 to 2
-- see Dungeon Life bug list for elvel spreadsheet

function HeroUtility:StatPointsEarned( experienceN )
	DebugXL:Assert( self == HeroUtility )
	return 2 + Hero:levelForExperience( experienceN ) -- one stat point per level, so we can level up more
end


function HeroUtility:GetStatPointsSpent( hero )
	return ( hero.statsT.strN + hero.statsT.dexN + hero.statsT.willN + hero.statsT.conN - 42 )  -- not 45 because you virtually spent 3 at level 1
end


function HeroUtility:GetLevel( player )
	local xpValueObj = player.Character:FindFirstChild("Experience")
	--DebugXL:Assert( xpValueObj )
	if xpValueObj then 
		return Hero:levelForExperience( xpValueObj.Value )
	end
	return 1 
end


-- also used for armor, bad name
function HeroUtility:CanUseWeapon( pcData, flexTool )
	local weaponGood = false
	local statReqN, statName = FlexEquipUtility:GetStatRequirement( flexTool )
	local levelReqN = flexTool:getLevelRequirement()
	if not statReqN then
		weaponGood = true
	elseif levelReqN <= Hero:levelForExperience( pcData.statsT.experienceN ) then 
		weaponGood = true 
	else
		if not pcData.statsT[ statName ] then
			DebugXL:Error( "Weapon "..flexTool.baseDataS.." looking for stat "..statName )
		end
		-- by not passing our held weapon in here, you can't use a +strength weapon to equip a higher level weapon than required	
		-- and by ignoring the current equip slot you can't use your current item to help wear a higher level item	
		local adjBaseStatN = pcData:getActualAdjBaseStat( statName, flexTool.equipSlot )		
		--local adjBaseStatN = HeroUtility:GetAdjBaseStat( pcData, statName )
		if adjBaseStatN >= statReqN then 
			weaponGood = true
		end
	end
	return weaponGood
end


function HeroUtility:RecheckItemRequirements( pcData )
	local dirtyB = true
	while dirtyB do
		dirtyB = false
		pcData.gearPool:forEach( function( item, _ )
			if item.equippedB or item.slotN then
				if not HeroUtility:CanUseWeapon( pcData, item ) then
					item.equippedB = nil
					item.slotN = nil
					dirtyB = true
				end
			end 
		end )
	end
end



function HeroUtility:GetDamageBonus( pcData, typeS, weaponInst )
	DebugXL:Assert( self == HeroUtility )
	local keyStat 
	if typeS == "ranged" then
		keyStat = "dexN"
	elseif typeS == "melee" then
		keyStat = "strN"	
	elseif typeS == "spell" then
		keyStat = "willN"	
	else
		DebugXL:Error( "Invalid damage type "..typeS )
		return 0
	end
	local adjKeyStat = pcData:getAdjBaseStat( keyStat, weaponInst )	
	--local adjKeyStat = HeroUtility:GetAdjBaseStat( pcData, keyStat, weaponInst )
	return adjKeyStat * 0.005
end

--[[
-- returns nil if no advice, returns n+1 if it thinks you should make a new character
function HeroUtility:GetRecommendation( player, savedPlayerCharacters )
	-- difficulty tuned to players
	local pcLevelSum = 0
	local numPcChoices = 0 
	for _, _player in pairs( game.Teams.Heroes:GetPlayers() ) do
		if _player ~= player then
			if _player.leaderstats.Level.Value ~= "" then
				pcLevelSum = pcLevelSum + _player.leaderstats.Level.Value
				numPcChoices = numPcChoices + 1
			end
		end
	end
	if numPcChoices == 0 then return end
	local averageChosenLevel = pcLevelSum / numPcChoices
	
	local _, fitness, index = TableXL:FindBestFitMin( savedPlayerCharacters.heroesA, function( hero ) 
		return math.abs( Hero:levelForExperience( hero.statsT.experienceN ) - averageChosenLevel )
	end )
	-- or create a new charcter?
	-- for example
	-- character: 4, dungeon: 4 - fitness 0. 0 !> 3 Don't make a new character
	-- character: 3, dungeon: 4 - fitness 1. 1 !> 3 Don't make a new character
	-- character: 2, dungeon: 4 - fitness 2. 2 !> 3 Don't make a new character
	-- character: 1, dungeon: 4 - fitness 3. 3 !> 3 Don't make a new character
	-- character: 7, dungeon: 4 - fitness 3. 3 !> 3 Don't make a new character
	-- character: 8, dungeon: 4 - fitness 4. 4 > 3. Make a new character
	
	if fitness > averageChosenLevel - 1 then    -- best fit is far away, why not make a new level 1 character?
		index = #savedPlayerCharacters.heroesA + 1
	end
	return index
		
end
--]]

function HeroUtility:CountNonPotionGear( pcData )
	local gearN = pcData.gearPool:countIf( function( item ) return ToolData.dataT[ item.baseDataS ].equipType ~= "potion" end )
	return gearN
end


return HeroUtility
