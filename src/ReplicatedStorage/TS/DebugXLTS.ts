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
// borrowing from Android
export enum LogLevel
{
    Assert,
    Error,
    Warning,
    Info,
    Debug,
    Verbose
}

class DebugXLC
{
    static readonly logLevelPrefixes: string[] = ['A','E','W','I','D','V']

    private currentLogLevel = LogLevel.Verbose

    Error( message: string )
    {
        let callstackS = debug.traceback()
        if( false ) //--game["Run Service"]:IsStudio() )
            error( message )
        else
            spawn( () => { this.log( LogLevel.Error, script.Name, message+" "+callstackS ) } ) // -- so analytics will pick it up
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
        this.log( LogLevel.Info, script.Name, this.DumpToStr( variable ))
    }

    setCurrentLogLevel( newLogLevel: LogLevel )
    {
        this.currentLogLevel = newLogLevel
    }

    log( logLevel: LogLevel, tag: string, message: string )
    {
        if( !message )
        {
            error( `E/${tag}: MISSING MESSAGE` )
        }
        else if( logLevel <= this.currentLogLevel)
        {
            let prefix = DebugXLC.logLevelPrefixes[ logLevel ]
            if( logLevel <= LogLevel.Error )
                error( `${prefix}/${tag}: ${message}` )
            else if( logLevel <= LogLevel.Warning )
                warn( `${prefix}/${tag}: ${message}` )
            else
                print( `${prefix}/${tag}: ${message}`)
        }
    }

    logA( tag: string, message: string )
    {
        this.log( LogLevel.Assert, tag, message )
    }

    logE( tag: string, message: string )
    {
        this.log( LogLevel.Error, tag, message )
    }

    logW( tag: string, message: string )
    {
        this.log( LogLevel.Warning, tag, message )
    }

    logI( tag: string, message: string )
    {
        this.log( LogLevel.Info, tag, message )
    }

    logD( tag: string, message: string )
    {
        this.log( LogLevel.Debug, tag, message )
    }

    logV( tag: string, message: string )
    {
        this.log( LogLevel.Verbose, tag, message )
    }
}

export let DebugXL = new DebugXLC()
