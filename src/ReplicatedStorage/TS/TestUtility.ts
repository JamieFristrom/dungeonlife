
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { Players, ServerStorage, ReplicatedFirst, ReplicatedStorage, Workspace, CollectionService } from "@rbxts/services"
import { DebugXL, LogArea } from "./DebugXLTS"

import Costumes from "ServerStorage/Standard/CostumesServer"

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"
import { InventoryManagerStub } from "ServerStorage/TS/InventoryManagerStub"
import { GameServer } from "ServerStorage/TS/GameServer"

type Character = Model

export namespace TestUtility {
    let currentModuleName = ""
    let assertionCount = 0

    export function createTestPlayer(): Player {
        while (Players.GetPlayers().size() === 0) {
            wait()
        }
        let testPlayer = Players.GetPlayers()[0]
        cleanTestPlayer(testPlayer)
        return testPlayer
    }

    export function createTestCharacter() {
        let testCharacter = ReplicatedStorage.FindFirstChild<Folder>("TestObjects")!.FindFirstChild<Model>("TestDummy")!.Clone()
        testCharacter.Parent = Workspace.FindFirstChild<Folder>("TestArea")
        CollectionService.AddTag(testCharacter, "CharacterTag")  // wishlist fix; duplication of data problem
        return testCharacter
    }

    export function saveCostumeStub(player: Player) {
        // we didn't forget to clean did we?
        let costumeStub = ServerStorage.FindFirstChild<Folder>("PlayerCostumes")!.FindFirstChild(Costumes.CostumeKey(player))
        DebugXL.Assert(costumeStub === undefined)
        
        const costume = createTestCharacter()
        DebugXL.Assert(costume !== undefined)
        if (costume) {
            let costumeCopy = costume.Clone()
            costumeCopy.Name = Costumes.CostumeKey(player)
            costumeCopy.Parent = ServerStorage.FindFirstChild<Folder>("PlayerCostumes")
        }
    }

    export function cleanCostumeStub(player: Player) {
        let costumeStub = ServerStorage.FindFirstChild<Folder>("PlayerCostumes")!.FindFirstChild(Costumes.CostumeKey(player))
        if (costumeStub) {
            costumeStub.Parent = undefined
        }
    }

    export function cleanTestPlayer(player: Player) {
        player.Team = undefined
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
        for(;;) {
            let testCharacter = Workspace.FindFirstChild<Model>("TestDummy")
            if( testCharacter ) {
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
    }
}

export class TypicalTestSetup {
    inventory = new InventoryManagerStub()
    playerTracker = new PlayerTracker
    player = TestUtility.createTestPlayer()

    constructor() {
        GameServer.levelSession++
        TestUtility.saveCostumeStub(this.player)
    }

    clean() {
        TestUtility.cleanTestPlayer(this.player)
        TestUtility.cleanCostumeStub(this.player)
        TestUtility.cleanTestCharacters()
    }

    getTestPlayerCharacter(className: string): Character {
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
}