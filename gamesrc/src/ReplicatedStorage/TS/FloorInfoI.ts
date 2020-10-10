
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

export type ParameterSwapI = Map<string, unknown>

export interface DecimationInfoI { minSpots: number, maxSpots: number, spotSize: number, survivalPct: number, keep: boolean }

export interface FloorInfoI {
    availableBlueprintsT: Map<string, boolean>
    blueprintSuffix: string
    colorSwapT: Map<string, ParameterSwapI>
    decimatePartsT: Map<string, DecimationInfoI>
    dungeonNameS: string
    exitStaircaseB: boolean
    fixedFloorDecorations: string[]
    hidePartsSet: { [k: string]: boolean }
    materialSwapT: Map<Enum.Material, ParameterSwapI>
    readableNameS: string
    sizesT: Map<number, number>
    startX: number
    startY: number
    startTileModelName: string
    startOpeningsA: number[]
    tilesetS: "HallTemplatesDungeon" | "HallTemplatesPalace"
}