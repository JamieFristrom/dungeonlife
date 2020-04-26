import { Workspace, Players, Teams, ContextActionService } from '@rbxts/services'

import * as CharacterClientI from 'ReplicatedStorage/Standard/CharacterClientI'

import * as HeroUtility from 'ReplicatedStorage/Standard/HeroUtility'

import { PCClient } from 'ReplicatedStorage/TS/PCClient'
import { Hero } from 'ReplicatedStorage/TS/HeroTS'

import { ToolData } from 'ReplicatedStorage/TS/ToolDataTS'
import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'

const possessionsGui = script.Parent!.Parent!
const playerGui = possessionsGui.Parent! as PlayerGui
const hotbarItemsButton = script.Parent!.Parent!.WaitForChild('Hotbar')!.WaitForChild<TextButton>('Items')
const uiArrow = hotbarItemsButton.WaitForChild<ImageButton>('UIArrow')

hotbarItemsButton.Visible = false

const skinGui = playerGui.WaitForChild<ScreenGui>('SkinGui')
const storeGui = playerGui.WaitForChild<ScreenGui>('StoreGui')

const possessionsFrame = possessionsGui.WaitForChild<Frame>('PossessionsFrame')

function ToggleInventoryFrame() {
	skinGui.FindFirstChild<Frame>('Main')!.Visible = false
	storeGui.FindFirstChild<Frame>('Main')!.Visible = false
	possessionsFrame.Visible =
		!possessionsFrame.Visible && (Players.LocalPlayer.Team === Teams.FindFirstChild<Team>('Heroes'))
}


hotbarItemsButton.MouseButton1Click.Connect(() => {
	ToggleInventoryFrame()
})


const hotKeyCode = Enum.KeyCode.G

// hotbarItemsButton.Changed.Connect((property: string) => {
// 	if (property === "Visible") {
// 		if (hotbarItemsButton.Visible) {
// 			ContextActionService.BindAction("ToggleInventoryFrame",
// 				(actionName, inputState, inputObj) => {
// 					if (inputState == Enum.UserInputState.Begin) {
// 						print("ToggleInventoryFrame")
// 						ToggleInventoryFrame()
// 					}
// 				},
// 				false,
// 				hotKeyCode,
// 				Enum.KeyCode.ButtonY)
// 		}
// 		else {
// 			ContextActionService.UnbindAction("ToggleInventoryFrame")
// 		}
// 	}
// })

// when I ported to typescript suddenly 'Changed' event was inaccessible so doing the visibility check at runtime
ContextActionService.BindAction("ToggleInventoryFrame",
	(actionName, inputState, inputObj) => {
		if (inputState === Enum.UserInputState.Begin) {
			if( hotbarItemsButton.Visible ) {
				print("ToggleInventoryFrame")
				ToggleInventoryFrame()
			}
		}
	},
	false,
	hotKeyCode,
	Enum.KeyCode.ButtonY)



while (true) {
	wait(0.1)
	hotbarItemsButton.Visible = Players.LocalPlayer.Team === Teams.FindFirstChild<Team>('Heroes')
	uiArrow.Visible = false
	if (hotbarItemsButton.Visible) {
		const pcRecord = PCClient.pc
		if (pcRecord) {
			if (pcRecord instanceof Hero) {
				if (!possessionsFrame.Visible) {
					// if you have unassigned gear you can use and an empty slot show how to assign it
					let hotBarFull = true
					for (let i = 1; i <= 4; i++) {
						if (!pcRecord.gearPool.getFromSlot(i)[0]) {
							hotBarFull = false
							break
						}
					}

					if (!hotBarFull) {
						pcRecord.gearPool.forEach((item: FlexTool) => {
							if (!CharacterClientI.GetPossessionSlot(pcRecord, item)) {
								if (ToolData.dataT[item.baseDataS].useTypeS === "held" || ToolData.dataT[item.baseDataS].useTypeS === "power") {
									if (HeroUtility.CanUseGear(pcRecord, item)) {
										uiArrow.Visible = true
									}
								}
							}
						})
					}

					if (uiArrow.Visible) {
						// not tutorializing weapons. what about armor?
						for (const slot of Object.keys(ToolData.EquipSlotEnum) ) {
							const equipInSlot = pcRecord.gearPool.getFromEquipSlot(slot as ToolData.EquipSlotEnum)[1]
							if (!equipInSlot) {
								const usableArmorCount = pcRecord.gearPool.countIf((item: FlexTool) => {
									return ToolData.dataT[item.baseDataS].equipSlot === slot &&
										HeroUtility.CanUseGear(pcRecord, item)
								})
								if (usableArmorCount >= 1) {
									uiArrow.Visible = true
								}
							}
						}
					}
				}
			}
		}
	}
}
