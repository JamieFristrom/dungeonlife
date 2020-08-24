
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())
--

-- FurnishClientHandler
--

--local GameAnalyticsClient = require( game.ReplicatedStorage.Standard.GameAnalyticsClient )
local InputXL          = require( game.ReplicatedStorage.Standard.InputXL )
local InstanceXL       = require( game.ReplicatedStorage.Standard.InstanceXL )
local MathXL           = require( game.ReplicatedStorage.Standard.MathXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL )
-- note: everything here is on the client, so people can't see what you're placing until you actually place it.

local DungeonClient    = require( game.ReplicatedStorage.DungeonClient )
local FloorData        = require( game.ReplicatedStorage.FloorData )
local FurnishUtility   = require( game.ReplicatedStorage.FurnishUtility )
local InventoryClient  = require( game.ReplicatedStorage.InventoryClient )
local MapTileData      = require( game.ReplicatedStorage.MapTileDataModule )
local PossessionData   = require( game.ReplicatedStorage.PossessionData )

local AnalyticsClient = require( game.ReplicatedStorage.TS.AnalyticsClient ).AnalyticsClient
local BlueprintUtility = require( game.ReplicatedStorage.TS.BlueprintUtility ).BlueprintUtility
local GuiXL = require( game.ReplicatedStorage.TS.GuiXLTS ).GuiXL
local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize
local MessageGui = require( game.ReplicatedStorage.TS.MessageGui ).MessageGui

local furnishGui = script.Parent.Parent
local playerGui  = furnishGui.Parent
local audio = playerGui:WaitForChild("Audio")
local localPlayer = game.Players.LocalPlayer

local furnishingInfoFrame = furnishGui:WaitForChild("FurnishingInfoFrame")

local currencies = furnishGui:WaitForChild("Currencies")
currencies:WaitForChild("BuildPoints")

currencies.BuildPoints.Visible = false
workspace.GridSurface.Texture.Transparency = 1


while not FurnishUtility:CanIFurnish( localPlayer ) do wait(0.5) end


local GuiTraveller   = require( furnishGui.Parent:WaitForChild("NoResetGui"):WaitForChild("GuiTravellerModule") )

-- this ought to belong in a DungeonUtility module:
local gridWidth = FloorData:CurrentFloorSize()
local centerTileV2 = Vector2.new( math.ceil( gridWidth/2 ), math.ceil( gridWidth/2 ) )

wait()

-- services
local players = game:GetService("Players")
local workspace = game:GetService("Workspace")
local userInputService = game:GetService("UserInputService")
local replicatedStorage = game:GetService("ReplicatedStorage")


workspace.ClientFurnitureGhost:ClearAllChildren()

local player = players.LocalPlayer
local character = player.Character
local mouse = player:GetMouse()

local selectionBox = Instance.new("SelectionBox", character)

-- shared instances
local sharedInstances = replicatedStorage["Shared Instances"]
local placementStorage = sharedInstances["Placement Storage"]

local remotes = sharedInstances.Remotes
local modules = sharedInstances.Modules

-- modules
--local helperFunctionsDictionary = require(modules["Helper Functions"])

-- data
local rotation = 0
local ghostInstance = nil

local placeableIdx = 1
local placeable = placementStorage:GetChildren()

local categoryFrameTargetPosition   = furnishGui:WaitForChild("ActiveCategoryListFrame").Position
local furnishingFrameTargetPosition = furnishGui:WaitForChild("ActiveFurnishingListFrame").Position

local map = workspace.Signals:WaitForChild("DungeonRF"):InvokeServer( "GetMap" )


table.sort( placeable, function( thing1, thing2 )
	local thing1Datum = PossessionData.dataT[ BlueprintUtility.getPossessionName( thing1 ) ]
	local thing2Datum = PossessionData.dataT[ BlueprintUtility.getPossessionName( thing2 ) ]
	return thing1Datum.furnishingType < thing2Datum.furnishingType
end)

local currentBuildMenu = nil

local currentConfirmFrame = game:GetService("UserInputService").TouchEnabled and furnishGui:WaitForChild("ConfirmFrameTouch") or furnishGui:WaitForChild("ConfirmFrame")

local cachedBuildPointsN = localPlayer:WaitForChild("BuildPoints").Value

-- definitions
local keyCodeEnum = Enum.KeyCode
local userInputEnum = Enum.UserInputType



-- functions
local function moveGhost( targetV3 )
	if ghostInstance and targetV3 then
		local baseplate = workspace.BuildingBaseplate
		local furnishingDatum = PossessionData.dataT[ BlueprintUtility.getPossessionName( ghostInstance ) ]
		local position = FurnishUtility:SnapV3( targetV3, furnishingDatum.gridSubdivisionsN, furnishingDatum.placementType )
		local extentsV3 = ghostInstance:GetExtentsSize()
		--local position = FurnishUtility:ExpandToGrid( targetV3, furnishingDatum.gridSubdivisionsN, furnishingDatum.gridOffsetN )
		if furnishingDatum.placementType == PossessionData.PlacementTypeEnum.Edge then
			if position.X % MapTileData.cellWidthN == 0 then
				rotation = 2
			else
				rotation = 1
			end	
		end
		
		local cframe = CFrame.new(position) * CFrame.Angles(0, (math.pi / 2) * rotation, 0)
		
		-- assumes model now
		
