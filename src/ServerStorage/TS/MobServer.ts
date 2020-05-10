import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS';
DebugXL.logI( 'Executed', script.Name )

import { ServerStorage, Workspace, CollectionService } from '@rbxts/services';

import * as Monsters from 'ServerStorage/Standard/MonstersModule'

import { PlayerServer } from 'ServerStorage/TS/PlayerServer'
import { ToolCaches } from 'ServerStorage/TS/ToolCaches'

import { CharacterRecord } from 'ReplicatedStorage/TS/CharacterRecord'
import { CharacterClasses } from 'ReplicatedStorage/TS/CharacterClasses'
import { HotbarSlot } from 'ReplicatedStorage/TS/FlexToolTS'
import { Monster } from 'ReplicatedStorage/TS/Monster'

const mobIdleAnims: Animation[] = ServerStorage.WaitForChild('MobAnimations').WaitForChild('idle').GetChildren()

export namespace MobServer
{

    export function spawnMob()
    {
        const monsterFolder = ServerStorage.FindFirstChild<Folder>('Monsters')!
        const mobTemplate = monsterFolder.FindFirstChild<Model>('Orc')!
        const mob = mobTemplate.Clone()
        const humanoid = mob.FindFirstChild<Humanoid>('Humanoid')!
        mob.SetPrimaryPartCFrame( new CFrame(8, 4, 0) )
        const mobFolder = Workspace.FindFirstChild<Folder>('Mobs')
        if( !mobFolder )
            DebugXL.Error('No Mobs folder in Workspace')
        else
            mob.Parent = mobFolder

        CollectionService.AddTag( mob, 'CharacterTag' )

        // what happens when we use the monster code on 'em
        let characterRecord = new Monster( 'Orc',
            [],
            10 )
        const characterKey = PlayerServer.setCharacterRecordForMob( mob, characterRecord )
        Monsters.Initialize( mob, characterKey, characterRecord.getWalkSpeed(), 'Orc', 1 )

        ToolCaches.updateToolCache( characterKey, characterRecord )

        const idleAnim = humanoid.LoadAnimation(mobIdleAnims[0])
        idleAnim.Play()
        wait(3)

        // have them draw their sword
        const weaponKey = characterRecord.getPossessionKeyFromSlot(HotbarSlot.Slot1)
        if( weaponKey )
        {
            const tool = CharacterRecord.getToolInstanceFromPossessionKey(mob, weaponKey)
            if( tool )
            {
                humanoid.EquipTool(tool)
            }
        }


    }
}
