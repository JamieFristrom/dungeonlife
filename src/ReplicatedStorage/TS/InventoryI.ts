
import { ActiveSkinSetI } from "ReplicatedStorage/TS/SkinTypes";
import { QuestTrackerI } from "ReplicatedStorage/TS/QuestUtility"

export enum ReviewEnum
{
    ThumbsDown = -1,
    NoOpinion = 0,
    ThumbsUp = 1
}


export interface MonsterSettingsI 
{ 
    [k:string]: boolean 
    hideAccessoriesB: boolean 
}


export interface InventoryI
{
    itemsT: { [k:string]: number }
    questsT: Map< string, QuestTrackerI >
    redeemedCodesT: { [k:string]: number }
    activeSkinsT: { monster: ActiveSkinSetI, hero: ActiveSkinSetI }
    settingsT: { monstersT: { [k:string]: MonsterSettingsI } }
    review: ReviewEnum
    testGroups: Map<string,number>
}    

