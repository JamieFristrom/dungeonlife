
// This file is part of Dungeon Life. See https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md for license details.

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.Name)

import * as CharacterI from 'ServerStorage/Standard/CharacterI'
import * as FlexibleTools from 'ServerStorage/Standard/FlexibleToolsModule'
import * as MechanicalEffects from 'ServerStorage/Standard/MechanicalEffects'

import { FlexibleToolsServer } from 'ServerStorage/TS/FlexibleToolsServer'



export namespace LobbedBombServer {
    export function explode(thrownObjPart: Part) {
        let creatorValueObj = thrownObjPart.FindFirstChild<ObjectValue>('creator')
        DebugXL.Assert(creatorValueObj !== undefined)
        if (creatorValueObj) {
            let attackingPlayer = creatorValueObj.Value as Player
            DebugXL.Assert(attackingPlayer !== undefined)
            if (attackingPlayer) {
                let parentToolValueObj = thrownObjPart.FindFirstChild<ObjectValue>('Tool')
                DebugXL.Assert(parentToolValueObj !== undefined)
                if (parentToolValueObj) {
                    let flexTool = FlexibleToolsServer.getFlexTool(parentToolValueObj.Value as Tool)
                    let toolDamage = CharacterI.DetermineFlexToolDamage(attackingPlayer, flexTool)
                    let hitCharacters = MechanicalEffects.Explosion(thrownObjPart.Position,
                        toolDamage[0],
                        FlexibleTools.GetAdjFlexToolStat(flexTool, 'blastRadiusN'),
                        attackingPlayer,
                        false)
                    hitCharacters.forEach((hitCharacter) => {
                        let humanoid = hitCharacter.FindFirstChild<Humanoid>('Humanoid')
                        if (humanoid) {
                            FlexibleTools.ResolveFlexToolEffects(flexTool, humanoid, attackingPlayer)
                        }
                    })
                }
            }
        }
    }
}