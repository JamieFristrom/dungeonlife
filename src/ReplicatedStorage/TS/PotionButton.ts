
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI('Executed', script.Name)

import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { Workspace, Players, Teams } from "@rbxts/services"

type Character = Model

const playerGui = Players.LocalPlayer!.WaitForChild<PlayerGui>('PlayerGui')
const uiAudio = playerGui.WaitForChild<ScreenGui>('Audio')
const uiClick = uiAudio.WaitForChild<Sound>('UIClick')

const signals = Workspace.WaitForChild<Folder>('Signals')
const heroREvent = signals.WaitForChild<RemoteEvent>('HeroesRE')

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
        this.guiFrame = potionButtonConfiguration.potionFrame.WaitForChild<Frame>('Item')
        this.guiButton = this.guiFrame.WaitForChild<TextButton>('Button')
        this.imageLabel = this.guiFrame.WaitForChild<ImageLabel>('ImageLabel')
        this.title = this.guiFrame.WaitForChild<TextLabel>('Title')
        this.uiArrow = this.guiFrame.WaitForChild<ImageLabel>('UIArrow')
        this.guiButton.MouseButton1Click.Connect(() => {
            uiClick.Play()
            heroREvent.FireServer(potionButtonConfiguration.funcName)
        })
    }

    refresh(character: Character, pcData: CharacterRecord) {
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