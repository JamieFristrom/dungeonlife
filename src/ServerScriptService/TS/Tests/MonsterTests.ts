
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Monster } from "ReplicatedStorage/TS/Monster"
import { TestUtility, TestContext } from "ReplicatedStorage/TS/TestUtility";
import { MonsterServer } from "ServerStorage/TS/MonsterServer";

// test monster spawn gets no duplicate weapons
// so this was an interesting challenge from a TDD standpoint - you don't want a flaky test, I.E. a test that only fails some of the time
// but it occurs to me that while a test that has a false negative 1% of the time is horrible, a test that has a false positive 1% of the time
// is actually ok. So we'll just run the test over and over so the statistical likelihood of it passing is 1$

// to truly make it a predictable result and be confident it wouldn't have a false negative we'd have to seed the RNG; but that's even worse
// then testing a wide variety of randoms some of which may not fail when they should. seeding makes more sense to avoid false positives
function testNoDuplciateWeapons() {
    let testSetup = new TestContext()
    let weaponList = ["Broadsword", "Greatsword", "Hatchet", "Axe", "Club"]
    let weaponListStartSize = weaponList.size()
    let targetRecord = new Monster("Orc", [], 1)
    let testCharacter = TestUtility.createTestCharacter()
    const characterKey = testSetup.getPlayerTracker().setCharacterRecordForMob(testCharacter, targetRecord)

    for( let i=0;i<weaponListStartSize;i++ ) {
        MonsterServer.giveUniqueWeapon( testSetup.getPlayerTracker(), characterKey, weaponList )
        TestUtility.assertTrue( targetRecord.countTools()===i+1, "Got a weapon" )
    }
    TestUtility.assertTrue( weaponList.size()===0, "Gave every weapon to monster" )
    testSetup.clean()
}
    
testNoDuplciateWeapons()
