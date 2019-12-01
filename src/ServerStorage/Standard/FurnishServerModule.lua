print( script:GetFullName().." executed" )

local CharacterI        = require( game.ServerStorage.CharacterI )
local Dungeon           = require( game.ServerStorage.DungeonModule )
local Inventory         = require( game.ServerStorage.InventoryModule )

local PlayerXL          = require( game.ServerStorage.Standard.PlayerXL )

local DebugXL           = require( game.ReplicatedStorage.Standard.DebugXL )
local MathXL            = require( game.ReplicatedStorage.Standard.MathXL )
local TableXL           = require( game.ReplicatedStorage.Standard.TableXL )

local CharacterClientI  = require( game.ReplicatedStorage.CharacterClientI )
local FloorData         = require( game.ReplicatedStorage.FloorData )
local FurnishUtility    = require( game.ReplicatedStorage.FurnishUtility )
local HeroUtility       = require( game.ReplicatedStorage.Standard.HeroUtility )
local MapTileData       = require( game.ReplicatedStorage.MapTileDataModule )
local PossessionData    = require( game.ReplicatedStorage.PossessionData )

local BlueprintUtility = require( game.ReplicatedStorage.TS.BlueprintUtility ).BlueprintUtility

local FurnishServer = {}

-- services
local replicatedStorage = game:GetService("ReplicatedStorage")


-- shared instances
local sharedInstances = replicatedStorage["Shared Instances"]
local placementStorage = sharedInstances["Placement Storage"]

--[[
local sharedModules = sharedInstances.Modules
local remotes = sharedInstances.Remotes

-- data
local dataInitiated = false

--]]

-- validation
for _, thing in pairs( game.ReplicatedStorage["Shared Instances"]["Placement Storage"]:GetChildren() ) do
	local possessionName = BlueprintUtility.getPossessionName( thing )
	if not PossessionData.dataT[ possessionName ] then
		DebugXL:Error( "Couldn't find "..thing.Name.."("..thing.PossessionName.Value..") in PossessionData" )
	end
	local itsCoolB = string.sub( thing.Name, 1, string.len( possessionName ) ) == possessionName
	if( not itsCoolB )then
		DebugXL:Error( "Invalid PossessionName "..thing.PossessionName.Value.." for "..thing.Name )
	end
