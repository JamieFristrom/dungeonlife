
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { ServerStorage, Workspace, CollectionService, RunService, Teams } from '@rbxts/services'

import * as Monsters from 'ServerStorage/Standard/MonstersModule'

import * as MapTileData from 'ReplicatedStorage/Standard/MapTileDataModule'

import { PlayerServer } from 'ServerStorage/TS/PlayerServer'
import { ToolCaches } from 'ServerStorage/TS/ToolCaches'

import { CharacterRecord } from 'ReplicatedStorage/TS/CharacterRecord'
import { Hero } from 'ReplicatedStorage/TS/HeroTS'
import { HotbarSlot } from 'ReplicatedStorage/TS/FlexToolTS'
import { Monster } from 'ReplicatedStorage/TS/Monster'

import { GeneralWeaponUtility } from 'ReplicatedStorage/TS/GeneralWeaponUtility'
import { MeleeWeaponUtility } from 'ReplicatedStorage/TS/MeleeWeaponUtility'

import MathXL from 'ReplicatedStorage/Standard/MathXL'
import FurnishServer from 'ServerStorage/Standard/FurnishServerModule'

import { CharacterClasses } from 'ReplicatedStorage/TS/CharacterClasses'
import { BoltWeaponUtility } from 'ReplicatedStorage/TS/BoltWeaponUtility'
import { MonsterServer } from './MonsterServer'
import { FlexibleToolsServer } from './FlexibleToolsServer'

type Character = Model

const mobAnimationsFolder = ServerStorage.FindFirstChild<Folder>('MobAnimations')!
DebugXL.Assert(mobAnimationsFolder !== undefined)
const mobFolder = Workspace.FindFirstChild<Folder>('Mobs')!
DebugXL.Assert(mobFolder !== undefined)
const mobToolCacheFolder = ServerStorage.FindFirstChild<Folder>('MobToolCache')!
DebugXL.Assert(mobToolCacheFolder !== undefined)

const mobIdleAnimations: Animation[] = mobAnimationsFolder.FindFirstChild<StringValue>('idle')!.GetChildren()
const mobWalkAnimations: Animation[] = mobAnimationsFolder.FindFirstChild<StringValue>('walk')!.GetChildren()
const mobRunAnimations: Animation[] = mobAnimationsFolder.FindFirstChild<StringValue>('run')!.GetChildren()

type Spawner = BasePart

export namespace MobServer {
    const mobCap = 15
    let mobPushApart = 10

    const monsterTeam = Teams.WaitForChild<Team>('Monsters')

    let lastSpawnTicks = new Map<Spawner, number>()

    export let mobs = new Set<Mob>()

    export function setMobPush(newMobPush: number) {
        mobPushApart = newMobPush
    }

    export function spawnMob(characterClass: string, position?: Vector3, spawner?: Spawner, curTick?: number) {
        if (spawner && curTick) {
            lastSpawnTicks.set(spawner, curTick)
        }
        mobs.add(new Mob(characterClass, position, spawner))
    }

    RunService.Stepped.Connect((time, step) => {
        // collect garbage
        lastSpawnTicks.forEach((_, spawner) => {
            if (spawner.Parent === undefined) {
                lastSpawnTicks.delete(spawner)
            }
        })

        mobs.forEach((mob) => {
            if (mob.character.Parent === undefined) {
                mobs.delete(mob)
            }
        })

        // dispose of bodies and act
        mobs.forEach((mob) => {
            if (mob.humanoid.Health <= 0) {
                Monsters.Died( mob.character )
                delay(2, () => {
                    mob.character.Parent = undefined
                })
            }
            else {
                mob.mobUpdate()
            }
        })
    })

    export function spawnMobs(curTick: number) {
        DebugXL.logV('Mobs', 'MobServer.spawnMobs()')
        if (mobs.size() < mobCap) {
            DebugXL.logV('Mobs', 'below cap')
            const monsterSpawns = FurnishServer.GetMonsterSpawners()
            if (!monsterSpawns.isEmpty()) {
                DebugXL.logD('Mobs', 'Spawners available')
                // for now mobs will not be bosses or superbosses
                const minionSpawners = monsterSpawns.filter((spawner) =>
                    spawner.FindFirstChild<BoolValue>('OneUse')!.Value === false)
                if (!minionSpawners.isEmpty()) {
                    DebugXL.logV('Mobs', 'Minion spawners available')
                    const distantSpawners = minionSpawners.filter((spawner) =>
                        Hero.distanceToNearestHeroXZ(spawner.Position) > MapTileData.tileWidthN * 2.5)
                    const acceptableSpawners = distantSpawners.isEmpty() ? minionSpawners : distantSpawners
                    const desiredSpawn = acceptableSpawners[MathXL.RandomInteger(0, acceptableSpawners.size() - 1)]
                    const characterClass = desiredSpawn.FindFirstChild<StringValue>('CharacterClass')!.Value
                    spawnMob(characterClass, undefined, desiredSpawn, curTick)
                }
            }
        }
    }

