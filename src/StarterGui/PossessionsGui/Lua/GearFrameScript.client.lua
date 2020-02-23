local DebugXL          = require( game.ReplicatedStorage.Standard.DebugXL )
local InputXL          = require( game.ReplicatedStorage.Standard.InputXL )
local InstanceXL       = require( game.ReplicatedStorage.Standard.InstanceXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL ) 
local GearUI = require( game.ReplicatedStorage.Standard.GearUI )

local DeveloperProducts = require( game.ReplicatedStorage.DeveloperProducts )
local PossessionData   = require( game.ReplicatedStorage.PossessionData )

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )
local FlexEquipUtility  = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local HeroUtility      = require( game.ReplicatedStorage.Standard.HeroUtility )
local InventoryClient  = require( game.ReplicatedStorage.InventoryClient )

local FlexToolClient = require( game.ReplicatedStorage.TS.FlexToolClient ).FlexToolClient
local Hero = require( game.ReplicatedStorage.TS.HeroTS ).Hero
local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData
local PCClient = require( game.ReplicatedStorage.TS.PCClient ).PCClient


local pcEvent  		= workspace:WaitForChild('Signals'):WaitForChild('HeroesRE')
--local pcFunc   		= workspace.Signals.HeroesRF

local possessionsFrame = script.Parent.Parent:WaitForChild("PossessionsFrame")
local itemInfoFrame = possessionsFrame:WaitForChild("ItemInfoFrame")
local shopItemInfoFrame = script.Parent.Parent:WaitForChild("GearShopFrame"):WaitForChild("ItemInfoFrame")
local assignBar = itemInfoFrame:WaitForChild( "Hotbar" )

--pcData = pcFunc:InvokeServer( "GetStatsWait" )

local curGearPoolKey

local equipKeyCodes =
{
    { Enum.KeyCode.DPadUp, Enum.KeyCode.One, Enum.KeyCode.KeypadOne },
    { Enum.KeyCode.DPadRight, Enum.KeyCode.Two, Enum.KeyCode.KeypadTwo },
    { Enum.KeyCode.DPadDown, Enum.KeyCode.Three, Enum.KeyCode.KeypadThree },
    { Enum.KeyCode.DPadLeft, Enum.KeyCode.Four, Enum.KeyCode.KeypadFour },
}

local playerGui = game.Players.LocalPlayer:WaitForChild("PlayerGui")
local audio = playerGui:WaitForChild("Audio")

-- forward declaration hack for new script analysis
local ShowInfoFrame = nil

function AssignCurrentToHotbarSlot( i )
	DebugXL:Assert( PCClient.pc )
	if( PCClient.pc )then
		audio.UIClick:Play()
		local flexToolInst = PCClient.pc.gearPool:get( curGearPoolKey )
		if flexToolInst then  -- it's possible to sell your item and click on it again in your inventory before it's updated, so we have to check
			pcEvent:FireServer( "AssignItemToSlot", curGearPoolKey, i )  -- on server
			CharacterClientI:AssignPossessionToSlot( PCClient.pc, curGearPoolKey, i )  -- on client for snap
			GearUI.FillOutInfoFrame( itemInfoFrame, flexToolInst )			
			WireInfoFrame( curGearPoolKey )			
		end
	end
end


function ShowInfoFrame()
	DebugXL:Assert( PCClient.pc )
	if( PCClient.pc )then	
		shopItemInfoFrame.Visible = false
		itemInfoFrame.Visible = true
		
		local flexToolInst = PCClient.pc.gearPool:get( curGearPoolKey )
		local baseData = ToolData.dataT[ flexToolInst.baseDataS ] 	
		local weaponB = baseData.useTypeS == "held" or baseData.useTypeS == "power"
		if weaponB then
			for i = 1, 4 do
				game.ContextActionService:BindAction( "assign"..i, function( _, uis )
					if uis == Enum.UserInputState.Begin then
						AssignCurrentToHotbarSlot( i )
					end
				end, false, unpack( equipKeyCodes[i]))
			end
		else
			UnbindAssignActions()
		end
	end
