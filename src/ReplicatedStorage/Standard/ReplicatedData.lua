local DebugXL    = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL = require( game.ReplicatedStorage.Standard.InstanceXL )

local ReplicatedData = {}

-- we can make our code less stateful by putting our data in the workspace - that way it can be inspected arbitrarily or connected
-- to by our client code.
-- whereas if we use RemoteEvent to push data to the clients, we have to make sure they're connected / watching before the push,
-- or write two-way functions
-- I probably wouldn't use this for large tables (like player inventories)  
-- we could also change the underlying mechanism here

-- a thing that's bad about this is the lack of atomic operations
-- that could really fuck us ... it's probably a deal breaker
-- maybe some day I'll actually finish this, but make it use remotefunctions for the queries and remoteevents for the pushes,
-- to abstract server-client communication

function ReplicatedData:Export( root, tbl )
	for k, v in pairs( tbl ) do
		if type(v) == "userdata" then
			if v:IsA("Instance") then
				InstanceXL.new( "ObjectValue", { Name = k, Value = v, Parent = root }, true )
			else
				DebugXL.Error( "Invalid replication userdata type "..k..", "..tostring(v) )
			end
		elseif type(v) == "number" then
			InstanceXL.new( "NumberValue", { Name = k, Value = v, Parent = root }, true )
		elseif type(v) == "string" then
			InstanceXL.new( "StringValue", { Name = k, Value = v, Parent = root }, true )
		else
			DebugXL.Error( "Invalid replication type "..k..", "..type(v) )
		end			
	end
end

function ReplicatedData:Import( root )
	local tbl = {}
	for _, thing in pairs( root:GetChildren() ) do
		-- how convenient, this line of code just works no matter what kind of value type
		tbl[ thing.Name ] = thing.Value
	end 
	return tbl
end

return ReplicatedData
