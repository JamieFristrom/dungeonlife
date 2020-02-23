print( script:GetFullName().." executed" )

local CheatUtility      = require( game.ReplicatedStorage.TS.CheatUtility )
local DebugXL           = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL        = require( game.ReplicatedStorage.Standard.InstanceXL )
local MathXL            = require( game.ReplicatedStorage.Standard.MathXL )
local TableXL           = require( game.ReplicatedStorage.Standard.TableXL )

local Crates            = require( game.ReplicatedStorage.Standard.Crates )

local DeveloperProducts = require( game.ReplicatedStorage.DeveloperProducts )
local InventoryUtility  = require( game.ReplicatedStorage.InventoryUtility )
local PlaceConfiguration = require( game.ReplicatedStorage.PlaceConfiguration )
local PossessionData    = require( game.ReplicatedStorage.PossessionData )
local RankForStars      = require( game.ReplicatedStorage.RankForStars )

local AnalyticsXL       = require( game.ServerStorage.Standard.AnalyticsXL )
local DataStore2        = require( game.ServerStorage.Standard.DataStore2 )
local GameAnalyticsServer = require( game.ServerStorage.Standard.GameAnalyticsServer )

local MessageServer = require( game.ServerStorage.TS.MessageServer ).MessageServer
local GameplayTestService = require( game.ServerStorage.TS.GameplayTestService ).GameplayTestService

local GameplayTestUtility = require( game.ReplicatedStorage.TS.GameplayTestUtility).GameplayTestUtility

local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest

--local inventoryCacheT = {}
local startingInfoT = {}

local Inventory = {}

local datastoreVersionN = 6  
-- 5 marks when we started keeping track of birth time
-- 6 marks when we started keeping track of messages in a separate table



local InventoryServer = require( game.ServerStorage.TS.InventoryServer ).InventoryServer


function Inventory.new()
	return  
	{ 
		versionN = datastoreVersionN, 
		itemsT = {}, 
		questsT = {},
		activeSkinsT = { monster = {}, hero = {} }, 
		messagesShownT = {},
		lastDailyChestOsTime = 0, 
		accountBirthOsTime = os.time() 
	}
end

local function StoreKey( player )
	return "user"..player.UserId
end

-- we'll want to switch back and forth between two kinds of keys:  one is good for debugging,
-- the other is more reliable in case we somehow miss playerremoving events
local function CacheKey( player )
	return player
	-- now that we're purposely not garbage collecting the leak, it needs to be player	
--	return "user"..player.UserId	
--	return player
end


function PlayerAddedWait( player )
	--print( "Initializing "..player.Name.." inventory" )

	local inventoryStore = DataStore2( "Inventory", player )
	local myInventory = inventoryStore:Get( Inventory.new() )
	
	-- AnalyticsXL:ReportHistogram( player, "Duration: Inventory datastore get", time() - startTime, 1, "second", "", true)

	if not myInventory.accountBirthOsTime then
		myInventory.accountBirthOsTime = os.time()	
	end
	
	-- features came on after launch:
	if not myInventory.activeSkinsT then myInventory.activeSkinsT = { monster = {}, hero = {} } end
	if not myInventory.activeSkinsT.monster then myInventory.activeSkinsT.monster = {} end
	if not myInventory.activeSkinsT.hero then myInventory.activeSkinsT.hero = {} end
	if not myInventory.redeemedCodesT then myInventory.redeemedCodesT = {} end
	if not myInventory.messagesShownT then myInventory.messagesShownT = {} end
	if not myInventory.questsT then myInventory.questsT = {} end
	--if not myInventory.settingsT then myInventory.settingsT = { monstersT = {}} end -- handled by update()
	InventoryServer.update( player, myInventory )

