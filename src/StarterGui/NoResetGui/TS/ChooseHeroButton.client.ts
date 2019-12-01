import { Players, Workspace } from "@rbxts/services"

import { PlacesManifest } from "ReplicatedStorage/TS/PlacesManifest"

let LocalPlayer = Players.LocalPlayer!
let button = script.Parent!.Parent!.WaitForChild("LeftButtonColumn").WaitForChild<TextButton>("ForceHero")
let icon = button.WaitForChild<ImageLabel>("Icon")
let buttonName = button.WaitForChild<TextLabel>("ButtonName") 

let mainRE = Workspace.WaitForChild('Signals')!.WaitForChild('MainRE') as RemoteEvent

button.MouseButton1Click.Connect( function() {
    print("ForceHeroClient")
    mainRE.FireServer( "ForceHero" )
} )

button.Visible = PlacesManifest.getCurrentPlace() === PlacesManifest.places.Underhaven 
