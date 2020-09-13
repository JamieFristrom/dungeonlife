
// Copyright (c) Happion Laboratories - see license at https`:`//github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { BalanceData } from "./BalanceDataTS"
DebugXL.logD(LogArea.Requires, "FlexTool: BalanceData required")
import { Enhancements, EnhancementFlavor } from "./EnhancementsTS"
DebugXL.logD(LogArea.Requires, "FlexTool: Enhancements required")
import { ToolData } from "./ToolDataTS"
DebugXL.logD(LogArea.Requires, "FlexTool: ToolData required")
import { Players, RunService, ServerStorage } from "@rbxts/services";
DebugXL.logD(LogArea.Requires, "FlexTool: Players required")

import { ValueHelper } from 'ReplicatedStorage/TS/ValueHelper'

import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"
import { ActiveSkinSetI } from "./SkinTypes"

import { RandomNumberGeneratorI } from "ReplicatedStorage/TS/RandomNumberGeneratorI"

type PossessionKey = string

// disappointed to discover after converting this from a number to an enum that typescript allows you to assign
// any number to it
export enum HotbarSlot {
    Slot1 = 1,
    Slot2,
    Slot3,
    Slot4,
    Max = Slot4
}

export interface GearDefinition {
    readonly baseDataS: string
    readonly levelN: number
    readonly enhancementsA: Array<Enhancements.EnhancementI>
    readonly slotN?: HotbarSlot
    readonly equippedB?: boolean
    readonly boostedB?: boolean
    readonly hideItemB?: boolean
    readonly hideAccessoriesB?: boolean
}

export interface GlobalGearInfo {
    cooldownFinishTime: number
}

let globalGearInfos = new Map<Player, { [possessionKey: string]: GlobalGearInfo }>()

const enhancementPriceFactor = 1.2
const priceGamma = 1.2


export class FlexTool {
    public enhancementsA: Array<Enhancements.EnhancementI> // can't make readonly because we modify obsolete data on load

    constructor(
        public readonly baseDataS: string,
        public levelN: number,                                   // can't make readonly because we modify obsolete data on load
        incomingEnhancementsA: Array<Enhancements.EnhancementI>,
        public slotN?: HotbarSlot,
        public equippedB?: boolean,
        public boostedB?: boolean,
        public hideItemB?: boolean,
        public hideAccessoriesB?: boolean
    ) {
        this.enhancementsA = Object.assign(incomingEnhancementsA)  // copy so if we're assigning from static data (a starting classes items enhancement list, perhaps) we're safer
    }

    static objectify(rawToolData: FlexTool) {
        return setmetatable(rawToolData, FlexTool as LuaMetatable<FlexTool>) as FlexTool
    }

    static retexture(tool: Tool, textureSwapId?: string) {
        if (!textureSwapId) return
        let handle = tool.FindFirstChild('Handle')
        DebugXL.Assert(handle !== undefined)
        if (!handle) return
        if (handle.IsA("MeshPart")) {
            handle.TextureID = textureSwapId
        }
        else {
            let mesh = handle.FindFirstChildWhichIsA("SpecialMesh") as SpecialMesh
            if (mesh) {
                mesh.TextureId = textureSwapId
            }
        }
    }


    getLevelRequirement() {
        return math.max(1, (this.levelN + this.getTotalEnhanceLevels() - 1) * 3 + 1)
    }


    getStatRequirement(): [number, string] {
        let totalLevels = this.levelN + this.getTotalEnhanceLevels()
        let baseData = ToolData.dataT[this.baseDataS]
        if (baseData.statReqS) {
            let statName = baseData.statReqS
            // it's a little awkward because of the change from 5 points a level where I want to leave it at a
            // starting 45 points, so to make a nice spread of weapons at the beginning but not to fall behind I need the discontinuity
            // in the formula   
            let statReqN = (totalLevels <= 4) ?
                totalLevels * 2 + 8 :
                math.ceil(1.5 * totalLevels + 10)
            // I chose 1.5 because at that number as long as you keep investing half your experience
            // in your primary stat you'll be able to use weapons a couple levels ahead of you
            return [statReqN, statName]
        }
        return [0, ""]
    }

