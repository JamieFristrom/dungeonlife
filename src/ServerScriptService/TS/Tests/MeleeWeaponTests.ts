// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI(LogArea.Executed, script.Name)

import MeleeWeaponServerXL from "ServerStorage/Standard/MeleeWeaponServerXL"

import { TestUtility, TypicalTestSetup } from "ReplicatedStorage/TS/TestUtility";
import { Workspace, ServerStorage, ReplicatedStorage, Teams } from "@rbxts/services";
import { FlexibleToolsServer } from "ServerStorage/TS/FlexibleToolsServer";
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";
import { PlayerServer } from "ServerStorage/TS/PlayerServer";
import { CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses";
import { Hero } from "ReplicatedStorage/TS/HeroTS";
import { Monster } from "ReplicatedStorage/TS/Monster"
import { CharacterRecordNull, CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord";


// test hit with a weapon
{
    let testSetup = new TypicalTestSetup()
    testSetup.player.Team = Teams.FindFirstChild<Team>("Heroes")
    let character = testSetup.getTestPlayerCharacter("Warrior")
    let testRecord = new Hero("Warrior", CharacterClasses.heroStartingStats.Warrior, [])
    PlayerServer.setCharacterRecordForPlayer(testSetup.player, testRecord)
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
    DebugXL.Assert(tool.Parent === character)
    meleeWeaponServer.OnActivated()
    let newHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    DebugXL.Assert(newHealth < oldHealth)
    FlexibleToolsServer.removeToolWait(tool, character)
    testSetup.clean()
}


// test change teams monster->hero before the activation registers
{
    let testSetup = new TypicalTestSetup()
    testSetup.player.Team = Teams.FindFirstChild<Team>("Monsters")
    let character = testSetup.getTestPlayerCharacter("Orc")
    let testRecord = new Monster("Orc", [], 1)
    PlayerServer.setCharacterRecordForPlayer(testSetup.player, testRecord)

    let targetCharacter = TestUtility.createTestCharacter()
    let oldHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    targetCharacter.Parent = Workspace
    targetCharacter.SetPrimaryPartCFrame(character.GetPrimaryPartCFrame())
    let tool = ServerStorage.FindFirstChild<Folder>("Tools")!.FindFirstChild<Tool>("Axe")!.Clone()
    let flexTool = new FlexTool("Axe", 1, [])
    FlexibleToolsServer.setFlexToolInst(tool, { flexToolInst: flexTool, character: character, possessionsKey: "item1" })
    let meleeWeaponServer = new MeleeWeaponServerXL(tool)
    tool.Parent = character
    testSetup.player.Team = Teams.FindFirstChild<Team>("Heroes")
    meleeWeaponServer.OnActivated()
    let newHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    DebugXL.Assert(newHealth === oldHealth)
    FlexibleToolsServer.removeToolWait(tool, character)
    testSetup.clean()
}

// test change teams hero->monster before the activation registers
{
    let testSetup = new TypicalTestSetup()
    testSetup.player.Team = Teams.FindFirstChild<Team>("Heroes")
    let character = testSetup.getTestPlayerCharacter("Warrior")
    let testRecord = new Hero("Warrior", CharacterClasses.heroStartingStats.Warrior, [])
    PlayerServer.setCharacterRecordForPlayer(testSetup.player, testRecord)

    let targetCharacter = TestUtility.createTestCharacter()
    let oldHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    targetCharacter.Parent = Workspace
    targetCharacter.SetPrimaryPartCFrame(character.GetPrimaryPartCFrame())
    let tool = ServerStorage.FindFirstChild<Folder>("Tools")!.FindFirstChild<Tool>("Axe")!.Clone()
    let flexTool = new FlexTool("Axe", 1, [])
    FlexibleToolsServer.setFlexToolInst(tool, { flexToolInst: flexTool, character: character, possessionsKey: "item1" })
    let meleeWeaponServer = new MeleeWeaponServerXL(tool)
    tool.Parent = character
    testSetup.player.Team = Teams.FindFirstChild<Team>("Monsters")
    meleeWeaponServer.OnActivated()
    let newHealth = targetCharacter.FindFirstChild<Humanoid>("Humanoid")!.Health
    DebugXL.Assert(newHealth < oldHealth)
    FlexibleToolsServer.removeToolWait(tool, character)
    testSetup.clean()
}
