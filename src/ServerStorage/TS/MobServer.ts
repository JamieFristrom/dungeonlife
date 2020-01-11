import { ServerStorage, Workspace } from "@rbxts/services";

import * as FlexibleTools from "ServerStorage/Standard/FlexibleToolsModule"

export namespace MobServer
{

    export function spawnMob()
    {
        const monsterFolder = ServerStorage.FindFirstChild<Folder>('Monsters')!
        const mobTemplate = monsterFolder.FindFirstChild<Model>('Orc')!
        const mob = mobTemplate.Clone()
        mob.SetPrimaryPartCFrame( new CFrame(8, 4, 0) )
        mob.Parent = Workspace.FindFirstChild<Folder>('Mobs')!
//        FlexibleTools.CreateTool( { new FlexTool(  )} )
    }
}
