type Character = Model

declare class WeaponUtilityClass
{
    CooldownWait( player: Player, cooldownDurationN: number, walkSpeedMulN?: number ) : void
    IsCoolingDown( player: Player ) : boolean
    GetAdjustedCooldown( player: Player, cooldownDurationN: number ) : number
    GetTargetPoint( character: Character ) : Vector3
}

declare let WeaponUtility: WeaponUtilityClass

export = WeaponUtility