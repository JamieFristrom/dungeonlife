
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Teams, ServerStorage } from "@rbxts/services"

import { CharacterKey, CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { HotbarSlot } from 'ReplicatedStorage/TS/FlexToolTS'
import { SkinTypeEnum } from "ReplicatedStorage/TS/SkinTypes"

import * as InstanceXL from "ReplicatedStorage/Standard/InstanceXL"
import * as Inventory from "ServerStorage/Standard/InventoryModule"
import * as FlexibleTools from "ServerStorage/Standard/FlexibleToolsModule"
import { PlayerServer } from "./PlayerServer"

type Character = Model

export namespace ToolCaches {
    let mobToolCache: Folder = ServerStorage.FindFirstChild<Folder>('MobToolCache')!
    DebugXL.Assert(mobToolCache !== undefined)


    export function updateToolCache(characterKey: CharacterKey, characterRecord: CharacterRecord) {
        DebugXL.logD(LogArea.Items, `Updating ToolCache for characterKey: ${characterKey}`)
        DebugXL.Assert(typeOf(characterKey) === 'number')
        DebugXL.Assert(characterKey !== 0)
        let player = PlayerServer.getPlayer(characterKey)
        if (!player) {
            return  // I guess later I decided that mobs don't need to keep tools in a cache because they don't currently switch
        }

        let allActiveSkins = player ? Inventory.GetActiveSkinsWait(player) : { monster: new Map<SkinTypeEnum,string>(), hero: new Map<SkinTypeEnum,string>() }
        let activeSkins = characterRecord.getTeam() === Teams.FindFirstChild('Heroes') ? allActiveSkins.hero : allActiveSkins.monster

        let characterModel = PlayerServer.getCharacterModel(characterKey)
        DebugXL.Assert(characterModel !== undefined) // character should be instantiated if we're building its cache
        if (characterModel) {
            for (let i: HotbarSlot = 1; i <= HotbarSlot.Max; i++) {
                let possessionKey = characterRecord.getPossessionKeyFromSlot(i)
                if (possessionKey) {
                    let flexTool = characterRecord.getFlexTool(possessionKey)!
                    if (flexTool.getUseType === undefined) {
                        DebugXL.Error(`flexTool ${flexTool.baseDataS} likely missing metatable`)
                        continue
                    }
                    if (flexTool.getUseType() === "held") {
                        let tool = CharacterRecord.getToolInstanceFromPossessionKey(characterModel, characterRecord, possessionKey)
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
                let flexTool = characterRecord.getFlexTool(possessionKey)!
                if (!flexTool || !flexTool.slotN) {
                    heldTool.Destroy()
                }
            }

            // garbage collection
            let toolCache = player ? player.FindFirstChild<Folder>('Backpack')! : mobToolCache
            toolCache.GetChildren().forEach(function (inst: Instance) {
                let tool = inst as Tool
                let possessionKey = CharacterRecord.getToolPossessionKey(tool)!
                let flexTool = characterRecord.getFlexTool(possessionKey)
                if (!flexTool || !flexTool.slotN)  // might have been thrown away
                {
                    tool.Destroy()
                }
            })

            if (player)
                publishPotions(player, characterRecord)
        }
        DebugXL.logD(LogArea.Items, `Finished updating ToolCache for characterKey: ${characterKey}`)
    }

    export function publishPotions(player: Player, characterRecord: CharacterRecord) {
        let potions = characterRecord.countBaseDataQuantity('Healing')
        InstanceXL.CreateSingleton("NumberValue", { Name: "NumHealthPotions", Value: potions, Parent: player })
    }

    export function getToolCache( player: Player ) {
        const toolCache = player.FindFirstChild<Folder>("Backpack")!
        return toolCache
    }
}