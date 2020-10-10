
// This file is part of Dungeon Life. See https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md for license details.

import { DebugXL, LogArea } from './DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)

import { GeneralWeaponUtility } from 'ReplicatedStorage/TS/GeneralWeaponUtility'

import { BaseWeaponUtility } from './BaseWeaponUtility'
import { FlexTool } from './FlexToolTS'
import * as MathXL from "ReplicatedStorage/Standard/MathXL"

import { MessageGui } from 'ReplicatedStorage/TS/MessageGui'
import { PCClient } from './PCClient'

type Character = Model

// ignoring the passed in one now, that should be global anyway
function messageFunc(key: string) {
    MessageGui.PostMessageByKey(key, false, 0, false)
}

/**
    Code for the client side behavior of melee & bolt weapons.
    Anim names are references into the AnimationManifest
*/
export abstract class BaseWeaponClient {

    onActivated(character: Character, mouse: Mouse) {
        DebugXL.logD(LogArea.Combat, character.Name + ' activated weapon')
        if (GeneralWeaponUtility.isCoolingDown(character)) return

        DebugXL.logD(LogArea.Combat, character.Name + ' not uncool')

        const manaValueObj = (character.FindFirstChild('ManaValue') as NumberValue|undefined)
        if (!manaValueObj) {
            DebugXL.logE(LogArea.Combat, character.GetFullName() + ' missing ManaValue')
            return
        }
        DebugXL.Assert(manaValueObj.Value >= 0)
        if (manaValueObj.Value < this.weaponUtility.flexTool.getManaCost()) {
            messageFunc("OutOfMana")
        }
        else {
            this._onActivated(character, mouse)
            const [bestTarget] = GeneralWeaponUtility.findClosestVisibleTarget(character, PCClient.pc.getTeam(), this.weaponUtility.getRange())
            this.weaponUtility.showAttack(character, bestTarget)
        }
    }

    _onActivated(character: Character, mouse: Mouse) { }

    onEquippedLocal(mouse: Mouse) {
        DebugXL.logD(LogArea.Items, "onEquippedLocal" )
        if (!mouse) {
            DebugXL.logW(LogArea.UI, "OnEquippedLocal: Mouse not found")
            return
        }

        const character = this.tool.Parent as Character
        DebugXL.Assert(character !== undefined)
        if (!character) {
            DebugXL.logI(LogArea.Items, "Couldn't find character to equip")
            return
        }

        mouse.Button1Down.Connect(() => { this.onActivated(character, mouse) })
        DebugXL.logD(LogArea.Combat, this.tool.GetFullName() + ' mouse button connected')

        this.weaponUtility.drawWeapon(character)
    }

    onUnequippedLocal() {
        this.weaponUtility.sheatheWeapon()
    }

    constructor(
        public tool: Tool,
        public weaponUtility: BaseWeaponUtility) {
        tool.Equipped.Connect((mouse) => { this.onEquippedLocal(mouse) })
        tool.Unequipped.Connect(() => { this.onUnequippedLocal() })
        DebugXL.logD(LogArea.Combat, tool.GetFullName() + ' equip/unequip connected')
    }
}
