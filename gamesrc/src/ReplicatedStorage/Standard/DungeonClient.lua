
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local FloorData = require( game.ReplicatedStorage.Standard.FloorData )
local MapTileData = require( game.ReplicatedStorage.MapTileDataModule )

local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize


local DungeonClient = {}

DungeonClient.connectedFuncs = {}

function DungeonClient:HasWall( x, y, dirEnum )
	if not DungeonClient.map then  -- possible map hasn't loaded yet
		return true
	else
		return MapTileData:HasWall( DungeonClient.map, x, y, dirEnum )
	end
end

function DungeonClient:MapUpdateEventConnect( voidfunc )
	table.insert( DungeonClient.connectedFuncs, voidfunc )
end


function DungeonClient:GetFloorName( depthN, floorN )
	if floorN <= 0 or floorN > #FloorData.floorsA then
		DebugXL:Error( "Attempt to access out of bounds floor "..floorN )
		return ""
	end
	return Localize.formatByKey( "FloorFullName", 
		{
			dungeonname = Localize.formatByKey( FloorData.floorsA[ floorN ].dungeonNameS ),
			floorname = Localize.formatByKey( FloorData.floorsA[ floorN ].readableNameS ),
			depth = depthN
		} )
end


function DungeonClient:GetLevelName()
	local floorN = workspace.GameManagement.DungeonFloor.Value
	local depthN = workspace.GameManagement.DungeonDepth.Value
	return DungeonClient:GetFloorName( depthN, floorN )
end


-- this idiom bothers me because of the push but I can't think of anything better - waiting for a server invoke is too painful
-- we could pull the map directly from the environment looking at the tiles
-- I could store the map in folders of folders of values

-- and now I've long-since given up on worrying about push idioms with remoteevents  -1/12/19
function DungeonClient.UpdateDungeonMap( map )
	DungeonClient.map = map
	--warn("Updated dungeon map for "..workspace.GameManagement.DungeonFloor.Value)
	for _, func in pairs( DungeonClient.connectedFuncs ) do
		func()
	end
end




workspace.Signals.DungeonRE.OnClientEvent:Connect( function( funcName, ... ) 
	DungeonClient[ funcName ]( ... )
end)


DungeonClient.map = workspace.Signals.DungeonRF:InvokeServer( "GetMap" )

return DungeonClient
