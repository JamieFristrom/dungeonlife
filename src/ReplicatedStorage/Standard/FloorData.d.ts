
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

type ParameterSwapI = Map<string, unknown>

interface DecimationInfoI { minSpots: number, maxSpots: number, spotSize: number, survivalPct: number, keep: boolean }

interface FloorI
{
    dungeonNameS: string
    readableNameS: string
    exitStaircaseB: boolean   
    fixedFloorDecorations: string[] 
    availableBlueprintsT: Map<string, Boolean>
    materialSwapT: Map<Enum.Material, ParameterSwapI>
    colorSwapT: Map<string, ParameterSwapI>
    decimatePartsT: Map<string, DecimationInfoI> 
    hidePartsSet: { [k:string]: boolean }
}

declare class FloorData
{
    floorsA: FloorI[]

    CurrentFloor() : FloorI
}

declare let floorData: FloorData

export = floorData
