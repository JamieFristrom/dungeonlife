import { Players, Teams } from "@rbxts/services"

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
import { PC } from "ReplicatedStorage/TS/PCTS"

import * as FlexibleTools from "ServerStorage/Standard/FlexibleToolsModule"
import * as GameAnalyticsServer from "ServerStorage/Standard/GameAnalyticsServer"
import * as Inventory from "ServerStorage/Standard/InventoryModule"

import * as CharacterClientI from "ReplicatedStorage/Standard/CharacterClientI"
import * as CharacterUtility from "ReplicatedStorage/Standard/CharacterUtility"
import * as InstanceXL from "ReplicatedStorage/Standard/InstanceXL"

import { Analytics } from "ServerStorage/TS/Analytics"

export namespace PlayerServer
{
    let characterAddedFuncs = new Map< Player, ( character: Model )=>void>()
    let birthTicks = new Map< Player, number >()

    export let pcs = new Map< Player, PC >()

    interface HitTrackerI
    {
        [k:string]: { hits: number, attacks: number }
    }

    export let hitTrackers = new Map< Player, HitTrackerI>()

    export function customCharacterAddedConnect( player: Player, charAddedFunc: ( character: Model )=>void )
    {
        DebugXL.Assert( !characterAddedFuncs.has( player ))
        characterAddedFuncs.set( player, charAddedFunc )
    }

    export function callCharacterAdded( player: Player, character: Model )
    {
        DebugXL.Assert( character.FindFirstChild("Humanoid") !== undefined )
        let func = characterAddedFuncs.get( player )
        DebugXL.Assert( func !== undefined )
        if( func )
            spawn( function() { func!( character ) } )
        birthTicks.set( player, tick() )
    }

    export function recordCharacterDeath( player: Player, character: Model )
    {
        let birthTick = birthTicks.get( player )
        let lifetime = 0
        if( birthTick ) {
            lifetime = tick() - birthTick
            birthTicks.delete( player )
        }

        let lastAttackingPlayer = CharacterUtility.GetLastAttackingPlayer( character );
        
        Analytics.ReportEvent( player, 
            'Death', 
            lastAttackingPlayer ? tostring(lastAttackingPlayer.UserId) : "",
            CharacterClientI.GetCharacterClass( player ),
            lifetime )  // life will be a little easier if we include the attacking player's class here but we can determine that from sql

        return lifetime
    }

    export function publishPotions( player: Player, pc: PC )
    {
        let potions = pc.countPotions()
        InstanceXL.CreateSingleton( "NumberValue", { Name: "NumHealthPotions", Value: potions, Parent: player })
    }

    export function updateBackpack( player: Player, pc: PC )
    {
       let allActiveSkins = Inventory.GetActiveSkinsWait( player )
       let activeSkins = player.Team === Teams.FindFirstChild('Heroes') ? allActiveSkins.hero : allActiveSkins.monster
        
        for( let i=1; i<=CharacterClientI.maxSlots; i++ )
        {
            let possessionKey = pc.getPossessionKeyFromSlot( i )
            if( possessionKey )
            {
                let flexTool = pc.getTool( possessionKey )!
                if( flexTool.getUseType() === "held" )
                {
                    let tool = PC.getToolInstanceFromPossessionKey( player, possessionKey )
                    if( !tool )
                        tool = FlexibleTools.CreateTool( { 
                            toolInstanceDatumT: flexTool,
                            destinationPlayer: player,
                            activeSkinsT: activeSkins,
                            possessionsKey: possessionKey } )
                }
            }
        }
        // remove any items that are no longer in hotbar; I could have just cleared your held tool and backpack first, but this
        // lets you hold things when you change your hotbar
        let playerModel = player.Character!
        if( playerModel )
        {
            let heldTool = playerModel.FindFirstChildWhichIsA("Tool") as Tool
            if( heldTool )
            {
                let possessionKey = PC.getToolPossessionKey( heldTool )!                
                let flexTool = pc.getTool( possessionKey )!
                if( !flexTool || !flexTool.slotN )
                {
                    heldTool.Destroy()
                }
            }
        }
        player.FindFirstChild('Backpack')!.GetChildren().forEach( function( inst: Instance )
        {
            let tool = inst as Tool
            let possessionKey = PC.getToolPossessionKey( tool )!                
            let flexTool = pc.getTool( possessionKey )  
            if( !flexTool || !flexTool.slotN )  // might have been thrown away
            {
                tool.Destroy()
            }
        } )

        publishPotions( player, pc )
    }

