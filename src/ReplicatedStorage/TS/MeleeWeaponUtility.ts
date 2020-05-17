// This file is part of Dungeon Life. See https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md for license details.

import { Players, Debris } from '@rbxts/services'

import { DebugXL } from './DebugXLTS'

import * as MathXL from 'ReplicatedStorage/Standard/MathXL'

import { AnimationManifestService } from 'ReplicatedFirst/TS/AnimationManifestService'

import { GeneralWeaponUtility } from 'ReplicatedStorage/TS/GeneralWeaponUtility'
import { ToolData } from 'ReplicatedStorage/TS/ToolDataTS'
import { SkinTypeEnum, SkinTypes } from './SkinTypes'

type Character = Model

/**
    Code for the client side behavior of melee weapons.
    Anim names are references into the AnimationManifest
*/
export class MeleeWeaponUtility
{
    attackAnimTracks: AnimationTrack[] = []
    attackUpperBodyAnimTracks: AnimationTrack[] = []
    windUpAnim?: Animation
    windUpAnimTrack?: AnimationTrack
    
    attackIndex = 0

    handle: BasePart
    unsheathSound: Sound
    slashSound: Sound
    hitSound: Sound
    hitVol: number
    hitSoundSpeed: number

    baseData: ToolData.ToolDatumI
    tool: Tool

    getRange() : number
    {
        const range = this.baseData.rangeN
        DebugXL.Assert( range !== undefined )
        return range ? range : 5
    }

    getCooldown() : number
    {
        const cooldown = this.baseData.cooldownN
        DebugXL.Assert( cooldown !== undefined )
        return cooldown ? cooldown : 1
    }

    constructor( tool: Tool )  // I'd prefer to access the appropriate flextool but it's hard to do from client or mob
    {
        this.tool = tool
        this.handle = tool.WaitForChild<BasePart>('Handle')
        this.unsheathSound = this.handle.WaitForChild<Sound>('Unsheath')
        this.slashSound = this.handle.WaitForChild<Sound>('Slash')
        this.hitSound = this.handle.WaitForChild<Sound>('Hit')
        this.hitVol = this.hitSound.Volume
        this.hitSoundSpeed = this.hitSound.PlaybackSpeed
        const baseDataObject = tool.WaitForChild<StringValue>('BaseData')
        const baseDataName = baseDataObject.Value
        this.baseData = ToolData.dataT[baseDataName]
        if( !this.baseData ) {
            DebugXL.Error('Could not find baseData for '+baseDataName)
        }
        if( !SkinTypes[this.baseData.skinType] ) { 
            DebugXL.Error('Could not find skinType for '+this.baseData.skinType)
        }
        const windUpAnimName = SkinTypes[this.baseData.skinType].windUpAttackAnimName
        if( windUpAnimName )
        {
            this.windUpAnim = AnimationManifestService.getAnimInstance( windUpAnimName )
        }
        
    }

