import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { FlexToolClient } from "ReplicatedStorage/TS/FlexToolClient"
import { ActiveSkinSetI } from "ReplicatedStorage/TS/SkinTypes";
import { Debris, Workspace, Players, TweenService } from "@rbxts/services";
import { Math } from "ReplicatedStorage/TS/Math";

let playerGui = Players.LocalPlayer!.WaitForChild('PlayerGui') as PlayerGui

class LootTraveller
{
    myTravellingFrame: Frame
    constructor( startPosUDim2: UDim2, midPosUDim2: UDim2, flexToolInst: FlexTool, activeSkins: ActiveSkinSetI )
    {
        let targetIcon = flexToolInst.baseDataS === "Healing" ?
            script.Parent!.Parent!.WaitForChild("PotionbarL") as TextButton: 
            flexToolInst.baseDataS === "Mana" ?
                script.Parent!.Parent!.WaitForChild("PotionbarR") as TextButton: 
                playerGui.WaitForChild("PossessionsGui").WaitForChild("Hotbar").WaitForChild("Items") as TextButton

        let travellerTemplate = script.Parent!.Parent!.WaitForChild("LootTravellerTemplate") as Frame
        let travellingFrame = travellerTemplate.Clone() as Frame
        this.myTravellingFrame = travellingFrame
        travellingFrame.Position = startPosUDim2
        let imageLabel = this.myTravellingFrame.FindFirstChild('ImageLabel') as ImageLabel
        imageLabel.Image = flexToolInst.getImageId()
        let background = this.myTravellingFrame.FindFirstChild('Background') as ImageLabel
        background.ImageColor3 = flexToolInst.getRarityColor3()
        let title = this.myTravellingFrame.FindFirstChild('Title') as TextLabel
        title.Text = FlexToolClient.getReadableName( flexToolInst )
        title.TextTransparency = 1
        title.TextStrokeTransparency = 1

        let boostedIcon = this.myTravellingFrame.FindFirstChild('BoostedIcon') as ImageLabel
        boostedIcon.Visible = flexToolInst.getBoosted()
        travellingFrame.Size = new UDim2( 0, 0, 0, 0 )
        travellingFrame.Parent = script.Parent!.Parent
        travellingFrame.Visible = true

        // going slow on tween in so you might have an idea where it comes from
        travellingFrame.TweenSizeAndPosition( travellerTemplate.Size, midPosUDim2, Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 0.5, true,
            function()
            {
                TweenService.Create( title, new TweenInfo(0.1) , { TextTransparency: 0, TextStrokeTransparency: 0.5 } ).Play()
                wait(1.5)
                TweenService.Create( title, new TweenInfo(0.1), { TextTransparency: 1, TextStrokeTransparency: 1 } ).Play()
                let destV2 = targetIcon.AbsolutePosition
                travellingFrame.TweenSizeAndPosition( new UDim2(0,0,0,0), new UDim2( 0, destV2.X, 0, destV2.Y ), Enum.EasingDirection.InOut, Enum.EasingStyle.Quad, 0.25, true )
                Debris.AddItem( travellingFrame, 0.25 )
            } ) 
    }
}

let guiTravellerTemplate = script.Parent!.Parent!.WaitForChild("GuiTravellerTemplate") as Frame

// copied from GuiTravellerModule, shame on me
function SendCurrencyTravellerWait( startPosUDim2: UDim2, 
    destPosUDim2: UDim2, 
    imageId: string, 
    unitsS: string, 
    amountS: string, 
    color3: Color3 )
{
	let newTraveller = guiTravellerTemplate.Clone() as Frame
    let imageLabel = newTraveller.FindFirstChild('ImageLabel') as ImageLabel
    let description = newTraveller.FindFirstChild('Description') as TextLabel
    let units = newTraveller.FindFirstChild('Units') as TextLabel

    newTraveller.Position = startPosUDim2
    imageLabel.Image = imageId
    imageLabel.ImageColor3 = color3
    description.Text = "+" + amountS
    units.Text = unitsS
    description.TextColor3 = color3
    units.TextColor3 = color3
	newTraveller.Parent = script.Parent
	newTraveller.Visible = true	
	newTraveller.TweenPosition( destPosUDim2, Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 1.5 )
	Debris.AddItem( newTraveller, 1.5 )  // this way if the calling script goes out of scope (perhaps due to a reset on spawn) it will still hide
	wait(1.5)
}

// no type safety, but there's no type safety coming from a remote anyway
let LootTravellerRemote: { [k: string]: unknown } =
{
    item: ( flexToolInst: FlexTool, activeSkins: ActiveSkinSetI, startPosV3: Vector3 ) =>
    {
        let startPosUDim2: UDim2
        let midPosUDim2: UDim2
        if( startPosV3 )
        {
            let currentCamera = Workspace.CurrentCamera!
            let [ screenPosition ] = currentCamera.WorldToScreenPoint( startPosV3 as Vector3 )
            startPosUDim2 = new UDim2( 0, screenPosition.X, 0, screenPosition.Y ) 
            let endX = Math.clamp( startPosUDim2.X.Offset, currentCamera.ViewportSize.X * 0.1, currentCamera.ViewportSize.X * 0.9 )
            midPosUDim2 = new UDim2( 0, endX, 0.25, 0)        
        }
        else
        {
            startPosUDim2 = new UDim2( 0.5, 0, 0.5, 0 )
            midPosUDim2 = new UDim2( 0.5, 0, 0.25, 0 )
        }
        let flexTool = FlexTool.objectify( flexToolInst as FlexTool )
        new LootTraveller( startPosUDim2, midPosUDim2, flexTool, activeSkins as ActiveSkinSetI )    
    },

    gold: ( adjustmentN: number, startPosV3: Vector3 ) =>
    {
        DebugXL.Assert( adjustmentN > 0)
        if( adjustmentN > 0 )
        {
            let startPosUDim2: UDim2
            let midPosUDim2: UDim2
            if( startPosV3 )
            {
                let currentCamera = Workspace.CurrentCamera!
                let [ screenPosition ] = currentCamera.WorldToScreenPoint( startPosV3 as Vector3 )
                startPosUDim2 = new UDim2( 0, screenPosition.X, 0, screenPosition.Y )
            }
            else
            {
                startPosUDim2 = new UDim2( 0.5, 0, 0.5, 0 )
            }
            let targetIcon = playerGui.WaitForChild("PossessionsGui").WaitForChild("Hotbar").WaitForChild("Items") as TextButton
            let destV2 = targetIcon.AbsolutePosition

            SendCurrencyTravellerWait( startPosUDim2, 
                new UDim2( 0, destV2.X, 0, destV2.Y ),
                "rbxassetid://2784376061",
                "", 
                tostring(adjustmentN),
                Color3.fromRGB( 255, 236, 25 ) )
        }
    }
}

let lootDropRE = Workspace.WaitForChild('Signals').WaitForChild('LootDropRE') as RemoteEvent

lootDropRE.OnClientEvent.Connect( function( ...args: unknown[] ) 
{
    let filteredArgs = args.filterUndefined()
    let rawFuncName = filteredArgs.shift()
    let funcName = rawFuncName as string
    if( LootTravellerRemote[ funcName ] )
    {
        let typedFunc = LootTravellerRemote[ funcName ] as (...filteredArgs: unknown[])=>void
        typedFunc( ...filteredArgs )
    }
} )

	