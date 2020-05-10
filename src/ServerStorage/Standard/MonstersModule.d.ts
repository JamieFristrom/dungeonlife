import { CharacterKey  } from "ReplicatedStorage/TS/CharacterRecord"
import { MonsterStatBlockI } from "ReplicatedStorage/TS/CharacterClasses"

type Character = Model

declare class MonstersClass
{
    Initialize( character: Character, characterKey: CharacterKey, walkSpeed: number, monsterDatum: MonsterStatBlockI, monsterLevel: number ) : void
}

declare let Monsters: MonstersClass

export = Monsters

