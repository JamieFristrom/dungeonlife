declare namespace MechanicalEffects
{
    // returns array of hit characters
    function Explosion( positionV3: Vector3, damage: number, radius: number, attackingPlayer: Player, dontAttenuate: boolean ) : Model[]
}


export = MechanicalEffects