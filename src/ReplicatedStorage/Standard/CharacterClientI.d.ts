import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { FlexTool, HotbarSlot } from "ReplicatedStorage/TS/FlexToolTS";

type Character = Model

declare class CharacterClientIClass
{
    GetPossessionSlot( ignored: CharacterRecord, possession: FlexTool ) : number
    GetPossessionFromSlot( characterDataT: CharacterRecord, slotN: number ) : FlexTool
    GetCharacterClass( player: Player ): string
    ValidTarget( attackingCharacter: Character, defendingInstance: Instance ) : boolean
}

declare let CharacterClientI : CharacterClientIClass

export = CharacterClientI