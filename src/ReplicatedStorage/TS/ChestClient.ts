import { CollectionService, RunService, Teams } from "@rbxts/services";

import * as MathXL from "ReplicatedStorage/Standard/MathXL"

export class ChestClient 
{
    lidCurrentAngle = 0

    constructor( inst: Instance )
    {
        let chestInstance = inst as Model
        let origin = (chestInstance.WaitForChild("Origin") as BasePart)  // .PrimaryPart  // dunno why PrimaryPart doesn't work
        let lid = (chestInstance.WaitForChild("Lid") as Model)
        let hinge = lid.PrimaryPart!
        let lidStartCFrame = hinge.CFrame
        let lidOpenValueObj = (chestInstance.WaitForChild("LidOpen") as BoolValue)
        let clickDetector = (chestInstance.WaitForChild("ClickBox").WaitForChild("ClickDetector") as ClickDetector)
        let chestRE = (chestInstance.WaitForChild("ChestRE") as RemoteEvent)

        let chestHitBox = new Instance("Part")
        chestHitBox.Size = new Vector3(5,3,4)
        chestHitBox.Anchored = true
        chestHitBox.CanCollide = false
        chestHitBox.Transparency = 1
        chestHitBox.CFrame = origin.CFrame.add( new Vector3(0,1.5,0) ).mul( CFrame.Angles( 0, math.pi/2, 0 ) )
        chestHitBox.Parent = chestInstance
        
        // let hingeBodyPos = hinge.BodyPosition as BodyPosition
        // let hingeBodyGyro = hinge.BodyGyro as BodyGyro.
        // //--if chestInstance.Configurations.StaticObject.Value == false then -- checking if this chest is supposed to open
        // hingeBodyPos.Position = new Vector3( hinge.Position.X, hinge.Position.Y, hinge.Position.Z)
        // hingeBodyGyro.CFrame = hinge.CFrame 
    
        // --else
        // --	chestInstance.ClickBox.ClickDetector.MaxActivationDistance = 10
        // --end
        
        function OnLidToggle( player: Player )
        {
            if( player.Team === Teams.FindFirstChild('Heroes') ) {
                if( lidOpenValueObj.Value === false ) {
                    lidOpenValueObj.Value = true
                    lid.GetChildren().forEach( function( v: Instance ) { ( v as BasePart ).Anchored = false } )
                    chestRE.FireServer()
                }
            }
        }
        
        clickDetector.MouseClick.Connect( OnLidToggle )    

        let myChest = this

        let chestConnection: RBXScriptConnection
        chestConnection = RunService.RenderStepped.Connect( function()
        {
            if( !lid.PrimaryPart ) { 
                chestConnection.Disconnect() 
                return 
            }
            if( !lid.Parent ) {
                chestConnection.Disconnect()
                return
            }
            if( lidOpenValueObj.Value )
            {
                myChest.lidCurrentAngle = MathXL.Lerp( myChest.lidCurrentAngle, -math.pi * 2 / 3, 0.1 )
                lid.SetPrimaryPartCFrame( lidStartCFrame.mul( CFrame.fromEulerAnglesYXZ( 0, 0, myChest.lidCurrentAngle ) ) )
            }
        } )
    }

}

export namespace ChestClientManager 
{
    export function run() {
        CollectionService.GetTagged( "Chest").forEach( function( instance )
        {
            new ChestClient( instance )
        } )

        CollectionService.GetInstanceAddedSignal( "Chest" ).Connect( function( instance )
        {
            new ChestClient( instance )
        } )
    }
}