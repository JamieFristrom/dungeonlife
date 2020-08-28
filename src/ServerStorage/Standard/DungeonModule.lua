
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())
--[[
	
	Dungeon Builder 2.0
	
	Builds dungeon
	
	Level ideas:
	- ruined cathedral (orcs, sasquatches ) -- more straights (typical)
	- subdwellers  (orcs, gremlins)
	- infected  ( zombies, werewolves )
	- catacombs ( skeletons, ghosts )  (larger and twistier)
	- cyclops level (smaller)
	- dragon level (smaller, more open)
	- daemon level (smaller, more open)
	
--]]
local MathXL         = require( game.ReplicatedStorage.Standard.MathXL )
local InstanceXL     = require( game.ReplicatedStorage.Standard.InstanceXL )
local TableXL        = require( game.ReplicatedStorage.Standard.TableXL )

local FloorData      = require( game.ReplicatedStorage.FloorData )
local MapTileData    = require( game.ReplicatedStorage.MapTileDataModule )

local StructureFactory = require( game.ServerStorage.TS.StructureFactory ).StructureFactory
local TileServer = require( game.ServerStorage.TS.TileServer ).TileServer
local FixedFloorDecorations = require( game.ServerStorage.TS.FixedFloorDecorations ).FixedFloorDecorations

-- this ought to belong in the DungeonUtility module:
local function GridWidth()
	return FloorData:CurrentFloorSize()
end

local function CenterV3()
	return MapTileData:CenterV3()
end

local downStaircaseV2 

local nextLevelFunc

function DownStaircaseConstructor( context, tileModel )
	local trapDoors = tileModel.FloorStaircase:FindFirstChild("TrapDoors")
	StructureFactory.createStructure( context, trapDoors ) -- makes it destructible
	-- could go in a TrapDoor component or even a 'destruction activates touch box' component
	local rainbowConnection
	rainbowConnection = tileModel.FloorStaircase.TeleportPlane.Touched:Connect( function( toucher )
		local trapDoorHumanoid = trapDoors and trapDoors:FindFirstChild("Humanoid") 
		if not trapDoors or not trapDoorHumanoid or trapDoorHumanoid.Health <= 0 then
			local humanoid = toucher.Parent:FindFirstChild("Humanoid")
			if humanoid then
				DebugXL:logD(LogArea.GameManagement,"Down staircase touched by part "..toucher:GetFullName() ) 
				local player = game.Players:GetPlayerFromCharacter( toucher.Parent )
				if player then
					DebugXL:logI(LogArea.GameManagement,"Down staircase touched by player "..player:GetFullName() ) 
					DebugXL:Assert( nextLevelFunc)
					if nextLevelFunc( player ) then 
						DebugXL:logD(LogArea.GameManagement,"Disconnecting rainbow" ) 
						rainbowConnection:Disconnect()
					end					
				end
			end
		end
	end) 
end

local Dungeon = {}

--------------------------------------------------------------------------------------------------------------------
-- Dungeon generation 
--------------------------------------------------------------------------------------------------------------------
local map = {}  -- map is a 2d array, x first, of { tileName: string, compassRotation: number }
local mapVisited = {}
local mapCompleteB = false

function ClearGrid()
	-- create map array
	map = {}
	mapVisited = {}
	mapCompleteB = false
	for x = 1, GridWidth() do
		mapVisited[x] = {}
		map[x]        = {}		
		for y = 1, GridWidth() do
			map[x][y] = { tileName = "BlockWall", compassRotationN = 0 }
		end
	end
end



local cellWidth = 45 

function ConstrainCompassWrap( unconstrainedDir )
	unconstrainedDir = unconstrainedDir - 1  -- -1 compensates for mod being 0-based
	local result = math.fmod( unconstrainedDir, 4 )
	if result < 0 then
		result = result + 4
	end
	return result + 1  -- uncompensate
end

function GrowTowardsOpenings( x, y, skipOpeningN )
	local compassRotationN = map[x][y].compassRotationN
	local openingsA = MapTileData.masterDataT[ map[x][y].tileName ].openingsA
-- grow in the directions that tile likes
	-- so all the directions except the one we came from
	-- so, for example, if the one-wall tile came from 4 (west) and we picked opening 1 (north), its 1 (north) is facing 4 (west)
	-- the other 2 openings ( 2 & 3 ) face 1 (north) and 2 (east)
	-- if compassRotationN is 0, then they match
	-- if it is -1, then they rotate left 1, and vice-versa
	for localGrowOpeningN=1,4 do
		if localGrowOpeningN ~= skipOpeningN then 
			
			if TableXL:FindFirstElementIdxInA( openingsA, localGrowOpeningN ) then
				-- 
				local adjustedOpening = localGrowOpeningN + compassRotationN 
				local constrainedOpening = ConstrainCompassWrap( adjustedOpening )
				
				local dir = MapTileData.dirsForCompassA[ constrainedOpening ]
				local destCell = dir + Vector2.new( x, y )
				GrowFromGridCell( destCell.X, destCell.Y, constrainedOpening + 2 )  --we don't need to ConstrainCompassWrap() the 'from direction' here; the math works out
			end
		end
	end