--		if ghostInstance.ClassName == "Model" then
			--[[
				NOTES:
					EVERY Model NEEDS a PrimaryPart with the name of Primary at the bottom of the Model.
						- Reference the two example models located in Placement Storage
					
					The PrimaryPart NEEDS to have a starting rotation of (0, 0, 0)
			--]]


		local ghostRegion = Region3.new( ghostInstance:GetPrimaryPartCFrame().p - ghostInstance:GetExtentsSize() / 2,
			ghostInstance:GetPrimaryPartCFrame().p + ghostInstance:GetExtentsSize() / 2 )

		if FurnishUtility:IsWithinBoundaries( baseplate.Position, baseplate.Size, ghostInstance:GetPrimaryPartCFrame().p, ghostInstance.PrimaryPart.Size, rotation)
			and not FurnishUtility:GridPointOccupied( position, extentsV3, furnishingDatum.gridSubdivisionsN, 
				furnishingDatum.placementType ) 
			and not FurnishUtility:CharacterWithinRegion( ghostRegion ) 
			and FurnishUtility:IsInMap( map, position ) then
			selectionBox.Color3 = Color3.new(0.125, 0.625, 0.075)
		else
			selectionBox.Color3 = Color3.new(0.75, 0.125, 0.125)
		end
		
		ghostInstance:SetPrimaryPartCFrame(cframe)-- * CFrame.new(0, -0.125, 0)) -- minus 0.125 for the size of the PrimaryPart
--		elseif ghostInstance:IsA("BasePart") then
--			if FurnishUtility:CheckBoundaries(baseplate.Position, baseplate.Size, ghostInstance.Position, ghostInstance.Size, rotation) then
--				selectionBox.Color3 = Color3.new(0.125, 0.625, 0.075)
--			else
--				selectionBox.Color3 = Color3.new(0.75, 0.125, 0.125)
--			end
--			
--			ghostInstance.CFrame = cframe --* CFrame.new(0, ghostInstance.Size.Y / 2, 0)
--		end
	end
end

local function GetBlueprintCountInfo( blueprint )
	local totalBuiltN, personalBuiltN = unpack( FurnishUtility:CountFurnishings( blueprint.idS, player ))

	local availableB = FloorData:CurrentFloor().availableBlueprintsT[ blueprint.idS ] 
	local forbiddenB = FloorData:CurrentFloor().forbiddenBlueprintsT[ blueprint.idS ] 
	DebugXL:Assert( not ( availableB and forbiddenB ) )
	local blueprintsN = InventoryClient:GetCount( blueprint.idS )
	if forbiddenB then
		return 0, 0, 0, 0, blueprintsN, availableB, forbiddenB
	end
	local capN = availableB and blueprint.buildCapN or math.min( blueprintsN, blueprint.buildCapN )
	local numLeftN = math.clamp( capN - personalBuiltN, 0, math.max( blueprint.levelCapN - totalBuiltN, 0 ) )
	-- that's right, I copy and pasted code three times
	-- shame on me
	-- hackity hack hack
	if numLeftN == 0 then
		if blueprint.idS == "Chest" and InventoryClient:GetTutorialLevel()==0 then
			numLeftN = 1
		elseif blueprint.idS == "SpawnOrc" and InventoryClient:GetTutorialLevel()==2 then
			numLeftN = 1
		end
	end
	return totalBuiltN, personalBuiltN, capN, numLeftN, blueprintsN, availableB, forbiddenB
end
	
local checkboxConnection
	
local function FillOutInfoFrame( possessionDatum )
	local totalBuiltN, personalBuiltN, capN, numLeftN, blueprintsN, availableB, forbiddenB = GetBlueprintCountInfo( possessionDatum ) 		

	furnishingInfoFrame:WaitForChild("ReadableName").Text = Localize.getName( possessionDatum )
	furnishingInfoFrame.Rarity.Text       = PossessionData.raritiesT[ possessionDatum.rarityN ].nameS
	furnishingInfoFrame.RarityBacking.ImageColor3 = PossessionData.raritiesT[ possessionDatum.rarityN ].color3
	local blueprintB = blueprintsN > 0
	furnishingInfoFrame.Cost.Text = availableB and Localize.formatByKey("FurnishingAvailable") or blueprintB and Localize.formatByKey( "NumBlueprintsOwned", { blueprintsN } ) or Localize.formatByKey( "BlueprintNotOwned" )
	if availableB or blueprintB then
		furnishingInfoFrame.Cost.Text = furnishingInfoFrame.Cost.Text ..
			( possessionDatum.buildCostN >= 0 and Localize.formatByKey("BlueprintCost", { possessionDatum.buildCostN } ) or Localize.formatByKey( "BlueprintEarn", { -possessionDatum.buildCostN } ) )
	end
	furnishingInfoFrame.Description.Text  = Localize.formatByKey( possessionDatum.idS .. "Description" )
	if forbiddenB then
		furnishingInfoFrame.BuiltByYou.Text = ""
		furnishingInfoFrame.TotalBuilt.Text = Localize.formatByKey( "ForbiddenBlueprint", { Localize.getName( possessionDatum ) })
		furnishingInfoFrame.TotalBuilt.TextColor3 = Color3.new(1,0,0)
	else
		furnishingInfoFrame.BuiltByYou.Text   = Localize.formatByKey( "FurnishingsYouBuilt", { personalBuiltN, capN } )
		if possessionDatum.levelCapN < 1000 then
			furnishingInfoFrame.TotalBuilt.Text = Localize.formatByKey( "FurnishingsTotal", { totalBuiltN, possessionDatum.levelCapN } )
		else
			furnishingInfoFrame.TotalBuilt.Text = ""
		end
		furnishingInfoFrame.TotalBuilt.TextColor3 = Color3.new(1,1,1)
	end
	furnishingInfoFrame.NumberLeft.Text   = Localize.formatByKey( "FurnishingsNumberLeft", { numLeftN } )
	furnishingInfoFrame.NumberLeft.TextColor3 = numLeftN == 0 and Color3.fromRGB( 255, 0, 0 ) or Color3.fromRGB( 255, 255, 255 )

	furnishingInfoFrame.Cost.TextColor3   = possessionDatum.buildCostN > cachedBuildPointsN and Color3.fromRGB( 255, 0, 0 ) or 
	                                                      possessionDatum.buildCostN < 0 and Color3.fromRGB( 0, 255, 0 ) or Color3.fromRGB( 255, 255, 255 )
			
	local accessoriesHideable = false
	if possessionDatum.furnishingType == PossessionData.FurnishingEnum.BossSpawn or possessionDatum.furnishingType == PossessionData.FurnishingEnum.Spawn then
		accessoriesHideable = true
	end
	furnishingInfoFrame.HideAccessories.Visible = accessoriesHideable
	if accessoriesHideable then
		furnishingInfoFrame.HideAccessories.Checkbox.Image = InventoryClient.inventory.settingsT.monstersT[ possessionDatum.monsterIdS ].hideAccessoriesB and "rbxassetid://61153606" or ""
		if checkboxConnection then
			checkboxConnection:Disconnect()
		end
		checkboxConnection = furnishingInfoFrame.HideAccessories.Checkbox.MouseButton1Click:Connect( function() 
			local newSettingValue = not InventoryClient.inventory.settingsT.monstersT[ possessionDatum.monsterIdS ].hideAccessoriesB
			workspace.Signals.InventoryRE:FireServer( "SetMonsterSetting", possessionDatum.monsterIdS, "hideAccessoriesB", newSettingValue )
			InventoryClient.inventory.settingsT.monstersT[ possessionDatum.monsterIdS ].hideAccessoriesB = newSettingValue
			furnishingInfoFrame.HideAccessories.Checkbox.Image = newSettingValue and "rbxassetid://61153606" or ""
		end )		
	end

	furnishingInfoFrame.Visible = true
