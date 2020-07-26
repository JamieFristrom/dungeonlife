print( script.Parent!.GetFullName() + " executed" )

import * as InputXL from "ReplicatedStorage/Standard/InputXL"

import * as InventoryClient from "ReplicatedStorage/Standard/InventoryClientStd"

import { QuestStatus, QuestUtility } from "ReplicatedStorage/TS/QuestUtility"

import { Players, GuiService, Teams, Workspace, StarterGui } from "@rbxts/services";
import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";

let main = script.Parent!.Parent!.WaitForChild<Frame>("Main")
let mainHeader = main.WaitForChild<Frame>("MainHeader")
let tabs = main.WaitForChild<Frame>("Tabs")
let goldTab = tabs.WaitForChild<Frame>("Gold")
let goldFrame = mainHeader.WaitForChild<Frame>("Gold")
let blueprintTutorialArrow = mainHeader.WaitForChild<Frame>("Crates").WaitForChild<Frame>("Blueprints").WaitForChild<ImageLabel>("UIArrow")
let codes = mainHeader.WaitForChild<Frame>("Codes")
let codesInnerFrame = codes.WaitForChild<Frame>("InnerFrame")
let codeTextBox = codesInnerFrame.WaitForChild<TextBox>("Code")
let signals = Workspace.WaitForChild<Folder>("Signals")
let inventoryRE = signals.WaitForChild<RemoteEvent>("InventoryRE")

let localPlayer = Players.LocalPlayer! as Player

wait()  // it takes a frame for absolutesize of mainheader to be calculated

let playerGui = localPlayer.WaitForChild<PlayerGui>("PlayerGui")
let audio = playerGui.WaitForChild<Folder>("Audio")
let uiClick = audio.WaitForChild<Sound>("UIClick")

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
