
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local MathXL = {}

local coreRandom = Random.new()


function MathXL:RandomNumber( ... )  -- min = 0, max = 1
	DebugXL:Assert( self == MathXL )
	return coreRandom:NextNumber( ... )
end


function MathXL:RandomInteger( xmin, xmax )  -- x1, x2 inclusive
	DebugXL:Assert( self == MathXL )
	DebugXL:Assert( xmax >= xmin )
	return coreRandom:NextInteger( xmin, xmax )
end


function MathXL:RandomKey( tbl )
	DebugXL:Assert( self == MathXL )
	local keys = {}
	for k, _ in pairs( tbl ) do
		table.insert( keys, k )
	end
	return keys[ MathXL:RandomInteger( 1, #keys ) ]
end

-- takes an array of weights and randomly chooses amongst them taking weight into account. 
-- weight of 2 will be twice as likely to occur as 1
function MathXL:RandomBiasedInteger1toN( weightsA )
	DebugXL:Assert( self == MathXL )
	DebugXL:Assert( #weightsA >= 1 )
	local totalWeightN = 0
	for _, weight in pairs( weightsA ) do
		totalWeightN = totalWeightN + weight 
	end
	DebugXL:Assert( totalWeightN > 0 )
	local dieroll = MathXL:RandomNumber( 0, totalWeightN )
	local sumN = 0
	for i, weight in pairs( weightsA ) do
		sumN = sumN + weight
		if dieroll <= sumN then
			return i
		end
	end 
	DebugXL:Error( "Problem with RandomBiasedInteger1toN. Total weight "..totalWeightN.." dieroll "..dieroll )
	return 1
end


function MathXL:RandomBiasedKey( tblOfWeightsT )
	DebugXL:Assert( self == MathXL )
	-- make parallel arrays out of table because we've already solved that problem
	local keyA = {}
	local weightsA = {}
	local index = 1
	for k, v in pairs( tblOfWeightsT ) do
		keyA[ index ] = k 
		weightsA[ index ] = v
		index = index + 1 
	end
	local x = MathXL:RandomBiasedInteger1toN( weightsA )
	return keyA[ x ]
end


function MathXL:ShuffleArray( arr )
	DebugXL:Assert( self == MathXL )
	local startArr = {}
	local finishArr = {}
	for k, v in pairs( arr ) do startArr[k] = v end
	while #startArr > 0 do
		local nextElementIdx = MathXL:RandomInteger( 1, #startArr )
		table.insert( finishArr, startArr[ nextElementIdx ] )
		table.remove( startArr, nextElementIdx )
	end  	
	return finishArr
end

function MathXL:Lerp( x1, x2, k )
	DebugXL:Assert( self == MathXL )
	k = math.clamp( k, 0, 1 )
	return ( x2 - x1 ) * k + x1
end

-- untested
function MathXL:Smoothstep( x1, x2, k )
	DebugXL:Assert( self == MathXL )
	k = math.clamp( k, 0, 1 )
	k = k * k * ( 3 - 2 * k )
	return MathXL:Lerp( x1, x2, k )
end

-- theoretically doesn't need to be fast
function MathXL:Fibonacci( n )
	DebugXL:Assert( self == MathXL )
	if n == 1 or n == 2 then return 1 end
	return MathXL:Fibonacci( n-1 ) + MathXL:Fibonacci( n-2 )	
end


function MathXL:ApproxEqual( x1, x2, epsilon )
	epsilon = epsilon or 1e-6
	return x1 > x2 - epsilon and x1 < x2 + epsilon 
end


function MathXL:ApproxEqualV3( v31, v32, epsilon )
	epsilon = epsilon or 1e-6
	return MathXL:ApproxEqual( v31.X, v32.X, epsilon )
		and MathXL:ApproxEqual( v31.Y, v32.Y, epsilon )
		and MathXL:ApproxEqual( v31.Z, v32.Z, epsilon )
end


-- ray is a Roblox ray
function MathXL:RayPlaneIntersection( planeOriginV3, planeNormalV3, ray )
	DebugXL:Assert( self == MathXL )
	DebugXL:Assert( MathXL:ApproxEqual( planeNormalV3.Magnitude, 1 ) )
	local denomN = planeNormalV3:Dot( ray.Unit.Direction )
	if math.abs( denomN ) > 1e-6 then  -- we don't care which way the plane is facing, not raycasting
		local differenceBetweenOriginsV3 = planeOriginV3 - ray.Origin
		local t = differenceBetweenOriginsV3:Dot( planeNormalV3 ) / denomN
		if t >= 0 then 
			local intersectionV3 = t * ray.Unit.Direction + ray.Origin
			return intersectionV3
		end 
	end 
	return nil
end


-- huge but not inf;  you can't pass inf to wait()
MathXL.hugeish = 1e+30

function MathXL:IsFinite( x )
	return x > -math.huge and x < math.huge 
end

-----------------------------------------------------------------------------------------------------------------------------------
-- perlin noise, thanks to clonetrooper
local floor = math.floor
local perm = {}
for i = 1,512 do
    perm[i] = math.random(1,256)
end


local function grad( hash, x, y )
	local h = hash%8 -- Convert low 3 bits of hash code
	local u = h<4 and x or y -- into 8 simple gradient directions,
	local v = h<4 and y or x -- and compute the dot product with (x,y).
	return ((h%2==1) and -u or u) + ((floor(h/2)%2==1) and -2.0*v or 2.0*v)
end

function PerlinNoise(x,y)
	local ix0, iy0, ix1, iy1
	local fx0, fy0, fx1, fy1
	local s, t, nx0, nx1, n0, n1
	ix0 = floor(x) -- Integer part of x
	iy0 = floor(y) -- Integer part of y
	fx0 = x - ix0 -- Fractional part of x
	fy0 = y - iy0 -- Fractional part of y
	fx1 = fx0 - 1.0
	fy1 = fy0 - 1.0
	ix1 = (ix0 + 1) % 255 -- Wrap to 0..255
	iy1 = (iy0 + 1) % 255
	ix0 = ix0 % 255
	iy0 = iy0 % 255
	    t = (fy0*fy0*fy0*(fy0*(fy0*6-15)+10))
	    s = (fx0*fx0*fx0*(fx0*(fx0*6-15)+10))
	nx0 = grad(perm[ix0 + perm[iy0+1]+1], fx0, fy0)
	nx1 = grad(perm[ix0 + perm[iy1+1]+1], fx0, fy1)
	n0 = nx0 + t*(nx1-nx0)
	nx0 = grad(perm[ix1 + perm[iy0+1]+1], fx1, fy0)
	nx1 = grad(perm[ix1 + perm[iy1+1]+1], fx1, fy1)
	n1 = nx0 + t*(nx1-nx0)
	return 0.5*(1 + (0.507 * (n0 + s*(n1-n0))))
end

function MathXL:Noise(seed,x,z)
    local perlin = PerlinNoise(x,z+(seed*10000))
    return -1 + (perlin *2)
end


function MathXL:Round(x)
	return math.floor( x + 0.5 )
end


return MathXL
