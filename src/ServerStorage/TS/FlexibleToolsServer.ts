import {ToolData} from 'ReplicatedStorage/TS/ToolDataTS'

// thinking about things which can hold weapons
// thinking about characters which can be cpu or player controlled
// currently, players hold weapons
// what about the shop? how does that work?
// heroes have shops


export interface FlexToolAccessor 
{
    flexToolInst: ToolData.ToolDatumI,
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
}
