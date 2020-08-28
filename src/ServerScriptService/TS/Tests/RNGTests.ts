
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.Name)

import { RandomNumberGenerator } from "ReplicatedStorage/TS/RandomNumberGenerator"
import { TestUtility } from "ServerStorage/TS/TestUtility"

// test same seed makes same list
{
    let rng1 = new RandomNumberGenerator(0)
    let rng2 = new RandomNumberGenerator(0)
    for (let i = 0; i < 10; i++) {
        const n1 = rng1.randomInteger(0, 100)
        const n2 = rng2.randomInteger(0, 100)
        TestUtility.assertTrue(n1 === n2, `Same seed makes same randoms (${n1}===${n2}) index ${i}`)
    }
}

// test integer randoms
{
    let rng = new RandomNumberGenerator(0)
    let random = rng.randomInteger(0, 0)
    TestUtility.assertTrue(random === 0)
    for (let i = 0; i < 10; i++) {
        let random = rng.randomInteger(0, 1)
        TestUtility.assertTrue(random >= 0)
        TestUtility.assertTrue(random <= 1)
    }
}

// test float randoms
{
    let rng = new RandomNumberGenerator(0)
    for (let i = 0; i < 10; i++) {
        let random = rng.randomNumber()
        TestUtility.assertTrue(random >= 0.0)
        TestUtility.assertTrue(random < 1.0)
    }
}

// test random biased integer
{
    let rng = new RandomNumberGenerator(0)
    for (let i = 0; i < 10; i++) {
        let random = rng.randomBiasedInteger1toNInclusive([0.5, 0.5])
        TestUtility.assertTrue(random === 1 || random === 2, "Random biased integer inclusive doesn't go out of bounds")
    }
}

// test 
{
    let rng = new RandomNumberGenerator(0)
    for (let i = 0; i < 10; i++) {
        let random = rng.randomBiasedInteger0toN([0.5, 0.5])
        TestUtility.assertTrue(random === 0 || random === 1, "Random biased integer doesn't go out of bounds")
    }
}