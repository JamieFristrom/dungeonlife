
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local startTime = tick()

local InventoryClient  = require( game.ReplicatedStorage.InventoryClient )

local AnalyticsClient = require( game.ReplicatedStorage.TS.AnalyticsClient ).AnalyticsClient
local GuiXL = require( game.ReplicatedStorage.TS.GuiXLTS ).GuiXL
local MessageGui = require( game.ReplicatedStorage.TS.MessageGui ).MessageGui
local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest
local ServerGui = require( game.ReplicatedStorage.TS.ServerGui ).ServerGui

local playerGui = script.Parent.Parent.Parent

local localPlayer = game.Players.LocalPlayer

local displayDelay = 0.001  -- it's slower than I'd like but can't go any faster. isn't that interesting?

DebugXL:logD(LogArea.UI, "Waiting for loading goo")
GuiXL:waitForLoadingGoo()
DebugXL:logD(LogArea.UI, "Done waiting for loading goo")

-- also, the very first time we get here, check to see if we should invite to a different server
if( Places.places.BeginnerServer and ServerGui.cachedHighestHeroLevel < Places.places.BeginnerServer.maxGrowthLevel and Places.getCurrentPlace() ~= Places.places.BeginnerServer )then
	DebugXL:logI(LogArea.UI, "Inviting to beginner server" )
	if ServerGui:inviteToBeginnerServer() then
		DebugXL:logI(LogArea.UI, "Beginner server invitation accepted" )
		return
	end
end

DebugXL:logI( LogArea.UI, "Activating UI")
playerGui:WaitForChild('CurtainGui').Enabled = true
playerGui:WaitForChild('PlayerListGui').Enabled = true
playerGui:WaitForChild('NoResetGui').Enabled = true
playerGui:WaitForChild('HUDGui').Enabled = true
playerGui:WaitForChild('MapGui').Enabled = true
playerGui:WaitForChild('TopGui').Enabled = true
playerGui:WaitForChild('FurnishGui').Enabled = true

if localPlayer:WaitForChild("Tutorial").Value <= 0 then
	AnalyticsClient.ReportEvent( "Tutorial", "Start", "", tick() - startTime )	
--	GameAnalyticsClient.RecordDesignEvent( "Tutorial:Start", tick() - startTime )
	playerGui:WaitForChild("MessageGuiConfiguration"):WaitForChild("IntroMessage")
	while playerGui.MessageGuiConfiguration:FindFirstChild("IntroMessage").Visible do wait(0.5) end 

	MessageGui:PostMessageByKey( "TutorialWelcome2", true, displayDelay, true, nil, nil, function()
		AnalyticsClient.ReportEvent( "Tutorial", "WelcomeAck", "", tick() - startTime )	
		--GameAnalyticsClient.RecordDesignEvent( "Tutorial:WelcomeAck",  tick() - startTime ) 
	end )
	
	MessageGui:PostMessageByKey( "TutorialDungeonLord", true, displayDelay, true, nil, nil, function() 
		AnalyticsClient.ReportEvent( "Tutorial", "DungeonLordAck", "", tick() - startTime )	
--		GameAnalyticsClient.RecordDesignEvent( "Tutorial:DungeonLordAck", tick() - startTime ) 
	end )
	
	playerGui:WaitForChild("FurnishGui")

	-- wait for them to build anything
	while localPlayer:WaitForChild("Tutorial").Value < 1 do wait(0.1) end
	AnalyticsClient.ReportEvent( "Tutorial", "Build", "Complete", tick() - startTime )	
--	GameAnalyticsClient.RecordDesignEvent( "Tutorial:Build:Complete", tick() - startTime )

	MessageGui:PostMessageByKey( "TutorialTreasureChests", true, displayDelay, true )
end	

if localPlayer:WaitForChild("Tutorial").Value == 1 then

	-- close the furnishing gui for you - this simplifies the tutorial code and maybe helps burn the build button into player's muscle memory
	playerGui.FurnishGui.Event:Fire( "Build" )
	
	-- if they somehow ended up with too few dungeon points (by building the wrong thing, mayhap), just give it to them
	workspace.Signals.MainRE:FireServer( "BuffBuildPointsForTutorial" )
	
	MessageGui:PostMessageByKey( "TutorialBecomeMonster", true, displayDelay, true )
	
	MessageGui:PostMessageByKey( "TutorialOnMonsters", true, displayDelay, true ) 
	
	MessageGui:PostMessageByKey( "TutorialSpawn", true, displayDelay, true )
	
	-- wait to click	
	while InventoryClient:AmIInTutorial() do wait(0.2) end
	AnalyticsClient.ReportEvent( "Tutorial", "Spawn", "", tick() - startTime )
--	GameAnalyticsClient.RecordDesignEvent( "Tutorial:Spawn", tick() - startTime )
end
	
-- if localPlayer:WaitForChild("Tutorial").Value == 2 then
	
-- 	DebugXL:logI(LogArea.UI, "Tutorial: Let's go shopping" )
-- 	-- turn arrow off chest if it's still around
-- 	-- close the furnishing gui for you
-- 	playerGui.FurnishGui.Event:Fire( "Build" )
	
	
-- 	MessageGui:PostMessageByKey( "TutorialTreasureChests", true, displayDelay, true )

	
-- 	MessageGui:PostMessageByKey( "TutorialStore", true, displayDelay, true )

-- 	-- if they somehow don't have enough rubies here, let's just skip this part. In theory that means they figured out how to spend rubies
-- 	-- already
-- 	if InventoryClient.inventory.itemsT.Rubies >= Crates[2].Cost then
-- 		MessageGui:PostMessageByKey( "TutorialBlueprintsCrate", true, displayDelay, true )
		
-- 		-- turn arrow on store
-- 		playerGui:WaitForChild("NoResetGui"):WaitForChild("RightButtonColumn"):WaitForChild("Store"):WaitForChild("UIArrow").Visible = true
		
-- 		-- wait for click
-- 		while not playerGui:WaitForChild("StoreGui"):WaitForChild("Main").Visible do wait(0.2) end
		
-- 		-- turn arrow off
-- 		playerGui:WaitForChild("NoResetGui"):WaitForChild("RightButtonColumn"):WaitForChild("Store"):WaitForChild("UIArrow").Visible = false
		
-- 		-- turn arrow on blueprint crate
-- 		playerGui.StoreGui.Main.MainHeader.Crates:WaitForChild("Blueprints"):WaitForChild("UIArrow").Visible = true
		
-- 		-- wait for buy button
-- 		while not playerGui.StoreGui.Main:WaitForChild("MainFooter"):WaitForChild("CrateItems").Buy.Visible do wait(0.2) end
		
-- 		-- blueprint arrow off
-- 		playerGui.StoreGui.Main.MainHeader.Crates:WaitForChild("Blueprints"):WaitForChild("UIArrow").Visible = false
				
-- 		while localPlayer:WaitForChild("Tutorial").Value < 2 do wait(0.1) end
-- 		GameAnalyticsClient.RecordDesignEvent( "Tutorial:Buy", tick() - startTime )
-- 	end
-- end

playerGui:WaitForChild("MapGui"):WaitForChild("Characters").Visible = true
playerGui:WaitForChild("MapGui"):WaitForChild("MapFrame").Visible = true
