// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI(LogArea.Executed, script.Name)

import MeleeWeaponServerXL from "ServerStorage/Standard/MeleeWeaponServerXL"

import { TestUtility, TestContext } from "ReplicatedStorage/TS/TestUtility";
import { Workspace, ServerStorage, ReplicatedStorage, Teams } from "@rbxts/services";
import { FlexibleToolsServer } from "ServerStorage/TS/FlexibleToolsServer";
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";
import { PlayerServer } from "ServerStorage/TS/PlayerServer";
import { CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses";
import { Hero } from "ReplicatedStorage/TS/HeroTS";
import { Monster } from "ReplicatedStorage/TS/Monster"


// test hit with a weapon
{
    let testSetup = new TestContext()
    testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Heroes")
    let character = testSetup.getTestPlayerCharacter("Warrior")
    let testRecord = new Hero("Warrior", CharacterClasses.heroStartingStats.Warrior, [])
    PlayerServer.setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord)
    let targetCharacter = TestUtility.createTestCharacter()
    let oldHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    targetCharacter.Parent = Workspace
    targetCharacter.SetPrimaryPartCFrame(character.GetPrimaryPartCFrame())
    let tool = ServerStorage.FindFirstChild<Folder>("Tools")!.FindFirstChild<Tool>("Axe")!.Clone()
    let flexTool = new FlexTool("Axe", 1, [])
    FlexibleToolsServer.setFlexToolInst(tool, { flexToolInst: flexTool, character: character, possessionsKey: "item1" })
    let meleeWeaponServer = new MeleeWeaponServerXL(tool)
    tool.Parent = character
    meleeWeaponServer.OnEquipped()
    TestUtility.assertTrue(tool.Parent === character)
    meleeWeaponServer.OnActivated()
    let newHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth < oldHealth)
    FlexibleToolsServer.removeToolWait(tool, character)
    testSetup.clean()
}

// test killing blow, earn xp
// never got this working because Inventory getBoost call blocks. we can either get that PlayerProxy we want going,
// or we can implement a ServerContext that holds the playerserver, inventory, and other server globals
// {
//     let testSetup = new TypicalTestSetup()
//     testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Heroes")

//     let character = testSetup.getTestPlayerCharacter("Warrior")
//     let testRecord = new Hero("Warrior", CharacterClasses.heroStartingStats.Warrior, [])
//     PlayerServer.setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord)

//     let targetCharacter = TestUtility.createTestCharacter()
//     let targetRecord = new Monster("Orc", [], 1)
//     PlayerServer.setCharacterRecordForMob(targetCharacter, targetRecord)

//     targetCharacter.Parent = Workspace
//     targetCharacter.SetPrimaryPartCFrame(character.GetPrimaryPartCFrame())
//     let tool = ServerStorage.FindFirstChild<Folder>("Tools")!.FindFirstChild<Tool>("Axe")!.Clone()
//     let flexTool = new FlexTool("Axe", 1, [])
//     FlexibleToolsServer.setFlexToolInst(tool, { flexToolInst: flexTool, character: character, possessionsKey: "item1" })
//     let meleeWeaponServer = new MeleeWeaponServerXL(tool)
//     tool.Parent = character
//     meleeWeaponServer.OnEquipped()
//     targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health = 1
//     let oldXP = testRecord.statsT.experienceN
//     meleeWeaponServer.OnActivated()
//     let newHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
//     TestUtility.assertTrue(newHealth <= 0)
//     TestUtility.assertTrue(testRecord.statsT.experienceN > oldXP)
//     FlexibleToolsServer.removeToolWait(tool, character)
//     testSetup.clean()
// }

// test change teams monster->hero before the activation registers
{
    let testSetup = new TestContext()
    testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Monsters")
    let character = testSetup.getTestPlayerCharacter("Orc")
    let testRecord = new Monster("Orc", [], 1)
    PlayerServer.setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord)

    let targetCharacter = TestUtility.createTestCharacter()
    let oldHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    targetCharacter.Parent = Workspace
    targetCharacter.SetPrimaryPartCFrame(character.GetPrimaryPartCFrame())
    let tool = ServerStorage.FindFirstChild<Folder>("Tools")!.FindFirstChild<Tool>("Axe")!.Clone()
    let flexTool = new FlexTool("Axe", 1, [])
    FlexibleToolsServer.setFlexToolInst(tool, { flexToolInst: flexTool, character: character, possessionsKey: "item1" })
    let meleeWeaponServer = new MeleeWeaponServerXL(tool)
    tool.Parent = character
    testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Heroes")
    meleeWeaponServer.OnActivated()
    let newHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth === oldHealth)
    FlexibleToolsServer.removeToolWait(tool, character)
    testSetup.clean()
}

