
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
import { PCMonitor } from 'ReplicatedStorage/TS/PCMonitor'
import { TestContext, TestUtility } from 'ServerStorage/TS/TestUtility'
DebugXL.logI(LogArea.Executed, script.GetFullName())

// make sure game doesn't crash when there's no leaderstats; there's a race condition I'm simulating here
{
    let testSetup = new TestContext()
    let leaderstats = testSetup.getPlayer().FindFirstChild("leaderstats")
    if( leaderstats ) {
        leaderstats.Destroy()
    }
    let result = PCMonitor.getPublishedLevel( testSetup.getPlayer() )
    TestUtility.assertTrue( result==="", "Accessing missing leaderstats is safe" )
    testSetup.clean()
}