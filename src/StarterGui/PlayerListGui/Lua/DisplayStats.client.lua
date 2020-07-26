
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local MathXL            = require( game.ReplicatedStorage.Standard.MathXL )

local CharacterClientI  = require( game.ReplicatedStorage.CharacterClientI )
local WerewolfUtility   = require( game.ReplicatedStorage.WerewolfUtility )

local Hero = require( game.ReplicatedStorage.TS.HeroTS ).Hero
local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize

game:GetService("StarterGui"):SetCoreGuiEnabled( Enum.CoreGuiType.PlayerList, false )

wait(0.25)

local customLeaderboard = script.Parent.Parent:WaitForChild("CustomLeaderboard")
local contentRowTemplate = script.Parent.Parent:WaitForChild("ContentRowTemplate")

customLeaderboard:WaitForChild("Contents"):WaitForChild("HeaderRow").Size = UDim2.new( customLeaderboard.Contents.HeaderRow.Size.X.Scale, 
	customLeaderboard.Contents.HeaderRow.Size.X.Offset,
	0, customLeaderboard.Contents.HeaderRow.Names.TextBounds.Y )

local werewolfAliases = { "Warrior", "Mage", "Rogue" }

while wait( 0.25 ) do 
	local namesS    = "Names"  
	local dataColumnSA = { ["Class"] = "Class", ["Rank"] = "Rank", ["Level"] = "Level", ["VIP"] = "" }  
	
	local foundRows = {}
	for _, player in pairs( game.Players:GetPlayers() ) do
		local leaderstats = player:FindFirstChild("leaderstats")   -- a player could show up and report before their leaderstats get built
		if leaderstats then
			local row = customLeaderboard.Contents:FindFirstChild( "User"..player.UserId )
			if player.Parent then
				if not row then
					row = contentRowTemplate:Clone()
					row.Size = customLeaderboard.Contents.HeaderRow.Size
					row.Name = "User"..player.UserId
					row.Names.Text = player.Name
					row.Visible = true
					row.Parent = customLeaderboard.Contents
					for _, field in pairs( row:GetChildren() ) do
						field.TextShadowScript.Disabled = false
					end
				end		
				foundRows[ row ] = true
										
				local stealthWerewolfB = CharacterClientI:GetCharacterClass( player ) == "Werewolf" and WerewolfUtility:IsUndercover( player.Character )
				for k, _ in pairs( dataColumnSA ) do
					local data = leaderstats:FindFirstChild( k )
					if data then
						-- most of the leaderstats auto-localize, but not class which goes from a key to words
						if k == "Class" then
							local localizedClass = data.Value~="" and Localize.formatByKey( data.Value ) or ""
							if stealthWerewolfB then
								local existingText = row:FindFirstChild(k).Text 
								if existingText == localizedClass or existingText == "" then  -- provide or switch name
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
								row:FindFirstChild(k).Text = math.clamp( lvlN, 1, maxGrowthLevel )  -- going with 4;  15th level warriors are going to draw attention - needs to match CustomNameTags, and 4th will work in beginner server
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