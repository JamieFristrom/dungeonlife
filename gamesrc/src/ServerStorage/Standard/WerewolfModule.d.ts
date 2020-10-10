
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { PlayerTracker } from "ServerStorage/TS/PlayerServer"
import { InventoryManagerI } from "ServerStorage/TS/InventoryManagerI"

declare class WerewolfClass
{
    ToggleForm( playerTracker: PlayerTracker, inventoryManager: InventoryManagerI, player: Player ): void
}

declare let Werewolf : WerewolfClass

export = Werewolf