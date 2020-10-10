
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local PossessionData = require( game.ReplicatedStorage.PossessionData )

local AssetManifest = require( game.ReplicatedFirst.TS.AssetManifest ).AssetManifest

local Crates = --[[Table of tables]] 
{
	{ --[[Table for crate 1 data]]  -- rewards must be slot 1
        ['Name']    = "Rewards",
		inStoreB    = false,
        ['Icon']    = AssetManifest.ImageLockedChest,
		imageColor3 = Color3.new( 1, 1, 1 ),
		['Cost']    = 200,  -- currently higher than Assassin price because there are no repeats and you can get good stuff 
        ['Items'] = 
		{
			{
				idS           = "SpawnDaemon",
			},
			{
				idS           = "Altar",
			},
			{
				idS           = "Statue",
			},
			{  
				idS           = "GargoyleFountain",
			},
			{  
				idS           = "Fountain",
			},			
			{
				idS           = "SpawnGhost",
			},		
			{
				idS           = "SpawnGremlin",
			},		
			{
				idS           = "SpawnSasquatch",
			},
			{
				idS           = "SpawnSkeleton",
			},
			{
				idS           = "SpawnWerewolf",
			},
			{
				idS           = "SpawnZombie",
			},
			{
				idS           = "Fence",
			},		
			{
				idS           = "Gate",
			},		
			{
				idS           = "TrappedChest",
			},
			{
				idS           = "PitTrap",
			},
			{
				idS           = "ClawsSteel",
			},		
			{
				idS           = "ClawsSun",
			},
			{
				idS           = "SwordKnotwork",
			},
			{
				idS           = "SwordKatana",
			},
			{				
				idS           = "CrossbowOrnate",
			},
			{
				idS           = "ScytheTribladeBlue",
			},
			{
				idS           = "BombSkull"
			},
			{
				idS           = "AxeBronze"
			},
			{
				idS           = "HammerBlue"
			},
			{
				idS           = "HoodCloth",
			},		
--			{
--				idS           = "HoodLeatherBlack",
--			},		
			{
				idS           = "HelmetAlar",
			},
			{
				idS           = "ClothPirateLegs",
			},
			{
				idS           = "ClothPirateTorso",
			},		
			{
				idS           = "LeatherLegendaryRogueLegs",
			},
			{
				idS           = "LeatherLegendaryRogueTorso",
			},
			{
				idS           = "HeavyRedcliffTorso",
			},
			{				
				idS           = "HeavyRedcliffLegs",
			},
			{
				idS           = "HeavyAlarTorso",
			},
			{
				idS           = "HeavyAlarLegs"
			},
			{
				idS           = "LightPhoenixgardeTorso"
			},
			{
				idS           = "LightPhoenixgardeLegs"
			},			
			{
				idS           = "WeaponsRack"
			}
		}
    },	
    { --[[Table for crate 2 data]]  -- blueprints must be slot 2
        ['Name'] = "Blueprints",
        ['Icon'] = AssetManifest.ImageLockedChest,
		inStoreB = true,
		imageColor3 = Color3.new( 1, 1, 1 ),
		['Cost'] = 200,  -- currently higher than Assassin price because there are no repeats and you can get good stuff 
        ['Items'] = 
		{	
--			{
--				idS           = "Barrel",  
--			},		
--			{
--				idS           = "Door",  
--			},		
--			{
--				idS           = "ChandelierIron",  
--			},		
			{
				idS           = "SpawnDragon",
			},
			{		
				idS           = "SpawnDaemon",
			},
			{
				idS           = "Altar",
			},
			{
				idS           = "WoodTable",
			},
			{
				idS           = "WoodChair",
			},
			{
				idS           = "Statue",
			},
			{
				idS           = "Pedestal",
			},
			{  
				idS           = "GargoyleFountain",
			},
			{  
				idS           = "Fountain",
			},			
			{
				idS           = "Brazier",
			},
			{
				idS           = "SpawnGhost",
			},		
			{
				idS           = "SpawnGremlin",
			},		
			{
				idS           = "SpawnOrc",
			},
			{
				idS           = "SpawnSasquatch",
			},
			{
				idS           = "SpawnSkeleton",
			},
			{
				idS           = "SpawnWerewolf",
			},
			{
				idS           = "SpawnZombie",
			},
			{
				idS           = "Fence",
			},
			{
				idS           = "Gate",
			},		
			{
				idS           = "Chest",
			},
			{
				idS           = "TrappedChest",
			},
			{
				idS           = "PitTrap",
			},
			{
				idS           = "WeaponsRack"
			}
		}
	},
	{ --[[Table for crate 3 data]]
        ['Name'] = "Skins",
        ['Icon'] = AssetManifest.ImageLockedChest,
		imageColor3 = Color3.new( 1, 1, 1 ),
		inStoreB = true,		
		['Cost'] = 175,  -- currently higher than Assassin price because there are no repeats and you can get good stuff 
        ['Items'] = 
		{
			{
				idS           = "AxeBarbarian"
			},
			{
				idS           = "AxeBronze"
			},
			{
				idS           = "BombSkull"
			},
			{
				idS           = "ClawsSteel",
			},		
			{
				idS           = "ClawsSun",
			},
			{				
				idS           = "CrossbowOrnate",
			},
			{
				idS           = "HammerBlue"
			},
			{
				idS           = "MaceClean"
			},
			{
				idS           = "SwordKatana",
			},
			{
				idS           = "SwordKnotwork",
			},
			{
				idS           = "ScytheTribladeBlue",
			},
			{
				idS           = "StaffFeathered"
			},	
			{
				idS           = "LeatherLegendaryRogueLegs",
			},
			{
				idS           = "LeatherLegendaryRogueTorso",
			},		
			{
				idS           = "HoodCloth",
			},		
--			{
--				idS           = "HoodLeatherBlack",
--			},		
			{
				idS           = "HelmetAlar",
			},		
			{
				idS           = "ClothPirateLegs",
			},		
			{
				idS           = "ClothPirateTorso",
			},		
			{
				idS           = "HeavyRedcliffTorso",
			},		
			{
				idS           = "HeavyRedcliffLegs",
			},		
			{
				idS           = "HeavyAlarTorso",
			},		
			{
				idS           = "HeavyAlarLegs",
			},		
			{
				idS           = "LightPhoenixgardeTorso",
			},		
			{
				idS           = "LightPhoenixgardeLegs",
			},		
		}
	},
	{ --[[Table for crate 4 data]]
        ['Name'] = "Premium",
        ['Icon'] = AssetManifest.ImageLockedChest,
		imageColor3 = Color3.new( 1, 1, 1 ),
		inStoreB = true,		
		['Cost'] = 800,  
        ['Items'] = {
			{
				idS           = "SpawnDragon",
			},
			{
				idS           = "SpawnDaemon",
			},
			{
				idS           = "Statue",
			},
			{  
				idS           = "GargoyleFountain",
			},
			{  
				idS           = "Fountain",
			},			
			{
				idS           = "SpawnGhost",
			},		
			{
				idS           = "SpawnGremlin",
			},		
			{
				idS           = "TrappedChest",
			},
			{
				idS           = "PitTrap",
			},
			{
				idS           = "ClawsSun",
			},
			{
				idS           = "SwordKnotwork",
			},
			{
				idS           = "SwordKatana",
			},
			{
				idS           = "BombSkull"
			},
			{
				idS           = "AxeBronze"
			},
			{
				idS           = "ClawsSun",
			},
			{
				idS           = "StaffFeathered"
			},	
			{
				idS           = "HeavyAlarTorso"
			},
			{
				idS           = "HeavyAlarLegs"
			},
			{
				idS           = "HeavyRedcliffTorso",
			},
			{
				idS           = "HeavyRedcliffLegs"
			},				
		}
	},
	{ --[[Table for crate 5 data]]
        ['Name'] = "Subdweller Colony",
        ['Icon'] = AssetManifest.ImageLockedChest,
		imageColor3 = Color3.new( 1, 1, 1 ),
		inStoreB = true,		
		['Cost'] = 150,  -- currently higher than Assassin price because there are no repeats and you can get good stuff 
        ['Items'] = {
			{  -- 1
				idS           = "WoodTable",
			}, 
			{ -- 2
				idS           = "WoodChair",
			},
			{ -- 3
				idS           = "GargoyleFountain",
			},
			{ -- 4
				idS           = "Brazier",
			},
			{ -- 5
				idS           = "SpawnGremlin",
			},		
			{ -- 6
				idS           = "SpawnSasquatch",
			},
			{ -- 7
				idS           = "SpawnWerewolf",
			},
			{ -- 8
				idS           = "Fence",
			},
			{ -- 9
				idS           = "Chest",
			},
			{ -- 10
				idS           = "TrappedChest",
			},
			{ -- 11
				idS           = "PitTrap",
			},
			{ -- 12
				idS           = "AxeBarbarian"
			},
			{ -- 13
				idS           = "AxeBronze"
			},
			{ -- 14
				idS           = "ClawsSun",
			},
			{ -- 15		
				idS           = "CrossbowOrnate",
			},
			{ -- 16
				idS           = "MaceClean"
			},
			{ -- 17
				idS           = "SwordKnotwork",
			},
			{ -- 18
				idS           = "StaffFeathered"
			},				
			{ -- 19
				idS           = "BowDarkage"
			},
			{
				idS           = "WeaponsRack"
			}
		},
	},
	{ --[[Table for crate 5 data]]
        ['Name'] = "Winter's Crypt",
        ['Icon'] = AssetManifest.ImageLockedChest,
		imageColor3 = Color3.new( 1, 1, 1 ),
		inStoreB = true,		
		['Cost'] = 150,  -- currently higher than Assassin price because there are no repeats and you can get good stuff 
        ['Items'] = {
			{ -- 1
				idS = "ClothRobeDarkLegs",
			},
			{ -- 2
				idS = "ClothRobeDarkTorso",
			},			
			{ -- 3
				idS = "HoodClothDark",
			},			
			{ -- 4
				idS = "SpawnNecromancer"
			},
			{ -- 5
				idS = "SpawnDaemon"
			},
			{ -- 6
				idS = "SpawnGhost"
			},
			{ -- 7
				idS = "SpawnZombie"
			},
			{ -- 8
				idS = "SpawnSkeleton"
			},
			{ -- 9
				idS = "SwordGemPommel"
			},
			{ -- 10
				idS = "SwordButcher"
			},
			{ -- 11
				idS = "Door"
			},
			{ -- 12
				idS = "Barrel"
			},
			{ -- 13
				idS = "Statue",
			},
			{ -- 14
				idS = "Pedestal",
			},
			{  -- 15
				idS = "Fountain",
			},		
			{  -- 16
				idS = "BombSkull"
			},
			{  -- 17
				idS = "ClawsSteel",
			},			
			{  -- 18
				idS = "HammerBlue"
			},
			{  -- 19
				idS = "SwordKatana",
			},
			{  -- 20
				idS = "ScytheTribladeBlue",
			},	
			{  -- 21
				idS = "PitTrapSpiked",
			},
			{  -- 22
				idS = "ChandelierIron"
			}

			-- {
			-- 	idS = "AltarCursed"
			-- }
		}
	}
}

local allProductNamesSet = {}

-- validate
for _, crate in pairs( Crates ) do
	for _, item in pairs( crate.Items ) do
		DebugXL:Assert( PossessionData.dataT[ item.idS ] )
--		DebugXL:Assert( PossessionData.dataT[ item.idS ].startingCountN == 0 )
		allProductNamesSet[ item.idS ] = true
	end
end

for _, item in pairs( PossessionData.dataA ) do
	if item.flavor == PossessionData.FlavorEnum.Furnishing then
		if not item.startingCountN then
			warn( item.idS.." needs startingCountN" )
		else
--			if not item.untradeableB then
--				DebugXL:Assert( item.startingCountN >= 1 ) -- allProductNamesSet[ item.idS ] )  --
--			end 
		end
	end
end




return Crates