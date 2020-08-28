
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local FloorData       = require( game.ReplicatedStorage.FloorData )
local MapTileData     = require( game.ReplicatedStorage.MapTileDataModule )
local PossessionData  = require( game.ReplicatedStorage.PossessionData )

local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest
local BlueprintUtility = require( game.ReplicatedStorage.TS.BlueprintUtility ).BlueprintUtility

local cellWidthN = MapTileData.cellWidthN

local FurnishUtility = {}


function FurnishUtility:CanIFurnish( player )
	return player.Team == game.Teams.Monsters or player:FindFirstChild("FurnishPower") or Places.getCurrentPlace() == Places.places.Underhaven
end

-- all v3's except rotation
function FurnishUtility:IsWithinBoundaries( _, _, objectPosition, objectSize, objectRotation)
		-- will only work if base size/position is an unrotated rectangle, or if baseSize is a square
		-- base CAN be rotated in 90 degree increments (unless it's a rectangle, that is not supported here)

	local basePosition = Vector3.new( 0, 0, 0 )
	local baseSize = Vector3.new( FloorData:CurrentFloorSize() * MapTileData.cellWidthN, 0, FloorData:CurrentFloorSize() * MapTileData.cellWidthN )
	DebugXL:Assert( self == FurnishUtility )
	local positionOffset = basePosition - objectPosition
	local sizeOffset = (baseSize / 2) - (objectSize / 2)
	
	local px = positionOffset.X
	local pz = positionOffset.Z
	
	local sx = sizeOffset.X
	local sz = sizeOffset.Z
	
	if objectRotation == 0 or objectRotation == 2 then
		return (px <= sx and px >= -sx and pz <= sz and pz >= -sz)
	else
		return (px <= sz and px >= - sz and pz <= sx and pz >= -sx)
	end
end


-- all parameters are v3's, ignores Y
function FurnishUtility:AABBIntersection2D(basePosition, baseSize, objectPosition, objectSize)
	DebugXL:Assert( self == FurnishUtility )
	return math.abs( basePosition.X - objectPosition.X ) * 2 < ( baseSize.X + objectSize.X ) and
		math.abs( basePosition.Z - objectPosition.Z ) * 2 < ( baseSize.Z + objectSize.Z ) 	
end


function FurnishUtility:CharacterWithinRegion( region3 )
	local partwhitelistA = {}
	for _, player in pairs( game.Players:GetPlayers() ) do
		local character = player.Character		
		if character then
			if character.Parent then
				for _, part in pairs( character:GetChildren() ) do
					if part:IsA("BasePart") then
						table.insert( partwhitelistA, part ) 
					end
				end
			end
		end
	end
	local infringingPartsA = workspace:FindPartsInRegion3WithWhiteList( region3, partwhitelistA, 1 )
	return #infringingPartsA >= 1
end


function FurnishUtility:SetTransparency(instance, transparency)
	DebugXL:Assert( self == FurnishUtility )
	local opacity = 1 - transparency
	if instance.ClassName == "Model" then
		for index, child in next, instance:GetDescendants() do
			if child:IsA("BasePart") then
				-- you can multiply opacities/alphas but not transparencies.
				-- just another little annoying thing about roblox
				local childOpacity = 1 - child.Transparency
				local targetOpacity = childOpacity * opacity
				child.Transparency =  1 - targetOpacity
			end
		end
	elseif instance:IsA("BasePart") then
		local childOpacity = 1 - instance.Transparency
		local targetOpacity = childOpacity * opacity
		instance.Transparency =  1 - targetOpacity
	end
end


function FurnishUtility:SetCanCollide(instance, canCollide)
	DebugXL:Assert( self == FurnishUtility )
	-- note: this does NOT take into account already CanCollidable parts
	
	if instance.ClassName == "Model" then
		for index, child in next, instance:GetDescendants() do
			if child:IsA("BasePart") then
				child.CanCollide = canCollide
			end
		end
	elseif instance:IsA("BasePart") then
		instance.CanCollide = canCollide
	end
end


function FurnishUtility:SnapToGridInsideWalls( position, subdivisionsN )
	-- inset from the walls is a 33x33 square.  
	-- so...which grid tile are we in?
	local mapx, mapz = MapTileData:GetGridCellFromWorldPoint( position.X, position.Z )
	-- clip to that interior area
	local tileCenterV3 = MapTileData:GridCellCenterWorldV3( mapx, mapz )
	local pxClipped = math.clamp( position.X, tileCenterV3.X - MapTileData.cellInteriorWidthN / 2, tileCenterV3.X + MapTileData.cellInteriorWidthN / 2 )
	local pzClipped = math.clamp( position.Z, tileCenterV3.Z - MapTileData.cellInteriorWidthN / 2, tileCenterV3.Z + MapTileData.cellInteriorWidthN / 2 )
	-- snap to the interior n x n grid
	
	local snap = cellWidthN / subdivisionsN
	local x = pxClipped + snap / 2
	local z = pzClipped + snap / 2
	
	x = x - x % snap
	z = z - z % snap
	
	return Vector3.new( x, 1, z )
end

-- snaps a position to a grid point
function FurnishUtility:ExpandToGrid( position, subdivisionsN )
	DebugXL:Assert( self == FurnishUtility )
	-- note: the Y position has 0 grid
	-- note: the grid is 1 stud, and this is hard-coded, you'll have to edit grid options yourself
	
	local snap = cellWidthN / subdivisionsN
	local x = position.X + snap / 2
	local z = position.Z + snap / 2
	
	x = x - x % snap
	z = z - z % snap
	
	return Vector3.new(x, 1, z)
end


function FurnishUtility:IsInMap( map, v3 )
	local gridCellX, gridCellZ = MapTileData:GetGridCellFromWorldPoint( v3.X, v3.Z )
	if not map[ gridCellX ] then
--		DebugXL:Error( "Floor "..FloorData:CurrentFloor().readableNameS.." map missing "..gridCellX.." row" )
		return false 
	end
	if not map[ gridCellX ][ gridCellZ ] then
--		DebugXL:Error( "Floor "..FloorData:CurrentFloor().readableNameS.." map missing "..gridCellX..", "..gridCellZ )
		return false 
	end
	if map[ gridCellX ][ gridCellZ ].tileName=="BlockWall" then return false end
	return true	
end


-- snaps a position to the midpoint of a grid cell edge segment
function FurnishUtility:ExpandToEdge( position )
	-- transform to diagonal grid
	local xdiag = position.X - position.Z
	local zdiag = position.X + position.Z

	-- snap to an edge midpoint (20,20 ... 20,60 ... 60, 20... that's why we need to add cellWidthN / 2 back in ) 
	local xdiagsnap = xdiag - xdiag % cellWidthN
	local zdiagsnap = zdiag - zdiag % cellWidthN
	local xdiagsnap = xdiagsnap + cellWidthN / 2
	local zdiagsnap = zdiagsnap + cellWidthN / 2
	
	-- transform snapped point back
	local xsnap = ( xdiagsnap + zdiagsnap ) / 2
	local zsnap = ( zdiagsnap - xdiagsnap ) / 2 
	
	return Vector3.new( xsnap, 1.2, zsnap )
end

--
--function FurnishUtility:ExpandToFloor( position )
--	DebugXL:Assert( self == FurnishUtility )
--	-- note: the Y position has 0 grid
--	-- note: the grid is 1 stud, and this is hard-coded, you'll have to edit grid options yourself
--	
--	local snap = cellWidthN
--	local x = position.X + snap / 2
--	local z = position.Z + snap / 2
--	
--	x = x - x % snap
--	z = z - z % snap
--	
--	local positionCFrame = CFrame.new( x, position.Y, z ) 
--
--
--		return Vector3.new(x, 1, z)
----			return Vector3.new(x, position.Y, z)
--	end
--end

function FurnishUtility:SnapV3( v3, subdivisionsN, placementType )
	if placementType == PossessionData.PlacementTypeEnum.Edge then
		return FurnishUtility:ExpandToEdge( v3 )
	elseif placementType == PossessionData.PlacementTypeEnum.Open then
		return FurnishUtility:ExpandToGrid( v3, subdivisionsN )
	else
		local openV3 = FurnishUtility:ExpandToGrid( v3, subdivisionsN )
		return Vector3.new( openV3.X, 0, openV3.Z )
	end
end



-- returns pair: total and personal
function FurnishUtility:CountFurnishings( furnishingName, player )	
	DebugXL:Assert( self == FurnishUtility )
	local total = 0
	local personal = 0
	for _, instance in pairs( workspace.Building:GetChildren() ) do
		if BlueprintUtility.getPossessionName( instance ) == furnishingName then
			total = total + 1
			if instance:WaitForChild("creator").Value == player then
				personal = personal + 1
			end
		end
	end
	return { total, personal }
end


-- takes a point in world coordinates
function FurnishUtility:GridPointOccupied( gridPointV3, extentsV3, subdivisionsN, placementType )
	DebugXL:Assert( placementType ~= nil )
	DebugXL:Assert( typeof( placementType) ~= "boolean" )
	if not workspace.Environment:FindFirstChild("DungeonComplete") then return false end
	-- don't build in entry square
	local startX = FloorData:CurrentFloor().startX
	local startY = FloorData:CurrentFloor().startY
	if gridPointV3.X / cellWidthN <= startX + 0.5 and
		gridPointV3.X / cellWidthN >= startX - 0.5 and
		gridPointV3.Z / cellWidthN <= startY + 0.5 and
		gridPointV3.Z / cellWidthN >= startY - 0.5 then
		return true
	end

	-- don't build in exit staircase	
	-- easiest way to get this data on client and server is to look for the actual model
	if placementType ~= PossessionData.PlacementTypeEnum.Edge then
		local downStaircase = workspace.Environment:FindFirstChild("DownStaircase")
		if downStaircase then
			local stairsGridPointV3 = FurnishUtility:ExpandToGrid( downStaircase:GetPrimaryPartCFrame().p, 1 )
			if math.abs( stairsGridPointV3.X - gridPointV3.X ) / cellWidthN <= 0.5 and
				math.abs( stairsGridPointV3.Z - gridPointV3.Z ) / cellWidthN <= 0.5 then
				return true
			end
		end
	end
	
	-- checks if something is already in that grid square; this used to have an idea of one-thing-per-coordinate
	-- but now checks the boundaries of existing stuff around you
	for _, instance in pairs( workspace.Building:GetChildren() ) do
		if instance.PrimaryPart then  -- primary part may go away while being destroyed
			if FurnishUtility:AABBIntersection2D( instance:GetPrimaryPartCFrame().p, instance:GetExtentsSize(),
				gridPointV3, extentsV3 ) then  
				return true
--			local existingGridPointV3 = FurnishUtility:SnapV3( instance:GetPrimaryPartCFrame().p, subdivisionsN, placementType )
--			if MathXL:ApproxEqual( existingGridPointV3.X, gridPointV3.X ) and
--	--			MathXL:ApproxEqual( existingGridPointV3.Y, gridPointV3.Y ) and
--				MathXL:ApproxEqual( existingGridPointV3.Z, gridPointV3.Z ) then
--				return true
			end
		end
	end
	return false
end


return FurnishUtility
