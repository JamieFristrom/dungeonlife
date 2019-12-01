import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { ActiveSkinSetI } from "ReplicatedStorage/TS/SkinTypes";

declare interface CreateToolParamsI
{
    toolInstanceDatumT: FlexTool
    destinationPlayer: Player
    activeSkinsT: ActiveSkinSetI
    possessionsKey: string
}

declare class FlexibleToolsClass
{
    GetToolInst( toolObj: Tool ) : FlexTool
    GetToolInstFromId( toolId: number ) : FlexTool
    CreateTool( params: CreateToolParamsI ) : Tool
    GetAdjFlexToolStat( flexTool: FlexTool, statName: string ) : number
    ResolveFlexToolEffects( flexTool: FlexTool, humanoid: Humanoid, attackingPlayer: Player ): void
}

declare let FlexibleTools: FlexibleToolsClass

export = FlexibleTools