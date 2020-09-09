
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)

let playerListGui = script.Parent!.Parent!.WaitForChild<Frame>("PlayerListGui")
let playerListContentsFrame = playerListGui.WaitForChild<Frame>("CustomLeaderboard").WaitForChild<Frame>("Contents")

let interactFrame = playerListGui.WaitForChild<Frame>("InteractWithPlayerFrame")

const tradingEnabledK = false

function showInteractFrame(playerName: string) {
    interactFrame.Visible = true
    interactFrame.WaitForChild<TextLabel>("Name").Text = playerName
}

let playerListRows = new Set<Frame>()

function updatePlayerListButtons() {
    for (let child of playerListContentsFrame.GetChildren()) {
        if (child.IsA("Frame")) {
            if (child.Name !== "HeaderRow") {
                if( !playerListRows.has(child)) {
                    playerListRows.add(child)
                    let interactButton = child.WaitForChild<TextButton>("InteractButton")
                    if( tradingEnabledK ) {
                        interactButton.Visible = true
                        interactButton.MouseButton1Click.Connect(() => { showInteractFrame(child.WaitForChild<TextLabel>("Names").Text) })
                    }
                    else {
                        interactButton.Visible = false
                    }
                }
            }
        }
    }
}

for(;;) {
    wait(1)
    updatePlayerListButtons()
}