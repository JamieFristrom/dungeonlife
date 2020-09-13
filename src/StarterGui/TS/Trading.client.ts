
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)

let playerListGui = (script.Parent!.Parent!.WaitForChild("PlayerListGui") as Frame)
let playerListContentsFrame = (playerListGui.WaitForChild("CustomLeaderboard").WaitForChild("Contents") as Frame)

let interactFrame = (playerListGui.WaitForChild("InteractWithPlayerFrame") as Frame)

const tradingEnabledK = false

function showInteractFrame(playerName: string) {
    interactFrame.Visible = true;
    (interactFrame.WaitForChild("Name") as TextLabel).Text = playerName
}

let playerListRows = new Set<Frame>()

function updatePlayerListButtons() {
    for (let child of playerListContentsFrame.GetChildren()) {
        if (child.IsA("Frame")) {
            if (child.Name !== "HeaderRow") {
                if( !playerListRows.has(child)) {
                    playerListRows.add(child)
                    let interactButton = (child.WaitForChild("InteractButton") as TextButton)
                    if( tradingEnabledK ) {
                        interactButton.Visible = true
                        interactButton.MouseButton1Click.Connect(() => { showInteractFrame((child.WaitForChild("Names") as TextLabel).Text) })
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