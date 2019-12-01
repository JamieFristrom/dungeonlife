import { RunService, Teams, Players, Workspace } from "@rbxts/services"

import { CharacterServer } from "ServerStorage/TS/CharacterServer"
import { PC } from "ReplicatedStorage/TS/PCTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS";
import { Monster } from "ReplicatedStorage/TS/Monster"
import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS";
import { MonsterServer } from "ServerStorage/TS/MonsterServer";

import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"
import { MonsterDatumI } from "ReplicatedStorage/TS/MonsterDatum";

if( RunService.IsStudio())
{
    // place to put tests. why is it empty 
    let heroes = Teams.WaitForChild<Team>("Heroes")

    // just so we can step in debugger, not a test-case type test which would require creating fake players...  which we can totally do, huh.
    wait(1)
    while( heroes.GetPlayers().size()===0 ) wait(1)

    let heroPlayer = Players.GetChildren()[0] as Player
    let fakePlayerMap = new Map<Player, PC>()
    fakePlayerMap.set( heroPlayer, new Hero({ idS: "x",
        readableNameS: "y",
        imageId: 'z',
        walkSpeedN: 16,
        jumpPowerN: 16,
        statsT: { strN: 10, dexN: 10, conN: 10, willN: 10, experienceN: 0, goldN: 0, deepestDungeonLevelN: 0, totalTimeN: 0 },
        itemsT: {},
        badges: []} ) )
    DebugXL.Assert( fakePlayerMap.get( heroPlayer )!.getTeam() === heroes )

    let fakeMonsterPlayer = Workspace.FindFirstChild('Camera') as Player
    fakePlayerMap.set( fakeMonsterPlayer, new Monster( 'x',
        'y',
        16,
        16,
        {},
        1 ) )
    DebugXL.Assert( fakePlayerMap.get( heroPlayer )!.getTeam() === heroes )
    DebugXL.Assert( fakePlayerMap.get( fakeMonsterPlayer )!.getTeam() === Teams.WaitForChild<Team>('Monsters') )
    //let test0 = CharacterServer.IsDangerZoneForHero( fakePlayerMap, heroPlayer )
    //DebugXL.Assert( test0 === false )
    let test1 = CharacterServer.IsDangerZoneForHero( fakePlayerMap, heroPlayer )
    DebugXL.Assert( test1 === false )
    fakePlayerMap.set( Workspace.FindFirstChild('GameManagement') as Player, new Hero({ idS: "x",
        readableNameS: "y",
        imageId: 'z',
        walkSpeedN: 16,
        jumpPowerN: 16,
        statsT: { strN: 10, dexN: 10, conN: 10, willN: 10, experienceN: 100000, goldN: 0, deepestDungeonLevelN: 0, totalTimeN: 0 },
        itemsT: {},
        badges: []} ) )
    let test2 = CharacterServer.IsDangerZoneForHero( fakePlayerMap, heroPlayer )
    DebugXL.Assert( test2 === true )
}