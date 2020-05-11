local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )

local CharacterUtility = require( game.ReplicatedStorage.Standard.CharacterUtility )
local DebugXL          = require( game.ReplicatedStorage.Standard.DebugXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL )

local WeaponUtility = {}


function WeaponUtility:GetTargetPoint( targetCharacter )
	if targetCharacter.PrimaryPart then
		return targetCharacter:GetPrimaryPartCFrame().p
	else
		return Vector3.new( math.huge, math.huge, math.huge )  -- will probably be out of range
	end
end



return WeaponUtility


