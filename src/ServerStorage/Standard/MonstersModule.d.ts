import { CharacterKey  } from "ReplicatedStorage/TS/CharacterRecord"

type Character = Model

declare class MonstersClass
{
    Initialize( character: Character, characterKey: CharacterKey, walkSpeed: number, monsterClass: string, monsterLevel: number ) : void
}

declare let Monsters: MonstersClass

export = Monsters

