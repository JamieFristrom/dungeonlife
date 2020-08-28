
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'

import { InventoryManagerI } from './InventoryManagerI'
import { PlayerServer } from './PlayerServer'
import { ServerContext } from './ServerContext'

import { ServerStorage } from '@rbxts/services'
import { RandomNumberGenerator } from 'ReplicatedStorage/TS/RandomNumberGenerator'

DebugXL.logI(LogArea.Executed, script.Name)

// this global function is a necessary evil as we gradually push references to contexts through our functions and classes
// to make them testable. The goal is to reduce its use to almost nothing over time.

let mainContext: ServerContext | undefined = undefined

export namespace MainContext {
    export function get() {
        // doing something weird here to bypass circular dependencies (if I used import above they would circle)
        if (!mainContext) {
            let gameMgr = require(ServerStorage.FindFirstChild<Folder>("Standard")!.FindFirstChild<ModuleScript>("GameManagementModule")!) as GameManagerI
            let inventoryMgr = require(ServerStorage.FindFirstChild<Folder>("Standard")!.FindFirstChild<ModuleScript>("InventoryModule")!) as InventoryManagerI

            mainContext = new ServerContext(gameMgr, inventoryMgr, PlayerServer.getPlayerTracker(), new RandomNumberGenerator())
        }
        return mainContext!
    }
}
