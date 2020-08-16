
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"
import { CharacterRecord, CharacterKey } from "ReplicatedStorage/TS/CharacterRecord"

type Character = Model

declare class GameManagementClass {
    MonitorPlayerbase(): void

    MarkPlayersCharacterForRespawn(player: Player, optionalRespawnPart?: BasePart): void

    SetLevelReady(ready: boolean): void

    // also returns a CharacterKey but does it Lua style so we'd have to refactor if we want that
    MonsterAddedWait(character: Character, player: Player, playerTracker: PlayerTracker, inTutorial: boolean): CharacterRecord
}

declare let GameManagement: GameManagementClass

export = GameManagement