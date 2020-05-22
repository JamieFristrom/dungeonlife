
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI( 'Executed', script.GetFullName())

import { Players, Workspace } from '@rbxts/services'


let localPlayer = Players.LocalPlayer!
let playerGui = localPlayer.WaitForChild('PlayerGui') as PlayerGui

let noResetGui = playerGui.WaitForChild('NoResetGui') as ScreenGui

let serverButton = noResetGui.WaitForChild('LeftButtonColumn').WaitForChild<GuiButton>('Server')
serverButton.Visible = false

// code for choosing team
const chooseTeamFrame = noResetGui.WaitForChild<Frame>( 'ChooseTeam' )
const chooseTeamGrid = chooseTeamFrame.WaitForChild<Frame>( 'Grid' )

const chooseTeamButton = script.Parent!.Parent!.WaitForChild('LeftButtonColumn').WaitForChild<TextButton>('ChooseTeam')

const choiceKeys = ['HeroChoice','MonsterChoice','DungeonLordChoice']
const choiceFrames = choiceKeys.map( (key)=>chooseTeamGrid.WaitForChild<Frame>(key) )
const choiceImageButtons = choiceFrames.map( (frame)=>frame.WaitForChild<ImageButton>('Image'))
const choiceTextButtons = choiceFrames.map( (frame)=>frame.WaitForChild<TextButton>('Choose'))

function makeTeamChoice( keyName: string )
{
    mainRE.FireServer( keyName )
    chooseTeamFrame.Visible = false
}

for( let i=0; i<choiceKeys.size(); i++ )
{
    const choiceKey = choiceKeys[i]
    choiceImageButtons[i].MouseButton1Click.Connect( ()=>{ makeTeamChoice(choiceKey) } )
    choiceTextButtons[i].MouseButton1Click.Connect( ()=>{ makeTeamChoice(choiceKey) } )
}

let mainRE = Workspace.WaitForChild('Signals')!.WaitForChild('MainRE') as RemoteEvent

chooseTeamButton.MouseButton1Click.Connect( function()
{    
    DebugXL.logI('UI', 'Choose team button clicked')
    if( !chooseTeamFrame.Visible )
        chooseTeamFrame.Visible = true
})