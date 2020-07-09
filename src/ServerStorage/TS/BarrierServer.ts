
// Copyright (c) Happion Laboratories - see license at https.//github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.Name)

import * as  CharacterI from "ServerStorage/Standard/CharacterI"

import { ServerStorage, Debris, Players, Teams } from '@rbxts/services'
import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'

type Character = Model

export namespace BarrierServer {

    const barrierFolder = ServerStorage.WaitForChild<Folder>("CharacterFX").WaitForChild<Folder>("Barrier")

    const fire = barrierFolder.WaitForChild<BasePart>("BarrierSegment").Clone()

    const enabled = true

    export function onTouched(part: BasePart, attackingCharacter: Character, flexTool: FlexTool, burntStuff: Map<Instance, boolean>) {
        const partParent = part.Parent as Character
        if (partParent) {
            if (partParent.FindFirstChild("Humanoid")) {
                if (!burntStuff.has(partParent)) {
                    const attackingPlayer = Players.GetPlayerFromCharacter( attackingCharacter )
                    const attackingTeam = attackingPlayer ? attackingPlayer.Team! : Teams.FindFirstChild<Team>("Monsters")!
                    CharacterI.TakeFlexToolDamage(partParent, attackingCharacter, attackingTeam, flexTool)
                    burntStuff.set(partParent, true)
                }
            }
        }
    }

    function RingWait(v: Vector3, duration: number, attackingCharacter: Character, flexTool: FlexTool) {
        const numOfFire = 16
        const increment = (math.pi * 2) / numOfFire

        const torsoNormal = new Vector3(0, 0, 1)
        const denom = math.abs(torsoNormal.X) + math.abs(torsoNormal.Z)
        const posX = 15 * (torsoNormal.X / denom)
        const posZ = 15 * (torsoNormal.Z / denom)

        let posIterator = new Vector3(v.X + posX, v.Y, v.Z + posZ)  // yuck
        const burntStuff = new Map<Instance, boolean>()
        for (let i = 1; i <= numOfFire; i++) {

            const fiery = fire.Clone()
            fiery.Size = new Vector3(5.5, fiery.Size.Y + 7, fiery.Size.Z)
            fiery.CFrame = new CFrame(posIterator, v)
            fiery.Parent = game.Workspace
            if (i === 1) {
                // play just one of the sounds
                fiery.WaitForChild<Sound>("FireSound").Play()
            }
            fiery.Touched.Connect((part) => { onTouched(part, attackingCharacter, flexTool, burntStuff) })

            Debris.AddItem(fiery, duration)

            const angle = increment * i
            posIterator = new Vector3(((posIterator.X - v.X) * math.cos(angle)) - ((posIterator.Z - v.Z) * math.sin(angle)) + v.X,
                posIterator.Y,
                ((posIterator.X - v.X) * math.sin(angle)) + ((posIterator.Z - v.Z) * math.cos(angle)) + v.Z)
        }
    }

    export function ActivateWait(character: Character, duration: number, flexTool: FlexTool) {
        const humanoid = character.FindFirstChild<Humanoid>("Humanoid")
        if (!humanoid) {
            return
        }

        const torso = character.FindFirstChild<BasePart>("HumanoidRootPart")
        if (!torso) {
            return
        }

        const fireRingAnim = humanoid.LoadAnimation(barrierFolder.WaitForChild<Animation>("firering"))
        fireRingAnim.Play()

        const spin = new Instance("BodyAngularVelocity")
        spin.AngularVelocity = new Vector3(0, 10, 0)
        spin.P = 1000000
        spin.MaxTorque = new Vector3(0, spin.P, 0)
        spin.Parent = torso

        Debris.AddItem(spin, 1.1)
        RingWait(torso.Position, duration, character, flexTool)
    }
}
