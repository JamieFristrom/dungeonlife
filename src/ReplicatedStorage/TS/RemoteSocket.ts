
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea, LogLevel } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { RunService } from '@rbxts/services'

import { SocketI } from 'ReplicatedStorage/TS/SocketI'

export class RemoteEventSocket implements SocketI {
    sendMessage(player: Player, ...args: unknown[]): unknown {
        if (RunService.IsServer()) {
            this.remoteEvent.FireClient(player, ...args)
        }
        else {
            this.remoteEvent.FireServer(...args)
        }
        return undefined
    }

    constructor(private remoteEvent: RemoteEvent) { }
}

export class RemoteFunctionSocket implements SocketI {
    sendMessage(player: Player, ...args: unknown[]): unknown {
        return RunService.IsServer() ?
            this.remoteFunction.InvokeClient(player, ...args) :
            this.remoteFunction.InvokeServer(...args)
    }

    constructor(private remoteFunction: RemoteFunction) { }
}