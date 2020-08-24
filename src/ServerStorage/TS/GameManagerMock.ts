
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

export class GameManagerMock implements GameManagerI {
    LevelReady() { return true }
    MarkPlayersCharacterForRespawn(player: Player, monsterSpawn: BasePart): void {}
}