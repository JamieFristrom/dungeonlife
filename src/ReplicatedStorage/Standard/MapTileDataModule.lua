local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )
local TableXL = require( game.ReplicatedStorage.Standard.TableXL )

local AssetManifest = require( game.ReplicatedStorage.TS.AssetManifest ).AssetManifest

local FloorData = require( game.ReplicatedStorage.FloorData )

local MapTileData = {
	tileWidthN = 40,
	
	masterDataA = {
	-- openings start counting from North AKA Front AKA NegativeZ and go COUNTER CLOCKWISE because a positive roblox 
	-- rotation around Y goes counter clockwise and we choose to match
		{ modelName = "HallNoWalls", minimapImage = AssetManifest.ImageMapHallNoWalls, openingsA = { 1, 2, 3, 4 }, replaceableB = true },
		{ modelName = "HallOneWall", minimapImage = AssetManifest.ImageMapHallOneWall, openingsA = { 1, 3, 4 }, replaceableB = true },
		{ modelName = "HallStraight", minimapImage = AssetManifest.ImageMapHallStraight,  openingsA = { 1, 3 }, replaceableB = true },
		{ modelName = "HallCorner",  minimapImage = AssetManifest.ImageMapHallCorner, openingsA = { 3, 4 }, replaceableB = true },
		{ modelName = "HallThreeWalls",  minimapImage = AssetManifest.ImageMapHallThreeWalls, openingsA = { 2 }, replaceableB = true },
		{ modelName = "BlockWall", minimapImage = AssetManifest.ImageMapBlockWall, openingsA = { }, replaceableB = true },     		
		-- staircase must be last in the array
		{ modelName = "DownStaircase", minimapImage = AssetManifest.ImageMapDownStaircase, openingsA = { 1, 2, 3, 4 }, replaceableB = true },
		-- specials
		{ modelName = "HallOneWallGate", minimapImage = AssetManifest.ImageMapHallOneWallGate, openingsA = { 1, 3, 4 }, replaceableB = false } 
	},
	
	masterDataT = {},
	
	DirEnum = 
	{
		North = 1,
		West  = 2,
		South = 3,
		East  = 4
	},
	
-- we're making our x, y coordinate system match roblox's x, z when viewed from above
-- it's counterintuitive to me, but if x is right then z increases as you go down
-- like a screen rather than a graph
-- roblox standard is negative z is forward according to http://wiki.roblox.com/index.php?title=CFrame#lookVector
-- positive x is right
-- in other words, if y is up and x is right, positive z comes out of the screen towards you
-- that'll be hard for me to get used to 
-- ok, *this* I cannot believe: rotating around y rotates counter-clockwise if you're looking down on what's rotating
-- that seems totally screwed up to me 
-- I guess let's match with our compass directions
	dirsForCompassA = 
	{   
		Vector2.new( 0, -1 ),  -- 'north'
		Vector2.new( -1, 0 ),  -- 'west'
		Vector2.new( 0, 1 ),   -- 'south'
		Vector2.new( 1, 0 )    -- 'east'
	} 

}

for _, tile in pairs( MapTileData.masterDataA ) do
	MapTileData.masterDataT[ tile.modelName ] = tile
end

MapTileData.cellWidthN = 45 
MapTileData.cellInteriorWidthN = 33

function MapTileData:CenterV3()
	local sizeN = FloorData:CurrentFloorSize()
	return Vector3.new( math.ceil( sizeN/2 ), 0, math.ceil( sizeN/2 ) )	
end


function MapTileData:StartV3()
	local curFloor = FloorData:CurrentFloor()
	return MapTileData:CenterV3() + Vector3.new( curFloor.startX, 0, curFloor.startY )
end


-- returns true if there's a wall as far as this tile is concerned
function MapTileData:HasFacade( map, x, z, dirEnum )
	DebugXL:Assert( MapTileData == self )
	DebugXL:Assert( map )
	DebugXL:Assert( x )
	DebugXL:Assert( z )
	DebugXL:Assert( x >= 1 )
	DebugXL:Assert( x <= FloorData:CurrentFloorSize() )
	DebugXL:Assert( z >= 1 )
	DebugXL:Assert( z <= FloorData:CurrentFloorSize() )
	
	if not map then return end
	if not map[ x ][ z ].compassRotationN then
		DebugXL:Error( "Map coordinate "..x..", "..z.." has no compassRotationN" )
	end
	local dirRelativeToTile = ( dirEnum - map[ x ][ z ].compassRotationN + 4 - 1 ) % 4 + 1 
	local tileName = map[ x ][ z ].tileName
	if type(tileName) ~= "string" then
		DebugXL:Error( "WTF" )
	end
	local tile = MapTileData.masterDataT[ tileName ]
	local openingsA = tile.openingsA	
	return not TableXL:FindFirstElementIdxInA( openingsA,
		dirRelativeToTile )	
end

-- returns whether there is a wall on either side of the cell edge
function MapTileData:HasWall( map, x, z, dirEnum )
	DebugXL:Assert( MapTileData == self )
	DebugXL:Assert( map )
	DebugXL:Assert( x )
	DebugXL:Assert( z )
	if not map then return end
	local adjacentSquareX = x + MapTileData.dirsForCompassA[ dirEnum ].X
	local adjacentSquareZ = z + MapTileData.dirsForCompassA[ dirEnum ].Y
	if adjacentSquareX < 1 then return true end
	if adjacentSquareZ < 1 then return true end
	if adjacentSquareX > FloorData:CurrentFloorSize() then return true end
	if adjacentSquareZ > FloorData:CurrentFloorSize() then return true end
	return MapTileData:HasFacade( map, x, z, dirEnum )
		or MapTileData:HasFacade( map, adjacentSquareX, adjacentSquareZ, ( dirEnum + 2 - 1 ) % 4 + 1 ) 
end


function MapTileData:GetGridCellFromWorldPoint( x, z )
	DebugXL:Assert( self == MapTileData )
	return math.floor( ( x + MapTileData.cellWidthN * 0.5 ) / MapTileData.cellWidthN ) + MapTileData:CenterV3().X, 
		 math.floor( ( z + MapTileData.cellWidthN * 0.5 ) / MapTileData.cellWidthN ) + MapTileData:CenterV3().Z
end


function MapTileData:GridCellCenterWorldV3( x, z )
	return Vector3.new( ( x - MapTileData:CenterV3().X - 0.5 ) * MapTileData.cellWidthN , 0, 
		( z - MapTileData:CenterV3().Z - 0.5 ) * MapTileData.cellWidthN )
end



return MapTileData
