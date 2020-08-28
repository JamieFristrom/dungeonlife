// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.Name)

import { Workspace, ServerStorage, Teams } from "@rbxts/services"

import MeleeWeaponServerXL from "ServerStorage/Standard/MeleeWeaponServerXL"

import { TestUtility, TestContext } from "ServerStorage/TS/TestUtility"
import { FlexibleToolsServer } from "ServerStorage/TS/FlexibleToolsServer"

import { Character } from "ReplicatedStorage/TS/ModelUtility"
import { CharacterClass } from "ReplicatedStorage/TS/CharacterClasses"
import { CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses"
import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { MapUtility } from "ReplicatedStorage/TS/DungeonMap"
import { Monster } from "ReplicatedStorage/TS/Monster"
import { SkinTypeEnum } from "ReplicatedStorage/TS/SkinTypes"

import CharacterUtility from "ReplicatedStorage/Standard/CharacterUtility"
import InstanceXL from "ReplicatedStorage/Standard/InstanceXL"

import CharacterXL from "ServerStorage/Standard/CharacterXL"
import FlexibleTools from "ServerStorage/Standard/FlexibleToolsModule"
import FurnishServer from "ServerStorage/Standard/FurnishServerModule"
import Dungeon from "ServerStorage/Standard/DungeonModule"


class CombatTestHelper {
    testSetup: TestContext
    attacker: Character
    defender: Character
    tool: Tool
    flexTool: FlexTool
    meleeWeapon: MeleeWeaponServerXL
    oldHealth: number

    constructor(testSetup: TestContext, attacker: Character, weapon: string, defender: Character, oldHealth: number) {
        this.testSetup = testSetup
        this.attacker = attacker
        this.defender = defender
        this.oldHealth = oldHealth
        this.defender.Parent = Workspace
        this.defender.SetPrimaryPartCFrame(this.attacker.GetPrimaryPartCFrame())
        this.tool = ServerStorage.FindFirstChild<Folder>("Tools")!.FindFirstChild<Tool>(weapon)!.Clone()
        this.flexTool = new FlexTool(weapon, 1, [])
        this.tool = FlexibleTools.CreateTool({
            toolInstanceDatumT: this.flexTool,
            destinationCharacter: attacker,
            activeSkinsT: new Map<SkinTypeEnum, string>(),
            possessionsKey: "item1"
        })
        FlexibleToolsServer.setFlexToolInst(this.tool, { flexToolInst: this.flexTool, character: this.attacker, possessionsKey: "item1" })
        this.meleeWeapon = new MeleeWeaponServerXL(this.tool, testSetup)
        this.tool.Parent = this.attacker
        this.meleeWeapon.OnEquipped()
        TestUtility.assertTrue(this.tool.Parent === this.attacker, "CombatTestHelper construction succesful")
    }
}

class CombatTestHelperPlayerAttacker extends CombatTestHelper {
    attackerRecord: CharacterRecord

    constructor(attackerClass: CharacterClass, attackerTeam: string, weapon: string, defender: Model) {
        let testSetup = new TestContext()
        testSetup.getPlayer().Team = Teams.FindFirstChild<Team>(attackerTeam)
        let attacker = testSetup.makeTestPlayerCharacter(attackerClass)
        let attackerRecord = attackerTeam === "Heroes" ?
            new Hero(attackerClass, CharacterClasses.heroStartingStats[attackerClass], []) :
            new Monster(attackerClass, [], 1)
        testSetup.getPlayerTracker().setCharacterRecordForPlayer(testSetup.getPlayer(), attackerRecord)
        let oldHealth = defender.FindFirstChild<Humanoid>("Humanoid")!.Health
        super(testSetup, attacker, weapon, defender, oldHealth)
        this.attackerRecord = attackerRecord
    }

    clean() {
        FlexibleToolsServer.removeToolWait(this.tool, this.attacker)
        this.testSetup.clean()
    }
}

// refactored only to discover that monster attacking player doesn't fit paradigm
class CombatTestHelperPlayerDefender extends CombatTestHelper {
    constructor(attackerClass: CharacterClass, attackerTeam: string, attacker: Model, weapon: string, defenderClass: CharacterClass, defenderTeam: string) {
        let testSetup = new TestContext()
        testSetup.getPlayer().Team = Teams.FindFirstChild<Team>(defenderTeam)
        let defender = testSetup.makeTestPlayerCharacter(defenderClass)
        let defenderRecord = defenderTeam === "Heroes" ?
            new Hero(defenderClass, CharacterClasses.heroStartingStats[defenderClass], []) :
            new Monster(defenderClass, [], 1)
        testSetup.getPlayerTracker().setCharacterRecordForPlayer(testSetup.getPlayer(), defenderRecord)
        let oldHealth = defender.FindFirstChild<Humanoid>("Humanoid")!.Health
        super(testSetup, attacker, weapon, defender, oldHealth)
    }

    clean() {
        FlexibleToolsServer.removeToolWait(this.tool, this.attacker)
        this.testSetup.clean()
    }
}


{
    let testSetup = new TestContext()
    Dungeon.BuildWait(testSetup, (player) => { })
    let trapDoors = Workspace.FindFirstChild<Folder>("Environment")!.FindFirstChild<Model>("TrapDoors", true)!
    let oldHealth = trapDoors.FindFirstChild<Humanoid>("Humanoid")!.Health
    let combatHelper = new CombatTestHelper(testSetup, testSetup.makeTestPlayerCharacter("Mage"), "Staff", trapDoors, oldHealth)
    let attackerRecord = new Hero("Mage", CharacterClasses.heroStartingStats["Mage"], [])      // can't just put tool in constructor because it gets cloned 
    attackerRecord.giveFlexTool(combatHelper.flexTool)                                           // whereas this just attaches the existing one
    testSetup.getPlayerTracker().setCharacterRecordForPlayer(testSetup.getPlayer(), attackerRecord)
    combatHelper.testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Heroes")
    combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health = 1
    const oldLoot = attackerRecord.gearPool.size()  // testing this in StructureTests

    // act
    combatHelper.meleeWeapon.OnActivated()

    // assert
    let newHealth = combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth <= 0, "Trap doors smashed")

    // clean
    testSetup.clean()
}

