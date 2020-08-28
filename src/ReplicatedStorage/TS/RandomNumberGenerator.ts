
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)


import { RandomNumberGeneratorI } from "./RandomNumberGeneratorI"

export class RandomNumberGenerator implements RandomNumberGeneratorI {    
    private random: Random  // tried making it a subclass but there were issues. 

    constructor( seed?: number ) {
        if(seed)
            this.random = new Random(seed)
        else
            this.random = new Random()
    }

    randomInteger(minInclusive: number, maxInclusive: number) {
        DebugXL.Assert( maxInclusive >= minInclusive )
        return this.random.NextInteger( minInclusive, maxInclusive )
    }

    randomNumber(min=0.0, max=1.0) {
        return this.random.NextNumber(min,max)
    }

    randomBiasedInteger1toNInclusive(weightsA: number[]): number {
        DebugXL.Assert( weightsA.size() >= 1 )
        let totalWeightN = 0
        for( let weight of weightsA ) {
            totalWeightN = totalWeightN + weight 
        }
        DebugXL.Assert( totalWeightN > 0 )
        const dieroll = this.randomNumber( 0, totalWeightN )
        let sumN = 0
        for( let i = 0; i<weightsA.size() ;i++ ) {
            const weight = weightsA[i]
            sumN = sumN + weight
            if( dieroll <= sumN ) {
                return i+1
            }
        } 
        DebugXL.Error( `Problem with RandomBiasedInteger1toN. Total weight ${totalWeightN} dieroll ${dieroll}` )
        return 1
    }

    randomBiasedInteger0toN(weightsA: number[]): number { return 0 }

}