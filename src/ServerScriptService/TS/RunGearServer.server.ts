
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Workspace } from '@rbxts/services';

import { SkinTypes, SkinTypeEnum } from 'ReplicatedStorage/TS/SkinTypes'

import * as FlexEquip from 'ServerStorage/Standard/FlexEquipModule'
import * as Inventory from 'ServerStorage/Standard/InventoryModule'

import { GearServer } from "ServerStorage/TS/GearServer"
import { PlayerServer } from 'ServerStorage/TS/PlayerServer';



const SignalsFolder = Workspace.WaitForChild<Folder>("Signals")
const InventoryRE = SignalsFolder.WaitForChild<RemoteEvent>("InventoryRE")
const GearRE = SignalsFolder.WaitForChild<RemoteEvent>("GearRE")


namespace GearRemote {
    export function setActiveSkin(player: Player, skinOwner: string, toolSkinType: SkinTypeEnum, skinId: string) {
        const inventoryStore = Inventory.GetInventoryStoreWait(player)
        if (inventoryStore) {
            const inventory = inventoryStore.Get()
            if (inventory) {
                const skinSet = inventory.activeSkinsT[skinOwner]
                skinSet.set(toolSkinType, skinId)
                inventoryStore.Set(inventory)
                InventoryRE.FireClient(player, "Update", inventory)
                if (SkinTypes[toolSkinType].tagsT.worn) {
                    // has to come first otherwise you drop weapon
                    FlexEquip.ApplyEntireCostumeIfNecessaryWait(PlayerServer.getPlayerTracker(), Inventory, player)
                }
                GearServer.reskinTools(player)
            }
        }
    }
}

GearRE.OnServerEvent.Connect((player, ...args) => {
    const funcName = args[0] as string
    if (funcName === "setActiveSkin") {
        GearRemote.setActiveSkin(player, args[1] as string, args[2] as SkinTypeEnum, args[3] as string)
    }
    else {
        DebugXL.Error("Unknown FlexibleToolsRE function " + funcName)
    }
})