--	inventoryCacheT[ CacheKey( player ) ] = myInventory
	
	-- add any new products that have been added since last play
	
	for possessionKey, possessionT in pairs( PossessionData.dataT ) do
		if not myInventory.itemsT[ possessionKey ] then
			if possessionT.startingCountN then
				-- we used to be avoiding branching rather than worrying about datastore size, then I decided to make it
				-- so nil meant "I've *never* owned it" instead of being invalid. That way we can make sure to not regift
				-- awards to people who have traded them away on purpose
				myInventory.itemsT[ possessionKey ] = possessionT.startingCountN
			end
		end
		-- we can't do this because it will give you free money every time
--		if myInventory.itemsT[ possessionKey ] < possessionT.startingCountN then
--			myInventory.itemsT[ possessionKey ] = possessionT.startingCountN			
--		end
		if possessionT.publishValueB then
			InstanceXL:CreateSingleton( "NumberValue", { Name = possessionKey, Parent = player, Value = myInventory.itemsT[ possessionKey ] } )
		end
	end
	
	-- for testing:  
	--myInventory.itemsT.NextStarFeedbackDue = 0
	--myInventory.itemsT.StarFeedbackCount = 0
	if myInventory.itemsT.NextStarFeedbackDue == 0 then
		-- randomly choose 5, 10, 15, or 20 minutes for first query
		myInventory.itemsT.NextStarFeedbackDue = 9 * 60
		warn( "Next star feedback "..myInventory.itemsT.NextStarFeedbackDue )
	end

	for possessionKey, quantity in pairs( myInventory.itemsT ) do
		if not PossessionData.dataT[ possessionKey ] then
			warn( player.Name.." had nonexistent item "..possessionKey.." in their inventory" )
			-- probably changed a name in testing/debug
			myInventory.itemsT[ possessionKey ] = nil
		else
			local rewardBadgeId = PossessionData.dataT[ possessionKey ].rewardBadgeId
			if rewardBadgeId then
				if quantity >= PossessionData.dataT[ possessionKey ].rewardCountN then
					-- double check to make sure they got their badge
					game.BadgeService:AwardBadge( player.UserId, rewardBadgeId )				
				end
			end
		end
	end
		
	
	-- this is too often since we have things that adjust every second
--	local function UpdateClient( udpatedInventory )
--		workspace.Signals.InventoryRE:FireClient( player, "Update", udpatedInventory )
--	end
--
--	inventoryStore:OnUpdate( UpdateClient )
	-- check passes;  I ended up doing this with inventory because the built in Roblox HasPass function doesn't update immediately
	-- duplication of data, bleh
	local gamePassItems = TableXL:FindAllInAWhere( PossessionData.dataA, function( item ) return item.gamePassId end )
	for _, item in pairs( gamePassItems ) do
		local hasPass = DeveloperProducts:UserOwnsGamePassWait( player, item.gamePassId )
		if hasPass == true then
			-- Assign this player the ability or bonus related to the game pass
			myInventory.itemsT[ item.idS ] = item.countForPassN
		end
	end

	InventoryServer.awardAlphaMail( myInventory, player )

	DebugXL:Assert( myInventory.itemsT.Tutorial )

	inventoryStore:Set( myInventory )
	workspace.Signals.InventoryRE:FireClient( player, "Update", myInventory )
	
	startingInfoT[ CacheKey( player ) ] = { starsN = myInventory.itemsT.Stars, timeTick = tick() }

	RankForStars:AwardBadgesForStars( myInventory.itemsT.Stars, player )

	print( "Initialized "..player.Name.." inventory" )

end 


function Inventory:GetInventoryStoreWait( player )
	if not player.Parent then
		-- this probably means the player left
		warn( player.Name.." missing parent right off the bat in GetInventoryStoreWait" )
		return nil
	end 
	while not startingInfoT[ CacheKey( player )] do
		if not player.Parent then
			-- this probably means they bailed during startup
			warn( player.Name.." missing parent" )
			return nil
		end 
		wait() 
	end
	return DataStore2( "Inventory", player )	
end




--function Inventory:PlayerAddedWait( player )
--	return Inventory:GetWait( player )
--end