    getBoosted() {
        return this.boostedB || false
    }

    getActualLevel() {
        return this.levelN
    }


    getLocalLevel(actualLevel: number, localLevel: number) {
        DebugXL.Assert(actualLevel !== undefined)
        DebugXL.Assert(localLevel !== undefined)
        if (actualLevel && localLevel) {
            let maxLevel = localLevel
            return actualLevel > maxLevel ? this.levelN * maxLevel / actualLevel : this.levelN  // can be fractional
        }
        else {
            return this.levelN
        }
    }


    getTotalEnhanceLevels() {
        // reduce() isn't working yet
        let sum = 0
        this.enhancementsA.map(enhance => enhance.levelN).forEach((n) => sum += n)
        return sum

        //return this.enhancementsA.map( enhance => enhance.levelN ).reduce( ( x, y )=> x + y, 0 )
    }


    getEnhanceLocalLevel(enhanceIdx: number) //, heroActualLevel: number, currentMaxHeroLevel: number )
    {
        let enhancement = this.enhancementsA[enhanceIdx]
        let enhancementLocalLevel = enhancement.levelN
        // now that enhancement levels are percentages I don't think this makes sense anymore
        // if( heroActualLevel )
        // {
        //     let maxLevel = currentMaxHeroLevel
        //     if( heroActualLevel > maxLevel )
        //         enhancementLocalLevel = enhancementLocalLevel * maxLevel / heroActualLevel
        // }
        return enhancementLocalLevel
    }

    getMonsterDefense(attackType: string) {
        let toolBaseDatum = ToolData.dataT[this.baseDataS]
        let defense = toolBaseDatum.baseDefensesT![attackType]
        if (!defense) {
            DebugXL.Error(this.baseDataS + " unknown attack type " + attackType)
        }

        defense = math.floor(defense + defense * BalanceData.armorDefensePerLevelN)
        return defense
    }

    // wishlist; split armor / weapons / potions into separate child classes
    // wishlist: make attackType enum
    getHeroDefense(attackType: string, heroActualLevel: number, currentMaxHeroLevel: number) {
        let toolBaseDatum = ToolData.dataT[this.baseDataS]
        let defense = toolBaseDatum.baseDefensesT![attackType]
        if (!defense) {
            DebugXL.Error(this.baseDataS + " unknown attack type " + attackType)
        }

        defense = math.floor(defense + defense * BalanceData.armorDefensePerLevelN * (this.getLocalLevel(heroActualLevel, currentMaxHeroLevel) - 1))
        return defense
    }

    // I could use a getter but then I'd have to figure out how to call it from lua
    getRarityColor3() {
        let rarityN = this.getTotalEnhanceLevels()
        return PossessionData.raritiesT[rarityN].color3
    }

    startPowerCooldown(player: Player) {
        let powerType = this.baseDataS
        let myGearInfos = globalGearInfos.get(player)
        if (!myGearInfos) {
            myGearInfos = {}
            globalGearInfos.set(player, myGearInfos)
        }
        // not affected by slow as yet
        myGearInfos[powerType] = { cooldownFinishTime: time() + this.getCooldown() + this.getDuration() }
    }

    powerCooldownPctRemaining(player: Player) {
        let powerType = this.baseDataS
        let myGearInfos = globalGearInfos.get(player)
        if (myGearInfos) {
            let myGearInfo = myGearInfos[powerType]
            if (myGearInfo) {
                return math.max((myGearInfo.cooldownFinishTime - time()) / (this.getCooldown()! + this.getDuration()), 0)
            }
        }
        return 0
    }

    powerCooldownTimeRemaining(player: Player) {
        let powerType = this.baseDataS
        let myToolInfos = globalGearInfos.get(player)
        if (myToolInfos) {
            let myToolInfo = myToolInfos[powerType]
            if (myToolInfo) {
                return math.max(myToolInfo.cooldownFinishTime - time(), 0)
            }
        }
        return 0
    }

