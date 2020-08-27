
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local TableXL = require( game.ReplicatedStorage.Standard.TableXL )

local AssetManifest = require( game.ReplicatedFirst.TS.AssetManifest ).AssetManifest

local PossessionData = 
{
	-- wishlist; find a way to do subclassable enums so we could say IsA("Tool") IsA("melee") IsA("Furnishing") IsA("Spawn") etc
	-- can we do it without the complexity of metatables?  We usually pass keys rather than data over the barrier, so maybe
	-- having metatables in here wouldn't be a big deal anyway
	FlavorEnum = 
	{
		Currency   = "Currency",
		Furnishing = "Furnishing",
		Hero       = "Hero",
		Monster    = "Monster",
		Stats      = "Stats",
		Tool       = "Tool",
		Skin       = "Skin",
		Expansion  = "Expansion"
	},
	
	FurnishingEnum = 
	{
		BossSpawn    = "Boss Spawn",
		Spawn        = "Spawn",
		Treasure     = "Treasure",
		Barrier      = "Barrier",
		Cosmetic     = "Cosmetic",
		Lighting     = "Lighting",
		WaterFeature = "Water Feature",
		Trap         = "Trap",
		Utility      = "Utility"
	},
	
	PlacementTypeEnum =
	{
		Open  = "Open",
		Edge  = "Edge",
		Floor = "Floor",
	},

--	EquipSlotEnum =
--	{
--		Torso  = "Torso",
--		Legs   = "Legs",
--		Head   = "Head",
----		Neck   = "Neck",
----		RingR  = "RingR",
----		RingL  = "RingL",
----		Shield = "Shield"
--	},
}	
	
	
PossessionData.furnishingTypesT =
{
	[PossessionData.FurnishingEnum.BossSpawn]     = { dpTypeS = "expense" }, 
	[PossessionData.FurnishingEnum.Spawn]         = { dpTypeS = "expense" },
	[PossessionData.FurnishingEnum.Trap]          = { dpTypeS = "expense" },
	[PossessionData.FurnishingEnum.Barrier]       = { dpTypeS = "expense" },
	[PossessionData.FurnishingEnum.Utility]       = { dpTypeS = "expense" },
	[PossessionData.FurnishingEnum.Treasure]      = { dpTypeS = "income" },
	[PossessionData.FurnishingEnum.Cosmetic]      = { dpTypeS = "income" },
	[PossessionData.FurnishingEnum.Lighting]      = { dpTypeS = "income" },
	[PossessionData.FurnishingEnum.WaterFeature]  = { dpTypeS = "income" },
}


PossessionData.skinTypesT = require( game.ReplicatedStorage.TS.SkinTypes ).SkinTypes

for _, thing in pairs( PossessionData.skinTypesT ) do
	DebugXL:Assert( thing.idS )
	DebugXL:Assert( thing.readableNameS )
	DebugXL:Assert( thing.imageId )
end

