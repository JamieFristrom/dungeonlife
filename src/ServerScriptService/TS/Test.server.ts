
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { RunService, Teams, Players, Workspace } from "@rbxts/services"

import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { Hero } from "ReplicatedStorage/TS/HeroTS";
import { Monster } from "ReplicatedStorage/TS/Monster"
import { HeroStatBlockI } from "ReplicatedStorage/TS/CharacterClasses"

if (RunService.IsStudio()) {
    // make sure nothing unanchored
    for (let descendant of Workspace.GetDescendants()) {
        if (descendant.IsA("BasePart"))
            if (!descendant.Anchored) {
                DebugXL.logW("Parts", descendant.GetFullName() + " is not anchored")
            }
    }

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

    let errorCaught = false
    DebugXL.catchErrors( (message)=>{
        DebugXL.Assert( message.find( "had neither gearPool nor itemsT") !== undefined )
        errorCaught = true
    })
    const convertedHero = Hero.convertFromPersistent(rawHeroData, 3, "TestHeroName")
    DebugXL.stopCatchingErrors()
    DebugXL.Assert(errorCaught)
    DebugXL.Assert(convertedHero.gearPool !== undefined)
    DebugXL.Assert(convertedHero.gearPool.size() === 0)

    // place to put tests. why is it empty 
    let heroes = Teams.WaitForChild<Team>("Heroes")

    // just so we can step in debugger, not a test-case type test which would require creating fake players...  which we can totally do, huh.
    // NOTE THIS TEST DOESN'T RUN UNTIL A HERO IS PRESENT
    wait(1)
    while (heroes.GetPlayers().size() === 0) wait(1)

    // test associating a hero with player
    let heroPlayer = Players.GetChildren()[0] as Player
    let fakePlayerMap = new Map<Player, CharacterRecord>()
    fakePlayerMap.set(heroPlayer, new Hero('Warrior',
        { strN: 10, dexN: 10, conN: 10, willN: 10, experienceN: 0, goldN: 0, deepestDungeonLevelN: 0, totalTimeN: 0 },
        []))
    DebugXL.Assert(fakePlayerMap.get(heroPlayer)!.getTeam() === heroes)

    // test associating a fake monster with player
    let fakeMonsterPlayer = Workspace.FindFirstChild('Camera') as Player
    fakePlayerMap.set(fakeMonsterPlayer, new Monster('x',
        [],
        1))
    DebugXL.Assert(fakePlayerMap.get(heroPlayer)!.getTeam() === heroes)
    DebugXL.Assert(fakePlayerMap.get(fakeMonsterPlayer)!.getTeam() === Teams.WaitForChild<Team>('Monsters'))
}