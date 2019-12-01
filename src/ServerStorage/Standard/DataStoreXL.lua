--
-- DataStoreXL
--
-- More robust wrapper for Roblox datastores
--
-- Wishlist: there was a good suggestion for a more reliable datastore on the forums. Switch to that
--
-- Uses lua object-oriented idiom; see https://wiki.roblox.com/index.php?title=Metatable for a tutorial
-- Because Roblox can't pass metatables from clients to servers, doing this is usually not terribly useful,
-- but here I like the syntactic sugar
-- 
--[[
local DebugXL      = require( game.ReplicatedStorage.Standard.DebugXL )

local DataStoreXL = {}

local DataStoreService = game:GetService('DataStoreService')

local datastoreRetriesN = 3

local function DataStoreRetry(dataStoreFunction)
	local tries = 0	
	local success = true
	local data = nil
	local errorMsg = ""
	repeat
		tries = tries + 1
		success, errorMsg = pcall(function() data = dataStoreFunction() end)
		if not success then 
			warn( "Datastore failure: "..errorMsg ) 
			wait(1) 
		end
	until tries == datastoreRetriesN or success
	if not success then
		DebugXL:Error('Could not access DataStore! Warn players that their data might not get saved!')
	end
	return data
end

local DataStoreXLmt = { __index = DataStoreXL }

function DataStoreXL.new( datastoreName )
	local _dataStore = DataStoreService:GetDataStore( datastoreName )
	local datastoreXLInstance = 
	{
		dataStore = _dataStore
	}
	setmetatable( datastoreXLInstance, DataStoreXLmt )
	return datastoreXLInstance
end

function DataStoreXL:GetAsync( keyS )
	return DataStoreRetry( function()
		return self.dataStore:GetAsync( keyS )
	end)
end

function DataStoreXL:SetAsync( keyS, value )
	return DataStoreRetry( function()
		return self.dataStore:SetAsync( keyS, value )
	end)
end

function DataStoreXL:IncrementAsync( keyS, value )
	return DataStoreRetry( function()
		return self.dataStore:IncrementAsync( keyS, value )
	end)
end

return DataStoreXL
--]]