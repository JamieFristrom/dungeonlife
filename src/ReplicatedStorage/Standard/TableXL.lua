
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local TableXL = {}

-- not doing 
function TableXL:GetN( tbl )
	DebugXL:Assert( self == TableXL )
	local count = 0
	for _, _ in pairs( tbl ) do
		count = count + 1
	end
	return count
end


function TableXL:TableToPairArray( tbl )
	DebugXL:Assert( self == TableXL )
	local arr = {}
	local i = 1
	for k, v in pairs( tbl ) do
		arr[ i ] = { ['k'] = k, ['v'] = v }
		i = i + 1
	end	
	return arr
end


-- returns type and verifies table is not being cute
function TableXL:VerifyIsArray( tbl )
	for k, v in pairs( tbl ) do
		DebugXL:Assert( type( k ) == "number" )
	end
end


function TableXL:VerifyUnmixed( tbl )
	local tblType
	for k, v in pairs( tbl ) do
		if type( k ) == "number" then
			DebugXL:Assert( tblType ~= "dictionary" )
			tblType = "array"
		else
			DebugXL:Assert( tblType ~= "array" )
			tblType = "dictionary"
		end
	end
	if tblType == "array" then
		DebugXL:Assert( #tbl == TableXL:GetN( tbl ) )
	end
end


function TableXL:PairArrayToTable( arr )
	DebugXL:Assert( self == TableXL )
	TableXL:VerifyIsArray( arr )
	local tbl = {}
	for _, element in pairs( arr ) do
		tbl[ element.k ] = element.v
	end	
	return tbl
end


function TableXL:OneLevelCopy( tbl )
	DebugXL:Assert( self == TableXL )
	local newTbl = {}
	for k, v in pairs( tbl ) do
		newTbl[ k ] = v
	end
	return newTbl
end


function TableXL:DeepCopy( element )
	DebugXL:Assert( self == TableXL )
	if type(element)=="table" then
		local newTbl = {}
		for k, v in pairs( element ) do
			newTbl[ k ] = TableXL:DeepCopy( v )
		end	
		return newTbl
	else
		return element
	end
end


function TableXL:DeepMatching( element1, element2 )
	DebugXL:Assert( self == TableXL )
	if type( element1 )=="table" then
		if type( element2 )=="table" then
			for k, v in pairs( element1 ) do
				if not TableXL:DeepMatching( v, element2[k] ) then
					return false
				end
			end
			-- mostly redundant but making sure no extraneous pairs in element2
			for k, v in pairs( element2 ) do
				if not TableXL:DeepMatching( v, element1[k] ) then
					return false
				end
			end
		else
			return false
		end
	else
		if element1 ~= element2 then
			return false
		end		
	end
	return true
end


-- only for arrays, where there can be a concept of 'first'
function TableXL:FindFirstWhere( arr, predicate )
	DebugXL:Assert( self == TableXL )
	TableXL:VerifyIsArray( arr )
	
	for i, element in ipairs( arr ) do
		if predicate( element ) then
			return element, i
		end
	end
end


-- good for when first doesn't matter; works on tables as well as arrays
-- returns element, index or nil if not found
function TableXL:FindWhere( tbl, predicate )
	DebugXL:Assert( self == TableXL )
	for i, element in pairs( tbl ) do
		if predicate( element ) then
			return element, i
		end
	end	
end

-- only real difference between FindAllInT and FindAllInA is that the FindAllInT predicate takes k, v
-- if I did it over, I'd just have FindAllWhere and the predicate would take v, k
function TableXL:FindAllInTWhere( tbl, predicate )
	DebugXL:Assert( self == TableXL )
	local resultT = {}
	for k, v in pairs( tbl ) do
		if predicate( k, v ) then  
			resultT[ k ] = v
		end
	end
	return resultT
end


function TableXL:FindAllInAWhere( arr, predicate )
	DebugXL:Assert( self == TableXL )
	TableXL:VerifyIsArray( arr )

	local resultA = {}
	for _, v in ipairs( arr ) do
		if predicate( v) then
			table.insert( resultA, v )
		end
	end
	return resultA
end


function TableXL:FindFirstElementIdxInA( arr, _element )
	DebugXL:Assert( self == TableXL )
	TableXL:VerifyIsArray( arr )

	for i, element in ipairs( arr ) do
		if element == _element then
			return i
		end
	end	
end

function TableXL:RemoveFirstElementFromA( arr, _element )
	DebugXL:Assert( self == TableXL )
	TableXL:VerifyIsArray( arr )

	local i = TableXL:FindFirstElementIdxInA( arr, _element )
	if i then
		table.remove( arr, i )
	end
end


function TableXL:Map( tbl, func )
	local resultTbl = {}
	for k, v in pairs( tbl ) do
		resultTbl[ k ] = func( v )
	end
	return resultTbl
end


-- returns best value, best result of fitness function, best key
-- arbitrary but that's just how it evolved
function TableXL:FindBestFitMin( tbl, func )
	local bestFitN = math.huge
	local bestv = nil
	local bestk = nil
	for k, v in pairs( tbl ) do
		local fitN = func( v )
		if fitN < bestFitN then
			bestFitN = fitN
			bestv = v
			bestk = k
		end
	end	 
	return bestv, bestFitN, bestk
end


function TableXL:FindBestFitMax( tbl, func )
	local bestFitN = -math.huge
	local bestv = nil
	local bestk = nil
	for k, v in pairs( tbl ) do
		local fitN = func( v )
		if fitN > bestFitN then
			bestFitN = fitN
			bestv = v
			bestk = k
		end
	end	 
	return bestv, bestFitN, bestk
end


function TableXL:SumA( arr )
	TableXL:VerifyIsArray( arr )

	local accN = 0
	for _, vN in ipairs( arr ) do
		accN = accN + vN
	end
	return accN
end


-- in place  (was about to make a not-in-place one and then realized I needed an in-place one anyway)
function TableXL:ConcatenateA( destA, srcA )
	TableXL:VerifyIsArray( srcA )

	for _, v in ipairs( srcA ) do
		table.insert( destA, v )
	end
end


-- check if a table is an instance of a class; taken from Roblox-TS
function TableXL:InstanceOf( obj, class )
	DebugXL:Assert( type(obj)=="table" ) 

	-- metatable check
	obj = getmetatable(obj)
	while obj ~= nil do
		if obj == class then
			return true
		end
		local mt = getmetatable(obj)
		if mt then
			obj = mt.__index
		else
			obj = nil
		end
	end
	return false
end




return TableXL
