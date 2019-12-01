return require( script.Parent.Parent.TS.DebugXLTS ).DebugXL
--
--  DebugXL
--
--  Debug eXtended Library. It excels. It's extra large.
--
--  Additional debug functions to augment lua.
--
--  Jamie_Fristrom @happionlabs
--[[
local DebugXL = {}

function DebugXL:Error( message )
	DebugXL:Assert( self == DebugXL )
	local callstackS = debug.traceback()
	if false then --game["Run Service"]:IsStudio() then
		error( message )
	else
		spawn( function() error( message.." "..callstackS ) end )  -- so analytics will pick it up
	end
end


function DebugXL:Assert( conditionB )
	if self ~= DebugXL then error( ". instead of :" ) end
	if not conditionB then
		DebugXL:Error( "Assertion failed" )
	end
end


function DebugXL:Dump( variable )
	DebugXL:Assert( self == DebugXL )
	if type(variable)=="table" then
		for k, v in pairs( variable ) do
			print( k..": "..tostring( v ) )
			DebugXL:Dump( v )
		end
	else
		print( tostring( variable ) )
	end
end


return DebugXL --]]