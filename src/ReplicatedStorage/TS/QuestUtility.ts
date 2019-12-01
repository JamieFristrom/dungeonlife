import { InventoryI } from "ReplicatedStorage/TS/InventoryI"

export interface QuestInfoI
{
    questMessageKeys: string[]
    successMessageKeys: string[]
    statName?: string
    statDelta?: number
}

export enum QuestStatus
{
    Unopen = 0,
    Incomplete = 1,
    Complete = 2
}

export interface QuestTrackerI
{
    startingStat: number
    status: QuestStatus    // state, not functional, could theoretically conflict with reality, but easiest way to pass completion information to the client
}

export namespace QuestUtility
{
    export function getQuestStatus( inventory: InventoryI, questKey: string )
    {
        let quest = inventory.questsT.get( questKey )
        return quest ?  quest.status : QuestStatus.Unopen
    }
}