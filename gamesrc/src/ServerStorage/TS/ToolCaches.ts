
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Teams, ServerStorage } from "@rbxts/services"

import { CharacterKey, CharacterRecord, CharacterRecordI } from "ReplicatedStorage/TS/CharacterRecord"
import { HotbarSlot } from 'ReplicatedStorage/TS/FlexToolTS'
import { SkinTypeEnum, ActiveSkinSetI } from "ReplicatedStorage/TS/SkinTypes"

import * as InstanceXL from "ReplicatedStorage/Standard/InstanceXL"
import * as FlexibleTools from "ServerStorage/Standard/FlexibleToolsModule"
import { PlayerTracker } from "./PlayerServer"

type Character = Model

export namespace ToolCaches {
    const mobToolCache: Folder = (ServerStorage.FindFirstChild('MobToolCache') as Folder | undefined)!
    DebugXL.Assert(mobToolCache !== undefined)

    export function updateToolCache(
        playerTracker: PlayerTracker,
        characterKey: CharacterKey,
        characterRecord: CharacterRecordI,
        activeSkins: ActiveSkinSetI = new Map<SkinTypeEnum, string>()) {

        DebugXL.logD(LogArea.Items, `Updating ToolCache for characterKey: ${characterKey}`)
        DebugXL.Assert(typeOf(characterKey) === 'number')
        DebugXL.Assert(characterKey !== 0)
        const player = playerTracker.getPlayer(characterKey)
        if (!player) {
            return  // I guess later I decided that mobs don't need to keep tools in a cache because they don't currently switch
        }

        const characterModel = playerTracker.getCharacterModel(characterKey)
        DebugXL.Assert(characterModel !== undefined) // character should be instantiated if we're building its cache
        if (characterModel) {
            for (let i: HotbarSlot = 1; i <= HotbarSlot.Max; i++) {
                const possessionKey = characterRecord.getPossessionKeyFromSlot(i)
                if (possessionKey !== undefined) {
                    const flexTool = characterRecord.getFlexTool(possessionKey)!
                    // if (!flexTool.getUseType) {
                    //     DebugXL.Error(`flexTool ${flexTool.baseDataS} likely missing metatable`)
                    //     continue
                    // }
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
            const heldTool = characterModel.FindFirstChildWhichIsA("Tool") as Tool
            if (heldTool !== undefined) {
                const possessionKey = CharacterRecord.getToolPossessionKey(heldTool)!
                const flexTool = characterRecord.getFlexTool(possessionKey)!
                if (!flexTool || flexTool.slotN === undefined) {
                    heldTool.Destroy()
                }
            }

            // garbage collection
            const toolCache = player ? (player.FindFirstChild('Backpack') as Folder | undefined)! : mobToolCache
            toolCache.GetChildren().forEach(function (inst: Instance) {
                const tool = inst as Tool
                const possessionKey = CharacterRecord.getToolPossessionKey(tool)!
                const flexTool = characterRecord.getFlexTool(possessionKey)
                if (!flexTool || flexTool.slotN === undefined)  // might have been thrown away
                {
                    tool.Destroy()
                }
            })

            if (player)
                publishPotions(player, characterRecord)
        }
        DebugXL.logD(LogArea.Items, `Finished updating ToolCache for characterKey: ${characterKey}`)
    }

    export function publishPotions(player: Player, characterRecord: CharacterRecordI) {
        const potions = characterRecord.countBaseDataQuantity('Healing')
        InstanceXL.CreateSingleton("NumberValue", { Name: "NumHealthPotions", Value: potions, Parent: player })
    }

    export function getToolCache(player: Player) {
        const toolCache = (player.FindFirstChild("Backpack") as Folder | undefined)!
        return toolCache
    }
}