
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

// maybe this can evolve to be our Player proxy as well?

// export enum PCState {
//     Limbo = "Limbo",
//     Respawning = "Respawning",
//     Exists = "Exists",
//     // I don't think we need 'Destroying' - we can count that as an existing for all intents and purposes until actually destroyed and in limbo
// }


// // it's not like me to duplicate data by using this state information to try and decide if a player's character
// // is there or not, but there's too much stuff to track; we might have called a function that's building the
// // character but the character might not be around yet. Same on the way out.

// export enum PCStateRequest 
// {
// 	None               = "None",
// 	NeedsRespawn       = "NeedsRespawn",
// 	NeedsDestruction   = "NeedsDestruction"	
// }

// dungeon player class
// we keep a lot of our own player-specific data here
export class DungeonPlayer {
    //    pcState = PCState.Limbo
    //    pcStateRequest = PCStateRequest.None
    private lastDeathEventNum = 0
    private lastRespawnStartEventNum = 0
    private lastRespawnFinishEventNum = 0
    private lastDestructionRequestEventNum = 0
    private lastRespawnRequestEventNum = 0
    id = "unknown"
    lastHeroDeathEventNum = 0
    addingCompleteB = false
    playerMonitoredB = false
    playerRemovedB = false
    heroKickoffTime = 0
    guiLoadedB = false
    chooseHeroREAckedB = false
    signalledReadyB = false

    eventCounter = 1

    constructor( _id: string ) {
        this.id = _id
    }

    markDead() {
        DebugXL.logD(LogArea.Players, this.id+" marked dead")
        this.lastDeathEventNum = this.eventCounter++
    }

    markHeroDead() {
        DebugXL.logD(LogArea.Players, this.id+" marked hero dead")
        this.lastHeroDeathEventNum = this.eventCounter++
    }

    markRespawnStart() {
        DebugXL.Assert( this.eventCounter++ !== this.lastRespawnRequestEventNum )  // that's just too quick
        DebugXL.logD(LogArea.Players, this.id+" marked respawn start")
        this.lastRespawnStartEventNum = this.eventCounter++
    }

    markRespawnFinish() {
        DebugXL.logD(LogArea.Players, this.id+" marked respawn finish")
        this.lastRespawnFinishEventNum = this.eventCounter++
    }

    requestDestruction() {
        DebugXL.logD(LogArea.Players, this.id+" requested destruction")
        this.lastDestructionRequestEventNum = this.eventCounter++
    }

    requestRespawn() {
        DebugXL.logD(LogArea.Players, this.id+" requested respawn")
        this.lastRespawnRequestEventNum = this.eventCounter++
    }

    kickoffChooseHero() {
        DebugXL.logD(LogArea.Players, this.id+" kicked off hero")
        this.heroKickoffTime = time()
    }

    isRespawning() {
        return this.lastRespawnFinishEventNum < this.lastRespawnStartEventNum
    }

    needsDestruction() {
        return this.lastDestructionRequestEventNum > this.lastRespawnStartEventNum
    }

    needsRespawn() {
        return this.lastRespawnRequestEventNum > this.lastRespawnStartEventNum
    }

    inLimbo() {
        return this.lastRespawnStartEventNum <= this.lastRespawnRequestEventNum
    }

    exists() {
        return this.lastRespawnFinishEventNum > this.lastDeathEventNum
    }

    stateIsStable() {
        return !this.isRespawning() && !this.needsDestruction() && !this.needsRespawn()
    }
}

export class DungeonPlayerMap {
    dungeonPlayers = new Map<Player,DungeonPlayer>()

    get(player: Player) {
        if( !this.dungeonPlayers.has(player)) {
            this.dungeonPlayers.set(player, new DungeonPlayer(tostring(player.UserId)))
        }
        return this.dungeonPlayers.get(player)!
    }
}