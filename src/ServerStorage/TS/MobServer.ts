import { ServerStorage, Workspace } from "@rbxts/services";

import * as FlexibleTools from "ServerStorage/Standard/FlexibleToolsModule"
import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS";

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
            DebugXL.Error("No Mobs folder in Workspace")
        else
            mob.Parent = mobFolder

        // what happens when we use the monster code on 'em
        
    }
}
