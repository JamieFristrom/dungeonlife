import { Players } from "@rbxts/services"

let LocalPlayer = Players.LocalPlayer!
let button = (script.Parent!.Parent!.WaitForChild("LeftButtonColumn").WaitForChild("Music") as TextButton)
let iconNo = (button.WaitForChild("IconNo") as ImageLabel)
button.MouseButton1Click.Connect( function() {
    iconNo.Visible = !iconNo.Visible
} )


