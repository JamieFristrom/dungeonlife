// This file is part of Dungeon Life. See https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md for license details.

import { DebugXL } from './DebugXLTS'

import { GeneralWeaponUtility } from 'ReplicatedStorage/TS/GeneralWeaponUtility'

import { MeleeWeaponUtility } from 'ReplicatedStorage/TS/MeleeWeaponUtility'

type Character = Model

/**
    Code for the client side behavior of melee weapons.
    Anim names are references into the AnimationManifest
*/
export class MeleeWeaponClient
{
    constructor( tool: Tool )
    {
        const meleeWeaponUtility = new MeleeWeaponUtility( tool )
 
        function onActivated(character: Character)
        {
            if( GeneralWeaponUtility.isCoolingDown( character ) ) return
        
            meleeWeaponUtility.showAttack(character) 
        }

        function OnEquippedLocal(mouse: Mouse)
        {
            if( !mouse )
            {
                DebugXL.logW('UI', 'OnEquippedLocal: Mouse not found')
                return 
            }
            
            const character = tool.Parent as Character
            DebugXL.Assert( character !== undefined )
            if( !character ) return

            mouse.Button1Down.Connect( ()=> onActivated(character) )

            meleeWeaponUtility.drawWeapon(character)
        }

        function OnUnequippedLocal()
        {
            meleeWeaponUtility.sheatheWeapon()
        }

        tool.Equipped.Connect( OnEquippedLocal )
        tool.Unequipped.Connect( OnUnequippedLocal )
    }
}
