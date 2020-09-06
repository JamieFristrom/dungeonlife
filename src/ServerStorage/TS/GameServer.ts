
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { CollectionService, Players, Teams, Workspace } from "@rbxts/services"

import Inventory from "ServerStorage/Standard/InventoryModule"

import MapTileData from "ReplicatedStorage/Standard/MapTileDataModule"
import MathXL from "ReplicatedStorage/Standard/MathXL"

import { Hero } from "ReplicatedStorage/TS/HeroTS"

import Heroes from "ServerStorage/Standard/HeroesModule"

import { MessageServer } from "./MessageServer"
import { PlayerServer, TeamStyleChoice, PlayerTracker } from "./PlayerServer"
import { DungeonPlayer, DungeonPlayerMap } from "./DungeonPlayer"
import { SuperbossManager } from "./SuperbossManager"

import { SpawnerUtility } from "ReplicatedStorage/TS/SpawnerUtility"
import { DungeonDeck } from "./DungeonDeck"
import { HeroServer } from "./HeroServer"
import { MonsterServer } from "./MonsterServer"
import { ServerContextI } from "./ServerContext"


export enum LevelResultEnum {
    InProgress = "InProgress",
    TPK = "TPK",
    ExitReached = "ExitReached",
    LoungeModeOver = "LoungeModeOver",
    BeatSuperboss = "BeatSuperboss"
}

// // it was this way up until 9/30 - in general, monster swarms too rough on fuller servers. Thought about changing radar but they'd still
// -- swarm on exit and entrance
// -- constants
// --const numHeroTeamNeededPerPlayer = 
// --{
// --	[1] = 0,   
// --	[2] = 1,   -- 1v1
// --	[3] = 1,   -- 1v2
// --	[4] = 1,   -- 1v3
// --	[5] = 2,   -- 2v3  -- this was what I'm least sure about, but actually seems pretty good?
// --	[6] = 2,   -- 2v4
// --	[7] = 2,   -- 2v5
// --	[8] = 2,   -- 2v6  -- this might be too tough
// --	[9] = 3,   -- 3v6  -- this is probably fine
// --	[10] = 3,  -- 3v7
// --	[11] = 3,  -- 3v8
// --	[12] = 3,  -- 3v9  -- this might be too tough
// --	[13] = 4,  -- 4v9  -- calling optimal (a lot of monsters but also a lot of time spent as hero) but only if you don't take into account possible wide hero spreads
// --	[14] = 4,  -- 4v10  
// --	[15] = 4,  -- 4v11
// --	[16] = 4,  -- 4v12  -- capping here.
// --	[17] = 5,  -- 5v12
// --	[18] = 5,  -- 5v13
// --}

let numHeroesNeededPerPlayer: number[] = []

numHeroesNeededPerPlayer[0] = 0;
numHeroesNeededPerPlayer[1] = 0;
numHeroesNeededPerPlayer[2] = 1;   // 1v1
numHeroesNeededPerPlayer[3] = 1;   // 1v2
numHeroesNeededPerPlayer[4] = 1;   // 1v3
numHeroesNeededPerPlayer[5] = 2;   // 2v3  // this was what I'm least sure about; but actually seems pretty good?
numHeroesNeededPerPlayer[6] = 2;   // 2v4
numHeroesNeededPerPlayer[7] = 3;   // 3v4
numHeroesNeededPerPlayer[8] = 3;   // 3v5  // don't know!
numHeroesNeededPerPlayer[9] = 3;   // 3v6  // don't know!  //  I've capped the server here. It probably won't fill up because of the Roblox algorithm; but we'll see 
// on the one hand; more players probably leads to more success all things being equal
// on the other hand; the more heroes; the more likely you're going to have discrepencies in hero level
// and the more players the more swarming

//	numHeroesNeededPerPlayer[9] = 4;   // 4v5  // this is probably fine
numHeroesNeededPerPlayer[10] = 4;  // 4v6
numHeroesNeededPerPlayer[11] = 4;  // 4v7
numHeroesNeededPerPlayer[12] = 5;  // 5v7  // and let's cap it here.

