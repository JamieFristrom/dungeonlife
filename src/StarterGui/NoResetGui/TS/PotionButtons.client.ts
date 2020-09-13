
import { Players } from "@rbxts/services"
import { PotionButton } from "ReplicatedStorage/TS/PotionButton"
import { PCClient } from "ReplicatedStorage/TS/PCClient"

type Character = Model

let potionButtonL = new PotionButton({
    funcName: "TakeBestHealthPotion",
    itemName: "Healing",
    warningFunc: (character: Character) => {
        const humanoid = (character.FindFirstChild("Humanoid") as Humanoid|undefined)
        if (humanoid && humanoid.Health < humanoid.MaxHealth * 0.33 && humanoid.Health > 0)
            return true
        return false
    },
    potionFrame: (script.Parent!.Parent!.WaitForChild('PotionbarL') as Frame)
})

let potionButtonR = new PotionButton({
    funcName: "TakeBestManaPotion",
    itemName: "Mana",
    warningFunc: (character: Character) => {
        const manaValue = (character.FindFirstChild('ManaValue') as NumberValue|undefined)
        const maxManaValue = (character.FindFirstChild('MaxManaValue') as NumberValue|undefined)
        if (manaValue && maxManaValue && manaValue.Value < maxManaValue.Value * 0.33)
            return true
        return false
    },
    potionFrame: (script.Parent!.Parent!.WaitForChild('PotionbarR') as Frame)
})


PCClient.pcUpdatedConnect((pcData) => {
    const character = Players.LocalPlayer.Character
    if (character) {
        potionButtonL.refresh(character, pcData)
        potionButtonR.refresh(character, pcData)
    }
})
