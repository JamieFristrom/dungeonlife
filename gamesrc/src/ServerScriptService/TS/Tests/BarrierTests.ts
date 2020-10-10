
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import CharacterXL from "ServerStorage/Standard/CharacterXL"

import { BarrierServer } from "ServerStorage/TS/BarrierServer"
import { TestContext } from "ServerStorage/TS/TestContext"

import { TestUtility } from "ReplicatedStorage/TS/TestUtility"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses"


// test barrier
{
    let testContext = new TestContext()
    let attackingCharater = testContext.makeTestPlayerCharacter("Priest")
    testContext.getPlayerTracker().setCharacterRecordForPlayer( testContext.getPlayer(), new Hero("Warrior",CharacterClasses.heroStartingStats["Warrior"],[]))
    let defendingCharacter = TestUtility.createTestCharacter()
    let basePart = (defendingCharacter.FindFirstChild("Head") as Part|undefined)!

    let flexTool = new FlexTool("MagicBarrier", 1, [])
    let burntStuff = new Map<Instance,boolean>()
    let oldHealth = (defendingCharacter.FindFirstChild("Humanoid") as Humanoid|undefined)!.Health
    BarrierServer.onTouched(testContext, basePart, attackingCharater, flexTool, burntStuff)
    TestUtility.assertTrue( (defendingCharacter.FindFirstChild("Humanoid") as Humanoid|undefined)!.Health < oldHealth, "Barrier caused damage")

    testContext.clean()
}


// test fire barrier
{
    let testContext = new TestContext()
    let attackingCharater = testContext.makeTestPlayerCharacter("Priest")
    testContext.getPlayerTracker().setCharacterRecordForPlayer( testContext.getPlayer(), new Hero("Warrior",CharacterClasses.heroStartingStats["Warrior"],[]))
    let defendingCharacter = TestUtility.createTestCharacter()
    let basePart = (defendingCharacter.FindFirstChild("Head") as Part|undefined)!

    let flexTool = new FlexTool("MagicBarrier", 1, [{flavorS:"fire",levelN:2}])
    let burntStuff = new Map<Instance,boolean>()
    const oldHealth = (defendingCharacter.FindFirstChild("Humanoid") as Humanoid|undefined)!.Health
    BarrierServer.onTouched(testContext, basePart, attackingCharater, flexTool, burntStuff)
    const hurtHealth = (defendingCharacter.FindFirstChild("Humanoid") as Humanoid|undefined)!.Health
    TestUtility.assertTrue( hurtHealth < oldHealth, "Fire barrier caused damage")
    CharacterXL.ProcessCharacter(testContext, defendingCharacter, 0.1)
    const burntHealth = (defendingCharacter.FindFirstChild("Humanoid") as Humanoid|undefined)!.Health
    TestUtility.assertTrue( burntHealth < hurtHealth, "Fire barrier caused burning damage")
    testContext.clean()
}