import { InventoryI } from "ReplicatedStorage/TS/InventoryI"

declare class InventoryUtilityClass
{
    GetCount( playerInventory: InventoryI, itemS: string ): number
}
declare let InventoryUtility : InventoryUtilityClass
export = InventoryUtility