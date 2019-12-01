import { ContextActionService, Players, Workspace } from "@rbxts/services";

import { GameplayTestUtility } from "ReplicatedStorage/TS/GameplayTestUtility"

import * as InventoryClient  from "ReplicatedStorage/Standard/InventoryClientStd"
import * as MouseOver from "ReplicatedStorage/Standard/MouseOver"

let playerGui = Players.LocalPlayer!.WaitForChild('PlayerGui')
let audio = playerGui.WaitForChild("Audio")
let uiClick = audio.WaitForChild("UIClick") as Sound
let uiHover = audio.WaitForChild("UIHover") as Sound

let heroesRE = Workspace.WaitForChild('Signals').WaitForChild('HeroesRE') as RemoteEvent

function PotionEvent( inputState: Enum.UserInputState, funcName: string )
{
    if( inputState === Enum.UserInputState.Begin )
    {
        //print( funcName )
        uiClick.Play()
        heroesRE.FireServer( funcName )        
    }
}


let potionbarL = script.Parent!.Parent!.WaitForChild("PotionbarL") as Frame
let potionbarR = script.Parent!.Parent!.WaitForChild("PotionbarR") as Frame

// let potionButtonSize = potionbarL.Size
// let hoverScale = 1.1
// let bigSize = new UDim2( potionButtonSize.X.Scale * hoverScale, potionButtonSize.X.Offset * hoverScale, potionButtonSize.Y.Scale * hoverScale, potionButtonSize.Y.Offset * hoverScale )

// function mouseEnter( potionButton: Frame )
// {
//     if( potionButton.Visible ) {
//         uiHover.Play();
//         potionButton.TweenSize( bigSize, Enum.EasingDirection.Out, Enum.EasingStyle.Bounce, 0.1, true )
//     }
// }

// function mouseLeave( potionButton: Frame )
// {
//     if( potionButton.Visible ) {
//         potionButton.TweenSize( potionButtonSize, Enum.EasingDirection.InOut, Enum.EasingStyle.Quad, 0.1, true )
//     }
// }

potionbarL.GetPropertyChangedSignal( "Visible" ).Connect( ()=>
{    
    if( potionbarL.Visible ) {
        ContextActionService.BindAction( "PotionHeal", ( _: string, inputState: Enum.UserInputState ) => { PotionEvent( inputState, "TakeBestHealthPotion" ) }, false, Enum.KeyCode.Q, Enum.KeyCode.ButtonL1 )
    }
    else {
        ContextActionService.UnbindAction( "PotionHeal" )                    
    }
} )


potionbarR.GetPropertyChangedSignal( "Visible" ).Connect( ()=>
{
    if( potionbarR.Visible ) {
        ContextActionService.BindAction( "PotionMana", ( _: string, inputState: Enum.UserInputState) => { PotionEvent( inputState, "TakeBestManaPotion" ) }, false, Enum.KeyCode.E, Enum.KeyCode.ButtonR1 )
    }
    else {
        ContextActionService.UnbindAction( "PotionMana" )                    
    }
} )

// if( GameplayTestUtility.getTestGroup( InventoryClient.inventory, 'ClickyPotions' )===1 ) {
//     let [ enterEventL, leaveEventL ] = MouseOver.MouseEnterLeaveEvent( potionbarL )
//     let [ enterEventR, leaveEventR ] = MouseOver.MouseEnterLeaveEvent( potionbarR )

//     enterEventL.Connect( () => mouseEnter( potionbarL) )
//     leaveEventL.Connect( () => mouseLeave( potionbarL ) )
//     enterEventR.Connect( () => mouseEnter( potionbarR ) )
//     leaveEventR.Connect( () => mouseLeave( potionbarR ) )
// }