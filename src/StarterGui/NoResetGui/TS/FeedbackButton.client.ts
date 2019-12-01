import { Players } from "@rbxts/services"

import { DLUI } from "ReplicatedStorage/TS/DLUI"

let LocalPlayer = Players.LocalPlayer!
let feedbackButton = script.Parent!.Parent!.WaitForChild("LeftButtonColumn").WaitForChild<TextButton>("Feedback")
feedbackButton.MouseButton1Click.Connect( function() {
    DLUI.toggleFrame( script.Parent!.Parent!.WaitForChild<Frame>("FeedbackPanel") )
} )


