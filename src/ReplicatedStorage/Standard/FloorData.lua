
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local InstanceXL     = require( game.ReplicatedStorage.Standard.InstanceXL )

local PossessionData = require( game.ReplicatedStorage.PossessionData )

local FloorData = {}

FloorData.lightingDefaultsT =
{
	Ambient = Color3.fromRGB( 180, 180, 180 ),
	Brightness = 5,
	OutdoorAmbient = Color3.fromRGB( 0, 0, 0 ),
	FogColor = Color3.fromRGB( 0, 0, 0 ),
	FogStart = 35,
	FogEnd = 125,
	ClockTime = 3.8,
	GeographicLatitude = 20
}


-- ways I could handle superboss data
-- have a superboss character and spawner that players aren't allowed to own
--   that would make it easy to call him 'Cyclops King', increase his scale, tweak his stats
-- a superboss tag
--   would have to replicate it to the character from the spawner
-- force it to high level, and have the high level readout be the thing


-- current data can't handle variable sized maps *and* placing the entrance on an edge at the same time; choose one or the other
-- oh, and you have to manually place the hero spawn point yourself

FloorData.floorsA =
{
	{	-- WINTER'S CRYPT 1
		dungeonNameS = "Winter's Crypt",
		tilesetS = "HallTemplatesPalace",
		readableNameS = "Lord Winter's Palace",
		tileProbabilitiesT =
		{
		},
		availableBlueprintsT =
		{
			["SpawnSkeleton"]   = true,
			["SpawnZombie"]    =  true,
			["Statue"] = true,
			["Gate"] = true  -- making sure they got stuff to build on first level where a lot of n00bs are going to be
		},
		forbiddenBlueprintsT =
		{
			["ChandelierIron"] = true
		},
		sizesT = { [1] = 7 },
		lightingT =
		{
			Ambient = Color3.fromRGB( 0, 0, 0 ),
			Brightness = 8,
			OutdoorAmbient = Color3.fromRGB( 150, 150, 160 ),
			FogColor = Color3.fromRGB( 145, 145, 145 ),
			FogStart = 150,
			FogEnd = 500,
			ClockTime = 15.8,
			GeographicLatitude = 20
		},		
		skyEnabledB = true,
		characterLightN = 0,
		fixedFloorDecorations = 
		{
			"GateSpawn"
		},	
		hidePartsSet =
		{
			["Brick"] = true
		},		
		materialSwapT =
		{			
		},
		startX = -3, startY = 0, startTileModelName = "HallOneWallGate", startOpeningsA = {1, 3, 4},
		blueprintSuffix = "Royal",
		exitStaircaseB = true
	},	

	{	-- WINTER'S CRYPT 2
		dungeonNameS = "Winter's Crypt",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "Obsidian Halls",
		tileProbabilitiesT =
		{
			HallStraight = 2,
			HallNoWalls = 2
		},
		availableBlueprintsT =
		{
			["SpawnNecromancer"] = true,
			["SpawnGhost"] = true,
			["Fountain"] = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 7, [9] = 9 },
		lightingT =
		{
			FogColor = Color3.fromRGB( 196, 196, 196 ),
			FogStart = 70,
			FogEnd = 150,
		},		
		characterLightN = 0,
		fixedFloorDecorations = 
		{
			"StairEntrance",
			"VolumetricRisingParticles"
		},
		hidePartsSet =
		{
			["Brick"] = true,
			["Icicles"] = true
		},
		materialSwapT =
		{			
		},
		colorSwapT =
		{
			[ "Pine Cone" ] = { Color = Color3.fromRGB( 91, 93, 105 ), Reflectance = 0.7 },
			[ "Linen" ] = { Color = Color3.fromRGB( 60, 60, 75 ), Reflectance = 0.7  },
			[ "Dirt brown" ] = { Color = Color3.fromRGB( 27, 42, 53 ), Reflectance = 0.3 },  -- lowering this a bit because you can sometimes see the moon though it isn't a huge deal
			[ "Silver flip/flop" ] = { Color = Color3.fromRGB( 17, 17, 17 ) },  -- no reflectance otherwise we see moon in floor tiles
			[ "Dark stone grey" ] = { Color = Color3.fromRGB( 80, 80, 90 ), Reflectance = 0.1 },  -- little bits of moon between cracks

		},
		blueprintSuffix = "Royal",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = true
	},

	{	-- WINTER'S CRYPT 3
		dungeonNameS = "Winter's Crypt",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "Ice Halls",
		tileProbabilitiesT =
		{
			HallStraight = 2
		},
		availableBlueprintsT =
		{
			["SpawnSasquatch"] = true,
			["SpawnSkeleton"] = true,
			["Barrel"] = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 7, [9] = 9 },
		lightingT =
		{
			Ambient = Color3.fromRGB( 90, 90, 90 ),
			Brightness = 3,
			OutdoorAmbient = Color3.fromRGB( 0, 0, 0 ),
			FogColor = Color3.fromRGB( 196, 196, 196 ),
			FogStart = 70,
			FogEnd = 150,
		},		
		characterLightN = 0,
		fixedFloorDecorations = 
		{
			"StairEntrance",
			"GroundFog",
			"VolumetricDrips"
		},
		hidePartsSet =
		{
			["Brick"] = true
		},
		decimatePartsT =
		{
			["FloorTile"] = { minSpots = 1, maxSpots = 3, spotSize = 18, survivalPct = 0.8, keep = true },  -- keep might be the opposite of what makes sense here
			["Icicle"] = { maxSpots = 0, survivalPct = 0.77, keep = true },
		},		
		materialSwapT =
		{			
		},
		colorSwapT =
		{
			[ "Pine Cone" ] = { Color = Color3.fromRGB( 170, 230, 240 )},
			[ "Linen" ] = { Color = Color3.fromRGB( 116, 134, 157 )},
			[ "Dirt brown" ] = { Color = Color3.fromRGB( 82, 124, 174 )},
		},
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		blueprintSuffix = "Royal",

		exitStaircaseB = true
	},

	{	-- WINTER'S CRYPT 4
		dungeonNameS = "Winter's Crypt",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "Mausoleum",
		tileProbabilitiesT =
		{
			HallStraight = 2    -- this was 3 but too many times oversimple oversmall dungeon would appear 
		},
		availableBlueprintsT =
		{
			["SpawnNecromancer"] = true,
			["SpawnSkeleton"]   = true,
			["ChandelierIron"] = true,
			["Brazier"] = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 7, [9] = 9 },
		lightingT =
		{
			Ambient = Color3.fromRGB( 90, 90, 90 ),
			Brightness = 3,
			OutdoorAmbient = Color3.fromRGB( 0, 0, 0 ),
			FogColor = Color3.fromRGB( 0, 0, 0 ),
			FogStart = 70,
			FogEnd = 250,
		},		
		characterLightN = 6,
		fixedFloorDecorations = 
		{
			"StairEntrance"
		},
		hidePartsSet =
		{
			["Brick"] = true,
			["Icicles"] = true
		},
		decimatePartsT =
		{
			["FloorTile"] = { minSpots = 1, maxSpots = 3, spotSize = 18, survivalPct = 0.8, keep = false },
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},		
		materialSwapT =
		{			
		},
		blueprintSuffix = "",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = true
	},

	{	-- WINTER'S CRYPT 5
		dungeonNameS = "Winter's Crypt",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "Crumbling Mausoleum",
		tileProbabilitiesT =
		{
			HallCorner = 2    -- this was 3 but too many times oversimple oversmall dungeon would appear 
		},
		availableBlueprintsT =
		{
			["SpawnSkeleton"] = true,
			["SpawnGhost"]   = true,
			["Door"]     = true,
			["ChandelierIron"] = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 7, [9] = 9 },
		lightingT =
		{
			Ambient = Color3.fromRGB( 90, 90, 90 ),
			Brightness = 3,
			OutdoorAmbient = Color3.fromRGB( 0, 0, 0 ),
			FogColor = Color3.fromRGB( 0, 0, 0 ),
			FogStart = 70,
			FogEnd = 250,
		},		
		characterLightN = 0,
		fixedFloorDecorations = 
		{
			"StairEntrance"
		},
		decimatePartsT =
		{
			["FloorTile"] = { minSpots = 2, maxSpots = 4, spotSize = 9, survivalPct = 0.7, keep = true },
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},
		hidePartsSet =
		{
			["Icicles"] = true
		},
		materialSwapT =
		{			
		},
		blueprintSuffix = "",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = true
	},

	{	-- WINTER'S CRYPT 6
		dungeonNameS = "Winter's Crypt",
		tilesetS = "HallTemplatesPalace",
		readableNameS = "The Mist",
		tileProbabilitiesT =
		{
			HallNoWalls = 2,
		},
		availableBlueprintsT =
		{
			["SpawnGhost"]   = true,
			["SpawnZombie"]   = true,
			["PitTrapSpiked"]  = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 7 },
		lightingT =
		{
			FogColor = Color3.fromRGB( 196, 196, 196 ),
			FogStart = 50,
			FogEnd = 100,		
		},
		characterLightN = 8,
		fixedFloorDecorations = 
		{
			"StairEntrance",
			"GroundFog"
		},
		decimatePartsT =
		{
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},		
		hidePartsSet =
		{
			["FloorTiles"] = true,
			["Icicles"] = true
		},
		materialSwapT =
		{			
			[ Enum.Material.Glass ] = { Material = Enum.Material.SmoothPlastic, Transparency = 0 } 
		},
		blueprintSuffix = "Royal",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = true
	},		

	{	-- WINTER'S CRYPT 7
		dungeonNameS = "Winter's Crypt",
		tilesetS = "HallTemplatesPalace",
		readableNameS = "Demon King Winter",
		tileProbabilitiesT =
		{
			HallNoWalls = 2,
		},
		availableBlueprintsT =
		{
			["SpawnDaemonSuper"] = true,
			["SpawnNecromancer"] = true,
			["SpawnSkeleton"] = true,
			["Pedestal"] = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 5, [6] = 7 },
		lightingT =
		{
			Ambient = Color3.fromRGB( 160, 160, 190 ),	
			FogColor = Color3.fromRGB( 10, 0, 0 )			
		},
		characterLightN = 8,
		fixedFloorDecorations = 
		{
			"StairEntrance"
		},
		decimatePartsT =
		{
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},		
		hidePartsSet =
		{
			["FloorTiles"] = true,
			["Icicles"] = true
		},
		materialSwapT =
		{			
			[ Enum.Material.Glass ] = { Material = Enum.Material.SmoothPlastic, Transparency = 0 } 
		},
		blueprintSuffix = "Royal",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = false
	},		

	{	-- 1
		dungeonNameS = "Subdweller Colony",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "Subcellar",
		tileProbabilitiesT =
		{
			HallStraight = 2    -- this was 3 but too many times oversimple oversmall dungeon would appear 
		},
		availableBlueprintsT =
		{
			["SpawnSasquatch"] = true,
			["SpawnGremlin"]   = true,
			["WoodTable"]     = true,
			["WoodChair"]     = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 7, [9] = 9 },
		lightingT =
		{
			FogEnd = 250,
		},		
		characterLightN = 0,
		fixedFloorDecorations = 
		{
			"StairEntrance"
		},
		hidePartsSet =
		{
			["FloorTiles"] = true,
			["Icicles"] = true
		},
		decimatePartsT =
		{
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},		
		materialSwapT =
		{			
		},
		blueprintSuffix = "",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = true
	},

	{	-- 2
		dungeonNameS = "Subdweller Colony",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "Humanoids",
		tileProbabilitiesT =
		{
			HallStraight = 2,
			HallCorner = 3,
		},
		availableBlueprintsT =
		{
			["SpawnSasquatch"] = true,
			["SpawnOrc"]       = true,
			["Fence"]          = true,
			["PitTrap"]        = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 7, [9] = 9 },
		lightingT =
		{
		},
		characterLightN = 8,
		fixedFloorDecorations = 
		{
			"StairEntrance"
		},
		hidePartsSet =
		{
			["FloorTiles"] = true,
			["Icicles"] = true
		},
		decimatePartsT =
		{
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},		
		materialSwapT =
		{			
		},
		blueprintSuffix = "",
		startPoint = Vector2.new( 0, 0 ),
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = true
	},	

	{	-- 3
		dungeonNameS = "Subdweller Colony",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "Gloom",
		tileProbabilitiesT =
		{
			HallStraight = 2,
		},
		availableBlueprintsT =
		{
			["SpawnOrc"] = true,
			["SpawnGremlin"]  = true,
			["Brazier"]  = true,
			["TrappedChest"]   = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 7 },
		lightingT =
		{
			Ambient = Color3.fromRGB( 70, 70, 70 ),
			Brightness = 2,
			OutdoorAmbient = Color3.fromRGB( 0, 0, 0 ),
			FogColor = Color3.fromRGB( 0, 0, 0 ),
			FogStart = 70,
			FogEnd = 140
		},
		characterLightN = 14,
		fixedFloorDecorations = 
		{
			"StairEntrance"
		},
		hidePartsSet =
		{
			["FloorTiles"] = true,
			["Icicles"] = true
		},	
		decimatePartsT =
		{
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},		
		materialSwapT =
		{			
		},
		blueprintSuffix = "",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = true
	},	

	{	-- 4
		dungeonNameS = "Subdweller Colony",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "Campgrounds",
		tileProbabilitiesT =
		{
			HallNoWalls = 2,
		},		
		availableBlueprintsT =
		{
			["SpawnSasquatch"] = true,
			["SpawnWerewolf"] = true,
			["TrappedChest"] = true,
			["PitTrap"] = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 7, [8] = 9 },
		lightingT =
		{
			Ambient = Color3.fromRGB( 150, 150, 180 ),					
		},
		characterLightN = 8,
		fixedFloorDecorations = 
		{
			"StairEntrance"
		},
		hidePartsSet =
		{
			["FloorTiles"] = true,
			["Icicles"] = true
		},
		decimatePartsT =
		{
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},		
		materialSwapT =
		{			
		},
		blueprintSuffix = "",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = true
	},			

	{	-- 5
		dungeonNameS = "Subdweller Colony",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "The Dark",
		tileProbabilitiesT =
		{
			HallNoWalls = 3,
		},
		availableBlueprintsT =
		{
			["SpawnOrc"]      = true,
			["SpawnWerewolf"] = true,
			["Brazier"]  = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 7, [8] = 9 },
		lightingT =
		{
			Ambient = Color3.fromRGB( 0, 0, 0 ),
			Brightness = 0,
			OutdoorAmbient = Color3.fromRGB( 0, 0, 0 ),
			FogColor = Color3.fromRGB( 0, 0, 0 ),
			FogStart = 35,
			FogEnd = 200
		},
		characterLightN = 20,
		fixedFloorDecorations = 
		{
			"StairEntrance"
		},
		hidePartsSet =
		{
			["FloorTiles"] = true,
			["Icicles"] = true
		},	
		decimatePartsT =
		{
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},		
		materialSwapT =
		{			
		},
		blueprintSuffix = "",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = true
	},

	{	-- 6
		dungeonNameS = "Subdweller Colony",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "Miasma",
		tileProbabilitiesT =
		{
			HallStraight = 2,
		},		
		sizesT = { [1] = 7, [8] = 9 },
		availableBlueprintsT =
		{
			["SpawnGremlin"]   = true,
			["SpawnWerewolf"]  = true,
			["Gate"]      = true,
			["Brazier"]   = true
		},
		forbiddenBlueprintsT = {},
		sizeN = 7,
		lightingT =
		{
			Ambient = Color3.fromRGB( 77, 115, 92 ),
			Brightness = 4,
			FogColor = Color3.fromRGB( 45, 193, 107 ),
		},
		characterLightN = 8,
		fixedFloorDecorations = 
		{
			"StairEntrance"
		},
		hidePartsSet =
		{
			["FloorTiles"] = true,
			["Icicles"] = true
		},	
		decimatePartsT =
		{
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},		
		materialSwapT =
		{			
		},
		blueprintSuffix = "",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = true
	},	

	{	-- 7
		dungeonNameS = "Subdweller Colony",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "The Cyclops Queen",
		tileProbabilitiesT =
		{
			HallCorner = 2,
		},
		availableBlueprintsT =
		{
			["SpawnCyclopsSuper"] = true,
			["SpawnOrc"] = true,
			["SpawnGremlin"] = true,
			["GargoyleFountain"] = true,
			["Gate"] = true
		},
		forbiddenBlueprintsT = {},
		sizesT = { [1] = 5, [6] = 7 },
		lightingT =
		{
			Ambient = Color3.fromRGB( 190, 160, 160 ),	
			FogColor = Color3.fromRGB( 10, 0, 0 )			
		},
		characterLightN = 8,
		fixedFloorDecorations = 
		{
			"StairEntrance"
		},
		hidePartsSet =
		{
			["FloorTiles"] = true,
			["Icicles"] = true
		},
		decimatePartsT =
		{
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},		
		materialSwapT =
		{			
		},
		blueprintSuffix = "",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = false
	},		

	
	{
		dungeonNameS = "Underhaven",
		tilesetS = "HallTemplatesDungeon",
		readableNameS = "Underhaven",
		tileProbabilitiesT =
		{
			HallNoWalls = 100,
		},
		availableBlueprintsT =
		{
			["SpawnOrc"]   = true,
		},
		forbiddenBlueprintsT =
		{
			["Chest"] = true,
			["TrappedChest"] = true
		},
		sizesT = { [1] = 9 },
		lightingT =
		{
			Ambient = Color3.fromRGB( 130, 130, 130 ),
			Brightness = 2,
			OutdoorAmbient = Color3.fromRGB( 0, 0, 0 ),
			FogEnd = 250
		},		
		characterLightN = 0,
		fixedFloorDecorations = 
		{ 
			"VolumetricLightWisps", 
			"VolumetricShiftingParticles" 
		},
		hidePartsSet =
		{
			["Icicles"] = true
		},	
		decimatePartsT =
		{
			["Brick"] = { maxSpots = 0, survivalPct = 0.9, keep = true }
		},		
		materialSwapT =
		{			
		},
		blueprintSuffix = "",
		startX = 0, startY = 0, startTileModelName = "HallNoWalls", startOpeningsA = {1, 2, 3, 4},
		exitStaircaseB = false
	},
}

