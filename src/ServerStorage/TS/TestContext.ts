
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

import { TestUtility } from "ReplicatedStorage/TS/TestUtility"

type Character = Model

export class TestContext extends ServerContext {
    private player = TestUtility.createTestPlayer()

    constructor(seed?: number) {
        super(new GameManagerMock(), new InventoryManagerMock(), new PlayerTracker, new RandomNumberGenerator(seed))
        GameServer.levelSession++
        this.saveCostumeStub(this.player)
    }

    clean() {
        Dungeon.Clean()
        TestUtility.cleanTestPlayer(this.player)
        this.cleanCostumeStub(this.player)
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

    
    saveCostumeStub(player: Player) {
        // we didn't forget to clean did we?
        let costumeStub = ServerStorage.FindFirstChild<Folder>("PlayerCostumes")!.FindFirstChild(Costumes.CostumeKey(player))
        DebugXL.Assert(costumeStub === undefined)  // if there's a lingering costume probably someone forgot to clean their test context

        let costumeCopy = ReplicatedStorage.FindFirstChild<Folder>("TestObjects")!.FindFirstChild<Model>("TestDummy")!.Clone()
        costumeCopy.Name = Costumes.CostumeKey(player)
        costumeCopy.Parent = ServerStorage.FindFirstChild<Folder>("PlayerCostumes")
    }

    cleanCostumeStub(player: Player) {
        let costumeStub = ServerStorage.FindFirstChild<Folder>("PlayerCostumes")!.FindFirstChild(Costumes.CostumeKey(player))
        if (costumeStub) {
            costumeStub.Parent = undefined
        }
    }
}