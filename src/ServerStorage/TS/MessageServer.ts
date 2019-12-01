import { Workspace } from "@rbxts/services";
import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS";

let messageGuiXL = Workspace.FindFirstChild('Standard')!.FindFirstChild('MessageGuiXL')!
let messageRE = messageGuiXL.FindFirstChild('MessageRE') as RemoteEvent
let queryBoxRE = messageGuiXL.FindFirstChild('QueryBoxRE') as RemoteEvent

export namespace MessageServer
{    
    let queryResponses = new Map<number,string>()
    let queryIdServer = 1

    queryBoxRE.OnServerEvent.Connect( ( player: Player, ...args: unknown[] )=>{
        let queryId = args[0] as number
        let response = args[1] as string
        queryResponses.set( queryId, response )
    })

    export function PostMessageByKey( player: Player, _messageKeyS: string, _needsAckB: boolean, _displayDelay: number, _modalB: boolean, _answer1S?: string, _answer2S?: string )
    {
        messageRE.FireClient( player, _messageKeyS, undefined, _needsAckB, _displayDelay, _modalB, _answer1S, _answer2S )
    }

    export function PostParameterizedMessage( player: Player, _messageKeyS: string, _args: unknown[] | { [k:string]:unknown }, _needsAckB: boolean, _displayDelay: number, _modalB: boolean, _answer1S?: string, _answer2S?: string )
    {
        messageRE.FireClient( player, _messageKeyS, _args, _needsAckB, _displayDelay, _modalB, _answer1S, _answer2S )
    }

    export function QueryBox( player: Player, _messageKeyS: string ,_args: unknown[] | { [k:string]:unknown }, _needsAckB: boolean, _displayDelay: number, _modalB: boolean, _answer1S?: string, _answer2S?: string )
    {
        let myQueryId = queryIdServer++
        queryBoxRE.FireClient( player, myQueryId, _messageKeyS, _args, _needsAckB, _displayDelay, _modalB, _answer1S, _answer2S )     
        let timestamp = tick()   
        let response = undefined
        for(;;)
        {
            wait(0.11)
            response = queryResponses.get( myQueryId )
            if( !response )
            {
                // for debugging purposes - did our message *make* it to the client at all?
                if( tick() > timestamp + 10 )
                {
                    DebugXL.Error( "QueryBox took too long to acknowledge event" )
                    break
                }
            }
            else if( queryResponses.get( myQueryId ) === 'received' )  // it would be a better design if I didn't conflate the code with the message but whatev
            {
                if( tick() > timestamp + 120 )
                {
                    DebugXL.Error( "QueryBox player took too long to answer" )
                    break
                }
            }
            else
            {
                break
            }
        }
        queryResponses.delete(myQueryId)
        return response
    }
}