end


function WireInfoFrame( flexToolIdx )
	DebugXL:Assert( PCClient.pc )
	if( PCClient.pc )then	
		curGearPoolKey = flexToolIdx
		local flexToolInst = PCClient.pc.gearPool:get( flexToolIdx )
		local baseData = ToolData.dataT[ flexToolInst.baseDataS ]

		itemInfoFrame.Sell.Text = Localize.formatByKey( "SellFor", { flexToolInst:getSellPrice() } )

		if baseData.useTypeS == "held" or baseData.useTypeS == "power" then
			local currentAssignedSlot = CharacterClientI:GetPossessionSlot( PCClient.pc, flexToolInst )
			for i = 1, CharacterClientI.maxSlots do
				local assignmentButtonFrame = assignBar:WaitForChild( "Slot"..i )
				assignmentButtonFrame.ImageLabel.Visible = currentAssignedSlot == i
			end
			local weaponGood = HeroUtility:CanUseWeapon( PCClient.pc, flexToolInst )
			if not weaponGood then
				itemInfoFrame.Requires.TextColor3 = Color3.new( 1, 0, 0 )
				assignBar.Visible = false
				itemInfoFrame.AssignedTo.Visible = false
			else
				itemInfoFrame.Requires.TextColor3 = Color3.new( 1, 1, 1 )
				assignBar.Visible = true
				itemInfoFrame.AssignedTo.Visible = true
			end		
		else
			itemInfoFrame.AssignedTo.Visible = false
			assignBar.Visible = false
		end

		if baseData.useTypeS == "worn" then
			local weaponGood = HeroUtility:CanUseWeapon( PCClient.pc, flexToolInst )
			if weaponGood then
				itemInfoFrame.Wear.Visible = true
				if CharacterClientI:GetEquipped( flexToolInst ) then
					itemInfoFrame.Wear.Text = "Take off"
				else
					itemInfoFrame.Wear.Text = "Wear"			
				end
			else
				itemInfoFrame.Wear.Visible = false
			end
			itemInfoFrame.Hide.Visible = true
			itemInfoFrame.Hide.Checkbox.Image = flexToolInst.hideItemB and "rbxassetid://61153606" or ""
			itemInfoFrame.HideAccessories.Visible = true
			itemInfoFrame.HideAccessories.Checkbox.Image = flexToolInst.hideAccessoriesB and "rbxassetid://61153606" or ""
		else
			itemInfoFrame.Wear.Visible = false
			itemInfoFrame.Hide.Visible = false
			itemInfoFrame.HideAccessories.Visible = false
		end

		if InputXL:UsingGamepad() then
			local flexToolInst = PCClient.pc.gearPool:get( flexToolIdx )
			local baseData = ToolData.dataT[ flexToolInst.baseDataS ] 	
			local weaponB = baseData.useTypeS == "held" or baseData.useTypeS == "power"
			if weaponB then
				game.GuiService.SelectedObject = itemInfoFrame.Hotbar.Slot1.Button
			elseif itemInfoFrame.Wear.Visible then
				game.GuiService.SelectedObject = itemInfoFrame.Wear
			else
				game.GuiService.SelectedObject = itemInfoFrame.Sell
			end
		end	
		ShowInfoFrame()
	end
end


function ShowInfoFrame()
	DebugXL:Assert( PCClient.pc )
	if( PCClient.pc )then	
		shopItemInfoFrame.Visible = false
		itemInfoFrame.Visible = true
		
		local flexToolInst = PCClient.pc.gearPool:get( curGearPoolKey )
		local baseData = ToolData.dataT[ flexToolInst.baseDataS ] 	
		local weaponB = baseData.useTypeS == "held" or baseData.useTypeS == "power"
		if weaponB then
			for i = 1, 4 do
				game.ContextActionService:BindAction( "assign"..i, function( _, uis )
					if uis == Enum.UserInputState.Begin then
						AssignCurrentToHotbarSlot( i )
					end
				end, false, unpack( equipKeyCodes[i]))
			end
		else
			UnbindAssignActions()
		end
	end
