import * as InputXL from "ReplicatedStorage/Standard/InputXL"
import { GuiService } from "@rbxts/services";

let chooseClassFrame = script.Parent!.Parent!.WaitForChild("HeroGui").WaitForChild("ChooseClass") as Frame

chooseClassFrame.GetPropertyChangedSignal('Visible').Connect( ()=>
{
    if( InputXL.UsingGamepad() )
    {
        GuiService.SelectedObject = chooseClassFrame.WaitForChild('Grid').WaitForChild("Hero1").WaitForChild<GuiObject>("Choose")
    }
})