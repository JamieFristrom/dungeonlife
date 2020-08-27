
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { TestUtility, TestContext } from "ServerStorage/TS/TestUtility"
import { InventoryServer } from "ServerStorage/TS/InventoryServer"
import { InventoryMock } from "ServerStorage/TS/InventoryMock"

// test new blooprintz code
{
    let testContext = new TestContext()
    let mockInventory = new InventoryMock()

    const result = InventoryServer.submitCode(mockInventory, testContext.getPlayer(), "blooprintz")
    
    TestUtility.assertTrue( result===true, "blooprintz succesful" )
    TestUtility.assertTrue( mockInventory.itemsT["WeaponsRack"]===1, "blooprintz gave weaponsrack" )
    TestUtility.assertTrue( mockInventory.itemsT["Door"]===1, "blooprintz gave door")    

    testContext.clean()
}