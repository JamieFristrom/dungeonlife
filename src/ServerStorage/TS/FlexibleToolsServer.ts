print('FlexibleToolServer.ts executed')
import { ServerStorage } from '@rbxts/services';

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS';
import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'
import { ToolData } from 'ReplicatedStorage/TS/ToolDataTS';
print('FlexibleToolServer: ReplicatedStorage/TS imports succesful')

import { Enhancements } from 'ReplicatedStorage/TS/EnhancementsTS';
import { ValueHelper } from 'ReplicatedStorage/TS/ValueHelper';

import { CreateToolParamsI } from 'ServerStorage/TS/CreateToolParamsI'

import * as PossessionData from 'ReplicatedStorage/Standard/PossessionDataStd';
print('FlexibleToolServer: imports succesful')


// thinking about things which can hold weapons
// thinking about characters which can be cpu or player controlled
// currently, players hold weapons
// what about the shop? how does that work?
// heroes have shops
const ToolsFolder = ServerStorage.WaitForChild<Folder>('Tools',10)!
DebugXL.Assert( ToolsFolder !== undefined )


export interface FlexToolAccessor 
{
    flexToolInst: FlexTool,
    player: Player,            // this is what we need to broaden to include CPU players
    possessionsKey: string     // which tool in player's inventory it is
}


export namespace FlexibleToolsServer
{
    
    let serverToolDataT = new Map<number, FlexToolAccessor>()

    export function getFlexToolAccessor( toolId : number ) 
    {
        return serverToolDataT.get( toolId );
    }

    export function setFlexToolInst( toolId: number, fta: FlexToolAccessor )
    {
        serverToolDataT.set( toolId, fta )
    }
    
    let toolIdServer = 0

    function serveToolId()
    {
        return toolIdServer++
    }

    export function getFlexTool( toolObj: Tool )
    {
        const toolId = toolObj.FindFirstChild<NumberValue>('ToolId')
        if( !toolId )
        {
            DebugXL.Error(`Can't find ToolId for ${toolObj.GetFullName()}`)
            return FlexTool.nullTool
        }
        return getFlexToolFromId( toolId.Value )
    }

    export function getFlexToolFromId( toolId: number )
    {
        const fta = getFlexToolAccessor( toolId ) 
        DebugXL.Assert( fta !== undefined )
        if( fta ) 
            return fta.flexToolInst
        return FlexTool.nullTool
    }

    export function getToolBaseData( toolObj: Tool )
    {
        const flexTool = getFlexTool( toolObj )
        return getFlexToolBaseData( flexTool )
    }

    export function getFlexToolBaseData( flexTool: FlexTool )
    {
        return ToolData.dataT[ flexTool.baseDataS ]
    }

