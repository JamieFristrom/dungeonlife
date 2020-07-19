
interface MathXL
{
    RandomNumber( xmin?: number, xmax?: number ): number //  -- min = 0, max = 1

    RandomInteger( xmin: number, xmax: number ): number  // x1, x2 INCLUSIVE

    RandomBiasedInteger1toN( weightsA: number[] ): number

    RandomBiasedKey<keytype>( tblOfWeightsT: Map<keytype,number> ): keytype

    ShuffleArray( arr: number[] ): number[]

    Lerp( x1: number, x2: number, k: number ): number

    ApproxEqual( x1: number, x2: number, epsilon: number ): boolean

    Round( x: number ) : number

    IsFinite( x: number ) : boolean
}

declare let mathXL: MathXL

export = mathXL