    identical(flexTool: FlexTool) {
        if (this.levelN === flexTool.levelN && this.baseDataS === flexTool.baseDataS) {
            // ugly because they can be in different orders but still effectively the same item
            this.enhancementsA.forEach(element => {
                let foundEnhance = false
                flexTool.enhancementsA.forEach(element2 => {
                    if (element.flavorS === element2.flavorS || element.levelN === element2.levelN) {
                        foundEnhance = true
                    }
                })
                if (!foundEnhance)
                    return false
            });
            // brute brute force
            flexTool.enhancementsA.forEach(element => {
                let foundEnhance = false
                this.enhancementsA.forEach(element2 => {
                    if (element.flavorS === element2.flavorS || element.levelN === element2.levelN) {
                        foundEnhance = true
                    }
                })
                if (!foundEnhance)
                    return false
            });
            // we didn't find any mismatched enhancements
            return true

        }
        return false
    }

    // just determines whether activating that tool makes sense
    canLogicallyActivate(character: Model) {
        return true
        // now that it creates a wisp this doesn't make so much sense:
        // if( this.baseDataS==="MagicHealing")
        // {
        //     let humanoid = character.FindFirstChild("Humanoid") as Humanoid
        //     if( humanoid && character.Humanoid.Health < character.Humanoid.MaxHealth )
        //     {
        //         return true
        //     }
        //     else
        //     {
        //         return false
        //     }
        // }
        // else
        // {
        //     return true
        // }
    }

    getUseType() { return ToolData.dataT[this.baseDataS].useTypeS }

    getEquipType() { return ToolData.dataT[this.baseDataS].equipType }

    getImageId() { return ToolData.dataT[this.baseDataS].imageId }

    getCooldown(): number {
        let cooldown = ToolData.dataT[this.baseDataS].cooldownN
        return cooldown ? cooldown : 0
    }

    getEquipSlot() { return ToolData.dataT[this.baseDataS].equipSlot }

    getDuration() {
        let durationFunc = ToolData.dataT[this.baseDataS].durationFunc
        return durationFunc ? durationFunc(ToolData.dataT[this.baseDataS], this.levelN) : 0
    }

    getManaCost() {
        let baseData = ToolData.dataT[this.baseDataS]
        return baseData.manaCostN ? (baseData.manaCostN + baseData.manaCostPerLevelN! * this.levelN) : 0
    }

    getBaseData() {
        return ToolData.dataT[this.baseDataS]
    }

    getPurchasePrice() {
        // it should be nonlinear because:  it's harder to get, therefore worth more
        // it shouldn't be nonlinear because:  everything's relative, because then an established player can't afford to buy
        // their ideal weapon (it kind of screws the established player)
        // so trying to keep it not crazily nonlinear
        // see the Gear Price spreadsheet 
        let baseWeaponDamageish = 1 + this.levelN * BalanceData.weaponDamagePerLevelN
        let enhancedPrice = baseWeaponDamageish * (enhancementPriceFactor ** this.getTotalEnhanceLevels())
        let totalPrice = math.ceil(enhancedPrice ** priceGamma * 19 * ToolData.dataT[this.baseDataS].priceMulN)
        return totalPrice

        //        return math.ceil( ( ( this.levelN + 10 )**1.15 ) * ( 1.2 ** (this.getTotalEnhanceLevels()) )
    }

    getSellPrice() {
        return math.ceil(this.getPurchasePrice() / 20)
    }

    getEffectStrength(nerfFactor: number) {
        let baseData = ToolData.dataT[this.baseDataS]
        DebugXL.Assert(baseData.effectStrengthN !== undefined)
        if (baseData.effectStrengthN) {
            let adjStat = baseData.effectStrengthN
            adjStat = adjStat + baseData.effectBonusPerLevelN! * this.levelN * nerfFactor
            return adjStat
        }
        else {
            return 0
        }
    }

