-- uses Game Analytics
-- changed the name to RetentionAnalytics because engagement ended up being all I used it for

print( script.Name.." executed")

local Config = require( game.ReplicatedStorage.TS.Config ).Config

local Functions = game.ReplicatedStorage -- Change this to where ever you keep your functions or w/e. Just set this to a place you guarentee my function and event won't be destroy, accessible from both the erver and clinet


local Analytics = {}

function Analytics.ClientInit()
	if not Config.gameAnalyticsEnabled then return end
	--Credit to user Velibor for this code
	local userInputService 		=	game:GetService("UserInputService");
	local guiService 			=	game:GetService("GuiService")


	local function getPlatform()

		local Platform 			=	"windows";
	
		-- If touch enabled we have either an Phone, Tablet or an CharacterRecord (future)
		if userInputService.TouchEnabled then
			
			-- Computers don't have Gyroscopes or Accelerometers.
			if userInputService.GyroscopeEnabled or userInputService.AccelerometerEnabled then 
	
				-- http://devforum.roblox.com/t/how-do-you-determine-what-platform-the-player-is-playing-on/27539/11
				if game:GetService("Workspace").CurrentCamera.ViewportSize.Y > 600 then
					Platform 	=	"Tablet";
				else
					Platform 	=	"Phone";
				end
	
			end
		else
	
			-- If we have an TenfootInterface.
			if guiService:IsTenFootInterface() then
				Platform 		=	"Console";
			end
	
		end

		return Platform;
	end 

	local function getOS()
		local Platform 			=	getPlatform();
		local OS 				=	"android 4.4.4";
	
		if Platform == "PC" then
			local isWindows 	=	guiService:IsWindows();
	
			if isWindows then
				OS 				=	"windows";
			else
				OS 				=	"mac";
			end
		end

		return OS;
	end
	
	local function getPlatformAndOs()
		local platform 			=	getPlatform();
		local os_version			=	"windows 8.1";
	
		if platform == "Tablet" then 
			os_version			=	"android 4.4.4";
			platform 			=	"android";
		elseif platform == "Phone" then 
			os_version			=	"android 4.4.4";
			platform 			=	"android";
		end	

		return 	platform, os_version
	
	end
	
	local Player = game.Players.LocalPlayer
	
	local platform, os_version = getPlatformAndOs()
	
	local Default_Annotations = {
		["v"] = 2;
		["user_id"] = tostring(Player.UserId);
		["sdk_version"] = "rest api v2";
		["os_version"] = os_version;
		["manufacturer"] = "apple";
		["device"] = "unknown";
		["platform"] = platform;
		["session_num"] = 1;
--		["custom_01"] = game.LocalizationService.SystemLocaleId;
		["custom_02"] = game.LocalizationService.RobloxLocaleId;
	}	

	local annotateRF = Functions:WaitForChild("AnnotateEvent")
	annotateRF.OnClientInvoke = function()
		print("AnnotateEvent invoked on client")
		local Annotations = Default_Annotations
		return Annotations
	end

end

-- function  Analytics.RecordResource(Player, Amount, FlowType, Currency, ItemType, ItemId)
-- 	local Event = {
-- 		["category"] = "resource";
-- 		["amount"] = Amount;
-- 		["event_id"] = FlowType .. ":" .. Currency .. ":" .. ItemType .. ":" .. ItemId;
-- 	}
	
-- 	Functions:WaitForChild("AnalyticRE"):FireServer(Event, Player)
-- end

-- function  Analytics.RecordTransaction(Player, Price, Thing)
	
-- 	if Settings.ApplyTax then
-- 		Price = math.floor(Price * .7)
-- 	end
	
-- 	if Settings.ConvertedToUSD then
-- 		Price = math.floor(Price * .0035)
-- 	end
	
-- 	local Event = {
-- 		["category"] = "business";
-- 		["amount"] = Price;
-- 		["currency"] = "USD";
-- 		["event_id"] = Thing;
-- 		["transaction_num"] = Transactions;
-- 	}
-- 	Transactions = Transactions + 1
-- 	Functions:WaitForChild("AnalyticRE"):FireServer(Event, Player)
-- end

function Analytics.RecordDesignEvent( eventIdS, optionalValue )
	if not Config.gameAnalyticsEnabled then return end

	local event = {
		["category"] = "design",
		["event_id"] = eventIdS,
		["value"] = optionalValue
	}
	Functions:WaitForChild("AnalyticRE"):FireServer( event )
end

-- function Analytics.ServerEvent(Event, Player)
-- 	Functions:WaitForChild("AnalyticRE"):FireServer(Event, Player)
-- end


return Analytics
