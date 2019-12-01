local DebugXL              = require( game.ReplicatedStorage.Standard.DebugXL )

local RangedWeaponUtility  = require( game.ReplicatedStorage.Standard.RangedWeaponUtility )


local LobbedUtility = {}

local function Transparify( part )
	if part:IsA("BasePart") then
		--print( part:GetFullName().." transparified" )
		part.Transparency = 1
		part.Anchored     = true
		part.CanCollide   = false
	elseif part:IsA("ParticleEmitter") then
		part.Enabled = false
	end
end

function LobbedUtility.new( lobbedObj, particleLifetimeN, specialDamageFunc )
	
	local touchConnection
	
	local alreadyHit = false
	
	local function OnThrownObjHit( hitPart )
		--print("lobbedObj projectile hit "..hitPart:GetFullName() )
		DebugXL:Assert( not alreadyHit )
		if not alreadyHit then
			touchConnection:Disconnect()
			--lobbedObj.HitSound:Play()  -- plays on client, should get there before we explode
			
			if specialDamageFunc then specialDamageFunc( lobbedObj ) end 
			
			-- custom detonation
			for _, part in pairs( lobbedObj:GetDescendants() ) do
				Transparify( part )
			end
			Transparify( lobbedObj )
		
			-- we have to keep the object around; on the client it is running a script to hide the server one				
			game.Debris:AddItem( lobbedObj, 5 )  -- 5 should be way more than enough
		end
	end

	touchConnection = RangedWeaponUtility:CollidedConnect( lobbedObj, OnThrownObjHit )

end

return LobbedUtility
