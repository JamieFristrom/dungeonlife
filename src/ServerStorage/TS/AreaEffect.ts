import { RunService, Players } from "@rbxts/services";

// wishlist fix
interface Activateable
{
    Activate( ...args:unknown[] ): void
}

export class AreaEffect
{
    update( deltaT: number )
    {
        Players.GetPlayers().forEach( (player)=>
        {
            if( player.Team === this.team )
            {
                let targetCharacter = player.Character as Model
                let hrp = (targetCharacter.FindFirstChild("HumanoidRootPart") as BasePart|undefined) 
                if( hrp )
                {
                    if( hrp.Position.sub( this.myModel.PrimaryPart!.Position ).Magnitude <= this.range )
                    {
                        this.effectFunc( targetCharacter, deltaT )
                    }
                }
            }
        })
    }

    constructor( 
        public myModel: Model,
        public range: number,
        public duration: number,
        public team: Team,
        public effectFunc: ( targetCharacter: Model, deltaT: number )=>void
    ) 
    {
        let lastFrame = time()        
        spawn( ()=>
        {
            lastFrame = time()
            wait(1)
            for(; myModel.Parent!==undefined ;)
            {
                let thisFrame = time()
                this.update( thisFrame - lastFrame )  // being accurate because wait() isn't
                lastFrame = thisFrame
                wait(1)
            }
        } )
    }

}