end


local function GhostPlaneIntersectionV3( x, y )
	local touchRay = game.Workspace.CurrentCamera:ScreenPointToRay( x, y )
	-- the intersection we care about is	 with the y = 0 plane
	local intersectionV3 = MathXL:RayPlaneIntersection( Vector3.new(0,0,0), Vector3.new(0,1,0), touchRay )
	return intersectionV3
end


local function GetGhostFocusV3()
	-- not used by touch interface
	local screenX = InputXL:UsingGamepad() and workspace.CurrentCamera.ViewportSize.X / 2 or mouse.X
	local screenY = InputXL:UsingGamepad() and workspace.CurrentCamera.ViewportSize.Y * 0.33 or mouse.Y
	return GhostPlaneIntersectionV3( screenX, screenY )
end


local function EnableGrid( possessionDatum )
	workspace.GridSurface.Texture.StudsPerTileU = MapTileData.cellWidthN / possessionDatum.gridSubdivisionsN
	workspace.GridSurface.Texture.StudsPerTileV = MapTileData.cellWidthN / possessionDatum.gridSubdivisionsN
	workspace.GridSurface.Texture.Transparency = 0.5
end


local function registerGhost(deselect)
	if deselect then
		if ghostInstance then
			ghostInstance:Destroy()
			ghostInstance = nil
			furnishingInfoFrame.Visible = false
		end
		
		workspace.GridSurface.Texture.Transparency = 1
		selectionBox.Adornee = nil
	else
		if ghostInstance then
			ghostInstance:Destroy()
			furnishingInfoFrame.Visible = false
		end
		
		ghostInstance = placeable[ placeableIdx ]:Clone()
		ghostInstance.Parent = workspace.ClientFurnitureGhost
		FurnishUtility:SetTransparency(ghostInstance, 0.25)
		FurnishUtility:SetCanCollide(ghostInstance, false)		
		
		local possessionDatum = PossessionData.dataT[ BlueprintUtility.getPossessionName(ghostInstance) ]		
		FillOutInfoFrame( possessionDatum )
		EnableGrid( possessionDatum )
				
		mouse.TargetFilter = ghostInstance
		moveGhost( GetGhostFocusV3() )
		
		selectionBox.Adornee = ghostInstance
	end
end


local function UnregisterGhost()
	registerGhost( true )
end

-- cache for low latency snappy UI
currencies.BuildPoints.CurrencyNameAndCount.Text = "Dungeon Points: "..cachedBuildPointsN
furnishGui.ActiveFurnishingListFrame.BuildPoints.Text = "Dungeon Points: "..cachedBuildPointsN
furnishGui.ActiveCategoryListFrame.BuildPoints.Text = "Dungeon Points: "..cachedBuildPointsN

localPlayer.BuildPoints.Changed:Connect( function( valueN )
--	--print("Server updated Dungeon Points: "..valueN)
	local adjustmentN = valueN - cachedBuildPointsN
	cachedBuildPointsN = valueN
	if adjustmentN > 0 then
		GuiTraveller:SendTravellerWait( UDim2.new( 0.5, 0, 0.47, 0 ), 
			UDim2.new( 0, currencies.BuildPoints.AbsolutePosition.X,
				0, currencies.BuildPoints.AbsolutePosition.Y ),
				"", --furnishGui.Rubies.ImageLabel.Image,
				"DP",
				adjustmentN,
			Color3.fromRGB( 255, 255, 255 ) )
	end
	currencies.BuildPoints.CurrencyNameAndCount.Text = "Dungeon Points: "..cachedBuildPointsN
	furnishGui.ActiveFurnishingListFrame.BuildPoints.Text = "Dungeon Points: "..cachedBuildPointsN
	furnishGui.ActiveCategoryListFrame.BuildPoints.Text = "Dungeon Points: "..cachedBuildPointsN
	
end)



