import { CreateToolParamsI } from "ServerStorage/TS/CreateToolParamsI"

import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"

declare class FlexibleToolsClass
{
    AddRandomEnhancements( flexTool: FlexTool, boostB: boolean ): void
    GetFlexToolFromInstance( toolObj: Tool ): FlexTool
    GetFlexToolFromId( toolId: number ): FlexTool
    CreateTool( params: CreateToolParamsI ): Tool
    GetAdjFlexToolStat( flexTool: FlexTool, statName: string ): number
    ResolveFlexToolEffects( flexTool: FlexTool, humanoid: Humanoid, attackingPlayer: Player ): void
    GetToolRangeN( toolObj: Tool ): number
    GetCooldownN( toolObj: Tool ): number
    GetManaCostN( toolObj: Tool ): number
}

declare let FlexibleTools: FlexibleToolsClass

export = FlexibleTools

