
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

declare interface GameManagerI {
    LevelReady(): boolean
    MarkPlayersCharacterForRespawn(player: Player, monsterSpawn: BasePart): void
}