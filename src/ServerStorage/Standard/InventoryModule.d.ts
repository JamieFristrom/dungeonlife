import { ActiveSkinSetI } from "ReplicatedStorage/TS/SkinTypes";
import { InventoryI } from "ReplicatedStorage/TS/InventoryI"

interface Inventory
{
    GetInventoryStoreWait( player: Player ) : DataStore2<InventoryI>
    GetWait( player: Player ) : InventoryI
    GetActiveSkinsWait( player: Player ) : { monster: ActiveSkinSetI, hero: ActiveSkinSetI }
    PlayerInTutorial( player: Player ) : boolean
    GetCount( player: Player, itemKey: string ) : number
    AdjustCount( player: Player, itemKey: string, increment: number, analyticItemTypeS?: string, analyticItemIdS?: string ) : void
    IsStarFeedbackDue( player: Player ) : boolean
    SetNextStarFeedbackDueTime( player: Player ) : void
}

declare let inventory: Inventory

export = inventory