end


function UnbindAssignActions()
	for i = 1, 4 do
		game.ContextActionService:UnbindAction( "assign"..i )
	end
end


function HideInfoFrame()
	itemInfoFrame.Visible = false
	UnbindAssignActions()
end


for i = 1, 4 do
	local assignmentButtonFrame = assignBar:WaitForChild( "Slot"..i )
	assignmentButtonFrame.Button.MouseButton1Click:Connect( function()
		AssignCurrentToHotbarSlot( i ) 
	end )
end


itemInfoFrame.Wear.MouseButton1Click:Connect( function()
	DebugXL:Assert( PCClient.pc )
	if( PCClient.pc )then	
		audio.UIClick:Play()
		InstanceXL:CreateSingleton( "BoolValue", { Name= "ChangingCostume", Parent= game.Players.LocalPlayer.Character, Value= true })
		local item = PCClient.pc.gearPool:get( curGearPoolKey )
		if item then  -- it's possible to sell your item and then rapidly click on it in inventory before it's gone
			pcEvent:FireServer( "Equip", curGearPoolKey, not CharacterClientI:GetEquipped( PCClient.pc.gearPool:get( curGearPoolKey ) ) )
		end
		HideInfoFrame()
	end
end)


itemInfoFrame.Sell.MouseButton1Click:Connect( function()
	audio.UIClick:Play()
--  this didn't work because the server than queries yes/no and if we say no we'll be stuck
--  so I'm just letting it be ugly - the symptom is if you throw something away while running there'll be a 
--  jump when the server gives you your new character
--	if CharacterClientI:GetEquipped( PCClient.pc.gearPool:get( curGearPoolKey ) ) then
--	    InstanceXL:CreateSingleton( "BoolValue", { Name= "ChangingCostume", Parent= game.Players.LocalPlayer.Character, Value= true })		
--	end
	pcEvent:FireServer( "SellItem", curGearPoolKey )
	HideInfoFrame()
end)


itemInfoFrame.Hide.Checkbox.MouseButton1Click:Connect( function()
	DebugXL:Assert( PCClient.pc )
	if( PCClient.pc )then	
		audio.UIClick:Play()
		PCClient.pc.gearPool:get( curGearPoolKey ).hideItemB = not PCClient.pc.gearPool:get( curGearPoolKey ).hideItemB
		pcEvent:FireServer( "SetHideItem", curGearPoolKey, PCClient.pc.gearPool:get( curGearPoolKey ).hideItemB )
		itemInfoFrame.Hide.Checkbox.Image = PCClient.pc.gearPool:get( curGearPoolKey ).hideItemB and "rbxassetid://61153606" or ""
	end
end )

itemInfoFrame.HideAccessories.Checkbox.MouseButton1Click:Connect( function()
	DebugXL:Assert( PCClient.pc )
	if( PCClient.pc )then	
		audio.UIClick:Play()
		PCClient.pc.gearPool:get( curGearPoolKey ).hideAccessoriesB = not PCClient.pc.gearPool:get( curGearPoolKey ).hideAccessoriesB
		pcEvent:FireServer( "SetHideAccessories", curGearPoolKey, PCClient.pc.gearPool:get( curGearPoolKey ).hideAccessoriesB )
		itemInfoFrame.HideAccessories.Checkbox.Image = PCClient.pc.gearPool:get( curGearPoolKey ).hideAccessoriesB and "rbxassetid://61153606" or ""
	end
end )


possessionsFrame:WaitForChild("GearBorder")
local startingInlayHeightScale = possessionsFrame.GearBorder.Size.Y.Scale
local startingInlayHeightOffset = possessionsFrame.GearBorder.Size.Y.Offset


