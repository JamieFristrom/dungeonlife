local DebugXL           = require( game.ReplicatedStorage.Standard.DebugXL )
local TableXL           = require( game.ReplicatedStorage.Standard.TableXL )

local PossessionData    = require( game.ReplicatedStorage.PossessionData )

local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest


local InventoryUtility = {}


function InventoryUtility:MakeCrateDeck( crate )
	local crateDeck = {}
	for _, card in pairs( crate.Items ) do
		for i = 1, 6 - PossessionData.dataT[ card.idS ].rarityN do		
			table.insert( crateDeck, card )
		end
	end
	return crateDeck
end


function InventoryUtility:CalculateCrateProbabilities( crate )
	local crateDeck = InventoryUtility:MakeCrateDeck( crate )
	local totalCards = TableXL:GetN( crateDeck )
	local cardCountA = { 0, 0, 0, 0, 0 }
	
	for _, card in pairs( crateDeck ) do
		cardCountA[ PossessionData.dataT[ card.idS ].rarityN ] = cardCountA[ PossessionData.dataT[ card.idS ].rarityN ] + 1 
	end
	
	local probabilityA = {}
	for i = 1, 5 do
		probabilityA[ i ] = cardCountA[ i ] / totalCards
	end
	
	return probabilityA
end


function InventoryUtility:IsInTutorial( playerInventory )
	return InventoryUtility:GetTutorialLevel( playerInventory ) <= 1
end


function InventoryUtility:GetTutorialLevel( playerInventory )
	DebugXL:Assert( playerInventory.itemsT )
	DebugXL:Assert( playerInventory.itemsT.Tutorial )	
	return playerInventory.itemsT.Tutorial and playerInventory.itemsT.Tutorial or 0
end


function InventoryUtility:GetCount( playerInventory, itemS )
	return playerInventory.itemsT[ itemS ] and playerInventory.itemsT[ itemS ] or 0
end

return InventoryUtility
