local DungeonClient = require( game.ReplicatedStorage.Standard.DungeonClient )

local locationLabel = script.Parent.Parent:WaitForChild("LocationLabel")

locationLabel.Text = DungeonClient:GetLevelName()
workspace.GameManagement.DungeonFloor.Changed:Connect( function( newValue )
	locationLabel.Text = DungeonClient:GetLevelName()
end)
workspace.GameManagement.DungeonDepth.Changed:Connect( function( newValue )
	locationLabel.Text = DungeonClient:GetLevelName()
end)