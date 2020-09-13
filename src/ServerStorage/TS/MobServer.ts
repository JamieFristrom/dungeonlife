
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { ServerStorage, Workspace, CollectionService, RunService, Teams, PhysicsService } from '@rbxts/services'

import * as Monsters from 'ServerStorage/Standard/MonstersModule'

import { PlayerServer, PlayerTracker } from 'ServerStorage/TS/PlayerServer'
import { ToolCaches } from 'ServerStorage/TS/ToolCaches'

import { CharacterRecord, CharacterRecordNull } from 'ReplicatedStorage/TS/CharacterRecord'
import { HotbarSlot } from 'ReplicatedStorage/TS/FlexToolTS'
import { Monster } from 'ReplicatedStorage/TS/Monster'

import { GeneralWeaponUtility } from 'ReplicatedStorage/TS/GeneralWeaponUtility'
import { MeleeWeaponUtility } from 'ReplicatedStorage/TS/MeleeWeaponUtility'

import MathXL from 'ReplicatedStorage/Standard/MathXL'
import FurnishServer from 'ServerStorage/Standard/FurnishServerModule'

import { CharacterClass, CharacterClasses } from 'ReplicatedStorage/TS/CharacterClasses'
import { RangedWeaponUtility } from 'ReplicatedStorage/TS/RangedWeaponUtility'
import { MonsterServer } from './MonsterServer'
import { FlexibleToolsServer } from './FlexibleToolsServer'
import { BaseWeaponUtility } from 'ReplicatedStorage/TS/BaseWeaponUtility'
import { HeroServer } from './HeroServer'
import { ModelUtility } from 'ReplicatedStorage/TS/ModelUtility'
import { SuperbossManager } from './SuperbossManager'
import { GameServer } from './GameServer'
import { MainContext } from './MainContext'
import { ServerContextI } from './ServerContext'

type Character = Model

const mobAnimationsFolder = (ServerStorage.FindFirstChild('MobAnimations') as Folder|undefined)!
DebugXL.Assert(mobAnimationsFolder !== undefined)
const mobFolder = (Workspace.FindFirstChild('Mobs') as Folder|undefined)!
DebugXL.Assert(mobFolder !== undefined)
const mobToolCacheFolder = (ServerStorage.FindFirstChild('MobToolCache') as Folder|undefined)!
DebugXL.Assert(mobToolCacheFolder !== undefined)

const mobIdleAnimations: Animation[] = (mobAnimationsFolder.FindFirstChild('idle') as StringValue|undefined)!.GetChildren()
const mobWalkAnimations: Animation[] = (mobAnimationsFolder.FindFirstChild('walk') as StringValue|undefined)!.GetChildren()
const mobRunAnimations: Animation[] = (mobAnimationsFolder.FindFirstChild('run') as StringValue|undefined)!.GetChildren()


class Attackable {
    lastAttacker?: Character
    lastSpottedEnemyPosition?: Vector3
    constructor(
        public model: Model,
        public humanoid: Humanoid) {
    }

    protected _updateLastAttacker() {
    }

    updateLastAttacker() {
        const lastAttackerObject = (this.humanoid.FindFirstChild("LastAttacker") as ObjectValue|undefined)
        if (lastAttackerObject) {
            if (!lastAttackerObject.Value) {
                DebugXL.logE(LogArea.Spawner, this.model.Name + " has invalid lastAttackerObject")
                return
            }
            if (!lastAttackerObject.Value.IsA("Model")) {
                DebugXL.logE(LogArea.Spawner, this.model.Name + " has lastAttacker " + lastAttackerObject.Value.GetFullName() + " that is not a model")
                return
            }
            if (lastAttackerObject.Value !== this.lastAttacker) {
                this.lastAttacker = lastAttackerObject.Value as Character
                this.lastSpottedEnemyPosition = ModelUtility.getPrimaryPartCFrameSafe(this.lastAttacker).Position
                this._updateLastAttacker()
            }
        }
    }

}
class Spawner {
    attackable?: Attackable
    lastSpawnTick: number = 0

    constructor(model: Model, humanoid?: Humanoid) {
        if (humanoid) {
            this.attackable = new Attackable(model, humanoid)
        }
    }

    updateLastAttacker() {
        if (this.attackable) {
            this.attackable.updateLastAttacker()
        }
    }

