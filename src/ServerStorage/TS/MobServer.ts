
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { ServerStorage, Workspace, CollectionService, RunService, Teams, PhysicsService } from '@rbxts/services'

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
import { RangedWeaponUtility } from 'ReplicatedStorage/TS/RangedWeaponUtility'
import { MonsterServer } from './MonsterServer'
import { FlexibleToolsServer } from './FlexibleToolsServer'
import { BaseWeaponUtility } from 'ReplicatedStorage/TS/BaseWeaponUtility'

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


class Attackable {
    lastAttacker?: Character
    lastSpottedEnemyPosition?: Vector3
    constructor( 
        public model: Model, 
        public humanoid: Humanoid ) {
    }

    protected _updateLastAttacker() {
    }

    updateLastAttacker() {
        const lastAttackerObject = this.humanoid.FindFirstChild<ObjectValue>("LastAttacker")
        if (lastAttackerObject) {
            if (!lastAttackerObject.Value) {
                DebugXL.logE("Spawner", this.model.Name + " has invalid lastAttackerObject")
                return
            }
            if (!lastAttackerObject.Value.IsA("Model")) {
                DebugXL.logE("Spawner", this.model.Name + " has lastAttacker " + lastAttackerObject.Value.GetFullName() + " that is not a model")
                return
            }
            if (lastAttackerObject.Value !== this.lastAttacker) {
                this.lastAttacker = lastAttackerObject.Value as Character
                this.lastSpottedEnemyPosition = this.lastAttacker.GetPrimaryPartCFrame().p
                this._updateLastAttacker()
            }
        }
    }
}
class Spawner extends Attackable {
    lastAttacker?: Character
    lastSpottedEnemyPosition?: Vector3
    lastSpawnTick: number = 0

    constructor(model: Model, humanoid: Humanoid, curTick: number) {
        super(model, humanoid)
        this.lastSpawnTick = curTick
    }
}

type SpawnPart = BasePart

export namespace MobServer {
    const mobCap = 15
    const mobSpawnPeriod = 10
    let mobPushApart = 10


    const monsterTeam = Teams.WaitForChild<Team>('Monsters')

    let spawnersMap = new Map<SpawnPart, Spawner>()

    export let mobs = new Set<Mob>()

    export function setMobPush(newMobPush: number) {
        mobPushApart = newMobPush
    }

    export function createSpawnerForSpawnPart( spawnPart: BasePart, curTick: number ) {
        const mySpawnerModel = spawnPart.Parent
        DebugXL.Assert( mySpawnerModel !== undefined)
        if( mySpawnerModel ) {
            DebugXL.Assert( mySpawnerModel.IsA("Model"))                
            if( mySpawnerModel.IsA("Model")) {
                let myHumanoid = mySpawnerModel.FindFirstChild<Humanoid>("Humanoid")
                DebugXL.Assert( myHumanoid!==undefined )
                if( myHumanoid ) {
                    const mySpawner = new Spawner(mySpawnerModel, myHumanoid, curTick)
                    spawnersMap.set(spawnPart, mySpawner)
                }
            }
        }
    }

    export function spawnMob(characterClass: string, position?: Vector3, spawnPart?: SpawnPart, curTick?: number) {
        if (spawnPart && curTick) {
            let mySpawner = spawnersMap.get(spawnPart)
            if (!mySpawner) {
                createSpawnerForSpawnPart( spawnPart, curTick )
            }
            else {
                mySpawner.lastSpawnTick = curTick
            }
        }

        const monsterFolder = ServerStorage.FindFirstChild<Folder>('Monsters')!
        const prototypeObj = CharacterClasses.monsterStats[characterClass].prototypeObj
        const modelName = prototypeObj ? prototypeObj : characterClass  // mobs have fallback prototypes in cases where the monster would use an avatar
        const mobTemplate = monsterFolder.FindFirstChild<Model>(modelName)
        if (!mobTemplate) {
            DebugXL.logW('Mobs', 'No model for ' + modelName)
        }
        else {
            const mobModel = mobTemplate.Clone()
            const humanoid = mobModel.FindFirstChild<Humanoid>('Humanoid')
            DebugXL.Assert( humanoid !== undefined )      
            if( humanoid ) {
                mobs.add(new Mob(mobModel, humanoid, characterClass, position, spawnPart))
            }
        }
    }

