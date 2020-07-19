// This file is part of Dungeon Life. See https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md for license details.

import { DebugXL } from './DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { MeleeWeaponUtility } from 'ReplicatedStorage/TS/MeleeWeaponUtility'
import { BaseWeaponClient } from './BaseWeaponClient'
import { FlexToolClient } from 'ReplicatedStorage/TS/FlexToolClient'

type Character = Model

/**
    Code for the client side behavior of melee weapons.
*/
export class MeleeWeaponClient extends BaseWeaponClient
{
    constructor( tool: Tool )
    {
        const flexTool = FlexToolClient.getFlexTool( tool )
        DebugXL.Assert( flexTool !== undefined )
        const meleeWeaponUtility = new MeleeWeaponUtility( tool, flexTool )
        super( tool, meleeWeaponUtility )
    }
}