function DismissLowerFrame( frame, chainFunc )
	local targetPosition = UDim2.new( frame.Position.X.Scale, frame.Position.X.Offset, 1 + frame.Size.Y.Scale, frame.Size.Y.Offset )
	frame:TweenPosition( targetPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 0.2, false, function()
			frame.Visible = false
			currentConfirmFrame.Visible = false			
			chainFunc()
		end)
end


local currentMouseHover   -- because there's no guarantee that leave one button will be called before it enters the next
local activeFurnishingListFrame
local activeCategoryListFrame


function CountTotalAvailableFurnishings( furnishingType )
	local count = 0
	for _, furnishing in pairs( PossessionData:GetDataAOfFlavor( PossessionData.FlavorEnum.Furnishing ) ) do
		if furnishing.furnishingType == furnishingType then
			local totalBuiltN, personalBuiltN, capN, numLeftN, blueprintsN, availableB = GetBlueprintCountInfo( furnishing ) 		
			
			count = count + numLeftN			
		end
	end	
	return count
end


function UpdateFurnishingListButtonInstance( frameInstance, furnishing )
	frameInstance.Name = furnishing.idS
	
	if not frameInstance:FindFirstChild("CategoryButton") then return end
	frameInstance.CategoryButton.Text = furnishing.readableNameS
	
	if not frameInstance:FindFirstChild("ThumbnailButton") then return end
	frameInstance.ThumbnailButton.Image = furnishing.imageId
	frameInstance.Visible = true
	-- when the build cost is negative I think it makes more sense to show a + as in 'you get money' and nothing
	-- when the cost is positive.
	
	frameInstance:WaitForChild("Cost").Text = 
		( furnishing.buildCostN < 0 and "+"..math.abs( furnishing.buildCostN ) or furnishing.buildCostN ).." DP"
	
	frameInstance.Cost.TextColor3 = furnishing.buildCostN > cachedBuildPointsN and Color3.fromRGB( 255, 0, 0 ) or 
	                            furnishing.buildCostN < 0 and Color3.fromRGB( 0, 255, 0 ) or Color3.fromRGB( 255, 255, 255 )		
	
	local totalBuiltN, personalBuiltN, capN, numLeftN, blueprintsN, availableB = GetBlueprintCountInfo( furnishing ) 		

	local available = frameInstance:FindFirstChild("Available")
	if not available then
		warn( frameInstance:GetFullName().." is missing Available" )
	else
		available.Text = numLeftN
		available.TextColor3 = furnishing.buildCostN >= 0 and Color3.fromRGB( 255, 255, 255 ) or Color3.fromRGB( 0, 255, 0 ) 
	end
	
	return numLeftN
end


function UpdateFurnishingListFrame( furnishingType )
	activeFurnishingListFrame = furnishGui.ActiveFurnishingListFrame  --:Clone()
	for _, frameInstance in pairs( activeFurnishingListFrame.Contents:GetChildren() ) do
		if frameInstance.Name ~= "UIListLayout" then
			UpdateFurnishingListButtonInstance( frameInstance, PossessionData.dataT[ frameInstance.Name ] )
		end
	end
end

local furnishingListOpenedThisSessionB = false
local chestClickedThisSessionB = false

-- also populates because we don't know what category we're filling with
function ActivateFurnishingListFrame( furnishingType )
	-- tutorial analytics
	if not furnishingListOpenedThisSessionB then
		furnishingListOpenedThisSessionB = true
		if localPlayer:WaitForChild("Tutorial").Value < 1 then
			AnalyticsClient.ReportEvent( "Tutorial", "Build", "OpenedFurnishings" )
--			GameAnalyticsClient.RecordDesignEvent( "Tutorial:Build:OpenedFurnishings" )
		end
	end

	-- protect from button mashing
--	if furnishGui:FindFirstChild("ActiveFurnishingListFrame") then return end
--	--print( "PopulateFurnishingListFrame" )	 
	activeFurnishingListFrame = furnishGui.ActiveFurnishingListFrame  --:Clone()
--	activeFurnishingListFrame.Name = "ActiveFurnishingListFrame"
	currentBuildMenu = activeFurnishingListFrame
	InstanceXL:ClearAllChildrenBut( activeFurnishingListFrame.Contents, "UIListLayout" )
	for _, furnishing in pairs( PossessionData:GetDataAOfFlavor( PossessionData.FlavorEnum.Furnishing ) ) do
		if furnishing.furnishingType == furnishingType then
			if furnishing.rarityN > 0 then
				local frameInstance = furnishGui.FurnishingTemplate:Clone()
				
				local numLeftN = UpdateFurnishingListButtonInstance( frameInstance, furnishing )

				frameInstance.Parent = activeFurnishingListFrame.Contents
				
				if numLeftN > 0 or FloorData:CurrentFloor().availableBlueprintsT[ furnishing.idS ] or InventoryClient:AmIInTutorial() then
					frameInstance.CategoryButton.MouseButton1Click:Connect( function()										
						-- awkward! - registerGhost() uses global variable
						if furnishing.idS == "Chest" then
							if not chestClickedThisSessionB then
								chestClickedThisSessionB = true
								if localPlayer:WaitForChild("Tutorial").Value < 1 then
									AnalyticsClient.ReportEvent( "Tutorial", "Build", "ClickedChest" )
--									GameAnalyticsClient.RecordDesignEvent( "Tutorial:Build:ClickedChest" )
								end
							end
						end

						local placeableName = furnishing.idS .. FloorData:CurrentFloor().blueprintSuffix
						local _, newPlaceableIdx = TableXL:FindWhere( placeable, function( v ) return v.Name==placeableName end )
						if( not newPlaceableIdx )then
							_, newPlaceableIdx = TableXL:FindWhere( placeable, function( v ) return v.Name==furnishing.idS end )
						end
						if( not newPlaceableIdx )then
							DebugXL:Error( 'Unable to find '..placeableName..' or '..furnishing.idS )
						end
						placeableIdx = newPlaceableIdx

						if game:GetService("UserInputService").TouchEnabled then
							-- tablets don't let you hover but they do show the grid so you have some idea
							-- that you're in a place-the-thing mode
							EnableGrid( furnishing )
						else
							if cachedBuildPointsN >= furnishing.buildCostN then	
								registerGhost()
							else
								MessageGui:PostMessageByKey( "NotEnoughDP", false )
								audio.Failure:Play()
							end								
						end
					end)
				else
					frameInstance.ThumbnailButton.ImageTransparency = 0.5
					frameInstance.Available.Visible = false
					frameInstance.Cost.Visible = false
				end
				
				local function DisplayFurnishingInfo()
					currentMouseHover = frameInstance.CategoryButton
