import { ReplicatedFirst } from "@rbxts/services"
import { DebugXL, LogArea } from "../../ReplicatedStorage/TS/DebugXLTS"
import { AnimationManifest } from "./AnimationManifest"
/**
    \brief Wrapper around data about what the animation id's are for this particular place or group.
    I went back and forth on how this works, between having it in a ts file vs having it be a folder full of animations
    in the RBXL. Having it be in the RBXL turned out to be a mistake because then I couldn't make changes to the RBXL
    without bashing every other place's animation manifest.
*/
export namespace AnimationManifestService {
    const animationFolder = ReplicatedFirst.WaitForChild('AnimationManifest', 5)
    DebugXL.Assert(animationFolder !== undefined)

    export function getAnimInstance(animName: string): Animation {
        let animInstance = (animationFolder!.FindFirstChild(animName) as Animation|undefined)
        if (!animInstance) {
            const animId = AnimationManifest[animName]
            if (!animId) {
                DebugXL.Error('Animation ' + animName + ' not in manifest:')
                DebugXL.Dump(AnimationManifest, LogArea.Config)
            }
            else {
                // A bit weird - if we're running on the server this will automatically replicate to the client.
                // So the client can get updated one of two ways, either it runs this code first or the server replicates first.
                // Either way should be fine.
                animInstance = new Instance("Animation")
                animInstance.Name = animName
                animInstance.AnimationId = AnimationManifest[animName]
                animInstance.Parent = animationFolder
            }
        }
        return animInstance!
    }
}