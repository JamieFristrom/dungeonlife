
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { CharacterKey, CharacterRecord  } from "ReplicatedStorage/TS/CharacterRecord"

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"
import { InventoryManagerI } from "ServerStorage/TS/InventoryManagerI"

type Character = Model

declare class MonstersClass
{
    // also returns CharacterKey but does it lua style and would have to be refactored if we want it
    PlayerCharacterAddedWait( inventoryManager: InventoryManagerI, character: Character, player: Player, playerTracker: PlayerTracker ) : CharacterRecord

    Initialize( playerTracker: PlayerTracker, character: Character, characterKey: CharacterKey, walkSpeed: number, monsterClass: string ) : void
    Died( character: Character ) : void
}

declare let Monsters: MonstersClass

export = Monsters

