import * as CharacterI from "ServerStorage/Standard/CharacterI"

import * as FlexibleTools from "ServerStorage/Standard/FlexibleToolsModule"

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"

import * as MechanicalEffects from "ServerStorage/Standard/MechanicalEffects"

export namespace LobbedBombServer
{
    export function explode( thrownObjPart: Part )	
    {
        let creatorValueObj = thrownObjPart.FindFirstChild<ObjectValue>('creator')
        DebugXL.Assert( creatorValueObj !== undefined )
        if( creatorValueObj )
        {
            let attackingPlayer = creatorValueObj.Value as Player
            DebugXL.Assert( attackingPlayer !== undefined )
            if( attackingPlayer )
            {
                let flexToolIdObj = thrownObjPart.FindFirstChild<NumberValue>('ToolId')
                DebugXL.Assert( flexToolIdObj !== undefined )
                if( flexToolIdObj )
                {
                    let flexTool = FlexibleTools.GetToolInstFromId( flexToolIdObj.Value )
                    let toolDamage = CharacterI.DetermineFlexToolDamage( attackingPlayer, flexTool )
                    let hitCharacters = MechanicalEffects.Explosion( thrownObjPart.Position, 
                        toolDamage[0],
                        FlexibleTools.GetAdjFlexToolStat( flexTool, 'blastRadiusN'),
                        attackingPlayer,
                        false )
                    hitCharacters.forEach( (hitCharacter)=>
                    {
                        let humanoid = hitCharacter.FindFirstChild<Humanoid>('Humanoid')
                        if( humanoid )
                        {
                            FlexibleTools.ResolveFlexToolEffects( flexTool, humanoid, attackingPlayer )
                        }
                    })
                }
            }
        }
    }
}