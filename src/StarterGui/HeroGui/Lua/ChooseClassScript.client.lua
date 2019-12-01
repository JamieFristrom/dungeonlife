local DebugXL            = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL         = require( game.ReplicatedStorage.Standard.InstanceXL )
local InputXL            = require( game.ReplicatedStorage.Standard.InputXL )

local CharacterClientI   = require( game.ReplicatedStorage.CharacterClientI )
local DeveloperProducts  = require( game.ReplicatedStorage.DeveloperProducts )
local InventoryClient    = require( game.ReplicatedStorage.InventoryClient )
local PossessionData     = require( game.ReplicatedStorage.PossessionData )

local HeroClasses = require( game.ReplicatedStorage.TS.HeroClassesTS ).HeroClasses
local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize
local MessageGui = require( game.ReplicatedStorage.TS.MessageGui ).MessageGui

local heroData = HeroClasses.heroClassPrototypes

local heroGuiFrame = script.Parent.Parent:WaitForChild("HeroGui") 
local chooseClassFrame = heroGuiFrame:WaitForChild("ChooseClass")
local playerGui = game.Players.LocalPlayer:WaitForChild("PlayerGui")

local function ChooseClass( classNameS )
	workspace.Signals.HeroesRE:FireServer( "ChooseClass", classNameS )
	workspace.Signals.MainRE:FireServer( "SignalReady" )	
	heroGuiFrame.Visible = false
	chooseClassFrame.Visible = false
--  actually, jump into play with your new class, what is there to do?
--	playerGui.CharacterSheetGui.CharacterSheet.Visible = true
--	playerGui.PossessionsGui.PossessionsFrame.Visible = true
end


local function Refresh()
	InstanceXL:ClearAllChildrenBut( chooseClassFrame.Grid, "UIGridLayout" )
	local idxN = 0
	for i, heroDatum in pairs( heroData ) do
		
		local heroButton = chooseClassFrame.HeroButtonTemplate:Clone()
		heroButton.Name = "Hero"..idxN
		idxN = idxN + 1
		heroButton.HeroName.Text = heroDatum.readableNameS
		heroButton.Description.Text = Localize.formatByKey( heroDatum.idS.."Description" )
		heroButton.Image.Image = heroDatum.imageId
		heroButton.Visible = true
		
		function hasClass( heroDatum )
			return not heroDatum.gamePassId or InventoryClient:GetCount( heroDatum.idS ) > 0 
		end

		if not hasClass( heroDatum ) then
			heroButton.Padlock.Visible = true
			heroButton.Choose.Text = "Unlock"
		end

		local function clickChooseHero()
			if hasClass( heroDatum ) then
				ChooseClass( heroDatum.idS )
			else
				if( heroDatum.gamePassId )then
					game.MarketplaceService:PromptGamePassPurchase( game.Players.LocalPlayer, heroDatum.gamePassId )
				else
					DebugXL:Error( "Vanilla hero class unavailable")
				end
			end
		end

		heroButton.Image.MouseButton1Click:Connect( clickChooseHero )
		heroButton.Choose.MouseButton1Click:Connect( clickChooseHero )

		heroButton.Parent = chooseClassFrame.Grid

		if InputXL:UsingGamepad() then
			if i==1 then
				game.GuiService.SelectedObject = heroButton.Choose
			end 
		end		
	end
end

Refresh()

InventoryClient:InventoryUpdatedConnect( function()
	-- refresh window
	Refresh()
end)