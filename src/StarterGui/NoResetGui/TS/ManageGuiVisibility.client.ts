import { Players } from "@rbxts/services"

import { InventoryI } from "ReplicatedStorage/TS/InventoryI"

import * as InventoryUtility from "ReplicatedStorage/Standard/InventoryUtility"
import * as InventoryClient from "ReplicatedStorage/Standard/InventoryClientStd"
import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"



let localPlayer = Players.LocalPlayer!
let playerGui = localPlayer.WaitForChild("PlayerGui") as PlayerGui
let audio = playerGui.WaitForChild("Audio") as ScreenGui
let noResetGui = playerGui.WaitForChild("NoResetGui") as ScreenGui
noResetGui.Enabled = false

let storeButton = noResetGui.WaitForChild("RightButtonColumn").WaitForChild<GuiButton>("Store")
let skinsButton = noResetGui.WaitForChild("RightButtonColumn").WaitForChild<GuiButton>("Skins")


// don't distract new players with server button; have to have been hero at least
function numSkinsOwned( inventory: InventoryI )
{
    let skins = PossessionData.dataA.filter( possession => possession.flavor===PossessionData.FlavorEnum.Skin )
    let skinCount = skins.reduce( (total, skin) => total + InventoryUtility.GetCount( InventoryClient.inventory, skin.idS ), 0 )
    return skinCount
}

storeButton.Visible = true
skinsButton.Visible = true