    // don't call this function unless you know what you're doing
    // should only be called on server
    createToolInstance(activeSkins: ActiveSkinSetI, possessionKey: PossessionKey) {
        DebugXL.Assert(RunService.IsServer())

        // if tool doesn't have enhancements add an empty array so we don't have to constantly check if enhancementsA is nil
        if (!this.enhancementsA) this.enhancementsA = []

        const toolBaseDatum = ToolData.dataT[this.baseDataS]
        if (!toolBaseDatum) DebugXL.logE(LogArea.Items, `Unable to find possession ${this.baseDataS}`)

        let baseToolId = toolBaseDatum.baseToolS
        DebugXL.Assert(baseToolId !== undefined)
        if (baseToolId) {
            let textureSwapId = undefined
            if (!toolBaseDatum.skinType) {
                DebugXL.logE(LogArea.Items, `${toolBaseDatum.idS} has no skinType`)
            }
            else {
                if (activeSkins.get(toolBaseDatum.skinType)) {
                    const skinTag = activeSkins.get(toolBaseDatum.skinType)
                    if (skinTag) {
                        const reskin = PossessionData.dataT[skinTag]
                        if (reskin && reskin.baseToolS) {
                            baseToolId = reskin.baseToolS
                            textureSwapId = reskin.textureSwapId
                        }
                    }
                }
            }

            const ToolsFolder = (ServerStorage.FindFirstChild('Tools') as Folder|undefined)!
            DebugXL.Assert(ToolsFolder !== undefined)

            const toolTemplate = (ToolsFolder.FindFirstChild(baseToolId) as Tool|undefined)
            DebugXL.Assert(toolTemplate !== undefined)
            if (toolTemplate) {
                const newToolInstance = toolTemplate.Clone() as Tool
                FlexTool.retexture(newToolInstance, textureSwapId)
                let nonDefaultFX = false
                for (let i = 0; i < this.enhancementsA.size(); i++) {
                    const enhancement = this.enhancementsA[i]

                    // enable enhancement related effects
                    for (let descendent of newToolInstance.GetDescendants()) {
                        if (descendent.Name === 'FX' + enhancement.flavorS) {
                            if (descendent.IsA('Script')) {
                                descendent.Disabled = false
                            }
                            else if (descendent.IsA('ParticleEmitter') || descendent.IsA('Beam') || descendent.IsA('Light') || descendent.IsA('Fire') || descendent.IsA('Trail')) {
                                // now *that's* a new idea to me. Any of these things have Enabled properties, so...
                                const descendentEmitter = descendent as ParticleEmitter | Beam | Light | Fire | Trail
                                descendentEmitter.Enabled = true
                                nonDefaultFX = true
                            }
                            else {
                                DebugXL.logE(LogArea.Items, `Unsupported enhancement fx type ${descendent.ClassName} on ${descendent.GetFullName()}`)
                            }
                        }
                    }
                }

                if (nonDefaultFX) {
                    // remove default effects
                    for (let descendent of newToolInstance.GetDescendants()) {
                        if (descendent.Name === 'FXdefault') {
                            if (descendent.IsA('ParticleEmitter') || descendent.IsA('Beam') || descendent.IsA('Light') || descendent.IsA('Fire') || descendent.IsA('Trail')) {
                                let effect = descendent as ParticleEmitter | Beam | Light | Fire | Trail
                                effect.Enabled = false
                            }
                            else {
                                DebugXL.logE(LogArea.Items, `Unsupported enhancement fx type ${descendent.ClassName} on ${descendent.GetFullName()}`)
                            }
                            // delibaretely not enabling something already enabled because I think there's a perf hit
                            // and who knows, there may be tools with disabled default fx that were there for temp or testing
                        }
                    }
                }

                newToolInstance.CanBeDropped = false

                // here's some data we attach to the tool itself to make it easy to look up on the client
                // attach inventory slot so we can find it on the client
                ValueHelper.AddStringValue(newToolInstance, 'PossessionKey', possessionKey)

                // and if you're having trouble looking up its stats, maybe because you're on the client and haven't loaded the character
                // record yet, then you can look up its base data:
                ValueHelper.AddStringValue(newToolInstance, 'BaseData', toolBaseDatum.idS)

                return newToolInstance
            }
        }
        return undefined
    }

