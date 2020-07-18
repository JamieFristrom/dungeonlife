
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { CollectionService, Players, Teams, Workspace } from "@rbxts/services"

import * as CharacterI from "ServerStorage/Standard/CharacterI"
import * as Inventory from "ServerStorage/Standard/InventoryModule"

import * as MapTileData from "ReplicatedStorage/Standard/MapTileDataModule"
import * as MathXL from "ReplicatedStorage/Standard/MathXL"

import { Hero } from "ReplicatedStorage/TS/HeroTS"


import { MessageServer } from "./MessageServer"
import { PlayerServer, TeamStyleChoice } from "./PlayerServer"


// -- it was this way up until 9/30 - in general, monster swarms too rough on fuller servers. Thought about changing radar but they'd still
// -- swarm on exit and entrance
// -- constants
// --const numHeroesNeededPerPlayer = 
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

const HeroTeam = Teams.FindFirstChild<Team>('Heroes')!
DebugXL.Assert(HeroTeam !== undefined)

const signals = Workspace.FindFirstChild<Folder>('Signals')!
DebugXL.Assert(signals !== undefined)

const chooseHeroRE = signals.FindFirstChild<RemoteEvent>('ChooseHeroRE')!
DebugXL.Assert(chooseHeroRE !== undefined)

export namespace GameServer {
    export function numHeroesNeeded() {
        let nonNoobs = Players.GetPlayers().filter((player) => !Inventory.PlayerInTutorial(player))
        return numHeroesNeededPerPlayer[nonNoobs.size()]
    }

    export function askPlayersToRate() {
        let players = Players.GetPlayers()
        for (let player of players) {
            if (Inventory.IsStarFeedbackDue(player)) {
                let starFeedbackCount = Inventory.GetCount(player, 'StarFeedbackCount')
                let messageCode = starFeedbackCount > 0 ? '!StarFeedbackRepeat' : '!StarFeedback'
                MessageServer.PostMessageByKey(player, messageCode, false, 0, true)
                Inventory.SetNextStarFeedbackDueTime(player)
            }
        }
    }

    export function chooseSpawn(player: Player, monsterSpawns: BasePart[]) {
        let spawnPart = undefined
        const customSpawns = CollectionService.GetTagged("CustomSpawn")
        const monsterSpawnN = monsterSpawns.size()
        if (player.Team === HeroTeam || monsterSpawnN===0 ) {
            spawnPart = customSpawns.find((x) => x.FindFirstChild<ObjectValue>("Team")!.Value === HeroTeam)
            //spawnPart = workspace.StaticEnvironment.HeroSpawn
        }
        else {
            if (PlayerServer.getTeamStyleChoice(player) === TeamStyleChoice.DungeonLord ||
                (Inventory.PlayerInTutorial(player) && Inventory.GetCount(player, "TimeInvested") <= 450)) { // once they've been playing for 10 minutes just give up on trying to tutorialize them
                // while heroes are prepping start off as "DungeonLord"; invulnerable monster that just builds
                spawnPart = monsterSpawns[MathXL.RandomInteger(0, monsterSpawnN-1)]
                CharacterI.SetCharacterClass(player, "DungeonLord")
            }
            else {
                // bosses take priority
                const acceptableSpawns: BasePart[] = []
                for (let i = 0; i < monsterSpawnN; i++) {
                    const spawner = monsterSpawns[i]
                    // FIXME: this is still failing even though it theoretically can't
                    if (spawner.FindFirstChild<BoolValue>("OneUse")!.Value) {
                        DebugXL.logV('GameManagement', "Found a boss spawn for " + player.Name)
                        if (spawner.FindFirstChild<ObjectValue>("LastPlayer")!.Value === undefined) {
                            DebugXL.logV('GameManagement', "Unoccupied")
                            spawnPart = spawner
                            break
                        }
                        monsterSpawns.remove(i)
                    }
                    else if (Hero.distanceToNearestHeroXZ(spawner.Position) > MapTileData.tileWidthN * 2.5) {
                        acceptableSpawns.push(spawner)
                    }
                    else {
                        DebugXL.logV('GameManagement', "Spawner at " + tostring(spawner.Position) + " too close to hero")
                    }
                }
                if (!spawnPart) {
                    DebugXL.logV('GameManagement', "Acceptable spawn list for" + player.Name)
                    //DebugXL.Dump( acceptableSpawns )
                    DebugXL.logV('GameManagement', "Fallback spawn list for" + player.Name)
                    //DebugXL.Dump( monsterSpawns )
                    if (acceptableSpawns.size() > 0) {
                        spawnPart = acceptableSpawns[MathXL.RandomInteger(0, acceptableSpawns.size()-1)]
                    }
                    else {
                        // couldn't find a spot far away from us, give up and spawn close
                        spawnPart = monsterSpawns[MathXL.RandomInteger(0, monsterSpawns.size()-1)]
                    }
                }
                CharacterI.SetCharacterClass(player, spawnPart.FindFirstChild<StringValue>("CharacterClass")!.Value)
            }
        }
    }
}