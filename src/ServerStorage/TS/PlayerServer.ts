print('PlayerServer.ts executed')
import { Players, Teams, ServerStorage } from "@rbxts/services"

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
print('PlayerServer: ReplicatedStorage/TS imports succesful')

import * as GameAnalyticsServer from "ServerStorage/Standard/GameAnalyticsServer"
print('PlayerServer: GameAnalyticsServer imported')

import * as CharacterClientI from "ReplicatedStorage/Standard/CharacterClientI"
import * as CharacterUtility from "ReplicatedStorage/Standard/CharacterUtility"
print('PlayerServer: Replicated/Standard imports succesful')

import { Analytics } from "ServerStorage/TS/Analytics"
print('PlayerServer: Analytics imports succesful')

type Character = Model

export namespace PlayerServer {
    let characterAddedFuncs = new Map<Player, (character: Character) => void>()
    let birthTicks = new Map<Player, number>()

    let characterRecords = new Map<Character, CharacterRecord>()


    let playerCharacterRecords = new Map<Player, CharacterRecord>()

    // used when you know the player exists but aren't sure if their Roblox character is currently instantiated
    export function getCharacterRecordFromPlayer(player: Player) 
    {
        return playerCharacterRecords.get(player)
    }

    export function getCharacterRecordFromPlayerWait(player: Player) 
    {
        for(;;)
        {
            const record = playerCharacterRecords.get( player )
            if( record !== undefined )
                return record
            wait()
        }
    }

    // used for AI mobs
    export function getCharacterRecord(character: Character) 
    {
        DebugXL.Assert( character !== undefined )
        if( character )
        {
            let characterRecord = characterRecords.get(character)
            return characterRecord
        }
        return undefined
    }

    export function getCharacterRecordWait(character: Character) 
    {
        for(;;)
        {
            let characterRecord = characterRecords.get(character)
            if( characterRecord )
                return characterRecord
            wait()
        }
    }

    // doing assertions below because we're called from lua so can't always check at compile time

    // this looks ugly having the double key maps but I think it's best because players get their character records before
    // their character is instantiated but mobs never have players
    export function setCharacterRecordForPlayer(player: Player, characterRecord: CharacterRecord)
    {
        DebugXL.Assert(player.IsA('Player'))
        DebugXL.Assert(characterRecord!==undefined)
        playerCharacterRecords.set( player, characterRecord )
    }

    export function setCharacterRecord(player: Player, character: Character, characterRecord: CharacterRecord)
    {
        DebugXL.Assert(player.IsA('Player'))
        DebugXL.Assert(character.IsA('Model'))
        DebugXL.Assert(characterRecord!==undefined)
        characterRecords.set( character, characterRecord )
        playerCharacterRecords.set( player, characterRecord )
    }

    export function deleteCharaterRecord(player: Player, character: Character)
    {
        DebugXL.Assert(player.IsA('Player'))
        DebugXL.Assert(character.IsA('Model'))
        characterRecords.delete( character )
        playerCharacterRecords.delete( player )
    }
    
    export function getCharacterRecords() { return characterRecords }
    export function getPlayerCharacterRecords() { return playerCharacterRecords }


    interface HitTrackerI {
        [k: string]: { hits: number, attacks: number }
    }

    export let hitTrackers = new Map<Player, HitTrackerI>()

    export function customCharacterAddedConnect(player: Player, charAddedFunc: (character: Character) => void) {
        DebugXL.Assert(!characterAddedFuncs.has(player))
        characterAddedFuncs.set(player, charAddedFunc)
    }

    export function callCharacterAdded(player: Player, character: Character) {
        DebugXL.Assert(character.FindFirstChild("Humanoid") !== undefined)
        let func = characterAddedFuncs.get(player)
        DebugXL.Assert(func !== undefined)
        if (func)
            spawn(function () { func!(character) })
        birthTicks.set(player, tick())
    }

