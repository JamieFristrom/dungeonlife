
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)

import { SkinTypes } from "ReplicatedStorage/TS/SkinTypes"
import { Enhancements } from "ReplicatedStorage/TS/EnhancementsTS"
import { Localize } from "ReplicatedStorage/TS/Localize"
import { ToolData } from "ReplicatedStorage/TS/ToolDataTS"

import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"
import { GuiXL } from "ReplicatedStorage/TS/GuiXLTS";

import { ReplicatedStorage, Workspace, Players, Teams } from '@rbxts/services'

const runClientTests: boolean = true
if (runClientTests && game.GetService("RunService").IsStudio()) {
    DebugXL.logW(LogArea.Test, "UI Tests started")

    let testKeys = [
        { k: "IntroMessage" },
        { k: "strN" },
        { k: "dexN" },
        { k: "willN" },
        { k: "conN" },
        { k: "DeepestFloor", args: [666] }
    ]

    DebugXL.Assert(Localize.trim("  hoo") === "hoo")
    DebugXL.Assert(Localize.trim("  hoo  ") === "hoo")
    DebugXL.Assert(Localize.trim("hoo  ") === "hoo")
    DebugXL.logD(LogArea.Test, Localize.squish("  hoo  "))
    DebugXL.logD(LogArea.Test, Localize.squish("and   nae  nae"))
    DebugXL.Assert(Localize.squish("  hoo  ") === " hoo ")
    DebugXL.Assert(Localize.squish("and   nae  nae") === "and nae nae")

    DebugXL.logI(LogArea.Test, "Test translations")
    testKeys.forEach(function (key) {
        let newStr = ""
        let [status] = pcall(function () {
            newStr = Localize.formatByKey(key.k, key.args)
        })
        if (!status) {
            DebugXL.Error("Failed to translate key " + key.k)
        }
        DebugXL.logD(LogArea.Test, key.k + ": " + newStr)
    })

    for (let k of Object.keys(SkinTypes)) {
        let v = SkinTypes[k]
        DebugXL.logD(LogArea.Test, k + "," + v.readableNameS)
    }

    let baseNameS = Localize.formatByKey("ToolNameFormat", {
        tooltype: "toolType",
        level: 6,
        adjective1: "adjectivey",
        adjective2: "adverby",
        suffix: "of this and that"
    });
    DebugXL.logD(LogArea.Test, baseNameS)

    PossessionData.dataA.forEach((element) => {
        if (element.idS)
            DebugXL.logD(LogArea.Test, element.idS + "," + Localize.getName(element))
    })

    for (let k of Object.keys(Enhancements.enhancementFlavorInfos)) {
        let enhancement = Enhancements.enhancementFlavorInfos[k]
        enhancement.prefixes.forEach((word) => DebugXL.logD(LogArea.Test, (word)))
        enhancement.suffixes.forEach((word) => DebugXL.logD(LogArea.Test, (word)))
    }

    ToolData.dataA.forEach((baseData) => {
        // if( false )  // activeSkinsT[ baseData.skinType ] )  // just using to reskin image now
        //     return PossessionData.dataT[ activeSkinsT[ baseData.skinType ] ].readableNameS
        // else
        // {
        if (baseData.namePerLevel) {
            for (let i = 0; i < 10; i++) {
                let v = baseData.namePerLevel[i]
                if (v) {
                    Localize.formatByKey(v)
                    //                DebugXL.logD(LogArea.Test,( v + " Gender" )          
                }
            }
        }
        else {
            Localize.formatByKey(baseData.readableNameS)
            //        DebugXL.logD(LogArea.Test,( baseData.readableNameS + " Gender")
        }
    })

    // test shadow text
    {
        let labelToBeShadowed = new Instance("TextLabel")
        let shadowLabel = GuiXL.shadowText(labelToBeShadowed, 5)
        DebugXL.Assert(shadowLabel !== undefined)
        DebugXL.Assert(shadowLabel.IsA("TextLabel"))
        DebugXL.Assert(shadowLabel.Parent !== undefined)
        DebugXL.Assert(shadowLabel.Font === labelToBeShadowed.Font)
        DebugXL.Assert(shadowLabel.TextSize === labelToBeShadowed.TextSize)
        DebugXL.Assert(shadowLabel.AbsolutePosition.X === labelToBeShadowed.AbsolutePosition.X + 5)
        DebugXL.Assert(shadowLabel.AbsolutePosition.Y === labelToBeShadowed.AbsolutePosition.Y + 5)
        DebugXL.Assert(shadowLabel.Text === labelToBeShadowed.Text)
        labelToBeShadowed.Text = "Hot monkey brains"
        DebugXL.Assert(shadowLabel.Text === "Hot monkey brains")
        labelToBeShadowed.TextTransparency = 0.5
        DebugXL.Assert(shadowLabel.TextTransparency === 0.5)
    }

    // test whether chest shows hint
    function testThatTeamCanClick(clickableName: string, team: Team) {
        let clickable = ReplicatedStorage.FindFirstChild<Folder>("Shared Instances")!.FindFirstChild<Folder>("Placement Storage")!.FindFirstChild<Model>(clickableName)!.Clone()
        clickable.Parent = Workspace.FindFirstChild<Folder>("Building")
        const chestOrigin = clickable.FindFirstChild<BasePart>("Origin")
        chestOrigin!.WaitForChild<BillboardGui>("ChestGui")
        for (; Players.LocalPlayer.Character === undefined;) {
            wait()
        }
        for (; Players.LocalPlayer.Character.PrimaryPart === undefined;) {
            wait()
        }
        clickable.SetPrimaryPartCFrame(Players.LocalPlayer.Character!.GetPrimaryPartCFrame())
        const oldTeam = Players.LocalPlayer.Team  // ugh; here's where we want that player proxy
        Players.LocalPlayer.Team = team
        wait(0.5)
        const chestGui = chestOrigin!.FindFirstChild<BillboardGui>("ChestGui")
        DebugXL.Assert(chestGui !== undefined)
        if (chestGui) {
            DebugXL.Assert(chestGui.Enabled)
            const instructions = chestGui.FindFirstChild<TextLabel>("Instructions")
            DebugXL.Assert(instructions !== undefined)
            // won't actually check text since it should be magically localized
        }
        Players.LocalPlayer.Team = oldTeam
    }

    testThatTeamCanClick("Chest", Teams.FindFirstChild<Team>("Heroes")!)
    testThatTeamCanClick("WeaponsRack", Teams.FindFirstChild<Team>("Monsters")!)

    DebugXL.logW(LogArea.Test, "UI Tests finished")
}