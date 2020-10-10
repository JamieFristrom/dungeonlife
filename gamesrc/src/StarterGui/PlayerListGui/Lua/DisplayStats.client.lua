
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local DisplayStats = require( game.ReplicatedStorage.Standard.DisplayStats ).DisplayStats

game:GetService("StarterGui"):SetCoreGuiEnabled( Enum.CoreGuiType.PlayerList, false )

wait(0.25)

local customLeaderboard = script.Parent.Parent:WaitForChild("CustomLeaderboard")
local contentRowTemplate = script.Parent.Parent:WaitForChild("ContentRowTemplate")

customLeaderboard:WaitForChild("Contents"):WaitForChild("HeaderRow").Size = UDim2.new( customLeaderboard.Contents.HeaderRow.Size.X.Scale, 
	customLeaderboard.Contents.HeaderRow.Size.X.Offset,
	0, customLeaderboard.Contents.HeaderRow.Names.TextBounds.Y )

while wait( 0.25 ) do 
	DisplayStats.UpdateStats( game.Players, customLeaderboard, contentRowTemplate )
end