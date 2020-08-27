
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local CheatUtilityXL    = require( game.ReplicatedStorage.TS.CheatUtility )
local InputXL           = require( game.ReplicatedStorage.Standard.InputXL )
local TableXL           = require( game.ReplicatedStorage.Standard.TableXL )

local DeveloperProducts = require( game.ReplicatedStorage.DeveloperProducts )
local InventoryClient   = require( game.ReplicatedStorage.InventoryClient )
DebugXL:logD(LogArea.Required, "StoreMain succesfully required InventoryClient")

local InventoryUtility  = require( game.ReplicatedStorage.InventoryUtility )
local PossessionData    = require( game.ReplicatedStorage.PossessionData )

--local GameAnalyticsClient = require( game.ReplicatedStorage.Standard.GameAnalyticsClient )

local AnalyticsClient = require( game.ReplicatedStorage.TS.AnalyticsClient ).AnalyticsClient
local PCClient = require( game.ReplicatedStorage.TS.PCClient ).PCClient
local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize
local MessageGui = require( game.ReplicatedStorage.TS.MessageGui ).MessageGui

local LocalPlayer = game:GetService("Players").LocalPlayer
local Gui = script.Parent.Parent

local Tabs = Gui:WaitForChild("Main"):WaitForChild("Tabs"):GetChildren()

local heroesRE = workspace.Signals.HeroesRE


----------------------------------------------------------------------------------------------------h-----------------------
--  Inventory tracking
---------------------------------------------------------------------------------------------------------------------------



local function JumpTo( page )
	if page == Gui.Main.MainHeader.Rubies or page == Gui.Main.MainHeader.Boost or page == Gui.Main.MainHeader.VIP then --page == Gui.Main.MainHeader.HeroExpress or 
		Gui.Main.MainFooter.Info.Text = Localize.formatByKey( "StoreInfo"..page.Name )
	elseif page == Gui.Main.MainHeader.Gold then
		DebugXL:Assert( LocalPlayer.Team == game.Teams.Heroes )
		if( LocalPlayer.Team == game.Teams.Heroes )then
			if( PCClient.pc )then
				Gui.Main.MainFooter.Info.Text = Localize.formatByKey( "StoreInfoGold", { level = PCClient.pc:getActualLevel(), class = Localize.formatByKey( PCClient.pc:getClass() ) } )
			end
		end
	end
	-- if page == Gui.Main.MainHeader.Crates then
	-- 	Gui.Main.MainFooter.Info.Text = ""
	-- elseif page == Gui.Main.MainHeader.CrateItems then
	-- 	Gui.Main.MainFooter.Info.Text = ""
	-- elseif page == Gui.Main.MainHeader.Rubies then
	-- 	Gui.Main.MainFooter.Info.Text = "Can be used to buy crates"
	-- elseif page == Gui.Main.MainHeader.Boost then
	-- 	Gui.Main.MainFooter.Info.Text = "2x Experience Points! 3x Rubies! 2x Loot Drop Chance (doesn't include potions)! 50% Chance Loot Higher Level! 50% Chance Higher Loot Tier (unless already Legendary)!"
	-- elseif page == Gui.Main.MainHeader.HeroExpress then
	-- 	Gui.Main.MainFooter.Info.Text = "Become a hero right away! Could be dangerous if there are already higher level heroes or monsters than you about."
	-- end
	Gui.Main.MainHeader.UIPageLayout:JumpTo( page )
	AnalyticsClient.ReportEvent( "BrowseStore", page.Name )
--	GameAnalyticsClient.RecordDesignEvent( "BrowseStore:"..page.Name )
	for _, a in pairs( Tabs ) do
		if a:IsA("Frame") then
			if a.Name == page.Name then
				a.BackgroundColor3 = Color3.fromRGB(0, 255, 247)
				a.Button.TextColor3 = Color3.fromRGB(255, 255, 255)
			else
				a.BackgroundColor3 = Color3.fromRGB(141, 141, 141)
				a.Button.TextColor3 = Color3.fromRGB(0, 0, 0)
			end
		end
	end	
