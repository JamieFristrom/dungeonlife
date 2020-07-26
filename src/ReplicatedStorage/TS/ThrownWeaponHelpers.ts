
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)

import * as InstanceXL from 'ReplicatedStorage/Standard/InstanceXL'

export namespace ThrownWeaponHelpers {
	const velocityK = 120

    function createThrownItem(projectileTemplate: BasePart, player: Player) {
		const thrownObj = projectileTemplate.Clone()
		thrownObj.CanCollide = true
		thrownObj.Transparency = 0
		for (let child of thrownObj.GetDescendants()) {
			if (child.IsA("BasePart")) {
				child.Transparency = 0
			}
		}

		InstanceXL.CreateSingleton("ObjectValue", { Name: "creator", Parent: thrownObj, Value: player })

		thrownObj.WaitForChild<Script>("LobbedServer").Disabled = false
		thrownObj.WaitForChild<Script>("LobbedClient").Disabled = false

		// wishlist; make it look like the bomb disappears from your hand
		return thrownObj
	}

    function computeLaunchAngle(dx: number, dy: number, grav: number) {
		// http://en.wikipedia.org/wiki/Trajectory_of_a_projectile
		const inRoot = (velocityK * velocityK * velocityK * velocityK) - (grav * ((grav * dx * dx) + (2 * dy * velocityK * velocityK)))

		if (inRoot <= 0) {
			DebugXL.logI(LogArea.Combat, "Computing out of range launch angle")
			return .25 * math.pi  // maximum distance you can throw, 45 degrees === pi/4
		}
		const root = math.sqrt(inRoot)
		const inATan1 = ((velocityK * velocityK) + root) / (grav * dx)
		const inATan2 = ((velocityK * velocityK) - root) / (grav * dx)
		const answer1 = math.atan(inATan1)
		const answer2 = math.atan(inATan2)
		return math.min(answer1, answer2)
	}

    export function lob(player: Player, projectileTemplate: BasePart, mouseHit: Vector3) {
		const character = player.Character
		if (character) {
			const rightHand = character.FindFirstChild<BasePart>("RightHand")
			if (rightHand) {
				const startPos = rightHand.Position
				const delta = mouseHit.sub(startPos)
				const flatDelta = new Vector3(delta.X, 0, delta.Z)
				const grav = game.Workspace.Gravity
				const theta = computeLaunchAngle(flatDelta.X, delta.Y, grav)
				const vy = math.sin(theta)
				const xz = math.cos(theta)
				const vx = flatDelta.Unit.X * xz
				const vz = flatDelta.Unit.Z * xz
				const missile = createThrownItem(projectileTemplate, player)
				missile.Name = player.Name + projectileTemplate.Name + "_Projectile"
				missile.Position = startPos
				missile.Velocity = (new Vector3(vx, vy, vz)).mul(velocityK)
				DebugXL.logD(LogArea.Combat, missile.GetFullName() + " launched")
				return missile
			}
		}
		DebugXL.logW(LogArea.Combat, player.Name + " couldn't throw")
    }
}