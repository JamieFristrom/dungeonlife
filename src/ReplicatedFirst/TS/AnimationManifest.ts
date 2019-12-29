import { ReplicatedStorage, ReplicatedFirst } from "@rbxts/services"
import { DebugXL } from "../../ReplicatedStorage/TS/DebugXLTS"

/**
    \brief Wrapper around data about what the animation id's are for this particular place or group.
    I thought about having AnimationManifest be a data file where we'd keep track of our animation ids, 
    which might have been a little easier to deal with, but then there'd be issues with checking in the file:
    and if we left it in .gitignore what if we added more animation types later?
*/
export namespace AnimationManifest
{
    const animationManifest = ReplicatedFirst.WaitForChild( 'AnimationManifest', 5 )
    DebugXL.Assert( animationManifest !== undefined )

    export function getAnimInstance( animName: string ) : Animation
    {
        const animInstance = animationManifest ? animationManifest.WaitForChild<Animation>( animName, 5 ) : undefined
        if( !animInstance ) {
            DebugXL.Error( 'Content error: no animation manifest for '+animName )
        }
        return animInstance!  // because if it's not you're doing it wrong
    }
}