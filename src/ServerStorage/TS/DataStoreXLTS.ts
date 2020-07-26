/*
--
-- DataStoreXL
--
-- More robust wrapper for Roblox datastores when doing stuff that doesn't need to be *that* reliable
-- 
*/
import { DataStoreService } from "@rbxts/services"

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"


const datastoreRetriesN = 3

export class DataStoreXL
{
    dataStore?: GlobalDataStore

    static DataStoreRetry<T>( dataStoreFunction: ()=>T | undefined ) 
    {
        let success = true
        let data: T | undefined = undefined
        let errorMsg = ""
        for( let tries=0 ;tries < datastoreRetriesN; tries++)
        {
            let [ success, errorMsg ] = pcall(function() { data = dataStoreFunction() })
            if( success ) 
            {
                break
            }
            else
            {
                warn( "Datastore failure: "+errorMsg ) 
                wait(1) 
            }
        }
        if( ! success )
        {
            DebugXL.Error('Could not access DataStore! Warn players that their data might not get saved!')
        }
        return data
    }

    constructor( datastoreName: string )
    {
        this.dataStore = DataStoreXL.DataStoreRetry( ()=> DataStoreService.GetDataStore( datastoreName ) )
    }

    GetAsync( keyS: string ) // using Roblox's naming even though it makes no sense; this function blocks
    {
        if( ! this.dataStore ) { return undefined }
        let _dataStore = this.dataStore
        return DataStoreXL.DataStoreRetry( function() {
            return _dataStore.GetAsync( keyS )
        })
    }

    SetAsync( keyS: string, value: unknown )  // using Roblox's naming even though it makes no sense; this function blocks
    {
        if( ! this.dataStore ) { return }
        let _dataStore = this.dataStore
        DataStoreXL.DataStoreRetry( function() {
            return _dataStore.SetAsync( keyS, value )
        })
    }

    IncrementAsync( keyS: string, value: number ) // using Roblox's naming even though it makes no sense; this function blocks
    {
        if( ! this.dataStore ) { return }
        let _dataStore = this.dataStore
        DataStoreXL.DataStoreRetry( function() {
            return _dataStore.IncrementAsync( keyS, value )
        })
    }
}