function FloorData:CurrentFloor()
	return FloorData.floorsA[ workspace.GameManagement.DungeonFloor.Value ]
end


function FloorData:CalculateFloorSize( floorT )
	local numPlayers = #game.Players:GetPlayers()
	local sizeN = floorT.sizesT[ 1 ]                      -- go with default size if for some reason no players
	for playerCount, size in pairs( floorT.sizesT ) do
		if numPlayers >= playerCount then
			sizeN = math.max( sizeN, size )
		end
	end
	DebugXL:Assert( sizeN >= 5 )
	sizeN = math.max( sizeN, 5 )
	InstanceXL:CreateSingleton( "NumberValue", { Name = "FloorSize", Parent = workspace.GameManagement, Value = sizeN } )
end


function FloorData:CurrentFloorSize()
	return workspace:WaitForChild("GameManagement"):WaitForChild("FloorSize").Value
end


-- validate
for i, floor in pairs( FloorData.floorsA ) do
	for blueprintS, _ in pairs( floor.availableBlueprintsT ) do
		if not PossessionData.dataT[ blueprintS ] then
			DebugXL:Error( blueprintS.." on floor "..i.." doesn't exist" )
		end
	end
	if( not floor.blueprintSuffix )then
		DebugXL:Error( floor.readableNameS .. 'missing blueprintSuffix')
	end
end

return FloorData
