print( script.Parent!.GetFullName() + " executed" )

import * as InputXL from "ReplicatedStorage/Standard/InputXL"

import * as InventoryClient from "ReplicatedStorage/Standard/InventoryClientStd"

import { QuestStatus, QuestUtility } from "ReplicatedStorage/TS/QuestUtility"

import { Players, GuiService, Teams, Workspace, StarterGui } from "@rbxts/services";
import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";

let main = (script.Parent!.Parent!.WaitForChild("Main") as Frame)
let mainHeader = (main.WaitForChild("MainHeader") as Frame)
let tabs = (main.WaitForChild("Tabs") as Frame)
let goldTab = (tabs.WaitForChild("Gold") as Frame)
let goldFrame = (mainHeader.WaitForChild("Gold") as Frame)
let blueprintTutorialArrow = (mainHeader.WaitForChild("Crates").WaitForChild("Blueprints").WaitForChild("UIArrow") as ImageLabel)
let codes = (mainHeader.WaitForChild("Codes") as Frame)
let codesInnerFrame = (codes.WaitForChild("InnerFrame") as Frame)
let codeTextBox = (codesInnerFrame.WaitForChild("Code") as TextBox)
let signals = (Workspace.WaitForChild("Signals") as Folder)
let inventoryRE = (signals.WaitForChild("InventoryRE") as RemoteEvent)

let localPlayer = Players.LocalPlayer! as Player

wait()  // it takes a frame for absolutesize of mainheader to be calculated

let playerGui = (localPlayer.WaitForChild("PlayerGui") as PlayerGui)
let audio = (playerGui.WaitForChild("Audio") as Folder)
let uiClick = (audio.WaitForChild("UIClick") as Sound)

let gridPixelSize = ( mainHeader.AbsoluteSize.Y < 200 && !GuiService.IsTenFootInterface()) ? mainHeader.AbsoluteSize.Y / 2.1 : mainHeader.AbsoluteSize.X / 8.3
gridPixelSize = math.max( 80, gridPixelSize )

mainHeader.GetChildren().forEach( function( child )
{
    let gridLayout = child.FindFirstChild("UIGridLayout") as UIGridLayout
    if( gridLayout )
        gridLayout.CellSize = new UDim2( 0, gridPixelSize, 0, gridPixelSize )
})

main.GetPropertyChangedSignal('Visible').Connect( ()=>
    {
        if( main.Visible )
        {
            if( InputXL.UsingGamepad())
                GuiService.SelectedObject = main.WaitForChild('Tabs')!.WaitForChild('Crates')!.WaitForChild('Button') as GuiButton 
        }
    } )

goldTab.Visible = false
goldFrame.Visible = false

localPlayer.GetPropertyChangedSignal("Team").Connect( function()
{
    let heroesTeam = Teams.FindFirstChild('Heroes')
    DebugXL.Assert( heroesTeam !== undefined )
    goldTab.Visible = localPlayer.Team===heroesTeam
    goldFrame.Visible = localPlayer.Team===heroesTeam
} )

// handle messages in code entry box
codeTextBox.FocusLost.Connect( (enterPressed: boolean)=>
{
    if( enterPressed )
    {
        inventoryRE.FireServer( 'SubmitCode', codeTextBox.Text )
        uiClick.Play()
    }
})

for(;;)
{
    wait(0.1)
    blueprintTutorialArrow.Visible = QuestUtility.getQuestStatus( InventoryClient.inventory, "TutorialBuyBlueprint" )===QuestStatus.Incomplete
}
