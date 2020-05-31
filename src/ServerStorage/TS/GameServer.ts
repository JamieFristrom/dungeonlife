
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { Players, Teams, Workspace } from "@rbxts/services";
import * as Inventory from "ServerStorage/Standard/InventoryModule"
import { MessageServer } from "./MessageServer";

// -- it was this way up until 9/30 - in general, monster swarms too rough on fuller servers. Thought about changing radar but they'd still
// -- swarm on exit and entrance
// -- constants
// --local numHeroesNeededPerPlayer = 
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
        //   TableXL:FindAllInAWhere( game.Teams.Monsters:GetPlayers(), function( monsterPlayer ) return not Inventory:PlayerInTutorial( monsterPlayer ) end )
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

    // let's let the client handle this
    // export function letHeroesPrepare() {
    //     // heroes who lived through last level should go to prepare menu
    //     // heroes who died have already been sent to the choose hero screen by the health monitor
    //     const players = HeroTeam.GetPlayers()
    //     for (let player of players) {
    //         const character = player.Character
    //         if (!character || !character.FindFirstChild<Humanoid>('Humanoid') || character.FindFirstChild<Humanoid>('Humanoid')!.Health <= 0) {
    //             DebugXL.logD('GameManagement', 'PrepareHero for ' + player.Name)
    //             chooseHeroRE.FireClient(player, "PrepareHero")
    //         }
    //     }
    // }
}