print( script.GetFullName() + " executed" )
import { CharacterRecord, CharacterRecordI } from "ReplicatedStorage/TS/CharacterRecord"
import { Workspace } from "@rbxts/services";
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { CharacterClass } from "./CharacterClasses";

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
        else
        {
            //print( "Local player pcdata is monster")
            return CharacterRecord.convertFromRemote( pcData as unknown as CharacterRecord )
        }
    }

    //let pcDataRaw = hotbarRF.InvokeServer( "GetPCData") as { [k:string]:unknown }
    export let pc: CharacterRecord | undefined
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

    export function pcUpdatedConnect( func: ( pc: CharacterRecord )=>void )
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