--					--print( "Mouse enter "..furnishing.idS )
					FillOutInfoFrame( furnishing )
				end
				
				local function HideFurnishingInfo()
					if currentMouseHover == frameInstance.CategoryButton then
--						--print( "Mouse leave "..furnishing.idS )
						currentMouseHover = nil					
						if ghostInstance then
							local possessionDatum = PossessionData.dataT[ BlueprintUtility.getPossessionName(ghostInstance) ]
							FillOutInfoFrame( possessionDatum )
						else
							furnishingInfoFrame.Visible = false
						end
					end				
				end			
	
				frameInstance.CategoryButton.MouseEnter:Connect( function()
					DisplayFurnishingInfo()
				end) 
				
				frameInstance.CategoryButton.MouseLeave:Connect( function()
					HideFurnishingInfo()
				end) 
	
				frameInstance.CategoryButton.SelectionGained:Connect( function()
					DisplayFurnishingInfo()
				end)
				
				frameInstance.CategoryButton.SelectionLost:Connect( function()
					HideFurnishingInfo()
				end)
			end
		end
	end
	activeFurnishingListFrame.CategoryName.Text = furnishingType
	activeFurnishingListFrame:WaitForChild("CloseButton").MouseButton1Click:Connect( function()
		if activeFurnishingListFrame then
			DismissLowerFrame( activeFurnishingListFrame, function()
				ActivateCategoryListFrame()
			end)
		end
		activeFurnishingListFrame = nil
	end)

	activeFurnishingListFrame.Position = UDim2.new( furnishingFrameTargetPosition.X.Scale, 
		furnishingFrameTargetPosition.X.Offset, 
		furnishingFrameTargetPosition.Y.Scale + activeFurnishingListFrame.Size.Y.Scale, 
		furnishingFrameTargetPosition.Y.Offset + activeFurnishingListFrame.Size.Y.Offset )
	activeFurnishingListFrame.Visible = true
	activeFurnishingListFrame.MainScript.Disabled = false
	activeFurnishingListFrame.Parent = furnishGui
	activeFurnishingListFrame:TweenPosition( furnishingFrameTargetPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Back, 0.2 )
	if InputXL:UsingGamepad() then
		game.GuiService.SelectedObject = activeFurnishingListFrame.Contents:FindFirstChildWhichIsA("Frame"):WaitForChild("CategoryButton")
	end
end


function UpdateCategoryListButtonInstance( categoryFrame, furnishingType )
	local categoryButton = categoryFrame:FindFirstChild( "CategoryButton" )
	if not categoryButton then 
		warn( categoryFrame:GetFullName().." is missing CategoryButton" )
	else
		categoryButton.Text = furnishingType
	end
	categoryFrame.Name = furnishingType
	local available = categoryFrame:FindFirstChild("Available")
	if not available then
		warn( categoryFrame:GetFullName().." is missing Available" )
	else
		available.Text = CountTotalAvailableFurnishings( furnishingType )
		available.TextColor3 = PossessionData.furnishingTypesT[ furnishingType ].dpTypeS == "income" and Color3.new( 0, 1, 0 ) or Color3.new( 1, 1, 1 ) 
	end	
	categoryFrame.LayoutOrder = PossessionData.furnishingTypesT[ furnishingType ].dpTypeS == "income" and 1 or 2
	categoryFrame.Visible = true
end


function UpdateCategoryListFrame()
	activeCategoryListFrame = furnishGui:FindFirstChild("ActiveCategoryListFrame")
	if activeCategoryListFrame then  -- could be resetting. if there's nothing there there's no need to update anyway
		for _, categoryFrame in pairs( activeCategoryListFrame.Contents:GetChildren() ) do
			if categoryFrame.Name ~= "UIListLayout" then
				UpdateCategoryListButtonInstance( categoryFrame, categoryFrame.Name )
			end
		end 
	end
end


