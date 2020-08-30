
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DungeonPlayerMap, DungeonPlayer } from "ServerStorage/TS/DungeonPlayer"
import { PlayerTracker } from "ServerStorage/TS/PlayerServer"

import { CharacterRecord, CharacterKey } from "ReplicatedStorage/TS/CharacterRecord"
import { ServerContextI } from "ServerStorage/TS/ServerContext"


type Character = Model

declare class GameManagementClass {
    GetDungeonPlayer(player: Player): DungeonPlayer
    GetLevelSession(): number
    MonitorPlayerbase(): void
    MarkPlayersCharacterForRespawn(player: Player, optionalRespawnPart?: BasePart): void
    PlayerCharactersExist(dungeonPlayerMap: DungeonPlayerMap): boolean
    SetLevelReady(ready: boolean): void
    LevelReady(): boolean
    MonitorHandleDeath(context: ServerContextI, player: Player, dungeonPlayer: DungeonPlayer, playerCharacter: Character, humanoid: Humanoid): boolean
    // also returns a CharacterKey but does it Lua style so we'd have to refactor if we want that
    MonsterAddedWait(context: ServerContextI, character: Character, player: Player, inTutorial: boolean): CharacterRecord
}

declare let GameManagement: GameManagementClass

export = GameManagement