
local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )
--
local RangedWeaponUtility = {}
--
-- like touched:Connect but it makes sure obects are collidable
-- wishlist: make it so arrows go through ghosts unless magic
function RangedWeaponUtility:CollidedConnect( projectileObj, onTouchedFunc )
	return projectileObj.Touched:Connect( function( hit )
		if hit.CanCollide then
			return onTouchedFunc( hit )
		end
	end)
end


-- one day we may want to put this in its own deal
-- 
local function FindNontransparentPartOnRayWithIgnoreList( ray, ignoreDescendantsVolatile, terrainCellsAreCubesB, ignoreWaterB )
	local partHit, intersectionV3, normalV3, material = workspace:FindPartOnRayWithIgnoreList( ray, ignoreDescendantsVolatile, terrainCellsAreCubesB, ignoreWaterB )
	
	if partHit and partHit.Transparency > 0.9 or not partHit.CanCollide or partHit.CollisionGroupId == workspace.GameManagement.PorousCollisionGroupId.Value then 
		table.insert( ignoreDescendantsVolatile, partHit )
		return FindNontransparentPartOnRayWithIgnoreList( ray, ignoreDescendantsVolatile, terrainCellsAreCubesB, ignoreWaterB )
	else
		return partHit, intersectionV3, normalV3, material
	end
end


function RangedWeaponUtility:MouseHitNontransparent( mouse, ignoreDescendantsVolatile )
	local mouseRay = Ray.new( mouse.UnitRay.Origin, mouse.UnitRay.Direction * 1000 )
	return FindNontransparentPartOnRayWithIgnoreList( mouseRay, ignoreDescendantsVolatile )
end


return RangedWeaponUtility
