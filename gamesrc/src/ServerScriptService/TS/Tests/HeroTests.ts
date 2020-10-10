
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Teams, Players, Workspace } from "@rbxts/services"

import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { Hero } from "ReplicatedStorage/TS/HeroTS";
import { Monster } from "ReplicatedStorage/TS/Monster"
import { TestUtility } from "ReplicatedStorage/TS/TestUtility";

import Heroes from "ServerStorage/Standard/HeroesModule"
import { PlayerTracker } from "ServerStorage/TS/PlayerServer";

// test load/save; unfortunately will bash my existing records but whatev
{
    let heroPlayer = TestUtility.createTestPlayer()
    let playerTracker = new PlayerTracker()
    Heroes.PlayerAdded(heroPlayer)
    let heroStable = Heroes.GetSavedPlayerCharactersWait(heroPlayer)
    heroStable.heroesA[0] = new Hero("Warrior",
        { strN: 10, dexN: 10, conN: 10, willN: 10, experienceN: 666, goldN: 0, deepestDungeonLevelN: 0, totalTimeN: 0 },
        [])
    Heroes.SaveHeroesWait(playerTracker, heroPlayer)
    Heroes.ForceSave(heroPlayer)
}

{
    let errorMessage = ""
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
    TestUtility.assertTrue(errorMessage.find("had neither gearPool nor itemsT") !== undefined)
    TestUtility.assertTrue(convertedHero.gearPool !== undefined)
    TestUtility.assertTrue(convertedHero.gearPool.size() === 0)
}

{
    let heroes = (Teams.WaitForChild("Heroes") as Team)

    // test associating a hero with player
    let heroPlayer = TestUtility.createTestPlayer()
    let fakePlayerMap = new Map<Player, CharacterRecord>()
    fakePlayerMap.set(heroPlayer, new Hero("Warrior",
        { strN: 10, dexN: 10, conN: 10, willN: 10, experienceN: 0, goldN: 0, deepestDungeonLevelN: 0, totalTimeN: 0 },
        []))
    TestUtility.assertTrue(fakePlayerMap.get(heroPlayer)!.getTeam() === heroes)

    // test associating a fake monster with player and that the original hero record is still on the correct team
    let fakeMonsterPlayer = Workspace.FindFirstChild("Camera") as Player
    fakePlayerMap.set(fakeMonsterPlayer, new Monster("Orc",
        [],
        1))
    TestUtility.assertTrue(fakePlayerMap.get(heroPlayer)!.getTeam() === heroes)
    TestUtility.assertTrue(fakePlayerMap.get(fakeMonsterPlayer)!.getTeam() === (Teams.WaitForChild("Monsters") as Team))
    TestUtility.cleanTestPlayer(heroPlayer)
}

