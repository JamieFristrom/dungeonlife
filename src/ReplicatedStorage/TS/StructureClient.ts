
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Players } from '@rbxts/services'

import PossessionData from 'ReplicatedStorage/Standard/PossessionDataStd'

import { PlayerUtility } from './PlayerUtility'
import { BlueprintUtility } from './BlueprintUtility'

import { SocketI } from './SocketI'

export namespace StructureClient {
    export function tellServerToBuildAndUpdateUI(
        buildPoints: number,
        possessionDatum: PossessionData.BlueprintDatumI,
        cardinalRotation: number,
        furnishGui: ScreenGui,
        ghostInstance: Model,
        furnishRF: SocketI) {


        const playerGui = Players.LocalPlayer.WaitForChild<PlayerGui>("PlayerGui")
        const audio = playerGui.WaitForChild<ScreenGui>("Audio")
        const furnishSuccessSound = audio.WaitForChild<Sound>("FurnishSuccess")

        let remainingBuildPoints = buildPoints
        // make cost snappy ;  earning Dungeon Points will send a pretty traveller
        const currenciesBuildPointsFrame = furnishGui.WaitForChild<Frame>("Currencies").WaitForChild<Frame>("BuildPoints")
        if (possessionDatum.buildCostN > 0) {
            remainingBuildPoints = buildPoints - possessionDatum.buildCostN
            // fixme: do these need localizing?
            // think of these as predicting the final values
            currenciesBuildPointsFrame.WaitForChild<TextLabel>("CurrencyNameAndCount").Text = "Dungeon Points: " + remainingBuildPoints
            furnishGui.WaitForChild<Frame>("ActiveFurnishingListFrame").WaitForChild<TextLabel>("BuildPoints").Text = "Dungeon Points: " + remainingBuildPoints
            furnishGui.WaitForChild<Frame>("ActiveCategoryListFrame").WaitForChild<TextLabel>("BuildPoints").Text = "Dungeon Points: " + remainingBuildPoints
        }
        furnishSuccessSound.Play()
        const name = BlueprintUtility.getPossessionName(ghostInstance)
        const cf = ghostInstance.GetPrimaryPartCFrame().p
        // but then it's hard to place a bunch in a row. At least we have the audio!
        // this is a delaying function.
        DebugXL.logD(LogArea.UI, "currenciesBuildPointsFrame is " + currenciesBuildPointsFrame.GetFullName() + " before server invoke")
        const success = furnishRF.sendMessage(undefined, name, cf, cardinalRotation)
        DebugXL.logD(LogArea.UI, "Structure placement returned " + tostring(success))
        // by the time message returns we may have respawned as a new creature with new UI; our old UI has had its links broken
        if (furnishGui.Parent) {
            // another thing that could race is building multiple items in succession, so let's just use the latest build points reported by the
            // replicating object
            let serverAuthBuildPoints = PlayerUtility.getBuildPoints(Players.LocalPlayer)
            // it used to return success/failure; now we ignore it and update UI either way
            // don't know why, though, when we get here theres often no BuildPoints; maybe it happens when the player builds
            // and immediately quits?
            DebugXL.logD(LogArea.UI, "currenciesBuildPointsFrame is " + currenciesBuildPointsFrame.GetFullName() + " after server invoke")
            const currencyNameAndCount = currenciesBuildPointsFrame.FindFirstChild<TextLabel>("CurrencyNameAndCount")
            if (currencyNameAndCount) {
                currencyNameAndCount.Text = "Dungeon Points: " + serverAuthBuildPoints
            }
            else {
                DebugXL.logW(LogArea.UI, "currencyNameAndCount is misssing")
            }
            furnishGui.WaitForChild<Frame>("ActiveFurnishingListFrame").WaitForChild<TextLabel>("BuildPoints").Text = "Dungeon Points: " + serverAuthBuildPoints
            furnishGui.WaitForChild<Frame>("ActiveCategoryListFrame").WaitForChild<TextLabel>("BuildPoints").Text = "Dungeon Points: " + serverAuthBuildPoints
        }
        return success ? remainingBuildPoints : buildPoints
    }
}