end
--------------------------------------------------------------------------------------------------------------------
-- Dungeon Furnishing
--------------------------------------------------------------------------------------------------------------------
local function PlaceSpawns( spawnDataA, spawnCountN )
	local dungeonMap = Dungeon:GetMap()
	local emergencyFailCount = 0
	while #workspace.Building:GetChildren() < spawnCountN do
		emergencyFailCount = emergencyFailCount + 1
		if emergencyFailCount > 1000 then
			if #workspace.Building:GetChildren() <= 1 then
				DebugXL:Error( "Map spawn placement failed with only "..#workspace.Building:GetChildren().." buildings" )
			else
				warn( "Map spawn placement failed with only "..#workspace.Building:GetChildren().." buildings" )
			end
			break
		end
		local sizeN = FloorData:CurrentFloorSize()
		local mapX = MathXL:RandomInteger( 1, sizeN  )
		local mapZ = MathXL:RandomInteger( 1, sizeN )		
		local gridX = mapX - math.ceil( sizeN / 2 )
		local gridZ = mapZ - math.ceil( sizeN / 2 )
		local minSpawnDistance = ( sizeN - 1 ) / 2 - 1  -- 5: 1, 7: 2, 9: 3
		if math.abs( gridX ) + math.abs( gridZ ) >= minSpawnDistance then		
			if dungeonMap[ mapX ][ mapZ ].tileName ~= "BlockWall" then
				
				local spawnChoice = spawnDataA[ MathXL:RandomInteger( 1, #spawnDataA ) ]
				
				local tileCenterPositionX = gridX * MapTileData.cellWidthN 
				local tileCenterPositionZ = gridZ * MapTileData.cellWidthN
				local positionX = tileCenterPositionX
				local positionZ = tileCenterPositionZ
				
				local rotY = 0
				
				-- assumes we want to put it off to a side
				if spawnChoice.gridSubdivisionsN ~= 1 then
					-- matching standard found in MapTIleData, 1 is north going counter-clockwise and 5 is middle
					local wall = MathXL:RandomInteger( 1, 5 )
	
					rotY = math.pi / 2 + wall * math.pi / 2
					-- / 3.5 : can't build with this grid manually but this helps keep it out of the walls
					if wall==1 then
						positionZ = tileCenterPositionZ - MapTileData.cellWidthN / 3.5
					elseif wall==2 then
						positionX = tileCenterPositionX - MapTileData.cellWidthN / 3.5
					elseif wall==3 then
						positionZ = tileCenterPositionZ + MapTileData.cellWidthN / 3.5
					elseif wall==4 then
						positionX = tileCenterPositionX + MapTileData.cellWidthN / 3.5
					end
				end
				local position = FurnishUtility:SnapV3( Vector3.new( positionX, 1.2, positionZ ), spawnChoice.gridSubdivisionsN, spawnChoice.placementType )
				FurnishServer:Furnish( nil, spawnChoice.idS, position, rotY )
			end
		end
	end
end
	
				
function FurnishServer:FurnishWithRandomSpawns()
	
	-- why do I insist on being cute?	
	-- it's not likely we'll ever have more than one boss, but I'm handling it if we do
	local bossBlueprintsT = TableXL:FindAllInTWhere(
		FloorData:CurrentFloor().availableBlueprintsT,
		function( blueprintS )
			return PossessionData.dataT[ blueprintS ].furnishingType == PossessionData.FurnishingEnum.BossSpawn
	end )
	local spawnBlueprintsA = TableXL:TableToPairArray( bossBlueprintsT )
	local spawnDataA = TableXL:Map( spawnBlueprintsA, function( blueprint )
		return PossessionData.dataT[ blueprint.k ]
	end)
	if #spawnDataA >= 1 then
		PlaceSpawns( spawnDataA, 1)
	end
	
	local spawnBlueprintsT = TableXL:FindAllInTWhere(
		FloorData:CurrentFloor().availableBlueprintsT,
		function( blueprintS )
			return PossessionData.dataT[ blueprintS ].furnishingType == PossessionData.FurnishingEnum.Spawn
	end )
	
	local spawnBlueprintsA = TableXL:TableToPairArray( spawnBlueprintsT )
	local spawnDataA = TableXL:Map( spawnBlueprintsA, function( blueprint )
		return PossessionData.dataT[ blueprint.k ]
	end)
	
	PlaceSpawns( spawnDataA, 4 )
end


function FurnishServer:FurnishWithRandomChests()
	local dungeonMap = Dungeon:GetMap()
	local scarcity = 2 * math.max( 1, #game.Teams.Heroes:GetPlayers() )
	local counter = MathXL:RandomInteger( 1, scarcity )         -- acts more like a deck of cards and spreads chests more uniformly then just rolling the dice every spot
	for x, col in pairs( dungeonMap ) do
		for z, cell in pairs( col ) do			
			if cell.tileName == "HallThreeWalls" then
				if counter == 1 then
					local newChest = game.ReplicatedStorage["Shared Instances"]["Placement Storage"].Chest:Clone()
					local extentsV3 = newChest:GetExtentsSize()
					local sizeN = FloorData:CurrentFloorSize()
					local gridX = x - math.ceil( sizeN / 2 )
					local gridZ = z - math.ceil( sizeN / 2 )
					if math.abs( gridX ) + math.abs( gridZ ) > 2 then
						local positionX = gridX * MapTileData.cellWidthN 
						local positionZ = gridZ * MapTileData.cellWidthN
						if not FurnishUtility:GridPointOccupied( Vector3.new( positionX, 1.2, positionZ ), extentsV3, 3, PossessionData.PlacementTypeEnum.Open ) then							
							newChest:SetPrimaryPartCFrame( CFrame.new( positionX, 1, positionZ ) * CFrame.fromEulerAnglesXYZ( 0, 0, 0 ) )
							--newSpawn.MonsterSpawn.Enabled = true
							newChest.Parent = workspace.Building
						end
					end
				end
				counter = counter % ( scarcity ) + 1
			end
		end
	end
end



function FurnishServer:GetMonsterSpawners()
	local spawners = game.CollectionService:GetTagged("CustomSpawn")
	return TableXL:FindAllInAWhere( spawners, function( v ) 
		if( v.Team.Value == nil )then
			DebugXL:Error( "Custom spawn missing team: "..v:GetFullName() )
		end
		return v.Team.Value==game.Teams.Monsters and v.Enabled.Value 
	end )
end


function FurnishServer:GetNumMonsterSpawns()
	local monsterSpawners = FurnishServer:GetMonsterSpawners() 
	local availableMonsterClasses = {}

	-- if there's an unused boss spawn point that has priority		
	for _, spawner in pairs( monsterSpawners ) do		
		if PossessionData.dataT[ BlueprintUtility.getPossessionName( spawner.Parent ) ].furnishingType == PossessionData.FurnishingEnum.BossSpawn then
			if spawner.LastPlayer.Value == nil then
				return { [spawner.CharacterClass.Value] = 1 }
			end 
		else
			availableMonsterClasses[ spawner.CharacterClass.Value ] = availableMonsterClasses[ spawner.CharacterClass.Value ] and
			  ( availableMonsterClasses[ spawner.CharacterClass.Value ] + 1 ) or
			  1
		end
	end
	return availableMonsterClasses
end


function FurnishServer:Furnish( creator, name, position, rotation )
	local furnishingDatum = PossessionData.dataT[ name ]

	-- validating parameters
	DebugXL:Assert( position == position ) -- nan?
	DebugXL:Assert( rotation == rotation ) -- nan?
	DebugXL:Assert( typeof(position) == "Vector3" ) 
	DebugXL:Assert( type(rotation) == "number" )
	DebugXL:Assert( type(name) == "string" )
	
	local blueprintSuffix = FloorData:CurrentFloor().blueprintSuffix
	local amendedName = name..blueprintSuffix
	local template = placementStorage:FindFirstChild(amendedName)
	if( not template )then
		template = placementStorage:FindFirstChild(name)
	end
	local instance = template:Clone()
	

	local baseplate = workspace.BuildingBaseplate
	instance.creator.Value = creator
	local mainScript = instance:FindFirstChild("MainScript")
	if mainScript then
		mainScript.Disabled = false
	end
	
	DebugXL:Assert( instance:IsA("Model") )

	-- doesn't take into account bounding box orientation but it should serve
	local ghostRegion = Region3.new( position - instance:GetExtentsSize() / 2,
		position + instance:GetExtentsSize() / 2 )	

--	if FurnishUtility:GridPointOccupied( position, instance:GetExtentsSize(), furnishingDatum.gridSubdivisionsN, furnishingDatum.placementType ) then
--		return nil
--	end

	if FurnishUtility:IsWithinBoundaries(baseplate.Position, baseplate.Size, position, instance.PrimaryPart.Size, rotation)
		and FurnishUtility:IsInMap( Dungeon:GetMap(), position )	
		and not FurnishUtility:CharacterWithinRegion( ghostRegion ) 
		and not FurnishUtility:GridPointOccupied( position, instance:GetExtentsSize(), furnishingDatum.gridSubdivisionsN, furnishingDatum.placementType ) then

		local totalN, personalN = FurnishUtility:CountFurnishings( name, creator )		
		-- this will need to say 'still in tutorial' if we want to make Dungeon Lords a thing				
		if totalN >= furnishingDatum.levelCapN then
--			--print( "Higher than cap" )
			if creator and Inventory:PlayerInTutorial( creator ) then  -- bypassing level limits when you're in tutorial so you can build what you need; people could use it to cheat the very first time they play, not the end of the world
				--print( "In tutorial though" )
			else
				return nil
			end		
		end
		if personalN >= furnishingDatum.buildCapN then
			return nil
		end	
		local availableB = FloorData:CurrentFloor().availableBlueprintsT[ name ]				
		if not availableB and personalN >= Inventory:GetCount( creator, furnishingDatum.idS ) then -- furnishingDatum.buildCapN then
			return nil
		else
			instance:SetPrimaryPartCFrame(CFrame.new(position) * CFrame.Angles(0, (math.pi / 2) * rotation, 0))
			-- health gets set in destructible script
		end
		if furnishingDatum.placementType == PossessionData.PlacementTypeEnum.Floor then
			-- tell new floor model about previous floor; the model will use its discretion what to do with it
			local x, z = MapTileData:GetGridCellFromWorldPoint( position.X, position.Z )
			local tileModel = workspace.Environment[ "Tile_"..x.."_"..z ]
			instance.DisposableFloor.Value = tileModel.Floor
		end
		instance.Parent = workspace.Building

		return instance		
	else
		instance:Destroy()
		return nil
	end
end


return FurnishServer
