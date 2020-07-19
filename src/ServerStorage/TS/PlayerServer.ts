
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { Players } from "@rbxts/services"

import { CharacterKey, CharacterRecordI, CharacterRecordNull } from "ReplicatedStorage/TS/CharacterRecord"
DebugXL.logD("Requires", 'PlayerServer: ReplicatedStorage/TS imports succesful')

import * as GameAnalyticsServer from "ServerStorage/Standard/GameAnalyticsServer"
DebugXL.logD("Requires", 'PlayerServer: GameAnalyticsServer imported')

import * as CharacterClientI from "ReplicatedStorage/Standard/CharacterClientI"
import * as CharacterUtility from "ReplicatedStorage/Standard/CharacterUtility"
DebugXL.logD("Requires", 'PlayerServer: Replicated/Standard imports succesful')

import { Analytics } from "ServerStorage/TS/Analytics"

DebugXL.logD("Requires", 'PlayerServer: Analytics imports succesful')

type Character = Model

export enum TeamStyleChoice {
    Hero,
    Monster,
    DungeonLord
}

export namespace PlayerServer {
    // you'd think a single map would be better but seems to mean more code; also these tend to be updated independently
    let characterAddedFuncs = new Map<Player, (character: Character) => void>()
    let birthTicks = new Map<Player, number>()
    let currentPCKeys = new Map<Player, CharacterKey>()
    let teamStyleChoices = new Map<Player, TeamStyleChoice>()

    let characterRecords = new Map<CharacterKey, CharacterRecordI>()
    let currentMobKeys = new Map<Character, CharacterKey>()

    let characterKeyServer = 1;

    export function getCharacterKeyFromPlayer(player: Player) {
        const key = currentPCKeys.get(player)
        return key ? key : 0
    }

    export function getCharacterKeyFromCharacterModel(character: Character) {
        DebugXL.Assert(character.IsA('Model'))
        DebugXL.Assert(character.Parent !== undefined)
        const player = Players.GetPlayerFromCharacter(character)
        if (player) {
            return getCharacterKeyFromPlayer(player)
        }
        else {
            const key = currentMobKeys.get(character)
            return key ? key : 0
        }
    }

    // used when you know the player exists but aren't sure if they currently have a character (between respawns and choosing heroes)
    export function getCharacterRecordFromPlayer(player: Player) {
        const currentCharacterKey = currentPCKeys.get(player)
        return currentCharacterKey ? characterRecords.get(currentCharacterKey) : undefined
    }

    const timeoutSeconds = 10
    export function getCharacterRecordFromPlayerWait(player: Player) {
        const timeout = tick() + timeoutSeconds
        while (tick() < timeout) {
            const record = getCharacterRecordFromPlayer(player)
            if (record !== undefined)
                return record
            wait()
        }
        DebugXL.logE('Players', 'PlayerServer.getCharacterRecrodFromPlayerWait timed out on ' + player.Name)
    }

    // used for AI mobs and when we don't know if there's a player
    export function getCharacterRecord(characterKey: CharacterKey): CharacterRecordI {
        DebugXL.Assert(characterKey !== undefined)
        if (characterKey) {
            DebugXL.Assert(typeOf(characterKey) === 'number')
            const characterRecord = characterRecords.get(characterKey)
            DebugXL.Assert(characterRecord !== undefined)
            return characterRecord!
        }
        return new CharacterRecordNull();
    }

    export function getCharacterRecordFromCharacter(character: Character) {
        const characterKey = getCharacterKeyFromCharacterModel(character)
        if (characterKey !== 0) {
            return getCharacterRecord(characterKey)
        }
        else {
            return undefined // probably a structure
        }
    }

    export function getCharacterRecordWait(characterKey: CharacterKey) {
        for (; ;) {
            let characterRecord = getCharacterRecord(characterKey)
            if (characterRecord)
                return characterRecord
            wait()
        }
    }

