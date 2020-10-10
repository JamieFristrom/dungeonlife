
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { FlexTool, GearDefinition, HotbarSlot } from 'ReplicatedStorage/TS/FlexToolTS'
import { ToolData } from './ToolDataTS';

import * as MathXL from 'ReplicatedStorage/Standard/MathXL'
import * as PossessionData from 'ReplicatedStorage/Standard/PossessionDataStd'

import { CharacterClass, CharacterClasses } from './CharacterClasses';
import { SkinTypeEnum } from "./SkinTypes"
import { Players, Teams } from '@rbxts/services';


// we need an unchangeable characterKey; we can't just use Character because a) sometimes they're not instantiated and b) costume changes change characters
export type CharacterKey = number

type Character = Model

// I like calling it a PossessionKey rather than an item key or a gear key because it implies that it only makes sense for a specific owner
type PossessionKey = string

function strcmp(a: string, b: string) {
    return a < b ? -1 : a > b ? 1 : 0
}

// Player Character Interface
export interface CharacterRecordI {
    gearPool: GearPool
    idS: CharacterClass
    countBaseDataQuantity(baseDataKind: string): number
    countTools(): number
    getActualLevel(): number
    getClass(): string
    getFlexTool(itemKey: string): FlexTool | undefined
    getImageId(): string
    getJumpPower(): number
    getLocalLevel(): number
    getPossessionKeyFromSlot(slot: HotbarSlot): string | undefined
    getSlotFromPossessionKey(possessionKey: PossessionKey): number | undefined
    getTeam(): Team
    getWalkSpeed(): number
    giveFlexTool(flexTool: FlexTool): void
    removeTool(itemKey: string): void
}


// wishlist: put in own module. This will require updating a bunch of requires / imports
export class GearPool {
    private gear = new Map<string, FlexTool>()

    constructor(gearT: { [k: string]: FlexTool }) {
        for (const [k, v] of Object.entries(gearT)) {
            this.set(k as string, v)
            FlexTool.objectify(v)
        }
    }

    get(key: PossessionKey) { return this.gear.get(key) }
    set(key: PossessionKey, item: FlexTool) { this.gear.set(key, item) }
    has(key: PossessionKey) { return this.gear.get(key) ? true : false }

    clear() { this.gear.clear() }

    getFromSlot(slot: number): [FlexTool | undefined, string | undefined] {
        let foundItem: FlexTool | undefined
        let foundKey: string | undefined
        this.gear.forEach((item, k) => {
            if (item.slotN === slot) {
                if (foundItem !== undefined) {
                    DebugXL.Error(`Found both ${item.baseDataS} and ${foundItem.baseDataS} in slot ${slot}`)
                }
                foundKey = k
                foundItem = item
            }
        })
        return [foundItem, foundKey]
    }

    getFromEquipSlot(equipSlot: ToolData.EquipSlotEnum): [FlexTool | undefined, string | undefined] {
        let foundItem: FlexTool | undefined
        let foundKey: string | undefined
        this.gear.forEach((item, k) => {
            if (item.equippedB && item.getEquipSlot() === equipSlot) {
                if (foundItem !== undefined) {
                    DebugXL.Error(`Found both ${item.baseDataS} and ${foundItem.baseDataS} in slot ${equipSlot}`)
                }
                foundKey = k
                foundItem = item
            }
        })
        return [foundItem, foundKey]
    }

    assignToSlot(possesesionKey: string, slot: HotbarSlot) {
        // clear previous item from slot
        const currentItemInSlot = this.getFromSlot(slot)[0]
        if (currentItemInSlot) {
            currentItemInSlot.slotN = undefined
        }

        const item = this.get(possesesionKey)
        if (item) {
            item.slotN = slot
        }
    }

    getWornWalkSpeedMul() {
        let mul = 1
        this.gear.forEach((v, k) => {
            if (v.equippedB) {
                const baseData = ToolData.dataT[v.baseDataS]
                if (baseData) {
                    mul *= baseData.walkSpeedMulN
                }
            }
        })
        return mul
    }

    getWornJumpPowerMul() {
        let mul = 1
        this.gear.forEach((v, k) => {
            if (v.equippedB) {
                const baseData = ToolData.dataT[v.baseDataS]
                if (baseData) {
                    mul *= baseData.jumpPowerMulN
                }
            }
        })
        return mul
    }

    forEach(valueKeyFunc: (v: FlexTool, k: string) => void) {
        this.gear.forEach(valueKeyFunc)
    }

    delete(itemKey: string) {
        this.gear.delete(itemKey)
    }

    size() {
        return this.gear.size()
    }

    countIf(func: (v: FlexTool) => boolean) {
        return this.gear.values().filter(func).size()
    }

    findIf(func: (v: FlexTool) => boolean): [FlexTool | undefined, string | undefined] {
        for (const [k, v] of Object.entries(this.gear)) {
            if (func(v))
                return [v, k]
        }
        return [undefined, undefined]
    }

