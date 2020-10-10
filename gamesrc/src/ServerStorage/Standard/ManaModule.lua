
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local MessageServer = require( game.ServerStorage.TS.MessageServer ).MessageServer

local Mana = {}


function Mana:SpendMana( characterO, manaCostN )
	manaCostN = manaCostN or 0  -- easier to do the check here then in the possession structure
	if manaCostN == 0 then return true end
	local manaValueObj = characterO:FindFirstChild("ManaValue")
	if manaValueObj then  	-- character is probably dead;  don't show message it will just be annoying
		local manaN = characterO.ManaValue.Value  
		DebugXL:Assert( manaN >= 0 )	
		if manaN >= manaCostN then
			characterO.ManaValue.Value = math.floor( manaN - manaCostN )
			return true
		else
			MessageServer.PostMessageByKey( game.Players:GetPlayerFromCharacter( characterO ), "OutOfMana", false )
		end
	end
	return false
end


function Mana:RestoreMana( characterO, manaAmountN )
	local manaN = characterO.ManaValue.Value  -- presumably NPC's will never call this func and this is ok  
	local maxManaN = characterO.MaxManaValue.Value
	manaN = math.min( manaN + manaAmountN, maxManaN )
	characterO.ManaValue.Value = manaN
end


return Mana