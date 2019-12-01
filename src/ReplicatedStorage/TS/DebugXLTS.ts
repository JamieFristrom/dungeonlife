/*
--
--  DebugXL
--
--  Debug eXtended Library. It excels. It's extra large.
--
--  Additional debug functions to augment roblox
--
--  Jamie_Fristrom @happionlabs

--  What should my new naming convention be with these typescript files?
--  I don't want to name them the exact same thing as their lua counterparts which often still exist
--  Even though they're in their own directory
--  So I can put TS on the end, which seems redundant here but isn't on the Roblox side

*/


class DebugXLC
{
    Error( message: string )
    {
        let callstackS = debug.traceback()
        if( false ) //--game["Run Service"]:IsStudio() )
            error( message )
        else
            spawn( function() { error( message+" "+callstackS ) } ) // -- so analytics will pick it up
    }

    Assert( conditionB: boolean )
    {
        if( ! conditionB )
            this.Error( "Assertion failed" )
	}

    DumpToStr( variable: unknown )
    {
        let str = ""
        if( typeIs(variable, "table") )
        {    
            let tbl = variable as {[index:string]:unknown}         
            for( let [k,v] of Object.entries(tbl))
            {
                str += ( k+": "+tostring( v ) ) + "\n"
                str += this.DumpToStr( v )
            }
        }
        else
        {
            str += tostring( variable ) + "\n"
        }
        return str
    }

    Dump( variable: unknown )
    {
        print( this.DumpToStr( variable ))
    }
}

export let DebugXL = new DebugXLC()

/*
--
--  DebugXL
--
--  Debug eXtended Library. It excels. It's extra large.
--
--  Additional debug functions to augment lua.
--
--  Jamie_Fristrom @happionlabs

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


return DebugXL*/