    findAllWhere(func: (v: FlexTool) => boolean) {
        const gearMap = new Map<string, FlexTool>()
        for (const [k, v] of Object.entries(this.gear)) {
            if (func(v))
                gearMap.set(k, v)
        }
        return gearMap
    }

    static sortItemPairs(items: Array<[string, FlexTool]>) {
        table.sort(items, function (a: [string, FlexTool], b: [string, FlexTool]) {
            const toolA = ToolData.dataT[a[1].baseDataS]
            const toolB = ToolData.dataT[b[1].baseDataS]
            if (toolA.equipType === toolB.equipType) {
                if (toolA.equipType === ToolData.EquipTypeEnum.Armor) {
                    DebugXL.Assert(toolA.equipSlot !== undefined)
                    DebugXL.Assert(toolB.equipSlot !== undefined)
                    if (toolA.equipSlot === toolB.equipSlot)
                        return a[1].getLevelRequirement() < b[1].getLevelRequirement()
                    else
                        return toolA.equipSlot! < toolB.equipSlot!
                }
                else {
                    return a[1].getLevelRequirement() < b[1].getLevelRequirement()
                }
            }
            else {
                return toolA.equipType < toolB.equipType
            }
        } as () => boolean)

        return items
    }

    makeSortedList() {
        const items = this.gear.entries()
        return GearPool.sortItemPairs(items)
    }

    purgeObsoleteItems() {
        // you may have an obsolete item; a lot of players are rocking HelmetWinged's
        for (const [k, flexToolInst] of Object.entries(this.gear)) {
            if (ToolData.dataT[flexToolInst.baseDataS] === undefined) {
                DebugXL.Error(`Nonexistent item ${flexToolInst.baseDataS}. Removing.`)
                this.gear.delete(k)
            }
        }
    }
}

// this data is persisted and therefore can't contain Roblox instances
export abstract class CharacterRecord implements CharacterRecordI {
    gearPool: GearPool

    protected itemsT: { [k: string]: FlexTool } | undefined  // retained to accesss persistent data using old system
    private toolKeyServerN = 1

    constructor(
        public idS: CharacterClass,
        _startItems: Array<GearDefinition>) {
        this.itemsT = undefined  // just used for persistence in old system
        this.gearPool = new GearPool({})
        for (let i = 0; i < _startItems.size(); i++) {
            const startItem = _startItems[i]
            const k: string = 'item' + (i + 1)
            const gearItem = new FlexTool(
                startItem.baseDataS,
                startItem.levelN,
                startItem.enhancementsA,
                startItem.slotN,
                startItem.equippedB,
                startItem.boostedB, // theoretically always false
                startItem.hideItemB, // theoretically always false
                startItem.hideAccessoriesB // theoretically always false                                        
            )
            this.gearPool.set(k, gearItem)
            const idx = tonumber(k.sub(4))
            DebugXL.Assert(idx !== undefined)
            if (idx !== undefined) {
                DebugXL.Assert(idx >= 1)
                // make sure tool key server starts serving after existing items
                this.toolKeyServerN = math.max(this.toolKeyServerN, idx + 1)
            }
        }
    }

    static convertFromRemote(rawPCData: CharacterRecordI) {
        const pc = setmetatable(rawPCData, CharacterRecord as LuaMetatable<CharacterRecordI>) as CharacterRecord
        DebugXL.Assert(pc.itemsT === undefined)
        setmetatable(pc.gearPool, GearPool as LuaMetatable<GearPool>)
        pc.gearPool.forEach(item => FlexTool.objectify(item))
        return pc
    }

    getClass() {
        return this.idS
    }

    // hmm. what to do here. going to try inheritance
    getTotalDefense(attackType: string) {
        let sum = 0
        this.gearPool.forEach(function (equip, k) {
            if (equip.equippedB) {
                sum = sum + equip.getMonsterDefense(attackType)
            }
        })
        return sum
    }

    getFlexTool(itemKey: string) {
        DebugXL.Assert(itemKey.sub(0, 3) === 'item')
        return this.gearPool.get(itemKey)
    }

    giveFlexTool(flexTool: FlexTool) {
        const key = 'item' + this.toolKeyServerN
        DebugXL.Assert(!this.gearPool.has(key))
        this.gearPool.set(key, flexTool)
        this.toolKeyServerN++
        return key
    }

    removeTool(itemKey: string) {
        DebugXL.Assert(itemKey.sub(0, 3) === 'item')
        const item = this.gearPool.get(itemKey)
        this.gearPool.delete(itemKey)
        return item
    }

    countTools() {
        return this.gearPool.size()
    }

    countBaseDataQuantity(baseDataKind: string) {
        return this.gearPool.countIf((item) => item.baseDataS === baseDataKind)
    }

