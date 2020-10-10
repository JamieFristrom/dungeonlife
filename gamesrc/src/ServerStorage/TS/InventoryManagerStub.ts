
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { ActiveSkinSetI, SkinTypeEnum } from "ReplicatedStorage/TS/SkinTypes";
import { InventoryI } from "ReplicatedStorage/TS/InventoryI"

import { InventoryMock } from "ServerStorage/TS/InventoryMock"
import { InventoryManagerI } from "ServerStorage/TS/InventoryManagerI"


export class InventoryDataStoreStub {
    Get() {
        return new InventoryMock()
    }

    Set() {}
}

export class InventoryManagerMock implements InventoryManagerI {
    inventoryMock = new InventoryMock();  // returns this no matter which player is passed in, so you can adjust it

    GetInventoryStoreWait(player: Player): DataStore2<InventoryI> {
        return new InventoryDataStoreStub()
    }

    GetWait(player: Player): InventoryI {
        return this.inventoryMock;
    }

    GetActiveSkinsWait(player: Player): { monster: ActiveSkinSetI, hero: ActiveSkinSetI } {
        return { monster: new Map<SkinTypeEnum,string>(), hero: new Map<SkinTypeEnum,string>() }
    }

    PlayerInTutorial(player: Player): boolean {
        return false
    }

    GetCount(player: Player, itemKey: string): number {
        return this.inventoryMock.itemsT[itemKey] || 0
    }

    AdjustCount(player: Player, itemKey: string, increment: number, analyticItemTypeS?: string, analyticItemIdS?: string): void {        
    }

    IsStarFeedbackDue(player: Player): boolean {
        return false
    }

    SetNextStarFeedbackDueTime(player: Player): void {
    }

    BoostActive(player: Player): boolean {
        return false
    }

    EarnRubies(player: Player, increment: number, analyticItemTypeS: string, analyticItemIdS: string): void {        
    }
}