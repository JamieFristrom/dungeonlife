
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

//
//  "Gear" includes both Tools and Armor and I'm not sure what else
//

import { ServerStorage, Players, Teams, Workspace } from '@rbxts/services';

import { SkinTypes } from 'ReplicatedStorage/TS/SkinTypes'
import { ActiveSkinSetI, SkinTypeEnum } from 'ReplicatedStorage/TS/SkinTypes';

import * as FlexEquip from 'ServerStorage/Standard/FlexEquipModule'
import * as Inventory from 'ServerStorage/Standard/InventoryModule'

import { CreateToolParamsI } from './CreateToolParamsI'
import { FlexibleToolsServer } from './FlexibleToolsServer'

const SignalsFolder = Workspace.WaitForChild<Folder>("Signals")
const InventoryRE = SignalsFolder.WaitForChild<RemoteEvent>("InventoryRE")
const GearRE = SignalsFolder.WaitForChild<RemoteEvent>("GearRE")

export namespace GearServer {
    export function recreateTool(tool: Tool, toolParams: CreateToolParamsI) {
        if (tool.Parent && tool.Parent.IsA("Model")) {
            const humanoid = tool.Parent.FindFirstChild<Humanoid>("Humanoid")
            if (humanoid) {
                humanoid.UnequipTools()
            }
        }
        tool.Destroy()
        return FlexibleToolsServer.createTool(toolParams)
    }

    export function recreateToolIfNecessary(tool: Tool, player: Player, activeSkins: ActiveSkinSetI) {
        if (player.Character) {
            const flexToolAccessor = FlexibleToolsServer.serverToolDataT.get(tool)
            if (flexToolAccessor) {
                const toolBaseData = FlexibleToolsServer.getToolBaseData(tool)
                const toolSkinType = toolBaseData.skinType
                const activeSkin = activeSkins.get(toolSkinType) || toolBaseData.baseToolS
                if (activeSkin !== tool.Name) {
                    recreateTool(tool, {
                        toolInstanceDatumT: flexToolAccessor.flexToolInst,
                        destinationCharacter: player.Character,
                        activeSkinsT: activeSkins,
                        possessionsKey: flexToolAccessor.possessionsKey
                    })
                }
            }
        }
    }

    // this would have made more sense and had clearer dependencies as a member of ToolCaches
    export function reskinTools(player: Player) {
        // check if any of player's weapons need reskinning
        const allActiveSkins = Inventory.GetActiveSkinsWait(player)
        const skinOwner = player.Team === Teams.FindFirstChild<Team>("Heroes") ? "hero" : "monster"
        const activeSkins = allActiveSkins[skinOwner]
        const character = player.Character
        if (character) {
            const heldTool = character.FindFirstChildWhichIsA("Tool")
            if (heldTool) {
                recreateToolIfNecessary(heldTool, player, activeSkins)
            }

            for (let cachedTool of player.FindFirstChild<Folder>("Backpack")!.GetChildren()) {
                if (cachedTool.IsA("Tool")) {
                    recreateToolIfNecessary(cachedTool, player, activeSkins)
                }
            }
        }
    }
}

export namespace GearRemote {
    export function setActiveSkin(player: Player, skinOwner: string, toolSkinType: SkinTypeEnum, skinId: string) {
        const inventoryStore = Inventory.GetInventoryStoreWait(player)
        if (inventoryStore) {
            const inventory = inventoryStore.Get()
            if (inventory) {
                const skinSet = inventory.activeSkinsT[skinOwner]
                skinSet.set(toolSkinType, skinId)
                inventoryStore.Set(inventory)
                InventoryRE.FireClient(player, "Update", inventory)
                if (SkinTypes[toolSkinType].tagsT.worn) {
                    // has to come first otherwise you drop weapon
                    FlexEquip.ApplyEntireCostumeIfNecessaryWait(player)
                }
                GearServer.reskinTools(player)
            }
        }
    }
}

GearRE.OnServerEvent.Connect((player, ...args) => {
    const funcName = args[0] as string
    if (funcName === "setActiveSkin") {
        GearRemote.setActiveSkin(player, args[1] as string, args[2] as SkinTypeEnum, args[3] as string)
    }
    else {
        DebugXL.Error("Unknown FlexibleToolsRE function " + funcName)
    }
})