PossessionData.raritiesT =
{
	[0] = {
		nameS = "",
		color3 = Color3.fromRGB( 0, 0, 0 ),
	},
	[1] = {
		nameS = "Common",
		color3 = Color3.fromRGB( 128, 128, 128 )
	},
	[2] = {
		nameS = "Uncommon",
		color3 = Color3.fromRGB( 76, 175, 80 ) 
	},
	[3] = {
		nameS = "Rare",
		color3 = Color3.fromRGB( 81, 106, 255 )
	},
	[4] = {
		nameS = "Epic",
		color3 = Color3.fromRGB( 156, 39, 176 )
	},
	[5] = {
		nameS = "Legendary",
		color3 = Color3.fromRGB( 255, 213, 0 )
	}
	
}
-- keeping the source list as an array rather than a table lets us order it
PossessionData.dataA = 
	{
		-- publish means publish to NumberValues
		-- client refresh means to update the entire inventory to the client
		-------------------------------------------------------------------------------------------------------------------------
		-- persistent currencies.  Should these even be possessions?
		-------------------------------------------------------------------------------------------------------------------------
		{
			idS           = "Boost",
			readableNameS = "Boost",
			publishValueB = true,
			skipClientRefreshB = true,
			purchaseCapN   = 12 * 60 * 60 * 2,  -- because it 24 hours you might as well get permaboost
--			startingCountN = 600,    -- we don't give you your boost until you become hero, and then only the first time

			-- permaboost
			gamePassId = 5494145,
			countForPassN = math.huge,	  
	
			flavor = PossessionData.FlavorEnum.Currency,			
		},
		{
			idS           = "Stars",
			readableNameS = "Stars",
			publishValueB = true,
			skipClientRefreshB = true,
			startingCountN = 0,
			flavor = PossessionData.FlavorEnum.Currency,			
		},
		{
			idS           = "Rubies",
			readableNameS = "Rubies",
			publishValueB = true,
			skipClientRefreshB = false,
			startingCountN = 200,
			flavor = PossessionData.FlavorEnum.Currency,			
		},
		{
			-- probably never share this with the end user
			idS           = "TimeInvested",
			readableNameS = "Total Time Played",
			publishValueB = true,
			skipClientRefreshB = true,
			startingCountN = 0,
			flavor = PossessionData.FlavorEnum.Currency,				
		},
		{
			-- probably never share this with the end user
			idS           = "NextStarFeedbackDue",
			readableNameS = "Next Star Rating Due",
			publishValueB = false,
			skipClientRefreshB = true,
			startingCountN = 0,
			flavor = PossessionData.FlavorEnum.Currency,				
		},
		{
			-- probably never share this with the end user
			idS           = "StarFeedbackCount",
			readableNameS = "Star Feedback Count",
			publishValueB = false,
			skipClientRefreshB = true,
			startingCountN = 0,
			flavor = PossessionData.FlavorEnum.Currency,				
		},				
		-- {
		-- 	idS = "InstantHeroExpress",
		-- 	readableNameS = "Instant Hero Express",
		-- 	publishValueB = false,
		-- 	skipClientRefreshB = true,
		-- 	startingCountN = 0,
		-- 	flavor = PossessionData.FlavorEnum.Currency,
		-- },
		-------------------------------------------------------------------------------------------------------------------------
		-- status.  Should this be in possessions?
		-------------------------------------------------------------------------------------------------------------------------
		{
			idS             = "Tutorial",
			readableNameS   = "Tutorial",
			publishValueB   = true,
			startingCountN  = 0,
			rewardsA = {
				{
					rewardCountN    = 3,
					rewardMessageS  = "Completing Monster Tutorial",
				}
			},
			flavor          = PossessionData.FlavorEnum.Stats,
		},
		{
			idS             = "HeroDeaths",
			readableNameS   = "Hero Deaths",
			startingCountN  = 0,
			rewardsA = {
				{
					rewardCountN    = 1,
					rewardMessageS  = "First Heroic Death",
				},
				{
					rewardCountN    = 5,
					rewardMessageS  = "Five Heroic Deaths",
				},
				{
					rewardCountN    = 10,
					rewardMessageS  = "Ten Heroic Deaths",
				},
				{
					rewardCountN    = 20,
					rewardMessageS  = "Twenty Heroic Deaths",
				},
				{
					rewardCountN    = 50,
					rewardMessageS  = "Fifty Heroic Deaths",
				},
				{
					rewardCountN    = 100,
					rewardMessageS  = "One Hundred Heroic Deaths",
				},																
			},
			flavor          = PossessionData.FlavorEnum.Stats,
		},
		{
			idS             = "MonsterDeaths",
			readableNameS   = "Monster Deaths",
			startingCountN  = 0,
			rewardsA = {
				{			
					rewardCountN    = 1,
					rewardMessageS  = "First Monster Death",
				},
				{
					rewardCountN    = 5,
					rewardMessageS  = "Five Monster Deaths",
				},
				{
					rewardCountN    = 10,
					rewardMessageS  = "Ten Monster Deaths",
				},
				{
					rewardCountN    = 20,
					rewardMessageS  = "Twenty Monster Deaths",
				},
				{
					rewardCountN    = 50,
					rewardMessageS  = "Fifty Monster Deaths",
				},
				{
					rewardCountN    = 100,
					rewardMessageS  = "One Hundred Monster Deaths",
				},																
			},
			flavor          = PossessionData.FlavorEnum.Stats,
		},
		{
			idS             = "HeroKills",  -- this means *you* do death blow
			readableNameS   = "Hero Kills",
			startingCountN  = 0,
--			rewardCountN    = -1,
--			rewardMessageS  = "First Hero Kill",
			flavor          = PossessionData.FlavorEnum.Stats,
		},
		{
			idS             = "MonsterKills",  -- this means *you* do death blow
			readableNameS   = "Monster Kills",
			startingCountN  = 0,
--			rewardCountN    = -1,  -- 20
--			rewardMessageS  = "Twenty Monster Kills",
			flavor          = PossessionData.FlavorEnum.Stats,
		},		
		{
			idS             = "NewLevels",   -- this means *you* got to the next level 
			startingCountN  = 0,
			rewardsA = {
				{
					rewardCountN    = 1,
					rewardMessageS  = "First Trip Downstairs",
				}
			},
			flavor          = PossessionData.FlavorEnum.Stats,
		},
		{
			idS             = "KillsCyclopsSuper",
			readableNameS   = "Cyclops Queen Kills",
			startingCountN  = 0,
			rewardsA = {
				{
					rewardCountN    = 1,
					rewardMessageS  = "Cyclops Queen Defeated",
					rewardBadgeId   = 2124428661,			
				}
			},
			flavor          = PossessionData.FlavorEnum.Stats,			
		},
		{
			idS             = "KillsCrystalDaemonSuper",
			readableNameS   = "King Winter Kills",
			startingCountN  = 0,
			rewardsA = {
				{
					rewardCountN    = 1,
					rewardMessageS  = "Winter King Defeated",
					rewardBadgeId   = 0,			
				}
			},
			flavor          = PossessionData.FlavorEnum.Stats,			
		},
		-------------------------------------------------------------------------------------------------------------------------
		-- expansions
		-------------------------------------------------------------------------------------------------------------------------
		{
			idS             = "GearSlots",
			readableName    = "Gear Slots",
			startingCountN  = 15,
--			rewardCountN    = -1,
			flavor          = PossessionData.FlavorEnum.Expansion,
--			startingCount   = 
		},
		{
			idS             = "HeroSlots",
			readableName    = "Hero Slots",
			startingCountN  = 3,  -- I'm leaving money on the table here, because I don't wnat to discourage players from starting new low-level characters so they can play with other low-levels
--			rewardCountN    = -1,
			flavor          = PossessionData.FlavorEnum.Expansion,
--			startingCount   = 
		},
						

		-------------------------------------------------------------------------------------------------------------------------
		-- armor skins
		--
		-- in the future to make our lives easier we're probably going to want to have skins that are
		-- just texture swaps rather than whole tool swaps
		-------------------------------------------------------------------------------------------------------------------------
		
		-- was thinking about seeing if I could clean up the code a tad by doing active skins a different way but
		-- but I'm going to do equipment the same way I did tools 
--		{   
--			idS            = "PlateTorsoDefault",
--			baseWornS      = "PlateTorso",
--			readableNameS  = "Plate Shirt",
--			skinType       = PossessionData.skinTypesT.PlateTorso,
--			flavor         = PossessionData.FlavorEnum.Skin,
--			imageId        = "",
--			rarityN        = 0,
--			startingCountN = 0,			
--		},			
--		{   
--			idS            = "PlateLegsDefault",
--			baseWornS      = "PlateLegs",
--			readableNameS  = "Plate Leggings",
--			skinType       = PossessionData.skinTypesT.PlateLegs,
--			flavor         = PossessionData.FlavorEnum.Skin,
--			imageId        = "",
--			rarityN        = 0,
--			startingCountN = 0,			
--		},			
		-------------------------------------------------------------------------------------------------------------------------
		-- armor skins
		-------------------------------------------------------------------------------------------------------------------------
		{
			idS            = "HoodCloth",
			baseEquipS     = "HoodCloth",
			readableNameS  = "Cloth Hood",
			skinType       = PossessionData.skinTypesT.Hat,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2487067899&width=420&height=420&format=png",
			rarityN        = 1,
			purchaseCapN   = 1,
			startingCountN = 0,
		},
		{
			idS            = "HoodClothDark",
			baseEquipS     = "HoodClothDark",
			readableNameS  = "Dark Cloth Hood",
			skinType       = PossessionData.skinTypesT.Hat,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=63993845&width=420&height=420&format=png",
			rarityN        = 3,
			purchaseCapN   = 1,
			startingCountN = 0,
		},		
--		{
--			idS            = "HoodLeatherBlack",
--			baseEquipS     = "HoodLeatherBlack",
--			readableNameS  = "Black Chained Hood",
--			skinType       = PossessionData.skinTypesT.Hat,
--			flavor         = PossessionData.FlavorEnum.Skin,
--			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2486765464&width=420&height=420&format=png",
--			rarityN        = 2,
--			startingCountN = 0,
--		},
		{
			idS            = "HelmetAlar",
			baseEquipS     = "HelmetAlar",
			readableNameS  = "Helmet of Alar",
			skinType       = PossessionData.skinTypesT.Helmet,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2486956847&width=420&height=420&format=png",
			rarityN        = 2,
			purchaseCapN   = 1,
			startingCountN = 0,
		},
		{
			idS            = "ClothPirateLegs",
			baseEquipS     = "ClothPirateLegs",
			readableNameS  = "Adventurer Garb Legs",
			skinType       = PossessionData.skinTypesT.ClothLegs,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2486816849&width=420&height=420&format=png",
			rarityN        = 2,
			purchaseCapN   = 1,
			startingCountN = 0,
		},
		{
			idS            = "ClothRobeDarkTorso",
			baseEquipS     = "ClothRobeDarkTorso",
			readableNameS  = "Dark Robes Top",
			skinType       = PossessionData.skinTypesT.ClothTorso,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2871089803&width=420&height=420&format=png",
			rarityN        = 4,
			purchaseCapN   = 1,
			startingCountN = 0,
		},	
		{
			idS            = "ClothRobeDarkLegs",
			baseEquipS     = "ClothRobeDarkLegs",
			readableNameS  = "Dark Robe Legs",
			skinType       = PossessionData.skinTypesT.ClothLegs,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2871109098&width=420&height=420&format=png",
			rarityN        = 2,
			purchaseCapN   = 1,
			startingCountN = 0,
		},
		{
			idS            = "ClothPirateTorso",
			baseEquipS     = "ClothPirateTorso",
			readableNameS  = "Adventurer Garb Top",
			skinType       = PossessionData.skinTypesT.ClothTorso,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2486819164&width=420&height=420&format=png",
			rarityN        = 2,
			purchaseCapN   = 1,
			startingCountN = 0,
		},		
		{
			idS            = "LeatherLegendaryRogueLegs",
			baseEquipS     = "LeatherLegendaryRogueLegs",
			readableNameS  = "Rogue Leggings",
			skinType       = PossessionData.skinTypesT.LeatherLegs,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2486873529&width=420&height=420&format=png",
			rarityN        = 1,
			purchaseCapN   = 1,
			startingCountN = 0,
		},
		{
			idS            = "LeatherLegendaryRogueTorso",
			baseEquipS     = "LeatherLegendaryRogueTorso",
			readableNameS  = "Rogue Top",
			skinType       = PossessionData.skinTypesT.LeatherTorso,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2486876686&width=420&height=420&format=png",
			rarityN        = 1,
			purchaseCapN   = 1,
			startingCountN = 0,
		},		
		{
			idS            = "HeavyRedcliffTorso",
			baseEquipS     = "HeavyRedcliffTorso",
			readableNameS  = "Redcliff Elite Torso",
			skinType       = PossessionData.skinTypesT.ArmorHeavyTorso,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2477708876&width=420&height=420&format=png",
			rarityN        = 4,
			purchaseCapN   = 1,
			startingCountN = 0,
		},
		{
			idS            = "HeavyRedcliffLegs",
			baseEquipS     = "HeavyRedcliffLegs",
			readableNameS  = "Redcliff Elite Legs",
			skinType       = PossessionData.skinTypesT.ArmorHeavyLegs,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2486868753&width=420&height=420&format=png",
			rarityN        = 4,
			purchaseCapN   = 1,
			startingCountN = 0,
		},			
		{
			idS            = "HeavyAlarTorso",
			baseEquipS     = "HeavyAlarTorso",
			readableNameS  = "Alar Knight Torso",
			skinType       = PossessionData.skinTypesT.ArmorHeavyTorso,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2486886543&width=420&height=420&format=png",
			rarityN        = 3,
			purchaseCapN   = 1,
			startingCountN = 0,
		},
		{
			idS            = "HeavyAlarLegs",
			baseEquipS     = "HeavyAlarLegs",
			readableNameS  = "Alar Knight Legs",
			skinType       = PossessionData.skinTypesT.ArmorHeavyLegs,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2486888754&width=420&height=420&format=png",
			rarityN        = 3,
			purchaseCapN   = 1,
			startingCountN = 0,
		},				
		{
			idS            = "LightPhoenixgardeTorso",
			baseEquipS     = "LightPhoenixgardeTorso",
			readableNameS  = "Phoenixgarde Torso",
			skinType       = PossessionData.skinTypesT.ArmorLightTorso,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2486943683&width=420&height=420&format=png",
			rarityN        = 2,
			purchaseCapN   = 1,
			startingCountN = 0,
		},
		{
			idS            = "LightPhoenixgardeLegs",
			baseEquipS     = "LightPhoenixgardeLegs",
			readableNameS  = "Phoenixgarde Legs",
			skinType       = PossessionData.skinTypesT.ArmorLightLegs,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2486940901&width=420&height=420&format=png",
			rarityN        = 2,
			purchaseCapN   = 1,
			startingCountN = 0,
		},			
		{
			idS            = "LightAlphaMailTorso",
			baseEquipS     = "LightAlphaMailTorso",
			readableNameS  = "Alpha Mail",
			skinType       = PossessionData.skinTypesT.ArmorLightTorso,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2506921205&width=420&height=420&format=png",
			rarityN        = 5,
			purchaseCapN   = 1,
			-- startingCountN = 0,  -- no starting count at first so we can track if people sell it
		},				
		-------------------------------------------------------------------------------------------------------------------------
		-- weapon skins
		-------------------------------------------------------------------------------------------------------------------------
		{
			idS            = "AxeBarbarian",
			baseToolS      = "Axe",
			readableNameS  = "Barbarian Axe",
			textureSwapId  = AssetManifest.ImageAxeClean,
			skinType       = PossessionData.skinTypesT.Axe2H,
			flavor         = PossessionData.FlavorEnum.Skin,
--			imageId        = "http://www.roblox.com/asset/?id=18409033",  -- tarnished axe skin
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2413175396&width=420&height=420&format=png",
			rarityN        = 1,
			purchaseCapN   = 1,
			startingCountN = 0,		
		},	
		{
			idS            = "AxeBronze",
			baseToolS      = "AxeBronze",
			readableNameS  = "Northlands Axe",
			skinType       = PossessionData.skinTypesT.Axe1H,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2348101945&width=420&height=420&format=png",
			rarityN        = 5,
			purchaseCapN   = 1,
			startingCountN = 0,		
		},	
		{
			idS            = "BombPumpkin",  -- exclusive Halloween item, not found in any crates
			baseToolS      = "BombPumpkin",
			readableNameS  = "Pumpkin Bomb",
			skinType       = PossessionData.skinTypesT.Bomb,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2530583168&width=420&height=420&format=png",
			rarityN        = 5,
			purchaseCapN   = 1,
			-- startingCountN = 0,  -- can only earn once		
		},			
		{
			idS            = "BombSkull",
			baseToolS      = "BombSkull",
			readableNameS  = "Skull Bomb",
			skinType       = PossessionData.skinTypesT.Bomb,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2347454038&width=420&height=420&format=png",
			rarityN        = 4,
			purchaseCapN   = 1,
			startingCountN = 0,		
		},			
		{
			idS            = "BowDarkage",
			baseToolS      = "Longbow",
			readableNameS  = "Darkage Ninja Bow",
			textureSwapId  = "http://www.roblox.com/asset/?id=283706893",
			
			skinType       = PossessionData.skinTypesT.Bow,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2574579618&width=420&height=420&format=png",
			rarityN        = 2,
			purchaseCapN   = 1,
		},			
		{   
			idS            = "ClawsSteel",
			baseToolS      = "ClawsSteel",
			readableNameS  = "Steel Claws",
			skinType       = PossessionData.skinTypesT.Claws,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = AssetManifest.ImageToolClawsSteel,
			rarityN        = 1,	
			purchaseCapN   = 1,
			startingCountN = 0,			
		},	
		{   
			idS            = "ClawsSun",
			baseToolS      = "ClawsSun",
			readableNameS  = "Sun Claws",
			skinType       = PossessionData.skinTypesT.Claws,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = AssetManifest.ImageToolClawsSun,			
			rarityN        = 3,	
			purchaseCapN   = 1,
			startingCountN = 0,			
		},	
		{   
			idS            = "CrossbowOrnate",
			baseToolS      = "CrossbowOrnate",
			readableNameS  = "Westlands Crossbow",
			skinType       = PossessionData.skinTypesT.Crossbow,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "http://www.roblox.com/asset/?id=177709045",
			rarityN        = 2,
			purchaseCapN   = 1,
			startingCountN = 0,			
		},						
		{
			idS            = "DaggersDualClean",
			baseToolS      = "DaggersDual",
			readableNameS  = "Immaculate Daggers",
			textureSwapId  = "rbxassetid://2674843859",
			skinType       = PossessionData.skinTypesT.Claws,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2674846240&width=420&height=420&format=png",
			rarityN        = 1,
			purchaseCapN   = 1,
			startingCountN = 0,		
		},			
		{
			idS            = "HammerBlue",
			baseToolS      = "HammerBlue",
			readableNameS  = "Northlands Hammer",
			skinType       = PossessionData.skinTypesT.Maul,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2348177370&width=420&height=420&format=png",
--			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2348177370&width=420&height=420&format=png",
			rarityN        = 2,
			purchaseCapN   = 1,
			startingCountN = 0,		
		},	
		{
			idS            = "HammerWooden",
			baseToolS      = "HammerWooden",
			readableNameS  = "Giant Mallet",
			skinType       = PossessionData.skinTypesT.Maul,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2900980585&width=420&height=420&format=png",
			rarityN        = 4,
			purchaseCapN   = 1,
			startingCountN = 0,		
		},	
		{
			idS            = "MaceClean",
			baseToolS      = "Mace",
			readableNameS  = "Immaculate Mace",
			textureSwapId  = AssetManifest.ImageMaceClean,
--			textureSwapId  = "rbxassetid://18407865",  -- tarnished
			skinType       = PossessionData.skinTypesT.Maul,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2410227647&width=420&height=420&format=png",
			rarityN        = 1,
			purchaseCapN   = 1,
			startingCountN = 0,		
		},	
		{
			idS            = "ScytheTribladeBlue",
			baseToolS      = "ScytheTribladeBlue",
			readableNameS  = "Triblade Scythe",
			skinType       = PossessionData.skinTypesT.Axe2H,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2343731384&width=420&height=420&format=png",
			rarityN        = 2,
			purchaseCapN   = 1,
			startingCountN = 0,		
		},
		{
			idS            = "StaffFeathered",
			baseToolS      = "StaffFeathered",
			readableNameS  = "Southland Staff",
			skinType       = PossessionData.skinTypesT.Staff,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2348268702&width=420&height=420&format=png",
			rarityN        = 4,
			purchaseCapN   = 1,
			startingCountN = 0,		
		},							
		{   
			idS            = "SwordKnotwork",
			baseToolS      = "SwordKnotwork",
			readableNameS  = "Westlands Sword",
			skinType       = PossessionData.skinTypesT.Sword1H,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2341503270&width=420&height=420&format=png",
			rarityN        = 3,			
			purchaseCapN   = 1,
			startingCountN = 0,			
		},	
		{   
			idS            = "SwordOrcBlade",
			baseToolS      = "SwordOrcBlade",
			readableNameS  = "Orc Blade",
			skinType       = PossessionData.skinTypesT.Sword1H,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2900990783&width=420&height=420&format=png",
			rarityN        = 2,			
			purchaseCapN   = 1,
			startingCountN = 0,			
		},	
		{   
			idS            = "SwordButcher",
			baseToolS      = "SwordButcher",
			readableNameS  = "Butcher",
			skinType       = PossessionData.skinTypesT.Sword1H,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2900984752&width=420&height=420&format=png",
			rarityN        = 4,			
			purchaseCapN   = 1,
			startingCountN = 0,			
		},	
		{   
			idS            = "SwordKatana",
			baseToolS      = "SwordKatana",			
			readableNameS  = "Eastlands Sword",
			skinType       = PossessionData.skinTypesT.Sword2H,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2342733488&width=420&height=420&format=png",
			rarityN        = 3,			
			purchaseCapN   = 1,
			startingCountN = 0,			
		},			
		{   
			idS            = "SwordGemPommel",
			baseToolS      = "SwordGemPommel",			
			readableNameS  = "Avowal",
			skinType       = PossessionData.skinTypesT.Sword2H,
			flavor         = PossessionData.FlavorEnum.Skin,
			imageId        = "https://www.roblox.com/asset-thumbnail/image?assetId=2897966354&width=420&height=420&format=png",
			rarityN        = 5,			
			purchaseCapN   = 1,
			startingCountN = 0,			
		},	
		{
			idS = "NullClass",
			readableNameS = "",
			imageId = ""
		},
		-------------------------------------------------------------------------------------------------------------------------
		-- Heroes; most class data is in HeroClassesTs
		-------------------------------------------------------------------------------------------------------------------------
		{
			idS           = "Warrior",
			readableNameS = "Warrior",
			imageId       = "http://www.roblox.com/asset/?id=11440361",  -- needs to match HeroClasses
			rarityN = 0, -- for pretty unlock message
			startingCountN = 1,					  
			tagsT = {},
			flavor = PossessionData.FlavorEnum.Hero,			
		},
		{
			idS           = "Rogue",
			readableNameS = "Rogue",
			imageId       = "http://www.roblox.com/asset/?id=16215840", -- needs to match HeroClasses
			rarityN = 0, -- for pretty unlock message
			startingCountN = 1,					  
			tagsT = {},
			flavor = PossessionData.FlavorEnum.Hero,			
		},
		{
			idS           = "Mage",			
			readableNameS = "Mage",
			imageId       = "rbxassetid://1495371626", -- needs to match HeroClasses
			rarityN = 0, -- for pretty unlock message
			startingCountN = 1,					  
			tagsT = {},
			flavor = PossessionData.FlavorEnum.Hero,			
		},
		{
			idS           = "Barbarian",
			readableNameS = "Barbarian",
			imageId       = AssetManifest.ImageHeroBarbarian, -- needs to match HeroClasses
			rarityN = 0, -- for pretty unlock message
			startingCountN = 0,					  
			tagsT = {},
			flavor = PossessionData.FlavorEnum.Hero,			
			-- gamepass id needs to be both here and in HeroClasses. Hey, I don't make the rules. Oh wait, I do.
			gamePassId      = 5190525,        
            countForPassN = 1,      
		},		
		{
			idS           = "Priest",
			readableNameS = "Priest",
			imageId       = AssetManifest.ImageHeroPriest, -- needs to match HeroClasses
			rarityN = 0, -- for pretty unlock message
			startingCountN = 0,					  
			tagsT = {},
			flavor = PossessionData.FlavorEnum.Hero,			
			-- gamepass id needs to be both here and in HeroClasses. Hey, I don't make the rules. Oh wait, I do.
			gamePassId      = 5188279,              
            countForPassN = 1,      
		},			
		-------------------------------------------------------------------------------------------------------------------------
		-- Monsters aren't really possessions, spawn points are, but the 'readable name' keys are all here 
		-- wishlist: remove them and use the id to key into the localization table
		-------------------------------------------------------------------------------------------------------------------------
		{
			idS             = "DungeonLord",
			readableNameS   = "Dungeon Lord",
			flavor = PossessionData.FlavorEnum.Monster,
		},
		{
			idS             = "BlueheadDragon",			
			readableNameS   = "Bluehead Dragon",		
			flavor = PossessionData.FlavorEnum.Monster,
		},		
		{
			idS             = "CrystalDaemon",			
			readableNameS   = "Crystal Daemon",			
			flavor = PossessionData.FlavorEnum.Monster,
		},			
		{
			idS             = "CrystalDaemonSuper",			
			readableNameS   = "Demon King Winter",			
			flavor = PossessionData.FlavorEnum.Monster,
		},			
		{
			idS           = "Cyclops",
			readableNameS = "Cyclops",
			flavor = PossessionData.FlavorEnum.Monster,
		},
		{
			idS           = "CyclopsSuper",
			readableNameS = "Queen Cyclops",
			flavor = PossessionData.FlavorEnum.Monster,
		},			
		{   
			idS           = "Zombie",  
			readableNameS = "Zombie", 
			flavor = PossessionData.FlavorEnum.Monster,
		},
		{
			idS           = "Skeleton",
			readableNameS = "Skeleton",
			flavor = PossessionData.FlavorEnum.Monster,
		},		
		{
			idS             = "Werewolf",
			readableNameS   = "Werewolf",
			flavor = PossessionData.FlavorEnum.Monster,
		},
		{
			idS           = "Ghost",
			readableNameS = "Ghost",
			flavor = PossessionData.FlavorEnum.Monster,
		},
		{
			idS           = "Gremlin",
			readableNameS = "Gremlin",
			flavor = PossessionData.FlavorEnum.Monster,
		},		
		{
			idS           = "Orc",
			readableNameS = "Orc",
			flavor = PossessionData.FlavorEnum.Monster,
		},
		{
			idS           = "Necromancer",
			readableNameS = "Necromancer",
			flavor = PossessionData.FlavorEnum.Monster,
		},		
		{
			idS           = "Sasquatch",
			readableNameS = "Sasquatch",
			flavor = PossessionData.FlavorEnum.Monster,
		},
		
		-------------------------------------------------------------------------------------------------------------------------
		-- furnishings
		-------------------------------------------------------------------------------------------------------------------------
		-- nonplayer stuff
		{
			idS = "TrapDoors",
			readableNameS = "Exit trap door",
			buildCostN = 0,
--			descriptionS = "The way out",
			imageId = "",
			furnishingType = nil,
			placementType = PossessionData.PlacementTypeEnum.Floor,
			gridSubdivisionsN = 1,
			healthPerLevelN = 10,
			lootOnDestroyPct = 0,  						
			balanceAgainstNumHeroesB = true,  						
			buildCapN = 1,
			levelCapN = 1,
			startingCountN = 0,  
			rarityN = 0,						-- indicates not a player ownable thing
			forbiddenToBuild = true,
			flavor = PossessionData.FlavorEnum.Furnishing,
		},
		-- superboss spawns
		{
			idS = "SpawnCyclopsSuper",
			monsterIdS = "CyclopsSuper",
			readableNameS = "Queen Cyclops Prison",
			buildCostN = 0,
--			descriptionS = "You will immediately respawn as a cyclops! This can only happen once per level",
			imageId = "",
			furnishingType = PossessionData.FurnishingEnum.BossSpawn,
			placementType = PossessionData.PlacementTypeEnum.Floor,
			gridSubdivisionsN = 1,
			startingCountN = 0,
			buildCapN = 1,
			levelCapN = 1,
			rarityN = 0,			-- indicates not a player ownable thing
			flavor = PossessionData.FlavorEnum.Furnishing,
		},
		{
			idS = "SpawnDaemonSuper",
			monsterIdS = "CrystalDaemonSuper",
			readableNameS = "King Winter's Coffin",
			buildCostN = 0,
--			descriptionS = "You will immediately respawn as a cyclops! This can only happen once per level",
			imageId = "",
			furnishingType = PossessionData.FurnishingEnum.BossSpawn,
			placementType = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,
			buildCapN = 1,
			levelCapN = 1,
			rarityN = 0,			-- indicates not a player ownable thing
			startingCountN = 0,
			flavor = PossessionData.FlavorEnum.Furnishing,
		},
		-- boss spawns
		{
			idS           = "SpawnCyclops",
			monsterIdS = "Cyclops",
			readableNameS = "Cyclops Prison",
			buildCostN    = 700,
--			descriptionS  = "You will immediately respawn as a cyclops! This can only happen once per level",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2248559615&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.BossSpawn,
			placementType     = PossessionData.PlacementTypeEnum.Floor,
			gridSubdivisionsN = 1,
			buildCapN = 1,
			levelCapN = 1,
			purchaseCapN = 1,
			startingCountN  = 1,  -- not at all sure that's the right call
			rarityN = 3,
			flavor = PossessionData.FlavorEnum.Furnishing,
		},						
		{
			idS           = "SpawnDragon",
			monsterIdS = "BlueheadDragon",
			readableNameS = "Dragon Lair",
			buildCostN    = 1000,
--			descriptionS  = "You will immediately respawn as a dragon! This can only happen once per level",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=164204125&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.BossSpawn,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,
			buildCapN = 1,
			levelCapN = 1,
			purchaseCapN = 1,
			startingCountN  = 0,
			rarityN = 5,
			flavor = PossessionData.FlavorEnum.Furnishing,
		},	
		{
			idS           = "SpawnDaemon",
			monsterIdS = "CrystalDaemon",
			readableNameS = "Crystal Portal",
			buildCostN    = 800,
--			descriptionS  = "You will immediately respawn as a crystal daemon! This can only happen once per level",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2348125721&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.BossSpawn,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,
			buildCapN = 1,
			levelCapN = 1,
			purchaseCapN = 1,
			startingCountN  = 0,
			rarityN = 4,
			flavor = PossessionData.FlavorEnum.Furnishing,
		},					
		-- spawns
		{
			idS           = "SpawnGhost",
			monsterIdS = "Ghost",
			readableNameS = "Ghost's Coffin",
			buildCostN    = 300,
--			descriptionS  = "Spawns ghosts\n\nYou will immediately respawn as this monster",
			imageId       = "rbxassetid://2120614645",
			placementType     = PossessionData.PlacementTypeEnum.Open,
			furnishingType = PossessionData.FurnishingEnum.Spawn,
			gridSubdivisionsN = 3,  -- unlike skeleton this can be 3 because ghosts can't get stuck
			buildCapN = 2,
			levelCapN = 3,
			purchaseCapN = 2,
			startingCountN  = 0,
			rarityN = 3,
			healthPerLevelN = 5,  	
			lootOnDestroyPct = 0.3,  						
			balanceAgainstNumHeroesB = false,  -- not balancing against individuals because more heroes usually means more monsters
			flavor = PossessionData.FlavorEnum.Furnishing,			
		},
		{
			idS           = "SpawnNecromancer",
			monsterIdS = "Necromancer",
			readableNameS = "Necromancer Portal",
			buildCostN    = 350,
			--descriptionS  = "Spawns orcs\n\nYou will immediately respawn as this monster",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2874183770&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Spawn,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,
			buildCapN = 3,
			levelCapN = 4,  
			purchaseCapN = 3,
			startingCountN  = 1,
			rarityN = 1,
			healthPerLevelN = 5,  		
			lootOnDestroyPct = 0.3,  						
			balanceAgainstNumHeroesB = false,  -- not balancing against individuals because more heroes usually means more monsters
			flavor = PossessionData.FlavorEnum.Furnishing,
		},				
		{
			idS           = "SpawnOrc",
			monsterIdS = "Orc",
			readableNameS = "Orc Tent",
			buildCostN    = 200,
			--descriptionS  = "Spawns orcs\n\nYou will immediately respawn as this monster",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=64505075&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Spawn,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,
			buildCapN = 3,
			levelCapN = 4,  
			purchaseCapN = 3,
			startingCountN  = 1,
			rarityN = 1,
			healthPerLevelN = 5,  		
			lootOnDestroyPct = 0.3,  						
			balanceAgainstNumHeroesB = false,  -- not balancing against individuals because more heroes usually means more monsters
			flavor = PossessionData.FlavorEnum.Furnishing,
		},
		{
			idS           = "SpawnGremlin",
			monsterIdS = "Gremlin",
			readableNameS = "Gremlin Faerie Circle",
			buildCostN    = 200,
			--descriptionS  = "Spawns gremlins\n\nYou will immediately respawn as this monster",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2246821832&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Spawn,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 3,
			buildCapN = 3,
			levelCapN = 4,
			purchaseCapN = 3,
			startingCountN  = 0,
			rarityN = 3,
			healthPerLevelN = 5,  	
			lootOnDestroyPct = 0.3,  						
			balanceAgainstNumHeroesB = false,  -- not balancing against individuals because more heroes usually means more monsters
			flavor = PossessionData.FlavorEnum.Furnishing,
		},		
		{
			idS           = "SpawnSasquatch",
			monsterIdS = "Sasquatch",
			readableNameS = "Sasquatch Camp",
			buildCostN    = 150,
--			descriptionS  = "Spawns sasquatches\n\nSasquatches do extra damage\n\nYou will immediately respawn as this monster",
			imageId       = "rbxassetid://2120460585",
			furnishingType = PossessionData.FurnishingEnum.Spawn,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,  -- was spawning you in a wall, this was easier than adjusting model
			buildCapN = 3,
			levelCapN = 4,
			purchaseCapN = 3,
			startingCountN  = 0,
			rarityN = 1,
			healthPerLevelN = 5,  		
			lootOnDestroyPct = 0.3,  						
			balanceAgainstNumHeroesB = false,  -- not balancing against individuals because more heroes usually means more monsters
			flavor = PossessionData.FlavorEnum.Furnishing,
		},
		{
			idS           = "SpawnSkeleton",
			monsterIdS = "Skeleton",
			readableNameS = "Skeleton's Open Coffin",
			buildCostN    = 200,
--			descriptionS  = "Spawns skeletons\n\nSkeletons are fast\n\nYou will immediately respawn as this monster",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=36883367&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Spawn,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,
			buildCapN = 3,
			levelCapN = 4,
			purchaseCapN = 3,
			startingCountN  = 0,
			rarityN = 2,
			healthPerLevelN = 5,  	
			lootOnDestroyPct = 0.3,  						
			balanceAgainstNumHeroesB = false,  -- not balancing against individuals because more heroes usually means more monsters
			flavor = PossessionData.FlavorEnum.Furnishing,
		},
		{
			idS           = "SpawnWerewolf",
			monsterIdS = "Werewolf",
			readableNameS = "Werewolf Den",
			buildCostN    = 350,
--			descriptionS  = "Spawns werewolves\n\nWerewolves can pretend to be heroes\n\nYou will immediately respawn as this monster",
			imageId       = "rbxassetid://2120547965",
			furnishingType = PossessionData.FurnishingEnum.Spawn,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,
			buildCapN = 3,
			levelCapN = 4,
			purchaseCapN = 3,
			startingCountN  = 0,
			rarityN = 4,
			healthPerLevelN = 5,  		
			lootOnDestroyPct = 0.3,  						
			balanceAgainstNumHeroesB = false,  -- not balancing against individuals because more heroes usually means more monsters
			flavor = PossessionData.FlavorEnum.Furnishing,
		},
		{
			idS           = "SpawnZombie",
			monsterIdS = "Zombie",
			readableNameS = "Zombie Experiment",
			buildCostN    = 250,
--			descriptionS  = "Spawns zombies\n\nZombies are slow but can sense heroes\n\nYou will immediately respawn as this monster",
			imageId       = "rbxassetid://2120558882",
			furnishingType = PossessionData.FurnishingEnum.Spawn,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,
			buildCapN = 3,
			levelCapN = 4,
			purchaseCapN = 3,
			startingCountN  = 0,
			rarityN = 2,
			healthPerLevelN = 5,  	
			lootOnDestroyPct = 0.3,  						
			balanceAgainstNumHeroesB = false,  -- not balancing against individuals because more heroes usually means more monsters
			flavor = PossessionData.FlavorEnum.Furnishing,
		},
		-------------------------------------------------------------------------------------------------------------------------
		-- barriers
		{
			idS             = "Fence",
			readableNameS   = "Fence",
			buildCostN      = 50,
--			descriptionS    = "Opens for monsters but not for heroes\n\nCan shoot through it but not walk through it",
			imageId         = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2351022347&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Barrier,
			placementType     = PossessionData.PlacementTypeEnum.Edge,
			gridSubdivisionsN = 1,
			healthPerLevelN = 6,  	
			lootOnDestroyPct = 0,		
			balanceAgainstNumHeroesB = false,  -- not balancing against individuals because more heroes usually means more monsters
			buildCapN = 2,  -- chose that number so they could theoretically build a fence all the way across
			levelCapN = 4,  -- 12/2
			purchaseCapN = 7,
			startingCountN  = 2,
			rarityN         = 1,
			flavor = PossessionData.FlavorEnum.Furnishing
		},
		{
			idS             = "Door",
			readableNameS   = "Door",
			buildCostN      = -5,
			descriptionS    = "Provides some privacy but anyone can go through",
			imageId         = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2685909369&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Barrier,
			heroesCanOpenB = true,
			placementType     = PossessionData.PlacementTypeEnum.Edge,
			gridSubdivisionsN = 1, 			
			buildCapN = 3,  -- chose that number so they could theoretically build a fence all the way across
			levelCapN = 5,  -- 12/2
			purchaseCapN = 7,
			startingCountN  = 0,
			rarityN         = 1,
			flavor = PossessionData.FlavorEnum.Furnishing
		},
		{
			idS             = "Gate",
			readableNameS   = "Gate",
			buildCostN      = 60,
--			descriptionS    = "Stronger than fences. Opens for monsters but not for heroes",
			imageId         = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2351027443&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Barrier,
			placementType     = PossessionData.PlacementTypeEnum.Edge,
			gridSubdivisionsN = 1,
			-- it's obvious to me that in a single player game the gate should have less HP than the trapdoor
			healthPerLevelN = 8,  		
			lootOnDestroyPct = 0,  						
			balanceAgainstNumHeroesB = false,  -- not balancing against individuals because more heroes usually means more monsters
			buildCapN = 2, 
			levelCapN = 4,
			purchaseCapN = 7,			
			startingCountN  = 0,
			rarityN         = 2,
			flavor = PossessionData.FlavorEnum.Furnishing
		},		
		-------------------------------------------------------------------------------------------------------------------------
		-- rewards
		{
			idS           = "Chest",
			readableNameS = "Treasure Chest",
			buildCostN    = -100,
--			descriptionS  = "Gives you Dungeon Points when you build it; but if a hero finds it they'll get loot",
			imageId       = "rbxassetid://2121006288",
			furnishingType = PossessionData.FurnishingEnum.Treasure,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 3,
			buildCapN = 2,
			clickableByTeam = {Heroes=true},
					
			levelCapN = 11,   
			-- let every monster build at least one, which means we have to let all but one build two. in a 9 player game that's 6 monsters or 11 chests
			-- don't actually want that many in the level but c'est la vie - chests that get built in level count towards limit also which would take a bit to fix
			
			purchaseCapN = 2,
			startingCountN  = 1,
			rarityN  = 2,
			flavor = PossessionData.FlavorEnum.Furnishing
		},
		{
			idS           = "TrappedChest",
			readableNameS = "Trapped Chest",
			buildCostN    = 70,
--			descriptionS  = 'Explodes when a hero opens\n\nTake that, "hero"',
			imageId       = "rbxassetid://2121026342",
			furnishingType = PossessionData.FurnishingEnum.Trap,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 3,
			buildCapN = 2,		
			levelCapN = 7,
			purchaseCapN = 2,
			-- used to be 28 / 10 because never updated for latest hit point buff
			-- a level 1 rogue has 74 + 8/3 (*level or 1) + 6(*con or 10) hp = 74 + 2 + 60 = 136
			-- a level 10 character with nothing in con would be 74 + 26 + 60 = 160
			-- a level 10 con munchkin warrior would be 74 + 26 + 144 = 234
			baseDamageN = 68,    -- half of level 0 character
			damagePerLevelN = 2,  -- so always more than half if you put nothing into con. this should be very effective now that chests are the only way to get potions

			startingCountN  = 0,
			rarityN = 3,
			clickableByTeam = {Heroes=true},
			flavor = PossessionData.FlavorEnum.Furnishing			
		},
		{
			idS           = "WeaponsRack",
			readableNameS = "Weapons Rack",
			buildCostN    = 100,
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=5610538353&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Utility,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 3,
			healthPerLevelN = 3,
			lootOnDestroyPct = 0.5,  						
			clickableByTeam = {Monsters=true},
			buildCapN = 2,		
			levelCapN = 4,
			purchaseCapN = 2,
			startingCountN  = 0,
			rarityN = 3,
			flavor = PossessionData.FlavorEnum.Furnishing			
		},
		-------------------------------------------------------------------------------------------------------------------------
		-- cosmetic
		{
			idS           = "Altar",
			readableNameS = "Altar",
			buildCostN    = -10,
--			descriptionS  = "Gives you Dungeon Points when you build it",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2227393233&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Cosmetic,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 3,
			buildCapN = 2,		
			levelCapN = 4,
			purchaseCapN = 2,
			startingCountN  = 0,		
			rarityN = 2,	
			flavor = PossessionData.FlavorEnum.Furnishing
		},
		{
		idS           = "WoodTable",
			readableNameS = "Wood Table",
			buildCostN    = -10,
--			descriptionS  = "Gives you Dungeon Points when you build it",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2227443240&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Cosmetic,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 6,
			buildCapN = 2,		
			levelCapN = 4,
			purchaseCapN = 2,
			startingCountN  = 1,
			rarityN = 1,
			flavor = PossessionData.FlavorEnum.Furnishing
		},		
		{
			idS           = "WoodChair",
			readableNameS = "Wood Chair",
			buildCostN    = -5,
--			descriptionS  = "Gives you Dungeon Points when you build it",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2227440823&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Cosmetic,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 6,
			buildCapN = 6,		
			levelCapN = 8,
			purchaseCapN = 6,
			startingCountN  = 1,
			rarityN = 1,
			flavor = PossessionData.FlavorEnum.Furnishing
		},				
		{
			idS           = "Barrel",
			readableNameS = "Barrel",
			buildCostN    = -10,
			descriptionS  = "Gives you Dungeon Points when you build it\n\nHeroes can destroy and sometimes get loot",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2685915597&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Cosmetic,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 6,
			healthPerLevelN   = 2,
			lootOnDestroyPct = 0.1,  						
			buildCapN = 6,		
			levelCapN = 8,
			purchaseCapN = 6,
			startingCountN  = 0,
			rarityN = 1,
			flavor = PossessionData.FlavorEnum.Furnishing
		},	
		{
			idS           = "Statue",
			readableNameS = "Statue",
			buildCostN    = -15,
--			descriptionS  = "Gives you Dungeon Points when you build it",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2227438851&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Cosmetic,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 3,
			buildCapN = 3,		
			levelCapN = 6,
			purchaseCapN = 3,
			startingCountN  = 0,		
			rarityN = 3,	
			flavor = PossessionData.FlavorEnum.Furnishing
		},
		{
			idS           = "Pedestal",
			readableNameS = "Pedestal",
			buildCostN    = -10,
--			descriptionS  = "Gives you Dungeon Points when you build it",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2227432979&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Cosmetic,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,
			buildCapN = 3,		
			levelCapN = 6,
			purchaseCapN = 3,
			startingCountN  = 0,
			rarityN = 2,
			flavor = PossessionData.FlavorEnum.Furnishing
		},
		{
			idS               = "StatueAvatar",
			readableNameS     = "Avatar Statue",
			buildCostN        = -20,
--			descriptionS      = "A statue of your own avatar, because very important people have statues honoring them. (Requires VIP pass)",
			imageId           = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2406861669&fmt=png&wd=420&ht=420",
			furnishingType    = PossessionData.FurnishingEnum.Cosmetic,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 3,
			buildCapN         = 1,		
			levelCapN         = math.huge,
			purchaseCapN = 1,
			startingCountN    = 0,
			rarityN           = 5,
			gamePassId        = 5185882,
			countForPassN = 1,	  
			flavor = PossessionData.FlavorEnum.Furnishing
		},		
		-------------------------------------------------------------------------------------------------------------------------
		-- water feature
		{
			idS           = "GargoyleFountain",
			readableNameS = "Gargoyle Fountain",
			buildCostN    = -15,
--			descriptionS  = "Gives you Dungeon Points when you build it",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2227429195&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.WaterFeature,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 4,
			healthPerLevelN   = 4,  				
			lootOnDestroyPct = 0.1,  						
			balanceAgainstNumHeroesB = false,  -- not balancing against individuals because more heroes usually means more monsters
			buildCapN = 3,		
			levelCapN = 6,
			purchaseCapN = 3,
			startingCountN  = 0,		
			rarityN = 3,	
			flavor = PossessionData.FlavorEnum.Furnishing
		},
		{
			idS           = "Fountain",
			readableNameS = "Fountain",
			buildCostN    = -20,
--			descriptionS  = "Gives you Dungeon Points when you build it",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2227426371&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.WaterFeature,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,
			buildCapN = 2,		
			levelCapN = 5,
			purchaseCapN = 2,
			startingCountN  = 0,	
			rarityN = 4,		
			flavor = PossessionData.FlavorEnum.Furnishing
		},						
		-------------------------------------------------------------------------------------------------------------------------
		-- lighting
		{
			idS           = "Brazier",
			readableNameS = "Brazier",
			buildCostN    = -5,
--			descriptionS  = "Gives you Dungeon Points when you build it\n\nSheds light",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2227422497&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Lighting,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 3,
			buildCapN = 8,		
			levelCapN = 20,
			purchaseCapN = 8,
			startingCountN  = 2,
			rarityN = 1,
			flavor = PossessionData.FlavorEnum.Furnishing
		},
		{
			idS           = "ChandelierIron",
			readableNameS = "Iron Chandelier",
			buildCostN    = -10,
			descriptionS  = "Gives you Dungeon Points when you build it\n\nSheds light",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2685923428&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Lighting,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 1,
			buildCapN = 4,		
			levelCapN = 10,
			purchaseCapN = 4,
			startingCountN  = 0,
			rarityN = 3,
			flavor = PossessionData.FlavorEnum.Furnishing
		},		
		-------------------------------------------------------------------------------------------------------------------------
		-- traps
		{
			idS           = "PitTrap",
			readableNameS = "Pit Trap",
			buildCostN    =  60,
			--descriptionS  = "Drops the heroes into a hole. They're tough, it won't hurt them, but maybe then you can fill them with arrows",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2337523504&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Trap,
			placementType     = PossessionData.PlacementTypeEnum.Floor,
			gridSubdivisionsN = 1,
			buildCapN = 2,		
			levelCapN = 5,
			purchaseCapN = 2,
			startingCountN  = 0,
			rarityN = 3,
			flavor = PossessionData.FlavorEnum.Furnishing
		},
		{
			idS           = "PitTrapSpiked",
			readableNameS = "Pit Trap Spiked",
			buildCostN    =  100,
			descriptionS  = "Drops the heroes into a hole. They're tough, it won't hurt them, but maybe then you can fill them with arrows",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2685904652&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Trap,
			placementType     = PossessionData.PlacementTypeEnum.Floor,
			gridSubdivisionsN = 1,
			buildCapN = 2,		
			levelCapN = 5,
			purchaseCapN = 2,
			startingCountN  = 0,
			rarityN = 3,
			flavor = PossessionData.FlavorEnum.Furnishing,

			-- same as trapped chest 3/5/19 & 8/25/19
			baseDamageN = 68,
			damagePerLevelN = 2,  -- so always more than half if you put nothing into con. this should be very effective now that chests are the only way to get potions

		},		
		{
			idS           = "TestDestructibleLoot",
			readableNameS = "Test Destructible",
			buildCostN    = -10,
			descriptionS  = "Destructible with 100% loot chance",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2685915597&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Cosmetic,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 6,
			healthPerLevelN   = 2,
			lootOnDestroyPct = 1,  						
			buildCapN = 6,		
			levelCapN = 8,
			purchaseCapN = 6,
			startingCountN  = 0,
			rarityN = 1,
			flavor = PossessionData.FlavorEnum.Furnishing
		},	
		{
			idS           = "TestDestructibleNoLoot",
			readableNameS = "Test Destructible",
			buildCostN    = -10,
			descriptionS  = "Destructible with 0% loot chance",
			imageId       = "http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=2685915597&fmt=png&wd=420&ht=420",
			furnishingType = PossessionData.FurnishingEnum.Cosmetic,
			placementType     = PossessionData.PlacementTypeEnum.Open,
			gridSubdivisionsN = 6,
			healthPerLevelN   = 2,
			lootOnDestroyPct = 0,  						
			buildCapN = 6,		
			levelCapN = 8,
			purchaseCapN = 6,
			startingCountN  = 0,
			rarityN = 1,
			flavor = PossessionData.FlavorEnum.Furnishing
		},	
	}


-- I've exposed the implentation for the PossessionData because it's been working great for us in Legends of You


PossessionData.dataT = {}

for _, v in ipairs( PossessionData.dataA ) do
	-- be able to easily treat as a table as well as an array
	PossessionData.dataT[ v.idS ] = v
end

function PossessionData:GetDataAOfFlavor( flavorEnum )
	DebugXL:Assert( self == PossessionData )
	return TableXL:FindAllInAWhere( PossessionData.dataA, function( x ) return x.flavor == flavorEnum end )
end


-- validation
for _, item in pairs( PossessionData.dataT ) do
	if item.rewardsA then
		if #item.rewardsA <= 0 then
			DebugXL:Error( item.idS.." corrupt rewardsA")
		end
	end
	if item.flavor == PossessionData.FlavorEnum.Furnishing then
		if not item.forbiddenToBuild and not game.ReplicatedStorage["Shared Instances"]["Placement Storage"]:FindFirstChild( item.idS ) then
			DebugXL:Error( "can't find furnishing "..item.idS )
		end
	elseif item.flavor == PossessionData.FlavorEnum.Furnishing then
		if not item.rarityN then
			DebugXL:Error( item.idS.." is missing rarityN" )
		end
	end
end

return PossessionData