    RunService.Stepped.Connect((time, step) => {
        // collect garbage
        spawnersMap.forEach((_, spawnPart) => {
            if (spawnPart.Parent === undefined) {
                if (mobs.values().filter((mob) => mob.spawnPart === spawnPart).isEmpty())
                    spawnersMap.delete(spawnPart)
            }
        })

        // dispose of bodies and act
        mobs.forEach((mob) => {
            if (mob.humanoid.Health <= 0 || mob.model.Parent === undefined) {
                mob.updateLastAttacker()  // because it passes through to the team
                mobs.delete(mob)
                Monsters.Died(mob.model)
                delay(2, () => {
                    mob.model.Parent = undefined
                })
            }
            else {
                mob.mobUpdate()
            }
        })
    })

    export function clearMobs() {
        mobs.clear()
        mobFolder.GetChildren().forEach((mobModel) => mobModel.Parent = undefined)
    }

    export function spawnMobs(curTick: number) {
        DebugXL.logV('Mobs', 'MobServer.spawnMobs()')
        if (mobs.size() < mobCap) {
            DebugXL.logV('Mobs', 'below cap')
            const monsterSpawnParts = FurnishServer.GetMonsterSpawners()
            if (!monsterSpawnParts.isEmpty()) {
                DebugXL.logD('Mobs', 'Spawners available')
                // for now mobs will not be bosses or superbosses
                const minionSpawners = monsterSpawnParts.filter((spawnPart) =>
                    spawnPart.FindFirstChild<BoolValue>('OneUse')!.Value === false)
                if (!minionSpawners.isEmpty()) {
                    DebugXL.logV('Mobs', 'Minion spawners available')
                    const distantSpawners = minionSpawners.filter((spawnPart) =>
                        Hero.distanceToNearestHeroXZ(spawnPart.Position) > MapTileData.tileWidthN * 2.5)
                    const acceptableSpawners = distantSpawners.isEmpty() ? minionSpawners : distantSpawners
                    const desiredSpawn = acceptableSpawners[MathXL.RandomInteger(0, acceptableSpawners.size() - 1)]
                    const characterClass = desiredSpawn.FindFirstChild<StringValue>('CharacterClass')!.Value
                    spawnMob(characterClass, undefined, desiredSpawn, curTick)
                }
            }
        }
    }

    export function spawnerCheckForSpawn(spawnPart: SpawnPart, curTick: number) {
        if (spawnPart.FindFirstChild<BoolValue>('OneUse')!.Value) {
            // boss spawnPart; only use if no monster players
            if (monsterTeam.GetPlayers().size() === 0) {
                if (!spawnersMap.get(spawnPart)) {
                    spawnMob(spawnPart.FindFirstChild<StringValue>('CharacterClass')!.Value,
                        undefined,
                        spawnPart,
                        curTick)
                    createSpawnerForSpawnPart(spawnPart, curTick)                        
                }
            }
        }
        else {
            const spawner = spawnersMap.get(spawnPart)
            if (!spawner || (spawner.lastSpawnTick < curTick - mobSpawnPeriod)) {
                // have we already spawned enough for now?
                const myMobs = mobs.values().filter((mob) => mob.spawnPart === spawnPart)
                if (myMobs.size() < 4) {
                    spawnMob(spawnPart.FindFirstChild<StringValue>('CharacterClass')!.Value,
                        undefined,
                        spawnPart,
                        curTick)
                }
            }
        }
    }

    export function spawnersUpdate(curTick: number) {
        if (mobs.size() < mobCap) {
            const monsterSpawns = FurnishServer.GetMonsterSpawners()
            monsterSpawns.forEach((spawnPart) => {
                spawnerCheckForSpawn(spawnPart, curTick)
            })
        }
        spawnersUpdateLastAttacker()
    }

    export function spawnersUpdateLastAttacker() {
        for( let spawner of spawnersMap.values() ) {
            spawner.updateLastAttacker()
        }
    }

    class Mob extends Attackable {
        weaponUtility?: BaseWeaponUtility
        currentAnimationTrack?: AnimationTrack
        currentAnimationSet?: Animation[]
        spawnPart?: SpawnPart
        lastSpottedEnemyPosition?: Vector3
        lastAttacker?: Character

