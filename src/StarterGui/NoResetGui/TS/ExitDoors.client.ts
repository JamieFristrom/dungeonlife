import { Workspace, Players, Teams } from "@rbxts/services";

let localPlayer = Players.LocalPlayer!

let exitGuiTemplate = script.Parent!.Parent!.WaitForChild<BillboardGui>("ExitGui")

for(;;)
{
    wait(0.25)
    if( localPlayer.Team === Teams.WaitForChild('Heroes') )
    {
        if( localPlayer.Character && localPlayer.Character.PrimaryPart )
        {
            let downStaircase = Workspace.WaitForChild('Environment').FindFirstChild<Model>("DownStaircase")
            if( downStaircase )
            {
                let primaryPart = downStaircase.PrimaryPart
                if( primaryPart )
                {
                    let exitGui = primaryPart.FindFirstChild<BillboardGui>("ExitGui")
                    if( !exitGui )
                    {
                        exitGui = exitGuiTemplate.Clone()
                        exitGui.Parent = primaryPart
                        exitGui.Enabled = true
                    }
                    let distance = localPlayer.Character.GetPrimaryPartCFrame().p.sub( primaryPart.Position ).Magnitude
                    exitGui.Enabled = distance < 30
                }
            }
        }
    }
}

