
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local PossessionData = require( game.ReplicatedStorage.PossessionData )

local BalanceData    = require( game.ReplicatedStorage.TS.BalanceDataTS ).BalanceData
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData

local FlexEquipUtility = {}


-- returns value, statName  frex 15, "conN"
function FlexEquipUtility:GetStatRequirement( flexToolInst )
	return unpack( flexToolInst:getStatRequirement() )
end


function FlexEquipUtility:GetDamageNs( flexToolInst, heroActualLevel, currentMaxHeroLevel )
	local toolBaseData = ToolData.dataT[ flexToolInst.baseDataS ]
	local damageNs = toolBaseData.damageNs
	local damage1 = math.floor( damageNs[1] * ( ( flexToolInst:getLocalLevel( heroActualLevel, currentMaxHeroLevel ) - 1 ) * BalanceData.weaponDamagePerLevelN + 1 ) )
	local damage2 = math.ceil( damageNs[2] * ( ( flexToolInst:getLocalLevel( heroActualLevel, currentMaxHeroLevel ) - 1 ) * BalanceData.weaponDamagePerLevelN + 1 ) )
	return { damage1, damage2 }
end


function FlexEquipUtility:GetDefense( flexToolInst, attackType )
	local toolBaseData = ToolData.dataT[ flexToolInst.baseDataS ]
	if not toolBaseData then
		DebugXL:Error( "Couldn't find possession "..flexToolInst.baseDataS )
		return 0
	end
	
	local defenseN = toolBaseData.baseDefensesT[ attackType ]
	if not defenseN then
		DebugXL:Error( "Couldn't find defense for "..toolBaseData.idS.." for attack type "..attackType )
		return 0
	end
	defenseN = math.floor( defenseN + defenseN * BalanceData.armorDefensePerLevelN * ( flexToolInst.levelN - 1 ) )
	return defenseN 	
end


function FlexEquipUtility:GetImageId( flexToolInst, activeSkinsT )
	local baseData = ToolData.dataT[ flexToolInst.baseDataS ]
	if activeSkinsT[ baseData.skinType ] then
		return PossessionData.dataT[ activeSkinsT[ baseData.skinType ] ].imageId
	else
		return baseData.imageId
	end
end


function FlexEquipUtility:GetRarityColor3( flexToolInst )
	return flexToolInst:getRarityColor3()
end


function FlexEquipUtility:GetAdjStat( flexToolInst, statName )
	local baseData = ToolData.dataT[ flexToolInst.baseDataS ]
	local adjStat = baseData[statName]
	return adjStat
end


function FlexEquipUtility:GetManaCost( flexToolInst )
	return flexToolInst:getManaCost()
end


return FlexEquipUtility
