-- because we have tests operating on various global game entities (such as player 0) run them in order
-- to prevent flakiness, cross-pollution of contending threads
if( game:GetService("RunService"):IsStudio()) then
    for _, moduleScript in pairs( script.Parent.Parent.TS.Tests:GetChildren()) do
        if( moduleScript:IsA("ModuleScript")) then
            require( moduleScript )
        end
    end
end

game.Workspace.GameManagement.TestsFinished.Value = true
warn("All tests run! Yay!")