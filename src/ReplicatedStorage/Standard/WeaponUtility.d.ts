declare class WeaponUtilityClass
{
    CooldownWait( player: Player, cooldownDurationN: number, walkSpeedMulN?: number ) : void
    IsCoolingDown( player: Player ) : boolean
    FindClosestTargetInCone( character: Model, attackConeDotProduct: number ) : [ Model, number ]
    GetAdjustedCooldown( player: Player, cooldownDurationN: number ) : number
}

declare let WeaponUtility: WeaponUtilityClass

export = WeaponUtility