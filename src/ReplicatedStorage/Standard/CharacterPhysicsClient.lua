local CharacterPhysics = require( game.ReplicatedStorage.Standard.CharacterPhysics )
local PC = require( game.ReplicatedStorage.TS.PCTS ).PC
local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )

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