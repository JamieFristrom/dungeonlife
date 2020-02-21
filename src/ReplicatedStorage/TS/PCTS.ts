import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'
import { ObjectXL } from 'ReplicatedStorage/TS/ObjectXLTS'
import { ToolData } from './ToolDataTS';

import * as MathXL from 'ReplicatedStorage/Standard/MathXL'
import * as PossessionData from 'ReplicatedStorage/Standard/PossessionDataStd'
import { CharacterClasses } from './CharacterClasses';


function strcmp( a: string, b: string )
{
    return a < b ? -1: a > b ? 1 : 0
}

// Player Character Interface
export interface PCI
{
    idS: string
    getImageId() : string
    getWalkSpeed() : number
    getJumpPower() : number
// this is all duplicate data. DRY!
//    imageId: string
//    walkSpeedN: number
//    jumpPowerN: number
}

export class ItemPool 
{
    private items = new Map<string, FlexTool>()

    constructor( itemsT : { [k:string]:FlexTool } )
    {
        for( let [k, v] of Object.entries(itemsT) )
        {
            this.set( k as string, v )
            FlexTool.objectify( v )
        }
    }

    get( key: string ) { return this.items.get( key ) }
    set( key: string, item: FlexTool ) { this.items.set( key, item ) }
    has( key: string ) { return this.items.get( key ) ? true: false }

    clear() { this.items.clear() }

    getFromSlot( slot: number ) : [ FlexTool | undefined, string | undefined ]
    {
        let foundItem: FlexTool | undefined = undefined
        let foundKey: string | undefined = undefined
        this.items.forEach( (item,k) =>
        {
            if( item.slotN === slot )
            {
                if( foundItem !== undefined )
                {
                    DebugXL.Error( `Found both ${item.baseDataS} and ${foundItem.baseDataS} in slot ${slot}` )
                }
                foundKey = k
                foundItem = item
            }
        } )
        return [ foundItem, foundKey ]
    }

    getFromEquipSlot( equipSlot: ToolData.EquipSlotEnum ) : [ FlexTool | undefined, string | undefined ]
    {
        let foundItem: FlexTool | undefined = undefined
        let foundKey: string | undefined = undefined
        this.items.forEach( (item,k) =>
        {            
            if( item.equippedB && item.getEquipSlot() === equipSlot )
            {
                if( foundItem !== undefined )
                {
                    DebugXL.Error( `Found both ${item.baseDataS} and ${foundItem.baseDataS} in slot ${equipSlot}` )
                }
                foundKey = k
                foundItem = item
            }
        } )
        return [ foundItem, foundKey ]
    }

    assignToSlot( itemKey: string, slot: number )
    {
        // clear previous item from slot
        let currentItemInSlot = this.getFromSlot( slot )[0]
        if( currentItemInSlot )
        {
            currentItemInSlot.slotN = undefined
        }

        let item = this.get( itemKey )
        if( item )
        {
            item.slotN = slot
        }
    }

    getWornWalkSpeedMul()
    {
        let mul = 1
        this.items.forEach( (v,k)=>
        {
            if( v.equippedB )
            {
                const baseData = ToolData.dataT[ v.baseDataS ]
                if( baseData )
                {
                    mul *= baseData.walkSpeedMulN
                }
            }
        } )
        return mul
    }

    getWornJumpPowerMul()
    {
        let mul = 1
        this.items.forEach( (v,k)=>
        {
            if( v.equippedB )
            {
                const baseData = ToolData.dataT[ v.baseDataS ]
                if( baseData )
                {
                    mul *= baseData.jumpPowerMulN
                }
            }
        } )
        return mul
    }

    forEach( valueKeyFunc: (v: FlexTool, k: string )=>void )
    {
        this.items.forEach( valueKeyFunc )
    }

    delete( itemKey: string )
    {
        this.items.delete( itemKey )
    }

    size()
    {
        return this.items.size()
    }

    countIf( func: (v: FlexTool)=>boolean )
    {
        return this.items.values().filter( func ).size()
    }

    findIf( func: (v: FlexTool)=>boolean )
    {
        for( let [k,v] of Object.entries( this.items ) )
        {
            if( func( v ) )
                return [ v, k ]
        }
        return [ undefined, undefined ]
    }

    static sortItemPairs( items: [string, FlexTool][] )
    {
        table.sort( items, function( a:[string,FlexTool], b:[string,FlexTool])
        {
            let toolA = ToolData.dataT[ a[1].baseDataS ]
            let toolB = ToolData.dataT[ b[1].baseDataS ]
            if( toolA.equipType === toolB.equipType )
            {
                if( toolA.equipType === ToolData.EquipTypeEnum.Armor )
                {
                    DebugXL.Assert( toolA.equipSlot !== undefined )
                    DebugXL.Assert( toolB.equipSlot !== undefined )
                    if( toolA.equipSlot === toolB.equipSlot )
                        return a[1].getLevelRequirement() < b[1].getLevelRequirement()
                    else
                        return toolA.equipSlot! < toolB.equipSlot!
                }
                else
                {
                    return a[1].getLevelRequirement() < b[1].getLevelRequirement()
                }
            }
            else
            {
                return toolA.equipType < toolB.equipType
            }
        } as ()=>boolean )

        return items
    }

    makeSortedList()
    {
        let items = this.items.entries()
        return ItemPool.sortItemPairs( items )
    }

    purgeObsoleteItems()
    {
        // you may have an obsolete item; a lot of players are rocking HelmetWinged's
        for( let [k, flexToolInst] of Object.entries( this.items ))
        {
            if( ToolData.dataT[ flexToolInst.baseDataS ] === undefined )
            {
                DebugXL.Error( `Nonexistent item ${flexToolInst.baseDataS}. Removing.` )
                this.items.delete( k )
            }
        }
    }
}