function PopulateCategoryListFrame()
--	--print( "PopulateCategoryListFrame" )
	-- protect against button mashing
	--if furnishGui:FindFirstChild("ActiveCategoryListFrame") then return end
		
	activeCategoryListFrame = furnishGui.ActiveCategoryListFrame  --:Clone()
	--currentBuildMenu = activeCategoryListFrame
	
	InstanceXL:ClearAllChildrenBut( activeCategoryListFrame.Contents, "UIListLayout" )
	for _, furnishingType in pairs( PossessionData.FurnishingEnum ) do
		-- how many times have I written 'populate a menu with a template' code?  Maybe I should abstract.  wishlist
		local categoryFrame = furnishGui.CategoryTemplate:Clone()
		UpdateCategoryListButtonInstance( categoryFrame, furnishingType )
		categoryFrame.Parent = activeCategoryListFrame.Contents
		categoryFrame.CategoryButton.MouseButton1Click:Connect( function()
			if activeCategoryListFrame then
				DismissLowerFrame( activeCategoryListFrame, function() ActivateFurnishingListFrame( furnishingType ) end )
			end
			activeCategoryListFrame = nil
		end)
	end
	activeCategoryListFrame:WaitForChild("CloseButton").MouseButton1Click:Connect( function()
		UnregisterGhost()
		if currentBuildMenu then
			DismissLowerFrame( currentBuildMenu, function() end )
		end
		activeCategoryListFrame = nil
		currentBuildMenu = nil
	end)
	
	--activeCategoryListFrame.Name = "ActiveCategoryListFrame"
	-- move off screen
	activeCategoryListFrame.Position = UDim2.new( categoryFrameTargetPosition.X.Scale,
		 categoryFrameTargetPosition.X.Offset,
		 categoryFrameTargetPosition.Y.Scale + activeCategoryListFrame.Size.Y.Scale, 
		 categoryFrameTargetPosition.Y.Offset + activeCategoryListFrame.Size.Y.Offset )
--	activeCategoryListFrame.Visible = true
--	activeCategoryListFrame.Parent = furnishGui
--	activeCategoryListFrame:TweenPosition( categoryFrameTargetPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Back, 0.3 )
--	if InputXL:UsingGamepad() then
--		game.GuiService.SelectedObject = activeCategoryListFrame.Contents.CategoryTemplate.CategoryButton
--	end
end

local categoryListOpenedThisSessionB = false

function ActivateCategoryListFrame()
	-- tutorial analytics
	if not categoryListOpenedThisSessionB then
		categoryListOpenedThisSessionB = true
		if localPlayer:WaitForChild("Tutorial").Value < 1 then
			AnalyticsClient.ReportEvent( "Tutorial", "Build", "OpenedCategories" )	
			--GameAnalyticsClient.RecordDesignEvent( "Tutorial:Build:OpenedCategories" )
		end
	end

	activeCategoryListFrame = furnishGui.ActiveCategoryListFrame  --:Clone()
	currentBuildMenu = activeCategoryListFrame
	
	activeCategoryListFrame.Visible = true
	activeCategoryListFrame.Parent = furnishGui
	activeCategoryListFrame:TweenPosition( categoryFrameTargetPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Back, 0.3 )
	if InputXL:UsingGamepad() then
		-- select a card, any card
		game.GuiService.SelectedObject = activeCategoryListFrame.Contents:WaitForChild("Treasure"):WaitForChild("CategoryButton")
	end
end


game:GetService("UserInputService").InputBegan:Connect( function( inputObject )
	if inputObject.UserInputType == Enum.UserInputType.Gamepad1 then
		if inputObject.KeyCode == Enum.KeyCode.ButtonB then
			if activeFurnishingListFrame then
				DismissLowerFrame( activeFurnishingListFrame, function()
					ActivateCategoryListFrame()
				end)
				activeFurnishingListFrame = nil
			elseif currentBuildMenu then
				UnregisterGhost()
				DismissLowerFrame( currentBuildMenu, function() end )
				currentBuildMenu = nil
			end
		end
	end
end)

PopulateCategoryListFrame()

local FurnishClientHandlerRemote = {}

function FurnishClientHandlerRemote.Close( )
	if currentBuildMenu then
		DismissLowerFrame( currentBuildMenu, function() end )
		currentBuildMenu = nil		
		UnregisterGhost()
		currentConfirmFrame.Visible = false		
	end
end


function FurnishClientHandlerRemote.Build( )
	if currentBuildMenu then
		FurnishClientHandlerRemote.Close()
	else		
		ActivateCategoryListFrame()
	end
end


function FurnishClientHandlerRemote.Rotate()
	if ghostInstance then
		rotation = rotation + 1
		
		if rotation > 3 then
			rotation = 0
		end
		
		moveGhost( InstanceXL:GetCFrame( ghostInstance ).p )  -- todo use current ghost position instead
	end
end


furnishGui.Event.Event:Connect( function( funcName, ... )
	FurnishClientHandlerRemote[ funcName ]( ... )
end)
	
	
local function WallOccupied( barrierV3 )
	-- this is annoying. Given the position of the barrier we've snapped to let's see if we can find the wall segments on either tile
	-- side
	local gridX = math.floor( barrierV3.X / MapTileData.cellWidthN ) + centerTileV2.X
	local gridZ = math.floor( barrierV3.Z / MapTileData.cellWidthN ) + centerTileV2.Y
	if gridX < 1 then return false end
	if gridZ < 1 then return false end
	if gridX > gridWidth then return false end
	if gridZ > gridWidth then return false end

	if barrierV3.X % MapTileData.cellWidthN == 0 then
		-- it's a north-south wall
		if DungeonClient:HasWall(  gridX, gridZ, MapTileData.DirEnum.South ) or
			DungeonClient:HasWall( gridX, gridZ+1, MapTileData.DirEnum.North ) then
			return true
		end		
	else -- east-west wall
		if DungeonClient:HasWall( gridX, gridZ, MapTileData.DirEnum.East ) or
			DungeonClient:HasWall( gridX+1, gridZ, MapTileData.DirEnum.West ) then
			return true
		end		
	end
	return false
end
	

