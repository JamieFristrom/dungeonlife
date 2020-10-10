import { HttpService } from "@rbxts/services"
import { Config } from "ReplicatedStorage/TS/Config"
import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"


export namespace HttpXL
{
    export function spawnJSONRequest( category: string, method: 'POST' | 'GET' | 'DELETE', message: object )
    {
        if( Config.telemetryEnabled ) 
        {
            let body = HttpService.JSONEncode( message )
        
            spawn( ()=> {
                let [ success, err ] = pcall( ()=> {
                    HttpService.RequestAsync({
                        Url: Config.telemetryServerURL + '/' + category,
                        Method: method,
                        Headers: {
                            ['Content-Type']: 'application/json',
                        },
                        Body: body
                    })
                })
                if( !success )
                    DebugXL.Error( "spawnJSONRequest failed: " + " " + category + ": " + err + " - " + tostring( body ) )
            })
        }
    }
}