    // doing assertions below because we're called from lua so can't always check at compile time
    export function setCharacterRecordForPlayer(player: Player, characterRecord: CharacterRecordI) {
        DebugXL.Assert(player.IsA('Player'))
        DebugXL.Assert(characterRecord !== undefined)
        // clean garbage
        const oldCharacterKey = currentPCKeys.get(player)
        if (oldCharacterKey) {
            characterRecords.delete(oldCharacterKey)
        }

        // this is also when we assign a characterKey        
        const newCharacterKey = instantiateCharacterRecord(characterRecord)
        currentPCKeys.set(player, newCharacterKey)
        return newCharacterKey
    }

    export function setCharacterRecordForMob(characterModel: Character, characterRecord: CharacterRecordI) {
        // make sure we're not adding twice
        DebugXL.Assert(currentMobKeys.get(characterModel) === undefined)

        const newCharacterKey = instantiateCharacterRecord(characterRecord)
        currentMobKeys.set(characterModel, newCharacterKey)
        return newCharacterKey
    }

    export function instantiateCharacterRecord(characterRecord: CharacterRecordI) {
        DebugXL.Assert(characterRecord !== undefined)
        const newCharacterKey = characterKeyServer++
        characterRecords.set(newCharacterKey, characterRecord)
        return newCharacterKey
    }

    // gets all records for _instantiated_ characters: this is keyed off either player or character depending
    // on whether a mob or not
    export function getCharacterRecords() {
        return characterRecords
    }

    export function getPlayerCharacterRecords() {
        let pcRecords = new Map<Player, CharacterRecordI>()
        for (let [k, v] of Object.entries(currentPCKeys)) {
            pcRecords.set(k, getCharacterRecord(v))
        }
        return pcRecords
    }


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
                    DebugXL.logV(script.Name, player.Name + " " + category + " hit ratio so far: " + hitTracker[category].hits + "/" + hitTracker[category].attacks)
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

    export function getLocalLevel(characterKey: CharacterKey) {
        DebugXL.Assert(typeOf(characterKey) === 'number')
        let pcdata = getCharacterRecord(characterKey)
        DebugXL.Assert(pcdata !== undefined)
        if (pcdata)
            return pcdata.getLocalLevel()
        else
            return 0
    }


    export function getActualLevel(characterKey: CharacterKey) {
        DebugXL.Assert(typeOf(characterKey) === 'number')
        let pcdata = getCharacterRecord(characterKey)
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

    export function pcExists(characterRecord: CharacterRecordI) {
        for (let [k, v] of Object.entries(characterRecords)) {
            if (v === characterRecord)
                return true
        }
        return false
    }

    export function getPlayer(characterKey: CharacterKey) {
        for (let [k, v] of Object.entries(currentPCKeys)) {
            if (v === characterKey) {
                return k
            }
        }
        return undefined
    }

    export function getCharacterModel(characterKey: CharacterKey) {
        for (let [k, v] of Object.entries(currentMobKeys)) {
            if (v === characterKey) {
                return k
            }
        }
        let player = getPlayer(characterKey)
        if (player) {
            return player.Character
        }
        return undefined
    }

    export function getName(characterKey: CharacterKey) {
        const player = getPlayer(characterKey)
        if (player) { return player.Name }
        const character = getCharacterModel(characterKey)
        if (character) { return character.Name }
    }

    export function setTeamStyleChoice(player: Player, teamStyleChoice: TeamStyleChoice) {
        teamStyleChoices.set(player, teamStyleChoice)
    }

    export function getTeamStyleChoice(player: Player) {
        return teamStyleChoices.get(player) || TeamStyleChoice.DungeonLord
    }

    Players.GetPlayers().forEach(playerAdded)
    Players.PlayerAdded.Connect(playerAdded)

    Players.PlayerRemoving.Connect((player) => { playerRemoving(player); recordHitRatio(player) })

    spawn(() => {
        // garbage collection
        while (true) {
            wait(1.1)
            for (let [player, characterKey] of currentPCKeys.entries()) {
                if (!player.Parent) {
                    characterRecords.delete(characterKey)
                    currentPCKeys.delete(player)
                }
            }
        }
    })

}


