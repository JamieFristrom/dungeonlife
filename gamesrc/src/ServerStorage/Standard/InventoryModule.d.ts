
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { InventoryManagerI } from "ServerStorage/TS/InventoryManagerI"

// because Inventory was declared class-style originally it was trivial to make it contextable
declare let inventory: InventoryManagerI

export = inventory
