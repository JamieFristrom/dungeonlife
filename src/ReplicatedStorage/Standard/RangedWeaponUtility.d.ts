type Character = Model

declare namespace RangedWeaponUtility
{
    function MouseHitNontransparent( mouse: Mouse, ignoreDescendantsVolatile: Instance[] ) : [ BasePart, Vector3, Vector3 ]
}

export = RangedWeaponUtility