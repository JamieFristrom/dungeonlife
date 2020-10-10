local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )

local MathXL = require( game.ReplicatedStorage.Standard.MathXL )

DebugXL:Assert( MathXL:RandomInteger( 1, 1 ) == 1 )

local testSet = 
{
	A = 0,
	B = 0,
	C = 0,
	D = 0
}

--for i=1,1000 do
--	local k = MathXL:RandomKey( testSet )
--	testSet[ k ] = testSet[ k ] + 1
--end 
--
--for _, n in pairs( testSet ) do
--	DebugXL:Assert( n > 200 )
--	DebugXL:Assert( n < 300 )
--end

DebugXL:Assert( MathXL:Fibonacci( 1 ) == 1 )
DebugXL:Assert( MathXL:Fibonacci( 2 ) == 1 )
DebugXL:Assert( MathXL:Fibonacci( 3 ) == 2 )
DebugXL:Assert( MathXL:Fibonacci( 4 ) == 3 )
DebugXL:Assert( MathXL:Fibonacci( 5 ) == 5 )
DebugXL:Assert( MathXL:Fibonacci( 6 ) == 8 )
DebugXL:Assert( MathXL:Fibonacci( 7 ) == 13 )

local numbers = { 1, 2, 3, 4, 5, 6, 7 }

numbers = MathXL:ShuffleArray( numbers )

local changed = false
for i, v in ipairs( numbers ) do
	if i ~= v then 
		changed = true
		break
	end
end



DebugXL:Assert( changed )

local testRay = Ray.new( Vector3.new( 10, 10, 10 ), Vector3.new( -1, -1, -1 ) )
local intersectionXZV3 = MathXL:RayPlaneIntersection( Vector3.new(0,0,0), Vector3.new(0,1,0), testRay )
DebugXL:Assert( MathXL:ApproxEqual( intersectionXZV3.X, 0 ) )
DebugXL:Assert( MathXL:ApproxEqual( intersectionXZV3.Y, 0 ) )
DebugXL:Assert( MathXL:ApproxEqual( intersectionXZV3.Z, 0 ) )

local testRay2 = Ray.new( Vector3.new( -10, -10, -10 ), Vector3.new( 1, 1, 1 ) )
local intersectionXZV3 = MathXL:RayPlaneIntersection( Vector3.new(0,0,0), Vector3.new(0,1,0), testRay )
DebugXL:Assert( MathXL:ApproxEqual( intersectionXZV3.X, 0 ) )
DebugXL:Assert( MathXL:ApproxEqual( intersectionXZV3.Y, 0 ) )
DebugXL:Assert( MathXL:ApproxEqual( intersectionXZV3.Z, 0 ) )

DebugXL:Assert( MathXL:IsFinite( 5 ))
DebugXL:Assert( not MathXL:IsFinite( math.huge ))
DebugXL:Assert( not MathXL:IsFinite( -math.huge ))
DebugXL:Assert( not MathXL:IsFinite( 1/0 ))
DebugXL:Assert( not MathXL:IsFinite( 0/0 ))