function RefreshSheet()
	if not PCClient.pc or not PCClient.pc.statsT then 
		print("Is no hero")
		return 
	end

	possessionsFrame.GearBorder:WaitForChild("Expand").Visible = InventoryClient.inventory.itemsT.GearSlots <= 25

	possessionsFrame.GearBorder.Size = UDim2.new( possessionsFrame.GearBorder.Size.X.Scale, possessionsFrame.GearBorder.Size.X.Offset,
		startingInlayHeightScale * InventoryClient.inventory.itemsT.GearSlots / 30,
		startingInlayHeightOffset * InventoryClient.inventory.itemsT.GearSlots / 30 )
	
	InstanceXL:ClearAllChildrenBut( possessionsFrame.Inlay, "UIGridLayout" )
	
	local allActiveSkins = InventoryClient.inventory.activeSkinsT
	local activeSkinsT = game.Players.LocalPlayer.Team == game.Teams.Heroes and allActiveSkins.hero or allActiveSkins.monster	
			
	local itemPairsA = PCClient.pc:getSortedItems()

	GearUI.PopulateGearFrame( possessionsFrame.Inlay, possessionsFrame.ItemTemplate, itemInfoFrame, itemPairsA, activeSkinsT, InventoryClient.inventory.itemsT.GearSlots,
		function( flexToolIdx )
			WireInfoFrame( flexToolIdx )
		end )

end

local InventoryFrameRemote = {}


function InventoryFrameRemote:RefreshSheet(  )
	print("Refreshing possessions sheet due to inventory update")
	RefreshSheet()
end


PCClient.pcUpdatedConnect( function()
	print("Refreshing possessions sheet due to pc update")
	RefreshSheet()
end)


local function CloseSheet()
	possessionsFrame.Visible = false
end

possessionsFrame.CloseButton.MouseButton1Click:Connect( CloseSheet )

game:GetService("UserInputService").InputBegan:Connect( function( inputObject )
	if inputObject.UserInputType == Enum.UserInputType.Gamepad1 then
		if inputObject.KeyCode == Enum.KeyCode.ButtonB then
			CloseSheet()
		end
	end
end)

possessionsFrame.Changed:Connect( function( property )
	if property == "Visible" then
		if possessionsFrame.Visible then
			if InputXL:UsingGamepad() then
				local itemIcons = TableXL:FindAllInAWhere( possessionsFrame.Inlay:GetChildren(), function(item) return item:IsA("Frame"); end);
				if #itemIcons > 0 then
					game.GuiService.SelectedObject = itemIcons[1];
					DebugXL:Assert( PCClient.pc )
					if( PCClient.pc )then	
						local flexToolInst = PCClient.pc.gearPool:get( itemIcons[1].Name )
						GearUI.FillOutInfoFrame( itemInfoFrame, flexToolInst )
						WireInfoFrame( itemIcons[1].Name )
					end
				end
			end
		else
			HideInfoFrame()
		end
	end
end)

InventoryClient:InventoryUpdatedConnect( function() 
	InventoryFrameRemote:RefreshSheet( )
end)	

possessionsFrame:WaitForChild("GearBorder"):WaitForChild("Expand").MouseButton1Click:Connect( function()
	if InventoryClient.inventory.itemsT.GearSlots <= 15 then
		game.MarketplaceService:PromptProductPurchase( game.Players.LocalPlayer, DeveloperProducts.productsT["Fifteen Gear Slots"].ID )
	elseif InventoryClient.inventory.itemsT.GearSlots <= 25 then
		game.MarketplaceService:PromptProductPurchase( game.Players.LocalPlayer, DeveloperProducts.productsT["Five Gear Slots"].ID )
	end
end )

