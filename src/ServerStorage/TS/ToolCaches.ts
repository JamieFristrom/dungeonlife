import { Players, Teams, ServerStorage } from "@rbxts/services"

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"

import * as CharacterClientI from "ReplicatedStorage/Standard/CharacterClientI"
import * as InstanceXL from "ReplicatedStorage/Standard/InstanceXL"
import * as Inventory from "ServerStorage/Standard/InventoryModule"
import * as FlexibleTools from "ServerStorage/Standard/FlexibleToolsModule"

type Character = Model

export namespace ToolCaches {
    let mobToolCache : Folder = ServerStorage.FindFirstChild<Folder>('MobToolCache')!
    DebugXL.Assert( mobToolCache !== undefined )


    export function updateToolCache(character: Character, characterRecord: CharacterRecord) {
        let player = Players.GetPlayerFromCharacter(character)

        let allActiveSkins = player ? Inventory.GetActiveSkinsWait(player) : { monster: {}, hero: {} }
        let activeSkins = characterRecord.getTeam() === Teams.FindFirstChild('Heroes') ? allActiveSkins.hero : allActiveSkins.monster

        for (let i = 1; i <= CharacterClientI.maxSlots; i++) {
            let possessionKey = characterRecord.getPossessionKeyFromSlot(i)
            if (possessionKey) {
                let flexTool = characterRecord.getTool(possessionKey)!
                if (flexTool.getUseType === undefined) {
                    DebugXL.Error(`flexTool ${flexTool.baseDataS} likely missing metatable`)
                    continue
                }
                if (flexTool.getUseType() === "held") {
                    let tool = CharacterRecord.getToolInstanceFromPossessionKey(character, possessionKey)
                    if (!tool)
                        tool = FlexibleTools.CreateTool({
                            toolInstanceDatumT: flexTool,
                            destinationCharacter: character,
                            activeSkinsT: activeSkins,
                            possessionsKey: possessionKey
                        })
                }
            }
        }
        // remove any items that are no longer in hotbar; I could have just cleared your held tool and backpack first, but this
        // lets you hold things when you change your hotbar
        if (character) {
            let heldTool = character.FindFirstChildWhichIsA("Tool") as Tool
            if (heldTool) {
                let possessionKey = CharacterRecord.getToolPossessionKey(heldTool)!
                let flexTool = characterRecord.getTool(possessionKey)!
                if (!flexTool || !flexTool.slotN) {
                    heldTool.Destroy()
                }
            }
        }
        let toolCache = player ? player.FindFirstChild<Folder>('Backpack')! : mobToolCache
        toolCache.GetChildren().forEach(function (inst: Instance) {
            let tool = inst as Tool
            let possessionKey = CharacterRecord.getToolPossessionKey(tool)!
            let flexTool = characterRecord.getTool(possessionKey)
            if (!flexTool || !flexTool.slotN)  // might have been thrown away
            {
                tool.Destroy()
            }
        })

        if( player )
            publishPotions(player, characterRecord)
    }

    export function publishPotions(player: Player, characterRecord: CharacterRecord) {
        let potions = characterRecord.countBaseDataQuantity('Healing')
        InstanceXL.CreateSingleton("NumberValue", { Name: "NumHealthPotions", Value: potions, Parent: player })
    }
}