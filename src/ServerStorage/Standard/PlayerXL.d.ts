
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"

type Character = Model

declare class PlayerManagerXL {
    LoadCharacterWait(
        playerTracker: PlayerTracker,
        player: Player, 
        optionalSpawnCF?: CFrame, 
        optionalSpawnPart?: BasePart, 
        levelSessionN?: number, 
        levelSessionFunc?: ()=>number ) : Character | void
}

declare let PlayerXL: PlayerManagerXL

export = PlayerXL
