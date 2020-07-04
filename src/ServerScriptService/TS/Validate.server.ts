
// This file is part of Dungeon Life. See https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md for license details.

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI("Executed", script.Name)

import { ReplicatedStorage, ServerStorage } from "@rbxts/services";

let toolsFolder = ServerStorage.WaitForChild("Tools")

toolsFolder.GetChildren().forEach( ( tool )=>
{
    tool.GetDescendants().forEach( (child)=>
    {
        if( child.IsA("BasePart") )
        {
            if( child.CanCollide )
            {
                DebugXL.Error( child.GetFullName() + " CanCollide true" )
            }
        }
    })
})

// validate correct servers - sometimes their Team value just disappears
let furniture = ReplicatedStorage.WaitForChild('Shared Instances').WaitForChild('Placement Storage').GetChildren()
let spawners = furniture.filter( ( inst ) => inst.FindFirstChild('MonsterSpawn')!==undefined )

for( let spawner of spawners )
{
    let TeamValueInst = spawner.FindFirstChild('MonsterSpawn')!.FindFirstChild('Team') as ObjectValue
    if( !TeamValueInst || TeamValueInst.Value === undefined )
    {
        DebugXL.Error( 'Custom spawn missing team: ' + spawner.GetFullName() );
    }
}
