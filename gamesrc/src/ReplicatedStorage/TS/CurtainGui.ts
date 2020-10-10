
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea, LogLevel } from 'ReplicatedStorage/TS/DebugXLTS'
import { Players } from '@rbxts/services'
DebugXL.logI(LogArea.Executed, script.GetFullName())

// Also see CurtainGui.client.ts which has not been encapsulated into this and should some day. Wishlist fix.

export class Curtain {
    getTransparency() {
        return this.curtainElement.BackgroundTransparency
    }

    constructor(private curtainElement: Frame) {
    }
}

const playerGui = (Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui)
const curtainGui = (playerGui.WaitForChild("CurtainGui") as ScreenGui)
const curtainFrame = (curtainGui.WaitForChild("Curtain") as Frame)
let curtain = new Curtain(curtainFrame)

export function getRuntimeCurtain() {
    return curtain
}