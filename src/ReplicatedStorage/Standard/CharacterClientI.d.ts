import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";

type Character = Model

declare class CharacterClientIClass
{
    maxSlots: 4
    GetPossessionSlot( ignored: CharacterRecord, possession: FlexTool ) : number
    GetPossessionFromSlot( characterDataT: CharacterRecord, slotN: number ) : FlexTool
    GetCharacterClass( player: Player ): string
    ValidTarget( attackingCharacter: Character, defendingInstance: Instance ) : boolean
}

declare let CharacterClientI : CharacterClientIClass

export = CharacterClientI