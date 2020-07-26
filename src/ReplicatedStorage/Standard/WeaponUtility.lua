
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local WeaponUtility = {}

function WeaponUtility:GetTargetPoint( targetCharacter )
	if targetCharacter.PrimaryPart then
		return targetCharacter:GetPrimaryPartCFrame().p
	else
		return Vector3.new( math.huge, math.huge, math.huge )  -- will probably be out of range
	end
end

return WeaponUtility


