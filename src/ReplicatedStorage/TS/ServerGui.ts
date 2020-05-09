import { TeleportService, Players, Workspace } from "@rbxts/services"

import * as InventoryClient from "ReplicatedStorage/Standard/InventoryClientStd"

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
import { PlacesManifest } from "ReplicatedStorage/TS/PlacesManifest"
import { HeroStable } from "ReplicatedStorage/TS/HeroStableTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { Localize } from "ReplicatedStorage/TS/Localize"
import { MessageGui } from "ReplicatedStorage/TS/MessageGui"
import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { PCClient } from "ReplicatedStorage/TS/PCClient"
import InstanceXL = require("ReplicatedStorage/Standard/InstanceXL");


let localPlayer = Players.LocalPlayer!
let playerGui = localPlayer.WaitForChild("PlayerGui") as PlayerGui

let noResetGui = playerGui.WaitForChild("NoResetGui") as ScreenGui

let serverButton = noResetGui.WaitForChild("LeftButtonColumn").WaitForChild<GuiButton>("Server")
serverButton.Visible = false

/*
let heroesRF = Workspace.WaitForChild('Signals').WaitForChild('HeroesRF') as RemoteFunction
let heroesRE = Workspace.WaitForChild('Signals').WaitForChild('HeroesRE') as RemoteEvent

let choosePlaceFrame = noResetGui.WaitForChild( "ChoosePlace" ) as Frame
let choosePlaceGrid = choosePlaceFrame.WaitForChild( "Grid" ) as Frame
let choosePlaceCloseButton = choosePlaceFrame.WaitForChild( "CloseButton" ) as ImageButton
let placeTemplate = choosePlaceFrame.WaitForChild( "PlaceTemplate" ) as Frame



let heroStableRaw = heroesRF.InvokeServer( "GetSavedPlayerCharactersWait" ) as object  // note it's plural; we're bringing in the whole stable
let heroStable = HeroStable.convertFromRemote( heroStableRaw )

class ServerGuiC
{
    inviteToSwitchServer( highestLevel: number )
    {    
        let currentPlace = PlacesManifest.getCurrentPlace()
        //print( "inviting to switch" )

        let destServerKey = currentPlace.nextServer

        // disable BeginnerServer by commenting it out of places list
        if( PlacesManifest.places.BeginnerServer && highestLevel<PlacesManifest.places.BeginnerServer.maxAllowedLevel && currentPlace !== PlacesManifest.places.BeginnerServer )
        {
            destServerKey = "BeginnerServer"
        }
            
        // calls MessageGui ShowMessageWait
        let [ rawResult ] = MessageGui.ShowMessageAndAwaitResponse( 
            Localize.formatByKey( "InviteToOtherServer", {currentserverlevel: Hero.getCurrentMaxHeroLevel(), 
                destservername: Localize.formatByKey( destServerKey ) }),
            true,  // needs ack
            0,  // display delay
            true, // modal     
            "Yes", 
            "No" )
        let result = rawResult as string
        if( result==="Yes" )
        {
            let hideCharacterValue = new Instance("BoolValue")
            hideCharacterValue.Value = true
            hideCharacterValue.Name = "HideCharacter"
            hideCharacterValue.Parent = localPlayer.Character
           
            heroesRE.FireServer( "ServerSideTeleport", destServerKey )
//            GameAnalyticsClient.RecordDesignEvent( "ServerInvite:" + destServerKey + ":" + "Yes" )
    //        TeleportService.Teleport( Places.places[otherPlaceIdx].getPlaceId(), localPlayer )    
        }
        else
        {
            //GameAnalyticsClient.RecordDesignEvent( "ServerInvite:" + destServerKey + ":" + "No" )
            DebugXL.Assert( result==="No" )
        }
    }

    inviteToBeginnerServer()
    {    
        if( PlacesManifest.places.BeginnerServer )
        {
            let currentPlace = PlacesManifest.getCurrentPlace()

            // calls MessageGui ShowMessageWait
            //print( "Invoking beginner server message")
            let [ rawResult ] = MessageGui.ShowMessageAndAwaitResponse( 
                Localize.formatByKey("InviteToBeginnerServer"),
                true,  // needs ack
                0.01,  // display delay
                true, // modal     
                "Yes", 
                "No" )
            //print( "Beginning server message returned")
            let result = rawResult as string
            if( result==="Yes" )
            {
                let hideCharacterValue = new Instance("BoolValue")
                hideCharacterValue.Value = true
                hideCharacterValue.Name = "HideCharacter"
                hideCharacterValue.Parent = localPlayer.Character
                
                heroesRE.FireServer( "ServerSideTeleport", "BeginnerServer" )
        //            TeleportService.Teleport( Places.places.BeginnerServer.getPlaceId(), localPlayer )    
                return true
            }
            else
            {
                DebugXL.Assert( result==="No" )
                return false
            }
        }
        return false
    }

    cachedHighestHeroLevel = heroStable.getHighestHeroLevel()
}

export let ServerGui = new ServerGuiC()

// during play, we only have to check if the *current* hero is good enough
PCClient.pcUpdatedConnect( function( pc: CharacterRecord )
{
    let hero = pc as Hero
    if( hero.statsT )
    {
        if( PlacesManifest.getCurrentPlace() === PlacesManifest.places.HighLevelServer || hero.getActualLevel() >= PlacesManifest.getCurrentPlace().maxGrowthLevel * 0.75 ) 
        { 
            serverButton.Visible = true 
        }
    }
})


function ChoosePlace( placeKey: string )
{
    heroesRE.FireServer( "ServerSideTeleport", placeKey )
}

function refresh()
{
    // setup choose frame
    InstanceXL.ClearAllChildrenBut( choosePlaceGrid, "UIGridLayout" )
    for( let [ placeKey, place ] of Object.entries( PlacesManifest.places ) )
    {
        if( place !== PlacesManifest.getCurrentPlace() )
        {
            let placeFrame = placeTemplate.Clone() as Frame
            let placeFrameImage = placeFrame.WaitForChild("Image") as ImageButton
            let placeFrameName = placeFrame.WaitForChild("Name") as TextLabel
            let placeFrameDesc = placeFrame.WaitForChild("Description") as TextLabel
            let placeFrameChoose = placeFrame.WaitForChild("Choose") as TextButton
            let placeFrameDisabled = placeFrame.WaitForChild("Disabled") as Frame
            placeFrameImage.Image = place.imageId
            placeFrameName.Text = Localize.formatByKey( placeKey as string )
            placeFrameDesc.Text = Localize.formatByKey( placeKey+"Desc", { minlevel: place.minAllowedLevel, maxlevel: place.maxGrowthLevel })
            placeFrame.Visible = true
            placeFrameChoose.MouseButton1Click.Connect( function() { ChoosePlace( placeKey as string ) } )
            placeFrameImage.MouseButton1Click.Connect( function() { ChoosePlace( placeKey as string ) } )            
            if( place.visitable( heroStable.getHighestHeroLevel() ) )
            {
                placeFrameChoose.Visible = true
                placeFrameDisabled.Visible = false
            }
            else
            {
                placeFrameChoose.Visible = false
                placeFrameDisabled.Visible = true
            }
            placeFrame.Parent = choosePlaceGrid
        }
    }
}


serverButton.MouseButton1Click.Connect( function()
{    
    print( "server button clicked")
    if( !choosePlaceFrame.Visible )
        refresh()
    choosePlaceFrame.Visible = !choosePlaceFrame.Visible
})

choosePlaceCloseButton.MouseButton1Click.Connect( function()
{
    choosePlaceFrame.Visible = false
})

// delay the reveal of the place button so new players don't wander off - statistically proven :)
spawn( ()=>{
    for(;;)
    {
        wait(0.1)
        if( InventoryClient.inventory.itemsT.HeroDeaths >= 1 )
        {
            serverButton.Visible = true
            break
        }
    }
})
*/