import { Players } from "@rbxts/services"

import { Localize } from "ReplicatedStorage/TS/Localize"
import { MessageGui } from "ReplicatedStorage/TS/MessageGui"

let playerGui = Players.LocalPlayer!.WaitForChild('PlayerGui') as PlayerGui

function SetupBoostButton( button: GuiButton )
{
    button.MouseButton1Click.Connect( ()=>
    {
        let buyMoreBoostAnswers = MessageGui.ShowMessageAndAwaitResponse( Localize.formatByKey( "LootThanksToBoost" ), true, 0, true, "Yes", "No" )
        if( buyMoreBoostAnswers )
        {
            if( buyMoreBoostAnswers[0] === "Yes" )
            {
                let storeGui = playerGui.WaitForChild("StoreGui") as Frame
                let storeGuiMain = storeGui.WaitForChild("Main") as Frame
                let storeMainBE = storeGui.WaitForChild("StoreMainBE") as BindableEvent
                let furnishClientHandlerEvent = playerGui.WaitForChild("FurnishGui").WaitForChild("FurnishClientHandler").WaitForChild("Event") as BindableEvent
                let characterSheet = playerGui.WaitForChild("CharacterSheetGui").WaitForChild("CharacterSheet") as Frame
                let skinGuiMain = playerGui.WaitForChild("SkinGui").WaitForChild("Main") as Frame

                if( !storeGuiMain.Visible )
                {
                    storeGuiMain.Visible = true
                    storeMainBE.Fire( "JumpTo", storeGui.WaitForChild('Main').WaitForChild('MainHeader').WaitForChild('Boost') )
                    furnishClientHandlerEvent.Fire( "Close" )
                    characterSheet.Visible = false
                    skinGuiMain.Visible = false		
                }
            }
        }
    } )
}

SetupBoostButton( script.Parent!.Parent!.WaitForChild("PossessionsFrame").WaitForChild("ItemInfoFrame").WaitForChild("ReadableName").WaitForChild("Boost") as GuiButton )
