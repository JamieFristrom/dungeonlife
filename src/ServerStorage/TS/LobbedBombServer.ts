
// This file is part of Dungeon Life. See https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md for license details.

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)

import * as CharacterI from 'ServerStorage/Standard/CharacterI'
import * as FlexibleTools from 'ServerStorage/Standard/FlexibleToolsModule'
import * as MechanicalEffects from 'ServerStorage/Standard/MechanicalEffects'

import { FlexibleToolsServer } from 'ServerStorage/TS/FlexibleToolsServer'
import { PlayerServer } from './PlayerServer'



export namespace LobbedBombServer {
    export function explode(thrownObjPart: Part) {
        let creatorValueObj = (thrownObjPart.FindFirstChild('creator') as ObjectValue|undefined)
        DebugXL.Assert(creatorValueObj !== undefined)
        if (creatorValueObj) {
            let attackingPlayer = creatorValueObj.Value as Player
            DebugXL.Assert(attackingPlayer !== undefined)
            if (attackingPlayer) {
                let parentToolValueObj = (thrownObjPart.FindFirstChild('Tool') as ObjectValue|undefined)
                DebugXL.Assert(parentToolValueObj !== undefined)
                if (parentToolValueObj) {
                    let tool = parentToolValueObj.Value as Tool
                    let flexTool = FlexibleToolsServer.getFlexTool(tool)
                    let toolDamage = CharacterI.DetermineFlexToolDamage(attackingPlayer, flexTool)
                    let hitCharacters = MechanicalEffects.Explosion(thrownObjPart.Position,
                        toolDamage[0],
                        FlexibleTools.GetAdjFlexToolStat(flexTool, 'blastRadiusN'),
                        attackingPlayer,
                        false)
                    hitCharacters.forEach((hitCharacter) => {
                        let humanoid = (hitCharacter.FindFirstChild('Humanoid') as Humanoid|undefined)
                        if (humanoid) {
                            const attackerRecord = PlayerServer.getCharacterRecordFromPlayer(attackingPlayer)
                            DebugXL.Assert(attackerRecord!==undefined)
                            if( attackerRecord ) {
                                FlexibleTools.ResolveFlexToolEffects(attackerRecord, flexTool, humanoid, tool)
                            }
                        }
                    })
                }
            }
        }
    }
}