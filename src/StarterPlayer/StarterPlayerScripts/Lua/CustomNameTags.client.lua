--[[
local BalanceData = require( game.ReplicatedStorage.TS.BalanceData ).BalanceData

local CharacterClientI   = require( game.ReplicatedStorage.CharacterClientI )
local InstanceXL         = require( game.ReplicatedStorage.Standard.InstanceXL )
local DeveloperProducts  = require( game.ReplicatedStorage.DeveloperProducts ) 
local WerewolfUtility    = require( game.ReplicatedStorage.WerewolfUtility )

local PCMonitor = require( game.ReplicatedStorage.TS.PCMonitor ).PCMonitor
-- doing this on the client side so we can color appropriately for viewer, and also possibly show different info
-- for werewolves

local nameTagTemplate = game.ReplicatedStorage:WaitForChild("NameTag")
local potionTemplate = nameTagTemplate:WaitForChild("PotionIconTemplate")

local showLocalPlayerBar = false

while wait(0.1) do
	for _, player in pairs( game.Players:GetPlayers() ) do
		if showLocalPlayerBar or player ~= game.Players.LocalPlayer then
			if player.Character then
				local head = player.Character:FindFirstChild("Head")
				if head then
					local tag = head:FindFirstChild("NameTag")
					if not tag then
						tag = nameTagTemplate:Clone()
						tag.Enabled = true
						print( "Custom tagging "..player.Character.Name )
						tag.Parent = head
					end
					
					local class  = CharacterClientI:GetCharacterClass( player )
		
					local name = ""
					-- if player.leaderstats.VIP.Value == "VIP" then
					-- 	name = name.."(VIP) "
					-- end

					local undercoverWerewolfB = CharacterClientI:GetCharacterClass( player )=="Werewolf" and WerewolfUtility:IsUndercover( player.Character )

					local theirLevel
					name = name .. player.name
					if class ~="DungeonLord" then
						theirLevel = CharacterClientI:GetLevel( player )
						if undercoverWerewolfB then
							local arbitraryHero = game.Teams.Heroes:GetPlayers()[1]
							local arbitraryHeroLevel = arbitraryHero and CharacterClientI:GetLevel( arbitraryHero ) or 5
							theirLevel = math.min( theirLevel, arbitraryHeroLevel ) 
						end
						name = name.." (Lv"..theirLevel..")"
					end
		
					tag.Frame.Text.Text = name
					tag.Frame.Text.TextColor3 = player.Team == game.Teams.Heroes and player.Team.TeamColor.Color or Color3.new(1,1,1)
					if player.Team == game.Teams.Monsters then
--						print( player.Name.." on other team" )
						if CharacterClientI:GetCharacterClass( player )=="Werewolf"	and WerewolfUtility:IsUndercover( player.Character ) then
							-- hiding werewolf, better color their name blue if we're a hero
							if game.Players.LocalPlayer.Team == game.Teams.Heroes then
								tag.Frame.Text.TextColor3 = game.Teams.Heroes.TeamColor.Color
							end
--							print( player.Name.." is a stealth werewolf" )
						else
							-- what's the level differential
							if theirLevel then
								local theirEffectiveLevel = theirLevel + BalanceData.effective0LevelStrength
								local myLevel = CharacterClientI:GetLevel( game.Players.LocalPlayer ) + ( game.Players.LocalPlayer.Team == game.Teams.Heroes and 7 or 6 )
								if myLevel then
									if myLevel > theirEffectiveLevel then	
										-- leave white, I don't want to paint targets on their heads after all
--										local ratio = math.max( ( theirEffectiveLevel / myLevel - 0.5 ) * 2, 0 )					
		--								print( player.Name.." is weaker. Ratio "..ratio )
--										tag.Frame.Text.TextColor3 = Color3.new(0,1,0):lerp( Color3.new(1,1,1), ratio )
									elseif myLevel < theirEffectiveLevel then
										-- I am having amazing difficulty mathing right now
										-- 1 is safe
										-- 0 is death
										-- 0 = 0.5
										-- 1 = 1
										-- x = ( y - 0.5 ) * 2 ?
										-- y of 0 -> -1  y of 0.5 -> 0  y of 1 -> 1  y of 0.25 -> -0.5 y of 0.75 -> .5  
										local ratio = math.max( ( myLevel / theirEffectiveLevel - 0.5 ) * 2, 0 )					
		--								print( player.Name.." is stronger. Ratio "..ratio )
										
										tag.Frame.Text.TextColor3 = Color3.new(1,0,0):lerp( Color3.new(1,1,1), ratio )
										if ratio <= 0 then
											tag.Frame.Text.Text = "?" .. name .. "?"
										end
									end
								end
							end
						end
					end		
					
					-- I wanted the potion icons to the left of the nametag but it's too hard to position with
					-- Roblox's UI. Instead
					InstanceXL:ClearAllChildrenBut( tag.Frame.Potions, "UIListLayout" )
					local numPotions = PCMonitor.getNumHealthPotions( player )
					for i = 1, numPotions do
						local newPot = potionTemplate:Clone()
						newPot.Visible = true
						newPot.Parent = tag.Frame.Potions
					end
					
				end
			end
		end
	end
end
]]