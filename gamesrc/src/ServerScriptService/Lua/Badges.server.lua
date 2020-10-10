--
-- Badges
--
-- Part of Jamie's new XL libraries
--
local PlaceConfiguration = require( game.ReplicatedStorage.PlaceConfiguration )

local function OnAddPlayer( player )
	-- played it once badge
--	--print( "Awarding first-time badge to "..player.Name )
	if not game.BadgeService:AwardBadge( player.UserId, PlaceConfiguration.badgesT.PlayedFirstTime ) then
--		--print( "Badge not awarded" )
	end

	-- met the creator badge
	-- if this is the creator
	if player.UserId == 128450567 then
		for _, existingPlayer in pairs( game.Players:GetPlayers() ) do
--			--print( "Awarding met the creator badge to "..existingPlayer.Name )
			if not game.BadgeService:AwardBadge( existingPlayer.UserId, PlaceConfiguration.badgesT.MetCreator ) then
--				--print( "Badge not awarded" )
			end
		end
	else -- not the creator, but is the creator here?
		for _, existingPlayer in pairs( game.Players:GetPlayers() ) do
			if existingPlayer.UserId == 128450567 then
--				--print( "Awarding met the creator badge to "..player.Name )
				if not game.BadgeService:AwardBadge( player.UserId, PlaceConfiguration.badgesT.MetCreator ) then
--					--print( "Badge not awarded" )
				end					
			end
		end
	end
end

for _, player in pairs( game.Players:GetPlayers() ) do spawn( function() OnAddPlayer( player ) end ) end
game.Players.PlayerAdded:Connect( OnAddPlayer )

