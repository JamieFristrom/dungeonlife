import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"

declare namespace BoltWeaponUtility 
{
    function Fire( tool: Tool, boltTemplate: Instance, targetV3: Vector3, speed: number ): BasePart
    function Create( tool: Tool, messageFunc: ( key: string )=>void, flexTool: FlexTool, animName: string | undefined ): void
}

export = BoltWeaponUtility