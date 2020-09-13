
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "../../ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Players, ServerStorage, ReplicatedStorage, Workspace, CollectionService } from "@rbxts/services"

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
        let testCharacter = (ReplicatedStorage.FindFirstChild("TestObjects")!.FindFirstChild("TestDummy") as Model|undefined)!.Clone()
        // deliberately not putting them in Mobs so they won't get processed by non-test systems
        testCharacter.Parent = (Workspace.FindFirstChild("TestArea") as Folder|undefined)
        CollectionService.AddTag(testCharacter, "CharacterTag")  // wishlist fix; duplication of data problem
        return testCharacter
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
            let testCharacter = Workspace.FindFirstChild("TestDummy", true)
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
        let dump1 = DebugXL.DumpToStr(expected)
        let dump2 = DebugXL.DumpToStr(actual)
    if (TableXL.DeepMatching(expected, actual)) {
            warn(`Test ${currentModuleName}(${assertionCount}) (${message}) passed: ${dump1}===${dump2}`)
        }
        else {
            DebugXL.Error(`Test ${currentModuleName}(${assertionCount}) (${message}) failed.
                Expected: 
                ${dump1}  
                Actual:
                ${dump2}`)
        }
        assertionCount++
    }

    export function assertNotMatching(expected: unknown, actual: unknown, message = "") {
        let dump1 = DebugXL.DumpToStr(expected)
        let dump2 = DebugXL.DumpToStr(actual)
        if (!TableXL.DeepMatching(expected, actual)) {
            warn(`Test ${currentModuleName}(${assertionCount}) (${message}) passed: ${dump1}!==${dump2}`)
        }
        else {
            DebugXL.Error(`Test ${currentModuleName}(${assertionCount}) (${message}) failed.
                Expected NOT: 
                ${dump1}  
                Actual:
                ${dump2}`)
        }
        assertionCount++
    }
}
