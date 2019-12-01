import { CollectionService, ReplicatedStorage } from "@rbxts/services";
import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS";

// import { ServerStorage } from "@rbxts/services";

// import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"

// let tools = ServerStorage.Tools.GetChildren()

// tools.forEach( ( tool )=>
// {
//     tool.GetChildren().forEach( (child)=>
//     {
//         if( child.IsA("BasePart") )
//         {
//             if( child.CanCollide )
//             {
//                 DebugXL.Error( child.GetFullName() + " CanCollide true" )
//             }
//         }
//     })
// })

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
