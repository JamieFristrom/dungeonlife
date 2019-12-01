declare class DungeonClass
{
    BuildWait( exitReachedFunc: ( player: Player )=>void ):void;
}

declare let Dungeon: DungeonClass

export = Dungeon
