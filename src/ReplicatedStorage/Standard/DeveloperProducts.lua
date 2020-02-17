local DebugXL     = require( game.ReplicatedStorage.Standard.DebugXL )

local AssetManifest = require( game.ReplicatedFirst.TS.AssetManifest ).AssetManifest

local DeveloperProducts = {}

DeveloperProducts.FlavorEnum = 
{
	Rubies       = "Rubies",
	Gold         = "Gold",
	Boost        = "Boost",
	HeroExpress  = "HeroExpress",
	Expansions   = "Expansions",
	Specials     = "Specials"
}

DeveloperProducts.vipPassId = 5185882

DeveloperProducts.productsA = 
{
	-- hero express assumed to be #1
	{
		Name = "Hero Express",
		Icon = AssetManifest.ImageCrossedSwords, 
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "HeroExpress",
		amountN = 1,
		infoType = Enum.InfoType.Product,
		ID = 355786697,
		--Price = "25 R$",
		flavor = DeveloperProducts.FlavorEnum.HeroExpress,		
	},	
	-- rubies
	{
		Name = "100\nRubies",
		Icon = AssetManifest.ImageCutGem,
		imageColor3 = Color3.new( 1, 0, 0 ),
		inventoryKeyS = "Rubies",
		amountN = 100,
		infoType = Enum.InfoType.Product,
		ID = 349666824,
		--Price = "10 R$",
		flavor = DeveloperProducts.FlavorEnum.Rubies,
	},
	{
		Name = "250\nRubies",
		Icon = AssetManifest.ImageCutGem,
		imageColor3 = Color3.new( 1, 0, 0 ),
		inventoryKeyS = "Rubies",
		amountN = 250,
		infoType = Enum.InfoType.Product,
		ID = 349666996,
		--Price = "25 R$",
		flavor = DeveloperProducts.FlavorEnum.Rubies,
	},
	{
		Name = "750\nRubies",
		Icon = AssetManifest.ImageCutGem,
		imageColor3 = Color3.new( 1, 0, 0 ),
		inventoryKeyS = "Rubies",
		amountN = 750,
		infoType = Enum.InfoType.Product,
		ID = 349667161,
		--Price = "70 R$",
		flavor = DeveloperProducts.FlavorEnum.Rubies,
	},
	{
		Name = "1500\nRubies",
		Icon = AssetManifest.ImageCutGem,
		imageColor3 = Color3.new( 1, 0, 0 ),
		inventoryKeyS = "Rubies",
		amountN = 1500,
		infoType = Enum.InfoType.Product,
		ID = 374349682,
		--Price = "130 R$",
		flavor = DeveloperProducts.FlavorEnum.Rubies,
	},	
	{
		Name = "3000\nRubies",
		Icon = AssetManifest.ImageCutGem,
		imageColor3 = Color3.new( 1, 0, 0 ),
		inventoryKeyS = "Rubies",
		amountN = 3000,
		infoType = Enum.InfoType.Product,
		ID = 384245941,
		--Price = "250 R$",
		flavor = DeveloperProducts.FlavorEnum.Rubies,
	},		
	{
		Name = "6000\nRubies",
		Icon = AssetManifest.ImageCutGem,
		imageColor3 = Color3.new( 1, 0, 0 ),
		inventoryKeyS = "Rubies",
		amountN = 6000,
		infoType = Enum.InfoType.Product,
		ID = 402604439,
		--Price = "490 R$",
		flavor = DeveloperProducts.FlavorEnum.Rubies,
	},	
	-- gold
	{
		Name = "20\nGold",
		Icon = "rbxassetid://2784376061",
		imageColor3 = Color3.new( 1, 0, 0 ),
		amountN = 20,
		infoType = Enum.InfoType.Product,
		ID = 458536726,
		--Price = "10 R$",
		flavor = DeveloperProducts.FlavorEnum.Gold,
	},
	{
		Name = "50\nGold",
		Icon = "rbxassetid://2784376061",
		imageColor3 = Color3.new( 1, 0, 0 ),
		amountN = 50,
		infoType = Enum.InfoType.Product,
		ID = 458536846,
		--Price = "25 R$",
		flavor = DeveloperProducts.FlavorEnum.Gold,
	},
	{
		Name = "150\nGold",
		Icon = "rbxassetid://2784376061",
		imageColor3 = Color3.new( 1, 0, 0 ),
		amountN = 150,
		infoType = Enum.InfoType.Product,
		ID = 458536940,
		--Price = "70 R$",
		flavor = DeveloperProducts.FlavorEnum.Gold,
	},
	{
		Name = "300\nGold",
		Icon = "rbxassetid://2784376061",
		imageColor3 = Color3.new( 1, 0, 0 ),
		amountN = 300,
		infoType = Enum.InfoType.Product,
		ID = 458537183,
		--Price = "130 R$",
		flavor = DeveloperProducts.FlavorEnum.Gold,
	},	
	{
		Name = "600\nGold",
		Icon = "rbxassetid://2784376061",
		imageColor3 = Color3.new( 1, 0, 0 ),
		amountN = 600,
		infoType = Enum.InfoType.Product,
		ID = 458537980,
		--Price = "250 R$",
		flavor = DeveloperProducts.FlavorEnum.Gold,
	},		
	{
		Name = "1200\nGold",
		Icon = "rbxassetid://2784376061",
		imageColor3 = Color3.new( 1, 0, 0 ),
		amountN = 1200,
		infoType = Enum.InfoType.Product,
		ID = 458538132,
		--Price = "490 R$",
		flavor = DeveloperProducts.FlavorEnum.Gold,
	},		
	-- boosts
	{
		Name = "15 Minutes Boost",
		Icon = "rbxassetid://1125572676",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "Boost",
		amountN = 15 * 60,
		infoType = Enum.InfoType.Product,
		ID = 352484457,
		--Price = "25 R$",
		flavor = DeveloperProducts.FlavorEnum.Boost,
	},
	{
		Name = "1 Hour Boost",
		Icon = "rbxassetid://1125572676",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "Boost",
		amountN = 60 * 60,
		infoType = Enum.InfoType.Product,
		ID = 352484751,
		--Price = "95 R$",
		flavor = DeveloperProducts.FlavorEnum.Boost,
	},
	{
		Name = "6 Hour Boost",
		Icon = "rbxassetid://1125572676",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "Boost",
		amountN = 6 * 60 * 60,
		infoType = Enum.InfoType.Product,
		ID = 352484995,
		--Price = "450 R$",
		flavor = DeveloperProducts.FlavorEnum.Boost,
	},
	{
		Name = "12 Hour Boost",
		Icon = "rbxassetid://1125572676",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "Boost",
		amountN = 12 * 60 * 60,
		infoType = Enum.InfoType.Product,
		ID = 411068884,
		--Price = "850 R$",
		flavor = DeveloperProducts.FlavorEnum.Boost,
	},
	{
		Name = "Permaboost",
		Icon = "rbxassetid://2619413619",
		imageColor3 = Color3.new( 1, 1, 1 ),
		infoType = Enum.InfoType.GamePass,
		inventoryKeyS = "Boost",
		ID = 5494145,
		--Price = "795 R$",
		flavor = DeveloperProducts.FlavorEnum.Boost,
	},
	{
		Name = "Five Gear Slots",
		Icon = AssetManifest.ImagePack,
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "GearSlots",
		amountN = 5,
		infoType = Enum.InfoType.Product,
		ID = 389128617,
		--Price = "35 R$",
		flavor = DeveloperProducts.FlavorEnum.Expansions,
	},
	{
		Name = "Fifteen Gear Slots",
		Icon = AssetManifest.ImagePack,
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "GearSlots",
		amountN = 15,
		infoType = Enum.InfoType.Product,
		ID = 411589384,
		--Price = "95 R$",
		flavor = DeveloperProducts.FlavorEnum.Expansions,
	},
	{
		Name = "Hero Slot",
		Icon = AssetManifest.ImagePack,
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "HeroSlots",
		amountN = 1,
		infoType = Enum.InfoType.Product,
		ID = 389426922,
		--Price = "195 R$",
		flavor = DeveloperProducts.FlavorEnum.Expansions,
	},
	-- special 1
	{
		Name = "Werewolf Den",
--		Icon = "rbxassetid://2121006288",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "SpawnWerewolf",
		amountN = 1,
		infoType = Enum.InfoType.Product,
		ID = 411421518,
		--Price = "250 R$",
		flavor = DeveloperProducts.FlavorEnum.Specials,
	},
--	{
--		Name = "Treasure Chest",
----		Icon = "rbxassetid://2121006288",
--		imageColor3 = Color3.new( 1, 1, 1 ),
--		inventoryKeyS = "Chest",
--		amountN = 1,
--		ID = 411421518,
--		Price = "125 R$",
--		flavor = DeveloperProducts.FlavorEnum.Specials,
--	},
	-- special 2
	{
		Name = "Trapped Chest",
--		Icon = "rbxassetid://2121006288",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "TrappedChest",
		amountN = 1,
		infoType = Enum.InfoType.Product,
		ID = 411423980,
		--Price = "125 R$",
		flavor = DeveloperProducts.FlavorEnum.Specials,
	},
	-- special 3
	{
		Name = "Darkage Ninja Bow Skin",
--		Icon = "rbxassetid://2121006288",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "BowDarkage",
		amountN = 1,
		infoType = Enum.InfoType.Product,
		ID = 411424128,
		--Price = "95 R$",
		flavor = DeveloperProducts.FlavorEnum.Specials,
	},		
	-- special 4
	{
		Name = "Pit Trap",
--		Icon = "rbxassetid://2121006288",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "PitTrap",
		amountN = 1,
		infoType = Enum.InfoType.Product,
		ID = 411424412,
		--Price = "125 R$",
		flavor = DeveloperProducts.FlavorEnum.Specials,
	},	
	-- special 5
	{
		Name = "Immaculate Mace Skin",
--		Icon = "rbxassetid://2121006288",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "MaceClean",
		amountN = 1,
		infoType = Enum.InfoType.Product,
		ID = 411424670,
		--Price = "45 R$",
		flavor = DeveloperProducts.FlavorEnum.Specials,
	},	
	-- special 6
	{
		Name = "Redcliff Elite Legs Skin",
--		Icon = "rbxassetid://2121006288",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "HeavyRedcliffLegs",
		amountN = 1,
		infoType = Enum.InfoType.Product,
		ID = 411424886,
		--Price = "250 R$",
		flavor = DeveloperProducts.FlavorEnum.Specials,
	},	
	-- special 7
	{
		Name = "Redcliff Elite Torso Skin",
--		Icon = "rbxassetid://2121006288",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "HeavyRedcliffTorso",
		amountN = 1,
		infoType = Enum.InfoType.Product,
		ID = 411424985,
		--Price = "250 R$",
		flavor = DeveloperProducts.FlavorEnum.Specials,
	},	
	-- special 8
	{
		Name = "Northlands Axe Skin",
--		Icon = "rbxassetid://2121006288",
		imageColor3 = Color3.new( 1, 1, 1 ),
		inventoryKeyS = "AxeBronze",
		amountN = 1,
		infoType = Enum.InfoType.Product,
		ID = 411425170,
		--Price = "495 R$",
		flavor = DeveloperProducts.FlavorEnum.Specials,
	},
}

function DeveloperProducts:UserOwnsGamePassWait( player, gamePassId )
	local hasPass = false
 
	if player.UserId > 0 then
		local success, message = pcall(function()
			hasPass = game.MarketplaceService:UserOwnsGamePassAsync(player.UserId, gamePassId )
		end)
	
		if not success then
			DebugXL:Error("Error while checking if player has pass: " .. tostring(message))
		end
	end
	
	return hasPass	
end

DeveloperProducts.productsT = {}

for _, product in pairs( DeveloperProducts.productsA ) do
	DeveloperProducts.productsT[ product.Name ] = product
end

for _, product in pairs( DeveloperProducts.productsA ) do
	-- can get http or server errors and then scripts might not load in!  So try to maintain both prices
	pcall( function()
		if not product.gamepassB then
			local productInfo = game.MarketplaceService:GetProductInfo( product.ID, product.infoType )
			product.Price = productInfo.PriceInRobux.." R$"
		end
	end )
end


return DeveloperProducts