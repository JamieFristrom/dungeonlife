
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI( 'Executed', script.GetFullName())

import { RunService } from '@rbxts/services'

import * as MathXL from 'ReplicatedStorage/Standard/MathXL'
import * as FlexEquipUtility from 'ReplicatedStorage/Standard/FlexEquipUtility'

import { AnimationManifestService } from 'ReplicatedFirst/TS/AnimationManifestService'

import { GeneralWeaponUtility } from 'ReplicatedStorage/TS/GeneralWeaponUtility'
import { ToolData } from 'ReplicatedStorage/TS/ToolDataTS'
import { SkinTypes } from './SkinTypes'
import { FlexTool } from './FlexToolTS'

type Character = Model

/**
    Code for the client side behavior of melee weapons.
    Anim names are references into the AnimationManifest
*/
export abstract class BaseWeaponUtility {
    attackAnimTracks: AnimationTrack[] = []
    attackUpperBodyAnimTracks: AnimationTrack[] = []
    windUpAnim?: Animation
    windUpAnimTrack?: AnimationTrack

    attackIndex = 0

    handle: BasePart
    attackSound: Sound

    baseData: ToolData.ToolDatumI
    tool: Tool

    flexTool: FlexTool

    getRange(): number {
        const range = this.baseData.rangeN
        if (!range) {
            DebugXL.logW('Items', this.baseData.idS + ' missing range')
        }
        return range ? range : 5
    }

    getCooldown(): number {
        const cooldown = this.flexTool.getCooldown()
        DebugXL.Assert(cooldown !== undefined)
        return cooldown ? cooldown : 1
    }

    constructor(tool: Tool, flexTool: FlexTool)  // I'd prefer to access the appropriate flextool but it's hard to do from client or mob
    {
        this.tool = tool
        this.flexTool = flexTool
        this.handle = tool.WaitForChild<BasePart>('Handle')
        this.attackSound = this.handle.WaitForChild<Sound>('Attack')
        const baseDataObject = tool.WaitForChild<StringValue>('BaseData')
        const baseDataName = baseDataObject.Value
        this.baseData = ToolData.dataT[baseDataName]
        if (!this.baseData) {
            DebugXL.Error('Could not find baseData for ' + baseDataName)
        }
        if (!SkinTypes[this.baseData.skinType]) {
            DebugXL.Error('Could not find skinType for ' + this.baseData.skinType)
        }
        const windUpAnimName = SkinTypes[this.baseData.skinType].windUpAttackAnimName
        if (windUpAnimName) {
            this.windUpAnim = AnimationManifestService.getAnimInstance(windUpAnimName)
        }
    }

    showAttack(character: Character, target?: Character) {
        DebugXL.logD('Combat', character.Name + ' showAttack')
        const wielderPrimaryPart = character.PrimaryPart
        if (!wielderPrimaryPart) return

        this.attackSound.Play()

        const doDelayedEffects = this._aimAtTarget(character, target)

        this.handle.GetChildren().forEach((child) => {
            if (child.IsA('Trail'))
                child.Enabled = true
        })
        const adjCooldown = GeneralWeaponUtility.getAdjustedCooldown(character, this.getCooldown())
        if (this.attackAnimTracks[this.attackIndex]) {
            const speed = wielderPrimaryPart!.Velocity.Magnitude
            DebugXL.logV('Combat', 'Speed is ' + speed)
            if (speed > 0.5)
                this.attackUpperBodyAnimTracks[this.attackIndex].Play(0.1, 1, 0.6 / adjCooldown)
            else
                this.attackAnimTracks[this.attackIndex].Play(0.1, 1, 0.6 / adjCooldown)

            this.attackIndex = (this.attackIndex + 1) % this.attackAnimTracks.size()
            DebugXL.logV('Combat', "Attack index is " + this.attackIndex)
        }
        else // fixme; only play if sword
        {
            this._playAlternateAttackAnimation()
        }

        this._delayedEffects(adjCooldown / 2)

        const walkSpeedMulN = FlexEquipUtility.GetAdjStat(this.flexTool, 'walkSpeedMulN')
        DebugXL.logV('Combat', 'Beginning cooldown for ' + character.Name)
        GeneralWeaponUtility.cooldownWait(character, this.getCooldown(), walkSpeedMulN)
        DebugXL.logV('Combat', 'Cooldown finished for ' + character.Name)

        this._afterEffects()

        this.handle.GetChildren().forEach((child) => {
            if (child.IsA('Trail'))
                child.Enabled = false
        })
    }

    drawWeapon(character: Character) {
        // unsheath sound gets played on server
        const humanoid = character.FindFirstChild<Humanoid>('Humanoid')
        if (humanoid) {
            if (this.windUpAnim) {
                // we don't need to save this; we play the pose once and we're done. the attack animations also segue to the pose
                this.windUpAnimTrack = humanoid.LoadAnimation(this.windUpAnim)
                this.windUpAnimTrack.Looped = false
                this.windUpAnimTrack.Play()
                wait(this.windUpAnimTrack.Length * 0.9)
                this.windUpAnimTrack.AdjustSpeed(0)
            }
            const fullBodyAttackAnimNames = SkinTypes[this.baseData.skinType].fullBodyAttackAnimNames
            if (!fullBodyAttackAnimNames) {
                DebugXL.Error('Could not find fullBodyAttackAnimNames for ' + this.baseData.skinType)
            }
            for (let i = 0; i < fullBodyAttackAnimNames.size(); i++) {
                const attackAnim = AnimationManifestService.getAnimInstance(fullBodyAttackAnimNames[i])
                this.attackAnimTracks[i] = humanoid.LoadAnimation(attackAnim)
                this.attackAnimTracks[i].Looped = false
            }
            const upperBodyAttackAnimNames = SkinTypes[this.baseData.skinType].upperBodyAttackAnimNames
            for (let i = 0; i < upperBodyAttackAnimNames.size(); i++) {
                const attackUpperBodyAnim = AnimationManifestService.getAnimInstance(upperBodyAttackAnimNames[i]!)
                this.attackUpperBodyAnimTracks[i] = humanoid.LoadAnimation(attackUpperBodyAnim)
                this.attackUpperBodyAnimTracks[i].Looped = false
            }
        }
    }

    sheatheWeapon() {
        if (this.windUpAnimTrack)
            this.windUpAnimTrack.Stop()
    }

    mobActivate(target: Character) {
        DebugXL.Assert(RunService.IsServer())
        this._mobActivate(target)
    }

    protected _mobAimAtTarget(character: Character, target: Character) {
        const humanoid = character.FindFirstChildOfClass('Humanoid')
        if (humanoid) {
            const targetVec = target.GetPrimaryPartCFrame().p.sub(character.GetPrimaryPartCFrame().p)
            const moveVec = new Vector3(targetVec.X, 0, targetVec.Z)
            humanoid.Move(moveVec.Unit)
            wait()
            wait()
            humanoid.Move(new Vector3(0, 0, 0))
        }
    }

    protected abstract _mobActivate(target: Character): void

    protected abstract _aimAtTarget(character: Character, target?: Character): void // returns whether found a target to aim at

    _delayedEffects(delaySeconds: number) { }
    _afterEffects() { }
    _playAlternateAttackAnimation() { }
}
