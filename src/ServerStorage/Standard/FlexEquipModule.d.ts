import { ActiveSkins } from "ReplicatedStorage/TS/SkinTypes"
import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { InventoryManagerI } from "ServerStorage/TS/InventoryManagerI"
import { PlayerTracker } from "ServerStorage/TS/PlayerServer"

declare class FlexEquipClass
{
    ApplyEntireCostumeWait( player: Player, pcData: CharacterRecord, activeSkins: ActiveSkins) : void
    ApplyEntireCostumeIfNecessaryWait( playerTracker: PlayerTracker, inventoryManager: InventoryManagerI, player: Player ) : void
}

declare let FlexEquip: FlexEquipClass

export = FlexEquip