//	numHeroesNeededPerPlayer[13] = 4;  // 4v9  // calling optimal (a lot of monsters but also a lot of time spent as hero) but only if you don't take into account possible wide hero spreads
//	numHeroesNeededPerPlayer[14] = 4;  // 4v10  
//	numHeroesNeededPerPlayer[15] = 4;  // 4v11
//	numHeroesNeededPerPlayer[16] = 4;  // 4v12  // capping here.
//	numHeroesNeededPerPlayer[17] = 5;  // 5v12
//	numHeroesNeededPerPlayer[18] = 5;  // 5v13

const gameManagementFolder = Workspace.WaitForChild<Folder>("GameManagement")
const preparationCountdownValue = gameManagementFolder.WaitForChild<NumberValue>("PreparationCountdown")

const heroRespawnDuration = gameManagementFolder.WaitForChild<BoolValue>("FastStart").Value ? 5 : 15

const HeroTeam = Teams.WaitForChild<Team>("Heroes")
const MonsterTeam = Teams.WaitForChild<Team>("Monsters")

const signals = Workspace.WaitForChild<Folder>("Signals")

const chooseHeroRE = signals.WaitForChild<RemoteEvent>("ChooseHeroRE")

export namespace GameServer {
    let superbossManager = new SuperbossManager()
    export let levelSession = 0
    export const heroDeathSavoringSecondsK = 3
    let previousCheckHeroesDead = true

    export function getSuperbossManager() {
        return superbossManager
    }

    export function numHeroesNeeded() {
        let nonNoobs = Players.GetPlayers().filter((player) => !Inventory.PlayerInTutorial(player))
        return numHeroesNeededPerPlayer[nonNoobs.size()]
    }

    export function askPlayersToRate() {
        let players = Players.GetPlayers()
        for (let player of players) {
            if (Inventory.IsStarFeedbackDue(player)) {
                let starFeedbackCount = Inventory.GetCount(player, "StarFeedbackCount")
                let messageCode = starFeedbackCount > 0 ? "!StarFeedbackRepeat" : "!StarFeedback"
                MessageServer.PostMessageByKey(player, messageCode, false, 0, true)
                Inventory.SetNextStarFeedbackDueTime(player)
            }
        }
    }