    export function spawnerCheckForSpawn(spawner: Spawner, curTick: number) {
        if (spawner.FindFirstChild<BoolValue>('OneUse')!.Value) {
            // boss spawner; only use if no monster players
            if (monsterTeam.GetPlayers().size() === 0) {
                if (!lastSpawnTicks.get(spawner)) {
                    spawnMob(spawner.FindFirstChild<StringValue>('CharacterClass')!.Value,
                        undefined,
                        spawner,
                        curTick)
                    lastSpawnTicks.set(spawner, curTick)
                }
            }
        }
        else {
            const lastSpawnTick = lastSpawnTicks.get(spawner)
            if (!lastSpawnTick || (lastSpawnTick < curTick - 5)) {
                // have we already spawned enough for now?
                const myMobs = mobs.values().filter((mob) => mob.spawnPart === spawner)
                if (myMobs.size() < 4) {
                    spawnMob(spawner.FindFirstChild<StringValue>('CharacterClass')!.Value,
                        undefined,
                        spawner,
                        curTick)
                }
            }
        }
    }

    export function spawnersSpawnMobs(curTick: number) {
        if (mobs.size() < mobCap) {
            const monsterSpawns = FurnishServer.GetMonsterSpawners()
            monsterSpawns.forEach((spawner) => {
                spawnerCheckForSpawn(spawner, curTick)
            })
        }
    }

    class Mob {
        character: Character
        humanoid: Humanoid
        weaponUtility?: MeleeWeaponUtility | BoltWeaponUtility
        currentAnimationTrack?: AnimationTrack
        currentAnimationSet?: Animation[]
        spawnPart?: Spawner

        getCharacterRecord() {
            return PlayerServer.getCharacterRecord(PlayerServer.getCharacterKeyFromCharacterModel(this.character))
        }

