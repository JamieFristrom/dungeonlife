
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

export namespace Math {
    export function clamp( x: number, min: number, max: number ) {
        // this clamp won't halt the thread if max < min
        if( max < min ) {
            DebugXL.Error( "max must be greater to or equal than min" )
            return x
        }
        else {
            return math.clamp( x, min, max )  // you may now use the old-school clamp
        }
    }
}