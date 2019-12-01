local CheatUtilityXL = require( game.ReplicatedStorage.TS.CheatUtility )

local DebugXL        = require( game.ReplicatedStorage.Standard.DebugXL )
local CharacterClientI = require( game.ReplicatedStorage.Standard.CharacterClientI )
local DungeonClient  = require( game.ReplicatedStorage.Standard.DungeonClient )

local FloorData      = require( game.ReplicatedStorage.FloorData )
local MapTileData    = require( game.ReplicatedStorage.MapTileDataModule )

local MonsterUtility = require( game.ReplicatedStorage.MonsterUtility )

local PlayerUtility = require( game.ReplicatedStorage.TS.PlayerUtility ).PlayerUtility

local playerGui = script.Parent.Parent.Parent

local GuiXL          = require( game.ReplicatedStorage.TS.GuiXLTS ).GuiXL
GuiXL:waitForLoadingGoo()

local dungeonRE = workspace.Signals.DungeonRE


local layoutOrderCounter = 1

--local gridWidthN = FloorData:CurrentFloorSize()

local cellWidth = 45 

local sawIt = {} 
local staircaseSeenB = false

local function GetGridWidth()
	return #DungeonClient.map
end

local function GetMapColumnHeight( x )
	return #DungeonClient.map[x]
end


local function SetMapVisibility( visibleB )
	for x = 1, GetGridWidth() do
		sawIt[x] = {}
		for y = 1, GetMapColumnHeight( x ) do
			sawIt[x][y] = visibleB
		end
	end
	staircaseSeenB = visibleB
end

SetMapVisibility( game.Players.LocalPlayer.Team == game.Teams.Monsters )

DungeonClient:MapUpdateEventConnect( function()
	SetMapVisibility( game.Players.LocalPlayer.Team == game.Teams.Monsters )
end )

local function MarkMapPointSeen( x, y )
	if x>=1 and x<= GetGridWidth() then
		if y>=1 and y<= GetMapColumnHeight( x ) then
			sawIt[x][y] = true
		end
	end
end

local function MapPointToUDim2( x, z )
end


local mapGui = script.Parent.Parent
local mapFrame = mapGui:WaitForChild("MapFrame")
local mapCharacters = mapGui:WaitForChild("Characters")

mapFrame.Visible = true

