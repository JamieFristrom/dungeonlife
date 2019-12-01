--
-- Analtyics
--
-- Part of Jamie's new XL libraries
--
local AnalyticsXL = require( game.ServerStorage.Standard.AnalyticsXL )


-- switched to DataStoreXL so it won't crash when server is down
local DataStoreXL = require( game.ServerStorage.TS.DataStoreXLTS ).DataStoreXL


local analyticsDataStore = DataStoreXL.new( "Analytics" )

local startTimes = {}


function AnalyticsReportEvent( player, name, category, label, integer )
	AnalyticsXL:ReportEvent( player, name, category, label, integer, true )
	
end

function OnPlayerAdding( player )
	startTimes[ player ] = os.time()	
	local existingAnalyticsData
	local success = pcall( function()
		existingAnalyticsData = analyticsDataStore:GetAsync( "user_"..player.UserId )
	end )
	if not existingAnalyticsData then
		print( player.Name.." first login" )
		existingAnalyticsData = { firstVisitTime = os.time(), lastDayN = 0 }
		AnalyticsReportEvent( player, "Day", "", "", 0 )
	else
		print( player.Name.." subsequent login" )
		local day = ( os.time() - existingAnalyticsData.firstVisitTime ) / 60 / 60 / 24
		day = math.floor( day )
		local lastDayN = existingAnalyticsData.lastDayN 
		if not lastDayN then lastDayN = 0 end
		if day > lastDayN then
			AnalyticsReportEvent( player, "Day", "", "", day )
		end
		existingAnalyticsData.lastDayN = day
	end
	pcall( function()
		analyticsDataStore:SetAsync( "user_"..player.UserId, existingAnalyticsData )
		print( player.Name.." analytic data saved" )
	end)
end

-- function OnPlayerRemoving( player )
-- 	print( "Analytics removing "..player.Name )
-- 	local sessionDuration = os.time() - startTimes[ player ]
-- 	local timebin = math.ceil( sessionDuration / 60 )

-- 	AnalyticsReportEvent( player, "SessionDuration", 
-- 		string.format( "PlayersLeft_%02d", #game.Players:GetPlayers() ),
-- 		string.format( "Minutes_%03d", timebin ),
-- 		math.ceil( sessionDuration ) )
	
-- 	startTimes[ player ] = nil
-- end


for _, player in pairs( game.Players:GetPlayers() ) do spawn( function() OnPlayerAdding( player ) end ) end
game.Players.PlayerAdded:Connect( OnPlayerAdding )
--game.Players.PlayerRemoving:Connect( OnPlayerRemoving )

--error( "Test error" )