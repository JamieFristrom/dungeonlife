print( script.GetFullName() + " executed" )
import { CharacterRecord, CharacterRecordI } from "ReplicatedStorage/TS/CharacterRecord"
import { Workspace } from "@rbxts/services";
import { Hero } from "./HeroTS"
import { Monster } from "./Monster";
import { DebugXL, LogArea } from "./DebugXLTS";

let hotbarRE = Workspace.WaitForChild('Signals').WaitForChild('HotbarRE') as RemoteEvent


export namespace PCClient 
{

   
//    pc:  undefined,// CharacterRecord.objectify( RemoteXL.RemoteFuncCarefulInvokeServerWait( hotbarRF, 5, "GetPCData") as unknown ),
    //refreshWait: function() {}

    // well, this is ugly
    function virtuallyObjectify( pcData: {[k:string]:unknown} )
    {
        if( pcData.statsT )
        {
            print( "Local player pcdata is hero")
            let pc = Hero.convertFromRemote( pcData as unknown as Hero )
            pc.getActualLevel();  // just for test
            //print( pc )
            //print( PCClient )
            return pc
        }
        else if( pcData.monsterLevel )
        {
            //print( "Local player pcdata is monster")
            return Monster.convertFromRemote( pcData as unknown as Monster )
        }
        else {
            DebugXL.logE(LogArea.Network, "Corrupt incoming character record")
            DebugXL.Dump(pcData, LogArea.Network)
            return CharacterRecord.convertFromRemote( pcData as unknown as CharacterRecordI )
        }
    }

    //let pcDataRaw = hotbarRF.InvokeServer( "GetPCData") as { [k:string]:unknown }
    export let pc: CharacterRecordI
    //print( "CharacterRecord client aquired initial pc data" )

    let defaultConnection = hotbarRE.OnClientEvent.Connect( function( ...args: unknown[] )
    {
        //print( "hotbarre called")
        let funcName = args[0] as string
        let pcData = args[1] as CharacterRecordI | Hero
        if( funcName === "Refresh" )
        {            
            PCClient.pc = virtuallyObjectify( pcData as unknown as {[k:string]:number})
            //print( "client pc refreshed")
        }
    })

    export function pcUpdatedConnect( func: ( pc: CharacterRecordI )=>void )
    {
	    defaultConnection.Disconnect()
        return hotbarRE.OnClientEvent.Connect( function( ...args: unknown[] )
        {
            let funcName = args[0] as string
            let pcData = args[1] as CharacterRecord
            if( funcName === "Refresh" )
            {
                // if we connect multiple functions it just means that pcData gets overwritten several times
                PCClient.pc = virtuallyObjectify( pcData as unknown as {[k:string]:unknown} )
                //print( "Objectified")
                func( PCClient.pc )
            }
        } )
    }
}



