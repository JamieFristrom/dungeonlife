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

--local pcData = workspace.Signals.HotbarRF:InvokeServer( "GetPCData" )
--PC:objectify( pcData )

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

--local ClientPhysicsRemote = {}

-- function ClientPhysicsRemote.Refresh( _pcData )
-- 	pcData = PC:objectify( _pcData )
-- end

-- workspace.Signals.HotbarRE.OnClientEvent:Connect( function( funcName, ... )  
-- 	ClientPhysicsRemote[ funcName ]( ... )
-- end)

--[[

local formulaX = formulaxy[1]
local formulaY = formulaxy[2]

workspace.Signals.ClientPhysicsRF.OnClientInvoke = function( z ) 
    local answer = z * formulaX - formulaY 
--    --print("polo "..answer) 
    return { z * formulaX - formulaY } 
end
--]]

return {}