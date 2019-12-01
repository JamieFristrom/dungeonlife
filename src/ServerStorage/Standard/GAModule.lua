local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )

local API = {}

local id = nil
local remoteEvent = game.ReplicatedStorage.ReportGoogleAnalyticsEvent
--local helper = script.GoogleAnalyticsHelper
local category = "PlaceId-" .. tostring(game.PlaceId)
local googleUserTrackingId = game:GetService("HttpService"):GenerateGUID()
local lastTimeGeneratedGoogleUserId = os.time()

function convertNewlinesToVertLine(stack)
	local rebuiltStack = ""
	local first = true
	for line in stack:gmatch("[^\r\n]+") do
		if first then
			rebuiltStack = line
			first = false
		else
			rebuiltStack = rebuiltStack .. " | " .. line
		end
	end
	return rebuiltStack
end

function removePlayerNameFromStack(stack)
	stack = string.gsub(stack, "Players%.[^.]+%.", "Players.<Player>.")
	return stack
end

function setupScriptErrorTracking()
	game:GetService("ScriptContext").Error:connect(function (message, stack)
		if string.find( message, "GAModule" ) or string.find( stack, "GAModule" ) then 
			return 
		end
		API.ReportEvent(category,
			removePlayerNameFromStack(message) .. " | " .. 
			removePlayerNameFromStack(stack), "none", 1)
	end)
	-- add tracking for clients
	-- helper.Parent = game.StarterGui
	-- -- add to any players that are already in game
	-- for i, c in ipairs(game.Players:GetChildren()) do
	-- 	helper:Clone().Parent = (c:WaitForChild("PlayerGui"))
	-- end
end

function stringifyEvent(category, action, label, value)
	return "GA EVENT: " .. 
		"Category: [" .. tostring(category) .. "] " .. 
		"Action: [" .. tostring(action) .. "] " ..
		"Label: [" .. tostring(label) .. "] " ..
		"Value: [" .. tostring(value) .. "]"
end

function printEventInsteadOfActuallySendingIt(category, action, label, value)
	print(stringifyEvent(category, action, label, value))
end

function API.ReportEvent(category, action, label, value)
	DebugXL:Assert( category and type( category )=="string" )
	DebugXL:Assert( action and type( action )=="string" )
	DebugXL:Assert( label and type( label )=="string" )
	DebugXL:Assert( value and type( value )=="number" )
	local numberValue = tonumber(value)
	if numberValue == nil or numberValue ~= math.floor(numberValue) then
		--print("WARNING: not reporting event because value is not an integer. ", stringifyEvent(category, action, label, value))
		return
	end
	value = numberValue
	if game:FindFirstChild("NetworkServer") ~= nil then
		if id == nil then
			--print("WARNING: not reporting event because Init() has not been called")
			return
		end		
		
		-- Try to detect studio start server + player
		if game.CreatorId <= 0 then
			printEventInsteadOfActuallySendingIt(category, action, label, value)
			return
		end
		
		if os.time() - lastTimeGeneratedGoogleUserId > 7200 then
			googleUserTrackingId = game:GetService("HttpService"):GenerateGUID()
			lastTimeGeneratedGoogleUserId = os.time()
		end

		local hs = game:GetService("HttpService")
		local statusB, err = pcall( function() 
			hs:PostAsync( 
				"http://www.google-analytics.com/collect",
				"v=1&t=event&sc=start" ..
				"&tid=" .. id .. 
				"&cid=" .. googleUserTrackingId ..
				"&ec=" .. hs:UrlEncode(category) ..
				"&ea=" .. hs:UrlEncode(action) .. 
				"&el=" .. hs:UrlEncode(label) ..
				"&ev=" .. hs:UrlEncode(value),
				Enum.HttpContentType.ApplicationUrlEncoded)
		end )
		if not statusB then
			-- probably an 'out of requests' limit, so we don't want to fire an error and just repeat the
			-- madness
			warn( err..": "..tostring(category).."; "..tostring(action).."; "..tostring(label).."; "..tostring(value) )
		end
	elseif game:FindFirstChild("NetworkClient") ~= nil then
		local evt = game:GetService("ReplicatedStorage"):WaitForChild("ReportGoogleAnalyticsEvent")
		evt:FireServer(category, action, label, value)
	else
		printEventInsteadOfActuallySendingIt(category, action, label, value)
	end
end

function API.Init(userId, config)
	if game:FindFirstChild("NetworkServer") == nil then
		error("Init() can only be called from game server")
	end
	if id == nil then
		if userId == nil then
			error("Cannot Init with nil Analytics ID")
		end

		id = userId
		remoteEvent.Parent = game:GetService("ReplicatedStorage")
		remoteEvent.OnServerEvent:connect(
			function (client, ...) 
				print( "Client reporting analytics event")
				local arg = {...}
				-- let the other debug savvy players know, actually, screw it, let's not because we're using it for Resolution events now
				-- local message = "Client "..client.Name.." report: "..arg[2]
				-- for _, player in pairs( game.Players:GetPlayers() ) do
				-- 	if player ~= client then
				-- 		workspace.Standard.DebugGuiRE:FireClient( player, message )
				-- 	end
				-- end
				-- workspace.Standard.DebugGuiRE:FireAllClients( message )				
				API.ReportEvent(...) 
			end)
		
		if config == nil or not config["DoNotReportScriptErrors"] then
			setupScriptErrorTracking()
		end

		if config == nil or not config["DoNotTrackServerStart"] then
			API.ReportEvent(category, "ServerStartup", "none", 0)
		end
		
		if config == nil or not config["DoNotTrackVisits"] then
			game.Players.ChildAdded:connect(function ()
				API.ReportEvent(category, "Visit", "none", 1)
			end)
		end
	else
		error("Attempting to re-initalize Analytics Module")
	end
end

return API
