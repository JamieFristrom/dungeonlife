
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { FloorInfoI } from "ReplicatedStorage/TS/FloorInfoI"

declare class FloorData {
    floorsA: FloorInfoI[]

    CurrentFloor(): FloorInfoI  // wishlist fix - I don't think it makes sense that this is in replicated storage
}

declare let floorData: FloorData

export = floorData
