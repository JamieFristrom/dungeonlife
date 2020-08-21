local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )
local TableXL = require( game.ReplicatedStorage.Standard.TableXL )

--DebugXL:Assert( TableXL:VerifyType( { ["Thing"] = { 1 }, ["Otherthing"] = { 2 }, ["Thirdthing"] = { 3 } } ) == "dictionary" ) 

local testDataT = {
	itemsT =
		{ 
			{ baseDataS = "Healing",   levelN = 1 },
			{ baseDataS = "Sword",     levelN = 1 },
			{ baseDataS = "Bow", levelN = 1, enhancementsA = {  { flavorS = "cold", bonusN = 2, dps = 2, seconds = 2 } } }
		},
	statsT =
		{
			strN 			 = 10,
			dexN 		     = 10,
			conN 		     = 10,
			willN 		     = 10,
--			statPointsSpentN = 5,
			experienceN      = 0   -- not abbreviating because it would be hard to search for
		}
	}	

local dataCopyT = TableXL:DeepCopy( testDataT )

DebugXL:Assert( TableXL:DeepMatching( testDataT, dataCopyT ) )

dataCopyT.itemsT[3].enhancementsA[1].flavorS = "hot"
DebugXL:Assert( testDataT.itemsT[3].enhancementsA[1].flavorS == "cold" )

local lowestStat, lowestFit, lowestKey = TableXL:FindBestFitMin( testDataT.statsT, function( x ) return x end )
DebugXL:Assert( lowestStat == 0 )
DebugXL:Assert( lowestFit == 0 )
DebugXL:Assert( lowestKey == "experienceN" )

local lowestStat, lowestFit, lowestKey = TableXL:FindBestFitMin( { -1, 2, -3, -2 }, function( x ) return math.abs( x ) end )
DebugXL:Assert( lowestStat == -1 )
DebugXL:Assert( lowestFit == 1 )
DebugXL:Assert( lowestKey == 1 )

local testCatA1 = { 'a', 'b', 'c' }
local testCatA2 = { 'd', 'e', 'f' }

TableXL:ConcatenateA( testCatA1, testCatA2 )
DebugXL:Assert( testCatA1[1] == 'a' )
DebugXL:Assert( testCatA1[2] == 'b' )
DebugXL:Assert( testCatA1[3] == 'c' )
DebugXL:Assert( testCatA1[4] == 'd' )
DebugXL:Assert( testCatA1[5] == 'e' )
DebugXL:Assert( testCatA1[6] == 'f' )

DebugXL:Assert( TableXL:SumA( { 1, 2, 3, 4 } )==10 )

Base = {}
Base.__index = Base

function Base:getName()
	return "Base"
end

function Base:test()
	return "Test"
end

function Base.new() 
	local o = {}
	setmetatable(o, Base)
	Base.__index = o
	return o
end

Child = Base.new()
Child.__index = Child
setmetatable(Child, {__index=Base})

function Child:getName()
	return "Child"
end

function Child.new()
	local o = {}
	setmetatable(o, Child)
	Child.__index = o
	return o
end

local sampleObject = Base.new()
DebugXL:Assert( Base:test()=="Test")
DebugXL:Assert( Base:getName()=="Base")
DebugXL:Assert( TableXL:InstanceOf( sampleObject, Base ))
DebugXL:Assert( not TableXL:InstanceOf( sampleObject, Child ))

local sampleChild = Child.new()
DebugXL:Assert( Child:test()=="Test")
DebugXL:Assert( Child:getName()=="Child")
DebugXL:Assert( TableXL:InstanceOf( sampleChild, Base ))
DebugXL:Assert( TableXL:InstanceOf( sampleChild, Child ))

local unrelatedObject = { length = 1, breadth = 1 }
DebugXL:Assert( not TableXL:InstanceOf( unrelatedObject, Base ))