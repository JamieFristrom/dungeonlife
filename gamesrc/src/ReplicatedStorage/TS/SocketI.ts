
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea, LogLevel } from 'ReplicatedStorage/TS/DebugXLTS'

DebugXL.logI(LogArea.Executed, script.GetFullName())

export interface SocketI {
    sendMessage(player: Player | undefined, ...args: unknown[]): unknown
}

export class NullSocket implements SocketI {
    sendMessage(player: Player | undefined, ...args: unknown[]): unknown { return undefined }
}

export let nullSocket = new NullSocket()