    export function markHit( player: Player, category: string )
    {
        if( player.Parent )
        {
            let hitTracker = hitTrackers.get( player )
            DebugXL.Assert( hitTracker !== undefined )
            if( hitTracker )
            {
                DebugXL.Assert( hitTracker[category] !== undefined )
                if( hitTracker[category])
                    hitTracker[category].hits += 1
            }
        }
    }

    export function markAttack( player: Player, category: string )
    {
        if( player.Parent )
        {
            let hitTracker = hitTrackers.get( player )
            if( hitTracker )
            {
                DebugXL.Assert( hitTracker[category] !== undefined )
                if( hitTracker[category])
                {
                    hitTracker[category].attacks += 1
                    //print( player.Name + " " + category + " hit ratio so far: " + hitTracker[category].hits + "/" + hitTracker[category].attacks )
                }
            }
            else
            {
                let newHitTracker: HitTrackerI = { Ranged: { hits: 0, attacks: 0}, Melee: { hits: 0, attacks: 0 }}
                newHitTracker[category] = { hits: 0, attacks: 1 } 
                hitTrackers.set( player, newHitTracker )
            }
        }
    }

    export function recordHitRatio( player: Player )
    {
        let hitTracker = hitTrackers.get( player )
        if( hitTracker )
        {
            for( let k of Object.keys( hitTracker ) )
                if( hitTracker[k].attacks >= 5 )    // if they've hardly attacked not really worth recording
                    GameAnalyticsServer.RecordDesignEvent( player, "SessionHitRatio:" + k, hitTracker[k].hits / hitTracker[k].attacks, 0.1, "%" )
        }
        hitTrackers.delete( player )
    }

    function playerAdded( player: Player ) 
    {        
        let numPlayers = Players.GetPlayers().size()
        warn( "Player count changed: " + numPlayers )
    }

    export function getLocalLevel( player: Player )
    {
        let pcdata = pcs.get( player )
        DebugXL.Assert( pcdata !== undefined )
        if( pcdata )
            return pcdata.getLocalLevel()
        else
            return undefined
    }


    export function getActualLevel( player: Player )
    {
        let pcdata = pcs.get( player )
        DebugXL.Assert( pcdata !== undefined )
        if( pcdata )
            return pcdata.getActualLevel()
        else
            return undefined
    }


    export function publishLevel( player: Player, localLevel: number, actualLevel: number )
    {
        let levelLabel = player.FindFirstChild('leaderstats')!.FindFirstChild<StringValue>('Level') || new Instance('StringValue')
        levelLabel.Name = 'Level'
        levelLabel.Value = localLevel === actualLevel ? tostring(localLevel) : `${localLevel} (${actualLevel})`
        levelLabel.Parent = player.FindFirstChild('leaderstats')
//        }
//        InstanceXL.new( "StringValue", { Name = "Level", Value =  level, Parent = player.leaderstats }, true )
    }

    function playerRemoving( player: Player ) 
    {        
        let numPlayers = Players.GetPlayers().size()
        warn( "Player count changed: " + numPlayers )
    }

    export function pcExists( pc: PC ) {
        for( let v of Object.values( pcs ) )
        {
            if( v===pc )
                return true
        }
        return false
    }


    Players.GetPlayers().forEach( playerAdded )
    Players.PlayerAdded.Connect( playerAdded )

    Players.PlayerRemoving.Connect( (player)=>{ playerRemoving( player ); recordHitRatio( player ) } )
}