    export function createTool( params: CreateToolParamsI )
    {
        const flexTool = params.toolInstanceDatumT
        const destinationPlayer = params.destinationPlayer
        const activeSkins = params.activeSkinsT
        const itemPoolKey = params.possessionsKey
        
        print( `Creating ${flexTool.baseDataS} for ${destinationPlayer.Name}` )
        
        const toolId = serveToolId()
        FlexibleToolsServer.setFlexToolInst( toolId, { flexToolInst: flexTool, player: destinationPlayer, possessionsKey: itemPoolKey })
        
        // if tool doesn't have enhancements add an empty array so we don't have to constantly check if enhancementsA is nil
        if (!flexTool.enhancementsA) flexTool.enhancementsA = []
        
        const toolBaseDatum = ToolData.dataT[ flexTool.baseDataS ]
        if (!toolBaseDatum) DebugXL.Error( `Unable to find possession ${flexTool.baseDataS}` ) 
        
        let baseToolId = toolBaseDatum.baseToolS
        DebugXL.Assert( baseToolId !== undefined )
        if( baseToolId )
        {
            let textureSwapId = undefined
            if (!toolBaseDatum.skinType) 
            {
                DebugXL.Error( `${toolBaseDatum.idS} has no skinType`)
            }
            else
            {
                if( activeSkins[ toolBaseDatum.skinType ])
                {
                    const reskin = PossessionData.dataT[ activeSkins[ toolBaseDatum.skinType ]] as PossessionData.SkinDatumI
                    if( reskin )
                    {
                        baseToolId = reskin.baseToolS
                        textureSwapId = reskin.textureSwapId
                    }
                }
            }
             
            const toolTemplate = ToolsFolder.FindFirstChild<Tool>( baseToolId )
            DebugXL.Assert( toolTemplate !== undefined )
            if( toolTemplate )
            {
                const newToolInstance = toolTemplate.Clone() as Tool
                FlexTool.retexture( newToolInstance, textureSwapId )
                let nonDefaultFX = false
                for( let i=0; i<flexTool.enhancementsA.size(); i++ )
                {
                    const enhancement = flexTool.enhancementsA[i]
                    const enhancementFlavorDatum = Enhancements.enhancementFlavorInfos[ enhancement.flavorS ] // FlexibleTools.enhancementFlavorsT[ enhancement.flavorS ]

                    // enable enhancement related effects
                    for( let descendent of newToolInstance.GetDescendants() )
                    {
                        if( descendent.Name === 'FX'+enhancement.flavorS )
                        {
                            if( descendent.IsA('Script') )
                            {
                                const descendentScript = descendent as Script
                                descendent.Disabled = false
                            }
                            else if( descendent.IsA('ParticleEmitter') || descendent.IsA('Beam') || descendent.IsA('Light') || descendent.IsA('Fire'))
                            {
                                // now *that's* a new idea to me. Any of these things have Enabled properties, so...
                                const descendentEmitter = descendent as ParticleEmitter | Beam | Light | Fire
                                descendentEmitter.Enabled = true
                                nonDefaultFX = true
                            }
                            else
                            {
                                DebugXL.Error( `Unsupported enhancement fx type ${descendent.ClassName} on ${descendent.GetFullName()}` )
                            }
                        }
                    }
                }

                if( nonDefaultFX )
                {
                    // remove default effects
                    for( let descendent of newToolInstance.GetDescendants() )
                    {
                        if( descendent.Name === 'FXdefault' )
                        {
                            if( descendent.IsA('ParticleEmitter') || descendent.IsA('Beam') || descendent.IsA('Light') || descendent.IsA('Fire'))
                            {
                                let effect = descendent as ParticleEmitter | Beam | Light | Fire
                                effect.Enabled = false
                            }
                            else
                            {
                                DebugXL.Error( `Unsupported enhancement fx type ${descendent.ClassName} on ${descendent.GetFullName()}` )
                            }
                            // delibaretely not enabling something already enabled because I think there's a perf hit
                            // and who knows, there may be tools with disabled default fx that were there for temp or testing
                        }
                    }
                }

                newToolInstance.CanBeDropped = false
        
                // attach tool id to tool 
                ValueHelper.AddNumberValue( newToolInstance, 'ToolId', toolId )

                // here's some data we attach to the tool itself to make it easy to look up on the client
                // attach inventory slot so we can find it on the client
                ValueHelper.AddStringValue( newToolInstance, 'PossessionKey', itemPoolKey )

                // we'll need to be able to adjust these for heroes with buffs. fixme
                if( toolBaseDatum.rangeN )  // unintuitively, ranged weapons are the weapons that *don't* have range - their range is infinite
                    ValueHelper.AddNumberValue( newToolInstance, 'Range', toolBaseDatum.rangeN )

                ValueHelper.AddNumberValue( newToolInstance, 'Cooldown', flexTool.getCooldown() )
                ValueHelper.AddNumberValue( newToolInstance, 'ManaCost', flexTool.getManaCost() )
                ValueHelper.AddNumberValue( newToolInstance, 'WalkSpeedMul', toolBaseDatum.walkSpeedMulN )

                DebugXL.Assert( destinationPlayer !== undefined )

                if( destinationPlayer )
                {
                    // we're using Roblox's backpack as a holding space for tools to combat lag; if we equip a weapon that exists on
                    // the server
                    newToolInstance.Parent = destinationPlayer.FindFirstChild<Backpack>('Backpack')
                }

                return newToolInstance
            }
        }
        return undefined
    }

}