print( script:GetFullName().." executed" )

local CharacterClientI  = require( game.ReplicatedStorage.CharacterClientI )
--print( "ChooseHeroScript: CharacterClientI required" )
local HeroUtility       = require( game.ReplicatedStorage.Standard.HeroUtility )
--print( "ChooseHeroScript: HeroUtility required" )
local InventoryClient   = require( game.ReplicatedStorage.InventoryClient )
--print( "ChooseHeroScript: InventoryClient required" )
local DeveloperProducts = require( game.ReplicatedStorage.DeveloperProducts )
--print( "ChooseHeroScript: DeveloperProducts required" )

local CheatUtilityXL    = require( game.ReplicatedStorage.TS.CheatUtility )
--print( "ChooseHeroScript: CheatUtilityXL required" )
local InputXL           = require( game.ReplicatedStorage.Standard.InputXL )
--print( "ChooseHeroScript: InputXL required" )
local InstanceXL        = require( game.ReplicatedStorage.Standard.InstanceXL )
--print( "ChooseHeroScript: InstanceXL required" )
local TableXL           = require( game.ReplicatedStorage.Standard.TableXL )
--print( "ChooseHeroScript: TableXL required" )

local PossessionData    = require( game.ReplicatedStorage.PossessionData )
--print( "ChooseHeroScript: PossessionData required" )

local AssetManifest = require( game.ReplicatedFirst.TS.AssetManifest ).AssetManifest

local GuiXL = require( game.ReplicatedStorage.TS.GuiXLTS ).GuiXL
--print( "ChooseHeroScript: GuiXL required" )
local Hero = require( game.ReplicatedStorage.TS.HeroTS ).Hero
--print( "ChooseHeroScript: Hero required" )
local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize
--print( "ChooseHeroScript: Localize required" )
local MessageGui = require( game.ReplicatedStorage.TS.MessageGui ).MessageGui



local heroGuiFrame    = script.Parent.Parent:WaitForChild("HeroGui")
--print( "ChooseHeroScript: HeroGui available" )
local chooseHeroFrame = heroGuiFrame:WaitForChild("ChooseHero")
--print( "ChooseHeroScript: ChooseHero available" )
local playerGui = game.Players.LocalPlayer:WaitForChild("PlayerGui")
--print( "ChooseHeroScript: PlayerGui available" )


local function ChooseHero( slotN )
	workspace.Signals.HeroesRF:InvokeServer( "ChooseHero", slotN )
	chooseHeroFrame.Visible = false
	heroGuiFrame.Visible = false
	-- only people using hero express get to jump in when they want; other heroes have to wait for monsters to build some
	playerGui.CharacterSheetGui.CharacterSheet.Visible = true
	playerGui.PossessionsGui.PossessionsFrame.Visible = true	
end


local function CreateNewHero( slotN )
	--workspace.Signals.HeroesRF:InvokeServer( "NewHero" )
	chooseHeroFrame.Visible = false
	heroGuiFrame.ChooseClass.Visible = true
end


local function UnlockHeroSlot()
	game.MarketplaceService:PromptProductPurchase( game.Players.LocalPlayer, DeveloperProducts.productsT["Hero Slot"].ID )
end

