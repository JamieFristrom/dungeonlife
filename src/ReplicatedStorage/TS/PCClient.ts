print( script.GetFullName() + " executed" )
import { PC, PCI } from "ReplicatedStorage/TS/PCTS"
import { Workspace } from "@rbxts/services";
import { Hero } from "ReplicatedStorage/TS/HeroTS"

let hotbarRE = Workspace.WaitForChild('Signals').WaitForChild('HotbarRE') as RemoteEvent


export namespace PCClient 
{

   
//    pc:  undefined,// PC.objectify( RemoteXL.RemoteFuncCarefulInvokeServerWait( hotbarRF, 5, "GetPCData") as unknown ),
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
            return PC.convertFromRemote( pcData as unknown as PC )
        }
    }

    //let pcDataRaw = hotbarRF.InvokeServer( "GetPCData") as { [k:string]:unknown }
    export let pc: PC | undefined
    //print( "PC client aquired initial pc data" )

    let defaultConnection = hotbarRE.OnClientEvent.Connect( function( ...args: unknown[] )
    {
        //print( "hotbarre called")
        let funcName = args[0] as string
        let pcData = args[1] as PCI | Hero
        if( funcName === "Refresh" )
        {            
            PCClient.pc = virtuallyObjectify( pcData as unknown as {[k:string]:number})
            //print( "client pc refreshed")
        }
    })

    export function pcUpdatedConnect( func: ( pc: PC )=>void )
    {
	    defaultConnection.Disconnect()
        return hotbarRE.OnClientEvent.Connect( function( ...args: unknown[] )
        {
            let funcName = args[0] as string
            let pcData = args[1] as PC
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



