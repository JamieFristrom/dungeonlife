
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { InventoryI, MonsterSettingsI, ReviewEnum } from "ReplicatedStorage/TS/InventoryI"
import { QuestTrackerI } from "ReplicatedStorage/TS/QuestUtility"
import { ActiveSkins, SkinTypeEnum } from "ReplicatedStorage/TS/SkinTypes";
import { CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses"

export class InventoryMock implements InventoryI {
    itemsT: { [k: string]: number }
    questsT: Map<string, QuestTrackerI>
    redeemedCodesT: { [k: string]: number }
    activeSkinsT: ActiveSkins
    settingsT: { monstersT: { [k: string]: MonsterSettingsI } }
    review: ReviewEnum
    testGroups: Map<string, number>

    constructor() {
        this.itemsT = {}
        this.questsT = new Map<string, QuestTrackerI>()
        this.redeemedCodesT = {}
        this.activeSkinsT = { monster: new Map<SkinTypeEnum, string>(), hero: new Map<SkinTypeEnum, string>() }
        this.settingsT = { monstersT: {} }
        for (const monsterKey of Object.keys(CharacterClasses.monsterStats)) {
            this.settingsT.monstersT[monsterKey] = { hideAccessoriesB: undefined }
        }
        this.review = ReviewEnum.NoOpinion
        this.testGroups = new Map<string, number>()
        this.itemsT["GearSlots"] = 15
        this.itemsT["Tutorial"] = 3
    }
}