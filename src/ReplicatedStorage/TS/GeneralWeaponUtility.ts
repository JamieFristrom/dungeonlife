import { DebugXL } from "./DebugXLTS"
import { CollectionService } from "@rbxts/services"

import * as WeaponUtility from 'ReplicatedStorage/Standard/WeaponUtility'

import CharacterClientI from "ReplicatedStorage/Standard/CharacterClientI"
DebugXL.logI( 'Executed', script.Name )

type Character = Model

export namespace GeneralWeaponUtility
{
    export function findClosestTarget( attackingCharacter: Character ) : [Character|undefined, number]
    {
        if( !attackingCharacter.Name ) 
        {
            DebugXL.logD('WTF', 'WTF')
        }
        DebugXL.logV('Combat', 'Find closest target for '+(attackingCharacter.Name?attackingCharacter.Name:'(nil)') )
        const characters = CollectionService.GetTagged('CharacterTag')
        DebugXL.logV('Combat', 'All characters: '+DebugXL.stringifyInstanceArray(characters) )
        characters.forEach( (char)=>DebugXL.Assert( char.IsA('Model')) )
        const modelCharacters = characters as Model[]
        const validTargetCharacters = modelCharacters.filter( (char)=>CharacterClientI.ValidTarget( attackingCharacter, char ))
        DebugXL.logV('Combat', 'Valid targets: '+DebugXL.stringifyInstanceArray(validTargetCharacters) )
        const primaryPartCharacters = validTargetCharacters.filter( (char)=>char.PrimaryPart !== undefined)
        DebugXL.logV('Combat', 'Targets with primary parts: '+DebugXL.stringifyInstanceArray(primaryPartCharacters) )
        const forcefieldlessCharacters = primaryPartCharacters.filter( (char)=>char.FindFirstChild('ForceField')===undefined )
        DebugXL.logV('Combat', 'Targets without force fields: '+DebugXL.stringifyInstanceArray(forcefieldlessCharacters) )
        const charactersWithHeads = forcefieldlessCharacters.filter( (char)=>char.FindFirstChild('Head')!==undefined )
        DebugXL.logV('Combat', 'Targets with heads: '+DebugXL.stringifyInstanceArray(charactersWithHeads) )
        const targetsAndRanges : [Character,number][]= charactersWithHeads.map( (char)=>
            [ char, WeaponUtility.GetTargetPoint( char ).sub( attackingCharacter.GetPrimaryPartCFrame().p ).Magnitude ])
        if( !targetsAndRanges.isEmpty() )
        {
            const closestTarget = targetsAndRanges.reduce( ( pairA, pairB )=>pairA[1] < pairB[1] ? pairA : pairB )
            DebugXL.logV('Combat', 'Closest target: '+DebugXL.stringifyInstance(closestTarget[0]))
            return closestTarget
        }
        else
        {
            return [undefined, math.huge]
        }
    }
}
