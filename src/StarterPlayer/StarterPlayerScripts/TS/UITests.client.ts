
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.Name)

import { ReplicatedStorage, Workspace, Players, Teams, StarterGui } from "@rbxts/services"

import PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import { DisplayStats } from "ReplicatedStorage/Standard/DisplayStats"

import { ClickableUI } from "ReplicatedStorage/TS/ClickableUI"
import { Enhancements } from "ReplicatedStorage/TS/EnhancementsTS"
import { GuiXL } from "ReplicatedStorage/TS/GuiXLTS"
import { InstanceUtility } from "ReplicatedStorage/TS/InstanceUtility"
import { Localize } from "ReplicatedStorage/TS/Localize"
import { SkinTypes } from "ReplicatedStorage/TS/SkinTypes"
import { SocketI } from "ReplicatedStorage/TS/SocketI"
import { StructureClient } from "ReplicatedStorage/TS/StructureClient"
import { TestUtility } from "ReplicatedStorage/TS/TestUtility"
import { ToolData } from "ReplicatedStorage/TS/ToolDataTS"

const runClientTests: boolean = true
if (runClientTests && game.GetService("RunService").IsStudio()) {
    
    DebugXL.logW(LogArea.Test, "UI Tests started")

    // make sure werewolf on leaderboard looks like werewolf
    {
        const customLeaderboard = StarterGui.WaitForChild("PlayerListGui").WaitForChild("CustomLeaderboard").Clone()
        const contentRowTemplate = StarterGui.WaitForChild("PlayerListGui").WaitForChild("ContentRowTemplate").Clone()        
        const playerFolder = new Instance("Folder")
        playerFolder.Name = "Players"
        const player1 = new Instance("Folder", playerFolder)
        player1.Name = "Player1"
        const leaderstats = new Instance("Folder", player1)
        leaderstats.Name = "leaderstats"
        const classObjVal = new Instance("StringValue", leaderstats)
        classObjVal.Name = "Class"
        classObjVal.Value = "Werewolf"
        const level = new Instance("StringValue", leaderstats)
        level.Name = "Level"
        level.Value = "1"
        // here I'm just guessing
        const other = new Instance("StringValue", leaderstats)
        other.Name = "VIP"
        other.Value = "VIP"
        // sadly this hack won't work if we want to switch UpdateStats to typescript
        const pretendCharacter = new Instance("Model", player1)
        pretendCharacter.Name = "Character"
        const werewolfHead = new Instance("Part", pretendCharacter)
        werewolfHead.Name = "Werewolf Head"  // what would happen if somebody has a roblox avatar accessory named werewolf head?

        DisplayStats.UpdateStats( playerFolder, customLeaderboard, contentRowTemplate )
        let contents = (customLeaderboard.FindFirstChild("Contents") as Frame|undefined)!
        let targetRow = contents.FindFirstChild("UserPlayer1")!
        TestUtility.assertMatching( "Werewolf", (targetRow.FindFirstChild("Class") as TextLabel|undefined)!.Text )
        TestUtility.assertNotMatching( "", (targetRow.FindFirstChild("Level") as TextLabel|undefined)!.Text )
    }

    // make sure stealth werewolf on leaderboard doesn't
    {
        const customLeaderboard = StarterGui.WaitForChild("PlayerListGui").WaitForChild("CustomLeaderboard").Clone()
        const contentRowTemplate = StarterGui.WaitForChild("PlayerListGui").WaitForChild("ContentRowTemplate").Clone()        
        const playerFolder = new Instance("Folder")
        playerFolder.Name = "Players"
        const player1 = new Instance("Folder", playerFolder)
        player1.Name = "Player1"
        const leaderstats = new Instance("Folder", player1)
        leaderstats.Name = "leaderstats"
        const classObjVal = new Instance("StringValue", leaderstats)
        classObjVal.Name = "Class"
        classObjVal.Value = "Werewolf"
        const level = new Instance("StringValue", leaderstats)
        level.Name = "Level"
        level.Value = "1"
        // here I'm just guessing
        const other = new Instance("StringValue", leaderstats)
        other.Name = "VIP"
        other.Value = "VIP"
        // sadly this hack won't work if we want to switch UpdateStats to typescript
        const pretendCharacter = new Instance("Model", player1)
        pretendCharacter.Name = "Character"
        // doesn't have a werewolf head; must not be a werewolf

        DisplayStats.UpdateStats( playerFolder, customLeaderboard, contentRowTemplate )
        let contents = (customLeaderboard.FindFirstChild("Contents") as Frame|undefined)!
        let targetRow = contents.FindFirstChild("UserPlayer1")!
        let resultClass = (targetRow.FindFirstChild("Class") as TextLabel|undefined)!.Text
        let resultLevel = (targetRow.FindFirstChild("Level") as TextLabel|undefined)!.Text
        let numericLevel = tonumber(resultLevel)
        TestUtility.assertTrue( resultClass==="Mage"||resultClass==="Rogue"||resultClass==="Warrior"||resultClass==="Barbarian"||resultClass==="Priest", "Stealth werewolf valid class")
        TestUtility.assertNotMatching( numericLevel && numericLevel>=1, "Stealth werewolf level at least 1" )
    }
    
    let testKeys = [
        { k: "IntroMessage" },
        { k: "strN" },
        { k: "dexN" },
        { k: "willN" },
        { k: "conN" },
        { k: "DeepestFloor", args: [666] }
    ]

    const trimmedResult = Localize.trim("  hoo")
    const trimmedStr = trimmedResult[0]
    TestUtility.assertTrue(trimmedStr === "hoo")
    TestUtility.assertTrue(Localize.trim("  hoo  ")[0] === "hoo")
    TestUtility.assertTrue(Localize.trim("hoo  ")[0] === "hoo")
    DebugXL.logD(LogArea.Test, Localize.squish("  hoo  ")[0])
    DebugXL.logD(LogArea.Test, Localize.squish("and   nae  nae")[0])
    TestUtility.assertTrue(Localize.squish("  hoo  ")[0] === " hoo ")
    TestUtility.assertTrue(Localize.squish("and   nae  nae")[0] === "and nae nae")

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
        TestUtility.assertTrue(shadowLabel !== undefined)
        TestUtility.assertTrue(shadowLabel.IsA("TextLabel"))
        TestUtility.assertTrue(shadowLabel.Parent !== undefined)
        TestUtility.assertTrue(shadowLabel.Font === labelToBeShadowed.Font)
        TestUtility.assertTrue(shadowLabel.TextSize === labelToBeShadowed.TextSize)
        TestUtility.assertTrue(shadowLabel.AbsolutePosition.X === labelToBeShadowed.AbsolutePosition.X + 5)
        TestUtility.assertTrue(shadowLabel.AbsolutePosition.Y === labelToBeShadowed.AbsolutePosition.Y + 5)
        TestUtility.assertTrue(shadowLabel.Text === labelToBeShadowed.Text)
        labelToBeShadowed.Text = "Hot monkey brains"
        TestUtility.assertTrue(shadowLabel.Text === "Hot monkey brains")
        labelToBeShadowed.TextTransparency = 0.5
        TestUtility.assertTrue(shadowLabel.TextTransparency === 0.5)
    }

    // test whether chest shows hint
    function testThatTeamCanClick(clickableName: string, team: Team) {
        let clickable = (ReplicatedStorage.FindFirstChild("Shared Instances")!.FindFirstChild("Placement Storage")!.FindFirstChild(clickableName) as Model).Clone()
        clickable.Parent = (Workspace.FindFirstChild("Building") as Folder|undefined)
        const clickableOrigin = (clickable.FindFirstChild("Origin") as BasePart|undefined)
        for (; Players.LocalPlayer.Character === undefined;) {
            wait()
        }
        for (; Players.LocalPlayer.Character.PrimaryPart === undefined;) {
            wait()
        }
        clickable.SetPrimaryPartCFrame(Players.LocalPlayer.Character!.GetPrimaryPartCFrame())
        ClickableUI.updateClickableUIs(team, Players.LocalPlayer.Character)
        const chestGui = (clickableOrigin!.FindFirstChild("ChestGui") as BillboardGui|undefined)
        TestUtility.assertTrue(chestGui !== undefined)
        if (chestGui) {
            TestUtility.assertTrue(chestGui.Enabled)
            const instructions = (chestGui.FindFirstChild("Instructions") as TextLabel|undefined)
            TestUtility.assertTrue(instructions !== undefined)
            // won"t actually check text since it should be magically localized
        }
    }

    testThatTeamCanClick("Chest", (Teams.FindFirstChild("Heroes") as Team|undefined)!)
    testThatTeamCanClick("WeaponsRack", (Teams.FindFirstChild("Monsters") as Team|undefined)!)

    class FakeSocket implements SocketI {
        sendMessage(player: Player, ...args: unknown[]): unknown {
            return this.callback()
        }

        constructor(private callback: () => unknown) {
        }
    }

    // only reupdate currency on build failure because those fields get destroyed by GUI reset when you build a spawn
    {
        let furnishGui = (Players.LocalPlayer.WaitForChild("PlayerGui").WaitForChild("FurnishGui") as ScreenGui).Clone()
        const result = StructureClient.tellServerToBuildAndUpdateUI(
            500,
            PossessionData.dataT["SpawnWerewolf"] as PossessionData.BlueprintDatumI,
            0,
            furnishGui,
            ReplicatedStorage.WaitForChild("Shared Instances").WaitForChild("Placement Storage").WaitForChild("SpawnWerewolf") as Model,
            new FakeSocket(() => { 
                let buildPointsObject = InstanceUtility.findOrCreateChild<NumberValue>(Players.LocalPlayer, "BuildPointsTotal", "NumberValue")
                buildPointsObject.Value = 333
                return "SpawnWerewolf"
            })
        )
        // success: reupdate shouldn't have happened, so build points should read calculated value
        TestUtility.assertTrue(result === 150)
        TestUtility.assertTrue((furnishGui.WaitForChild("Currencies").WaitForChild("BuildPoints").WaitForChild("CurrencyNameAndCount") as TextLabel).Text === "Dungeon Points: 150")
    }

    {
        let furnishGui = (Players.LocalPlayer.WaitForChild("PlayerGui").WaitForChild("FurnishGui") as ScreenGui).Clone()
        furnishGui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui")
        const result = StructureClient.tellServerToBuildAndUpdateUI(
            500,
            PossessionData.dataT["SpawnWerewolf"] as PossessionData.BlueprintDatumI,
            0,
            furnishGui,
            ReplicatedStorage.WaitForChild("Shared Instances").WaitForChild("Placement Storage").WaitForChild("SpawnWerewolf") as Model,
            new FakeSocket(() => {
                (Players.LocalPlayer.FindFirstChild("BuildPointsTotal") as NumberValue|undefined)!.Value = 333
                return undefined
            })
        )
        // failure: reupdate should have happened, so build points should read the value we set it to in the fake 
        TestUtility.assertTrue(result === 500)  // this should be original build points - result build points
        // this should be the possibly unrelated build points value the server tells us:
        TestUtility.assertTrue((furnishGui.WaitForChild("Currencies").WaitForChild("BuildPoints").WaitForChild("CurrencyNameAndCount") as TextLabel).Text === "Dungeon Points: 333")
    }

    // if respawn, furnishGui will be unparented - don't modify
    {
        let furnishGui = (Players.LocalPlayer.WaitForChild("PlayerGui").WaitForChild("FurnishGui") as ScreenGui).Clone()
        const result = StructureClient.tellServerToBuildAndUpdateUI(
            500,
            PossessionData.dataT["SpawnWerewolf"] as PossessionData.BlueprintDatumI,
            0,
            furnishGui,
            ReplicatedStorage.WaitForChild("Shared Instances").WaitForChild("Placement Storage").WaitForChild("SpawnWerewolf") as Model,
            new FakeSocket(() => {
                (Players.LocalPlayer.FindFirstChild("BuildPointsTotal") as NumberValue|undefined)!.Value = 333
                return undefined
            })
        )
        // failure: reupdate should have happened, so build points should read the value we set it to in the fake 
        TestUtility.assertTrue(result === 500)  // this should be original build points - result build points
        // because our interface is unparented we know better than to try updating it - what's now in our CurrencyNameAndCount does not matter.
    }

    DebugXL.logW(LogArea.Test, "UI Tests finished")
}