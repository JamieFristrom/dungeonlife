-- because we have tests operating on various global game entities (such as player 0) run them in order
-- to prevent flakiness, cross-pollution of contending threads
if( game:GetService("RunService"):IsStudio()) then
    warn("Running Tests")
    for _, moduleScript in pairs( script.Parent.Parent.TS.Tests:GetChildren()) do
        if( moduleScript:IsA("ModuleScript")) then
            warn( "Running "..moduleScript.Name )
            require( moduleScript )
        end
    end
    warn("All tests run! Yay!")
end

game.Workspace.GameManagement.TestsFinished.Value = true