// test smack destructible structure drops loot
{
    // arrange; need to build structure via FurnishServer so it'll have Destructible
    let testSetup = new TestContext()
    testSetup.getInventoryMock().itemsT["TestDestructibleLoot"] = 1
    InstanceXL.CreateSingleton("NumberValue", { Name: "BuildPoints", Parent: testSetup.getPlayer(), Value: 1000 })
    let map = MapUtility.makeEmptyMap(5)
    let [structureModel] = FurnishServer.Furnish(testSetup, map, testSetup.getPlayer(), "TestDestructibleLoot", new Vector3(0, 0, 0), 0)
    DebugXL.Assert(structureModel !== undefined)
    let oldHealth = structureModel.FindFirstChild<Humanoid>("Humanoid")!.Health
    let combatHelper = new CombatTestHelper(testSetup, testSetup.makeTestPlayerCharacter("Rogue"), "Shortsword", structureModel, oldHealth)
    let attackerRecord = new Hero("Rogue", CharacterClasses.heroStartingStats["Rogue"], [])      // can't just put tool in constructor because it gets cloned 
    attackerRecord.giveFlexTool(combatHelper.flexTool)                                           // whereas this just attaches the existing one
    testSetup.getPlayerTracker().setCharacterRecordForPlayer(testSetup.getPlayer(), attackerRecord)
    combatHelper.testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Heroes")
    combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health = 1
    const oldLoot = attackerRecord.gearPool.size()  // testing this in StructureTests

    // act
    combatHelper.meleeWeapon.OnActivated()

    // assert
    let newHealth = combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth <= 0, "Structure smashed")
    TestUtility.assertTrue(attackerRecord.gearPool.size() > oldLoot, "Structure dropped loot")  // testing this in StructureTests

    // clean
    testSetup.clean()
}

