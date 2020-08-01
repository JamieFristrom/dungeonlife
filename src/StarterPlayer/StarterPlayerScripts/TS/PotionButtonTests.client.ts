
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI(LogArea.Executed, script.Name)

import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { PotionButton } from "ReplicatedStorage/TS/PotionButton"
import { ReplicatedStorage, Players } from "@rbxts/services"
import { Monster } from "ReplicatedStorage/TS/Monster"
import { Hero } from "ReplicatedStorage/TS/HeroTS"

type Character = Model

const manaPotionFrame = Players.LocalPlayer!.WaitForChild<PlayerGui>("PlayerGui").WaitForChild<ScreenGui>("NoResetGui").WaitForChild<Frame>("PotionbarR")
const manaPotionItemFrame = manaPotionFrame.WaitForChild<Frame>("Item")

const testManaPotionButton = new PotionButton({
    funcName: "TakeBestManaPotion",
    itemName: "Mana",
    warningFunc: (character: Character) => {
        const manaValue = character.FindFirstChild<NumberValue>("ManaValue")
        const maxManaValue = character.FindFirstChild<NumberValue>("MaxManaValue")
        if (manaValue && maxManaValue && manaValue.Value < maxManaValue.Value * 0.33)
            return true
        return false
    },
    potionFrame: manaPotionFrame
})

const animationDummy = ReplicatedStorage.WaitForChild<Folder>("TestObjects").WaitForChild<Character>("AnimationDummy")

const monsterRecord = new Monster("Orc", [], 1)

testManaPotionButton.refresh(animationDummy, monsterRecord)

// one or the other is fine
DebugXL.Assert(!manaPotionFrame.Visible || !manaPotionItemFrame.Visible)

const heroWithPotRecord = new Hero("Warrior", {
    strN: 1,
    dexN: 1,
    willN: 1,
    conN: 1,
    experienceN: 1,
    goldN: 1,
    deepestDungeonLevelN: 1,
    totalTimeN: 1,
}, [new FlexTool("Mana", 1, [])])

testManaPotionButton.refresh(animationDummy, heroWithPotRecord)

DebugXL.Assert(manaPotionFrame.Visible)
DebugXL.Assert(manaPotionItemFrame.Visible)

const heroRecord = new Hero("Warrior", {
    strN: 1,
    dexN: 1,
    willN: 1,
    conN: 1,
    experienceN: 1,
    goldN: 1,
    deepestDungeonLevelN: 1,
    totalTimeN: 1,
}, [])

testManaPotionButton.refresh(animationDummy, heroRecord)

DebugXL.Assert(!manaPotionFrame.Visible || !manaPotionItemFrame.Visible)


