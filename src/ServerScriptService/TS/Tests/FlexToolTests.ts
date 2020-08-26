
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI(LogArea.Executed, script.Name)

import { TestUtility } from "ServerStorage/TS/TestUtility";
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";

// test flex tool random enhancements don't give you a stat buff if you don't want one
{
    const badjuju = ["str","dex","con","will"]
    for( let i=0;i<10;i++ ) {
        let testTool = new FlexTool("Broadsword", 2, [])
        testTool.addRandomEnhancements(false,1,badjuju)
        for( let juju of badjuju ) {
            TestUtility.assertTrue(testTool.enhancementsA.find((enhancement)=>enhancement.flavorS===juju)===undefined, `Found unwanted enchantment ${juju}`)
        }
    }
}
