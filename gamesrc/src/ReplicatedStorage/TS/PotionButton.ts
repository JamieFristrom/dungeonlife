
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI(LogArea.Executed, script.Name)

import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { CharacterRecordI } from "ReplicatedStorage/TS/CharacterRecord"
import { Workspace, Players, Teams } from "@rbxts/services"

type Character = Model

const signals = (Workspace.WaitForChild('Signals') as Folder)
const heroREvent = (signals.WaitForChild('HeroesRE') as RemoteEvent)

export interface PotionButtonConfigurationI {
    funcName: string,
    itemName: string,
    warningFunc: (character: Character) => boolean,
    potionFrame: Frame
}

export class PotionButton {
    guiFrame: Frame
    guiButton: TextButton
    imageLabel: ImageLabel
    title: TextLabel
    uiArrow: ImageLabel

    constructor(public potionButtonConfiguration: PotionButtonConfigurationI) {
        const playerGui = (Players.LocalPlayer!.WaitForChild('PlayerGui') as PlayerGui)
        const uiAudio = (playerGui.WaitForChild('Audio') as ScreenGui)
        const uiClick = (uiAudio.WaitForChild('UIClick') as Sound)

        this.guiFrame = (potionButtonConfiguration.potionFrame.WaitForChild('Item') as Frame)
        this.guiButton = (this.guiFrame.WaitForChild('Button') as TextButton)
        this.imageLabel = (this.guiFrame.WaitForChild('ImageLabel') as ImageLabel)
        this.title = (this.guiFrame.WaitForChild('Title') as TextLabel)
        this.uiArrow = (this.guiFrame.WaitForChild('UIArrow') as ImageLabel)
        this.guiButton.MouseButton1Click.Connect(() => {
            uiClick.Play()
            heroREvent.FireServer(potionButtonConfiguration.funcName)
        })
    }

    refresh(character: Character, pcData: CharacterRecordI) {
        // wishlist - monsters could have potions someday. that day has just gotten closer with this refactor
        this.potionButtonConfiguration.potionFrame.Visible = pcData instanceof Hero
        this.guiFrame.Visible = pcData instanceof Hero
        if (pcData) {
            const potionsN = pcData.countBaseDataQuantity(this.potionButtonConfiguration.itemName)
            if (potionsN > 1) {
                this.imageLabel.Visible = true
                this.title.Visible = true
                this.title.Text = potionsN + " left"
                this.guiFrame.Visible = true
            }
            else if (potionsN === 1) {
                this.imageLabel.Visible = true
                this.title.Visible = false
                this.guiFrame.Visible = true
            }
            else {
                this.guiFrame.Visible = false
            }
        }
        this.uiArrow.Visible = this.potionButtonConfiguration.warningFunc(character)
    }
}