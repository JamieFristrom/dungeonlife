import { PC } from "ReplicatedStorage/TS/PCTS"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";

declare class CharacterClientIClass
{
    maxSlots: 4
    GetPossessionFromSlot( characterDataT: PC, slotN: number ) : FlexTool
    GetCharacterClass( player: Player ): string
}

declare let CharacterClientI : CharacterClientIClass

export = CharacterClientI