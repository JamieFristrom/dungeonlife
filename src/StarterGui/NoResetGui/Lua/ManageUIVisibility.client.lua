
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

game.StarterGui:SetCoreGuiEnabled( Enum.CoreGuiType.Backpack, false )
game.StarterGui:SetCoreGuiEnabled( Enum.CoreGuiType.PlayerList, false )

local GuiXL = require( game.ReplicatedStorage.TS.GuiXLTS ).GuiXL

local playerGui = script.Parent.Parent.Parent
playerGui:SetTopbarTransparency(0)

playerGui:WaitForChild("CurtainGui").Enabled = false
playerGui:WaitForChild("PlayerListGui").Enabled = false
playerGui:WaitForChild("NoResetGui").Enabled = false
playerGui:WaitForChild("HUDGui").Enabled = false
playerGui:WaitForChild("TopGui").Enabled = false
playerGui:WaitForChild("FurnishGui").Enabled = false  -- need to do this here otherwise the reset on spawnness of it breaks
playerGui:WaitForChild("MapGui").Enabled = false
playerGui:WaitForChild("HUDGui").Enabled = false  -- need to do this here otherwise the reset on spawnness of it breaks

-- make sure virtual controls load in before character gets destroyed
if game:GetService("UserInputService").TouchEnabled then
	local playerGui = game.Players.LocalPlayer.PlayerGui
	playerGui:WaitForChild( "TouchGui" )
	-- what we used to do is wait and then destroy the character (which could abort the UI creation mid-stream)
	-- but it seems like the player can save different control defaults now and this isn't future proof, so instead of destroying
	-- the avatar we're keeping it hidden; that should hopefully let this finish before we reset the avatar but is probably still a race
	-- condition...
--	local touchControlFrame = playerGui.TouchGui:WaitForChild( "TouchControlFrame" )
--	touchControlFrame:WaitForChild( "JumpButton" )
--	local dynamicThumbstickFrame = touchControlFrame:WaitForChild( "DynamicThumbstickFrame" )
--	while #dynamicThumbstickFrame:GetChildren() < 2 do wait() end
end

DebugXL:logI( LogArea.UI, "Acknowledging gui loaded" ) 
workspace.Signals.GameManagementRE:FireServer( "AcknowledgeGuiLoaded" )

GuiXL:waitForLoadingGoo()

while wait(0.1) do
	if playerGui:FindFirstChild("FurnishGui") then
		local furnishingMenuVisible = playerGui.FurnishGui:WaitForChild("ActiveCategoryListFrame").Visible or
				playerGui.FurnishGui:WaitForChild("ActiveFurnishingListFrame").Visible	 

		if game.Players.LocalPlayer.Team == game.Teams.Monsters then
			playerGui.CharacterSheetGui.CharacterSheet.Visible = false
			playerGui.PossessionsGui.PossessionsFrame.Visible = false
		end
		
		-- wishlist, this should probably be encapsulated in the individual frames	
		playerGui.NoResetGui.Currencies.Visible = not furnishingMenuVisible and not playerGui.CharacterSheetGui.CharacterSheet.Visible
		playerGui.FurnishGui.Currencies.Visible = not furnishingMenuVisible and not playerGui.CharacterSheetGui.CharacterSheet.Visible
		playerGui.TopGui.LocationLabel.Visible = not playerGui.CharacterSheetGui.CharacterSheet.Visible

		-- what?  using 'enabled'?  that's inconsistent.  but quickest way to do this because LeaderboardButton wants to control CustomLeaderboard
		-- visibility, not us
		playerGui.PlayerListGui.Enabled = not playerGui.PossessionsGui.PossessionsFrame.Visible	and not game.GuiService:IsTenFootInterface()
		playerGui.MessageGuiConfiguration.Enabled = not playerGui.NoResetGui.HeroTurnFrame.Visible
		
		playerGui.PossessionsGui.Hotbar.Visible = not furnishingMenuVisible and not playerGui.HeroGui.HeroGui.ChooseClass.Visible and not playerGui.HeroGui.HeroGui.ChooseHero.Visible
	end
end