        constructor(characterClass: string, position?: Vector3, spawnPart?: Spawner) {
            const monsterFolder = ServerStorage.FindFirstChild<Folder>('Monsters')!
            const prototypeObj = CharacterClasses.monsterStats[characterClass].prototypeObj
            const modelName = prototypeObj ? prototypeObj : characterClass  // mobs have fallback prototypes in cases where the monster would use an avatar
            const mobTemplate = monsterFolder.FindFirstChild<Model>(modelName)!
            if (!mobTemplate) {
                DebugXL.logW('Mobs', 'No model for ' + modelName)
            }
            this.character = mobTemplate.Clone()
            this.humanoid = this.character.FindFirstChild<Humanoid>('Humanoid')!
            this.spawnPart = spawnPart

            // position mob
            let spawnPosition: Vector3 = new Vector3(8, 0, 0)
            if (spawnPart) {
                // doesn't support rotated spawns yet
                const minX = spawnPart.Position.X - spawnPart.Size.X / 2
                const maxX = spawnPart.Position.X + spawnPart.Size.X / 2
                const minZ = spawnPart.Position.Z - spawnPart.Size.Z / 2
                const maxZ = spawnPart.Position.Z + spawnPart.Size.Z / 2
                const myX = MathXL.RandomNumber(minX, maxX)
                const myZ = MathXL.RandomNumber(minZ, maxZ)
                spawnPosition = new Vector3(myX, 0, myZ)
            }
            else if (position) {
                spawnPosition = position
            }
            const adjustedSpawnPosition = spawnPosition.add(new Vector3(0, 6, 0))
            this.character.SetPrimaryPartCFrame(new CFrame(adjustedSpawnPosition))

            this.character.Parent = mobFolder

            CollectionService.AddTag(this.character, 'CharacterTag')

            // what happens when we use the monster code on 'em
            const mobLevel = MonsterServer.determineMobSpawnLevel(mobCap)
            let characterRecord = new Monster(characterClass,
                [],
                mobLevel)
            const characterKey = PlayerServer.setCharacterRecordForMob(this.character, characterRecord)
            Monsters.Initialize(this.character, characterKey, characterRecord.getWalkSpeed(), characterClass, true)
            this.character.PrimaryPart!.SetNetworkOwner(undefined)  // not doesn't seem to do anything but leaving it in for voodoo

            ToolCaches.updateToolCache(characterKey, characterRecord)

            // prepare a weapon
            for (let i = 0; i < HotbarSlot.Max; i++) {
                const possessionKey = characterRecord.getPossessionKeyFromSlot(i)
                if (possessionKey) {
                    const tool = CharacterRecord.getToolInstanceFromPossessionKey(this.character, characterRecord, possessionKey)
                    if (!tool) {
                        DebugXL.logW("Items", "Couldn't find tool for " + this.character.Name + " weaponKey: " + possessionKey)
                    }
                    else {
                        // check to make sure nobody else arl
                        const flexTool = characterRecord.getFlexTool(possessionKey)
                        DebugXL.Assert(flexTool !== undefined)
                        if (flexTool) {
                            FlexibleToolsServer.setFlexToolInst(tool, { flexToolInst: flexTool, character: this.character, possessionsKey: possessionKey })
                            if (tool.FindFirstChild<Script>("MeleeClientScript")) {
                                this.weaponUtility = new MeleeWeaponUtility(tool, flexTool)    // do 'client' stuff
                                break
                            }
                            else if (tool.FindFirstChild<Script>('BoltClient')) {
                                this.weaponUtility = new BoltWeaponUtility(tool, flexTool)
                                break
                            }
                            else {
                                DebugXL.logW('Items', 'Weapon ' + tool.GetFullName() + ' not supported yet')
                            }
                        }
                    }
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
            if (this.currentAnimationSet !== animationSet) {
                if (this.currentAnimationTrack) {
                    this.currentAnimationTrack.Stop(transitionTime)
                }
                const animation = animationSet[MathXL.RandomInteger(0, animationSet.size() - 1)]
                this.currentAnimationTrack = this.humanoid.LoadAnimation(animation)
                this.currentAnimationTrack.Play(transitionTime)
                this.currentAnimationSet = animationSet
            }
        }

        stopMoving() {
            this.humanoid.Move(new Vector3(0, 0, 0))
        }

        mobUpdate() {
            if (this.weaponUtility) {
                DebugXL.Assert(this.weaponUtility.tool.Parent === undefined || this.weaponUtility.tool.Parent === this.character)
                if (this.weaponUtility && !GeneralWeaponUtility.isEquippedBy(this.weaponUtility.tool, this.character)) {
                    DebugXL.Assert(this.weaponUtility.tool.Parent === undefined)
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
                                this.weaponUtility.mobActivate(closestTarget)
                                spawn(() => { this.weaponUtility!.showAttack(this.character, closestTarget) })  // 'client' side, blocking
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
                            if (bestFit <= 60) {
                                // a laggy client will keep extrapolating your movement, not sure why, even when we've told it we want to stop
                                // so to be safe we tell it to MoveTo the point we do want to stop, instead of moving all the way
                                // so destination is a little less than range minus 

                                // the antimagnet trick: poll your friends and push away from them
                                // the antimagnet trick is O(n^2) wipth sqrts so I'm a bit leery
                                const zeroVec = new Vector3(0, 0, 0)
                                const myPos = this.character.GetPrimaryPartCFrame().p
                                const mobs: Character[] = mobFolder.GetChildren()
                                const pushForces = mobs.map((mob) => myPos.sub(mob.GetPrimaryPartCFrame().p))
                                const scaledForces = pushForces.map((pushForce) => pushForce.Magnitude > 0.001 ? pushForce.Unit.div(pushForce.Magnitude) : zeroVec)
                                const totalPush = scaledForces.reduce((forceA, forceB) => forceA.add(forceB))

                                const destinationVec = closestTarget.GetPrimaryPartCFrame().p.sub(this.character.GetPrimaryPartCFrame().p)
                                const totalVec = totalPush.mul(mobPushApart).add(destinationVec)
                                //const shortenedVec = destinationVec.mul( destinationVec.Magnitude - this.weaponUtility.getRange())  // why stop out of range? because it has a tendency to overshoot
                                //this.humanoid.MoveTo( this.character.GetPrimaryPartCFrame().p.add( shortenedVec ) )
                                this.humanoid.Move(totalVec.Unit)
                                this.humanoid.WalkSpeed = totalVec.Magnitude > 16 ? 16 : totalVec.Magnitude
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