local function PlaceFurnishing()
	-- it's possible to get in a click after your hero resets
	if not player.Character.Parent then return end
	if not player.Character:FindFirstChild("Humanoid") then return end
	if player.Character.Humanoid.Health <= 0 then return end
	
	if ghostInstance then   -- button presses and touches can get here even when no longer in build mode
		local possessionDatum = PossessionData.dataT[ BlueprintUtility.getPossessionName(ghostInstance) ]
		if possessionDatum.buildCostN > cachedBuildPointsN then
			MessageGui:PostMessageByKey( "NotEnoughDP", false )
			audio.Failure:Play()
		else
			local ghostV3 = ghostInstance:GetPrimaryPartCFrame().p
			local extentsV3 = ghostInstance:GetExtentsSize()
			local availableB = FloorData:CurrentFloor().availableBlueprintsT[ BlueprintUtility.getPossessionName(ghostInstance) ]
			local ghostRegion = Region3.new( ghostV3 - ghostInstance:GetExtentsSize() / 2,
				ghostV3 + ghostInstance:GetExtentsSize() / 2 )
			local totalN, personalN = unpack( FurnishUtility:CountFurnishings( BlueprintUtility.getPossessionName(ghostInstance), player ) )
			if totalN >= possessionDatum.levelCapN and not InventoryClient:AmIInTutorial() then  -- bypassing level limits when you're in tutorial so you can build what you need; people could use it to cheat the very first time they play, not the end of the world
				MessageGui:PostParameterizedMessage( "FurnishingFloorMax", { possessionDatum.readableNameS }, false )
				audio.Failure:Play()						
			elseif not availableB and personalN >= InventoryClient.inventory.itemsT[ possessionDatum.idS ] then --possessionDatum.buildCapN then
				MessageGui:PostParameterizedMessage( "FurnishingBlueprintMax", { possessionDatum.readableNameS }, false )
				audio.Failure:Play()
			elseif personalN >= possessionDatum.buildCapN then
				MessageGui:PostParameterizedMessage( "FurnishingPersonalMax", { possessionDatum.readableNameS }, false )
				audio.Failure:Play()										
			elseif not FurnishUtility:IsWithinBoundaries( workspace.BuildingBaseplate.Position, workspace.BuildingBaseplate.Size, ghostV3, ghostInstance.PrimaryPart.Size, rotation)
			 		or FurnishUtility:GridPointOccupied( ghostV3, extentsV3, possessionDatum.gridSubdivisionsN, possessionDatum.placementType )
					or ((possessionDatum.furnishingType == PossessionData.FurnishingEnum.Barrier) 
					and WallOccupied( ghostV3 ) ) 
					or not FurnishUtility:IsInMap( map, ghostV3 ) then
				MessageGui:PostMessageByKey( "SpotOccupied", false )
				audio.Failure:Play()	
			elseif FurnishUtility:CharacterWithinRegion( ghostRegion ) then
				MessageGui:PostMessageByKey( "PlayerThere", false )
				audio.Failure:Play()				
			else
				-- make cost snappy ;  earning Dungeon Points will send a pretty traveller
				if possessionDatum.buildCostN > 0 then
					cachedBuildPointsN = cachedBuildPointsN - possessionDatum.buildCostN
					currencies.BuildPoints.CurrencyNameAndCount.Text = "Dungeon Points: "..cachedBuildPointsN
					furnishGui.ActiveFurnishingListFrame.BuildPoints.Text = "Dungeon Points: "..cachedBuildPointsN
					furnishGui.ActiveCategoryListFrame.BuildPoints.Text = "Dungeon Points: "..cachedBuildPointsN
				end
				audio.FurnishSuccess:Play()
				local name = BlueprintUtility.getPossessionName(ghostInstance)
				local cf   = ghostInstance:GetPrimaryPartCFrame().p
				
				
				--UnregisterGhost()  -- so it will be snappy doing it first,
				-- but then it's hard to place a bunch in a row. At least we have the audio!
				local successB = remotes.PlaceInstanceRF:InvokeServer( name, cf, rotation )
				if not successB then			
				--remotes["Place Instance"]:FireServer(BlueprintUtility.getPossessionName(ghostInstance), ghostInstance:GetPrimaryPartCFrame().p, rotation)
					-- whoops, something went wrong. Someone else built, character moved in the way, code bug, something.
					-- Docking DP now might mean that we can't finish tutorial!
					cachedBuildPointsN = localPlayer:WaitForChild("BuildPoints").Value
					-- don't know why, though, when we get here theres often no BuildPoints; maybe it happens when the player builds
					-- and immediately quits?
					if currencies:FindFirstChild("BuildPoints") then
						currencies.BuildPoints.CurrencyNameAndCount.Text = "Dungeon Points: "..cachedBuildPointsN
						furnishGui.ActiveFurnishingListFrame.BuildPoints.Text = "Dungeon Points: "..cachedBuildPointsN
						furnishGui.ActiveCategoryListFrame.BuildPoints.Text = "Dungeon Points: "..cachedBuildPointsN					
					end	
				end
			end
		end
	end
end


local function PlaceConfirmFrame()
	local screenV3, inFrontB = game.Workspace.CurrentCamera:WorldToScreenPoint( InstanceXL:GetCFrame( ghostInstance ).p )
	if inFrontB then
		local frameX = math.clamp( screenV3.X, 0, furnishGui.AbsoluteSize.X - currentConfirmFrame.AbsoluteSize.X ) 
		local frameY = math.clamp( screenV3.Y, 0, furnishGui.AbsoluteSize.Y - currentConfirmFrame.AbsoluteSize.Y )
		currentConfirmFrame.Position = UDim2.new( 0, frameX, 0, frameY + 40 ) 
	end
	currentConfirmFrame.Visible = true
