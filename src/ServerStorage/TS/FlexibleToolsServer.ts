
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { ServerStorage, Players } from '@rbxts/services';

import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'
import { ToolData } from 'ReplicatedStorage/TS/ToolDataTS';
DebugXL.logD(LogArea.Requires, 'FlexibleToolServer: ReplicatedStorage/TS imports succesful')

import { CreateToolParamsI } from 'ServerStorage/TS/CreateToolParamsI'
import { PlayerServer, PlayerTracker } from './PlayerServer';
import FlexibleTools from 'ServerStorage/Standard/FlexibleToolsModule';
import { Monster } from 'ReplicatedStorage/TS/Monster';
import { Hero } from 'ReplicatedStorage/TS/HeroTS';

DebugXL.logD(LogArea.Requires, 'FlexibleToolServer: imports succesful')


// thinking about things which can hold weapons
// thinking about characters which can be cpu or player controlled
// currently, players hold weapons
// what about the shop? how does that work?
// heroes have shops
const ToolsFolder = (ServerStorage.WaitForChild("Tools") as Folder)

type Character = Model

export interface FlexToolAccessor {
    flexToolInst: FlexTool,
    character: Character,            // this is what we need to broaden to include CPU players
    possessionsKey: string     // which tool in player's inventory it is
}


export namespace FlexibleToolsServer {
    let mobToolCache: Folder = (ServerStorage.FindFirstChild('MobToolCache') as Folder|undefined)!
    DebugXL.Assert(mobToolCache !== undefined)

    export let serverToolDataT = new Map<Tool, FlexToolAccessor>()

    export function setFlexToolInst(tool: Tool, fta: FlexToolAccessor) {
        serverToolDataT.set(tool, fta)
    }

    export function getFlexTool(tool: Tool) {
        const fta = serverToolDataT.get(tool)
        if (!fta) {
            DebugXL.Error("Couldn't find flexTool for " + tool.GetFullName())
            return FlexTool.nullTool
        }
        return fta.flexToolInst
    }

    export function getCharacter(tool: Tool) {
        const fta = serverToolDataT.get(tool)
        if (!fta) {
            DebugXL.Error("Couldn't find flexTool for " + tool.GetFullName())
            return FlexTool.nullTool
        }
        return fta.character
    }

    export function getToolBaseData(tool: Tool) {
        const flexTool = getFlexTool(tool)
        return getFlexToolBaseData(flexTool)
    }

    export function getFlexToolBaseData(flexTool: FlexTool) {
        return ToolData.dataT[flexTool.baseDataS]
    }

    export function createTool(params: CreateToolParamsI) {
        const flexTool = params.toolInstanceDatumT
        const toolInstance = flexTool.createToolInstance(params.activeSkinsT, params.possessionsKey)
        if (!toolInstance) {
            return undefined
        }
        const destinationCharacter = params.destinationCharacter

        // validate parameters so calling from Lua is safer
        DebugXL.Assert(destinationCharacter.IsA('Model'))

        DebugXL.logI(LogArea.Items, `Creating ${flexTool.baseDataS} for ${destinationCharacter.Name}`)

        FlexibleToolsServer.setFlexToolInst(toolInstance, { flexToolInst: flexTool, character: destinationCharacter, possessionsKey: params.possessionsKey })

        const destinationPlayer = Players.GetPlayerFromCharacter(destinationCharacter)
        if (destinationPlayer) {
            // we're using Roblox's backpack as a holding space for tools to combat lag; if we equip a weapon that exists on
            // the server
            toolInstance.Parent = (destinationPlayer.FindFirstChild('Backpack') as Backpack|undefined)
        }

        return toolInstance
    }

    export function removeToolWait(tool: Tool, character: Character) {
        const fta = serverToolDataT.get(tool)
        if (!fta) {
            DebugXL.Error("Couldn't find flexTool to remove:" + tool.GetFullName())
        }
        else {
            const characterRecord = PlayerServer.getCharacterRecordFromCharacter(fta.character)
            DebugXL.Assert(characterRecord !== undefined)
            if (characterRecord) {
                characterRecord.removeTool(fta.possessionsKey)
            }
        }
        tool.Destroy()
    }

    // check tool usability and put away if illegal. overkills - puts away any tools whether it's the one we're checking or not
    export function recheckRequirements(playerTracker: PlayerTracker, flexTool: FlexTool, player?: Player) {
        DebugXL.Assert(playerTracker instanceof PlayerTracker)
        DebugXL.Assert(flexTool instanceof FlexTool)
        DebugXL.Assert(!player || player.IsA("Player"))
        if (!player) {
            return true
        }

        const pcData = playerTracker.getCharacterRecordFromPlayer(player)
        if (pcData instanceof Monster) {
            return true
        }
        else if (pcData instanceof Hero) {
            if (pcData.canUseGear(flexTool)) {
                return true
            }
        }

        // can't use gear
        const humanoid = (player.Character!.FindFirstChild("Humanoid") as Humanoid|undefined)

        // not sure we need this now that we have custom inventory, but seems like it might stop hax0rs
        delay(0.1, () => { if (humanoid) { humanoid.UnequipTools() } })
        return false
    }
}