    getLastSpottedEnemyPosition() {
        return this.attackable ? this.attackable.lastSpottedEnemyPosition : undefined
    }

    setLastSpottedEnemyPosition(enemyPos: Vector3) {
        if (this.attackable) {
            this.attackable.lastSpottedEnemyPosition = enemyPos
        }
    }
}

type SpawnPart = BasePart

export namespace MobServer {
    const mobGlobalCap = 40
    const mobSpawnerCap = 5
    const mobSpawnPeriod = 10
    let mobPushApart = 10


    const monsterTeam = (Teams.WaitForChild('Monsters') as Team)

    let spawnersMap = new Map<SpawnPart, Spawner>()

    export let mobs = new Set<Mob>()

    export function setMobPush(newMobPush: number) {
        mobPushApart = newMobPush
    }

    export function createSpawnerForSpawnPart(spawnPart: BasePart, curTick: number) {
        const mySpawnerModel = spawnPart.Parent
        DebugXL.Assert(mySpawnerModel !== undefined)
        if (mySpawnerModel) {
            DebugXL.Assert(mySpawnerModel.IsA("Model"))
            if (mySpawnerModel.IsA("Model")) {
                let myHumanoid = (mySpawnerModel.FindFirstChild("Humanoid") as Humanoid|undefined)
                const mySpawner = new Spawner(mySpawnerModel, myHumanoid)
                spawnersMap.set(spawnPart, mySpawner)
            }
        }
    }

