
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea, LogLevel } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Players, Teams } from "@rbxts/services"

import { CharacterKey, CharacterRecordI, CharacterRecordNull } from "ReplicatedStorage/TS/CharacterRecord"
DebugXL.logD(LogArea.Requires, 'PlayerServer: ReplicatedStorage/TS imports succesful')
import { Hero } from "ReplicatedStorage/TS/HeroTS"

import * as GameAnalyticsServer from "ServerStorage/Standard/GameAnalyticsServer"
DebugXL.logD(LogArea.Requires, 'PlayerServer: GameAnalyticsServer imported')

import * as CharacterUtility from "ReplicatedStorage/Standard/CharacterUtility"
DebugXL.logD(LogArea.Requires, 'PlayerServer: Replicated/Standard imports succesful')

import { CharacterClass, CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses"

import { Analytics } from "ServerStorage/TS/Analytics"

import { InstanceUtility } from "ReplicatedStorage/TS/InstanceUtility"
import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'

const heroTeam = Teams.WaitForChild<Team>("Heroes")
const monsterTeam = Teams.WaitForChild<Team>("Monsters")

DebugXL.logD(LogArea.Requires, 'PlayerServer: Analytics imports succesful')

type Character = Model

export enum TeamStyleChoice {
    Hero,
    Monster,
    DungeonLord
}

interface HitTrackerI {
    [k: string]: { hits: number, attacks: number }
}

export class PlayerTracker {
    // you'd think a single map would be better but seems to mean more code; also these tend to be updated independently
    private characterAddedFuncs = new Map<Player, (character: Character) => void>()
    private birthTicks = new Map<Player, number>()
    private currentPCKeys = new Map<Player, CharacterKey>()
    private teamStyleChoices = new Map<Player, TeamStyleChoice>()

    private characterRecords = new Map<CharacterKey, CharacterRecordI>()
    private currentMobKeys = new Map<Character, CharacterKey>()
    private classChoices = new Map<Player, CharacterClass>()

    private hitTrackers = new Map<Player, HitTrackerI>()

    private characterKeyServer = 1;

    getCharacterKeyFromPlayer(player: Player) {
        DebugXL.Assert(player.IsA("Player"))
        const key = this.currentPCKeys.get(player)
        return key ? key : 0
    }

    getCharacterKeyFromCharacterModel(character: Character) {
        DebugXL.Assert(character.IsA('Model'))
        const player = Players.GetPlayerFromCharacter(character)
        if (player) {
            return this.getCharacterKeyFromPlayer(player)
        }
        else {
            const key = this.currentMobKeys.get(character)
            return key ? key : 0
        }
    }

    // used when you know the player exists but aren't sure if they currently have a character (between respawns and choosing heroes)
    getCharacterRecordFromPlayer(player: Player) {
        DebugXL.Assert(player.IsA("Player"))
        const currentCharacterKey = this.currentPCKeys.get(player)
        return currentCharacterKey ? this.characterRecords.get(currentCharacterKey) : undefined
    }

    static readonly timeoutSeconds = 1

    getCharacterRecordFromPlayerWait(player: Player) {
        DebugXL.Assert(player.IsA("Player"))
        const timeout = tick() + PlayerTracker.timeoutSeconds
        while (tick() < timeout) {
            const record = this.getCharacterRecordFromPlayer(player)
            if (record !== undefined)
                return record
            wait()
        }
        DebugXL.logE(LogArea.Players, 'getCharacterRecrodFromPlayerWait timed out on ' + player.Name)
    }

    // used for AI mobs and when we don't know if there's a player
    getCharacterRecord(characterKey: CharacterKey): CharacterRecordI {
        DebugXL.Assert(characterKey !== undefined)
        if (characterKey) {
            DebugXL.Assert(typeOf(characterKey) === 'number')
            const characterRecord = this.characterRecords.get(characterKey)
            DebugXL.Assert(characterRecord !== undefined)
            return characterRecord!
        }
        return new CharacterRecordNull();
    }

    getCharacterRecordFromCharacter(character: Character) {
        DebugXL.Assert(character.IsA("Model"))
        const characterKey = this.getCharacterKeyFromCharacterModel(character)
        if (characterKey !== 0) {
            return this.getCharacterRecord(characterKey)
        }
        else {
            return new CharacterRecordNull() 
        }
    }

    getCharacterRecordWait(characterKey: CharacterKey) {
        DebugXL.Assert(typeOf(characterKey) === "string")
        for (; ;) {
            let characterRecord = this.getCharacterRecord(characterKey)
            if (characterRecord)
                return characterRecord
            wait()
        }
    }

    publishCharacterClass(player: Player, charClass: CharacterClass) {
        DebugXL.Assert(player.IsA("Player"))
        DebugXL.Assert(typeOf(charClass) === "string")
        warn(player.Name + " publish class " + charClass)
        DebugXL.dumpCallstack(LogLevel.Verbose, LogArea.Characters)
        const leaderstats = InstanceUtility.findOrCreateChild<Model>(player, "leaderstats", "Model")
        let classValueObj = InstanceUtility.findOrCreateChild<StringValue>(leaderstats, "Class", "StringValue")
        classValueObj.Value = charClass === "NullClass" ? "" : charClass
    }

    // doing assertions below because we're called from lua so can't always check at compile time
    setCharacterRecordForPlayer(player: Player, characterRecord: CharacterRecordI) {
        DebugXL.Assert(player.IsA('Player'))
        DebugXL.Assert(characterRecord !== undefined)
        // clean garbage
        const oldCharacterKey = this.currentPCKeys.get(player)
        if (oldCharacterKey) {
            this.characterRecords.delete(oldCharacterKey)
        }

        // publish to leaderstats
        this.publishCharacterClass(player, characterRecord.idS)

        // this is also when we assign a characterKey        
        const newCharacterKey = this.instantiateCharacterRecord(characterRecord)
        this.currentPCKeys.set(player, newCharacterKey)
        return newCharacterKey
    }

    setClassChoice(player: Player, charClass: CharacterClass) {
        DebugXL.Assert(player.IsA("Player"))
        DebugXL.Assert(charClass === "NullClass"
            || (player.Team === heroTeam && (CharacterClasses.heroStartingStats[charClass] !== undefined))
            || (player.Team === monsterTeam && (CharacterClasses.monsterStats[charClass] !== undefined)))
        this.classChoices.set(player, charClass)

        // publish'
        if (charClass === "NullClass") {
            this.publishCharacterClass(player, charClass)
        }
    }

    // returns NullClass if haven't chosen, don't exist
    getCharacterClass(player: Player) {
        DebugXL.Assert(player.IsA("Player"))
        const record = this.getCharacterRecordFromPlayer(player)
        return record ? record.idS : "NullClass"
    }

    // waits until a non-null class is being played
    getClassWait(player: Player) {
        DebugXL.Assert(player.IsA("Player"))
        for (; ;) {
            const cClass = this.getCharacterClass(player)
            if (cClass !== "NullClass") {
                return cClass;
            }
            wait()
        }
    }

    getClassChoice(player: Player) {
        DebugXL.Assert(player.IsA("Player"))
        return this.classChoices.get(player) || "NullClass"
    }

    // waits until a non-null class is chosen
    getClassChoiceWait(player: Player) {
        DebugXL.Assert(player.IsA("Player"))
        for (; ;) {
            const cClass = this.getClassChoice(player)
            if (cClass !== "NullClass") {
                return cClass;
            }
            wait()
        }
    }

    setCharacterRecordForMob(characterModel: Character, characterRecord: CharacterRecordI) {
        DebugXL.Assert(characterModel.IsA("Model"))
        // make sure we're not adding twice
        DebugXL.Assert(this.currentMobKeys.get(characterModel) === undefined)

        const newCharacterKey = this.instantiateCharacterRecord(characterRecord)
        this.currentMobKeys.set(characterModel, newCharacterKey)
        return newCharacterKey
    }

    instantiateCharacterRecord(characterRecord: CharacterRecordI) {
        DebugXL.Assert(characterRecord !== undefined)
        const newCharacterKey = this.characterKeyServer++
        this.characterRecords.set(newCharacterKey, characterRecord)
        return newCharacterKey
    }

    // gets all records for _instantiated_ characters: this is keyed off either player or character depending
    // on whether a mob or not
    getCharacterRecords() {
        return this.characterRecords
    }

    getHeroRecords() {
        let heroes: Array<Hero> = []
        this.getCharacterRecords().forEach((c) => { if (c instanceof Hero) heroes.push(c as Hero) })
        return heroes
    }

    getPlayerCharacterRecords() {
        let pcRecords = new Map<Player, CharacterRecordI>()
        for (let [k, v] of Object.entries(this.currentPCKeys)) {
            pcRecords.set(k, this.getCharacterRecord(v))
        }
        return pcRecords
    }

    customCharacterAddedConnect(player: Player, charAddedFunc: (character: Character) => void) {
        DebugXL.Assert(!this.characterAddedFuncs.has(player))
        this.characterAddedFuncs.set(player, charAddedFunc)
    }

    callCharacterAdded(player: Player, character: Character) {
        DebugXL.Assert(character.FindFirstChild("Humanoid") !== undefined)
        let func = this.characterAddedFuncs.get(player)
        DebugXL.Assert(func !== undefined)
        if (func)
            spawn(function () { func!(character) })
        this.birthTicks.set(player, tick())
    }

    recordCharacterDeath(player: Player, character: Character) {
        DebugXL.Assert(player.IsA("Player"))
        let birthTick = this.birthTicks.get(player)
        let lifetime = 0
        if (birthTick) {
            lifetime = tick() - birthTick
            this.birthTicks.delete(player)
        }

        let lastAttackingPlayer = CharacterUtility.GetLastAttackingPlayer(character);

        Analytics.ReportEvent(player,
            'Death',
            lastAttackingPlayer ? tostring(lastAttackingPlayer.UserId) : "",
            this.getCharacterClass(player),
            lifetime)  // life will be a little easier if we include the attacking player's class here but we can determine that from sql

        return lifetime
    }

    markHit(player: Player, category: string) {
        DebugXL.Assert(player.IsA("Player"))
        if (player.Parent) {
            let hitTracker = this.hitTrackers.get(player)
            DebugXL.Assert(hitTracker !== undefined)
            if (hitTracker) {
                DebugXL.Assert(hitTracker[category] !== undefined)
                if (hitTracker[category])
                    hitTracker[category].hits += 1
            }
        }
    }

    markAttack(player: Player, category: string) {
        DebugXL.Assert(player.IsA("Player"))
        if (player.Parent) {
            let hitTracker = this.hitTrackers.get(player)
            if (hitTracker) {
                DebugXL.Assert(hitTracker[category] !== undefined)
                if (hitTracker[category]) {
                    hitTracker[category].attacks += 1
                    DebugXL.logV(LogArea.Combat, player.Name + " " + category + " hit ratio so far: " + hitTracker[category].hits + "/" + hitTracker[category].attacks)
                }
            }
            else {
                let newHitTracker: HitTrackerI = { Ranged: { hits: 0, attacks: 0 }, Melee: { hits: 0, attacks: 0 } }
                newHitTracker[category] = { hits: 0, attacks: 1 }
                this.hitTrackers.set(player, newHitTracker)
            }
        }
    }

    recordHitRatio(player: Player) {
        DebugXL.Assert(player.IsA("Player"))
        let hitTracker = this.hitTrackers.get(player)
        if (hitTracker) {
            for (let k of Object.keys(hitTracker))
                if (hitTracker[k].attacks >= 5)    // if they've hardly attacked not really worth recording
                    GameAnalyticsServer.RecordDesignEvent(player, "SessionHitRatio:" + k, hitTracker[k].hits / hitTracker[k].attacks, 0.1, "%")
        }
        this.hitTrackers.delete(player)
    }

    playerAdded(player: Player) {
        DebugXL.Assert(player.IsA("Player"))
        let numPlayers = Players.GetPlayers().size()
        warn("Player count changed: " + numPlayers)
    }

    playerRemoving(player: Player) {
        DebugXL.Assert(player.IsA("Player"))
        let numPlayers = Players.GetPlayers().size()
        warn("Player count changed: " + numPlayers)
    }

    getLocalLevel(characterKey: CharacterKey) {
        DebugXL.Assert(typeOf(characterKey) === 'number')
        let pcdata = this.getCharacterRecord(characterKey)
        DebugXL.Assert(pcdata !== undefined)
        if (pcdata)
            return pcdata.getLocalLevel()
        else
            return 0
    }


    getActualLevel(characterKey: CharacterKey) {
        DebugXL.Assert(typeOf(characterKey) === 'number')
        let pcdata = this.getCharacterRecord(characterKey)
        DebugXL.Assert(pcdata !== undefined)
        if (pcdata)
            return pcdata.getActualLevel()
        else
            return undefined
    }


    publishLevel(player: Player, localLevel: number, actualLevel: number) {
        DebugXL.Assert(player.IsA("Player"))
        DebugXL.Assert(typeOf(localLevel)==="number")
        DebugXL.Assert(typeOf(actualLevel)==="number")
        let leaderstats = InstanceUtility.findOrCreateChild<Model>(player, "leaderstats", "Model")
        let levelLabel = InstanceUtility.findOrCreateChild<StringValue>(leaderstats, "Level", "StringValue")
        levelLabel.Value = localLevel === actualLevel ? tostring(localLevel) : `${localLevel} (${actualLevel})`
    }


    pcExists(characterRecord: CharacterRecordI) {
        for (let [k, v] of Object.entries(this.characterRecords)) {
            if (v === characterRecord)
                return true
        }
        return false
    }

    getPlayer(characterKey: CharacterKey) {
        DebugXL.Assert( typeOf(characterKey)==="number" )
        for (let [k, v] of Object.entries(this.currentPCKeys)) {
            if (v === characterKey) {
                return k
            }
        }
        return undefined
    }

    getCharacterModel(characterKey: CharacterKey) {
        DebugXL.Assert( typeOf(characterKey)==="number" )
        for (let [k, v] of Object.entries(this.currentMobKeys)) {
            if (v === characterKey) {
                return k
            }
        }
        let player = this.getPlayer(characterKey)
        if (player) {
            return player.Character
        }
        return undefined
    }

    getName(characterKey: CharacterKey) {
        DebugXL.Assert( typeOf(characterKey)==="number" )
        const player = this.getPlayer(characterKey)
        if (player) { return player.Name }
        const character = this.getCharacterModel(characterKey)
        if (character) { return character.Name }
    }

    setTeamStyleChoice(player: Player, teamStyleChoice: TeamStyleChoice) {
        DebugXL.Assert(player.IsA("Player"))
        this.teamStyleChoices.set(player, teamStyleChoice)
    }

    getTeamStyleChoice(player: Player) {
        DebugXL.Assert(player.IsA("Player"))
        return this.teamStyleChoices.get(player) || TeamStyleChoice.DungeonLord
    }

    collectGarbage() {
        for (let [player, characterKey] of this.currentPCKeys.entries()) {
            if (!player.Parent) {
                this.characterRecords.delete(characterKey)
                this.currentPCKeys.delete(player)
            }
        }
    }
}

// this global namespace is a necessary evil as we gradually push references to contexts throught our functions and classes
// to make them testable. The goal is to reduce its use to almost nothing over time.
export namespace PlayerServer {
    let playerTracker = new PlayerTracker()

    // like MainContext.get(), this is a stopgap function as we spread context and playertracker references throughout
    // our functions and classes
    export function getPlayerTracker() {
        return playerTracker
    }

    export function getCharacterKeyFromPlayer(player: Player) {
        return playerTracker.getCharacterKeyFromPlayer(player)
    }

    export function getCharacterKeyFromCharacterModel(character: Character) {
        return playerTracker.getCharacterKeyFromCharacterModel(character)
    }

    // used when you know the player exists but aren't sure if they currently have a character (between respawns and choosing heroes)
    export function getCharacterRecordFromPlayer(player: Player) {
        return playerTracker.getCharacterRecordFromPlayer(player)
    }

    export function getCharacterRecordFromPlayerWait(player: Player) {
        return playerTracker.getCharacterRecordFromPlayerWait(player)
    }

    // used for AI mobs and when we don't know if there's a player
    export function getCharacterRecord(characterKey: CharacterKey): CharacterRecordI {
        return playerTracker.getCharacterRecord(characterKey)
    }

    export function getCharacterRecordFromCharacter(character: Character) {
        return playerTracker.getCharacterRecordFromCharacter(character)
    }

    export function getCharacterRecordWait(characterKey: CharacterKey) {
        return playerTracker.getCharacterRecordWait(characterKey)
    }

    export function publishCharacterClass(player: Player, charClass: CharacterClass) {
        return playerTracker.publishCharacterClass(player, charClass)
    }

    // doing assertions below because we're called from lua so can't always check at compile time
    export function setCharacterRecordForPlayer(player: Player, characterRecord: CharacterRecordI) {
        return playerTracker.setCharacterRecordForPlayer(player, characterRecord)
    }

    export function setClassChoice(player: Player, charClass: CharacterClass) {
        playerTracker.setClassChoice(player, charClass)
    }

    // returns NullClass if haven't chosen, don't exist
    export function getCharacterClass(player: Player) {
        return playerTracker.getCharacterClass(player)
    }

    // waits until a non-null class is being played
    export function getClassWait(player: Player) {
        return playerTracker.getClassWait(player)
    }

    export function getClassChoice(player: Player) {
        return playerTracker.getClassChoice(player)
    }

    // waits until a non-null class is chosen
    export function getClassChoiceWait(player: Player) {
        return playerTracker.getClassChoiceWait(player)
    }

    export function setCharacterRecordForMob(characterModel: Character, characterRecord: CharacterRecordI) {
        return playerTracker.setCharacterRecordForMob(characterModel, characterRecord)
    }

    export function instantiateCharacterRecord(characterRecord: CharacterRecordI) {
        return playerTracker.instantiateCharacterRecord(characterRecord)
    }

    // gets all records for _instantiated_ characters: this is keyed off either player or character depending
    // on whether a mob or not
    export function getCharacterRecords() {
        return playerTracker.getCharacterRecords()
    }

    export function getHeroRecords() {
        return playerTracker.getHeroRecords()
    }

    export function getPlayerCharacterRecords() {
        return playerTracker.getPlayerCharacterRecords()
    }

    export function customCharacterAddedConnect(player: Player, charAddedFunc: (character: Character) => void) {
        playerTracker.customCharacterAddedConnect(player, charAddedFunc)
    }

    export function callCharacterAdded(player: Player, character: Character) {
        playerTracker.callCharacterAdded(player, character)
    }

    export function recordCharacterDeath(player: Player, character: Character) {
        return playerTracker.recordCharacterDeath(player, character)
    }

    export function markHit(player: Player, category: string) {
        playerTracker.markHit(player, category)
    }

    export function markAttack(player: Player, category: string) {
        playerTracker.markAttack(player, category)
    }

    export function recordHitRatio(player: Player) {
        playerTracker.recordHitRatio(player)
    }

    function playerAdded(player: Player) {
        playerTracker.playerAdded(player)
    }

    export function getLocalLevel(characterKey: CharacterKey) {
        return playerTracker.getLocalLevel(characterKey)
    }


    export function getActualLevel(characterKey: CharacterKey) {
        return playerTracker.getActualLevel(characterKey)
    }


    export function publishLevel(player: Player, localLevel: number, actualLevel: number) {
        playerTracker.publishLevel(player, localLevel, actualLevel)
    }

    function playerRemoving(player: Player) {
        playerTracker.playerRemoving(player)
    }

    export function pcExists(characterRecord: CharacterRecordI) {
        return playerTracker.pcExists(characterRecord)
    }

    export function getPlayer(characterKey: CharacterKey) {
        return playerTracker.getPlayer(characterKey)
    }

    export function getCharacterModel(characterKey: CharacterKey) {
        return playerTracker.getCharacterModel(characterKey)
    }

    export function getName(characterKey: CharacterKey) {
        return playerTracker.getName(characterKey)
    }

    export function setTeamStyleChoice(player: Player, teamStyleChoice: TeamStyleChoice) {
        playerTracker.setTeamStyleChoice(player, teamStyleChoice)
    }

    export function getTeamStyleChoice(player: Player) {
        return playerTracker.getTeamStyleChoice(player)
    }

    Players.GetPlayers().forEach(playerAdded)
    Players.PlayerAdded.Connect(playerAdded)

    Players.PlayerRemoving.Connect((player) => { playerRemoving(player); recordHitRatio(player) })

    spawn(() => {
        // garbage collection
        while (true) {
            wait(1.1)
            playerTracker.collectGarbage()
        }
    })

}