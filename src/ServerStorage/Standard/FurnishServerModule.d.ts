
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { PossessionDatumI } from "ReplicatedStorage/Standard/PossessionDataStd"

declare class FurnishServerClass {
    PlaceSpawns(spawnFromList: PossessionDatumI[], howManyToSpawn: number): void
    FurnishWithRandomSpawns(): void
    GetMonsterSpawners(): Part[]
}

declare let FurnishServer: FurnishServerClass

export = FurnishServer