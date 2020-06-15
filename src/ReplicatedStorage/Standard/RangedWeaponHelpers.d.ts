type Character = Model

declare namespace RangedWeaponHelpers
{
    function MouseHitNontransparent( mouse: Mouse, ignoreDescendantsVolatile: Instance[] ) : [ BasePart, Vector3, Vector3 ]
}

export = RangedWeaponHelpers