    /// possessionKey's are only unique per player; two different players might have tools with the same possession key. It is persistent, so
    //  if we wanted to make them independent between different players we'd need one master server or to use GUID's. 
    //  We *could* have another unique id per server, but it seems unnecessary as long as we have some way of identifying tools
    //  uniquely.
    getPossessionKeyFromSlot(slot: HotbarSlot) {
        let _key: string | undefined
        this.gearPool.forEach(function (flexTool: FlexTool, key: string) {
            if (flexTool.slotN === slot) {
                DebugXL.Assert(_key === undefined)
                _key = key
            }
        })
        return _key
    }

    getSlotFromPossessionKey(possessionKey: PossessionKey) {
        const flexTool = this.gearPool.get(possessionKey)
        if (flexTool) {
            return flexTool.slotN
        }
    }

    static getToolPossessionKey(tool: Tool): PossessionKey | undefined {
        const possessionKeyValue = tool.FindFirstChild('PossessionKey') as StringValue
        DebugXL.Assert(possessionKeyValue !== undefined)
        if (possessionKeyValue) {
            return possessionKeyValue.Value
        }
        return undefined
    }

    // It's counter-intuitive that the link between tools and their possession keys is stored in a value in the tool, but it's a good way to
    // replicate to client.
    // this is awkward because we want to be able to call it from the client or the server, it might be in a character's hand, a player's backpack,
    // or a mob's tool cache. so far characterKeys are server-side only, though that will probably change
    // It may seem redundant that we have both character & characterRecord since you can derive one from the other but this
    // is more Demeter principle and it means we're not dependent on PlayerServer (which is already dependent on us)
    static getToolInstanceFromPossessionKey(character: Character, characterRecord: CharacterRecordI, possessionKey: PossessionKey) {
        DebugXL.Assert(character !== undefined)
        let tool: Tool | undefined
        if (character) {
            const heldTool = character.FindFirstChildWhichIsA('Tool') as Tool
            if (heldTool && CharacterRecord.getToolPossessionKey(heldTool) === possessionKey) {
                tool = heldTool
            }
            else  // tool not in hand; is it in cache?
            {
                const player = Players.GetPlayerFromCharacter(character)
                if (player) {
                    const correctInstance = player.FindFirstChild('Backpack')!.GetChildren().find((inst) => {
                        DebugXL.Assert(inst.IsA('Tool'))
                        return inst.IsA('Tool') && CharacterRecord.getToolPossessionKey(inst) === possessionKey
                    })
                    tool = correctInstance as Tool
                }
                else {
                    // mobs don't keep their tools in a cache; that would be a premature optimization
                    // players need them in the cache so they can rapidly equip on the client without lag
                    const flexTool = characterRecord.gearPool.get(possessionKey)
                    DebugXL.Assert(flexTool !== undefined)
                    if (flexTool) {
                        tool = flexTool.createToolInstance(new Map<SkinTypeEnum, string>(), possessionKey)
                    }
                }
            }
        }
        return tool
    }

    giveRandomArmor(hideAccessoriesB: boolean) {
        for (const slot of Object.keys(ToolData.EquipSlotEnum)) {
            const equipPool = ToolData.dataA.filter((tool) => tool.equipSlot === slot)
            const equipIdx = MathXL.RandomInteger(0, equipPool.size() - 1)
            const equip = equipPool[equipIdx]
            const flexTool = new FlexTool(equip.idS, 0, [], undefined, false, false, false, hideAccessoriesB)
            this.giveFlexTool(flexTool)
        }
    }

    equipAvailableArmor() {
        const slotUsed = { Torso: false, Legs: false, Head: false }

        this.gearPool.forEach(function (item) {
            const equipSlot = ToolData.dataT[item.baseDataS].equipSlot
            if (equipSlot) {
                item.equippedB = !slotUsed[equipSlot]
            }
        })
    }

    // sorts by equip slot and then level to help make decisions about how to equip
    getSortedItems() {
        return this.gearPool.makeSortedList()
    }

    getImageId() {
        return PossessionData.dataT[this.idS].imageId
    }

    getWalkSpeed(): number {
        return CharacterClasses.classData[this.idS].walkSpeedN
    }

    getJumpPower(): number {
        return CharacterClasses.classData[this.idS].jumpPowerN
    }

    canUseGear(flexTool: FlexTool): boolean {
        DebugXL.Assert(flexTool instanceof FlexTool)
        return true
    }

    abstract getLocalLevel(): number

    abstract getActualLevel(): number

    // not data-driving this so we aren't duplicating data and so we aren't trying to save Roblox instances
    getTeam() {
        return (Teams.FindFirstChild('Unassigned') as Team | undefined)!
    }

    getBaseDamageBonus() { return 0 }

    calculateMaxHealth(level: number, isHighLevelServer: boolean) {
        return 0;
    }
}


export class CharacterRecordNull extends CharacterRecord {
    constructor() {
        super("NullClass", [])
    }
    getLocalLevel() { return 0 }
    getActualLevel() { return 0 }
}