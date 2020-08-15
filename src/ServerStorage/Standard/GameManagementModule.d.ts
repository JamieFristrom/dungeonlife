
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"

type Character = Model

declare class GameManagementClass {
    MonitorPlayerbase(): void

    MarkPlayersCharacterForRespawn(player: Player, optionalRespawnPart?: BasePart): void

    SetLevelReady(ready: boolean): void

    MonsterAddedWait(character: Character, player: Player, playerTracker: PlayerTracker, inTutorial: boolean): void
}

declare let GameManagement: GameManagementClass

export = GameManagement