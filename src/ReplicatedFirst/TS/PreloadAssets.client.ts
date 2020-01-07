import { ContentProvider } from '@rbxts/services'

import { AssetManifest } from './AssetManifest'
import { AnimationManifestService } from './AnimationManifestService'

const imageIdsToPreload = 
[
    AssetManifest.ImageCog,
    AssetManifest.ImageDungeonLifeLogo,
    // the glowing pointing UI arrows are pretty essential to get into memory right away otherwise tutorial isn't clear, so they need preloading
    AssetManifest.ImageUIArrowDown,
    AssetManifest.ImageUIArrowRight,
    AssetManifest.ImageCooldownCursor01,
    AssetManifest.ImageCooldownCursor02,
    AssetManifest.ImageCooldownCursor03,
    AssetManifest.ImageCooldownCursor04,
    AssetManifest.ImageCooldownCursor05,
    AssetManifest.ImageCooldownCursor06,
    AssetManifest.ImageCooldownCursor07,
    AssetManifest.ImageCooldownCursor08,
    AssetManifest.ImageCooldownCursor09,
    AssetManifest.ImageCooldownCursor10,
    AssetManifest.ImageCooldownCursor11,
    AssetManifest.ImageCooldownCursor12
]

const decals:Decal[] = []

imageIdsToPreload.forEach( (imageId)=>
{
	const decal = new Instance('Decal')
    decal.Texture = imageId
    decals.push( decal )
} )

ContentProvider.PreloadAsync( decals )



// afraid I don't remember why I decided these were necessary to preload
const animsToPreload =
[
    AnimationManifestService.getAnimInstance('AttackOneHand1'),
    AnimationManifestService.getAnimInstance('AttackOneHand2'),
    AnimationManifestService.getAnimInstance('WindUpOneHandUpperBody')
]

ContentProvider.PreloadAsync( animsToPreload )