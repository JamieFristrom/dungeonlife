
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

export interface RandomNumberGeneratorI {
    randomBiasedInteger1toNInclusive(weightsA: number[]): number
    randomInteger(minInclusive: number, maxInclusive: number): number
    randomNumber(): number
}