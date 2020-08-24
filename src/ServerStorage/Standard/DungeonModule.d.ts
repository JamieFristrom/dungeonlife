import { DungeonMap } from "ReplicatedStorage/TS/DungeonMap"

declare class DungeonClass
{
    BuildWait( exitReachedFunc: ( player: Player )=>void ):void;
    GetMap() : DungeonMap
}

declare let Dungeon: DungeonClass

export = Dungeon