    export function recordCharacterDeath(player: Player, character: Character) {
        let birthTick = birthTicks.get(player)
        let lifetime = 0
        if (birthTick) {
            lifetime = tick() - birthTick
            birthTicks.delete(player)
        }

        let lastAttackingPlayer = CharacterUtility.GetLastAttackingPlayer(character);

        Analytics.ReportEvent(player,
            'Death',
            lastAttackingPlayer ? tostring(lastAttackingPlayer.UserId) : "",
            CharacterClientI.GetCharacterClass(player),
            lifetime)  // life will be a little easier if we include the attacking player's class here but we can determine that from sql

        return lifetime
    }

    export function markHit(player: Player, category: string) {
        if (player.Parent) {
            let hitTracker = hitTrackers.get(player)
            DebugXL.Assert(hitTracker !== undefined)
            if (hitTracker) {
                DebugXL.Assert(hitTracker[category] !== undefined)
                if (hitTracker[category])
                    hitTracker[category].hits += 1
            }
        }
    }

    export function markAttack(player: Player, category: string) {
        if (player.Parent) {
            let hitTracker = hitTrackers.get(player)
            if (hitTracker) {
                DebugXL.Assert(hitTracker[category] !== undefined)
                if (hitTracker[category]) {
                    hitTracker[category].attacks += 1
                    //print( player.Name + " " + category + " hit ratio so far: " + hitTracker[category].hits + "/" + hitTracker[category].attacks )
                }
            }
            else {
                let newHitTracker: HitTrackerI = { Ranged: { hits: 0, attacks: 0 }, Melee: { hits: 0, attacks: 0 } }
                newHitTracker[category] = { hits: 0, attacks: 1 }
                hitTrackers.set(player, newHitTracker)
            }
        }
    }

    export function recordHitRatio(player: Player) {
        let hitTracker = hitTrackers.get(player)
        if (hitTracker) {
            for (let k of Object.keys(hitTracker))
                if (hitTracker[k].attacks >= 5)    // if they've hardly attacked not really worth recording
                    GameAnalyticsServer.RecordDesignEvent(player, "SessionHitRatio:" + k, hitTracker[k].hits / hitTracker[k].attacks, 0.1, "%")
        }
        hitTrackers.delete(player)
    }

    function playerAdded(player: Player) {
        let numPlayers = Players.GetPlayers().size()
        warn("Player count changed: " + numPlayers)
    }

    export function getLocalLevel(character: Character) {
        let pcdata = characterRecords.get(character)
        DebugXL.Assert(pcdata !== undefined)
        if (pcdata)
            return pcdata.getLocalLevel()
        else
            return undefined
    }


    export function getActualLevel(character: Character) {
        let pcdata = characterRecords.get(character)
        DebugXL.Assert(pcdata !== undefined)
        if (pcdata)
            return pcdata.getActualLevel()
        else
            return undefined
    }


    export function publishLevel(player: Player, localLevel: number, actualLevel: number) {
        let levelLabel = player.FindFirstChild('leaderstats')!.FindFirstChild<StringValue>('Level') || new Instance('StringValue')
        levelLabel.Name = 'Level'
        levelLabel.Value = localLevel === actualLevel ? tostring(localLevel) : `${localLevel} (${actualLevel})`
        levelLabel.Parent = player.FindFirstChild('leaderstats')
        //        }
        //        InstanceXL.new( "StringValue", { Name = "Level", Value =  level, Parent = player.leaderstats }, true )
    }

    function playerRemoving(player: Player) {
        let numPlayers = Players.GetPlayers().size()
        warn("Player count changed: " + numPlayers)
    }

    export function pcExists(characterRecord: CharacterRecord) {
        for (let v of Object.values(characterRecords)) {
            if (v === characterRecord)
                return true
        }
        return false
    }

    Players.GetPlayers().forEach(playerAdded)
    Players.PlayerAdded.Connect(playerAdded)

    Players.PlayerRemoving.Connect((player) => { playerRemoving(player); recordHitRatio(player) })
}


