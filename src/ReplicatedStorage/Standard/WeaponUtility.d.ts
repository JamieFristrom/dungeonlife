type Character = Model

declare class WeaponUtilityClass
{
    GetTargetPoint( character: Character ) : Vector3
}

declare let WeaponUtility: WeaponUtilityClass

export = WeaponUtility