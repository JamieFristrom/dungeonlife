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
import { Character } from "ReplicatedStorage/TS/ModelUtility";
import { CharacterClass } from "ReplicatedStorage/TS/CharacterClasses"
import CharacterUtility from "ReplicatedStorage/Standard/CharacterUtility";

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
        FlexibleToolsServer.setFlexToolInst(this.tool, { flexToolInst: this.flexTool, character: this.attacker, possessionsKey: "item1" })
        this.meleeWeapon = new MeleeWeaponServerXL(this.tool)
        this.tool.Parent = this.attacker
        this.meleeWeapon.OnEquipped()
        TestUtility.assertTrue(this.tool.Parent === this.attacker)   
    }
}

class CombatTestHelperPlayerAttacker extends CombatTestHelper {
    constructor(attackerClass: CharacterClass, attackerTeam: string, weapon: string, defender: Model) {
        let testSetup = new TestContext()
        testSetup.getPlayer().Team = Teams.FindFirstChild<Team>(attackerTeam)
        let attacker = testSetup.makeTestPlayerCharacter(attackerClass)
        let testRecord = attackerTeam === "Heroes" ? 
            new Hero(attackerClass, CharacterClasses.heroStartingStats[attackerClass], []) :
            new Monster(attackerClass, [], 1)
        PlayerServer.setCharacterRecordForPlayer(testSetup.getPlayer(), testRecord)
        let oldHealth = defender.FindFirstChild<Humanoid>("Humanoid")!.Health
        super(testSetup, attacker, weapon, defender, oldHealth)
    }

    clean()
    {
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
            new Hero(defenderClass, CharacterClasses.heroStartingStats[attackerClass], []) :
            new Monster(defenderClass, [], 1)
        PlayerServer.setCharacterRecordForPlayer(testSetup.getPlayer(), defenderRecord)
        let oldHealth = defender.FindFirstChild<Humanoid>("Humanoid")!.Health
        super(testSetup, attacker, weapon, defender, oldHealth)
    }

    clean()
    {
        FlexibleToolsServer.removeToolWait(this.tool, this.attacker)
        this.testSetup.clean()
    }
}
// test monster enchantments work
{
    // arrange
    let combatHelper = new CombatTestHelperPlayerDefender("Skeleton","Monsters",TestUtility.createTestCharacter(),"Broadsword","Warrior","Heroes")
    combatHelper.flexTool.addEnhancement( "cold" )
    // act
    combatHelper.meleeWeapon.OnActivated()

    // assert
    let newHealth = combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth < combatHelper.oldHealth, "Enchanted monster weapon: defender is hurt")
    TestUtility.assertTrue(CharacterUtility.IsFrozen(combatHelper.defender), "Enchanted monster weapon: defender is frozen")

    // clean
    combatHelper.clean()
}

// test hit with a weapon
{
    // arrange
    let combatHelper = new CombatTestHelperPlayerAttacker("Warrior","Heroes","Axe",TestUtility.createTestCharacter())

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
    let combatHelper = new CombatTestHelperPlayerAttacker("Orc","Monsters","Axe",TestUtility.createTestCharacter())

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
    let combatHelper = new CombatTestHelperPlayerAttacker("Warrior","Heroes","Axe",TestUtility.createTestCharacter())

    // act
    combatHelper.testSetup.getPlayer().Team = Teams.FindFirstChild<Team>("Monsters")
    combatHelper.meleeWeapon.OnActivated()

    // assert
    let newHealth = combatHelper.defender.FindFirstChild<Humanoid>("Humanoid")!.Health
    TestUtility.assertTrue(newHealth < combatHelper.oldHealth)

    // clean
    combatHelper.clean()
}

// test smack destructible structure
{
    // arrange
    let combatHelper = new CombatTestHelperPlayerAttacker("Warrior","Heroes","Axe",
        ReplicatedStorage.FindFirstChild<Folder>("Shared Instances")!.FindFirstChild<Folder>("Placement Storage")!.FindFirstChild<Model>("Barrel")!.Clone())

    // act
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

