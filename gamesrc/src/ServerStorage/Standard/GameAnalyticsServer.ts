import { HttpXL } from "ServerStorage/TS/HttpXL"
import { Analytics } from "ServerStorage/TS/Analytics";
import { Workspace, Players } from "@rbxts/services";
import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";

// put in standard/ because we're replacing lua module
namespace GameAnalyticsServer
{
    export function RecordTransaction( player: Player, price: number, thing: string )
    {
        let preparationCountdownObj = Workspace.FindFirstChild('GameManagement')!.FindFirstChild('PreparationCountdown') as NumberValue
        let team = player.Team
        DebugXL.Assert( team !== undefined )
        if( !team ) return
        let playerState = team.Name + ':' + (( preparationCountdownObj.Value > 0 ) ? "Prep" : "Play" )
        Analytics.ReportEvent( player, 'transaction', thing, playerState, price )
    }

    export function RecordResource( player: Player, amount: number, flowType: string, currency: string, itemType: string, itemId: string ) 
    {
        HttpXL.spawnJSONRequest( 'analytics', 'POST',  {
            playerKey: player.UserId,
            category: 'resourceanalytics',            
            action: flowType,
            label: currency,
            itemType: itemId,
            value: amount,
            time: os.time(),
            sessionKey: Analytics.getSessionKey( player )
        })
    }

    export function RecordDesignEvent( player: Player, eventIdS: string, optionalValue?: number, optionalBinSize?: number, optionalBinLabel?:string )
    {   
        let split = eventIdS.split( ':' )
        Analytics.ReportEvent( player, split[0], split[1], split[2], optionalValue )
    }


}

export = GameAnalyticsServer