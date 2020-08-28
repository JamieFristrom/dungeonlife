
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DungeonMap } from "ReplicatedStorage/TS/DungeonMap"
import { ServerContextI } from "ServerStorage/TS/ServerContext"

declare class DungeonClass {
    Clean(): void
    BuildWait(context: ServerContextI, exitReachedFunc: (player: Player) => void): void;
    GetMap(): DungeonMap
}

declare let Dungeon: DungeonClass

export = Dungeon
