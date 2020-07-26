
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local GeneralWeaponUtility = require( game.ReplicatedStorage.TS.GeneralWeaponUtility ).GeneralWeaponUtility
--
local RangedWeaponHelpers = {}
--
-- like touched:Connect but it makes sure obects are collidable
-- wishlist: make it so arrows go through ghosts unless magic
function RangedWeaponHelpers.CollidedConnect( projectileObj, onTouchedFunc )
	return projectileObj.Touched:Connect( function( hit )
		if hit.CanCollide then
			return onTouchedFunc( hit )
		end
	end)
end

-- returns packed result 
function RangedWeaponHelpers.MouseHitNontransparent( mouse, ignoreDescendantsVolatile )
	local mouseRay = Ray.new( mouse.UnitRay.Origin, mouse.UnitRay.Direction * 1000 )
	return GeneralWeaponUtility.findNontransparentPartOnRayWithIgnoreList( mouseRay, ignoreDescendantsVolatile )
end



return RangedWeaponHelpers
