
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { RunService, Teams, Players, Workspace, ReplicatedStorage } from "@rbxts/services"

import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { Hero } from "ReplicatedStorage/TS/HeroTS";
import { Monster } from "ReplicatedStorage/TS/Monster"
import { ModelUtility } from "ReplicatedStorage/TS/ModelUtility";

if (RunService.IsStudio()) {
    // make sure nothing unanchored
    for (let descendant of Workspace.GetDescendants()) {
        if (descendant.IsA("BasePart"))
            if (!descendant.Anchored) {
                DebugXL.logW(LogArea.Parts, descendant.GetFullName() + " is not anchored")
            }
    }

    // test getting cframe of a bad model
    let errorMessage = ""
    const modelNoPrimaryPart = ReplicatedStorage.WaitForChild<Folder>("TestObjects").WaitForChild<Model>("ModelNoPrimaryPart")
    DebugXL.catchErrors((message) => {
        errorMessage = message
    })
    const cframe = ModelUtility.getPrimaryPartCFrameSafe(modelNoPrimaryPart)
    DebugXL.stopCatchingErrors()
    DebugXL.Assert(cframe !== undefined)
    DebugXL.Assert(cframe.p === new Vector3(0, 0, 0))
    DebugXL.Assert(errorMessage === "ReplicatedStorage.TestObjects.ModelNoPrimaryPart is missing its PrimaryPart")

    // test updating an obsolete broken hero
    const rawHeroData = {
        statsT: {
            strN: 11,  //// means if you draw a level 3 weapon you have a choice between putting in strength or con when you hit level 2
            dexN: 10,
            conN: 14,
            willN: 10,
            experienceN: 0,
            goldN: 0,
            deepestDungeonLevelN: 1,
            totalTimeN: 0
        },
        idS: "Warrior",
        readableNameS: "Warrior",
        imageId: "blahblah",
        walkSpeedN: 10,
        jumpPowerN: 10,
        badges: []
    }
    DebugXL.catchErrors((message) => {
        errorMessage = message
    })
    const convertedHero = Hero.convertFromPersistent(rawHeroData, 3, "TestHeroName")
    DebugXL.stopCatchingErrors()
    DebugXL.Assert(errorMessage.find("had neither gearPool nor itemsT") !== undefined)
    DebugXL.Assert(convertedHero.gearPool !== undefined)
    DebugXL.Assert(convertedHero.gearPool.size() === 0)

    // place to put tests. why is it empty 
    let heroes = Teams.WaitForChild<Team>("Heroes")

    // just so we can step in debugger, not a test-case type test which would require creating fake players...  which we can totally do, huh.
    // NOTE THIS TEST DOESN"T RUN UNTIL A HERO IS PRESENT
    wait(1)
    while (heroes.GetPlayers().size() === 0) wait(1)

    // test associating a hero with player
    let heroPlayer = Players.GetChildren()[0] as Player
    let fakePlayerMap = new Map<Player, CharacterRecord>()
    fakePlayerMap.set(heroPlayer, new Hero("Warrior",
        { strN: 10, dexN: 10, conN: 10, willN: 10, experienceN: 0, goldN: 0, deepestDungeonLevelN: 0, totalTimeN: 0 },
        []))
    DebugXL.Assert(fakePlayerMap.get(heroPlayer)!.getTeam() === heroes)

    // test associating a fake monster with player
    let fakeMonsterPlayer = Workspace.FindFirstChild("Camera") as Player
    fakePlayerMap.set(fakeMonsterPlayer, new Monster("Orc",
        [],
        1))
    DebugXL.Assert(fakePlayerMap.get(heroPlayer)!.getTeam() === heroes)
    DebugXL.Assert(fakePlayerMap.get(fakeMonsterPlayer)!.getTeam() === Teams.WaitForChild<Team>("Monsters"))
}