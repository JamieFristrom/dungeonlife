import { Players, Teams } from "@rbxts/services";

import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import { PlacesManifest } from "ReplicatedStorage/TS/PlacesManifest"

export namespace DoorServer
{
    export function canBeOpenedBy( doorModel: Model, openingPlayer: Player )
    {
        if( !openingPlayer ) return false

        if( PlacesManifest.getCurrentPlace()===PlacesManifest.places.Underhaven )
            return true

        if( openingPlayer.Team === Teams.FindFirstChild('Monsters') )
            return true

        return PossessionData.dataT[ doorModel.Name ].heroesCanOpenB 
    }

    export function canBeOpenedNow( doorModel: Model, openingPlayer: Player )
    {
        if( !openingPlayer ) return false

        if( canBeOpenedBy( doorModel, openingPlayer ))
        {
            let nonopenerClose = false
            Players.GetPlayers().forEach( function( player )
            {
                if( !canBeOpenedBy( doorModel, player ))
                {
                    let character = player.Character
                    if( character )
                    {
                        if( character.PrimaryPart && doorModel.PrimaryPart )
                        {
                            if( character.GetPrimaryPartCFrame().p.sub( doorModel.GetPrimaryPartCFrame().p ).Magnitude < 16 )
                                nonopenerClose = true
                        }
                    }
                }
            })
            return !nonopenerClose
        }
        return false
    }

    export function keepOpen( doorModel: Model )
    {
        let openerClose = false
        let nonopenerClose = false
        Players.GetPlayers().forEach( function( player )
        {
            let character = player.Character
            if( character )
            {
                if( character.PrimaryPart && doorModel.PrimaryPart )
                {
                    if( canBeOpenedBy( doorModel, player ))
                    {
                        if( character.GetPrimaryPartCFrame().p.sub( doorModel.GetPrimaryPartCFrame().p ).Magnitude < 8 )
                            openerClose = true
                    }
                    else
                    {
                       if( character.GetPrimaryPartCFrame().p.sub( doorModel.GetPrimaryPartCFrame().p ).Magnitude < 16 )
                            nonopenerClose = true
                    }
                }
            }
        } )
        return openerClose && !nonopenerClose
    }
}