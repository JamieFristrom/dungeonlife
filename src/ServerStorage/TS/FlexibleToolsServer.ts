import {FlexToolI} from 'ReplicatedStorage/TS/FlexToolTS'
import {ToolData} from 'ReplicatedStorage/TS/ToolDataTS'

export interface FlexToolAccessor 
{
    flexToolInst: ToolData.ToolDatumI,
    player: Player,            // this is what we need to broaden to include CPU players
    possessionsKey: string     // which tool in player's inventory it is
}

export namespace FlexibleToolServer
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
