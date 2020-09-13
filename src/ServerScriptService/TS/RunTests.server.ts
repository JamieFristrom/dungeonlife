
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)

// because we have tests operating on various global game entities (such as player 0) run them in order

import { TestUtility } from "ReplicatedStorage/TS/TestUtility"
import { Workspace } from "@rbxts/services"

const runTests = true

// "" means run all the tests
const currentTest = "" // "WeaponsRackTests" // "" //"MeleeWeaponTests" // "SuperbossTests"

// to prevent flakiness, cross-pollution of contending threads
if (runTests && game.GetService("RunService").IsStudio()) {
    warn("Running Tests")
    for (const moduleScript of (script.Parent!.Parent!.FindFirstChild("TS")!.FindFirstChild("Tests") as Folder | undefined)!.GetChildren()) {
        if (moduleScript.IsA("ModuleScript")) {
            if (currentTest === "" || (currentTest as string).upper() === moduleScript.Name.upper()) {
                warn("Running " + moduleScript.Name)
                TestUtility.setCurrentModuleName(moduleScript.Name)
                require(moduleScript)
            }
        }
    }
    warn("All tests run")
}

(Workspace.FindFirstChild("GameManagement")!.FindFirstChild("TestsFinished") as BoolValue | undefined)!.Value = true