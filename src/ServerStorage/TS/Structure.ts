
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS";

import {ServerContextI } from "ServerStorage/TS/ServerContext"


export interface StructureI {
    use( player: Player ) : void
}

export class Structure {
    constructor( _: ServerContextI,
        protected structureInstance: Model ) {
        DebugXL.Assert( structureInstance.IsA("Model") )
    }

    use( player: Player ) {        
    }
}