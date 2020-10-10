
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { ServerContextI } from "ServerStorage/TS/ServerContext";

declare class MeleeWeaponServerXLClass {
    OnActivated(): void
    OnEquipped(): void

    constructor(tool: Tool, context: ServerContextI)
}

export = MeleeWeaponServerXLClass

