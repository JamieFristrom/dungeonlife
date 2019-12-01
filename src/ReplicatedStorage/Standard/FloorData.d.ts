type ParameterSwapI = Map<string, unknown>

interface DecimationInfoI { minSpots: number, maxSpots: number, spotSize: number, survivalPct: number, keep: boolean }

interface FloorI
{
    dungeonNameS: string
    readableNameS: string
    exitStaircaseB: boolean   
    fixedFloorDecorations: string[] 
    materialSwapT: Map<Enum.Material, ParameterSwapI>
    colorSwapT: Map<String, ParameterSwapI>
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
