import { Workspace, ServerStorage } from "@rbxts/services";
import * as MathXL from "ReplicatedStorage/Standard/MathXL"

// this may seem completely overwrought but I wanted to be document-view model about it
// because characters get destroyed and recreated when they do costume changes
// so they can lose most of their state.

// wishlist: put other auras, fire, ice in here

export namespace AuraServer
{
    function activate( character: Model, color3: Color3, auraId: string )
    {
        character.GetChildren().forEach( instance =>
            {
                if( instance.IsA("BasePart"))
                {
                    if( !instance.FindFirstChild(auraId))
                    {
                        spawn( function()
                        {
                            wait( MathXL.RandomNumber( 0, 1 ))  // stagger the particles from each other so less of a periodic flash
                            let newCloud = ServerStorage.FindFirstChild('CharacterFX')!.FindFirstChild('AuraGlow')!.FindFirstChild('AuraGlowParticles')!.Clone() as ParticleEmitter
                            newCloud.Name = auraId
                            newCloud.Color = new ColorSequence( color3 )
                            if( instance.Name === 'Head' )
                            {
                                newCloud.Rate = newCloud.Rate * 4
                            }
                            newCloud.Parent = instance      
                        })
                    }
                }
            })
    }

    function deactivate( character: Model, auraId: string )
    {
        character.GetChildren().forEach( instance =>
            {
                if( instance.IsA("BasePart"))
                {
                    let existingFX = instance.FindFirstChild<ParticleEmitter>(auraId)
                    if( existingFX )
                    {
                        existingFX.Destroy()
                    }
                }
            })
    }

    function maintainAuras( character: Model )
    {
        // currently auras can come from:
        //   certain types of monsters
        //   being affected by a CharacterXL effect
        //   being near a wisp
        let auraOfCourage = character.FindFirstChild<Vector3Value>("AuraOfCourage")
        if( auraOfCourage )
            activate( character, new Color3(1,1,0), "AuraOfCourageFX" )
        else
            deactivate( character, "AuraOfCourageFX" )
    }

    export function run()
    {
        spawn( () => 
        {
            for(;;)
            {
                wait(1)
                Workspace.GetChildren().forEach( child => 
                {
                    if( child.IsA("Model") )
                    {
                        let humanoid = child.FindFirstChild<Humanoid>("Humanoid")
                        if( humanoid )
                        {
                            maintainAuras( child )
                        }
                    }
                })
            }
        })
    }
}