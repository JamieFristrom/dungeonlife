
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

export namespace InstanceUtility {
    export function findOrCreateChild<T extends Instance>( root: Instance, childName: string, childType: string ) {
        let child = (root.FindFirstChild(childName) as T|undefined)
        if( !child ) {
            child = new Instance(childType) as T
            child.Parent = root
            child.Name = childName
        }
        return child as T
    }
}
