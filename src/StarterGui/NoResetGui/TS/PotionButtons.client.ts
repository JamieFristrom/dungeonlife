
import { Players } from "@rbxts/services"
import { PotionButton } from "ReplicatedStorage/TS/PotionButton"
import { PCClient } from "ReplicatedStorage/TS/PCClient"

type Character = Model

let potionButtonL = new PotionButton({
    funcName: "TakeBestHealthPotion",
    itemName: "Healing",
    warningFunc: (character: Character) => {
        const humanoid = character.FindFirstChild<Humanoid>("Humanoid")
        if (humanoid && humanoid.Health < humanoid.MaxHealth * 0.33 && humanoid.Health > 0)
            return true
        return false
    },
    potionFrame: script.Parent!.Parent!.WaitForChild<Frame>('PotionbarL')
})

let potionButtonR = new PotionButton({
    funcName: "TakeBestManaPotion",
    itemName: "Mana",
    warningFunc: (character: Character) => {
        const manaValue = character.FindFirstChild<NumberValue>('ManaValue')
        const maxManaValue = character.FindFirstChild<NumberValue>('MaxManaValue')
        if (manaValue && maxManaValue && manaValue.Value < maxManaValue.Value * 0.33)
            return true
        return false
    },
    potionFrame: script.Parent!.Parent!.WaitForChild<Frame>('PotionbarR')
})


PCClient.pcUpdatedConnect((pcData) => {
    const character = Players.LocalPlayer.Character
    if (character) {
        potionButtonL.refresh(character, pcData)
        potionButtonR.refresh(character, pcData)
    }
})
