
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

//
//  "Gear" includes both Tools and Armor and I'm not sure what else
//

import { Teams } from '@rbxts/services';

import { ActiveSkinSetI } from 'ReplicatedStorage/TS/SkinTypes';

import * as Inventory from 'ServerStorage/Standard/InventoryModule'

import { CreateToolParamsI } from './CreateToolParamsI'
import { FlexibleToolsServer } from './FlexibleToolsServer'


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
