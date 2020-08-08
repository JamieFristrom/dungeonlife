
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { ContextActionService, Workspace, Players, RunService, Teams } from "@rbxts/services";

import * as FlexEquipUtility from "ReplicatedStorage/Standard/FlexEquipUtility"

import * as CharacterClientI from "ReplicatedStorage/Standard/CharacterClientI"

import * as InventoryClient from "ReplicatedStorage/Standard/InventoryClientStd"

import { HotbarSlot } from "ReplicatedStorage/TS/FlexToolTS"
import { FlexToolClient } from "ReplicatedStorage/TS/FlexToolClient"

import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"

import { Localize } from "ReplicatedStorage/TS/Localize"
import { PCClient } from "ReplicatedStorage/TS/PCClient"

let hotbar = script.Parent!.Parent!.WaitForChild("Hotbar")

let hotbarRE = Workspace.WaitForChild('Signals')!.WaitForChild('HotbarRE') as RemoteEvent

let localPlayer = Players.LocalPlayer!
let playerGui = localPlayer.WaitForChild('PlayerGui')

// use 0 for none
function SelectSlot(slotN: number) {
    for (let i = 1; i <= HotbarSlot.Max; i++) {
        let inst = hotbar.FindFirstChild("Item" + i) as Frame
        let border = inst.WaitForChild('SelectedBorder') as ImageLabel
        border.Visible = i === slotN
    }
}


function WhatSlotCurrentlyEquipped() {
    let character = localPlayer.Character
    if (character) {
        let heldTool = character.FindFirstChildWhichIsA("Tool") as Tool
        if (heldTool) {
            let inventorySlotValueObj = heldTool.FindFirstChild<StringValue>("PossessionKey")
            if (inventorySlotValueObj) {
                let possessionKey = inventorySlotValueObj.Value
                if (PCClient.pc) {
                    let slot = PCClient.pc.getSlotFromPossessionKey(possessionKey)
                    if (slot) return slot
                }
            }
        }
    }
    return 0
}



for (let i: HotbarSlot = 1; i <= HotbarSlot.Max; i++) {
    let hotbarItem = hotbar.WaitForChild("Item" + i)
    let hotbarButton = hotbarItem.WaitForChild('Button') as TextButton
    let slot = i  // otherwise upvalue confused
    hotbarButton.MouseButton1Click.Connect(function () {
        if (PCClient.pc) {
            let itemDatum = CharacterClientI.GetPossessionFromSlot(PCClient.pc, slot)
            if (itemDatum) {
                PCClient.equip(slot)
            }
        }
        else {
            DebugXL.Error("Hotbar available for nonexistent pc")
        }
    })
}


function HotbarRefresh(pc: CharacterRecord) {
    print("Refreshing hotbar")
    let allActiveSkins = InventoryClient.inventory.activeSkinsT
    let activeSkinsT = localPlayer.Team === Teams.WaitForChild('Heroes') ? allActiveSkins.hero : allActiveSkins.monster
    for (let i = 1; i <= HotbarSlot.Max; i++) {
        let itemDatum = CharacterClientI.GetPossessionFromSlot(pc, i)
        let newItem = hotbar.WaitForChild("Item" + i) as Frame
        if (itemDatum) {
            let title = newItem.WaitForChild('Title') as TextLabel
            title.Text = FlexToolClient.getShortName(itemDatum)
            title.Visible = true
            let level = newItem.WaitForChild('Level') as TextLabel
            level.Text = Localize.formatByKey("Lvl", [math.floor(itemDatum.getActualLevel())])
            level.Visible = true
            let hotkey = newItem.WaitForChild('Hotkey') as TextLabel
            hotkey.Text = tostring(i)
            let background = newItem.WaitForChild('Background') as ImageLabel
            background.ImageColor3 = FlexEquipUtility.GetRarityColor3(itemDatum)
            background.Visible = true
            let imageLabel = newItem.WaitForChild('ImageLabel') as ImageLabel
            imageLabel.Image = FlexEquipUtility.GetImageId(itemDatum, activeSkinsT)
            imageLabel.Visible = true

            newItem.Visible = true
        }
        else {
            newItem.Visible = false
        }
    }
}


PCClient.pcUpdatedConnect(HotbarRefresh)

//-- in case skins change this lets us update icons
InventoryClient.InventoryUpdatedConnect(() => {
    if (PCClient.pc)
        HotbarRefresh(PCClient.pc)
})

print("Hotbar Inventory connected")


let equipKeyCodes =
    [
        [Enum.KeyCode.DPadUp, Enum.KeyCode.One, Enum.KeyCode.KeypadOne],
        [Enum.KeyCode.DPadRight, Enum.KeyCode.Two, Enum.KeyCode.KeypadTwo],
        [Enum.KeyCode.DPadDown, Enum.KeyCode.Three, Enum.KeyCode.KeypadThree],
        [Enum.KeyCode.DPadLeft, Enum.KeyCode.Four, Enum.KeyCode.KeypadFour],
    ]

// I believe it is fine that this is called every time your character is reset, because new action binds overwrite the old.
for (let i = 0; i < HotbarSlot.Max; i++) {
    let slot = i + 1  // necessary to put this in a variable because i will be incremented outside of the closure
    //     ContextActionService.BindAction( "equip"+i, 
    //         ( actionName: string, inputState: Enum.UserInputState ) => { if( inputState === Enum.UserInputState.Begin ) Equip(slot) },
    //         false, ...equipKeyCodes[i-1] )
    // }
    ContextActionService.BindActionAtPriority("equip" + i, (actionName: string, inputState: Enum.UserInputState) => {
        if (inputState === Enum.UserInputState.Begin) {
            PCClient.equip(slot)
        }
    },
        false, 3000, ...equipKeyCodes[i])
}

RunService.RenderStepped.Connect(function () {
    if (PCClient.pc) {
        for (let i: HotbarSlot = 1; i <= HotbarSlot.Max; i++) {
            // get tool for hotbar slot
            let hotbarItem = hotbar.WaitForChild("Item" + i) as Frame
            if (hotbarItem.Visible) {
                let cooldownCover = hotbarItem.WaitForChild('CooldownCover') as ImageLabel
                cooldownCover.Visible = true
                let cooldownReadout = hotbarItem.WaitForChild('CooldownReadout') as TextLabel
                let possessionKey = PCClient.pc.getPossessionKeyFromSlot(i)
                let cooldownPct = 0
                let cooldownSecs = 0
                if (possessionKey) {
                    let flexToolInst = PCClient.pc.getFlexTool(possessionKey)
                    if (flexToolInst)  // possible you've thrown out the tool and the hotbar is late on updating
                    {
                        if (flexToolInst.getUseType() === "power") {
                            cooldownPct = flexToolInst.powerCooldownPctRemaining(localPlayer)
                            cooldownSecs = flexToolInst.powerCooldownTimeRemaining(localPlayer)
                        }
                    }
                }
                cooldownCover.Size = new UDim2(1, 0, cooldownPct, 0)
                //cooldown
                cooldownReadout.Text = cooldownSecs > 0 ? math.ceil(cooldownSecs) + " s" : ""
            }
        }
        SelectSlot(WhatSlotCurrentlyEquipped())
    }
})


