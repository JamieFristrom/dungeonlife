
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

export enum PCState {
    Limbo = "Limbo",
    Respawning = "Respawning",
    Exists = "Exists",
    // I don't think we need 'Destroying' - we can count that as an existing for all intents and purposes until actually destroyed and in limbo
}


// it's not like me to duplicate data by using this state information to try and decide if a player's character
// is there or not, but there's too much stuff to track; we might have called a function that's building the
// character but the character might not be around yet. Same on the way out.

export enum PCStateRequest 
{
	None               = "None",
	NeedsRespawn       = "NeedsRespawn",
	NeedsDestruction   = "NeedsDestruction"	
}

// dungeon player class
// we keep a lot of our own player-specific data here
export class DungeonPlayer {
    pcState = PCState.Limbo
    pcStateRequest = PCStateRequest.None
    addingCompleteB = false
    playerMonitoredB = false
    playerRemovedB = false
    lastHeroDeathTime = time()
    heroKickoffTime = math.huge
    guiLoadedB = false
    chooseHeroREAckedB = false
    signalledReadyB = false

    kickoffChooseHero() {
        this.heroKickoffTime = time()
    }
}