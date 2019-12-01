--
-- Marketplace
--
-- Part of Jamie's new XL libraries
--
local DebugXL           = require( game.ReplicatedStorage.Standard.DebugXL )

local DataStoreXL       = require( game.ServerStorage.TS.DataStoreXLTS ).DataStoreXL

local GameManagement    = require( game.ServerStorage.GameManagementModule )
local Inventory         = require( game.ServerStorage.InventoryModule )
local GameAnalyticsServer = require( game.ServerStorage.Standard.GameAnalyticsServer )
local Heroes = require( game.ServerStorage.Standard.HeroesModule )

local DeveloperProducts = require( game.ReplicatedStorage.DeveloperProducts )

-- setup local variables
local MarketplaceService = game:GetService("MarketplaceService")

local dataStoreXL = DataStoreXL.new( "PurchaseHistory" )


local GA = require(153590792)	

--game.Players.PlayerAdded:connect(function()
--	--print("start")
--	local DeveloperProducts = game:GetService("MarketplaceService"):GetDeveloperProductsAsync():GetCurrentPage()
--	for _, DevProductContainer in pairs(DeveloperProducts) do
--	    for Field, Value in pairs(DevProductContainer) do
			--print(Field .. ": " .. Value)
--	    end
		--print(" ")
--	end
	--print("end")
--end)

-- define function that will be called when purchase finished
MarketplaceService.ProcessReceipt = function(receiptInfo) 

	--GA.ReportEvent( "ProcessReceipt", "PlayerId_"..receiptInfo.PlayerId, "PurchaseId_"..receiptInfo.PurchaseId, receiptInfo.ProductId )
	
	-- make sure we haven't already processed this one
	local playerProductKey = "p_" .. receiptInfo.PlayerId .. "_p_" .. receiptInfo.PurchaseId
	if dataStoreXL:GetAsync(playerProductKey) then
		--GA.ReportEvent( "DuplicateProcessReceipt", "PlayerId_"..receiptInfo.PlayerId, "PurchaseId_"..receiptInfo.PurchaseId, receiptInfo.ProductId )
		warn( "Attempting to process receipt second time" )
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end
	-- find the player based on the PlayerId in receiptInfo
	for i, player in ipairs(game.Players:GetChildren()) do
		if player.userId == receiptInfo.PlayerId then
			
			for _, product in pairs( DeveloperProducts.productsA ) do
				if product.ID == receiptInfo.ProductId then
					if product.flavor == DeveloperProducts.FlavorEnum.Rubies then
						GameAnalyticsServer.RecordTransaction( player, receiptInfo.CurrencySpent, "Currency:Rubies:"..product.amountN)
						Inventory:AdjustCount( player, "Rubies", product.amountN, "Buy", "Robux" )
					elseif product.flavor == DeveloperProducts.FlavorEnum.Gold then
						GameAnalyticsServer.RecordTransaction( player, receiptInfo.CurrencySpent, "Currency:Gold:"..product.amountN)
						local successB = Heroes:BuyGold( player, product.amountN, "Buy", "Robux")
						if not successB then
							return Enum.ProductPurchaseDecision.NotProcessedYet
						end
					elseif product.flavor == DeveloperProducts.FlavorEnum.Boost then
						GameAnalyticsServer.RecordTransaction( player, receiptInfo.CurrencySpent, "Currency:Boost:"..product.amountN)
						Inventory:AdjustCount( player, "Boost", product.amountN, "Buy", "Robux" )
					elseif product.flavor == DeveloperProducts.FlavorEnum.Expansions then
						GameAnalyticsServer.RecordTransaction( player, receiptInfo.CurrencySpent, product.inventoryKeyS..":"..product.amountN )
						Inventory:AdjustCount( player, product.inventoryKeyS, product.amountN, "Buy", "Robux" )
					elseif product.flavor == DeveloperProducts.FlavorEnum.Specials then
						GameAnalyticsServer.RecordTransaction( player, receiptInfo.CurrencySpent, product.inventoryKeyS..":"..product.amountN )
						Inventory:AdjustCount( player, product.inventoryKeyS, product.amountN, "Buy", "Robux" )
					elseif product.flavor == DeveloperProducts.FlavorEnum.HeroExpress then
						GameAnalyticsServer.RecordTransaction( player, receiptInfo.CurrencySpent, "HeroExpress:1" )
						GameManagement:HeroExpress( player )
					else						
						DebugXL:Error("Unknown product flavor")
					end
					Inventory:SaveWait( player )
					--GA.ReportEvent( "PurchaseProcessed", "PlayerId_"..receiptInfo.PlayerId, "PurchaseId_"..receiptInfo.PurchaseId, receiptInfo.ProductId )
	
					-- record the transaction in a Data Store
					dataStoreXL:IncrementAsync(playerProductKey, 1)	
					--GA.ReportEvent( "PurchaseRecorded", "PlayerId_"..receiptInfo.PlayerId, "PurchaseId_"..receiptInfo.PurchaseId, receiptInfo.ProductId )

					-- tell ROBLOX that we have successfully handled the transaction
					return Enum.ProductPurchaseDecision.PurchaseGranted		
				end
			end
		end
	end	
	--GA.ReportEvent( "PurchaseDenied", "PlayerId_"..receiptInfo.PlayerId, "PurchaseId_"..receiptInfo.PurchaseId, receiptInfo.ProductId )
	return Enum.ProductPurchaseDecision.NotProcessedYet
end