game.GuiService.Changed:Connect( function( property )
	if( property=="SelectedObject" ) then
		-- selects the button sub-object of the item element
		if game.GuiService.SelectedObject and game.GuiService.SelectedObject.Parent.Parent == possessionsFrame.Inlay then
			DebugXL:Assert( PCClient.pc )
			if( PCClient.pc )then	
				audio.UIClick:Play()			
				local flexToolInst = PCClient.pc.gearPool:get( game.GuiService.SelectedObject.Parent.Name )
				GearUI.FillOutInfoFrame( itemInfoFrame, flexToolInst )
				WireInfoFrame( game.GuiService.SelectedObject.Parent.Name )			
			end
		end
	end
end)

workspace.GameManagement.PreparationCountdown.Changed:Connect( function(newvalue)
	if newvalue == 0 then
		CloseSheet()
	end
end)

RefreshSheet()

while wait(0.1) do
	-- hero tutorial for gear choosing
	if possessionsFrame.Visible then
		if not PCClient.pc then 
			possessionsFrame.Visible = false 
		else
			-- if you have unassigned gear you can use and an empty slot show how to assign it
			for i = 1, CharacterClientI.maxSlots do
				possessionsFrame.ItemInfoFrame.Hotbar["Slot"..i].UIArrow.Visible = false			
			end
			
			local emptySlot
			for i = 1, CharacterClientI.maxSlots do
				if not CharacterClientI:GetPossessionFromSlot( PCClient.pc, i ) then
					emptySlot = i
					break
				end 
			end		
			
			for _, widget in pairs( possessionsFrame.Inlay:GetChildren() ) do
				if widget:IsA("Frame") then
					widget.UIArrow.Visible = false
				end
			end
			
			-- teach them how to put in a weapon
			local teachingHotbarB = false
			if emptySlot then
				local usableWeapons = PCClient.pc.gearPool:findAllWhere( function( item ) 
					return not CharacterClientI:GetPossessionSlot( PCClient.pc, item ) and
						( ToolData.dataT[ item.baseDataS ].useTypeS == "held" or ToolData.dataT[ item.baseDataS ].useTypeS == "power" ) and
						HeroUtility:CanUseWeapon( PCClient.pc, item ) 
				end )
				
				local item, _, itemId = TableXL:FindBestFitMax( usableWeapons, function( item )
					return item:getActualLevel()
				end)
				
				if itemId then
					if item ~= PCClient.pc.gearPool:get( curGearPoolKey ) then
						local buttonName = itemId
						local button = possessionsFrame.Inlay:FindFirstChild( buttonName )
						if button then  						-- it's possible it doesn't exist if game discovers you have thing off the end of your sheet
							button.UIArrow.Visible = true
						end 
					else
						possessionsFrame.ItemInfoFrame.Hotbar["Slot"..emptySlot].UIArrow.Visible = true
					end
				teachingHotbarB = true
				end
			end
				
			possessionsFrame.ItemInfoFrame.Wear.UIArrow.Visible = false
			if not teachingHotbarB then
				-- teach them how to do armor
				for _, slot in pairs( ToolData.EquipSlotEnum ) do
					local equipInSlot = CharacterClientI:GetEquipFromSlot( PCClient.pc, slot )
					if not equipInSlot then
						local usableArmor = PCClient.pc.gearPool:findAllWhere( function( item )
							return ToolData.dataT[ item.baseDataS ].equipSlot == slot and
								HeroUtility:CanUseWeapon( PCClient.pc, item)
						end )
						local item, _, itemId = TableXL:FindBestFitMax( usableArmor, function( item ) 
							return item:getActualLevel()
						end)
						if itemId then
							if item ~= PCClient.pc.gearPool:get( curGearPoolKey ) then
								local buttonName = itemId
								local button = possessionsFrame.Inlay:FindFirstChild( buttonName )
								if button then  -- it's possible it doesn't exist if game discovers you have thing off the end of your sheet
									button.UIArrow.Visible = true
								end
							else 
								possessionsFrame.ItemInfoFrame.Wear.UIArrow.Visible = true
							end
							break
						end					
					end 
				end
			end
		end
	end	
end