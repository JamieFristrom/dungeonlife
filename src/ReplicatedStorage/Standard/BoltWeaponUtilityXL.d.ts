import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"

declare namespace BoltWeaponUtility 
{
    function Create( tool: Tool, messageFunc: ( key: string )=>void, flexTool: FlexTool ): void
}

export = BoltWeaponUtility