end

local tilePlacementQueue = {}

function PlaceStartTile( x, y, tileModelName, openingsA )
	DebugXL:Assert( not mapVisited[x][y])
	mapVisited[x][y] = true
	map[x][y] = { tileName = tileModelName, compassRotationN = 0 }	
 	table.insert( tilePlacementQueue, { x, y, nil } )

	while next( tilePlacementQueue ) ~= nil do
		local tilePlacement = table.remove( tilePlacementQueue, 1 )
		GrowTowardsOpenings( unpack( tilePlacement ) )
	end
end


-- just makes the internal map, doesn't place physical tiles into the world
function GrowFromGridCell( x, y, fromCompassDirectionN )
	if x<1 or x>GridWidth() or y<1 or y>GridWidth() then
		return
	end
	-- if there's already a tile there bail
	if mapVisited[x][y] then
		return
	end	
	mapVisited[x][y] = true
--	wait( 0.5 )
	local tileV3   = Vector3.new( x, 0, y )
	local distanceToCenter = ( tileV3 - CenterV3() ).Magnitude

	local tileN
	local tileRange = 4
	local tileWeights = {}
	for i = 1, 4 do
		tileWeights[ i ] = FloorData:CurrentFloor().tileProbabilitiesT[ MapTileData.masterDataA[ i ].modelName ] or 1 
	end
	tileN = MathXL:RandomBiasedInteger1toN( tileWeights )
	
	local tile = MapTileData.masterDataA[tileN]

	-- new tile's rotation depends on where we grew from; we make one of the openings face that direction
	-- by picking a random choice from the possible openings
	-- figuring out where we came from
	-- rotating appropriately; if the opening is 1 (north) and we came from 1 (north) we rotate 0; 
	-- opening 2 (west) and we came from 2 (west) we rotate 0;
	-- opening 1 (north) and we came from 2 (west) we rotate 90;
	-- opening 1 (north) and we came from 4 or 0 (east) we rotate -90
	-- so it looks like ( from - opening ) * 90
	-- things are complicated by the possibility of going below 0
	-- 1 - 4 will return -3 and that's fine: -270 degrees
	-- 1 - 2 will return -1 and it should be -1
	local tileRotationN = MathXL:RandomInteger( 1, #tile.openingsA )
--	--print( "tileN "..tileN )
	local openingN = tile.openingsA[ tileRotationN ]
	local compassRotationN =  fromCompassDirectionN - openingN

	map[x][y] = { tileName = MapTileData.masterDataA[ tileN ].modelName, compassRotationN = compassRotationN }	

	table.insert( tilePlacementQueue, { x, y, openingN } )
end  
	


local WallsToTileData = { } -- [northB][westB][southB][eastB]

-- multidimension array
for i = 0, 1 do 
	WallsToTileData[i] = {}
	for j = 0, 1 do
		WallsToTileData[i][j] = {}
		for k = 0, 1 do
			WallsToTileData[i][j][k] = {}
		end
	end
end

WallsToTileData[0][0][0][0] = { name = "HallNoWalls", rot = 0 }
WallsToTileData[0][0][0][1] = { name = "HallOneWall", rot = 2 }  -- one wall has wall on west
WallsToTileData[0][0][1][0] = { name = "HallOneWall", rot = 1 }
WallsToTileData[0][0][1][1] = { name = "HallCorner", rot = 2 }  -- corner has wall on nw
WallsToTileData[0][1][0][0] = { name = "HallOneWall", rot = 0 }
WallsToTileData[0][1][0][1] = { name = "HallStraight", rot = 0 }  -- straight has walls on east/west
WallsToTileData[0][1][1][0] = { name = "HallCorner", rot = 1 }
WallsToTileData[0][1][1][1] = { name = "HallThreeWalls", rot = 3 }  -- opening on west
WallsToTileData[1][0][0][0] = { name = "HallOneWall", rot = 3 }
WallsToTileData[1][0][0][1] = { name = "HallCorner", rot = 3 }
WallsToTileData[1][0][1][0] = { name = "HallStraight", rot = 1 }
WallsToTileData[1][0][1][1] = { name = "HallThreeWalls", rot = 0 }
WallsToTileData[1][1][0][0] = { name = "HallCorner", rot = 0 }
WallsToTileData[1][1][0][1] = { name = "HallThreeWalls", rot = 1 }
WallsToTileData[1][1][1][0] = { name = "HallThreeWalls", rot = 2 }
WallsToTileData[1][1][1][1] = nil  -- error


function GetTileForWalls( northB, westB, southB, eastB )
	return WallsToTileData[ northB ][ westB ][ southB ][ eastB ]
end


function MapUpgradePass()
	for x = 1, GridWidth() do
		for z = 1, GridWidth() do
			if mapVisited[ x ][ z ] then
				if( MapTileData.masterDataT[ map[x][z].tileName ].replaceableB )then
					local northWall = MapTileData:HasWall( map, x, z, MapTileData.DirEnum.North ) and 1 or 0
					local westWall  = MapTileData:HasWall( map, x, z, MapTileData.DirEnum.West ) and 1 or 0
					local southWall = MapTileData:HasWall( map, x, z, MapTileData.DirEnum.South ) and 1 or 0
					local eastWall  = MapTileData:HasWall( map, x, z, MapTileData.DirEnum.East ) and 1 or 0
					local appropriateTile = WallsToTileData[ northWall ][ westWall ][ southWall ][ eastWall ]
					map[ x ][ z ] = { tileName = appropriateTile.name, compassRotationN = appropriateTile.rot }
				end
			end
		end
	end
end


function PlaceTiles( tilesetFolder )
	for x=1, GridWidth() do
		for z=1, GridWidth() do
			local tile = MapTileData.masterDataT[ map[x][z].tileName ]
			local compassRotationN = map[x][z].compassRotationN 
			TileServer.placeTile( tilesetFolder[ tile.modelName ], x, z, compassRotationN )
		end
	end
end


function SurroundWithWalls( tilesetFolder )
	local center = math.ceil( GridWidth() / 2 )
	for i=1,GridWidth() do
		local tileModel = tilesetFolder.BlockWall:Clone()
		local positionCFrame = CFrame.new( ( 0 - center ) * cellWidth, tileModel.PrimaryPart.Size / 2, ( i - center ) * cellWidth )
		tileModel:SetPrimaryPartCFrame( positionCFrame )
		tileModel.Parent = game.Workspace.Environment
	end
	for i=1,GridWidth() do
		local tileModel = tilesetFolder.BlockWall:Clone()
		local positionCFrame = CFrame.new( ( i - center ) * cellWidth, tileModel.PrimaryPart.Size / 2, ( 0 - center ) * cellWidth ) 
		tileModel:SetPrimaryPartCFrame( positionCFrame )
		tileModel.Parent = game.Workspace.Environment
	end
	for i=1,GridWidth() do
		local tileModel = tilesetFolder.BlockWall:Clone()
		local positionCFrame = CFrame.new( ( (GridWidth()+1) - center ) * cellWidth, tileModel.PrimaryPart.Size / 2, ( i - center ) * cellWidth ) 
		tileModel:SetPrimaryPartCFrame( positionCFrame )
		tileModel.Parent = game.Workspace.Environment
	end	
	for i=1,GridWidth() do
		local tileModel = tilesetFolder.BlockWall:Clone()
		local positionCFrame = CFrame.new( ( i - center ) * cellWidth, tileModel.PrimaryPart.Size / 2, ( (GridWidth()+1) - center ) * cellWidth ) 
		tileModel:SetPrimaryPartCFrame( positionCFrame )
		tileModel.Parent = game.Workspace.Environment
	end	
	-- fill up empty spaces with walls so ghosts don't walk offstage
	for x=1,GridWidth() do
		for z=1,GridWidth() do
			if not mapVisited[ x ][ z ] then 
				local tileModel = tilesetFolder.BlockWall:Clone()
				local positionCFrame = CFrame.new( ( x - center ) * cellWidth, 
					tileModel.PrimaryPart.Position / 2, 
					( z - center ) * cellWidth ) 
				tileModel:SetPrimaryPartCFrame( positionCFrame )
				tileModel.Parent = game.Workspace.Environment
			end
		end
	end
end


function LocateStaircase()
	-- .y in the v3s is ignored
	local validStaircaseV3A = {}
	for x = 1, GridWidth() do
		for z = 1, GridWidth() do
			if map[ x ][ z ].tileName ~= "BlockWall" then
				local potentialStaircaseV3 = Vector3.new( x, 0, z )
				local distanceToCenter = ( potentialStaircaseV3 - MapTileData:StartV3() ).Magnitude
				local staircaseOk = distanceToCenter >= GridWidth() / 2 - 1   -- 5 -> 1.5, 7 -> 2.5, 9 -> 3.5
				if staircaseOk then
					table.insert( validStaircaseV3A, potentialStaircaseV3 )
				end
			end
		end
	end
	if #validStaircaseV3A <= 0 then
		print( "Too small for staircase. Try again.")
		return nil 
	end	
	
	local staircaseV3 = validStaircaseV3A[ MathXL:RandomInteger( 1, #validStaircaseV3A ) ]
	return staircaseV3 
end


function PlaceStaircase( context, staircaseV3 )
	local tileModel = workspace.Environment[ "Tile_"..staircaseV3.X.."_"..staircaseV3.Z ]
	local downStaircase = workspace.FloorTemplates.FloorStaircase:Clone()
	local saveCFrame = tileModel:GetPrimaryPartCFrame()
	tileModel.Floor:Destroy()
	downStaircase:SetPrimaryPartCFrame( saveCFrame )	
	downStaircase.Parent = tileModel
	tileModel.PrimaryPart = downStaircase.PrimaryPart
	tileModel.Name = "DownStaircase"
	DownStaircaseConstructor( context, tileModel )
	return true
end

function Dungeon:Clean()
	FixedFloorDecorations.Clean()
	InstanceXL:UnparentAllChildren( workspace.Bits )
	InstanceXL:UnparentAllChildren( workspace.Drops )
	InstanceXL:UnparentAllChildren( workspace.MonsterSpawns )
	InstanceXL:UnparentAllChildren( workspace.Environment )
	InstanceXL:UnparentAllChildren( workspace.Building )
	ClearGrid()
end

function Dungeon:BuildWait( context, _nextLevelFunc )
	DebugXL:Assert( self == Dungeon )
	DebugXL:logW(LogArea.GameManagement, "Building dungeon")
	nextLevelFunc = _nextLevelFunc
	local staircaseV3 
	-- once in a blue moon a map makes it impossible to place a staircase; keep going until we get one
	local currentFloor = FloorData:CurrentFloor()
	FloorData:CalculateFloorSize( currentFloor )
	local tilesetFolder = workspace[ currentFloor.tilesetS ]
	while not staircaseV3 do
		local floorCreationStartTime = tick()
		Dungeon:Clean()
		PlaceStartTile( math.ceil( GridWidth() / 2) + currentFloor.startX, 
			math.ceil( GridWidth() / 2) + currentFloor.startY, 
			currentFloor.startTileModelName )
--		GrowFromGridCell( math.ceil( GridWidth() / 2) + startPointV2.X, math.ceil( GridWidth() / 2) + startPointV2.Y, 1 )
--		GrowFromGridCell( math.ceil( GridWidth() / 2), math.ceil( GridWidth() / 2)-1, 3 )
		staircaseV3 = LocateStaircase()
		local totalTime = tick() - floorCreationStartTime
		if not staircaseV3 then 
			print( "Floor creation attempt failed. Took ".. totalTime )
		else
			print( "Floor creation attempt succeeded. Took ".. totalTime )
		end
	end
		
	MapUpgradePass()
	PlaceTiles( tilesetFolder )
	SurroundWithWalls( tilesetFolder )
	if FloorData:CurrentFloor().exitStaircaseB then
		PlaceStaircase( context, staircaseV3 )
	end
	mapCompleteB = true
	
	workspace.Signals.DungeonRE:FireAllClients( "UpdateDungeonMap", map )
	warn("Updated minimaps on clients for level "..workspace.GameManagement.DungeonFloor.Value)
	
	InstanceXL.new( "BoolValue", { Name = "DungeonComplete", Parent = workspace.Environment, Value = true } )
	local floorData = FloorData.floorsA[ workspace.GameManagement.DungeonFloor.Value ]
	for k, thing in pairs( FloorData.lightingDefaultsT ) do
		game.Lighting[ k ] = thing  
	end
	for k, thing in pairs( floorData.lightingT ) do
		game.Lighting[ k ] = thing
	end

	FixedFloorDecorations.Setup()
end


function Dungeon:GetDownStaircaseV2()
	return downStaircaseV2
end


function Dungeon:GetMap()
	DebugXL:Assert( mapCompleteB )
	return map
end

--------------------------------------------------------------------------------------------------------------------
-- Remote Dispatching
--------------------------------------------------------------------------------------------------------------------

local DungeonRemote = {}


function DungeonRemote.DownstairsCheat( player )
--	TeleportToNextLevel( player )
end


function DungeonRemote.NextStep( player )
	
end


function DungeonRemote.GetMap()
	while not mapCompleteB do wait(0.5) end
	return Dungeon:GetMap()
end


local function DispatchFunc( player, funcName, args ) 
	return DungeonRemote[ funcName ]( player, args )
end


workspace.Signals.DungeonRF.OnServerInvoke = DispatchFunc
workspace.Signals.DungeonRE.OnServerEvent:Connect( DispatchFunc )

return Dungeon