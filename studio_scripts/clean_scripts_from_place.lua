warn("Clearing most scripts from place")
local servicesToClean = { 
    game.ReplicatedFirst,
    game.ReplicatedStorage,
    game.ServerScriptService,
    game.ServerStorage,
    game.StarterPlayer,
    game.StarterGui 
}

local foldersToCLean = {
    "TS",
    "Standard",
    "rbxts_include",
    "Lua"
}

for _, service in pairs( servicesToClean ) do
    for _, folderName in pairs( foldersToCLean ) do 
        local folder = service:FindFirstChild(folderName)
        if folder then
            folder:Destroy()
        end
    end
end
warn("Clear finished")
