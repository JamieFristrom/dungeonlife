
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { Players, Teams } from "@rbxts/services";

import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import { ModelUtility } from "ReplicatedStorage/TS/ModelUtility"
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
                            if( ModelUtility.getPrimaryPartCFrameSafe(character).p.sub( ModelUtility.getPrimaryPartCFrameSafe(doorModel).p ).Magnitude < 16 ) {
                                nonopenerClose = true
                            }
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
                        if( ModelUtility.getPrimaryPartCFrameSafe(character).p.sub( ModelUtility.getPrimaryPartCFrameSafe(doorModel).p ).Magnitude < 8 )
                            openerClose = true
                    }
                    else
                    {
                       if( ModelUtility.getPrimaryPartCFrameSafe(character).p.sub( ModelUtility.getPrimaryPartCFrameSafe(doorModel).p ).Magnitude < 16 )
                            nonopenerClose = true
                    }
                }
            }
        } )
        return openerClose && !nonopenerClose
    }
}