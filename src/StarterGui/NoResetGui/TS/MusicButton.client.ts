import { Players } from "@rbxts/services"

let LocalPlayer = Players.LocalPlayer!
let button = script.Parent!.Parent!.WaitForChild("LeftButtonColumn").WaitForChild<TextButton>("Music")
let iconNo = button.WaitForChild<ImageLabel>("IconNo")
button.MouseButton1Click.Connect( function() {
    iconNo.Visible = !iconNo.Visible
} )