-- only for when we absolutely need it, such as when we spend Robux
-- and maybe chest rewards?
function Inventory:SaveWait( player )
	local inventory = Inventory:GetInventoryStoreWait(player)
	if inventory then
		inventory:Save()
	end
	-- supposedly don't need this anymore
	-- it's possible the removing event might get called before the adding event, so check
--	if inventoryCacheT[ CacheKey( player ) ] then
--		InventoryStore:SetAsync( StoreKey( player ), inventoryCacheT[ CacheKey( player ) ] )
--	end	
end

function Inventory:GetSessionTime( player )
	local startingInfo = startingInfoT[ CacheKey( player ) ]
	if not startingInfo then return 0 end
	local startTime = startingInfo.timeTick
	startTime = startTime and startTime or tick()
	return tick() - startTime
end


function Inventory:GetTotalTimeInvested( player )
	return Inventory:GetSessionTime( player ) + Inventory:GetCount( player, 'TimeInvested' )
end


function Inventory:IsStarFeedbackDue( player )
	local totalTimeInvested = Inventory:GetTotalTimeInvested( player )
	local nextStarFeedbackDue = Inventory:GetCount( player, 'NextStarFeedbackDue')
	warn( player.Name.." total time invested "..totalTimeInvested.." - next feedback due "..nextStarFeedbackDue )
	return totalTimeInvested >= nextStarFeedbackDue
end


function Inventory:SetNextStarFeedbackDueTime( player )
	local starFeedbackCount = Inventory:GetCount( player, 'StarFeedbackCount')
	local nextStarFeedbackDelay = 60 * 60 * ( 1.5 ^ starFeedbackCount )
	Inventory:SetCount( player, 'NextStarFeedbackDue', Inventory:GetTotalTimeInvested( player ) + nextStarFeedbackDelay )
	Inventory:SetCount( player, 'StarFeedbackCount', starFeedbackCount+1 )
end


function PlayerRemovingWait( player )
	local inventoryStore = Inventory:GetInventoryStoreWait( player )
	if not inventoryStore then return end
	local inventory = inventoryStore:Get()
	if inventory then
		if inventory.itemsT then  -- itemsT can be nil when I, Jamie, reset my inventory
			local sessionTicks = Inventory:GetSessionTime( player )
			inventory.itemsT.TimeInvested = inventory.itemsT.TimeInvested + sessionTicks
			local endingStars = inventory.itemsT.Stars -- inventoryCacheT[ CacheKey( player ) ].itemsT.Stars
			if endingStars then  -- after resetting inventory there will be no neding stars, so we need this check for debug purposes
				local starsForSession = endingStars - startingInfoT[ CacheKey( player ) ].starsN
				
				local starsPerHour = starsForSession * 60 * 60 / sessionTicks
				
				if sessionTicks >= 600 then
					AnalyticsXL:ReportHistogram( player, 
						"StarsPerHour", 
						starsPerHour, 
						1, 
						"Star", 
						"Stars "..starsForSession..", Minutes "..math.ceil( sessionTicks / 60 ) )   
				end
				--Inventory:SaveWait( player )
				--inventoryCacheT[ CacheKey( player/f ) ] = nil
			
				-- why the ugly delay?
				-- lingering functions may be processing players after the players get removed, accessing their 
				-- inventory, etc, so by waiting a good long time we make sure to not cause any race conditions
				-- if we're aggressive about garbage collection then we'd have to use other mechanisms to make sure
				-- the players aren't being accessed anymore	 

				-- measure rubies see if there are non-spenders
				local rubiesLeft = inventory.itemsT.Rubies
				GameAnalyticsServer.RecordDesignEvent( player, "RubiesLeft", rubiesLeft, 50, "Ruby50" )
			end
		end
	end
--	delay( 300, function() startingInfoT[ CacheKey( player ) ] = nil end )
--  wishlist fix: it's leaking here
end


for _, player in pairs( game.Players:GetPlayers() ) do spawn( function() PlayerAddedWait( player ) end ) end
game.Players.PlayerAdded:Connect( PlayerAddedWait )
game.Players.PlayerRemoving:Connect( PlayerRemovingWait )

