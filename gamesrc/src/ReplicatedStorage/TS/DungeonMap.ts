export interface MapElement {
    tileName: string,
    compassRotationN: number
}

class EmptyMapElement implements MapElement {
    tileName = "HallNoWalls"
    compassRotationN = 0
}

export type DungeonMap = MapElement[][]

export namespace MapUtility {
    export function makeEmptyMap(size:number) : DungeonMap {
        let map = new Array<Array<EmptyMapElement>>()
        for(let i=0;i<size;i++ )
        {
            let row = new Array<EmptyMapElement>()
            for( let j=0;j<size;j++ ) {
                row.insert(j, new EmptyMapElement())
            }
            map.insert(i, row)
        }
        return map
    }
}