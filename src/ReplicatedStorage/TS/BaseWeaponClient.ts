
// This file is part of Dungeon Life. See https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md for license details.

import { DebugXL } from './DebugXLTS'
DebugXL.logI('Executed', script.Name)

import { GeneralWeaponUtility } from 'ReplicatedStorage/TS/GeneralWeaponUtility'

import { BaseWeaponUtility } from './BaseWeaponUtility'
import { FlexTool } from './FlexToolTS'
import * as MathXL from "ReplicatedStorage/Standard/MathXL"

import { MessageGui } from 'ReplicatedStorage/TS/MessageGui'

type Character = Model

// ignoring the passed in one now, that should be global anyway
function messageFunc( key: string )
{
    MessageGui.PostMessageByKey( key, false, 0, false )
}

/**
    Code for the client side behavior of melee & bolt weapons.
    Anim names are references into the AnimationManifest
*/
export abstract class BaseWeaponClient
{

    onActivated(character: Character, mouse: Mouse)
    {
        DebugXL.logD('Combat', character.Name+' activated weapon')
        if( GeneralWeaponUtility.isCoolingDown( character ) ) return

        DebugXL.logD('Combat', character.Name+' not uncool')

        const manaValueObj = character.FindFirstChild<NumberValue>('ManaValue')
        if( !manaValueObj )
        {
            DebugXL.logE( 'Combat', character.GetFullName()+' missing ManaValue' )
            return
        }
        DebugXL.Assert( manaValueObj.Value >= 0 )
        if( manaValueObj.Value < this.weaponUtility.flexTool.getManaCost() ) {            
            messageFunc("OutOfMana")				
        }
        else {
            this._onActivated(character, mouse)
            const [bestTarget] = GeneralWeaponUtility.findClosestVisibleTarget( character, this.weaponUtility.getRange() )
            this.weaponUtility.showAttack(character, bestTarget) 
        }
    }

    _onActivated(character: Character, mouse: Mouse) {}

    onEquippedLocal(mouse: Mouse)
    {
        if( !mouse )
        {
            DebugXL.logW('UI', 'OnEquippedLocal: Mouse not found')
            return 
        }
        
        const character = this.tool.Parent as Character
        DebugXL.Assert( character !== undefined )
        if( !character ) return

        mouse.Button1Down.Connect( ()=>{ this.onActivated(character, mouse) } )
        DebugXL.logD('Combat', this.tool.GetFullName()+' mouse button connected')

        this.weaponUtility.drawWeapon(character)
    }

    onUnequippedLocal()
    {
        this.weaponUtility.sheatheWeapon()
    }

    constructor( 
        public tool: Tool, 
        public weaponUtility: BaseWeaponUtility )
    {        
        tool.Equipped.Connect( (mouse)=>{ this.onEquippedLocal(mouse) } )
        tool.Unequipped.Connect( ()=>{ this.onUnequippedLocal() } )
        DebugXL.logD('Combat', tool.GetFullName()+' equip/unequip connected')
    }
}
