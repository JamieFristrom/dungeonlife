
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

// player key is a unique identifier for a player that only lasts the session
export interface PlayerSessionKey {}

export interface PlayerProxy {
    awaitStarterGear(): Folder 
    awaitBackpack(): Folder
    awaitLeaderstatsFolder(): Folder    

    // we could wrap these individually for type safety
    fireClientEvent( remoteEvent: RemoteEvent, command: string, arg:unknown ): void

    getTeam(): Team | undefined
    getName(): string
    getSessionKey(): PlayerSessionKey
    getUserId(): number

    stillExists(): boolean
}


export class PlayerWrapper implements PlayerProxy {
    private _player: Player

    constructor( player: Player ) {
        this._player = player
    }

    awaitStarterGear(): Folder {
        return this._player.WaitForChild<Folder>("StarterGear")
    }

    awaitBackpack(): Folder {
        return this._player.WaitForChild<Folder>("Backpack")
    }

    awaitLeaderstatsFolder(): Folder {
        return this._player.WaitForChild<Folder>("leaderstats")
    }

    getTeam(): Team | undefined {
        return this._player.Team
    }

    getName(): string {
        return this._player.Name
    }

    getSessionKey(): PlayerSessionKey {
        return this._player
    }

    getUserId() : number {
        return this._player.UserId
    }

    fireClientEvent( remoteEvent: RemoteEvent, command: string, arg:unknown ): void {
        remoteEvent.FireClient( this._player, command, arg )
    }

    stillExists() {
        return this._player.Parent !== undefined
    }
}

