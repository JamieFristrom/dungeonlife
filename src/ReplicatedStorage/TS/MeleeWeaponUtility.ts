
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI("Executed", script.GetFullName())

import { Players, Debris } from "@rbxts/services"

import * as MathXL from "ReplicatedStorage/Standard/MathXL"

import { BaseWeaponUtility } from "./BaseWeaponUtility"
import { FlexTool } from "./FlexToolTS"
import { ModelUtility } from "./ModelUtility"

type Character = Model

/**
    Code for the client side behavior of melee weapons.
    Anim names are references into the AnimationManifest
*/
export class MeleeWeaponUtility extends BaseWeaponUtility {
    hitSound: Sound
    hitVol: number
    hitSoundSpeed: number

    getRange(): number {
        const range = this.baseData.rangeN
        DebugXL.Assert(range !== undefined)
        return range ? range : 5
    }

    getCooldown(): number {
        const cooldown = this.baseData.cooldownN
        DebugXL.Assert(cooldown !== undefined)
        return cooldown ? cooldown : 1
    }

    constructor(tool: Tool, flexTool: FlexTool) {
        super(tool, flexTool)
        this.hitSound = this.handle.WaitForChild<Sound>("Hit")
        this.hitVol = this.hitSound.Volume
        this.hitSoundSpeed = this.hitSound.PlaybackSpeed
    }

    _aimAtTarget(character: Character, target?: Character) {
        if (target) {
            DebugXL.logD("Combat", target.Name + " in range")
            const primaryPart = target.PrimaryPart
            if (primaryPart) {
                const targetV3 = primaryPart.CFrame.p
                const player = Players.GetPlayerFromCharacter(character)
                if (player) {
                    const targetV3InMyPlane = new Vector3(targetV3.X, ModelUtility.getPrimaryPartCFrameSafe(character).p.Y, targetV3.Z)
                    const facingTargetCF = new CFrame(ModelUtility.getPrimaryPartCFrameSafe(character).p, targetV3InMyPlane)
                    character.SetPrimaryPartCFrame(facingTargetCF)
                }
                else {
                    this._mobAimAtTarget(character, target)
                }
            }
            else {
                DebugXL.logW("Combat", target.GetFullName() + " is missing PrimaryPart")
            }
        }
    }

    _playAlternateAttackAnimation() {
        DebugXL.logD("Combat", "Playing default slash animation")
        //              old default Roblox way to do this when our custom animation is missing
        const Animation = new Instance("StringValue")
        Animation.Name = "toolanim"
        Animation.Value = "Slash"
        Animation.Parent = this.tool
        Debris.AddItem(Animation, 2)
    }

    _delayedEffects(delaySeconds: number) {
        delay(delaySeconds, () => {
            this.hitSound.PlaybackSpeed = this.hitSoundSpeed * MathXL.RandomNumber(0.8, 1.2)
            this.hitSound.Volume = this.hitVol * MathXL.RandomNumber(0.7, 1.3)
            this.hitSound.Play()
        })
    }

    _mobActivate(target: Character) {
        this.tool.Activate()
    }
}
