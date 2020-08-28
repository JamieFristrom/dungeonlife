
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI(LogArea.Executed, script.Name)

import { TestUtility } from "ServerStorage/TS/TestUtility";
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";
import { RandomNumberGenerator } from "ReplicatedStorage/TS/RandomNumberGenerator";

// don't do nothing when trying to randomly add explosive to bomb
function MagicifyBomb(seed: number) {
    let rng = new RandomNumberGenerator(seed)
    let bomb = new FlexTool("Bomb", 2, [])
    bomb.addRandomEnhancements(rng, false, 1, ["str", "dex", "con", "will", "fire", "radiant"])  // only cold and explosive allowing for test
    TestUtility.assertTrue(bomb.enhancementsA.size() >= 1, "Bomb got magicked")
}

for (let i = 0; i < 4; i++) {
    MagicifyBomb(i)
}

// test flex tool random enhancements don't give you a stat buff if you don't want one
{
    let rng = new RandomNumberGenerator(667)
    const badjuju = ["str", "dex", "con", "will"]
    for (let i = 0; i < 10; i++) {
        let testTool = new FlexTool("Broadsword", 2, [])
        testTool.addRandomEnhancements(rng, false, 1, badjuju)
        for (let juju of badjuju) {
            TestUtility.assertTrue(testTool.enhancementsA.find((enhancement) => enhancement.flavorS === juju) === undefined, `Found unwanted enchantment ${juju}`)
        }
    }
}