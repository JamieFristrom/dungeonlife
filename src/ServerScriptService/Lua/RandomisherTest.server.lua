local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )
local Randomisher = require( game.ReplicatedStorage.TS.Randomisher ).Randomisher

local randomisher = Randomisher.new( 20 )

local checkedValues = {}

for i = 1,20 do
	local next = randomisher:nextInt()
	--print( next )
	checkedValues[ next ] = true
end

for i = 0,19 do
	DebugXL:Assert( checkedValues[ i ] )
end

local next = randomisher:nextInt()
DebugXL:Assert( next >= 0 )
DebugXL:Assert( next < 20 )