import { CollectionService } from "@rbxts/services"

import { PlayerServer } from "ServerStorage/TS/PlayerServer"
import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS";
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import CharacterClientI = require("ReplicatedStorage/Standard/CharacterClientI");

import * as Destructible from "ServerStorage/Standard/Destructible"
import { LootServer } from "ServerStorage/TS/LootServer"
import * as MechanicalEffects from "ServerStorage/Standard/MechanicalEffects"

import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import { GameplayTestService } from "./GameplayTestService"
import { BlueprintUtility } from "ReplicatedStorage/TS/BlueprintUtility"

// wishlist - only works on players so can't work on mobs if we one decide to be able to allow the players to place chests

export class Chest
{
    // each player can only open once
    playersWhoOpened = new Set<Player>()

    open( player:Player )
    {
        if( !this.playersWhoOpened.has( player ) )
        {
            this.playersWhoOpened.add( player )
            if( BlueprintUtility.getPossessionName( this.chestInstance ) === 'TrappedChest')
                this.activateTrap( player )
            else
                this.getLoot( player )
        }
    }

    getLoot( player: Player )
    {        
        let hero = PlayerServer.getCharacterRecordFromPlayer( player )
        DebugXL.Assert( hero instanceof Hero )
        if( hero && hero instanceof Hero ) 
        {
            LootServer.chestDrop( math.floor( hero.getActualLevel()*1.5 ), player )
        }
    }

    activateTrap( player: Player )
    {
        let chestDatum = PossessionData.dataT[ BlueprintUtility.getPossessionName( this.chestInstance ) ]
        let hero = PlayerServer.getCharacterRecordFromPlayer( player )
        DebugXL.Assert( hero instanceof Hero )
        if( hero && hero instanceof Hero ) 
        {
            let chestDamagePerLevel = 1.5 // GameplayTestService.getServerTestGroup('ChestTrapDamage') * 0.5 + 1  // 0-4 => 1-3
            this.chestInstance.FindFirstChild('Origin')!.FindFirstChild<Sound>('DetonateSound')!.Play()
            MechanicalEffects.Explosion( this.chestInstance.PrimaryPart!.Position, 
                chestDatum.baseDamageN! + chestDamagePerLevel * hero.getActualLevel(),
                15,
                this.chestInstance.FindFirstChild<ObjectValue>('creator')!.Value as Player,
                true )
            Destructible.FlyApart( this.chestInstance, 1 )
            wait(1)
            this.chestInstance.Parent = undefined
        }
    }

    constructor( 
        public chestInstance: Model ) 
    {
        CollectionService.AddTag( chestInstance, "Chest" )
        let chestRE = chestInstance.FindFirstChild('ChestRE') as RemoteEvent
        let chest = this
        chestRE.OnServerEvent.Connect( function( player: Player ) { chest.open( player ) } )
    }
}