// test change teams hero->monster before the activation registers
{
    let testSetup = new TestContext()
    testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Heroes")
    let character = testSetup.getTestPlayerCharacter("Warrior")
    let testRecord = new Hero("Warrior", CharacterClasses.heroStartingStats.Warrior, [])
    PlayerServer.setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord)

    let targetCharacter = TestUtility.createTestCharacter()
    let oldHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    targetCharacter.Parent = Workspace
    targetCharacter.SetPrimaryPartCFrame(character.GetPrimaryPartCFrame())
    let tool = ServerStorage.FindFirstChild<Folder>("Tools")!.FindFirstChild<Tool>("Axe")!.Clone()
    let flexTool = new FlexTool("Axe", 1, [])
    FlexibleToolsServer.setFlexToolInst(tool, { flexToolInst: flexTool, character: character, possessionsKey: "item1" })
    let meleeWeaponServer = new MeleeWeaponServerXL(tool)
    tool.Parent = character
    testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Monsters")
    meleeWeaponServer.OnActivated()
    let newHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth < oldHealth)
    FlexibleToolsServer.removeToolWait(tool, character)
    testSetup.clean()
}

// test smack destructible structure
{
    let testSetup = new TestContext()
    testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Heroes")
    let character = testSetup.getTestPlayerCharacter("Warrior")
    let testRecord = new Hero("Warrior", CharacterClasses.heroStartingStats.Warrior, [])
    PlayerServer.setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord)
    let targetCharacter = ReplicatedStorage.FindFirstChild<Folder>("Shared Instances")!.FindFirstChild<Folder>("Placement Storage")!.FindFirstChild<Model>("Barrel")!.Clone()   
    targetCharacter.Parent = Workspace
    let oldHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    targetCharacter.SetPrimaryPartCFrame(character.GetPrimaryPartCFrame())
    let tool = ServerStorage.FindFirstChild<Folder>("Tools")!.FindFirstChild<Tool>("Axe")!.Clone()
    let flexTool = new FlexTool("Axe", 1, [])
    FlexibleToolsServer.setFlexToolInst(tool, { flexToolInst: flexTool, character: character, possessionsKey: "item1" })
    let meleeWeaponServer = new MeleeWeaponServerXL(tool)
    tool.Parent = character
    meleeWeaponServer.OnActivated()
    let newHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth < oldHealth)
    FlexibleToolsServer.removeToolWait(tool, character)
    testSetup.clean()
}

// this awards XP and thus requires us to either thread context through all the hero damaging stuff or come up with something else
// so currently nothing smashable drops loot
// // test destroying weapons rack gives you loot
// {
//     let testSetup = new TestContext()
//     testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Heroes")
//     let character = testSetup.getTestPlayerCharacter("Warrior")
//     let testRecord = new Hero("Warrior", CharacterClasses.heroStartingStats.Warrior, [])
//     let oldLootCount = testRecord.gearPool.size()
//     PlayerServer.setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord)
//     let targetCharacter = ReplicatedStorage.FindFirstChild<Folder>("Shared Instances")!.FindFirstChild<Folder>("Placement Storage")!.FindFirstChild<Model>("WeaponsRack")!.Clone()   
//     targetCharacter.Parent = Workspace
//     targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health = 1
//     targetCharacter.SetPrimaryPartCFrame(character.GetPrimaryPartCFrame())
//     let tool = ServerStorage.FindFirstChild<Folder>("Tools")!.FindFirstChild<Tool>("Axe")!.Clone()
//     let flexTool = new FlexTool("Axe", 1, [])
//     FlexibleToolsServer.setFlexToolInst(tool, { flexToolInst: flexTool, character: character, possessionsKey: "item1" })
//     let meleeWeaponServer = new MeleeWeaponServerXL(tool)
//     tool.Parent = character
//     meleeWeaponServer.OnActivated()
//     let newHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
//     TestUtility.assertTrue(newHealth <= 0)
//     TestUtility.assertTrue(testRecord.gearPool.size()>oldLootCount)
//     FlexibleToolsServer.removeToolWait(tool, character)
//     testSetup.clean()
// }