    export function chooseSpawn(player: Player, monsterSpawns: BasePart[]) {
        let spawnPart = undefined
        const customSpawns = CollectionService.GetTagged("CustomSpawn")
        const monsterSpawnN = monsterSpawns.size()
        if (player.Team === HeroTeam || monsterSpawnN === 0) {
            spawnPart = customSpawns.find((x) => x.FindFirstChild<ObjectValue>("Team")!.Value === HeroTeam)
            if (player.Team !== HeroTeam) {
                PlayerServer.setClassChoice(player, "DungeonLord")
            }
            //spawnPart = workspace.StaticEnvironment.HeroSpawn
        }
        else {
            if (PlayerServer.getTeamStyleChoice(player) === TeamStyleChoice.DungeonLord ||
                (Inventory.PlayerInTutorial(player) && Inventory.GetCount(player, "TimeInvested") <= 450)) { // once they"ve been playing for 10 minutes just give up on trying to tutorialize them
                // while heroes are prepping start off as "DungeonLord"; invulnerable monster that just builds
                spawnPart = monsterSpawns[MathXL.RandomInteger(0, monsterSpawnN - 1)]
                PlayerServer.setClassChoice(player, "DungeonLord")
            }
            else {
                // bosses take priority
                const closeSpawns: BasePart[] = []
                const distantSpawns: BasePart[] = []
                for (let i = 0; i < monsterSpawnN; i++) {
                    const spawner = monsterSpawns[i]
                    if (spawner.FindFirstChild<BoolValue>("OneUse")!.Value) {
                        DebugXL.logV(LogArea.GameManagement, "Found a boss spawn for " + player.Name)
                        if (spawner.FindFirstChild<ObjectValue>("LastPlayer")!.Value === undefined) {
                            DebugXL.logV(LogArea.GameManagement, "Unoccupied")
                            spawnPart = spawner
                            break
                        }
                    }
                    else if (Hero.distanceToNearestHeroXZ(spawner.Position) > MapTileData.tileWidthN * 2.5) {
                        distantSpawns.push(spawner)
                    }
                    else {
                        DebugXL.logV(LogArea.GameManagement, "Spawner at " + tostring(spawner.Position) + " too close to hero")
                        closeSpawns.push(spawner)
                    }
                }
                if (!spawnPart) {
                    DebugXL.logV(LogArea.GameManagement, "Acceptable spawn list for" + player.Name)
                    //DebugXL.Dump( acceptableSpawns )
                    DebugXL.logV(LogArea.GameManagement, "Fallback spawn list for" + player.Name)
                    //DebugXL.Dump( monsterSpawns )
                    if (distantSpawns.size() > 0) {
                        spawnPart = distantSpawns[MathXL.RandomInteger(0, distantSpawns.size() - 1)]
                        PlayerServer.setClassChoice(player, SpawnerUtility.getClassToSpawn(spawnPart))
                    }
                    else if (closeSpawns.size() > 0) {
                        // couldn"t find a spot far away from us, give up and spawn close
                        spawnPart = closeSpawns[MathXL.RandomInteger(0, closeSpawns.size() - 1)]
                        PlayerServer.setClassChoice(player, SpawnerUtility.getClassToSpawn(spawnPart))
                    }
                    else {
                        // apparently there"s only one already used boss spawn on this level; fall back to hero spawner
                        spawnPart = customSpawns.find((x) => x.FindFirstChild<ObjectValue>("Team")!.Value === HeroTeam)
                        if (player.Team !== HeroTeam) {
                            PlayerServer.setClassChoice(player, "DungeonLord")
                        }
                    }
                }
            }
        }
    }

    export function broadcastRespawnCountdown(player: Player, dungeonPlayerData: DungeonPlayer) {
        const countdownObj = player.FindFirstChild<NumberValue>("HeroRespawnCountdown")
        DebugXL.Assert(countdownObj !== undefined)
        if (countdownObj) {
            countdownObj.Value = math.clamp(15 - (time() - dungeonPlayerData.heroKickoffTime), 0, 15)
        }
    }

    export function waitForRespawnRequest(player: Player, dungeonPlayerData: DungeonPlayer) {
        while (!dungeonPlayerData.needsRespawn()) {
            wait(0.1)
            broadcastRespawnCountdown(player, dungeonPlayerData)
        }
    }

    export function preparationPhaseWait(preparationDuration: number) {
        let done = false

        previousCheckHeroesDead = true  // so empty room won't trigger TPK if there were living heroes at end of last level
        const startCountdownTime = time()
        while (!done) {
            const preparationCountdown = math.ceil(preparationDuration - (time() - startCountdownTime))
            preparationCountdownValue.Value = preparationCountdown
            // no monster players means no need for the preparation countdown
            done = preparationCountdown <= 0
            // we now wait for just *one* hero; preparation is over when 60 seconds is up AND one hero has decided to play.
            // otherwise monsters can go on
            done = done && HeroTeam.GetPlayers().filter((heroPlayer) =>
                PlayerServer.getCharacterClass(heroPlayer) !== "NullClass" &&   // chosen a character class and spawned
                heroPlayer.Character !== undefined).size() >= 1
            done = done || MonsterTeam.GetPlayers().size() === 0
            wait()
        }
        preparationCountdownValue.Value = 0
    }


