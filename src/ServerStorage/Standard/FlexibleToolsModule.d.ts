import { CreateToolParamsI } from "ServerStorage/TS/CreateToolParamsI"

import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { CharacterRecordI } from "ReplicatedStorage/TS/CharacterRecord"

declare class FlexibleToolsClass
{
    GetFlexToolFromInstance( toolObj: Tool ): FlexTool
    CreateTool( params: CreateToolParamsI ): Tool
    GetAdjFlexToolStat( flexTool: FlexTool, statName: string ): number
    ResolveFlexToolEffects( attackingCharacterRecord: CharacterRecordI, flexTool: FlexTool, humanoid: Humanoid, tool: Tool ): void
    GetToolRangeN( toolObj: Tool ): number
    GetCooldownN( toolObj: Tool ): number
    GetManaCostN( toolObj: Tool ): number
}

declare let FlexibleTools: FlexibleToolsClass

export = FlexibleTools

