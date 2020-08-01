
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

-- uses Game Analytics
-- changed the name to RetentionAnalytics because engagement ended up being all I used it for

-- the retention component of this is the only component I want to keep

local CharacterClientI = require( game.ReplicatedStorage.Standard.CharacterClientI )

local AnalyticsXL = require( game.ServerStorage.Standard.AnalyticsXL )

local Config = require( game.ReplicatedStorage.TS.Config ).Config

local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer

	
local Settings = {
	ApplyTax = false; -- This will send the R$ cost of something as math.floor(Input * .7)
	ConvertedToUSD = false; -- This will send the R$ cost as USD doing math.floor(Input * 0.0035)

	SendWait = 50; -- How long in between event sends in seconds. Set this to low for testing, set this to high for actual work.
}

--[[
	 /\ \ \_____   ____ _| |_   _ 
 /  \/ / _ \ \ / / _` | | | | |
/ /\  / (_) \ V / (_| | | |_| |
\_\ \/ \___/ \_/ \__,_|_|\__, |
                         |___/ 

Scripted by DeepBlueNoSpace.

Credit to rcouret for the HMAC encoding.


Tutorial: http://devforum.roblox.com/t/using-gameanalytics-retention-and-monetisation-ez-mode/41083

If you're going to mod to do stuff, please credit me :D

Otherwise, uhh happy analysing!

If it breaks hit me up on Discord: DeepBlueNoSpace#9869

If you liked this please send money :D
https://www.roblox.com/catalog/887592545/Send-money-please
--]]

local Functions = game.ReplicatedStorage -- Change this to where ever you keep your functions or w/e. Just set this to a place you guarentee my function and event won't be destroy, accessible from both the erver and clinet

local HTTPService		= game:GetService("HttpService")
local lockbox 			= require( script.Parent.Parent.lockbox)
lockbox.bit 			= require( script.Parent.Parent.bit).bit
local array 			= require(lockbox.util.array)
local stream 			= require(lockbox.util.stream)
local base64			= require(lockbox.util.base64)
local hmac 				= require(lockbox.mac.hmac)
local sha256 			= require(lockbox.digest.sha2_256)

--	Device Info (this doesn't matter to us, this is only sent in the initalisation, don't change cuz it'll break stuff)
local Platform 				= "ios"
local OS_Version 				= "ios 8.2"
local SDK_Version 			= "rest api v2" -- I lie don't change this one
local Device 					= "Unknown"
local Manufacturer			= "Unknown"

-- Game Info (Change this if you like"
local BuildVersion			= "1"
local EngineVersion			= "unity 5.1.0"

-- Keys (These keys give you access to a sand box place I set up (Gameanalytic's default one is stingy with annotations))
local GameKey 				= "d39c482fd8604b680a7f5440b8e60286"
local SecretKey				= "80d0dd29e81cfbd34c4b4536ffd1b095894e5568"

-- URLS (Don't touch)
local URL_Init				= "http://api.gameanalytics.com/v2/" .. GameKey .. "/init"
local URL_Events				= "http://api.gameanalytics.com/v2/" .. GameKey .. "/events"




local PlayerData 				= {
	
}

local PlayerJoinTimes			= {
	
}

local State_Config 			= {
	-- the amount of seconds the client time is offset by server_time will be set when init call receives server_time
	["Client_TS_Offset"] = 0;
	-- Will be updated when a session starts
	["Session_ID"] = HTTPService:GenerateGUID(false):lower();
	--Set if the SDK is disabled or not
	["Enabled"] = true;
	--List of event dictionaries to be JSON encoded
	["Event_Queue"] = {};
	-- derp
	["session_num"] = math.floor(tick())
}

local Transactions = 1
function HmacHashWithSecret(body, key)
	local hmacBuilder = hmac()
		.setBlockSize(64)
		.setDigest(sha256)
		.setKey(array.fromString(key))
		.init()
		.update(stream.fromString(body))
		.finish()
	return base64.fromArray(hmacBuilder.asBytes())
end


function IsType(Type, ToCompare)
	for i,v in pairs(ToCompare)do
		if v == Type then
			return true
		end
	end
	return false
end


function Request_Init()
	local InitPayload = { 
		["platform"] = Platform,
		["os_version"] = OS_Version,
		["sdk_version"] = SDK_Version	
	}
	
	local InitPayloadJSON = HTTPService:JSONEncode(InitPayload)
	local Headers = {
		["Authorization"] = HmacHashWithSecret(InitPayloadJSON, SecretKey);
	}
	local ResponseDictionary = nil
	local StatusCode = nil
	
	local Success, InitResponse = pcall(function() 
		
		return HTTPService:PostAsync(URL_Init, InitPayloadJSON, Enum.HttpContentType.ApplicationJson, false, Headers)
	end)
	if Success then
		InitResponse = HTTPService:JSONDecode(InitResponse)
		print("GameAnalytics integration by DeepBlueNoSpace.")
	else
		print("GameAnalytics failure" )
	end
	return InitResponse
end


function AnnotateEvent(Event, Player)
	local Time = os.time()
	local ClientTime = os.time() -- Difference for us is negligable
	local Annotations = PlayerData[Player.Name]
	repeat wait() Annotations = PlayerData[Player.Name] until Annotations
	for i,v in pairs(Annotations) do
		Event[i] = v
	end
	Event["client_ts"] = ClientTime
	Event["custom_01"] = PlayerServer.getCharacterClass( Player )
	return Event
end


function AddToEventQueue(Player, Event)
	
	if not (type(Event) == "table") then
		print("All events must be tables")
		print("Recieved: " .. tostring(Event))
	    return
	end
	
	Event = AnnotateEvent(Event, Player)
	
	Event["session_id"] = State_Config["Session_ID"]
	table.insert(State_Config["Event_Queue"], Event)

	print( "Analytics event queued: "..Event["category"].." "..tostring(Event["event_id"]).." "..tostring(Event["value"]))
end



function SubmitEvents()
	local EventListJSON = nil
	local Success = pcall(function()
		EventListJSON = HTTPService:JSONEncode(State_Config["Event_Queue"])
	end)
	if not Success then
		print "Event queue failed JSON encoding!"
		return
	end
	
	State_Config["Event_Queue"] = {}
	
	if EventListJSON == "" then
		return
	end
	
	local Headers = {
		["Authorization"] = HmacHashWithSecret(EventListJSON, SecretKey)
	}
	
		
	local EventsResponse = nil
	local Success, Error = pcall(function()
		EventsResponse = HTTPService:PostAsync(URL_Events, EventListJSON, Enum.HttpContentType.ApplicationJson, false, Headers) 
	end)
	
	if not Success then
		DebugXL:Error("PostAsyncErr: "..Error.." Authorization:"..tostring(Headers["Authorization"]).."EventListJSON:"..tostring(EventListJSON))
	end
	
	local StatusCode = 200 -- EventsResponse will be empty table on success
	local ResponseDictionary = {}
	if EventsResponse then
	 	if EventsResponse.status_code then StatusCode = EventsResponse.status_code end
	elseif Error then
		if Error:find("400") then 
			StatusCode = 400
		elseif Error:find("401") then
			StatusCode = 401	
		end
	end
	
	local Success, Error = pcall(function()
		ResponseDictionary = EventsResponse.json()
	end)
	if not Success then
		ResponseDictionary = {}
		--print(Error)
	end
	
	--print("Submit events response: " .. tostring(ResponseDictionary))   
	--Check response code
	local StatusCodeString = "" and StatusCode == nil or "Returned: " .. tostring(StatusCode) .. " response code."
	if StatusCode == 400 then
		print("Submit events failed due to 400 BAD_REQUEST.")
	elseif StatusCode == 401 then
		print(StatusCodeString)
		print("Submit events failed due to 401 UNAUTHORIZED.")
		print("Please verify your Authorization code is working correctly and that your are using valid game keys.")
	elseif StatusCode == 200 then
		print("Submit Events Succeeded! Delete me on line 211")
	else
		print(StatusCodeString, "Submit events request did not succeed! Perhaps offline.. ")
	end

	return ResponseDictionary, StatusCode
end


function Run() -- Drops the bass
	
	if not State_Config.Enabled then
		print("SDK is turned off D:")
		return
	end
	
	if #State_Config["Event_Queue"] > 0 then -- Only sends events if they need sending
		
		local ResponseData, ResponseCode = SubmitEvents()
		
	else
		
		print("Nothing sent, as nothing to send. Delete me on line 235")
		
	end
	
end


local Analytics = {}

function  Analytics.RecordResource(Player, Amount, FlowType, Currency, ItemType, ItemId)
	if not Config.gameAnalyticsEnabled then return end
	DebugXL:Assert( type(Amount)=="number" )
	DebugXL:Assert( Currency and type(Currency)=="string" )
	DebugXL:Assert( ItemType and type(ItemType)=="string" )
	DebugXL:Assert( ItemId and type(ItemId)=="string" )
	local Event = {
		["category"] = "resource";
		["amount"] = Amount;
		["event_id"] = FlowType .. ":" .. Currency .. ":" .. ItemType .. ( ItemId and ( ":" .. ItemId ) or "" )
	}
	
	Functions:WaitForChild("RecordAnalytic"):Fire(Event, Player)
end

function  Analytics.RecordTransaction(Player, Price, Thing)
	if not Config.gameAnalyticsEnabled then return end
	
	local playerState = Player.Team.Name .. (( workspace.GameManagement.PreparationCountdown.Value > 0 ) and "Prep" or "Play" )

	if Settings.ApplyTax then
		Price = math.floor(Price * .7)
	end
	
	if Settings.ConvertedToUSD then
		Price = math.floor(Price * .0035)
	end
	
	local Event = {
		["category"] = "business";
		["amount"] = Price;
		["currency"] = "USD";
		["event_id"] = Thing;
		["transaction_num"] = Transactions;
		["cart_type"] = playerState;
	}
	Transactions = Transactions + 1
	Functions:WaitForChild("RecordAnalytic"):Fire(Event, Player)
end

function Analytics.RecordDesignEvent( player, eventIdS, optionalValue, optionalBinSize, optionalBinLabel )
	if not Config.gameAnalyticsEnabled then return end
	DebugXL:Assert( player:IsA("Player"))
	local event = {
		["category"] = "design",
		["event_id"] = eventIdS,
		["value"] = optionalValue
	}
	if optionalValue then
		DebugXL:Assert( type(optionalValue)=='number' )
		local x, _, prefix, suffix = string.find( eventIdS, "(%a+):(.+)") -- split string at first :
		if x then
			AnalyticsXL:ReportHistogram( player, prefix, optionalValue, optionalBinSize, optionalBinLabel, suffix, true )
		else			
			-- didn't find prefix
			AnalyticsXL:ReportHistogram( player, eventIdS, optionalValue, optionalBinSize, optionalBinLabel, "", true )
		end
	else
		local x, _, prefix, middle, suffix = string.find( eventIdS, "(%a+):(.+):(.+)")
		if x then
			AnalyticsXL:ReportEvent( player, prefix, middle, suffix, 1, true )
		else
			local x, _, prefix, suffix = string.find( eventIdS, "(%a+):(.+)") -- split string at first :
			if x then
				AnalyticsXL:ReportEvent( player, prefix, suffix, "", 1, true )
			else
				AnalyticsXL:ReportEvent( player, eventIdS, "", "", 1, true )
			end
		end
	end
	Functions:WaitForChild("RecordAnalytic"):Fire( event, player )
end


function Analytics.ServerEvent(Event, Player)
	if not Config.gameAnalyticsEnabled then return end
	Functions:WaitForChild("RecordAnalytic"):Fire(Event, Player)
end


function Analytics.ServerInit(GKey, SKey)
	if not Config.gameAnalyticsEnabled then return end
	GameKey = GKey
	SecretKey = SKey
	
	URL_Init = "http://api.gameanalytics.com/v2/" .. GameKey .. "/init"
	URL_Events = "http://api.gameanalytics.com/v2/" .. GameKey .. "/events"


	local AnnotateFunc = Instance.new("RemoteFunction", Functions)
	AnnotateFunc.Name = "AnnotateEvent"
	
	local EventAnalytic = Instance.new("BindableEvent", Functions)
	EventAnalytic.Name = "RecordAnalytic"
	
	local AnalyticRE = Instance.new( "RemoteEvent", Functions )
	AnalyticRE.Name = "AnalyticRE"

	game.Players.PlayerAdded:connect(function(Player)
		PlayerJoinTimes[Player.Name] = os.time()
		--print( "Invoking AnnotateEvent for "..Player.Name )
		PlayerData[Player.Name] = Functions:WaitForChild("AnnotateEvent"):InvokeClient(Player)
		AddToEventQueue(Player, {["category"] = "user"})
	end)
	
	function HandleAnalyticEvent( Event, Player )
		if Player then
			-- special kludge 
			if Event["event_id"]=="LoadFinished" then
				Event["value"] = os.time() - PlayerJoinTimes[Player.Name]
			end
			AddToEventQueue(Player, Event)
		else
			repeat wait() until #PlayerData > 0
			AddToEventQueue(game.Players:GetPlayers()[1], Event)
		end
	end

	EventAnalytic.Event:Connect( HandleAnalyticEvent )
	AnalyticRE.OnServerEvent:Connect( function( player, event )
		HandleAnalyticEvent( event, player )
	end )
	
	game.Players.PlayerRemoving:connect(function(Player)
		if PlayerJoinTimes[Player.Name] then
			AddToEventQueue(Player, {["category"] = "session_end",
				["length"] = os.time() - PlayerJoinTimes[Player.Name]
				})
		end
		PlayerJoinTimes[Player.Name] = nil
	end)
	
	local Init_Response = Request_Init()
	
	-- leaving error tracking in Google
	-- local ErrorTrack = {}

	-- game:GetService("ScriptContext").Error:connect(function(message, trace, Script)
		
	-- 	local scriptName = Script:GetFullName()
	-- 	if #ErrorTrack >= 10 or ErrorTrack[scriptName..message] then return end -- Only allows 10 per version, only send unique ones

   	--  	local Event = {
   	--     	 	["category"] = "error";
   	--      	["severity"] = "error";
    --     		["message"] = "Script: " .. scriptName .. "    Message: " .. message .. "    Trace: " .. trace;
    -- 		}
   		
	-- 	AddToEventQueue(game.Players:GetPlayers()[1], Event)
    -- 		ErrorTrack[scriptName..message] = true
	-- end)
	
	game:BindToClose(function()
		wait(1)
		Run()
	end)

	spawn(function()
		while wait(Settings.SendWait) do
			Run()
		end
	end)
end


return Analytics
