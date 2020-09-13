
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import * as InputXL from "ReplicatedStorage/Standard/InputXL"
import { GuiService, Workspace, Teams, Players } from "@rbxts/services";

const chooseClassFrame = script.Parent!.Parent!.WaitForChild("HeroGui").WaitForChild("ChooseClass") as Frame

const heroGuiFrame = (script.Parent!.Parent!.WaitForChild("HeroGui") as Frame)
//print( "ChooseHeroScript: HeroGui available" )
const chooseHeroFrame = (heroGuiFrame.WaitForChild("ChooseHero") as Frame)
//print( "ChooseHeroScript: ChooseHero available" )
const playerGui = (Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui)
//print( "ChooseHeroScript: PlayerGui available" )
const characterSheetGui = (playerGui.WaitForChild("CharacterSheetGui") as ScreenGui)
const characterSheet = (characterSheetGui.WaitForChild("CharacterSheet") as Frame)
const possessionsGui = (playerGui.WaitForChild("PossessionsGui") as ScreenGui)
const possessionsFrame = (possessionsGui.WaitForChild("PossessionsFrame") as Frame)

const readyButton = (script.Parent!.Parent!.WaitForChild("Ready") as TextButton)

const mainRE = (Workspace.WaitForChild("Signals").WaitForChild("MainRE") as RemoteEvent)
const heroPrepCountdownObj = (Players.LocalPlayer.WaitForChild("HeroRespawnCountdown") as NumberValue)

chooseClassFrame.GetPropertyChangedSignal("Visible").Connect(() => {
    if (InputXL.UsingGamepad()) {
        GuiService.SelectedObject = (chooseClassFrame.WaitForChild("Grid").WaitForChild("Hero1").WaitForChild("Choose") as GuiObject)
    }
})

const gameManagementFolder = (Workspace.WaitForChild("GameManagement") as Folder)
const gameState = (gameManagementFolder.WaitForChild("GameState") as StringValue)
const preperationCountdownObj = (gameManagementFolder.WaitForChild("PreparationCountdown") as NumberValue)

const heroTeam = (Teams.WaitForChild("Heroes") as Team)

DebugXL.logI(LogArea.GameManagement, 'HeroGui wait complete')

gameState.Changed.Connect((newValue) => {
    if (newValue === "Lobby") {
        if (Players.LocalPlayer.Team === (Teams.FindFirstChild("Heroes") as Team|undefined)) {
            // if I had a character survive from the previous level go to the prepare screen
            const character = Players.LocalPlayer.Character
            if (character) {
                if (character.Parent) {
                    const humanoid = (character.FindFirstChild("Humanoid") as Humanoid|undefined)
                    if (humanoid) {
                        if (humanoid.Health > 0) {
                            DebugXL.logI(LogArea.GameManagement, "Lobby, time to re-prepare")
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
