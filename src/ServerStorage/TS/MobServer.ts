import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.Name)

import { ServerStorage, Workspace, CollectionService, RunService } from '@rbxts/services'

import * as Monsters from 'ServerStorage/Standard/MonstersModule'

import { PlayerServer } from 'ServerStorage/TS/PlayerServer'
import { ToolCaches } from 'ServerStorage/TS/ToolCaches'

import { CharacterRecord } from 'ReplicatedStorage/TS/CharacterRecord'
import { HotbarSlot } from 'ReplicatedStorage/TS/FlexToolTS'
import { Monster } from 'ReplicatedStorage/TS/Monster'

import { GeneralWeaponUtility } from 'ReplicatedStorage/TS/GeneralWeaponUtility'
import { MeleeWeaponUtility } from 'ReplicatedStorage/TS/MeleeWeaponUtility'
import mathXL from 'ReplicatedStorage/Standard/MathXL'

type Character = Model

const mobAnimationsFolder = ServerStorage.FindFirstChild<Folder>('MobAnimations')!
DebugXL.Assert( mobAnimationsFolder!==undefined )

const mobIdleAnimations: Animation[] = mobAnimationsFolder.FindFirstChild<StringValue>('idle')!.GetChildren()
const mobWalkAnimations: Animation[] = mobAnimationsFolder.FindFirstChild<StringValue>('walk')!.GetChildren()
const mobRunAnimations: Animation[] = mobAnimationsFolder.FindFirstChild<StringValue>('run')!.GetChildren()

export namespace MobServer {
    
    let mobs: Mob[] = []

    export function spawnMob() {
        const monsterFolder = ServerStorage.FindFirstChild<Folder>('Monsters')!
        const mobTemplate = monsterFolder.FindFirstChild<Model>('Orc')!

        mobs.push(new Mob(mobTemplate))        
    }

    RunService.Stepped.Connect( (time, step)=>
    {
        mobs.forEach( (mob)=>mob.mobUpdate() )
    })

    class Mob {
        character: Character
        humanoid: Humanoid
        weaponUtility?: MeleeWeaponUtility
        currentAnimationTrack?: AnimationTrack
        currentAnimationSet?: Animation[]
    
        getCharacterRecord() {
            return PlayerServer.getCharacterRecord(PlayerServer.getCharacterKeyFromCharacterModel(this.character))
        }
    
        constructor(mobTemplate: Character) {
            this.character = mobTemplate.Clone()
    
            this.humanoid = this.character.FindFirstChild<Humanoid>('Humanoid')!
            this.character.SetPrimaryPartCFrame(new CFrame(8, 4, 0))
            const mobFolder = Workspace.FindFirstChild<Folder>('Mobs')
            if (!mobFolder)
                DebugXL.Error('No Mobs folder in Workspace')
            else
                this.character.Parent = mobFolder
    
            CollectionService.AddTag(this.character, 'CharacterTag')
    
            // what happens when we use the monster code on 'em
            let characterRecord = new Monster('Orc',
                [],
                10)
            const characterKey = PlayerServer.setCharacterRecordForMob(this.character, characterRecord)
            Monsters.Initialize(this.character, characterKey, characterRecord.getWalkSpeed(), 'Orc', 1)
            this.character.PrimaryPart!.SetNetworkOwner(undefined)  // not doesn't seem to do anything but leaving it in for voodoo
    
            ToolCaches.updateToolCache(characterKey, characterRecord)
    
            // have them draw their sword
            const weaponKey = characterRecord.getPossessionKeyFromSlot(HotbarSlot.Slot1)
            if (weaponKey) {
                const tool = CharacterRecord.getToolInstanceFromPossessionKey(this.character, weaponKey)
                if (tool) {
                    const toolBaseDataName = characterRecord.getFlexTool(weaponKey)!.baseDataS
                    this.weaponUtility = new MeleeWeaponUtility(tool, toolBaseDataName)    // do 'client' stuff
                }
            }
    
            // set up movement animation
            this.humanoid.Running.Connect((speed) => {
                if (speed < 0.1) {
                    this.playRandomAnimation(mobIdleAnimations, 0.1)
                }
                else if (speed < 8) {
                    this.playRandomAnimation(mobWalkAnimations, 0.1)
                }
                else {
                    this.playRandomAnimation(mobRunAnimations, 0.1)
                }
            })
            
        }
    
        playingAnimation() {
            return !this.humanoid.GetPlayingAnimationTracks().isEmpty()
        }
    
        playRandomAnimation(animationSet: Animation[], transitionTime: number = 0.01) {
            if( this.currentAnimationSet !== animationSet ) {
                if( this.currentAnimationTrack ) {
                    this.currentAnimationTrack.Stop(transitionTime)
                }
                const animation = animationSet[mathXL.RandomInteger(0, animationSet.size()-1)]
                this.currentAnimationTrack = this.humanoid.LoadAnimation(animation)
                this.currentAnimationTrack.Play(transitionTime)
                this.currentAnimationSet = animationSet
            }
        }
    
        stopMoving() {
            this.humanoid.Move( new Vector3(0,0,0) )
        }
    
        mobUpdate() {
            if (this.weaponUtility) {
                if (this.weaponUtility && !GeneralWeaponUtility.isEquippedBy(this.weaponUtility.tool,this.character)) {
                    this.humanoid.EquipTool(this.weaponUtility.tool)
                    this.weaponUtility.drawWeapon(this.character)                      // do server stuff
                    this.stopMoving()
                    return
                }
                else {
                    const [closestTarget, bestFit] = GeneralWeaponUtility.findClosestTarget(this.character)
                    if (closestTarget) {
                        // if enemy in range attack
                        if (bestFit <= this.weaponUtility.getRange()) {
                            // unless already attacking
                            if (!GeneralWeaponUtility.isCoolingDown(this.character)) {
                                this.stopMoving()
                                this.weaponUtility.tool.Activate()   // server side
                                spawn( ()=>{ this.weaponUtility!.showAttack(this.character) } )  // 'client' side, blocking
                                return
                            }
                            else {
                                //this.stopMoving()  // let showAttack adjust movement
                                return // follow current orders                            
                            }
                        }
                        else {
                            // if enemy in aggro range approach
                            // todo: and LOS?
                            if (bestFit <= 80) {
                                // a laggy client will keep extrapolating your movement, not sure why, even when we've told it we want to stop
                                // so to be safe we tell it to MoveTo the point we do want to stop, instead of moving all the way
                                // so destination is a little less than range minus 
    
                                const destinationVec = closestTarget.GetPrimaryPartCFrame().p.sub( this.character.GetPrimaryPartCFrame().p )
                                //const shortenedVec = destinationVec.mul( destinationVec.Magnitude - this.weaponUtility.getRange())  // why stop out of range? because it has a tendency to overshoot
                                //this.humanoid.MoveTo( this.character.GetPrimaryPartCFrame().p.add( shortenedVec ) )
                                this.humanoid.Move( destinationVec.Unit )
                                // I'm choosing to use points instead of parts out of voodoo - I worry how things might diverge on client
                                // and server if it's following a player's parts
                                return
                            }
                        }
                    }
                }
            }
            // otherwise idle
            this.stopMoving()
            if (!this.playingAnimation()) {
                this.playRandomAnimation(mobIdleAnimations)
            }
        }
    }    
}


