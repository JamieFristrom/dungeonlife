import { Players, Teams } from "@rbxts/services";

export class PitTrap
{
// the floor is for placement purposes - it is invisible and uncollidable, a root part, primarypart
// the openfloor is what the pit looks like when the floor is open
// the hitbox is the collision
// the DisposableFloor is provided by the thing that spawns the pit; we reference the floor from the existing tile
    trap: Model

    constructor( _script: Script )
    {        
        this.trap = _script.Parent as Model
        let openFloor = this.trap.FindFirstChild('OpenFloor')!
        let hitBox = this.trap.FindFirstChild<BasePart>('Hitbox')!
        let heroesTeam = Teams.FindFirstChild('Heroes')!

        openFloor.Parent = undefined  

        hitBox.Touched.Connect( ( toucher )=>
        {
            if( toucher.Parent!.FindFirstChild('Humanoid') ) 
            {
                let character = toucher.Parent as Model
                let player = Players.GetPlayerFromCharacter( character )
                if( player ) {
                    if( player.Team === heroesTeam ) {
                        let disposableFloor = this.trap.FindFirstChild<ObjectValue>('DisposableFloor')!.Value!
                        disposableFloor.Destroy()
                        hitBox.Destroy()
                        openFloor.Parent = script.Parent
                        openFloor.FindFirstChild<Sound>('OpenSound')!.Play()
                    }
                }
            }
        })
    }
}