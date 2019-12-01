import * as FloorData from "ReplicatedStorage/Standard/FloorData"
import { Workspace, ServerStorage } from "@rbxts/services";

export namespace FixedFloorDecorations
{
    export function Setup()
    {
        Workspace.FindFirstChild('FixedFloorDecorations')!.ClearAllChildren()
        FloorData.CurrentFloor().fixedFloorDecorations.forEach( function( volFXName )
        {
            let volFXInst = ServerStorage.FindFirstChild('FixedFloorDecorations')!.FindFirstChild<Instance>(volFXName)!.Clone()
            volFXInst.Parent = Workspace.FindFirstChild('FixedFloorDecorations')
        } )
    }
}