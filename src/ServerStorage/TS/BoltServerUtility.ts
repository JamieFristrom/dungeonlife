import * as CharacterI from "ServerStorage/Standard/CharacterI"
import * as FlexibleTools from "ServerStorage/Standard/FlexibleToolsModule"
import * as ToolXL from "ReplicatedStorage/Standard/ToolXL"

import { PlayerServer } from "ServerStorage/TS/PlayerServer"
export namespace BoltServerUtility
{
    export function init( tool: Tool )
    {
        let attackingPlayer = ToolXL.GetOwningPlayer( tool )        
        if( attackingPlayer !== undefined )
        {
            PlayerServer.markAttack( attackingPlayer, "Ranged" )
        }
    }

    export function hitCharacter( character: Model, tool: Tool )
    {
        let flexToolInst = FlexibleTools.GetFlexToolFromInstance( tool )
        let attackingPlayer = ToolXL.GetOwningPlayer( tool )        
        CharacterI.TakeFlexToolDamage( character, attackingPlayer, flexToolInst )
        if( attackingPlayer !== undefined )
        {
            PlayerServer.markHit( attackingPlayer, "Ranged" )
        }
    }
}