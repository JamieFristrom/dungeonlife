import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS';
DebugXL.logI( 'Executed', script.Name )

import { ServerStorage, Workspace, CollectionService } from '@rbxts/services';

import * as Monsters from 'ServerStorage/Standard/MonstersModule'

import { PlayerServer } from 'ServerStorage/TS/PlayerServer'

import { CharacterClasses } from 'ReplicatedStorage/TS/CharacterClasses'
import { Monster } from 'ReplicatedStorage/TS/Monster'

export namespace MobServer
{

    export function spawnMob()
    {
        const monsterFolder = ServerStorage.FindFirstChild<Folder>('Monsters')!
        const mobTemplate = monsterFolder.FindFirstChild<Model>('Orc')!
        const mob = mobTemplate.Clone()
        mob.SetPrimaryPartCFrame( new CFrame(8, 4, 0) )
        const mobFolder = Workspace.FindFirstChild<Folder>('Mobs')
        if( !mobFolder )
            DebugXL.Error('No Mobs folder in Workspace')
        else
            mob.Parent = mobFolder

        CollectionService.AddTag( mob, 'CharacterTag' )

        const monsterDatum = CharacterClasses.monsterStats[ 'Orc' ]
        // what happens when we use the monster code on 'em
        let characterRecord = new Monster( 'Orc',
            [],
            10 )
        const characterKey = PlayerServer.setCharacterRecordForMob( mob, characterRecord )
        Monsters.Initialize( mob, characterKey, characterRecord.getWalkSpeed(), monsterDatum, 1 )
    }
}
