import { Teams, ServerStorage } from "@rbxts/services"

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
import { CharacterKey, CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"

import * as CharacterClientI from "ReplicatedStorage/Standard/CharacterClientI"
import * as InstanceXL from "ReplicatedStorage/Standard/InstanceXL"
import * as Inventory from "ServerStorage/Standard/InventoryModule"
import * as FlexibleTools from "ServerStorage/Standard/FlexibleToolsModule"
import { PlayerServer } from "./PlayerServer"

type Character = Model

export namespace ToolCaches {
    let mobToolCache : Folder = ServerStorage.FindFirstChild<Folder>('MobToolCache')!
    DebugXL.Assert( mobToolCache !== undefined )


    export function updateToolCache(characterKey: CharacterKey, characterRecord: CharacterRecord) {
        DebugXL.logD('Items', `Updating ToolCache for characterKey: ${characterKey}`)
        DebugXL.Assert( typeOf(characterKey)==='number' )
        DebugXL.Assert( characterKey !== 0 )
        let player = PlayerServer.getPlayer(characterKey)

        let allActiveSkins = player ? Inventory.GetActiveSkinsWait(player) : { monster: {}, hero: {} }
        let activeSkins = characterRecord.getTeam() === Teams.FindFirstChild('Heroes') ? allActiveSkins.hero : allActiveSkins.monster

        let characterModel = PlayerServer.getCharacterModel(characterKey)
        DebugXL.Assert( characterModel !== undefined ) // character should be instantiated if we're building its cache
        if( characterModel )
        {
            for (let i = 1; i <= CharacterClientI.maxSlots; i++) {
                let possessionKey = characterRecord.getPossessionKeyFromSlot(i)
                if (possessionKey) {
                    let flexTool = characterRecord.getTool(possessionKey)!
                    if (flexTool.getUseType === undefined) {
                        DebugXL.Error(`flexTool ${flexTool.baseDataS} likely missing metatable`)
                        continue
                    }
                    if (flexTool.getUseType() === "held") {
                        let tool = CharacterRecord.getToolInstanceFromPossessionKey(characterModel, possessionKey)
                        if (!tool)
                            tool = FlexibleTools.CreateTool({
                                toolInstanceDatumT: flexTool,
                                destinationCharacter: characterModel,
                                activeSkinsT: activeSkins,
                                possessionsKey: possessionKey
                            })
                    }
                }
            }
            // remove any items that are no longer in hotbar; I could have just cleared your held tool and backpack first, but this
            // lets you hold things when you change your hotbar
            let heldTool = characterModel.FindFirstChildWhichIsA("Tool") as Tool
            if (heldTool) {
                let possessionKey = CharacterRecord.getToolPossessionKey(heldTool)!
                let flexTool = characterRecord.getTool(possessionKey)!
                if (!flexTool || !flexTool.slotN) {
                    heldTool.Destroy()
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
        DebugXL.logD('Items', `Finished updating ToolCache for characterKey: ${characterKey}`)
    }

    export function publishPotions(player: Player, characterRecord: CharacterRecord) {
        let potions = characterRecord.countBaseDataQuantity('Healing')
        InstanceXL.CreateSingleton("NumberValue", { Name: "NumHealthPotions", Value: potions, Parent: player })
    }
}