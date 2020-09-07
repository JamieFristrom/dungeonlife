
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"

import { DebugI } from "ReplicatedStorage/TS/DebugI"

type Character = Model

declare class PlayerManagerXL {
    CharacterAdded( debug: DebugI, player: Player): void
    LoadCharacterWait(
        playerTracker: PlayerTracker,
        player: Player,
        optionalSpawnCF?: CFrame,
        optionalSpawnPart?: BasePart,
        levelSessionN?: number,
        levelSessionFunc?: () => number): Character | void
}

declare let PlayerXL: PlayerManagerXL

export = PlayerXL