end


userInputService.InputBegan:Connect(function(inputObject, gameProcessedEvent)
	if not gameProcessedEvent then
		if inputObject.UserInputType == Enum.UserInputType.Gamepad1 then
			-- not bothering with gamepad / key bindings as you can see
			local keyCode = inputObject.KeyCode
			if keyCode == Enum.KeyCode.ButtonR2 then
				PlaceFurnishing()
				currentConfirmFrame.Visible = false				
			elseif keyCode == Enum.KeyCode.ButtonB then
				UnregisterGhost()
				currentConfirmFrame.Visible = false				
			elseif keyCode == Enum.KeyCode.ButtonR1 then
				FurnishClientHandlerRemote.Rotate()
			end
		elseif inputObject.UserInputType == Enum.UserInputType.Touch then		
			if currentBuildMenu then				
				local possessionDatum = PossessionData.dataT[ BlueprintUtility.getPossessionName( placeable[placeableIdx] ) ]
				if cachedBuildPointsN >= possessionDatum.buildCostN then	
					-- touch inputs only show ghost once you click, then set up a UI to let you to adjust it or cancel it
					registerGhost()
					-- raycast from touch point into world
					local intersectionV3 = GhostPlaneIntersectionV3( inputObject.Position.X, inputObject.Position.Y )
					if intersectionV3 then
						moveGhost( intersectionV3 )
					end
					
					PlaceConfirmFrame()
	
				else
					MessageGui:PostMessageByKey( "NotEnoughDP", false )
					audio.Failure:Play()
				end			
			end
		else
			if ghostInstance then
				if inputObject.UserInputType == Enum.UserInputType.Keyboard then
					local keyCode = inputObject.KeyCode
					if keyCode == keyCodeEnum.R then
						FurnishClientHandlerRemote.Rotate()
					end
--				elseif keyCode == keyCodeEnum.Q then
--					FurnishClientHandlerRemote.Prev()
--				elseif keyCode == keyCodeEnum.E then
--					FurnishClientHandlerRemote.Next()
				elseif inputObject.UserInputType == userInputEnum.MouseButton1 then
					PlaceFurnishing()
					currentConfirmFrame.Visible = false				
					
				end
			end
		end
	end
end)



userInputService.InputChanged:Connect(function(inputObject, gameProcessedEvent)
	if inputObject.UserInputType == userInputEnum.MouseMovement then
		if not gameProcessedEvent then
			if ghostInstance then
				moveGhost( GetGhostFocusV3() )
				PlaceConfirmFrame()
			end
		end
	elseif inputObject.UserInputType == Enum.UserInputType.Gamepad1 then
		if ghostInstance then
--			--print( "Available ghost instance" )
			moveGhost( GetGhostFocusV3() )
			PlaceConfirmFrame()
		end
	end
end)

furnishGui.ConfirmFrameTouch.RotateButton.Activated:Connect( function( inputObject )
	if inputObject.UserInputState == Enum.UserInputState.End then
		FurnishClientHandlerRemote.Rotate()
	end
end)

furnishGui.ConfirmFrameTouch.ConfirmButton.Activated:Connect( function( inputObject )
	if inputObject.UserInputState == Enum.UserInputState.End then
		PlaceFurnishing()
		UnregisterGhost()
		currentConfirmFrame.Visible = false
	end
end)

furnishGui.ConfirmFrameTouch.CancelButton.Activated:Connect( function( inputObject )
	if inputObject.UserInputState == Enum.UserInputState.End then	
		UnregisterGhost()
		currentConfirmFrame.Visible = false
	end
end)


local function ManageTutorialArrows()
	local activeCategoryListFrame = furnishGui:WaitForChild("ActiveCategoryListFrame")
	local activeFurnishingListFrame =  furnishGui:WaitForChild("ActiveFurnishingListFrame")
	local treasureButton = activeCategoryListFrame:WaitForChild("Contents"):WaitForChild("Treasure")
	local spawnButton    = activeCategoryListFrame:WaitForChild("Contents"):WaitForChild("Spawn")
	local treasureChestButton = activeFurnishingListFrame:WaitForChild("Contents"):FindFirstChild("Chest")
	local orcSpawnButton      = activeFurnishingListFrame:WaitForChild("Contents"):FindFirstChild("SpawnOrc")
	local tutorialProgress = localPlayer:WaitForChild("Tutorial").Value
	treasureButton:WaitForChild("UIArrow").Visible = activeCategoryListFrame.Visible and tutorialProgress == 0
	if treasureChestButton then
		treasureChestButton:WaitForChild("UIArrow").Visible = activeFurnishingListFrame.Visible and tutorialProgress == 0 
	end
	spawnButton:WaitForChild("UIArrow").Visible = activeCategoryListFrame.Visible and tutorialProgress == 1
	if orcSpawnButton then
		orcSpawnButton:WaitForChild("UIArrow").Visible = activeFurnishingListFrame.Visible and tutorialProgress == 1 
	end
end


workspace.Building.DescendantAdded:Connect( function()
	if game.Players.LocalPlayer.Character and game.Players.LocalPlayer.Character.Parent then
		UpdateFurnishingListFrame()
		UpdateCategoryListFrame()
	end
end )

GuiXL:waitForLoadingGoo()

while true do
	wait(0.1)
	-- tutorial management
	if localPlayer.Team == game.Teams.Heroes then
		currencies.BuildPoints.Visible = false
	else
		currencies.BuildPoints.Visible = true
		ManageTutorialArrows()
	end
end