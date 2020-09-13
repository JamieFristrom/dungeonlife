
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { ReplicatedStorage } from "@rbxts/services"

const runTests = true

const folders = [
    (ReplicatedStorage.WaitForChild("Standard") as Folder),
    (ReplicatedStorage.WaitForChild("TS") as Folder)]

// to prevent flakiness, cross-pollution of contending threads
if (runTests && game.GetService("RunService").IsStudio()) {
    warn("Exercising client modules")
    for (let folder of folders) {
        for (let moduleScript of folder.GetChildren()) {
            if (moduleScript.IsA("ModuleScript")) {
                warn("Client: Exercising " + moduleScript.Name)
                require(moduleScript)
            }
        }
    }
    warn("All client modules exercised")
}
