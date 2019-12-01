import { Players } from "@rbxts/services"

import { QuestServerData, QuestServerInfoI } from "ServerStorage/TS/QuestServerData"

import { QuestService } from "ServerStorage/TS/QuestService"

import * as Inventory from "ServerStorage/Standard/InventoryModule"
import { QuestStatus } from "ReplicatedStorage/TS/QuestUtility";
import { QuestData } from "ReplicatedStorage/TS/QuestData";


spawn( ()=>
{
    for(;;)
    {
        wait(1)
        Players.GetPlayers().forEach( player =>
        {
            let inventory = Inventory.GetWait( player )
            if( inventory ) {
                inventory.questsT.forEach( ( questTracker, questKey )=>
                {
                    let quest = QuestServerData.dataT[ questKey ]
                    if( questTracker.status !== QuestStatus.Complete )
                        if( quest.successFunc( player, questKey, questTracker ))
                        {
                            QuestService.closeQuest( player, questKey )
                        }
                } )
                for( let [questKey, quest] of Object.entries( QuestServerData.dataT ) as [ string, QuestServerInfoI ][])
                {
                    if( quest.triggerFunc( player ))
                    {
                        QuestService.openQuest( player, questKey )
                    }
                }
            }
        } )
    }
} )