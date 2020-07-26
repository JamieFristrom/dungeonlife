// felt the need to split quest data up on the client and server so server functions could reside here and include any other server functionality (Inventory)
// that we needed
import { QuestData } from "ReplicatedStorage/TS/QuestData"
import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";

import { Workspace, Teams } from "@rbxts/services"

import * as Inventory from "ServerStorage/Standard/InventoryModule"

import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import { QuestTrackerI } from "ReplicatedStorage/TS/QuestUtility";

export interface QuestServerInfoI
{
    triggerFunc: ( player:Player )=>boolean
    getStartingStatFunc: ( player: Player )=>number
    successFunc: ( player: Player, questKey: string, questTracker: QuestTrackerI )=>boolean 
}

export namespace QuestServerData
{
    function countBlueprints( itemsT: { [k:string]: number } )
    {
        let blueprintSum = 0
        for( let [k, v] of Object.entries( itemsT ))
        {
            if( PossessionData.dataT[ k ].flavor === PossessionData.FlavorEnum.Furnishing )
            {
                blueprintSum += v
            }
        }
        return blueprintSum
    }

    export let dataT : { [k:string]: QuestServerInfoI } =
    {
        ["TutorialBuyBlueprint"]:
        {
            triggerFunc : ( player ) => {
                let prepCountdownObj = Workspace.FindFirstChild('GameManagement')!.FindFirstChild('PreparationCountdown') as NumberValue
                let inventory = Inventory.GetWait( player )
                return prepCountdownObj.Value > 4                 // in the prep phase 
                    && player.Team===Teams.FindFirstChild('Monsters')               // and is a monster
                    && player.Character !== undefined
                    && player.Character.Parent !== undefined
                    && inventory.itemsT["Rubies"] >= 200          // and has enough rubies
                    && inventory.itemsT["MonsterDeaths"] >= 1     // and has died at least once (implies they've made it through a hero phase)
            },
            getStartingStatFunc: ( player: Player ) => {
                let inventory = Inventory.GetWait( player )
                return countBlueprints( inventory.itemsT )
            },
            successFunc : ( player: Player, questKey: string, questTracker: QuestTrackerI ) => {
                let inventory = Inventory.GetWait( player )
                return countBlueprints( inventory.itemsT ) >= QuestData.dataT[ questKey ].statDelta! + questTracker.startingStat
            }
        }
        // ["TutorialBuildChest"]:
        //     {
        //         questMessageKeys : ["TutorialWelcome2", "TutorialDungeonLord"],
        //         successMessageKeys : ["TutorialTreasureChests"],
        //         triggerFunc : ()=>
        //         {
        //         },
        //         successFunc : ()=>{
        //             let myBuildings = Workspace.Building.GetChildren().filter( (child)=>child.creator.Value === localPlayer )
        //             return !myBuildings.isEmpty()
        //         }
        //     },
        // ["QuestKill5"]:
        //     {
        //         questMessageKeys : ["TutorialWelcome2", "TutorialDungeonLord"],
        //         successMessageKeys : ["TutorialTreasureChests"],
        //         successFunc : ()=>{
        //             let myBuildings = Workspace.Building.GetChildren().filter( (child)=>child.creator.Value === localPlayer )
        //             return !myBuildings.isEmpty()
        //         }
        //     }

    }        
}

// validate, make sure entries are in both tables
for( let k of Object.keys( QuestData.dataT ) )
{
    DebugXL.Assert( QuestServerData.dataT[ k ] !== undefined )
}
for( let k of Object.keys( QuestServerData.dataT ) )
{
    DebugXL.Assert( QuestData.dataT[ k ] !== undefined )
}