local mapRenderEvent = game["Run Service"].RenderStepped:Connect( function()
--game["Run Service"]:BindToRenderStep( "whatever", 1, function()
	local _, eulerY, _ = workspace.CurrentCamera.CFrame:toEulerAnglesYXZ()
	mapFrame.Rotation = eulerY / math.pi * 180
	mapCharacters.Rotation = eulerY / math.pi * 180
end)

mapGui.Event.Event:Connect( function( funcName )
	if funcName == "RevealMap" then
		if CheatUtilityXL:PlayerWhitelisted( game.Players.LocalPlayer ) then
			SetMapVisibility( true )
		end		
	end
end)


local lastTeam = game.Players.LocalPlayer.Team

while wait(0.1) do
	if game.Players.LocalPlayer.Team ~= lastTeam then
		lastTeam = game.Players.LocalPlayer.Team
		SetMapVisibility( game.Players.LocalPlayer.Team == game.Teams.Monsters )
	end
	
	mapGui.MapFrame:ClearAllChildren()
	for x = 1, GetGridWidth() do
		for y = 1, GetMapColumnHeight( x ) do	
			if sawIt[x][y] then
				local newTileImage = mapGui.MapTileTemplate:Clone()
				newTileImage.Name = "MapTile".."_"..x.."_"..y

				if not DungeonClient.map[ x ] then
					DebugXL:Error( "Floor "..FloorData:CurrentFloor().readableNameS.." map missing "..x.." row" )
					return false 
				end
				if not DungeonClient.map[ x ][ y ] then
					DebugXL:Error( "Floor "..FloorData:CurrentFloor().readableNameS.." map missing "..x..", "..y )
					return false 
				end
				
				local tileName = DungeonClient.map[x][y].tileName
--				if tileName > 0 then
					local tile = MapTileData.masterDataT[ tileName ]				
					local modelName = tile.modelName
					--if modelName ~= "HallNoWalls" then
						newTileImage.Image = "rbxgameasset://Images/Map"..modelName
						-- while in the world, rotating around y rotates counter clockwise when viewed from above
						-- in the gui, rotating rotates clockwise
						newTileImage.Position = UDim2.new( ( x - .5 ) / GetGridWidth(), 0, ( y - .5 ) / GetGridWidth(), 0 )
						newTileImage.Size     = UDim2.new( 1.02 / GetGridWidth(), 0, 1.02 / GetGridWidth(), 0 )
						newTileImage.Rotation = mapGui.CheaterMul.Value * ( DungeonClient.map[x][y].compassRotationN + mapGui.CheaterOffset.Value )
						newTileImage.LayoutOrder = layoutOrderCounter
						layoutOrderCounter = layoutOrderCounter + 1
						newTileImage.Parent = mapGui.MapFrame
						newTileImage.Visible = true
					--end
--				end
			end
		end
	end

	mapGui.Characters:ClearAllChildren()

	local startIcon = mapGui.CharacterTemplate:Clone()
	-- local cx = downStaircase.PrimaryPart.Position.X
	-- local cy = downStaircase.PrimaryPart.Position.Z  -- note z -> y, world -> screen
	-- cx = cx / cellWidth         -- -3 to 3   
	-- cx = cx + gridWidthN / 2    -- 0 to 6
	-- cx = cx / gridWidthN        -- 0 to 1
	-- cy = cy / cellWidth           
	-- cy = cy + gridWidthN / 2  
	-- cy = cy / gridWidthN
	startIcon.Image = "rbxassetid://2655024327"
	local cx = FloorData:CurrentFloor().startX + GetGridWidth() / 2    -- 0 to 6
	cx = cx / GetGridWidth()        -- 0 to 1
	local cy = FloorData:CurrentFloor().startY + GetGridWidth() / 2  
	cy = cy / GetGridWidth()
	startIcon.Position = UDim2.new( cx, 0, cy, 0 )
	startIcon.Parent = mapGui.Characters
	startIcon.Size = UDim2.new( 0.5 / GetGridWidth(), 0, 0.5 / GetGridWidth(), 0 )
	startIcon.Visible = true

	local downStaircase = workspace.Environment:FindFirstChild("DownStaircase")
	if downStaircase and staircaseSeenB then
		local staircaseIcon = mapGui.CharacterTemplate:Clone()
		if downStaircase.PrimaryPart then	
			local cx = downStaircase.PrimaryPart.Position.X
			local cy = downStaircase.PrimaryPart.Position.Z  -- note z -> y, world -> screen
	
			cx = cx / cellWidth         -- -3 to 3   
			cx = cx + GetGridWidth() / 2    -- 0 to 6
			cx = cx / GetGridWidth()        -- 0 to 1
	
			cy = cy / cellWidth           
			cy = cy + GetGridWidth() / 2  
			cy = cy / GetGridWidth()
			
			staircaseIcon.Image = "rbxassetid://2654893605"  -- DownSpiralStaircase
			staircaseIcon.Position = UDim2.new( cx, 0, cy, 0 )
			staircaseIcon.Parent = mapGui.Characters
			staircaseIcon.Size = UDim2.new( 0.75 / GetGridWidth(), 0, 0.75 / GetGridWidth(), 0 )
			staircaseIcon.Visible = true
		end
	end
	
	local localPlayerPrimaryPart = game.Players.LocalPlayer.Character.PrimaryPart
	for _, player in pairs( game.Players:GetPlayers() ) do
		local character = player.Character		
		if character then
			if character.PrimaryPart then
				local visibleB = false
				if player.Team == game.Players.LocalPlayer.Team or ( workspace.GameManagement.LevelTimeElapsed.Value >= 240 ) then
					visibleB = true
				else
					if MonsterUtility:GetClassWait( game.Players.LocalPlayer.Character )=="Zombie" then
						-- could have disappeared by now
						if character.PrimaryPart then
							if localPlayerPrimaryPart then
								if ( character.PrimaryPart.Position - localPlayerPrimaryPart.Position ).Magnitude < 300 then
									visibleB = true
								end
							end
						end
					end
				end
				if visibleB then
					local characterDot = mapGui.CharacterTemplate:Clone()
												-- if cellWidth was 10 and gridWidth is 6
					local cx = character.PrimaryPart.Position.X
					local cy = character.PrimaryPart.Position.Z  -- note z -> y, world -> screen
												-- -30 to 30
					cx = cx / cellWidth         -- -3 to 3   
					cy = cy / cellWidth           
					cx = cx + GetGridWidth() / 2    -- 0 to 6
					cy = cy + GetGridWidth() / 2  
					
					local currentGridPointX = math.ceil( cx )
					local currentGridPointY = math.ceil( cy )
		
					cx = cx / GetGridWidth()        -- 0 to 1
					cy = cy / GetGridWidth()
					characterDot.Position = UDim2.new( cx, 0, cy, 0 )
					characterDot.Parent = mapGui.Characters
					characterDot.Visible = true
		
					if player==game.Players.LocalPlayer and PlayerUtility.IsPlayersCharacterAlive( player ) then
						characterDot.ImageColor3 = Color3.new( 1, 1, 1 )
						-- fill in map
						MarkMapPointSeen( currentGridPointX, currentGridPointY )
						MarkMapPointSeen( currentGridPointX-1, currentGridPointY )
						MarkMapPointSeen( currentGridPointX+1, currentGridPointY )
						MarkMapPointSeen( currentGridPointX, currentGridPointY-1 )
						MarkMapPointSeen( currentGridPointX, currentGridPointY+1 )
						
						if downStaircase then
							if character.PrimaryPart and downStaircase.PrimaryPart then
								if downStaircase and ( character.PrimaryPart.Position - downStaircase.PrimaryPart.Position ).Magnitude < cellWidth * 1.5 then
									staircaseSeenB = true
								end
							end
						end
					else			
						if player.TeamColor ~= game.Players.LocalPlayer.TeamColor and CharacterClientI:GetCharacterClass( player )=="Werewolf" then
							characterDot.ImageColor3 = game.Players.LocalPlayer.TeamColor.Color
						else
							characterDot.ImageColor3 = player.TeamColor.Color
						end
					end
				end
			end
		end
	end
end

