
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local CharacterPhysics = require( game.ReplicatedStorage.Standard.CharacterPhysics )

--[[
	please don't make me have to get this working

local formulaxy = workspace.Signals.ClientPhysicsRF:InvokeServer()
warn("formulaxy")
DebugXL:Dump( formulaxy )
--]]
local PCClient = require( game.ReplicatedStorage.TS.PCClient ).PCClient

game["Run Service"].RenderStepped:Connect( function()
	local character = game.Players.LocalPlayer.Character
	if character then
		if character.PrimaryPart then
			CharacterPhysics:ProcessCharacterStats( character, PCClient.pc )
		end
	end	
end)

game["Run Service"].Heartbeat:Connect( function()
--	--print( "the heartbeat is the lovebeat")
	local character = game.Players.LocalPlayer.Character
	if character then
		if character.PrimaryPart then
			CharacterPhysics:ProcessCharacterStats( character, PCClient.pc )
		end
	end	
end)

return {}