
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
import { InventoryManagerI } from './InventoryManagerI'
import { PlayerTracker } from './PlayerServer'
DebugXL.logI(LogArea.Executed, script.Name)

export interface ServerContextI {
    getGameMgr(): GameManagerI
    getInventoryMgr() : InventoryManagerI
    getPlayerTracker() : PlayerTracker
}

export class ServerContext implements ServerContextI {

    constructor(private gameMgr: GameManagerI,
        private inventoryMgr: InventoryManagerI,
        private playerTracker: PlayerTracker) {            
        }

    getGameMgr() { return this.gameMgr }
    getInventoryMgr() { return this.inventoryMgr }
    getPlayerTracker() { return this.playerTracker }
}