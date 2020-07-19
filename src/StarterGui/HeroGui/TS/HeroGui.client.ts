
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import * as InputXL from "ReplicatedStorage/Standard/InputXL"
import { GuiService, Workspace, Teams, Players } from "@rbxts/services";

const chooseClassFrame = script.Parent!.Parent!.WaitForChild("HeroGui").WaitForChild("ChooseClass") as Frame

const heroGuiFrame = script.Parent!.Parent!.WaitForChild<Frame>("HeroGui")
//print( "ChooseHeroScript: HeroGui available" )
const chooseHeroFrame = heroGuiFrame.WaitForChild<Frame>("ChooseHero")
//print( "ChooseHeroScript: ChooseHero available" )
const playerGui = Players.LocalPlayer.WaitForChild<PlayerGui>("PlayerGui")
//print( "ChooseHeroScript: PlayerGui available" )
const characterSheetGui = playerGui.WaitForChild<ScreenGui>("CharacterSheetGui")
const characterSheet = characterSheetGui.WaitForChild<Frame>("CharacterSheet")
const possessionsGui = playerGui.WaitForChild<ScreenGui>("PossessionsGui")
const possessionsFrame = possessionsGui.WaitForChild<Frame>("PossessionsFrame")

const readyButton = script.Parent!.Parent!.WaitForChild<TextButton>("Ready")

const mainRE = Workspace.WaitForChild<Folder>("Signals").WaitForChild<RemoteEvent>("MainRE")
const heroPrepCountdownObj = Players.LocalPlayer.WaitForChild<NumberValue>("HeroRespawnCountdown")

chooseClassFrame.GetPropertyChangedSignal("Visible").Connect(() => {
    if (InputXL.UsingGamepad()) {
        GuiService.SelectedObject = chooseClassFrame.WaitForChild("Grid").WaitForChild("Hero1").WaitForChild<GuiObject>("Choose")
    }
})

const gameManagementFolder = Workspace.WaitForChild<Folder>("GameManagement")
const gameState = gameManagementFolder.WaitForChild<StringValue>("GameState")
const preperationCountdownObj = gameManagementFolder.WaitForChild<NumberValue>("PreparationCountdown")

const heroTeam = Teams.WaitForChild<Team>("Heroes")

DebugXL.logI('GameManagement', 'HeroGui wait complete')

gameState.Changed.Connect((newValue) => {
    if (newValue === "Lobby") {
        if (Players.LocalPlayer.Team === Teams.FindFirstChild<Team>("Heroes")) {
            // if I had a character survive from the previous level go to the prepare screen
            const character = Players.LocalPlayer.Character
            if (character) {
                if (character.Parent) {
                    const humanoid = character.FindFirstChild<Humanoid>("Humanoid")
                    if (humanoid) {
                        if (humanoid.Health > 0) {
                            DebugXL.logI("GameManagement", "Lobby, time to re-prepare")
                            chooseHeroFrame.Visible = false
                            heroGuiFrame.Visible = false
                            characterSheet.Visible = true
                            possessionsFrame.Visible = true
                        }
                    }
                }
            }
        }
    }
})

readyButton.MouseButton1Click.Connect(() => {
    mainRE.FireServer("SignalReady")
})

for (; ;) {
    wait(0.1)
    readyButton.Visible = (!Players.LocalPlayer.Character || !Players.LocalPlayer.Character.Parent) &&
        (Players.LocalPlayer.Team === heroTeam) &&
        (preperationCountdownObj.Value <= 0) &&
        (heroPrepCountdownObj.Value <= 0) &&
        (!chooseHeroFrame.Visible && !chooseClassFrame.Visible)
}
