
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local MathXL = require( game.ReplicatedStorage.Standard.MathXL )

local WerewolfUtility = require( game.ReplicatedStorage.WerewolfUtility )

local Hero = require( game.ReplicatedStorage.TS.HeroTS ).Hero
local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize
local Math = require( game.ReplicatedStorage.TS.Math ).Math
local PCMonitor = require( game.ReplicatedStorage.TS.PCMonitor ).PCMonitor

local werewolfAliases = { "Warrior", "Mage", "Rogue" }

local DisplayStats = {}

function DisplayStats.UpdateStats(playerFolder, customLeaderboard, contentRowTemplate)
	local dataColumnSA = { ["Class"] = "Class", ["Rank"] = "Rank", ["Level"] = "Level", ["VIP"] = "" }  
	
	local foundRows = {}
	for _, player in pairs( playerFolder:GetChildren() ) do
		local leaderstats = player:FindFirstChild("leaderstats")   -- a player could show up and report before their leaderstats get built
		if leaderstats then
			local row = customLeaderboard.Contents:FindFirstChild( "User"..player.Name )
			if player.Parent then
				if not row then
					row = contentRowTemplate:Clone()
					row.Size = customLeaderboard.Contents.HeaderRow.Size
					row.Name = "User"..player.Name
					row.Names.Text = player.Name
					row.Visible = true
					row.Parent = customLeaderboard.Contents
					for _, field in pairs( row:GetChildren() ) do
						if field:FindFirstChild("TextShadowScript") then
							field.TextShadowScript.Disabled = false
						end
					end
				end		
				foundRows[ row ] = true
										
				local stealthWerewolfB = PCMonitor.getPublishedClass( player ) == "Werewolf" and WerewolfUtility:IsUndercover( player.Character )
				for k, _ in pairs( dataColumnSA ) do
					local data = leaderstats:FindFirstChild( k )
					if data then
						-- most of the leaderstats auto-localize, but not class which goes from a key to words
						if k == "Class" then
							local localizedClass = data.Value~="" and Localize.formatByKey( data.Value ) or ""
							if stealthWerewolfB then
								local existingText = row:FindFirstChild(k).Text 
								if existingText == localizedClass or existingText == "" or existingText == "Class" then  -- provide or switch name
									row:FindFirstChild(k).Text = Localize.formatByKey( werewolfAliases[ MathXL:RandomInteger( 1, #werewolfAliases ) ] )
								end  -- otherwise leave it
							else
								row:FindFirstChild(k).Text = localizedClass
							end
						elseif k == "Level" and stealthWerewolfB then
							-- hide that the OP werewolf has impossible level
							local lvlN = tonumber( data.Value )
							DebugXL:Assert( lvlN )
							if lvlN then
								local maxGrowthLevel = Hero:getCurrentMaxHeroLevel() 
								row:FindFirstChild(k).Text = Math.clamp( lvlN, 1, maxGrowthLevel )  -- going with 4;  15th level warriors are going to draw attention - needs to match CustomNameTags, and 4th will work in beginner server
							else							
								row:FindFirstChild(k).Text = 4
							end
						else
							row:FindFirstChild(k).Text = data.Value
						end
					end
				end
			end
		end
	end
	
	for _, row in pairs( customLeaderboard.Contents:GetChildren() ) do
		if row.Name ~= "UIListLayout" and row.Name ~= "HeaderRow" then
			if not foundRows[ row ] then
				row:Destroy()
			end
		end
	end
end

local export = {}
export.DisplayStats = DisplayStats
return export