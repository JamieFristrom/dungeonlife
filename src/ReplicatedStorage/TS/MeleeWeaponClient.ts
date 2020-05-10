// This file is part of Dungeon Life. See https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md for license details.

import { Players, Debris } from '@rbxts/services'

import { DebugXL } from './DebugXLTS'

import * as MathXL from 'ReplicatedStorage/Standard/MathXL'
import * as WeaponUtility from 'ReplicatedStorage/Standard/WeaponUtility'

import { AnimationManifestService } from 'ReplicatedFirst/TS/AnimationManifestService'

import { GeneralWeaponUtility } from 'ReplicatedStorage/TS/GeneralWeaponUtility'

type Character = Model

/**
    Code for the client side behavior of melee weapons.
    Anim names are references into the AnimationManifest
*/
export class MeleeWeaponClient
{
    public static readonly swordSweepDot = -2

    // we can attack anyone in a 360 degree circle; trying to keep less skill necessary
    constructor( tool: Tool, fullBodyAttackAnimNames: string[], upperBodyAttackAnimNames: string[], windUpAnimName?: string )
    {
        const attackAnimTracks: AnimationTrack[] = []
        const attackUpperBodyAnimTracks: AnimationTrack[] = []
        let windUpAnimTrack: AnimationTrack
        
        let attackIndex = 0
        
        const handle = tool.WaitForChild<BasePart>('Handle')
        const unsheathSound = handle.WaitForChild<Sound>('Unsheath')
        const slashSound = handle.WaitForChild<Sound>('Slash')
        const hitSound = handle.WaitForChild<Sound>('Hit')
        const hitVol = hitSound.Volume
        const hitSoundSpeed = hitSound.PlaybackSpeed
        
        // don't remember why we're getting these numbers from numbervalues and not the source data;
        // hopefully the source data is setting them
        // But I can't find it. Will test.
        const range = tool.WaitForChild<NumberValue>('Range').Value
        const cooldown = tool.WaitForChild<NumberValue>('Cooldown').Value

        function OnButton1Down(mouse: Mouse, character: Model, wielderPrimaryPart: BasePart)    
		{

            const player = Players.GetPlayerFromCharacter( character )
            DebugXL.Assert( player !== undefined )
            if( !player ) return

            if( WeaponUtility.IsCoolingDown( player ) ) return
            
            slashSound.Play()

            let foundTargetB = false
            const [bestTarget, bestFit] = GeneralWeaponUtility.findClosestTarget( character )
            if( bestTarget )
            {
                if( bestFit <= range )
                {
                    DebugXL.logD('Combat', bestTarget.Name+" in range")
                    foundTargetB = true
                    const targetV3 = bestTarget.GetPrimaryPartCFrame().p
                    const targetV3InMyPlane = new Vector3( targetV3.X, character.GetPrimaryPartCFrame().p.Y, targetV3.Z )
                    const facingTargetCF = new CFrame( character.GetPrimaryPartCFrame().p, targetV3InMyPlane )
                    character.SetPrimaryPartCFrame( facingTargetCF )
                }
            }
                            
            const humanoid = character.FindFirstChildOfClass('Humanoid')
            if( humanoid )
            {
                handle.GetChildren().forEach( (child)=>
                {
                    if( child.IsA('Trail') )
                        child.Enabled = true
                } )
                const adjCooldown = WeaponUtility.GetAdjustedCooldown( player, cooldown )
                if( attackAnimTracks[ attackIndex ] ) 
                {
                    const speed = wielderPrimaryPart!.Velocity.Magnitude
                    //warn( "Speed is "+speed )
                    if( speed > 0.5 )
                        attackUpperBodyAnimTracks[ attackIndex ].Play( 0.1, 1, 0.6/adjCooldown ) 
                    else
                        attackAnimTracks[ attackIndex ].Play( 0.1, 1, 0.6/adjCooldown )
                    
                    attackIndex = ( attackIndex + 1 ) % attackAnimTracks.size()
                    //warn( "Attack index is "+attackIndex )
                }
                else
                {
    //				//print( 'Playing slash animation' )
    //              old default Roblox way to do this when our custom animation is missing
                    const Animation = new Instance('StringValue')
                    Animation.Name = 'toolanim'
                    Animation.Value = 'Slash'
                    Animation.Parent = tool
                    Debris.AddItem(Animation, 2)
                }
                
                if( foundTargetB ) 
                {
                    delay( adjCooldown / 2, function() 
                    {
                        hitSound.PlaybackSpeed = hitSoundSpeed * MathXL.RandomNumber( 0.8, 1.2 )
                        hitSound.Volume = hitVol * MathXL.RandomNumber( 0.7, 1.3 )
                        hitSound.Play() 
                    } )
                }
                WeaponUtility.CooldownWait( player, adjCooldown )  
        
                handle.GetChildren().forEach( (child)=>
                {
                    if( child.IsA('Trail') )
                        child.Enabled = false
                } )
            }
        }
        
        
        function OnEquippedLocal(mouse: Mouse)
        {
            if( !mouse )
            {
                print('Mouse not found')
                return 
            }
            
            const character = tool.Parent as Model
            DebugXL.Assert( character !== undefined )
            if( !character ) return

            const wielderPrimaryPart = character.PrimaryPart
            DebugXL.Assert( wielderPrimaryPart !== undefined )
            if( !wielderPrimaryPart ) return

            mouse.Button1Down.Connect( ()=>{ OnButton1Down(mouse, character, wielderPrimaryPart) } )

            const humanoid = character.FindFirstChild<Humanoid>('Humanoid')
            if( humanoid )
            {
                if( windUpAnimName )
                {
                    const windUpAnim = AnimationManifestService.getAnimInstance( windUpAnimName )
                    // we don't need to save this; we play the pose once and we're done. the attack animations also segue to the pose
                    windUpAnimTrack = humanoid.LoadAnimation( windUpAnim )
                    windUpAnimTrack.Looped = false
                    windUpAnimTrack.Play()
                    wait( windUpAnimTrack.Length * 0.9 )
                    windUpAnimTrack.AdjustSpeed( 0 )
                }
                for( let i = 0; i < fullBodyAttackAnimNames.size(); i++ )
                {
                    const attackAnim = AnimationManifestService.getAnimInstance( fullBodyAttackAnimNames[i] )
                    attackAnimTracks[i] = humanoid.LoadAnimation( attackAnim )
                    attackAnimTracks[i].Looped = false
                    // just assuming you provide the upper body version. do it
                    const attackUpperBodyAnim = AnimationManifestService.getAnimInstance( upperBodyAttackAnimNames[i] )
                    attackUpperBodyAnimTracks[i] = humanoid.LoadAnimation( attackUpperBodyAnim )
                    attackUpperBodyAnimTracks[i].Looped = false 
                }
            }
        }
        
        function OnUnequippedLocal()
        {
            if( windUpAnimTrack )
                windUpAnimTrack.Stop()
        }

        tool.Equipped.Connect( OnEquippedLocal )
        tool.Unequipped.Connect( OnUnequippedLocal )
    }
}
