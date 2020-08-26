
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { CharacterKey, CharacterRecord, CharacterRecordI } from "ReplicatedStorage/TS/CharacterRecord"

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"
import { InventoryManagerI } from "ServerStorage/TS/InventoryManagerI"
import { SuperbossManager } from "ServerStorage/TS/SuperbossManager"
import { ServerContextI } from "ServerStorage/TS/ServerContext"

import { DamageTags } from "ReplicatedStorage/TS/DamageTags"

type Character = Model

declare class MonstersClass {
    AdjustBuildPoints( player: Player, amount: number ): void

    // also returns CharacterKey but does it lua style and would have to be refactored if we want it
    PlayerCharacterAddedWait(
        inventoryManager: InventoryManagerI,
        character: Character,
        player: Player,
        playerTracker: PlayerTracker,
        superbossManager: SuperbossManager,
        currentLevelSession: number): CharacterRecord

    Initialize(
        playerTracker: PlayerTracker,
        character: Character,
        characterKey: CharacterKey,
        walkSpeed: number,
        monsterClass: string,
        superbossManager: SuperbossManager,
        currentLevelSession: number): void
        
    Died(character: Character, cr: CharacterRecordI): void

    DoDirectDamage( context: ServerContextI, optionalDamagingPlayer: Player, damage: number, targetHumanoid: Humanoid, damageTagsT: DamageTags, critB: boolean ): void
}

declare let Monsters: MonstersClass

export = Monsters

