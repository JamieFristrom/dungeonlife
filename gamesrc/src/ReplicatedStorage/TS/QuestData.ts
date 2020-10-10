import { QuestInfoI } from "ReplicatedStorage/TS/QuestUtility"
import { Workspace, Players, Teams } from "@rbxts/services";

export namespace QuestData
{
    export let dataT : { [k:string]: QuestInfoI } =
    {
        ["TutorialBuyBlueprint"]:
        {
            questMessageKeys : ["TutorialStore", "TutorialBlueprintsCrate"],
            successMessageKeys : ["TutorialBlueprintCount"],   
            statDelta: 1        
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