    export function isTPK(playerTracker: PlayerTracker, dungeonPlayers: DungeonPlayerMap) {
        let allHeroesDeadB = true
        for (let player of HeroTeam.GetPlayers()) {
            if (player.Character) {
                const humanoid = player.Character.FindFirstChild<Humanoid>("Humanoid")
                if (humanoid) {
                    if (humanoid.Health > 0) {
                        const pcrecord = playerTracker.getCharacterRecordFromPlayer(player)
                        if (pcrecord) {
                            if (pcrecord instanceof Hero) {
                                allHeroesDeadB = false
                                break
                            }
                            else {
                                DebugXL.logV(LogArea.GameManagement, player.Name + " record not hero")
                            }
                        }
                        else {
                            DebugXL.logV(LogArea.GameManagement, player.Name + " no record")
                        }
                    }
                    else {
                        DebugXL.logV(LogArea.GameManagement, player.Name + " health 0")
                    }
                }
                else {
                    DebugXL.logV(LogArea.GameManagement, player.Name + " no humanoid")
                }
            }
            else {
                DebugXL.logV(LogArea.GameManagement, player.Name + " character missing")
            }
            //maybe you're dead or maybe you're a fresh hero about to be reassembled

            if (dungeonPlayers.get(player).isRespawning()) {
                allHeroesDeadB = false
            }
        }
        const tpk = !previousCheckHeroesDead && allHeroesDeadB
        previousCheckHeroesDead = allHeroesDeadB
        return tpk
    }

    export function checkFloorSessionComplete(playerTracker: PlayerTracker, dungeonPlayers: DungeonPlayerMap, bossFloor: boolean, reachedExit: boolean) {
        DebugXL.Assert(playerTracker instanceof PlayerTracker)
        DebugXL.Assert(dungeonPlayers instanceof DungeonPlayerMap)
        DebugXL.Assert(typeOf(reachedExit) === "boolean")

        let levelResult = LevelResultEnum.InProgress
        if (isTPK(playerTracker, dungeonPlayers)) {
            DebugXL.logI(LogArea.GameManagement, "TPK detected")
            levelResult = LevelResultEnum.TPK
            //give it some time.the player monitor and this should complete at roughly the same time
            //and if I've coded it right ) { it won't matter which is done first
            //wait(heroDeathSavoringSecondsK)
        }
        else if (reachedExit) { //probably didn't need to duplicate state here with bools *and* a state variable
            const newDungeonDepth = DungeonDeck.goToNextFloor()
            DebugXL.logV(LogArea.GameManagement, "Awarding next level awards")
            for (let player of HeroTeam.GetPlayers()) {
                let hero = playerTracker.getCharacterRecordFromPlayer(player)
                if( hero instanceof Hero ) {
                    //GameAnalyticsServer.ServerEvent({ ["category"] = "progression", ["event_id"] = "Complete.SubdwellerColony."+tostring(workspace.GameManagement.DungeonFloor.Value) }, player)
                    Heroes.NewDungeonLevel(player, newDungeonDepth)
                    HeroServer.awardExperience(player, hero, HeroServer.getDifficultyLevel() * 100, "Progress", "Floor", Inventory.BoostActive(player))
                    Inventory.AdjustCount(player, "Stars", 10, "Progress", "Floor")
                    Inventory.EarnRubies(player, 10, "Progress", "Floor")
                    Heroes.SaveHeroesWait(player)
                }
            }
            for (let player of MonsterTeam.GetPlayers()) {
                MonsterServer.adjustBuildPoints(player, 50)
            }
            levelResult = LevelResultEnum.ExitReached
        }
        else if (bossFloor) {
            if (getSuperbossManager().superbossDefeated(levelSession)) {
                DebugXL.logW(LogArea.GameManagement, "Setting BeatSuperboss state")
                levelResult = LevelResultEnum.BeatSuperboss
            }
        }
        return levelResult
    }

    export function checkForPCs() {
        for (let player of Players.GetPlayers()) {
            if (player.Character) {
                if (player.Character.Parent) {
                    DebugXL.Error(`Lingering player character: ${player.Name}`)
                }
            }
        }
    }
}