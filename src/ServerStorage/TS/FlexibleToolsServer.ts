
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { ServerStorage, Players } from '@rbxts/services';

import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'
import { ToolData } from 'ReplicatedStorage/TS/ToolDataTS';
DebugXL.logD('Requires', 'FlexibleToolServer: ReplicatedStorage/TS imports succesful')

import { CreateToolParamsI } from 'ServerStorage/TS/CreateToolParamsI'

DebugXL.logD('Requires', 'FlexibleToolServer: imports succesful')


// thinking about things which can hold weapons
// thinking about characters which can be cpu or player controlled
// currently, players hold weapons
// what about the shop? how does that work?
// heroes have shops
const ToolsFolder = ServerStorage.WaitForChild<Folder>('Tools', 10)!
DebugXL.Assert(ToolsFolder !== undefined)

type Character = Model

export interface FlexToolAccessor {
    flexToolInst: FlexTool,
    character: Character,            // this is what we need to broaden to include CPU players
    possessionsKey: string     // which tool in player's inventory it is
}


export namespace FlexibleToolsServer {
    let mobToolCache: Folder = ServerStorage.FindFirstChild<Folder>('MobToolCache')!
    DebugXL.Assert(mobToolCache !== undefined)

    let serverToolDataT = new Map<Tool, FlexToolAccessor>()

    export function getFlexTool(toolObj: Tool) {
        const fta = serverToolDataT.get(toolObj)
        if (!fta) {
            DebugXL.Error("Couldn't find flexTool for " + toolObj.GetFullName())
            return FlexTool.nullTool
        }
        return fta.flexToolInst
    }

    export function getToolBaseData(toolObj: Tool) {
        const flexTool = getFlexTool(toolObj)
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

        DebugXL.logI(script.Name, `Creating ${flexTool.baseDataS} for ${destinationCharacter.Name}`)

        FlexibleToolsServer.setFlexToolInst(toolInstance, { flexToolInst: flexTool, character: destinationCharacter, possessionsKey: params.possessionsKey })

        const destinationPlayer = Players.GetPlayerFromCharacter(destinationCharacter)
        if (destinationPlayer) {
            // we're using Roblox's backpack as a holding space for tools to combat lag; if we equip a weapon that exists on
            // the server
            toolInstance.Parent = destinationPlayer.FindFirstChild<Backpack>('Backpack')
        }

        return toolInstance
    }
}