function CheckForReward( player, itemKeyS, x )
	local rewardsA = PossessionData.dataT[ itemKeyS ].rewardsA
	if rewardsA then
		for _, reward in pairs( rewardsA ) do
			if x == reward.rewardCountN then 
				spawn( function()					
					-- [2] is 'blueprints' chest, we can tune that however we want in the future - most of these awards you get on your first
					-- play, so I want to give you stuff to build. Dailys are [1]
					Inventory:AwardRandomPossession( player, require( game.ReplicatedStorage.Standard.Crates )[2], "Reward for "..reward.rewardMessageS )
					if reward.rewardBadgeId then
						game.BadgeService:AwardBadge( player.UserId, reward.rewardBadgeId )				
					end				
				end )			
			end
		end
	end
end


function Inventory:SetCount( player, itemKeyS, x )
	DebugXL:Assert( typeof(x)=="number" )
	local inventoryStore = Inventory:GetInventoryStoreWait( player )
	if not inventoryStore then return end
	local inventory = inventoryStore:Get()
	if x ~= inventory.itemsT[ itemKeyS ] then  -- deliberately not comparing with lastCount, below, to make sure we overwrite nil with 0 if the occassion arises
		local lastCount = inventory.itemsT[ itemKeyS ] or 0
		inventory.itemsT[ itemKeyS ] = x
		
		if PossessionData.dataT[ itemKeyS ].publishValueB then
			InstanceXL:CreateSingleton( "NumberValue", { Name = itemKeyS, Parent = player, Value = inventory.itemsT[ itemKeyS ] or 0 } )
		end
		if x > lastCount then
			CheckForReward( player, itemKeyS, x )
		end
		
		inventoryStore:Set( inventory ) 
		if not PossessionData.dataT[ itemKeyS ].skipClientRefreshB then
			workspace.Signals.InventoryRE:FireClient( player, "Update", inventory )		
		end
	end
end