--[[
local function MakeRecommendation( savedPlayerCharacters )
	local index = HeroUtility:GetRecommendation( game.Players.LocalPlayer, savedPlayerCharacters )
	if index then 	
		for i = 1, math.min( 5, #savedPlayerCharacters.heroesA + 1 ) do
			if chooseHeroFrame.Grid:FindFirstChild( tostring(i) ) then  		-- hack fix
				chooseHeroFrame.Grid[ i ].Recommended.Visible = i == index
			end
		end
	end
end
--]]

local function DisplayChoices()
	-- this is slow but fine - you're not expecting responsiveness at this moment 
	local savedPlayerCharacters = workspace.Signals.HeroesRF:InvokeServer( "GetSavedPlayerCharactersWait" )
	InstanceXL:ClearAllChildrenBut( chooseHeroFrame.Grid, "UIGridLayout" )
	for slotN, hero in ipairs( savedPlayerCharacters.heroesA ) do
		local heroButton = chooseHeroFrame.HeroButtonTemplate:Clone()
		heroButton.Name = slotN
		heroButton.HeroName.Text = Localize.formatByKey( "FullHeroDescription", { level = Hero:levelForExperience( hero.statsT.experienceN ), class = Localize.getName( hero ) } )
		-- heroButton.Description.Text = "\n"..
		-- 	HeroUtility.statNamesT.strN.." "..hero.statsT.strN.."\n"..
		-- 	HeroUtility.statNamesT.dexN.." "..hero.statsT.dexN.."\n"..
		-- 	HeroUtility.statNamesT.willN.." "..hero.statsT.willN.."\n"..
		-- 	HeroUtility.statNamesT.conN.." "..hero.statsT.conN.."\n"
			
		heroButton.Description.Text = "\n"..
			Localize.formatByKey( "strN" ).." "..hero.statsT.strN.."\n"..
			Localize.formatByKey( "dexN" ).." "..hero.statsT.dexN.."\n"..
			Localize.formatByKey( "willN" ).." "..hero.statsT.willN.."\n"..
			Localize.formatByKey( "conN" ).." "..hero.statsT.conN.."\n"
			
		heroButton.Image.Image = PossessionData.dataT[ hero.idS ].imageId
		heroButton.Visible = true
		heroButton.Parent = chooseHeroFrame.Grid
		heroButton.Choose.MouseButton1Click:Connect( function()
			ChooseHero( slotN )
		end)
		heroButton.Image.MouseButton1Click:Connect( function()
			ChooseHero( slotN )
		end)
		heroButton.Delete.MouseButton1Click:Connect( function()
			local result = MessageGui:ShowMessageAndAwaitResponse( Localize.formatByKey( "DeleteThing", { heroButton.HeroName.Text } ),
				true,
				0,
				true,
				"Yes",
				"No" )
			if result[1]=="Yes" then
				chooseHeroFrame.Visible = false			
				print("Invoking DeleteHero for player "..game.Players.LocalPlayer:GetFullName())
				savedPlayerCharacters = workspace.Signals.HeroesRF:InvokeServer( "DeleteHero", slotN )
				DisplayChoices()
				chooseHeroFrame.Visible = true			
			end
		end)
		if InputXL:UsingGamepad() then
			if slotN == 1 then
				game.GuiService.SelectedObject = heroButton.Choose 	
			end
		end
	end	
		
	-- new hero 
	if #savedPlayerCharacters.heroesA < 5 then
		local newHeroButton = chooseHeroFrame.NewHeroButtonTemplate:Clone()
		local heroSlot = #savedPlayerCharacters.heroesA + 1
		newHeroButton.Name = heroSlot
		newHeroButton.Parent = chooseHeroFrame.Grid
		newHeroButton.Visible = true
		if heroSlot > InventoryClient:GetCount( "HeroSlots" )then
			newHeroButton.Image.Image = AssetManifest.ImagePadlockLocked
			newHeroButton.NewHero.Text = "Unlock hero slot"
			newHeroButton.NewHero.MouseButton1Click:Connect( function()
				UnlockHeroSlot()
			end)
			newHeroButton.Image.MouseButton1Click:Connect( function()
				UnlockHeroSlot()
			end)
		else
			newHeroButton.NewHero.MouseButton1Click:Connect( function()
				CreateNewHero( #savedPlayerCharacters.heroesA + 1 )
			end)
			newHeroButton.Image.MouseButton1Click:Connect( function()
				CreateNewHero( #savedPlayerCharacters.heroesA + 1 )
			end)
		end
		if InputXL:UsingGamepad() then
			if #savedPlayerCharacters.heroesA == 0 then
				game.GuiService.SelectedObject = newHeroButton.NewHero 	
			end
		end
	end
	
	--MakeRecommendation( savedPlayerCharacters )
	
	--[[for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
		spawn( function()
			local levelO = player:WaitForChild("leaderstats"):WaitForChild("Level")
			levelO.Changed:Connect( function() MakeRecommendation( savedPlayerCharacters ) end )
		end )
	end--]]
end


local function Display()
	game.Players.LocalPlayer.PlayerGui.FurnishGui.Event:Fire( "Close" )	
	GuiXL:waitForLoadingGoo()
	
--	print( "Displaying hero choices" )
--	warn( debug.traceback() )
--  this doesn't work because class can replicate late
--	if CharacterClientI:GetCharacterClass( game.Players.LocalPlayer ) == "" then
	DisplayChoices()
--	print( "ChooseHero visibilefying" )
	chooseHeroFrame.Visible = true
	heroGuiFrame.Visible = true
	while CharacterClientI:GetCharacterClass( game.Players.LocalPlayer ) == "" do wait(0.1) end
--	else
--		print( "But class already chosen" )
--	end 

end

-- used to automatically display on a character reset; shouldn't need anymore (and can be redundant on first load)
--if game.Players.LocalPlayer.Team == game.Teams.Heroes then Display() end

-- this doesn't work be
--[[
game.Players.LocalPlayer.Changed:Connect( function( property )
	if property=="Team" then
		print( "Detecting team change" )
		if game.Players.LocalPlayer.Team == game.Teams.Heroes then
			Display()
		end
	end
end)
--]]

local ChooseHeroRemote = {}

function ChooseHeroRemote:ChooseHero()
	print("ChooseHeroRemote:ChooseHero")
	Display()
end


function ChooseHeroRemote:DefaultHeroChosen()
	chooseHeroFrame.Visible = false
	heroGuiFrame.ChooseClass.Visible = false
	heroGuiFrame.Visible = false	
end


function ChooseHeroRemote:PrepareHero()
	chooseHeroFrame.Visible = false
	heroGuiFrame.Visible = false
	playerGui.CharacterSheetGui.CharacterSheet.Visible = true
	playerGui.CharacterSheetGui.CharacterSheet.Visible = true
	playerGui.PossessionsGui.PossessionsFrame.Visible = true
end

--
workspace.Signals.ChooseHeroRE.OnClientEvent:Connect( function( funcName, ... )
	ChooseHeroRemote[ funcName ]( ChooseHeroRemote, ... )
end )
print("ChooseHeroRemote connected")

workspace.Signals.ChooseHeroRE:FireServer( "ack" )

InventoryClient:InventoryUpdatedConnect( function()
	-- refresh window
	DisplayChoices()
end)