end

---------------------------------------------------------------------------------------------------------------------------
--  Crates
---------------------------------------------------------------------------------------------------------------------------
local buyButtonConnection

local SelectedCrate = "None"

local Crates = require( game.ReplicatedStorage.Standard.Crates )

local CrateItems = {}

local function hideCrateItemsFooter()
	for index, Obj in pairs( Gui.Main.MainFooter.CrateItems:GetChildren() ) do
		Obj.Visible = false
	end
	Gui.Main.MainFooter.Info.Text = ""	
end

local function registerCrate(cindex, crateData)
	CrateItems[cindex] = crateData['Items']
	local newButton = Gui.CrateTemplate:Clone()
	newButton.LayoutOrder = cindex
	newButton.Name = crateData['Name']
	newButton.ImageLabel.Image = crateData['Icon']
--	newButton.ImageLabel.ImageColor3 = Color3.fromRGB( 255, 0, 0 )
	newButton.Title.Text = Localize.formatByKey( crateData['Name'] )
	newButton.Price.Text = Localize.formatByKey( "RubyAmount", { crateData.Cost } )
	newButton.MainScript.Disabled = false
	newButton.Visible = true
	newButton.Parent = Gui.Main.MainHeader.Crates
	newButton.Button.MouseButton1Click:connect(function()
		for _, o in pairs(Gui.Main.MainHeader.CrateItems:GetChildren()) do
			if not o:IsA("UIGridLayout") then o:Destroy() end
		end
	
		local function registerPossession(index, itemData)
			local newButton = Gui.CrateTemplate:Clone()
			newButton.Visible = true
			newButton.LayoutOrder = index
			local possession = PossessionData.dataT[ itemData.idS ]
			newButton.Name = itemData.idS
			newButton.Title.Text = Localize.formatByKey( itemData.idS )
			newButton.ImageLabel.Image = possession.imageId
			newButton.Backing.ImageColor3 = PossessionData.raritiesT[ possession.rarityN ].color3
			newButton.Backing.Visible = true
			local count = InventoryClient:GetCount( itemData.idS )
			newButton.Price.Text = count > 0 and "x"..count or ""
			newButton.MainScript.Disabled = false
			CrateItems[cindex][index].Button = newButton
		end
		for k, v in ipairs( crateData.Items ) do registerPossession( k, v ) end		
		
		for index, item in pairs( CrateItems[cindex] ) do
			local n = item.Button:Clone()
			n.LayoutOrder = index
			if CheatUtilityXL:PlayerWhitelisted( game.Players.LocalPlayer ) then
				n:WaitForChild("Button").Selectable = true
				n.Button.MouseButton1Click:Connect( function()
					workspace.Signals.InventoryRE:FireServer( "StealPossession", n.Name )
				end)
			else
				n:WaitForChild("Button").Selectable = false
			end
			n.Parent = Gui.Main.MainHeader.CrateItems
		end
		for index, Obj in pairs(Gui.Main.MainFooter.CrateItems:GetChildren()) do
			Obj.Visible = true
		end
		
		local probabilitiesA = InventoryUtility:CalculateCrateProbabilities( crateData )
		for i = 1, 5 do
			local rarityStatFrame = Gui.Main.MainFooter.CrateItems.RarityStats["RarityStat"..i]
			rarityStatFrame.RarityIcon.ImageColor3 = PossessionData.raritiesT[ i ].color3
			rarityStatFrame.RarityName.Text = Localize.formatByKey( "Rarity"..i ) -- PossessionData.raritiesT[ i ].nameS..":"
			rarityStatFrame.Pct.Text = string.format( "%2.1f", probabilitiesA[ i ]*100 ).."%"
		end

		Gui.Main.MainFooter.CrateItems.Back.MouseButton1Click:connect(function()
			hideCrateItemsFooter()
			JumpTo( Gui.Main.MainHeader.Crates )
		end)

		JumpTo( Gui.Main.MainHeader.CrateItems )
		if InputXL:UsingGamepad() then
			game.GuiService.SelectedObject = Gui.Main.MainFooter.CrateItems.Buy
		end

		if InventoryClient.inventory.itemsT.Rubies >= crateData['Cost'] then 
			print("Wiring buy button")
			Gui.Main.MainFooter.Info.Text = Localize.formatByKey( "BuyToRandomlyUnlock", { crateData['Cost'] } )
			if buyButtonConnection then buyButtonConnection:Disconnect() end
			buyButtonConnection = Gui.Main.MainFooter.CrateItems.Buy.MouseButton1Click:connect(function()
				hideCrateItemsFooter()
				workspace.Signals.InventoryRE:FireServer( "BuyCrate", crateData.Name )
				JumpTo( Gui.Main.MainHeader.Crates )
			end)
			Gui.Main.MainFooter.CrateItems.Buy.Active = true
			Gui.Main.MainFooter.CrateItems.Buy.Selectable = true
		else
			Gui.Main.MainFooter.Info.Text = Localize.formatByKey( "NotEnoughMoney" )
			Gui.Main.MainFooter.CrateItems.Buy.Active = false
			Gui.Main.MainFooter.CrateItems.Buy.Selectable = false			
		end 		
		wait()
		Gui.Main.MainHeader.CrateItems.CanvasSize = UDim2.new( 0, 0, 0, Gui.Main.MainHeader.CrateItems.UIGridLayout.AbsoluteContentSize.Y )
	end)

