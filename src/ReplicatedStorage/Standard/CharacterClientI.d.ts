import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";

declare class CharacterClientIClass
{
    maxSlots: 4
    GetPossessionFromSlot( characterDataT: CharacterRecord, slotN: number ) : FlexTool
    GetCharacterClass( player: Player ): string
}

declare let CharacterClientI : CharacterClientIClass

export = CharacterClientI