// test monster fire enchantments work
{
    // arrange
    let testAttacker = TestUtility.createTestCharacter()
    let combatHelper = new CombatTestHelperPlayerDefender("Sasquatch", "Monsters", testAttacker, "Staff", "Warrior", "Heroes")
    let monster = new Monster("Sasquatch", [], 1)
    monster.giveFlexTool(combatHelper.flexTool)
    combatHelper.flexTool.addEnhancement("fire")
    combatHelper.testSetup.getPlayerTracker().setCharacterRecordForMob(testAttacker, monster)

    // act
    combatHelper.meleeWeapon.OnActivated()

    // assert
    let lastHealth = combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(lastHealth < combatHelper.oldHealth, "Enchanted monster weapon: defender is hurt")
    TestUtility.assertTrue(combatHelper.defender.PrimaryPart!.FindFirstChild("Fire") !== undefined, "Enchanted monster weapon: defender is burning")

    // assert it goes down over time
    CharacterXL.ProcessCharacter(combatHelper.testSetup, combatHelper.defender, 0.1)
    let nextHealth = combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(nextHealth < lastHealth, "monster fire weapon: defender is continually hurt")

    // clean
    combatHelper.clean()
}

// test monster ice enchantments work
{
    // arrange
    let testAttacker = TestUtility.createTestCharacter()
    let combatHelper = new CombatTestHelperPlayerDefender("Skeleton", "Monsters", testAttacker, "Broadsword", "Warrior", "Heroes")
    let monster = new Monster("Skeleton", [], 1)
    monster.giveFlexTool(combatHelper.flexTool)
    combatHelper.flexTool.addEnhancement("cold")
    combatHelper.testSetup.getPlayerTracker().setCharacterRecordForMob(testAttacker, monster)

    // act
    combatHelper.meleeWeapon.OnActivated()

    // assert
    let newHealth = combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth < combatHelper.oldHealth, "Enchanted monster weapon: defender is hurt")
    TestUtility.assertTrue(CharacterUtility.GetSlowCooldownPct(combatHelper.defender) < 0.9, "Enchanted monster weapon: defender is slowed")
    TestUtility.assertTrue(combatHelper.defender.FindFirstChild<BasePart>("Head")!.BrickColor === new BrickColor("Toothpaste"),
        "Enchanted monster weapon: defender is toothpaste colored")
    TestUtility.assertTrue(combatHelper.defender.PrimaryPart!.FindFirstChild("IceFX") !== undefined, "Enchanted monster weapon: defender is frosted")

    // clean
    combatHelper.clean()
}

// test hit with a weapon
{
    // arrange
    let combatHelper = new CombatTestHelperPlayerAttacker("Warrior", "Heroes", "Axe", TestUtility.createTestCharacter())

    // act
    combatHelper.meleeWeapon.OnActivated()

    // assert
    let newHealth = combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth < combatHelper.oldHealth)

    // clean
    combatHelper.clean()
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
    // arrange
    let combatHelper = new CombatTestHelperPlayerAttacker("Orc", "Monsters", "Axe", TestUtility.createTestCharacter())

    // act
    combatHelper.testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Heroes")
    combatHelper.meleeWeapon.OnActivated()

    // assert
    let newHealth = combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth === combatHelper.oldHealth)

    // clean
    combatHelper.clean()
}

// test change teams hero->monster before the activation registers
{
    // arrange
    let combatHelper = new CombatTestHelperPlayerAttacker("Warrior", "Heroes", "Axe", TestUtility.createTestCharacter())

    // act
    combatHelper.testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Monsters")
    combatHelper.meleeWeapon.OnActivated()

    // assert
    let newHealth = combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth < combatHelper.oldHealth)

    // clean
    combatHelper.clean()
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

// monsters hitting heroes with enchanted weapons have effects

