-- local AnalyticsXL = require( game.ServerStorage.Standard.AnalyticsXL )

-- game.Players.PlayerAdded:Connect( function( player )
-- 	player.Chatted:Connect( function( msg, recepient )
-- 		local str = player.Name .. ( recepient and " to "..recepient.Name or "" ) ..": "..msg
-- 		AnalyticsXL:ReportEvent( player, "Chat", tostring(game.JobId), str, os.time(), true )
-- 	end )
-- end)