print( script.GetFullName() + " executed" )

import { TeleportService, Workspace, StarterGui, ServerScriptService } from "@rbxts/services";

import * as AnalyticsXL from "ServerStorage/Standard/AnalyticsXL" 
import * as ChatMessages from "ServerStorage/Standard/ChatMessages"

import { PlacesManifest } from "ReplicatedStorage/TS/PlacesManifest"
import { HeroStable } from "ReplicatedStorage/TS/HeroStableTS";

//import * as Heroes from "ServerStorage/Standard/HeroesModule"




class PlacesServerClass 
{
    // use : calling from lua
    inviteToHighLevelServer( player: Player, heroStable: HeroStable )
    {
        let currentPlace = PlacesManifest.getCurrentPlace()

        // calls MessageGui ShowMessageWait
        let messageRF = Workspace.FindFirstChild('Standard')!.FindFirstChild('MessageGuiXL')!.WaitForChild('MessageRF') as RemoteFunction
        // message gui's messageRF returns the result in an array, don't remember why
        let rawResult = messageRF.InvokeClient( 
            player,
            "HighestLevel",
            {},
            true,  // needs ack
            0,  // display delay
            true, // modal     
            "Yes", 
            "No" ) as string[]
        // for reasons lost in time, message gui's ShowMessageAndAwaitResponse returns an array of one string
        let result = rawResult[0]
        if( result==="Yes" )
        {
            this.serverSideTeleport( player, currentPlace.nextServer, heroStable )

        }
    }   
    
    isValidPlace( player: Player, place: PlacesManifest.Place, heroStable: HeroStable )
    {
        let highestLvl = heroStable.getHighestHeroLevel()
        return highestLvl <= place.maxAllowedLevel 
    }

    serverSideTeleport( player: Player, whereTo: string, heroStable: HeroStable )
    {
        let place = PlacesManifest.places[ whereTo ]
        if( this.isValidPlace( player, place, heroStable ) )
        {
//            if( whereTo !== "BeginnerServer" )  // social proof, let's keep showing it, I'm seeing too many beginners in standard server
            ChatMessages.SayMessage( player.Name + " has gone to " + place.name )
           
            AnalyticsXL.ReportEvent( player, 
                "Teleport", 
                whereTo,
                "", 
                1, true )

            TeleportService.Teleport( place.getPlaceId(), player )    

            let hideCharacterValue = new Instance("BoolValue")
            hideCharacterValue.Value = true
            hideCharacterValue.Name = "HideCharacter"
            hideCharacterValue.Parent = player.Character            
        }
    }
}

export let PlacesServer = new PlacesServerClass()

if( game.PrivateServerId !== "")
{
    //            DebugXL.Assert( game.PrivateServerOwnerId !== 0 )
    ( Workspace.FindFirstChild('GameManagement')!.FindFirstChild('VIPServer') as BoolValue).Value = true
    warn( "VIP Server")
}


