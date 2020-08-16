
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { Players, ServerStorage, ReplicatedFirst, ReplicatedStorage } from "@rbxts/services"
import { DebugXL } from "./DebugXLTS"
import Costumes from "ServerStorage/Standard/CostumesServer"

export namespace TestUtility {
    export function getTestPlayer(): Player {
        while (Players.GetPlayers().size() === 0) {
            wait()
        }
        let testPlayer = Players.GetPlayers()[0]
        cleanTestPlayer( testPlayer )
        return testPlayer
    }

    export function saveCostumeStub(player: Player) {
        const costume = ReplicatedStorage.FindFirstChild<Folder>("TestObjects")!.FindFirstChild<Model>("TestDummy")
        DebugXL.Assert( costume !== undefined )
        if( costume ) {
            let costumeCopy = costume.Clone()
            costumeCopy.Name = Costumes.CostumeKey(player)
            costumeCopy.Parent = ServerStorage.FindFirstChild<Folder>("PlayerCostumes")
        }
    }

    export function cleanCostumeStub(player: Player) {
        let costumeStub = ServerStorage.FindFirstChild<Folder>("PlayerCostumes")!.FindFirstChild(Costumes.CostumeKey(player))
        if( costumeStub ) {
            costumeStub.Parent = undefined
        }
    }

    export function cleanTestPlayer(player: Player) {
        if( player.Character ) {
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
        cleanCostumeStub(player)
    }
}