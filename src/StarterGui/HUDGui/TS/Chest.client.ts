import { Teams, Players, CollectionService, Workspace } from '@rbxts/services'

import * as InputXL from 'ReplicatedStorage/Standard/InputXL'
import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS';

import { ChestClientManager } from 'ReplicatedStorage/TS/ChestClient'  

ChestClientManager.run()

let heroesTeam = Teams.WaitForChild('Heroes')
let localPlayer = Players.LocalPlayer!
let chestGuiTemplate = script.Parent!.Parent!.WaitForChild('ChestGui')

function handleChestTooltip( chest: Model ) 
{
    if( chest.Parent === Workspace ) 
    {
        let origin = chest.FindFirstChild<Part>("Origin")
        DebugXL.Assert( origin !== undefined )
        if( origin ) 
        {
            let chestGui = origin.FindFirstChild<BillboardGui>("ChestGui")
            let lidOpen = chest.FindFirstChild("LidOpen") as BoolValue
            DebugXL.Assert( lidOpen !== undefined )
            if( !lidOpen || lidOpen.Value===true ) 
            {
                if( chestGui ) 
                {
                    chestGui.Parent = undefined  
                }
            }
            else 
            {
                if( !chestGui ) 
                {
                    chestGui = chestGuiTemplate.Clone() as BillboardGui
                    chestGui.Parent = origin
                }
                chestGui.FindFirstChild<GuiObject>('ButtonIcon')!.Visible = false
                let holdingTool = localPlayer.Character!.FindFirstChildWhichIsA("Tool")
                let distance = ( localPlayer.Character!.GetPrimaryPartCFrame().p.sub( origin.Position ) ).Magnitude
                if( distance < 20 ) 
                {
                    let instructions = chestGui.FindFirstChild<TextLabel>('Instructions')
                    DebugXL.Assert( instructions !== undefined )
                    if( instructions ) 
                    {
                        chestGui.Enabled = true
                        if( holdingTool ) 
                        {
                            instructions.Text = "Put away tool to open"
                        }
                        else 
                        {
                            if( distance > 10 ) 
                            {
                                instructions.Text = "Come closer to open"
                            }
                            else 
                            {
                                if( InputXL.UsingGamepad() ) 
                                {
                                    instructions.Text = ""
                                    chestGui.FindFirstChild<GuiObject>('ButtonIcon')!.Visible = true
                                }
                                else 
                                {
                                    instructions.Text = "Click to open"
                                }
                            }
                        }
                    }
                    else 
                    {
                        chestGui.Enabled = false
                    }
                }
            }
        }
    }
}

while( true )
{
    wait(0.25)
    if( localPlayer.Team === heroesTeam ) 
    {
        if( localPlayer.Character && localPlayer.Character.PrimaryPart ) 
        {
            CollectionService.GetTagged('Chest').forEach( (chest)=>{
                DebugXL.Assert( chest.IsA('Model') )
                if( chest.IsA('Model') )
                    handleChestTooltip(chest as Model) 
            } )
		}
	}
}
