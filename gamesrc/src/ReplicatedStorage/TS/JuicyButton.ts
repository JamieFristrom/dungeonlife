// import { CollectionService, Players } from "rbx-services"

// import { GameplayTestUtility } from "ReplicatedStorage/TS/GameplayTestUtility"

// import * as MouseOver from "ReplicatedStorage/Standard/MouseOver"

// import * as InventoryClient from "ReplicatedStorage/Standard/InventoryClientStd"
// import { GuiXL } from "ReplicatedStorage/TS/GuiXLTS";
// import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";

// class ButtonInfo
// {
//     constructor(
//         public originalSize: UDim2,
//         public enterConnection: RBXScriptConnection,
//         public leaveConnection: RBXScriptConnection ) {}
// }

// leaving this stub in even though it mysteriously lowered retention, just in case we want to revisit the idea someday
export class JuicyButton
{
    constructor( callingScript: Script ) {
        // if( GameplayTestUtility.getTestGroup( InventoryClient.inventory, 'JuicyButtons' )===1 ) {
        //     let juicyButton = callingScript.Parent as GuiObject

        //     let audio = Players.LocalPlayer!.PlayerGui.WaitForChild("Audio")
        //     let uiClick = audio.WaitForChild("UIClick") as Sound
        //     let uiHover = audio.WaitForChild("UIHover") as Sound
        
        //     let juicyButtonsMap = new Map< GuiObject, ButtonInfo >();
        
        //     let hoverScale = 1.05
        
        //     function scaleUDim2( originalSize: UDim2 )
        //     {
        //         return new UDim2( originalSize.X.Scale * hoverScale, 
        //             originalSize.X.Offset * hoverScale, 
        //             originalSize.Y.Scale * hoverScale, 
        //             originalSize.Y.Offset * hoverScale )
        //     }
        
        //     function mouseEnter( juicyButton: GuiObject )
        //     {
        //         if( GuiXL.currentlyDisplayed( juicyButton )  ) {
        //             let bigSize = scaleUDim2( juicyButton.Size )
        //             uiHover.Play();
        //             juicyButton.TweenSize( bigSize, Enum.EasingDirection.Out, Enum.EasingStyle.Bounce, 0.1, true )
        //         }
        //     }
        
        //     function mouseLeave( juicyButton: GuiObject )
        //     {
        //         if( juicyButton.Parent ) {
        //             if( GuiXL.currentlyDisplayed( juicyButton ) ) {                
        //                 let juicyButtonInfo = juicyButtonsMap.get( juicyButton )
        //                 if( !juicyButtonInfo )
        //                 {
        //                     DebugXL.Error( juicyButton.GetFullName() + " mouse left but not in map")
        //                 }
        //                 else
        //                 {
        //                     juicyButton.TweenSize( juicyButtonInfo.originalSize, Enum.EasingDirection.InOut, Enum.EasingStyle.Quad, 0.1, true )
        //                 }
        //             }
        //         }
        //     }
        
        //     function makeJuicyButton( juicyButton: Instance ) {
        //         assert( juicyButton.IsA('GuiObject'))
        //         if( juicyButton.IsA('GuiObject')) {
        //             print("Making "+juicyButton.GetFullName());
        //             let [ enterEventL, leaveEventL ] = MouseOver.MouseEnterLeaveEvent( juicyButton )
                
        //             let enterConnection = enterEventL.Connect( () => mouseEnter( juicyButton) )
        //             let leaveConnection = leaveEventL.Connect( () => mouseLeave( juicyButton ) )
        //             juicyButtonsMap.set( juicyButton, new ButtonInfo( juicyButton.Size, enterConnection, leaveConnection ) )
        //         }
        //     }
        
        //     function unmakeJuicyButton( juicyButton: Instance ) {
        //         assert( juicyButton.IsA('GuiObject'))
        //         if( juicyButton.IsA('GuiObject')) {
        //             warn("Unmaking "+juicyButton.GetFullName());
        //             let buttonInfo = juicyButtonsMap.get( juicyButton )
        //             if( buttonInfo )
        //             {
        //                 buttonInfo.enterConnection.Disconnect()
        //                 buttonInfo.leaveConnection.Disconnect()
        //                 juicyButtonsMap.delete( juicyButton )
        //             }
        //             else
        //                 DebugXL.Error("Unmaking untracked button "+juicyButton.GetFullName())
        //         }
        //     }

        //     if( juicyButton.Visible )
        //         makeJuicyButton( juicyButton )

        //     juicyButton.GetPropertyChangedSignal('Visible').Connect( ()=>{
        //         if( juicyButton.Visible ) 
        //             makeJuicyButton( juicyButton )
        //         else
        //             // this doesn't catch the case when a parent is hidden and I'm fine with that
        //             unmakeJuicyButton( juicyButton )
        //     })
        // }
    }
}