end
for k, v in ipairs( Crates ) do
	if v.inStoreB then
		registerCrate( k, v ) 
	end
end


---------------------------------------------------------------------------------------------------------------------------
--  Developer produccts
---------------------------------------------------------------------------------------------------------------------------
local function PopulateRobloxProductWindow( productModuleName )
	local shopItemsA = TableXL:FindAllInAWhere( DeveloperProducts.productsA, function( product ) return product.flavor==productModuleName end )
	
	local function registerShopItem(index, itemData)
		local newButton = Gui.DeveloperProductTemplate:Clone()
		newButton.Visible     = true
		newButton.LayoutOrder = index
		newButton.Name        = itemData['Name']
		newButton.Title.Text  = Localize.getDeveloperProductName( itemData )  --  Localize.formatByKey( itemData['Name'] )
		newButton.Price.Text  = itemData['Price']
		if itemData.flavor == DeveloperProducts.FlavorEnum.Specials then
			newButton.Backing.ImageColor3 = PossessionData.raritiesT[ PossessionData.dataT[ itemData.inventoryKeyS ].rarityN ].color3
			newButton.ImageLabel.Image = PossessionData.dataT[ itemData.inventoryKeyS ].imageId  
			newButton.Backing.Visible = true
		else
			newButton.ImageLabel.Image = itemData['Icon']
			newButton.Backing.Visible = false
		end
		newButton.Button.MouseButton1Click:connect(function()
			if itemData.inventoryKeyS then
				if PossessionData.dataT[ itemData.inventoryKeyS ].purchaseCapN then
					if InventoryClient:GetCount( itemData.inventoryKeyS ) >= PossessionData.dataT[ itemData.inventoryKeyS ].purchaseCapN then
						MessageGui:PostMessage( Localize.formatByKey( "AllYouNeed" ), false )
						return
					end
				end
			end
			if itemData.infoType == Enum.InfoType.Product then
				if itemData.flavor == DeveloperProducts.FlavorEnum.Gold then
					-- using function so there won't be race condition
					-- passing the hero as the client sees it in here, so if the hero dies before the call happens
					-- we'll know who to call it with
					if PCClient.pc then
						heroesRE:FireServer( "PromptGoldBuy", PCClient.pc.slotN, itemData )
					else
						DebugXL:Error( "PC unavailable for gold buy")
					end
				else
					game:GetService("MarketplaceService"):PromptProductPurchase(LocalPlayer, itemData.ID )
				end
			else
				game:GetService("MarketplaceService"):PromptGamePassPurchase(LocalPlayer, itemData.ID )
			end
		end)
		newButton.MainScript.Disabled = false
		newButton.Parent = Gui.Main.MainHeader[ productModuleName ]
	end
	for k, v in pairs( shopItemsA ) do registerShopItem( k, v ) end
