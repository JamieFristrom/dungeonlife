import { RunService, CollectionService, Workspace } from "@rbxts/services";

let buildingFolder = Workspace.WaitForChild<Folder>("Building")

buildingFolder.ChildAdded.Connect( (thing)=>
{
    if( thing.Name === "SpawnNecromancer" || thing.Name === "SpawnDaemonSuper" )
    {
        let rotatingBit = thing.WaitForChild<Model>("RotatingBit")
        while (!rotatingBit.PrimaryPart) wait()
        let startCFrame = rotatingBit.GetPrimaryPartCFrame()
        let connection = RunService.RenderStepped.Connect( ()=>
        {
            if( !rotatingBit.Parent || !rotatingBit.PrimaryPart ) 
            {
                connection.Disconnect()
            }
            else
            {
                let rads = tick() / 4
                rotatingBit.SetPrimaryPartCFrame( startCFrame.mul( CFrame.fromEulerAnglesYXZ( 0, rads % (math.pi * 2 ), 0 ) ) )
            }
        })    
    }
})

/*
RunService.RenderStepped.Connect( ()=>
{
    CollectionService.GetTagged( "SpawnNecromancer" ).forEach( ( thing )=>
    {
        let rads = tick() / 4
        // stuff might not have replicated right away, have to check everything
        let rotatingBit = thing.FindFirstChild<Model>("RotatingBit")
        if( rotatingBit )
        {
            if( rotatingBit.PrimaryPart )
            {
                let rotatingStart = thing.FindFirstChild<Model>("RotatingStart")
                if( rotatingStart )
                {
                    if( rotatingStart.PrimaryPart )
                    {
                        let startCFrame = rotatingStart.GetPrimaryPartCFrame()
                        rotatingBit.SetPrimaryPartCFrame( startCFrame.mul( CFrame.fromEulerAnglesYXZ( 0, rads % (math.pi * 2 ), 0 ) ) )
                    }
                }
            }
        }
    })
})
*/