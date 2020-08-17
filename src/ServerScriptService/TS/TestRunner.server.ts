// because we have tests operating on various global game entities (such as player 0) run them in order

import { TestUtility } from "ReplicatedStorage/TS/TestUtility"
import { Workspace } from "@rbxts/services"

// to prevent flakiness, cross-pollution of contending threads
if( game.GetService("RunService").IsStudio()) {
    warn("Running Tests")
    for( let moduleScript of script.Parent!.Parent!.FindFirstChild<Folder>("TS")!.FindFirstChild<Folder>("Tests")!.GetChildren()) {
        if( moduleScript.IsA("ModuleScript")) {
            warn( "Running "+moduleScript.Name )
            TestUtility.setCurrentModuleName(moduleScript.Name)
            require( moduleScript )
        }
    }
    warn("All tests run! Yay!")
}

Workspace.FindFirstChild<Folder>("GameManagement")!.FindFirstChild<BoolValue>("TestsFinished")!.Value = true