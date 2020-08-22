
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local InstanceXL = require( game.ReplicatedStorage.Standard.InstanceXL )

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )
local FlexEquipUtility = require( game.ReplicatedStorage.Standard.FlexEquipUtility )

local HeroUtility = require( game.ReplicatedStorage.Standard.HeroUtility )
local InventoryClient  = require( game.ReplicatedStorage.InventoryClient )

local AssetManifest = require( game.ReplicatedFirst.TS.AssetManifest ).AssetManifest

local FlexToolClient = require( game.ReplicatedStorage.TS.FlexToolClient ).FlexToolClient
local PCClient = require( game.ReplicatedStorage.TS.PCClient ).PCClient
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData
local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize

local GearUI = {}

local playerGui = game.Players.LocalPlayer:WaitForChild("PlayerGui")
local audio = playerGui:WaitForChild("Audio")

function GearUI.FillOutInfoFrame( itemInfoFrame, flexToolInst )
	
	local allActiveSkins = InventoryClient.inventory.activeSkinsT
	local activeSkinsT = game.Players.LocalPlayer.Team == game.Teams.Heroes and allActiveSkins.hero or allActiveSkins.monster	
		
	itemInfoFrame.ReadableName.Text = FlexToolClient.getReadableName( flexToolInst, activeSkinsT )  -- active skin will just change picture now
	itemInfoFrame.ReadableName.Boost.Visible = flexToolInst.boostedB
	itemInfoFrame.Description.Text  = FlexToolClient.getDescription( flexToolInst )
	
	local baseData = ToolData.dataT[ flexToolInst.baseDataS ]
	local statReqN, statName = FlexEquipUtility:GetStatRequirement( flexToolInst )
	if statReqN then
		local levelReqN = flexToolInst:getLevelRequirement() 
		itemInfoFrame.Requires.Text = Localize.formatByKey( "ToolRequires", { level = levelReqN, statname = Localize.formatByKey( statName ), statreq = statReqN } )
		itemInfoFrame.Requires.Visible = true
	else
		itemInfoFrame.Requires.Visible = false
	end
	
	if baseData.useTypeS == "worn" then
		itemInfoFrame.Defense.Visible = true
		-- wishlist, show actual and nerfed values
		itemInfoFrame.Defense.DefenseClose.DefenseStat.Text = FlexEquipUtility:GetDefense( flexToolInst, "melee" )
		itemInfoFrame.Defense.DefenseRanged.DefenseStat.Text = FlexEquipUtility:GetDefense( flexToolInst, "ranged" )
		itemInfoFrame.Defense.DefenseSpell.DefenseStat.Text = FlexEquipUtility:GetDefense( flexToolInst, "spell" )
	else
		itemInfoFrame.Defense.Visible = false
	end
--	wait()
--  this doesn't work with scale interiors
--	itemInfoFrame.Size = UDim2.new( itemInfoFrame.Size.X.Scale, itemInfoFrame.Size.X.Offset, 0, itemInfoFrame.UIListLayout.AbsoluteContentSize.Y )
end


function GearUI.PopulateGearFrame( gearFrame, gearTemplate, itemInfoFrame, gearPairsA, activeSkinsT, maxGearSlotsN, onClickFunc )
	DebugXL:Assert( PCClient.pc )
	if not PCClient.pc then return end
	
	InstanceXL:ClearAllChildrenBut( gearFrame, "UIGridLayout" )
	local count = 0
	for i, itemPair in pairs( gearPairsA ) do
		local k = itemPair[1] 
		local item = itemPair[2]
		if count >= maxGearSlotsN then
			break
		end 
		if ToolData.dataT[ item.baseDataS ].equipType ~= "potion" then
			local newItem = gearTemplate:Clone()
			newItem.Name   = k  
			newItem.Visible = true
			newItem.Title.Text = FlexToolClient.getShortName( item, activeSkinsT ) 
			newItem.LayoutOrder = i
			local levelReqN = item:getLevelRequirement() -- FlexEquipUtility:GetLevelRequirement( item )
			local baseLevelN = item:getActualLevel()

			newItem.Level.Text = Localize.formatByKey( "Lvl", { item:getActualLevel() } ) -- FlexEquipUtility:GetLevelRequirement( item )			
			local weaponGood = PCClient.pc:canUseGear( item )
			if weaponGood then
				newItem.Level.TextColor3 = Color3.fromRGB( 255, 201, 124 )
			else
				newItem.Level.TextColor3 = Color3.new( 1, 0, 0 )
			end
			
			if CharacterClientI:GetEquipped( item ) then
				local equipSlot = ToolData.dataT[ item.baseDataS ].equipSlot
				if equipSlot == ToolData.EquipSlotEnum.Torso then
					newItem.EquipSlot.Image = AssetManifest.ImageEquipSlotTorso
				elseif equipSlot == ToolData.EquipSlotEnum.Head then
					newItem.EquipSlot.Image = AssetManifest.ImageEquipSlotHead
				elseif equipSlot == ToolData.EquipSlotEnum.Legs then
					newItem.EquipSlot.Image = AssetManifest.ImageEquipSlotLegs
				else
					DebugXL:Error( "Equip slot image unsupported: "..item.baseDataS )					
				end
				newItem.EquipSlot.Visible = true
			else
				newItem.EquipSlot.Visible = false
			end
			
			local hotbarSlot = CharacterClientI:GetPossessionSlot( PCClient.pc, item )
			if hotbarSlot then
				newItem.Hotkey.Visible = true
				newItem.Hotkey.Text = hotbarSlot			
			else
				newItem.Hotkey.Visible = false
			end				
			
			newItem.Background.ImageColor3 = FlexEquipUtility:GetRarityColor3( item )
			newItem.ImageLabel.Image = FlexEquipUtility:GetImageId( item, activeSkinsT )
			newItem.Button.MouseButton1Click:Connect( function()
				--print( "Detected inventory frame click "..item.baseDataS )
				audio.UIClick:Play()		
                GearUI.FillOutInfoFrame( itemInfoFrame, item )
                onClickFunc( k )
			end)
			
			newItem.Parent = gearFrame
			count = count + 1
		end
	end	
end


return GearUI