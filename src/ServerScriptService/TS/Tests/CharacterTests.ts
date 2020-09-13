
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.Name)

import PlayerXL from "ServerStorage/Standard/PlayerXL"

import { TestContext } from "ServerStorage/TS/TestContext"

import { DebugI } from "ReplicatedStorage/TS/DebugI"
import { TestUtility } from "ReplicatedStorage/TS/TestUtility"

import MathXL from "ReplicatedStorage/Standard/MathXL"

// test that antiteleport script is engaged; PlayerXL should automatically connect (not the best way to test)
{
    let testContext = new TestContext()
    let char = testContext.makeTestPlayerCharacter("Warrior")
    PlayerXL.CharacterAdded(DebugXL, testContext.getPlayer())
    let p = char.GetPrimaryPartCFrame().Position
    wait(0.1)
    char.SetPrimaryPartCFrame(new CFrame(p.add(new Vector3(0, 0, 30))))
    DebugXL.Assert(char.GetPrimaryPartCFrame().Position.Z === p.Z + 30)
    wait(0.4)
    TestUtility.assertTrue(MathXL.ApproxEqual(p.Z, char.GetPrimaryPartCFrame().Position.Z, 0.5), "Antiteleport happened")
    testContext.clean()
}

class DebugFake implements DebugI {
    lastError: string = ""
    Assert( condition: boolean ) {}
    Error( message: string ) {
        this.lastError = message
    }
}

// test we behave appropriately with characters who mysteriously start headless
{
    let debugFake = new DebugFake()
    let testContext = new TestContext()
    let char = testContext.makeTestPlayerCharacter("Warrior");
    (char.FindFirstChild("Head") as Part|undefined)!.Parent = undefined
    PlayerXL.CharacterAdded(debugFake, testContext.getPlayer())
    wait(1)
    TestUtility.assertTrue( debugFake.lastError.find("Where's My Head Baby")[0]===0, "Appropriately errored with missing head")
    testContext.clean()
}