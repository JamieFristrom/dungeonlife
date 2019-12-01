import { MessageGui } from "ReplicatedStorage/TS/MessageGui"

import * as InventoryClient from "ReplicatedStorage/Standard/InventoryClientStd"
import { ReviewEnum } from "ReplicatedStorage/TS/InventoryI";
import { Workspace } from "@rbxts/services";

let feedbackPanel = script.Parent!.Parent! as Frame
let thumbsUpButton = feedbackPanel.WaitForChild("Main").WaitForChild("ThumbsUp") as ImageButton
let thumbsDownButton = feedbackPanel.WaitForChild("Main").WaitForChild("ThumbsDown") as ImageButton
let textBox = feedbackPanel.WaitForChild("Main").WaitForChild("TextBox") as TextBox
let ok = feedbackPanel.WaitForChild("Main").WaitForChild("Ok") as TextButton

let inventoryRE = Workspace.WaitForChild('Signals').WaitForChild('InventoryRE') as RemoteEvent

function whatHasTwoThumbsAnd()
{
    thumbsDownButton.Image = InventoryClient.inventory.review === ReviewEnum.ThumbsDown ? "rbxassetid://2586421817" : "rbxassetid://2586421676"
    thumbsUpButton.Image   = InventoryClient.inventory.review === ReviewEnum.ThumbsUp ? "rbxassetid://2586421510" : "rbxassetid://2586421294"
}
whatHasTwoThumbsAnd()

thumbsUpButton.MouseButton1Click.Connect( function()
{
    InventoryClient.inventory.review = InventoryClient.inventory.review === ReviewEnum.ThumbsUp ? ReviewEnum.NoOpinion : ReviewEnum.ThumbsUp
    whatHasTwoThumbsAnd()
    inventoryRE.FireServer( "ChangeReview", ReviewEnum.ThumbsUp )
    if( InventoryClient.inventory.review === ReviewEnum.ThumbsUp )
        MessageGui.PostMessage( "Thanks! If you haven't already, please give it a thumbs up on Roblox too! It helps a lot!", false, 0, false )
})

thumbsDownButton.MouseButton1Click.Connect( function()
{
    InventoryClient.inventory.review = InventoryClient.inventory.review === ReviewEnum.ThumbsDown ? ReviewEnum.NoOpinion : ReviewEnum.ThumbsDown
    whatHasTwoThumbsAnd()
    inventoryRE.FireServer( "ChangeReview", ReviewEnum.ThumbsDown, textBox.Text  )
    if( InventoryClient.inventory.review === ReviewEnum.ThumbsDown )
        MessageGui.PostMessage( "I appreciate your honesty! Please give some feedback so I can improve the game.", false, 0, false )
})

textBox.FocusLost.Connect( function( enterPressed )
{
    if( enterPressed )
    {
        inventoryRE.FireServer( "PostFeedback", textBox.Text )
        MessageGui.PostMessage( "Feedback sent! Thank you.", false, 0, false )
    }
})

ok.MouseButton1Click.Connect( function()
{
    feedbackPanel.Visible = false
})