    export function spawnMob(
        context: ServerContextI,
        characterClass: CharacterClass,
        superbossManager: SuperbossManager,
        currentLevelSession: number,
        position?: Vector3,
        spawnPart?: SpawnPart,
        curTick?: number) {

        if (spawnPart && curTick) {
            let mySpawner = spawnersMap.get(spawnPart)
            if (!mySpawner) {
                createSpawnerForSpawnPart(spawnPart, curTick)
            }
            else {
                mySpawner.lastSpawnTick = curTick
            }
        }

        const monsterFolder = (ServerStorage.FindFirstChild('Monsters') as Folder|undefined)!
        const prototypeObj = CharacterClasses.monsterStats[characterClass].prototypeObj
        const modelName = prototypeObj ? prototypeObj : characterClass  // mobs have fallback prototypes in cases where the monster would use an avatar
        const mobTemplate = (monsterFolder.FindFirstChild(modelName) as Model|undefined)
        if (!mobTemplate) {
            DebugXL.logW(LogArea.Mobs, 'No model for ' + modelName)
        }
        else {
            const mobModel = mobTemplate.Clone()
            const humanoid = (mobModel.FindFirstChild('Humanoid') as Humanoid|undefined)
            DebugXL.Assert(humanoid !== undefined)
            if (humanoid) {
                mobs.add(new Mob(context, mobModel, humanoid, characterClass, superbossManager, currentLevelSession, position, spawnPart))
                return mobModel
            }
        }
        // null model
        return new Instance("Model")
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
                Monsters.Died(MainContext.get(), mob.model, mob.getCharacterRecord())
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

    export function spawnerCheckForSpawn(spawnPart: SpawnPart, curTick: number) {
        if ((spawnPart.FindFirstChild('OneUse') as BoolValue|undefined)!.Value) {
            // boss spawnPart; only use if no monster players
            if (monsterTeam.GetPlayers().size() === 0) {
                const spawner = spawnersMap.get(spawnPart)
                if (!spawnersMap.get(spawnPart)) {
                    DebugXL.logI(LogArea.MobSpawn, "Spawning one use spawner " + spawnPart.GetFullName())
                    const charClassStr = (spawnPart.FindFirstChild('CharacterClass') as StringValue|undefined)!.Value as CharacterClass
                    spawnMob(
                        MainContext.get(),
                        charClassStr,
                        GameServer.getSuperbossManager(),
                        GameServer.levelSession,
                        undefined,
                        spawnPart,
                        curTick)
                    createSpawnerForSpawnPart(spawnPart, curTick)
                }
            }
        }
        else {
            const spawner = spawnersMap.get(spawnPart)
            if (!spawner || spawner.lastSpawnTick < curTick - mobSpawnPeriod) {
                // have we already spawned enough for now?
                const myMobs = mobs.values().filter((mob) => mob.spawnPart === spawnPart)
                if (myMobs.size() < mobSpawnerCap) {
                    DebugXL.logD(LogArea.MobSpawn, "Sufficient time has passed to spawn from " + spawnPart.GetFullName())
                    spawnMob(
                        MainContext.get(),
                        (spawnPart.FindFirstChild('CharacterClass') as StringValue|undefined)!.Value as CharacterClass,
                        GameServer.getSuperbossManager(),
                        GameServer.levelSession,
                        undefined,
                        spawnPart,
                        curTick)
                }
            }
        }
    }

    let lastSpawnersUpdateTick = 0
    export function spawnersUpdate(curTick: number) {
        if (curTick > lastSpawnersUpdateTick + 0.5) {
            DebugXL.logV(LogArea.MobSpawn, "Updating spawners")
            if (PlayerServer.getHeroRecords().size() >= 1) {
                if (mobs.size() < mobGlobalCap) {
                    DebugXL.logV(LogArea.MobSpawn, "Fewer than cap")
                    const monsterSpawns = FurnishServer.GetMonsterSpawners()
                    monsterSpawns.forEach((spawnPart) => {
                        spawnerCheckForSpawn(spawnPart, curTick)
                    })
                }
            }
            else {
                DebugXL.logD(LogArea.MobSpawn, "No heroes detected")
            }
            lastSpawnersUpdateTick = curTick
        }
        spawnersUpdateLastAttacker()
    }

    export function spawnersUpdateLastAttacker() {
        for (let spawner of spawnersMap.values()) {
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
        context: ServerContextI

        getCharacterRecord() {
            // having the playerTracker seems weird even though it doesn't 'duplicate data', maybe this is an appropriate time to just store the character record
            // (still not a duplication since it would index same class)
            let characterRecord = this.context.getPlayerTracker().getCharacterRecordFromCharacter(this.model)
            if (!characterRecord) {
                characterRecord = new CharacterRecordNull()
            }
            return characterRecord
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
            DebugXL.logW(LogArea.MobSpawn, "Unable to find spawn point in 100 tries")
            return new Vector3(maxX, 0, maxZ)
        }

        constructor(
            context: ServerContextI,
            model: Model,
            humanoid: Humanoid,
            characterClass: CharacterClass,
            superbossManager: SuperbossManager,
            currentLevelSession: number,
            position?: Vector3,
            spawnPart?: SpawnPart) {

            super(model, humanoid)
            this.context = context
            this.spawnPart = spawnPart

            // position mob
            let spawnPosition: Vector3 = new Vector3(8, 0, 0)
            if (spawnPart) {
                const exclusionPart = (spawnPart.Parent!.FindFirstChild("MobExclusion") as Part|undefined)
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
            const monsterDatum = CharacterClasses.monsterStats[characterClass]

            const numHeroes = HeroServer.getNumHeroes()
            const mobLevel = (monsterDatum.tagsT.Superboss || monsterDatum.tagsT.Boss) ?
                MonsterServer.determineBossSpawnLevel(monsterDatum) :
                MonsterServer.determineMobSpawnLevel(mobSpawnerCap * (numHeroes + 3) / 2)

            let characterRecord = new Monster(characterClass,
                [],
                mobLevel)
            const characterKey = this.context.getPlayerTracker().setCharacterRecordForMob(this.model, characterRecord)
            Monsters.Initialize(
                context,
                this.model,
                characterKey,
                characterRecord.getWalkSpeed(),
                characterClass,
                superbossManager,
                currentLevelSession)

            // apparently this is necessary to stop client-side TP hacks; null
            delay(1,
                () => {
                    for (let instance of this.model.GetDescendants()) {
                        if (instance.IsA("BasePart")) {
                            if (instance.Anchored) {
                                DebugXL.logW(LogArea.Parts, instance.GetFullName() + " is anchored. Should it be?")
                            }
                            else {
                                instance.SetNetworkOwner(undefined)
                            }
                        }
                    }
                })

            if (!CharacterClasses.monsterStats[characterClass].ghostifyB) {
                // doing this before they draw their weapon so I think it's ok
                mobChildren.forEach((child) => {
                    if (child.IsA("BasePart")) {
                        PhysicsService.SetPartCollisionGroup(child, "Mob")
                    }
                })
            }

            ToolCaches.updateToolCache(this.context.getPlayerTracker(), characterKey, characterRecord)

            // prepare a weapon
            for (let i = 0; i < HotbarSlot.Max; i++) {
                const possessionKey = characterRecord.getPossessionKeyFromSlot(i)
                if (possessionKey) {
                    const tool = CharacterRecord.getToolInstanceFromPossessionKey(this.model, characterRecord, possessionKey)
                    if (!tool) {
                        DebugXL.logW(LogArea.Items, "Couldn't find tool for " + this.model.Name + " weaponKey: " + possessionKey)
                    }
                    else {
                        // check to make sure nobody else arl
                        const flexTool = characterRecord.getFlexTool(possessionKey)
                        DebugXL.Assert(flexTool !== undefined)
                        if (flexTool) {
                            FlexibleToolsServer.setFlexToolInst(tool, { flexToolInst: flexTool, character: this.model, possessionsKey: possessionKey })
                            if ((tool.FindFirstChild("MeleeClientScript") as Script|undefined)) {
                                this.weaponUtility = new MeleeWeaponUtility(tool, flexTool)    // do 'client' stuff
                                break
                            }
                            else if ((tool.FindFirstChild('BoltClient') as Script|undefined)) {
                                this.weaponUtility = new RangedWeaponUtility(tool, flexTool, "DisplayBolt")
                                break
                            }
                            else if ((tool.FindFirstChild('ThrownWeaponClientScript') as Script|undefined)) {
                                this.weaponUtility = new RangedWeaponUtility(tool, flexTool, "Handle")
                                break
                            }
                            else {
                                DebugXL.logW(LogArea.Items, 'Weapon ' + tool.GetFullName() + ' not supported yet')
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
                    if (spawner) {
                        return spawner.getLastSpottedEnemyPosition()
                    }
                    else {
                        DebugXL.logE(LogArea.Spawner, this.model.GetFullName() + "'s spawner for " + this.spawnPart.GetFullName() + " not found in spawnersMap")
                    }
                }
            }
        }

        protected _updateLastAttacker() {
            if (this.lastSpottedEnemyPosition) {
                if (this.spawnPart) {
                    const spawner = spawnersMap.get(this.spawnPart)
                    DebugXL.Assert(spawner !== undefined)
                    if (spawner) {
                        spawner.setLastSpottedEnemyPosition(this.lastSpottedEnemyPosition)
                    }
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
                    const [closestTarget, bestFit] = GeneralWeaponUtility.findClosestVisibleTarget(this.model, this.getCharacterRecord().getTeam(), 80)
                    if (closestTarget) {
                        // if enemy in aggro range approach that spot (even if they go out of sight)
                        this.lastSpottedEnemyPosition = ModelUtility.getPrimaryPartCFrameSafe(closestTarget).Position
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
                        const myPos = ModelUtility.getPrimaryPartCFrameSafe(this.model).Position
                        const mobs: Character[] = mobFolder.GetChildren()
                        const pushForces = mobs.map((mob) => myPos.sub(ModelUtility.getPrimaryPartCFrameSafe(mob).Position))
                        const scaledForces = pushForces.map((pushForce) => pushForce.Magnitude > 0.001 ? pushForce.Unit.div(pushForce.Magnitude) : zeroVec)
                        const totalPush = scaledForces.reduce((forceA, forceB) => forceA.add(forceB))

                        const destinationVec = lastSpottedEnemyPosition.sub(ModelUtility.getPrimaryPartCFrameSafe(this.model).Position)
                        const totalVec = totalPush.mul(mobPushApart).add(destinationVec)
                        if (totalVec.Magnitude > 4) {  // don't do the cha-cha once you're stable
                            const shortenedVec = destinationVec.mul(destinationVec.Magnitude - this.weaponUtility.getRange())  // why stop out of range? because it has a tendency to overshoot
                            this.humanoid.MoveTo(ModelUtility.getPrimaryPartCFrameSafe(this.model).Position.add(shortenedVec))
                            //this.humanoid.Move(totalVec.Unit)
                            this.humanoid.WalkSpeed = totalVec.Magnitude > 16 ? 16 : totalVec.Magnitude
                        }
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