    showAttack(character: Character)    
    {
        const wielderPrimaryPart = character.PrimaryPart
        if( !wielderPrimaryPart ) return

        const humanoid = character.FindFirstChildOfClass('Humanoid')
        if (!humanoid) return 

        const player = Players.GetPlayerFromCharacter( character )

        this.slashSound.Play()

        let foundTargetB = false
        const [bestTarget, bestFit] = GeneralWeaponUtility.findClosestTarget( character )
        if( bestTarget )
        {
            if( bestFit <= this.getRange() )
            {
                DebugXL.logD('Combat', bestTarget.Name+" in range")
                foundTargetB = true
                const targetV3 = bestTarget.GetPrimaryPartCFrame().p
                if( player ) {
                    const targetV3InMyPlane = new Vector3( targetV3.X, character.GetPrimaryPartCFrame().p.Y, targetV3.Z )
                    const facingTargetCF = new CFrame( character.GetPrimaryPartCFrame().p, targetV3InMyPlane )
                    character.SetPrimaryPartCFrame( facingTargetCF )
                }
                else
                {
                    const targetVec = bestTarget.GetPrimaryPartCFrame().p.sub( character.GetPrimaryPartCFrame().p )
                    const moveVec = new Vector3( targetVec.X, 0, targetVec.Z )
                    humanoid.Move( moveVec.Unit )
                    wait()
                    humanoid.Move( new Vector3(0,0,0) )
                }
            }
        }
                        
        this.handle.GetChildren().forEach( (child)=>
        {
            if( child.IsA('Trail') )
                child.Enabled = true
        } )
        const adjCooldown = GeneralWeaponUtility.getAdjustedCooldown( character, this.getCooldown() )
        if( this.attackAnimTracks[ this.attackIndex ] ) 
        {
            const speed = wielderPrimaryPart!.Velocity.Magnitude
            DebugXL.logV( 'Combat', 'Speed is '+speed )
            if( speed > 0.5 )
                this.attackUpperBodyAnimTracks[ this.attackIndex ].Play( 0.1, 1, 0.6/adjCooldown ) 
            else
                this.attackAnimTracks[ this.attackIndex ].Play( 0.1, 1, 0.6/adjCooldown )
            
            this.attackIndex = ( this.attackIndex + 1 ) % this.attackAnimTracks.size()
            DebugXL.logV( 'Combat', "Attack index is "+this.attackIndex )
        }
        else
        {
            DebugXL.logD( 'Combat', 'Playing default slash animation' )
//              old default Roblox way to do this when our custom animation is missing
            const Animation = new Instance('StringValue')
            Animation.Name = 'toolanim'
            Animation.Value = 'Slash'
            Animation.Parent = this.tool
            Debris.AddItem(Animation, 2)
        }
        
        if( foundTargetB ) 
        {
            delay( adjCooldown / 2, ()=>
            {
                this.hitSound.PlaybackSpeed = this.hitSoundSpeed * MathXL.RandomNumber( 0.8, 1.2 )
                this.hitSound.Volume = this.hitVol * MathXL.RandomNumber( 0.7, 1.3 )
                this.hitSound.Play() 
            } )
        }

        GeneralWeaponUtility.cooldownWait( character, adjCooldown )  // on server for mob, cooldown will already be started; on client it won't

        this.handle.GetChildren().forEach( (child)=>
        {
            if( child.IsA('Trail') )
                child.Enabled = false
        } )
    }
    
    drawWeapon(character: Character)
    {
        const humanoid = character.FindFirstChild<Humanoid>('Humanoid')
        if( humanoid )
        {
            if( this.windUpAnim )
            {
                // we don't need to save this; we play the pose once and we're done. the attack animations also segue to the pose
                this.windUpAnimTrack = humanoid.LoadAnimation( this.windUpAnim )
                this.windUpAnimTrack.Looped = false
                this.windUpAnimTrack.Play()
                wait( this.windUpAnimTrack.Length * 0.9 )
                this.windUpAnimTrack.AdjustSpeed( 0 )
            }
            const fullBodyAttackAnimNames = SkinTypes[this.baseData.skinType].fullBodyAttackAnimNames
            if( !fullBodyAttackAnimNames ) {
                DebugXL.Error('Could not find fullBodyAttackAnimNames for '+this.baseData.skinType)
            }
            for( let i = 0; i < fullBodyAttackAnimNames.size(); i++ )
            {
                const attackAnim = AnimationManifestService.getAnimInstance( fullBodyAttackAnimNames[i] )
                this.attackAnimTracks[i] = humanoid.LoadAnimation( attackAnim )
                this.attackAnimTracks[i].Looped = false
            }
            const upperBodyAttackAnimNames = SkinTypes[this.baseData.skinType].upperBodyAttackAnimNames
            for( let i = 0; i < upperBodyAttackAnimNames.size(); i++ )
            {
                const attackUpperBodyAnim = AnimationManifestService.getAnimInstance( upperBodyAttackAnimNames[i]! )
                this.attackUpperBodyAnimTracks[i] = humanoid.LoadAnimation( attackUpperBodyAnim )
                this.attackUpperBodyAnimTracks[i].Looped = false 
            }
        }
    }

    sheatheWeapon()
    {
        if( this.windUpAnimTrack )
            this.windUpAnimTrack.Stop()
    }    
}