        getCharacterRecord() {
            return PlayerServer.getCharacterRecord(PlayerServer.getCharacterKeyFromCharacterModel(this.model))
        }

        findSpawnPos(spawnCenter: Vector3, spawnSize: Vector3, exclusionCenter: Vector3, exclusionRadius: number) {
            const minX = spawnCenter.X - spawnSize.X / 2
            const maxX = spawnCenter.X + spawnSize.X / 2
            const minZ = spawnCenter.Z - spawnSize.Z / 2
            const maxZ = spawnCenter.Z + spawnSize.Z / 2
            const exclusionRadiusSquared = exclusionRadius * exclusionRadius
            for (let i = 0; i < 100; i++) {
                const myX = MathXL.RandomNumber(minX, maxX)
                const myZ = MathXL.RandomNumber(minZ, maxZ)
                const deltaX = myX - exclusionCenter.X
                const deltaZ = myZ - exclusionCenter.Z
                if (deltaX * deltaX + deltaZ * deltaZ > exclusionRadiusSquared) {
                    return new Vector3(myX, 0, myZ)
                }
            }
            // spawn on corner to be safe
            DebugXL.logW("Mob", "Unable to find spawn point in 100 tries")
            return new Vector3(maxX, 0, maxZ)
        }

        constructor(model: Model, humanoid: Humanoid, characterClass: string, position?: Vector3, spawnPart?: SpawnPart) {
            super(model, humanoid)
            this.spawnPart = spawnPart

            // position mob
            let spawnPosition: Vector3 = new Vector3(8, 0, 0)
            if (spawnPart) {
                const exclusionPart = spawnPart.Parent!.FindFirstChild<Part>("MobExclusion")
                const exclusionPosition = exclusionPart ? exclusionPart.Position : spawnPosition
                const exclusionRadius = exclusionPart ? exclusionPart.Size.Z : 0
                spawnPosition = this.findSpawnPos(spawnPart.Position, spawnPart.Size, exclusionPosition, exclusionRadius)
            }
            else if (position) {
                spawnPosition = position
            }
            const adjustedSpawnPosition = spawnPosition.add(new Vector3(0, 6, 0))
            this.model.SetPrimaryPartCFrame(new CFrame(adjustedSpawnPosition))
            const mobChildren = this.model.GetDescendants()

            this.model.Parent = mobFolder

            CollectionService.AddTag(this.model, 'CharacterTag')

            // what happens when we use the monster code on 'em
            const mobLevel = MonsterServer.determineMobSpawnLevel(mobCap)
            let characterRecord = new Monster(characterClass,
                [],
                mobLevel)
            const characterKey = PlayerServer.setCharacterRecordForMob(this.model, characterRecord)
            Monsters.Initialize(this.model, characterKey, characterRecord.getWalkSpeed(), characterClass, true)
            this.model.PrimaryPart!.SetNetworkOwner(undefined)  // not doesn't seem to do anything but leaving it in for voodoo

            if (!CharacterClasses.monsterStats[characterClass].ghostifyB) {
                // doing this before they draw their weapon so I think it's ok
                mobChildren.forEach((child) => {
                    if (child.IsA("BasePart")) {
                        PhysicsService.SetPartCollisionGroup(child, "Mob")
                    }
                })
            }


            ToolCaches.updateToolCache(characterKey, characterRecord)

            // prepare a weapon
            for (let i = 0; i < HotbarSlot.Max; i++) {
                const possessionKey = characterRecord.getPossessionKeyFromSlot(i)
                if (possessionKey) {
                    const tool = CharacterRecord.getToolInstanceFromPossessionKey(this.model, characterRecord, possessionKey)
                    if (!tool) {
                        DebugXL.logW("Items", "Couldn't find tool for " + this.model.Name + " weaponKey: " + possessionKey)
                    }
                    else {
                        // check to make sure nobody else arl
                        const flexTool = characterRecord.getFlexTool(possessionKey)
                        DebugXL.Assert(flexTool !== undefined)
                        if (flexTool) {
                            FlexibleToolsServer.setFlexToolInst(tool, { flexToolInst: flexTool, character: this.model, possessionsKey: possessionKey })
                            if (tool.FindFirstChild<Script>("MeleeClientScript")) {
                                this.weaponUtility = new MeleeWeaponUtility(tool, flexTool)    // do 'client' stuff
                                break
                            }
                            else if (tool.FindFirstChild<Script>('BoltClient')) {
                                this.weaponUtility = new RangedWeaponUtility(tool, flexTool, "DisplayBolt")
                                break
                            }
                            else if (tool.FindFirstChild<Script>('ThrownWeaponClientScript')) {
                                this.weaponUtility = new RangedWeaponUtility(tool, flexTool, "Handle")
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

        getLastSpottedEnemyPosition() {
            if (this.lastSpottedEnemyPosition) {
                return this.lastSpottedEnemyPosition
            }
            else {
                // has my crew spotted an enemy?
                for (let mob of mobs.values()) {
                    if (mob.spawnPart === this.spawnPart && mob.lastSpottedEnemyPosition) {
                        return mob.lastSpottedEnemyPosition
                    }
                }
                // did a dead crew member spot an enemy or get hit?
                if (this.spawnPart) {
                    const spawner = spawnersMap.get(this.spawnPart)
                    DebugXL.Assert(spawner !== undefined)
                    if (spawner) {
                        return spawner.lastSpottedEnemyPosition
                    }
                }
            }
        }

        protected _updateLastAttacker() {
            if (this.spawnPart) {
                const spawner = spawnersMap.get(this.spawnPart)
                DebugXL.Assert(spawner !== undefined)
                if (spawner) {
                    spawner.lastSpottedEnemyPosition = this.lastSpottedEnemyPosition
                }
            }
        }

        mobUpdate() {
            this.updateLastAttacker()
            if (this.weaponUtility) {
                DebugXL.Assert(this.weaponUtility.tool.Parent === undefined || this.weaponUtility.tool.Parent === this.model)
                if (this.weaponUtility && !GeneralWeaponUtility.isEquippedBy(this.weaponUtility.tool, this.model)) {
                    DebugXL.Assert(this.weaponUtility.tool.Parent === undefined)
                    this.humanoid.EquipTool(this.weaponUtility.tool)
                    this.weaponUtility.drawWeapon(this.model)                      // do server stuff
                    this.stopMoving()
                    return
                }
                else {
                    const [closestTarget, bestFit] = GeneralWeaponUtility.findClosestVisibleTarget(this.model, 80)
                    if (closestTarget) {
                        // if enemy in aggro range approach that spot (even if they go out of sight)
                        this.lastSpottedEnemyPosition = closestTarget.GetPrimaryPartCFrame().p
                        // if enemy in range attack
                        if (bestFit <= this.weaponUtility.getRange()) {
                            // unless already attacking
                            if (!GeneralWeaponUtility.isCoolingDown(this.model)) {
                                this.stopMoving()
                                this.weaponUtility.mobActivate(closestTarget)
                                spawn(() => { this.weaponUtility!.showAttack(this.model, closestTarget) })  // 'client' side, blocking
                                return
                            }
                            else {
                                return // follow current orders                            
                            }
                        }
                    }
                    const lastSpottedEnemyPosition = this.getLastSpottedEnemyPosition()
                    if (lastSpottedEnemyPosition) {
                        // a laggy client will keep extrapolating your movement, not sure why, even when we've told it we want to stop
                        // so to be safe we tell it to MoveTo the point we do want to stop, instead of moving all the way
                        // so destination is a little less than range minus 

                        // the antimagnet trick: poll your friends and push away from them
                        // the antimagnet trick is O(n^2) with sqrts so I'm a bit leery
                        const zeroVec = new Vector3(0, 0, 0)
                        const myPos = this.model.GetPrimaryPartCFrame().p
                        const mobs: Character[] = mobFolder.GetChildren()
                        const pushForces = mobs.map((mob) => myPos.sub(mob.GetPrimaryPartCFrame().p))
                        const scaledForces = pushForces.map((pushForce) => pushForce.Magnitude > 0.001 ? pushForce.Unit.div(pushForce.Magnitude) : zeroVec)
                        const totalPush = scaledForces.reduce((forceA, forceB) => forceA.add(forceB))

                        const destinationVec = lastSpottedEnemyPosition.sub(this.model.GetPrimaryPartCFrame().p)
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
            // otherwise idle
            this.stopMoving()
            if (!this.playingAnimation()) {
                this.playRandomAnimation(mobIdleAnimations)
            }
        }
    }
}