function Inventory:AdjustCount( player, itemKeyS, increment, analyticItemTypeS, analyticItemIdS )  -- itemtype and itemid are for game analytics purposes, leave itemtype nil for no reportage
	local inventoryStore = Inventory:GetInventoryStoreWait( player )
	if not inventoryStore then return end
	local inventory = inventoryStore:Get()
	if inventory then
		local itemsCacheT = inventory.itemsT
		
		-- I initialized your damn stuff myself just so I wouldn't have to do this. Maybe I might as well do the other
		-- thing (have them nil when you've never owned one). Except I think a lot of things access itemsT directly, particularly on client
		-- which might be ok, though, because they'll iterate through it, not look for a specific item, and when they do look
		-- for a specific item, like tutorial, it will already be there.
		if not itemsCacheT[ itemKeyS ] then
			--print( player.Name.." got their first "..itemKeyS )
			itemsCacheT[ itemKeyS ] = 0  
		end
		
		itemsCacheT[ itemKeyS ] = itemsCacheT[ itemKeyS ] + increment

		if increment > 0 then				
			CheckForReward( player, itemKeyS, itemsCacheT[ itemKeyS ] )
		end

		DebugXL:Assert( itemsCacheT[ itemKeyS ] >= 0 )
		if itemsCacheT[ itemKeyS ] < 0 then
			itemsCacheT[ itemKeyS ] = 0
		end	
		if PossessionData.dataT[ itemKeyS ].publishValueB then
			InstanceXL:CreateSingleton( "IntValue", { Name = itemKeyS, Parent = player, Value = inventory.itemsT[ itemKeyS ] or 0 } )
		end
	
		inventoryStore:Set( inventory )
		if not PossessionData.dataT[ itemKeyS ].skipClientRefreshB then
			workspace.Signals.InventoryRE:FireClient( player, "Update", inventory )		
		end
		
		if analyticItemTypeS then
			if ( increment > 0 ) then
				GameAnalyticsServer.RecordResource( player, increment, "Source", itemKeyS, analyticItemTypeS, analyticItemIdS )
			else
				GameAnalyticsServer.RecordResource( player, -increment, "Sink", itemKeyS, analyticItemTypeS, analyticItemIdS )
			end
		end

		-- feels like a kludgey place for this
		if itemKeyS == "Stars" then
			player.leaderstats.Rank.Value = RankForStars:GetRankForStars( itemsCacheT[ itemKeyS ] )

			RankForStars:AwardBadgesForStars( itemsCacheT[ itemKeyS ], player )
			-- this is where badge giving would go
		end
	end
	--workspace.Signals.InventoryRE:FireClient( player, "Update", inventoryCacheT[ CacheKey( player ) ])
end



function Inventory:GiftOnce( player, itemKeyS, increment )
	local inventoryStore = Inventory:GetInventoryStoreWait( player )
	if not inventoryStore then return end
	local inventory = inventoryStore:Get()
	if not Inventory then return end
	if not inventory.itemsT[ itemKeyS ] then
		Inventory:AdjustCount( player, itemKeyS, increment )
	end
end


function Inventory:GetCount( player, itemKeyS )
	local inventoryStore = Inventory:GetInventoryStoreWait( player )
	if inventoryStore then
		local inventory = inventoryStore:Get()
		local count = inventory.itemsT[ itemKeyS ] or 0
		return count
	else
		return 0
	end
end


-- returns true, false, or unknown

function Inventory:EverHadItem( player, itemKeyS )
	local inventoryStore = Inventory:GetInventoryStoreWait( player )
	if inventoryStore then
		local inventory = inventoryStore:Get()
		local count = inventory.itemsT[ itemKeyS ]
		return count and true or false
	end
	return "unknown"
end

	
function Inventory:BoostActive( player )
	if Places.getCurrentPlace() ~= Places.places.Underhaven then
		return Inventory:GetCount( player, "Boost" ) > 0
	end
	return false
end


function Inventory:EarnRubies( player, increment, analyticItemTypeS, analyticItemIdS )
	if Inventory:BoostActive( player ) then
		increment = increment * 3		
		analyticItemIdS = analyticItemIdS..":Boost"
	end
	Inventory:AdjustCount( player, "Rubies", increment, analyticItemTypeS, analyticItemIdS )
end


local Crates = require( game.ReplicatedStorage.Standard.Crates )

local cratesTable = {}
for _, crate in ipairs( Crates ) do
	cratesTable[ crate.Name ] = crate
end


function Inventory:AwardRandomPossession( player, crateDatum, occasionS )
	local instantDeck = InventoryUtility:MakeCrateDeck( crateDatum )
	local possessionChoiceN = MathXL:RandomInteger( 1, #instantDeck )
	local newPossessionName = instantDeck[ possessionChoiceN ].idS
	Inventory:AdjustCount( player, newPossessionName, 1, "Award", occasionS )
	workspace.Signals.InventoryRE:FireClient( player, "Award", newPossessionName, occasionS )	
	return true
end


local chestResetPeriod = 60*60*24
function Inventory:CheckForDailyAward( player )
	--print( "Checking for daily award for "..player.Name )
	local myInventoryStore = Inventory:GetInventoryStoreWait( player )
	local myInventory = myInventoryStore:Get()-- inventoryCacheT[ CacheKey( player ) ]
	if myInventory then
		if math.floor( myInventory.lastDailyChestOsTime / chestResetPeriod ) < math.floor( os.time() / chestResetPeriod ) then
			Inventory:AwardRandomPossession( player, Crates[1], "Daily Award" )  
			-- premium:
			--Inventory:AwardRandomPossession( player, Crates[4], "Happy Holidays" )  
			-- have to re-get because AwardRandomPossession modified and invalidated our local cache
			local myInventory = myInventoryStore:Get()-- inventoryCacheT[ CacheKey( player ) ]
			--print( player.Name.." awarded daily chest" )
			myInventory.lastDailyChestOsTime = os.time()
			myInventoryStore:Set( myInventory )
			workspace.Signals.InventoryRE:FireClient( player, "Update", myInventory )		
			
	--		Inventory:SaveWait( player )
		end 
	end
end


-- you need to call store:Set() to record changes, so GetWait returns a readonly copy of your inventory
function Inventory:GetWait( player )
	-- using startingInfo as a flag to make sure datastore has been set up 
	local store = Inventory:GetInventoryStoreWait( player )
	if store then 
		return store:Get() 
	else
		return nil
	end
end


function Inventory:GetActiveSkinsWait( player )
	local inventory = Inventory:GetWait( player )
	if inventory then
		return inventory.activeSkinsT
	else
		return { monster = {}, hero = {} }  -- returning a spoof so consumers can fail silently
	end	
end


function Inventory:PlayerInTutorial( player )
	local inventory = Inventory:GetWait( player )
	if inventory then
		return InventoryUtility:IsInTutorial( inventory )
	end
	return false
end

local InventoryRemote = {}


function InventoryRemote.GetWait( player )
	return Inventory:GetWait( player )
end


function InventoryRemote.CheckForDailyAward( player )
	Inventory:CheckForDailyAward( player )
end


function InventoryRemote.BuyCrate( player, crateName )
	--print( player.Name.." attempting to buy crate "..crateName )
	local crateDatum = cratesTable[ crateName ]
	if crateDatum.Cost <= Inventory:GetCount( player, "Rubies" )  then
		if Inventory:AwardRandomPossession( player, crateDatum, crateName ) then		
			Inventory:AdjustCount( player, "Rubies", -crateDatum.Cost, "Crate", crateName )
			Inventory:SaveWait( player )
			if not InventoryUtility:IsInTutorial( Inventory:GetWait( player ) ) then
				AnalyticsXL:ReportEvent( player, "Bought crate", crateName, "", 1 )
			end
		end
	end
end



function InventoryRemote.MarkMessageShown( player, messageKey )
	-- cheaters can cheat this all they want, the worst they'll do is hide messages from themselves
	local inventory = Inventory:GetWait( player )
	inventory.messagesShownT[ messageKey ] = inventory.messagesShownT[ messageKey ] and inventory.messagesShownT[ messageKey ]+1 or 1
end


function InventoryRemote.PrintMoney( player )
	if CheatUtility:PlayerWhitelisted( player ) then
		workspace.Standard.MessageGuiXL.MessageRE:FireAllClients( "RubyGift", { player.Name } )
		for _, destplayer in pairs( game.Players:GetPlayers() ) do
			Inventory:AdjustCount( destplayer, "Rubies", 500 )
			spawn( function() Inventory:SaveWait( destplayer ) end )
		end
	end
end


function InventoryRemote.PrintStars( player )
	if CheatUtility:PlayerWhitelisted( player ) then
		Inventory:AdjustCount( player, "Stars", 150 )
		spawn( function() Inventory:SaveWait( player ) end )
	end
end



function InventoryRemote.GiftRubies( player, destplayer )
	if CheatUtility:PlayerWhitelisted( player ) then
		MessageServer.PostParameterizedMessage( destplayer, "RubyGift", { player.Name } )
		Inventory:AdjustCount( destplayer, "Rubies", 500 )
		spawn( function() Inventory:SaveWait( destplayer ) end )
	end
end


function InventoryRemote.StealPossession( player, idS )
	if CheatUtility:PlayerWhitelisted( player ) then
		Inventory:AdjustCount( player, idS, 1 )
	end
end


function InventoryRemote.Reset( player )
	local freshInventory = Inventory.new()
	Inventory:GetInventoryStoreWait( player ):Set( freshInventory )
	Inventory:SaveWait( player )
		--InventoryStore:SetAsync( StoreKey( player ), inventoryCacheT[ CacheKey( player ) ] )
end


function InventoryRemote.SetActiveSkin( player, skinOwnerS, skinTypeKey, skinIdS )
	local inventoryStore = Inventory:GetInventoryStoreWait( player )
	if inventoryStore then
		local inventory = inventoryStore:Get()
		if inventory then
			inventory.activeSkinsT[ skinOwnerS ][ skinTypeKey ] = skinIdS
			inventoryStore:Set( inventory )
			workspace.Signals.InventoryRE:FireClient( player, "Update", inventory )
			if PossessionData.skinTypesT[ skinTypeKey ].tagsT.worn then
				-- has to come first otherwise you drop weapon
				require( game.ServerStorage.FlexEquipModule ):ApplyEntireCostumeIfNecessaryWait( player )
			end
			require( game.ServerStorage.Standard.FlexibleToolsModule ):ReskinTools( player )
		end
	end
end


function InventoryRemote.SetMonsterSetting( player, monsterIdS, setting, value )
	local inventoryStore = Inventory:GetInventoryStoreWait( player )
	if inventoryStore then
		local inventory = inventoryStore:Get()		
		if inventory then
			InventoryServer.setMonsterSetting( player, inventory, monsterIdS, setting, value )
			inventoryStore:Set( inventory )
		end
	end
end


function InventoryRemote.SubmitCode( player, codeS )
	local inventoryStore = Inventory:GetInventoryStoreWait( player )
	if not inventoryStore then return end
	local inventory = inventoryStore:Get()
	if( InventoryServer.submitCode( inventory, player, codeS ) ) then
		inventoryStore:Set( inventory )
		workspace.Signals.InventoryRE:FireClient( player, "Update", inventory )		
	end
end


function InventoryRemote.ChangeReview( player, review )
	local inventoryStore = Inventory:GetInventoryStoreWait( player )
	if not inventoryStore then return end
	local inventory = inventoryStore:Get()
	InventoryServer.changeReview( inventory, review )
	inventoryStore:Set( inventory )
end


function InventoryRemote.PostFeedback( player, feedback )
	local inventoryStore = Inventory:GetInventoryStoreWait( player )
	if not inventoryStore then return end
	local inventory = inventoryStore:Get()
	InventoryServer.postFeedback( inventory, player, feedback )
end




workspace.Signals.InventoryRF.OnServerInvoke = function( player, funcname, ... )
	return InventoryRemote[ funcname ]( player, ... )
end


workspace.Signals.InventoryRE.OnServerEvent:Connect( function( player, funcname, ... )
	InventoryRemote[ funcname ]( player, ... )
end )

 
-- Function to handle a completed prompt and purchase
local function OnPromptGamePassPurchaseFinished(player, purchasedPassId, purchaseSuccess)
	if purchaseSuccess == true then
		--print( player.Name .. " purchased pass "..purchasedPassId )
		local possession = TableXL:FindFirstWhere( PossessionData.dataA, function( item )
			return item.gamePassId == purchasedPassId 
		end)
		if possession then
			-- Assign this player the ability or bonus related to the game pass
			GameAnalyticsServer.RecordTransaction( player, 0, possession.idS ..":".. possession.countForPassN )
			Inventory:SetCount( player, possession.idS, possession.countForPassN )
		else
			DebugXL:Error( "Couldn't find possession for game pass "..purchasedPassId )
		end
		if purchasedPassId == DeveloperProducts.vipPassId then
			GameAnalyticsServer.RecordTransaction( player, 0, "VIP"..":1" )
			player.leaderstats.VIP.Value = "VIP"
		end
	end
end
 
-- Connect 'PromptGamePassPurchaseFinished' events to the 'onPromptGamePassPurchaseFinished()' function
game:GetService("MarketplaceService").PromptGamePassPurchaseFinished:Connect( OnPromptGamePassPurchaseFinished )


-- continually decrement everyone's boost
spawn( function()
	while wait(1) do
		for _, player in pairs( game.Players:GetPlayers() ) do
			if( Places.getCurrentPlace() ~= Places.places.Underhaven )then	
				local boostN = Inventory:GetCount( player, "Boost" )  -- for convenience debugging because it goes away when you reset inventory
				if boostN and boostN > 0 then
					Inventory:AdjustCount( player, "Boost", -1 )
				end
			end				
		end	
	end
end)



return Inventory
