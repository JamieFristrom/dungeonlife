import { Workspace } from "@rbxts/services";

import { DungeonVoteUtility } from "ReplicatedStorage/TS/DungeonVoteUtility"

let dungeonVoteFrame = script.Parent!.Parent!.WaitForChild<Frame>("DungeonVoteFrame")

let voteCountdownValueObj = Workspace.WaitForChild('GameManagement')!.WaitForChild('VoteCountdown') as NumberValue

let dungeonFrames = [
    dungeonVoteFrame.WaitForChild("Grid").WaitForChild<Frame>("Dungeon0"),
    dungeonVoteFrame.WaitForChild("Grid").WaitForChild<Frame>("Dungeon1"),
]

let mainRE = Workspace.WaitForChild('Signals')!.WaitForChild('MainRE') as RemoteEvent
let voteRE = Workspace.WaitForChild('Signals')!.WaitForChild('VoteRE') as RemoteEvent

function Vote( dungeonFrame: Frame )
{
    dungeonFrames.forEach( ( dungeonFrame ) => dungeonFrame.WaitForChild("Image")!.WaitForChild<GuiObject>("Checkbox").Visible = false )
    dungeonFrame.WaitForChild("Image")!.WaitForChild<GuiObject>("Checkbox").Visible = true
    // warning: this was rewritten without testing:
    mainRE.FireServer( "DungeonVote", dungeonFrame.Name.sub( dungeonFrame.Name.size()-1 ) )
}

function Reset()
{
    dungeonVoteFrame.Visible = true
    dungeonFrames.forEach( ( dungeonFrame ) =>
    {
        let image = dungeonFrame.WaitForChild<ImageButton>("Image")
        image.MouseButton1Click.Connect( () => Vote( dungeonFrame ) )
        image.WaitForChild<GuiObject>("Checkbox").Visible = false

        let chooseButton = dungeonFrame.WaitForChild<TextButton>("Choose")
        chooseButton.MouseButton1Click.Connect( () => Vote( dungeonFrame ) )

        dungeonFrame.WaitForChild("Image")!.WaitForChild<TextLabel>("NumVotes").Text = ""
    })
}

let gameStateValueObj = Workspace.WaitForChild('GameManagement')!.WaitForChild('GameState') as StringValue

let frameTargetUDim2 = dungeonVoteFrame.Position

function TweenPosition( guiObject: GuiObject, startPos: UDim2, endPos: UDim2, easeDirection: Enum.EasingDirection, easeStyle: Enum.EasingStyle, time: number )
{
    guiObject.Position = startPos  // this will be ignored if mid-tween
    return new Promise( (resolve, reject) => {
        let willPlay = guiObject.TweenPosition( endPos, easeDirection, easeStyle, time, true, ( tweenStatus: Enum.TweenStatus ) => {
            if( tweenStatus === Enum.TweenStatus.Completed ) 
                resolve()
            else 
                reject()
            } )
        if( !willPlay ) reject()
        } )
}


function StartDungeonVote()
{
    Reset()
    TweenPosition( dungeonVoteFrame, new UDim2( 0.5, 0, -0.5, 0 ), frameTargetUDim2, Enum.EasingDirection.InOut, Enum.EasingStyle.Quad, 0.3 )
}


if( gameStateValueObj.Value === "DungeonVote" )
{
    StartDungeonVote()
}


gameStateValueObj.Changed.Connect( function( newValue )
{
    if( newValue==="DungeonVote" )
        StartDungeonVote()
})

voteCountdownValueObj.Changed.Connect( ( newValue )=>
{
    dungeonVoteFrame.WaitForChild<TextLabel>("CountdownLabel").Text = gameStateValueObj.Value==="DungeonVote" ? tostring( newValue ) : ""
} )

voteRE.OnClientEvent.Connect( ( funcName: string, pollResults: number[] )=>
{
    if( funcName==="ShowPollResults")
    {
        for( let i=0; i<dungeonFrames.size(); i++ )
        {
            dungeonFrames[i].WaitForChild("Image")!.WaitForChild<TextLabel>("NumVotes").Text = tostring( pollResults[i] )
        }
        wait(3)
        TweenPosition( dungeonVoteFrame, dungeonVoteFrame.Position, new UDim2( 0.5, 0, -0.5, 0 ), Enum.EasingDirection.InOut, Enum.EasingStyle.Quad, 0.3 )
    }
} )