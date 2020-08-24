
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DungeonPlayerMap } from "ServerStorage/TS/DungeonPlayer"
import { PlayerTracker } from "ServerStorage/TS/PlayerServer"

import { CharacterRecord, CharacterKey } from "ReplicatedStorage/TS/CharacterRecord"


type Character = Model

declare class GameManagementClass {
    GetLevelSession(): number
    MonitorPlayerbase(): void
    MarkPlayersCharacterForRespawn(player: Player, optionalRespawnPart?: BasePart): void
    PlayerCharactersExist(dungeonPlayerMap: DungeonPlayerMap): boolean
    SetLevelReady(ready: boolean): void
    LevelReady(): boolean

    // also returns a CharacterKey but does it Lua style so we'd have to refactor if we want that
    MonsterAddedWait(character: Character, player: Player, playerTracker: PlayerTracker, inTutorial: boolean): CharacterRecord
}

declare let GameManagement: GameManagementClass

export = GameManagement