    addEnhancement(enhancementKeyS: EnhancementFlavor) {
        DebugXL.Assert(typeIs(enhancementKeyS, "string"))

        // being locked down by a melee weapon is no fun, might as well be instant kill. actually same goes for a ranged
        // weapon
        if (enhancementKeyS === "explosive" && (this.baseDataS === "Bomb" || this.baseDataS === "MagicBarrier")) {
            return
        }

        // if( enhancement already there then level it up
        for (let enhancement of this.enhancementsA) {
            if (enhancement.flavorS === enhancementKeyS) {
                enhancement.levelN = enhancement.levelN + 1
                return
            }
        }

        // otherwise it's new
        let newEnhancement = {
            flavorS: enhancementKeyS,
            levelN: 1
        }

        this.enhancementsA.push(newEnhancement)
    }



    addRandomEnhancements(rng: RandomNumberGeneratorI, boostB: boolean, minNumber = 0, invalidChoices: Readonly<string[]> = []) {
        DebugXL.Assert(typeIs(boostB, "boolean"))
        DebugXL.Assert(typeIs(minNumber, "number"))

        const equipData = ToolData.dataT[this.baseDataS]
        if (equipData.equipType === "potion" || equipData.equipType === "power") {
            DebugXL.logI(LogArea.Items, `Not enchanting ${this.baseDataS} because potion or power`)
            return
        }

        // realized later if( we don't adjust the diecap you can get some higher powered loot than you should at low
        // levels... a level 3 sword is more likely to have 2 enchantments than just 1
        const toolLevelN = this.getActualLevel()
        const dieCap =
            (toolLevelN > 4) ? 15 :
                (toolLevelN > 3) ? 14 :
                    (toolLevelN > 2) ? 12 :
                        (toolLevelN > 1) ? 9 : 5

        const enhancementDieRoll = rng.randomInteger(1, dieCap)
        const additionalEnhances = (enhancementDieRoll >= 15) ? 4 :
            (enhancementDieRoll >= 13) ? 3 :     // rolled a 13 || 14
                (enhancementDieRoll >= 10) ? 2 :     // rolled a 10, || 11, 12
                    (enhancementDieRoll >= 6) ? 1 :  // rolled a 6, 7, || 8 || 9
                        0             // rolled a 1,2,3 || 4, 5

        const numEnhancements = minNumber + additionalEnhances

        let boostedEnhancementsN = numEnhancements
        if (boostB) {
            if (rng.randomNumber() < 0.5) {
                if (numEnhancements < 4) {
                    boostedEnhancementsN = numEnhancements + 1
                }
            }
        }

        const finalEnhancements = math.min(boostedEnhancementsN, this.getActualLevel() - 1)
        if (finalEnhancements > numEnhancements) {
            this.boostedB = true
        }
        const enhancementKeys = Object.keys(Enhancements.enhancementFlavorInfos) as EnhancementFlavor[]
        let validEnhancementKeys = enhancementKeys.filter((enhanceKey) =>
            Enhancements.enhancementFlavorInfos[enhanceKey].allowedTypesT[equipData.equipType]).filter((enhanceKey) =>
                invalidChoices.indexOf(enhanceKey) === -1)  // -1 means not in invalidChoices array 

        // bombs already explode, give them something else
        if (this.baseDataS === 'Bomb') {
            validEnhancementKeys = validEnhancementKeys.filter((enhanceKey) => enhanceKey !== 'explosive')
        }

        DebugXL.logD(LogArea.Items, `Enchanting ${this.baseDataS} with ${finalEnhancements} enhancements`)
        for (let i = 0; i < finalEnhancements; i++) {
            if (this.enhancementsA.size() === 0 || rng.randomNumber() < 0.5) {
                const newEnhancementIdx = rng.randomInteger(0, validEnhancementKeys.size() - 1)
                this.addEnhancement(validEnhancementKeys[newEnhancementIdx])
            }
            else {
                // 50% chance of secondary enhancements bolstering original ones. 
                const newEnhancementIdx = rng.randomInteger(0, this.enhancementsA.size() - 1)
                const newEnhancement = this.enhancementsA[newEnhancementIdx].flavorS
                this.addEnhancement(newEnhancement)
            }
        }
    }

    static nullTool = new FlexTool('NullTool', 1, [])
}


Players.PlayerRemoving.Connect(function () {
    // it's possible that the remove could outrace a power use, so checking everyone
    globalGearInfos.forEach(function (_, player) {
        if (!player.Parent) globalGearInfos.delete(player)
    })
})