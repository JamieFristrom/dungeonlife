
// This file is part of Dungeon Life. See https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md for license details.

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)

import { RunService, Workspace, Players } from '@rbxts/services'

import { GeneralWeaponUtility } from './GeneralWeaponUtility'

import RangedWeaponHelpers from 'ReplicatedStorage/Standard/RangedWeaponHelpers'

import { ThrownWeaponHelpers } from './ThrownWeaponHelpers'
import { BaseWeaponClient } from './BaseWeaponClient'
import { FlexToolClient } from './FlexToolClient'
import { RangedWeaponUtility } from './RangedWeaponUtility'

type Character = Model

const showMissileOnClient = false

export class ThrownWeaponClient extends BaseWeaponClient {
	//const thrown = true
	projectileTemplate: BasePart


	constructor(tool: Tool) {
        const flexTool = FlexToolClient.getFlexTool( tool )
        super(tool, new RangedWeaponUtility(tool, flexTool, "Handle"))
		tool.Equipped.Connect((mouse) => this.onEquippedLocal(mouse))
		this.projectileTemplate = (tool.WaitForChild("Handle") as BasePart)
	}

	onButton1Down(mouse: Mouse) {
		const toolParent = this.tool.Parent
		DebugXL.Assert(toolParent !== undefined)
		if (toolParent) {
			DebugXL.Assert(toolParent.IsA("Model"))
			const character = toolParent as Character
			if (GeneralWeaponUtility.isCoolingDown(character)) {
				return
			}
			const player = Players.GetPlayerFromCharacter(character)
			DebugXL.Assert(player !== undefined)
			if (player) {
				const [_, clickHit] = RangedWeaponHelpers.MouseHitNontransparent(mouse, [character])
				const bombRemoteEvent = (this.tool.WaitForChild("BombRemoteEvent") as RemoteEvent)
				bombRemoteEvent.FireServer("Activate", clickHit)								
				if (showMissileOnClient) {
					const missile = ThrownWeaponHelpers.lob(player, this.projectileTemplate, clickHit)
					if (missile)
						missile.Parent = Players.LocalPlayer.Character
				}
				this.projectileTemplate.Parent = undefined
			}
			GeneralWeaponUtility.cooldownWait(character, this.weaponUtility.getCooldown())  // wishlist - fix this if you want a lobbed with a walkspeed reduction
		}
	}

	onEquippedLocal(mouse: Mouse) {
		if (mouse === undefined) {
			DebugXL.logW(LogArea.Combat, "Mouse not found")
		}
		else {
			mouse.Button1Down.Connect(() => this.onButton1Down(mouse))
		}
	}

	_mobActivate(target: Character) {
		DebugXL.logE(LogArea.Combat, "Thrown weapons for mobs never implemented")
	}
}