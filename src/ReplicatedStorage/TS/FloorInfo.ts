
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.Name)

import { FloorInfoI, ParameterSwapI, DecimationInfoI } from "ReplicatedStorage/TS/FloorInfoI"

export class FloorInfo implements FloorInfoI {
    constructor(
        public exitStaircaseB = true,  // use false if you want superboss
        public availableBlueprintsT = new Map<string, boolean>(),
        public sizesT = new Map<number, number>([[1, 7]]),
        public dungeonNameS = "",
        public readableNameS = "",
        public fixedFloorDecorations = [],
        public materialSwapT = new Map<Enum.Material, ParameterSwapI>(),
        public colorSwapT = new Map<string, ParameterSwapI>(),
        public decimatePartsT = new Map<string, DecimationInfoI>(),
        public hidePartsSet = {},
        public tilesetS: "HallTemplatesDungeon" | "HallTemplatesPalace" = "HallTemplatesDungeon",
        public startX = 0,
        public startY = 0,
        public startTileModelName = "HallNoWalls",
        public startOpeningsA = [1, 2, 3, 4],
        public blueprintSuffix = ""
    ) { }
}