import { Workspace } from "@rbxts/services";

import { QuestData } from "ReplicatedStorage/TS/QuestData"
import { QuestServerData } from "ServerStorage/TS/QuestServerData"
import { MessageServer } from "ServerStorage/TS/MessageServer"

import * as Inventory from "ServerStorage/Standard/InventoryModule"
import { QuestStatus } from "ReplicatedStorage/TS/QuestUtility";

let inventoryRE = Workspace.FindFirstChild('Signals')!.FindFirstChild('InventoryRE') as RemoteEvent

export namespace QuestService
{
    export function openQuest( player: Player, questKey: string )
    {
        let myInventoryStore = Inventory.GetInventoryStoreWait( player )
        if( !myInventoryStore ) return
        let myInventory = myInventoryStore.Get()
        if( !myInventory ) return
        // do nothing if already open
        if( !myInventory.questsT.has( questKey ) )
        {
            let quest = QuestData.dataT[ questKey ] 
            let startingStat = QuestServerData.dataT[ questKey ].getStartingStatFunc( player )

            myInventory.questsT.set( questKey,
                { 
                    startingStat: startingStat, 
                    status: QuestStatus.Incomplete 
                } )
            myInventoryStore.Set( myInventory )
            inventoryRE.FireClient( player, "Update", myInventory )

            // queue messages to that player. quest messages get in your face
            quest.questMessageKeys.forEach( msg => MessageServer.PostMessageByKey( player, msg, true, 0.00001, true ))
        }
    }

    export function closeQuest( player: Player, questKey: string )
    {
        let myInventoryStore = Inventory.GetInventoryStoreWait( player )
        if( !myInventoryStore ) return
        let myInventory = myInventoryStore.Get()
        if( !myInventory ) return
        let questTracker = myInventory.questsT.get( questKey )
        if( questTracker )
            if( questTracker.status !== QuestStatus.Complete )
            {
                questTracker.status = QuestStatus.Complete
                myInventoryStore.Set( myInventory )
                inventoryRE.FireClient( player, "Update", myInventory )

                QuestData.dataT[ questKey ].successMessageKeys.forEach( msg => MessageServer.PostMessageByKey( player, msg, true, 0.00001, true ))
            }
    }
}

