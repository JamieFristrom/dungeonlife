
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

--
-- AnaltyicsXL
--
-- Part of Jamie's new XL libraries
--
local AnalyticsXL = {}

local PlaceConfiguration = require( game.ReplicatedStorage.PlaceConfiguration )

local PlayerUtility = require( game.ReplicatedStorage.TS.PlayerUtility ).PlayerUtility

local Config = require( game.ReplicatedStorage.TS.Config ).Config


local config = {
	DoNotReportScriptErrors = false; -- Whether errors should be reported.
	-- Enabled by default. Set this field to true if you want to disable this feature.
 
	DoNotTrackServerStart = false; -- Whether a "ServerStartup" action will be reported when a server starts
	-- Enabled by default. Set this field to true if you want to disable this feature.
 
	DoNotTrackVisits = false; -- Whether visits are tracked. They appear under the action "Visit"
	-- Enabled by default. Set this field to true if you want to disable this feature.

}

local useGoogleForTelemetry = false

local GA = require( game.ServerStorage.Standard.GAModule ) -- 153590792)
local Analytics = require( game.ServerStorage.TS.Analytics ).Analytics

-- continuing to use google for error logging, so we can track errors in our other thing
pcall( function()
	if Config.errorTrackingEnabled then
		print("Initializing error analytics")
		GA.Init( Config.googleAnalyticsUserId )
	end
end )


function AnalyticsXL:ReportEvent( player, name, category, label, integer, includeDevsB )
	DebugXL:Assert( self == AnalyticsXL )
	-- player might already be removed so check before accessing rank
	if includeDevsB or player == nil or player.Parent == nil or PlayerUtility.getRank( player ) < 254 then
		if useGoogleForTelemetry then
			GA.ReportEvent( name, category, label, integer )
		else
			Analytics.ReportEvent( player, name, category, label, integer )
		end
	else
		print( player.Name.." is ranking officer in group. Not recording analytics." )		
	end
end


function AnalyticsXL:ReportHistogram( player, name, variableN, binSize, binLabel, note, includeDevsB )
	local bin = math.ceil( variableN / binSize )

	AnalyticsXL:ReportEvent( player, 
		name, 
		note,
		string.format( "%s_%03d", binLabel, bin ),
		math.ceil( variableN ),
		includeDevsB )
end

-- local analyticsXLRE = workspace.Signals.AnalyticsXLRE
-- analyticsXLRE:Connect( function( player, funcName, ...)
-- 	if AnaltyicsXL[ funcName ] then
-- 		AnaltyicsXL[ funcName ]( AnaltyicsXL, player, ... )
-- 	end
-- end

return AnalyticsXL
