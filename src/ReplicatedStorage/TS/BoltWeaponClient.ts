import * as BoltWeaponUtility from "ReplicatedStorage/Standard/BoltWeaponUtilityXL"

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
import { FlexToolClient } from "ReplicatedStorage/TS/FlexToolClient"
import { MessageGui } from "ReplicatedStorage/TS/MessageGui"

// ignoring the passed in one now, that should be global anyway
function messageFunc( key: string )
{

    MessageGui.PostMessageByKey( key, false, 0, false )
}

export class BoltWeaponClient
{
    constructor( tool: Tool, animName: string | undefined )
    {
        let flexTool = FlexToolClient.getFlexTool( tool )
        DebugXL.Assert( flexTool !== undefined )
        if( flexTool )
        {
            BoltWeaponUtility.Create( tool, messageFunc, flexTool, animName )
        }
    }
}
