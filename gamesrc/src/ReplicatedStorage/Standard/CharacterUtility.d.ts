
type Character = Model

declare class CharacterUtilityClass
{
    GetLastAttackingPlayer( character: Character ): Player
    GetSlowCooldownPct( character: Character ): number
    IsFrozen( character: Character ): boolean
}

declare let CharacterUtility : CharacterUtilityClass

export = CharacterUtility