
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)

import { InventoryManagerI } from './InventoryManagerI'
import { PlayerTracker } from './PlayerServer'
import { RandomNumberGeneratorI } from 'ReplicatedStorage/TS/RandomNumberGeneratorI'


export interface ServerContextI {
    getGameMgr(): GameManagerI
    getInventoryMgr(): InventoryManagerI
    getPlayerTracker(): PlayerTracker
    getRNG(): RandomNumberGeneratorI
}

export class ServerContext implements ServerContextI {

    constructor(private gameMgr: GameManagerI,
        private inventoryMgr: InventoryManagerI,
        private playerTracker: PlayerTracker,
        private rng: RandomNumberGeneratorI) {
    }

    getGameMgr() { return this.gameMgr }
    getInventoryMgr() { return this.inventoryMgr }
    getPlayerTracker() { return this.playerTracker }
    getRNG() { return this.rng }
}