end

PopulateRobloxProductWindow( "Rubies" )
PopulateRobloxProductWindow( "Gold" )
PopulateRobloxProductWindow( "Boost" )
PopulateRobloxProductWindow( "Specials" )



---------------------------------------------------------------------------------------------------------------------------
--  Tabs
---------------------------------------------------------------------------------------------------------------------------

local function registerButton(index, Object)
	if Object:IsA("Frame") then
		Object.Button.MouseButton1Click:connect(function()
			hideCrateItemsFooter()
			JumpTo(Gui.Main.MainHeader:FindFirstChild(Object.Name))
			
		end)
	end
end
for k, v in pairs( Tabs ) do registerButton( k, v ) end


Gui.Main.MainHeader.UIPageLayout:JumpTo(Gui.Main.MainHeader.Crates)

Gui.Main.CloseButton.MouseButton1Click:Connect( function() 
	Gui.Main.Visible = false
end)



game:GetService("UserInputService").InputBegan:Connect( function( inputObject )
	if inputObject.UserInputType == Enum.UserInputType.Gamepad1 then
		if inputObject.KeyCode == Enum.KeyCode.ButtonB then
			Gui.Main.Visible = false
		end
	end
end)


local StoreMainRemote = {}

function StoreMainRemote.JumpTo( ... )
	JumpTo( ... )
end

Gui.StoreMainBE.Event:Connect( function( funcName, ... ) 
	StoreMainRemote[ funcName ]( ... )
end )

-- hook up VIP pass button
DebugXL:Assert( DeveloperProducts.productsA[ 1 ].Name == "Hero Express" )

-- This code should be within a 'LocalScript' object
local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
 
local vipTemplate = script.Parent.Parent:WaitForChild("Main"):WaitForChild("MainHeader"):WaitForChild("VIP"):WaitForChild("Template")

local vipPassID = 5185882  
 
-- Function to prompt purchase of the game pass
local function promptPurchase()
 
	local player = Players.LocalPlayer
	local hasPass = DeveloperProducts:UserOwnsGamePassWait( player, DeveloperProducts.vipPassId )

	if hasPass == true then
		MessageGui:PostMessage( "You already have the VIP pass! Thank you!" )
		-- LocalPlayer already owns the game pass; tell them somehow
	else
		-- LocalPlayer does NOT own the game pass; prompt them to purchase
		MarketplaceService:PromptGamePassPurchase(player, vipPassID)
	end
end

local vipPassInfo = MarketplaceService:GetProductInfo( vipPassID, Enum.InfoType.GamePass )

vipTemplate.Price.Text = vipPassInfo.PriceInRobux .. " R$"

vipTemplate.Button.MouseButton1Click:Connect( promptPurchase ) 


-- hook up hero express button
--[[
local heroExpressTemplate = script.Parent.Parent:WaitForChild("Main"):WaitForChild("MainHeader"):WaitForChild("HeroExpress"):WaitForChild("Template")

heroExpressTemplate.Button.MouseButton1Click:Connect( function() 
	if game.Players.LocalPlayer.Team ~= game.Teams.Heroes then
		local usedHeroExpressValueO = game.Players.LocalPlayer:FindFirstChild( "HeroExpressReady" )
		if #game.Players:GetPlayers()==1 or ( #game.Teams.Heroes:GetPlayers() + 1 <= #game.Teams.Monsters:GetPlayers() - 1 ) then
			game.Players.LocalPlayer.PlayerGui.StoreGui.Main.Visible = false
			game:GetService("MarketplaceService"):PromptProductPurchase( game.Players.LocalPlayer, DeveloperProducts.productsA[ 1 ].ID )
		else			
			MessageGui:PostMessage( "Too many heroes already" )
		end
	else
		MessageGui:PostMessage( "You're already the hero!" )
	end
end)
--]]