export abstract class PC implements PCI
{   
    protected itemsT: { [k: string]: FlexTool } | undefined  // retained to accesss persistent data using old system
    protected itemPool: ItemPool
    private toolKeyServerN = 1

    constructor(
        public idS: string,
        //public readableNameS: string,
        //public imageId: string,
        //public walkSpeedN: number,
        //public jumpPowerN: number,        
        _startItems: FlexTool[] )
        {
            this.itemsT = undefined  // just used for persistence in old system
            this.itemPool = new ItemPool({})
            for( let i = 0; i < _startItems.size(); i++ )
            {
                const k: string = 'item' + ( i + 1 )
                let item = ObjectXL.clone( _startItems[i] ) as FlexTool
                this.itemPool.set( k, item )
                let idx = tonumber(k.sub(4))
                DebugXL.Assert( idx !== undefined )
                if( idx )
                {
                    DebugXL.Assert( idx >= 1 )
                    // make sure tool key server starts serving after existing items
                    this.toolKeyServerN = math.max( this.toolKeyServerN, idx+1 )
                }
            }
        }

    static convertFromRemote( rawPCData: PCI )
    {        
        let pc = setmetatable( rawPCData, PC as LuaMetatable<PCI> ) as PC
        DebugXL.Assert( pc.itemsT === undefined )
        setmetatable( pc.itemPool, ItemPool as LuaMetatable<ItemPool> )
        pc.itemPool.forEach( item => FlexTool.objectify(item) )
        return pc
    }

    getClass()
    {
        return this.idS
    }
    
    // hmm. what to do here. going to try inheritance
    getTotalDefense( attackType: string )
    {
        let sum = 0
        this.itemPool.forEach( function( equip, k )
        {
            if( equip.equippedB )
            {
                sum = sum + equip.getMonsterDefense( attackType )  
            }
        } )
        return sum
    }

    getTool( itemKey: string )
    {
        DebugXL.Assert( itemKey.sub( 0, 3 ) === 'item' )
        return this.itemPool.get( itemKey )
    }

    giveTool( flexTool: FlexTool )
    {        
        let key = 'item' + this.toolKeyServerN
        DebugXL.Assert( !this.itemPool.has( key ) )
        this.itemPool.set( key, flexTool )
        this.toolKeyServerN++
        return key        
    }
    
    removeTool( itemKey: string )
    {
        DebugXL.Assert( itemKey.sub( 0, 3 ) === 'item' )
        let item = this.itemPool.get( itemKey )
        this.itemPool.delete( itemKey )
        return item
    }

    countTools()
    {
        return this.itemPool.size()
    }

    // only counts healing potions for display purposes
    countPotions()
    {
        return this.itemPool.countIf( (item)=> item.baseDataS==='Healing' )
    }

    getPossessionKeyFromSlot( slot: number )
    {
        let _key: string | undefined
        this.itemPool.forEach( function( flexTool: FlexTool, key: string )
        {
            if( flexTool.slotN === slot )
            {
                DebugXL.Assert( _key === undefined)
                _key = key
            }
        }) 
        return _key
    }

    getSlotFromPossessionKey( possessionKey: string )
    {
        let flexTool = this.itemPool.get( possessionKey )
        if( flexTool )
        {
            return flexTool.slotN
        }
    }

    static getToolPossessionKey( tool: Tool )
    {
        let possessionKeyValue = tool.FindFirstChild('PossessionKey') as StringValue
        DebugXL.Assert( possessionKeyValue !== undefined )
        if( possessionKeyValue )
        {
            return possessionKeyValue.Value
        }
        return undefined
    }

    static getToolInstanceFromPossessionKey( player: Player, possessionKey: string )
    {
        let playerModel = player.Character
        DebugXL.Assert( playerModel !== undefined )
        if( playerModel )
        {
            let heldTool = playerModel.FindFirstChildWhichIsA('Tool') as Tool
            if( heldTool )
            {
                if( PC.getToolPossessionKey( heldTool )===possessionKey )
                    return heldTool
            }
        }
        let tool = player.FindFirstChild('Backpack')!.GetChildren().find( ( inst )=> PC.getToolPossessionKey( inst as Tool )===possessionKey )
        return tool as Tool
    }    

    giveRandomArmor( hideAccessoriesB: boolean )
    {
        for( let slot of Object.keys( ToolData.EquipSlotEnum ))
        {
            let equipPool = ToolData.dataA.filter( (tool)=> tool.equipSlot === slot )
            let equipIdx = MathXL.RandomInteger( 0, equipPool.size()-1 )
            let equip = equipPool[ equipIdx ]
            let flexTool = new FlexTool( equip.idS, 0, [], undefined, false, false, false, hideAccessoriesB )
            this.giveTool( flexTool )
        }
    }

    equipAvailableArmor()
    {
        let slotUsed = { Torso: false, Legs: false, Head: false }
        
        this.itemPool.forEach( function( item )
        {
            let equipSlot = ToolData.dataT[ item.baseDataS ].equipSlot
            if( equipSlot )
            {
                item.equippedB = !slotUsed[ equipSlot ]
            }
        })      
    }

    // sorts by equip slot and then level to help make decisions about how to equip
    getSortedItems()
    {
        return this.itemPool.makeSortedList()
    }

    getImageId() 
    {
        return PossessionData.dataT[this.idS].imageId
    }

    getWalkSpeed() : number
    {
        return CharacterClasses.classData[this.idS].walkSpeedN
    }

    getJumpPower() : number
    {
        return CharacterClasses.classData[this.idS].jumpPowerN
    }

    abstract getLocalLevel() : number

    abstract getActualLevel() : number

    // not data-driving this so we aren't duplicating data
    abstract getTeam(): Object
}