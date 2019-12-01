import { InventoryI } from "ReplicatedStorage/TS/InventoryI"

declare class InventoryClient
{
    inventory: InventoryI

    InventoryUpdatedConnect( func: ( funcName: string, inventoryUpdate: InventoryI )=> void ): void
    GetCount( itemKeyS: string ): number
    GetMessagesShown( messageKeyS: string ): number
}

declare let inventoryClient: InventoryClient

export = inventoryClient
