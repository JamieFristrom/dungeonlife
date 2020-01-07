import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
import { FlexToolI, FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'
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

export abstract class PC implements PCI
{   
    protected itemsT: Map<string, FlexTool > // { [k: string]: FlexTool | undefined }
    private toolKeyServerN = 1

    constructor(
        public idS: string,
        //public readableNameS: string,
        //public imageId: string,
        //public walkSpeedN: number,
        //public jumpPowerN: number,        
        _startItems: FlexToolI[] )
        {
            this.itemsT = new Map< string, FlexTool >()
            for( let i = 0; i < _startItems.size(); i++ )
            {
                const k: string = 'item' + i
                let item = ObjectXL.clone( _startItems[i] ) as FlexTool
                this.itemsT.set( k, item )
                let idx = tonumber(k.sub(4))
                DebugXL.Assert( idx !== undefined )
                if( idx )
                {
                    DebugXL.Assert( idx >= 1 )
                    this.toolKeyServerN = math.max( this.toolKeyServerN, idx+1 )
                }
            }
            PC.objectifyTools( this )
        }

    static objectify( rawPCData: PCI )
    {        
        let pc = setmetatable( rawPCData, PC as LuaMetatable<PCI> ) as PC
        PC.objectifyTools(pc);
        return pc
    }

    private static objectifyTools(pc: PC) {
        pc.itemsT.forEach( item => FlexTool.objectify( item ) )

    }

    getClass()
    {
        return this.idS
    }
    
    // hmm. what to do here. going to try inheritance
    getTotalDefense( attackType: string )
    {
        let sum = 0
        this.itemsT.forEach( function( equip, k )
        {
            if( equip.equippedB )
            {
                sum = sum + equip.getMonsterDefense( attackType )  
            }
        } )
        return sum
        /*
        // lua version
        local sum = 0
        for _, equip in pairs( defenderDataT.itemsT ) do
            if equip.equippedB then
                sum = sum + equip:getDefense( attackType, heroActualLevel ) -- FlexEquipUtility:GetDefense( equip, attackType )
            end
        end
        return sum */
    }

    getTool( itemKey: string )
    {
        DebugXL.Assert( itemKey.sub( 0, 3 ) === 'item' )
        return this.itemsT.get( itemKey )
    }

    giveTool( flexTool: FlexTool )
    {        
        let key = 'item' + this.toolKeyServerN
        DebugXL.Assert( !this.itemsT.has( key ) )
        this.itemsT.set( key, flexTool )
        this.toolKeyServerN++
        return key        
    }
    
    removeTool( itemKey: string )
    {
        DebugXL.Assert( itemKey.sub( 0, 3 ) === 'item' )
        let item = this.itemsT.get( itemKey )
        this.itemsT.delete( itemKey )
        return item
    }

    countTools()
    {
        return this.itemsT.size()
    }

    // only counts healing potions for display purposes
    countPotions()
    {
        let potions = this.itemsT.values().filter( (item)=> item.baseDataS === 'Healing')
        return potions.size()
    }

    getPossessionKeyFromSlot( slot: number )
    {
        let _key: string | undefined
        this.itemsT.forEach( function( flexTool: FlexTool, key: string )
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
        let flexTool = this.itemsT.get( possessionKey )
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
        
        this.itemsT.forEach( function( item )
        {
            let equipSlot = ToolData.dataT[ item.baseDataS ].equipSlot
            if( equipSlot )
            {
                item.equippedB = !slotUsed[ equipSlot ]
            }
        })      
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

    // sorts by equip slot and then level to help make decisions about how to equip
    getSortedItems()
    {
        let items = this.itemsT.entries()
        return PC.sortItemPairs( items )
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