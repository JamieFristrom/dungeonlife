import * as Dungeon from "ServerStorage/Standard/DungeonModule"
import * as FurnishServer from "ServerStorage/Standard/FurnishServerModule"
import * as GameManagement from "ServerStorage/Standard/GameManagementModule"

import { DungeonDeck } from "ServerStorage/TS/DungeonDeck"

import { Workspace} from "@rbxts/services"

export namespace TownServer
{
    export function Play()
    {
        DungeonDeck.shuffle("Underhaven")
        Dungeon.BuildWait( ( player ) => {} )
        
        // so players have somewhere to appear, kind of a stopgap
        FurnishServer.FurnishWithRandomSpawns()

        let gameStateValueObj = Workspace.FindFirstChild('GameManagement')!.FindFirstChild('GameState') as StringValue
        gameStateValueObj.Value = "LevelPlaying"

        GameManagement.SetLevelReady( true )
    }
}