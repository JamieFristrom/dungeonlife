
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS";

import { ServerContextI } from "ServerStorage/TS/ServerContext"
import { WeaponsRack } from "./WeaponsRack";
import { Structure } from "./Structure";
import PossessionData from "ReplicatedStorage/Standard/PossessionDataStd";
import { DestructibleStructure } from "./DestructibleStructure";

// we'll data-drive this someday if more structure code piles up
// why am I changing from a paradigm of attaching the code to the model to generating it on-the-fly?
// because it's easier to get tests around
export namespace StructureFactory {
    export function createStructure(serverContext: ServerContextI, structureInstance: Model) {
        let structureId = structureInstance.FindFirstChild<StringValue>("PossessionName")!.Value
        if (structureId === "WeaponsRack") {
            return new WeaponsRack(serverContext, structureInstance)
        }
        else if (PossessionData.dataT[structureId].healthPerLevelN) {
            DebugXL.Assert(PossessionData.dataT[structureId].lootOnDestroyPct !== undefined)
            return new DestructibleStructure(serverContext, structureInstance)
        }
        else {
            return new Structure(serverContext, structureInstance)
        }
    }
}