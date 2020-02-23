local DebugXL          = require( game.ReplicatedStorage.Standard.DebugXL )
local MathXL           = require( game.ReplicatedStorage.Standard.MathXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL )

local FlexibleTools    = require( game.ServerStorage.Standard.FlexibleToolsModule )
local Inventory        = require( game.ServerStorage.InventoryModule )

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )

local FlexTool = require( game.ReplicatedStorage.TS.FlexToolTS ).FlexTool
local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest
local Randomisher = require( game.ReplicatedStorage.TS.Randomisher ).Randomisher
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData


local RandomGear = {}

local playerLootLevelRandomishers = {}

function RandomGear.ChooseRandomGearForPlayer( minLevel, maxLevel, player, hero, useBoostB, alreadyBoostedB )
	if not playerLootLevelRandomishers[ player ] then
		playerLootLevelRandomishers[ player ] = Randomisher.new( 10 )
	end

	minLevel = math.max( 1, minLevel )
	-- from the loot drop math spreadsheet - B$2 * 0.8 + ( rand()^2 * ( min( $A3, B$2*2.5 ) + 1 - ( B$2 * 0.75)))
	local toolLevelN = minLevel + ( ( playerLootLevelRandomishers[ player ]:next0to1() )^2 * ( maxLevel - minLevel ) )
	toolLevelN = MathXL:Round( toolLevelN )
	
	if useBoostB then
		if MathXL:RandomNumber() < 0.5 then
			toolLevelN = toolLevelN + 1			
			alreadyBoostedB = true
		end
	end
	
	local dieRoll = MathXL:RandomNumber()
			
	-- 45% armor, 45% weapon, 10% power
	local useTypeS = dieRoll < 0.45 and "worn" or dieRoll < 0.9 and "held" or "power"

	local toolData = TableXL:FindAllInAWhere( ToolData.dataA, 
		function( x ) 
			return 
				x.equipType~="potion" and
				toolLevelN >= x.minLevelN and
				useTypeS == x.useTypeS
		end )

	-- distribute stuff more evenly by required stat
	local toolDatas = {}
	local statWeights = {}
	for _, v in pairs( { 'strN', 'dexN', 'conN', 'willN' } ) do
		toolDatas[v] = TableXL:FindAllInAWhere( toolData, function( x) return x.statReqS == v end )
		statWeights[v] = #toolDatas[v] > 0 and hero.statsT[v] or 0
	end			
	local statReqS = MathXL:RandomBiasedKey( statWeights ) 
	toolData = toolDatas[ statReqS ]
		
	DebugXL:Assert( #toolData > 0 )
	if #toolData <= 0 then 
		warn( player.Name.." no valid tool data for drop")
		return nil
	end

	local dropLikelihoods = TableXL:Map( toolData, function( x ) return x.dropLikelihoodN end )
	local toolN = MathXL:RandomBiasedInteger( dropLikelihoods )
	--print( "Dropping tool index "..toolN )
		
	local _toolInstanceDatumT = { baseDataS = toolData[ toolN ].idS, levelN = toolLevelN, enhancementsA = {}, boostedB = alreadyBoostedB }
	local flexTool = FlexTool:objectify( _toolInstanceDatumT )
	FlexibleTools:AddRandomEnhancements( flexTool, useBoostB )

	return flexTool
end

game.Players.PlayerRemoving:Connect( function()
	wait(2)
	for k, _ in pairs( playerLootLevelRandomishers ) do
		if not k.Parent then
			playerLootLevelRandomishers[ k ] = nil
		end
	end
end )

return RandomGear