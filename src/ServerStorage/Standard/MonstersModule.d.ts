
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { CharacterKey  } from "ReplicatedStorage/TS/CharacterRecord"

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"

type Character = Model

declare class MonstersClass
{
    Initialize( playerTracker: PlayerTracker, character: Character, characterKey: CharacterKey, walkSpeed: number, monsterClass: string ) : void
    Died( character: Character ) : void
}

declare let Monsters: MonstersClass

export = Monsters

