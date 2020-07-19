import { ActiveSkins } from "ReplicatedStorage/TS/SkinTypes"
import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"

declare class FlexEquipClass
{
    ApplyEntireCostumeWait( player: Player, pcData: CharacterRecord, activeSkins: ActiveSkins) : void
    ApplyEntireCostumeIfNecessaryWait( player: Player ) : void
}

declare let FlexEquip: FlexEquipClass

export = FlexEquip
