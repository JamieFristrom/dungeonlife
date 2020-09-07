
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "../../ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Players, ServerStorage, ReplicatedFirst, ReplicatedStorage, Workspace, CollectionService } from "@rbxts/services"

import Costumes from "ServerStorage/Standard/CostumesServer"

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"
import { InventoryManagerMock } from "ServerStorage/TS/InventoryManagerStub"
import { GameServer } from "ServerStorage/TS/GameServer"
import { ServerContext } from "ServerStorage/TS/ServerContext"
import { GameManagerMock } from "ServerStorage/TS/GameManagerMock"

import Dungeon from "ServerStorage/Standard/DungeonModule"

import { RandomNumberGenerator } from "ReplicatedStorage/TS/RandomNumberGenerator"

import TableXL from "ReplicatedStorage/Standard/TableXL"

type Character = Model

export namespace TestUtility {
    let currentModuleName = ""
    let assertionCount = 0
    let savedPlayerTeam: Team | undefined

    export function createTestPlayer(): Player {
        while (Players.GetPlayers().size() === 0) {
            wait()
        }
        let testPlayer = Players.GetPlayers()[0]
        savedPlayerTeam = testPlayer.Team              // not reliable but better than nothing
        cleanTestPlayer(testPlayer)
        return testPlayer
    }

    export function createTestCharacter() {
        let testCharacter = ReplicatedStorage.FindFirstChild<Folder>("TestObjects")!.FindFirstChild<Model>("TestDummy")!.Clone()
        // deliberately not putting them in Mobs so they won't get processed by non-test systems
        testCharacter.Parent = Workspace.FindFirstChild<Folder>("TestArea")
        CollectionService.AddTag(testCharacter, "CharacterTag")  // wishlist fix; duplication of data problem
        return testCharacter
    }

    export function saveCostumeStub(player: Player) {
        // we didn't forget to clean did we?
        let costumeStub = ServerStorage.FindFirstChild<Folder>("PlayerCostumes")!.FindFirstChild(Costumes.CostumeKey(player))
        DebugXL.Assert(costumeStub === undefined)  // if there's a lingering costume probably someone forgot to clean their test context

        let costumeCopy = ReplicatedStorage.FindFirstChild<Folder>("TestObjects")!.FindFirstChild<Model>("TestDummy")!.Clone()
        costumeCopy.Name = Costumes.CostumeKey(player)
        costumeCopy.Parent = ServerStorage.FindFirstChild<Folder>("PlayerCostumes")
    }

    export function cleanCostumeStub(player: Player) {
        let costumeStub = ServerStorage.FindFirstChild<Folder>("PlayerCostumes")!.FindFirstChild(Costumes.CostumeKey(player))
        if (costumeStub) {
            costumeStub.Parent = undefined
        }
    }

    export function cleanTestPlayer(player: Player) {
        player.Team = savedPlayerTeam
        if (player.Character) {
            player.Character.Destroy()
        }
        for (let child of player.GetChildren()) {
            if (child.Name !== "Backpack") {
                if (child.Name !== "PlayerScripts") {
                    if (child.Name !== "StarterGear") {
                        if (child.Name !== "PlayerGui") {
                            child.Destroy()
                        }
                    }
                }
            }
        }
    }

    export function cleanTestCharacters() {
        for (; ;) {
            let testCharacter = Workspace.FindFirstChild<Model>("TestDummy", true)
            if (testCharacter) {
                testCharacter.Parent = undefined
            }
            else {
                break
            }

        }
    }

    export function setCurrentModuleName(name: string) {
        currentModuleName = name
        assertionCount = 0
    }

    export function assertTrue(assertion: boolean, message = "") {
        if (assertion) {
            warn(`Test ${currentModuleName}(${assertionCount}) (${message}) passed`)
        }
        else {
            DebugXL.Error(`Test ${currentModuleName}(${assertionCount}) (${message}) failed`)
        }
        assertionCount++
    }

    export function assertMatching(expected: unknown, actual: unknown, message = "") {
        if (TableXL.DeepMatching(expected, actual)) {
            warn(`Test ${currentModuleName}(${assertionCount}) (${message}) passed`)
        }
        else {
            let dump1 = DebugXL.DumpToStr(expected)
            let dump2 = DebugXL.DumpToStr(actual)
            DebugXL.Error(`Test ${currentModuleName}(${assertionCount}) (${message}) failed.
                Expected: 
                ${dump1}  
                Actual:
                ${dump2}`)
        }
        assertionCount++
    }
}

export class TestContext extends ServerContext {
    private player = TestUtility.createTestPlayer()

    constructor(seed?: number) {
        super(new GameManagerMock(), new InventoryManagerMock(), new PlayerTracker, new RandomNumberGenerator(seed))
        GameServer.levelSession++
        TestUtility.saveCostumeStub(this.player)
    }

    clean() {
        Dungeon.Clean()
        TestUtility.cleanTestPlayer(this.player)
        TestUtility.cleanCostumeStub(this.player)
        TestUtility.cleanTestCharacters()
    }

    makeTestPlayerCharacter(className: string): Character {
        let testCharacter = Costumes.LoadCharacter(
            this.player,
            [ServerStorage.FindFirstChild<Folder>("Monsters")!.FindFirstChild<Model>(className)!],
            {},
            true,
            undefined,
            new CFrame()
        )!
        testCharacter.Parent = Workspace
        return testCharacter
    }

    getPlayer() { return this.player }

    getInventoryMock() {
        return (this.getInventoryMgr() as InventoryManagerMock).inventoryMock
    }
}