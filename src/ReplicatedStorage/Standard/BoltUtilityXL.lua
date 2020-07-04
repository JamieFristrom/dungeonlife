local RunService = game:GetService('RunService')

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )
local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL = require( game.ReplicatedStorage.Standard.InstanceXL )

local GeneralWeaponUtility = require( game.ReplicatedStorage.TS.GeneralWeaponUtility ).GeneralWeaponUtility

--
local BoltUtilityXL = {}


function BoltUtilityXL.new( projectileObj, hitPointFunc )

	local tool = projectileObj.Tool.Value

	projectileObj.Anchored     = false
	projectileObj.CanCollide   = false  -- needs to be false otherwise sometimes you get massive knockback that then kills the character because of the anti teleport script
	projectileObj.CollisionGroupId = workspace.GameManagement.MissileCollisionGroupId.Value
	
	--  doesn't look good with magic fx	
	--projectileObj.Transparency = 0
	

	-- not for recording damage but for tracking owner of bolt:
	local Creator = projectileObj:WaitForChild("creator")
	
	local BodyForce = projectileObj:WaitForChild("BodyForce")
			
	local HitSound = projectileObj:WaitForChild("Hit")

	local BodyGyro = projectileObj:FindFirstChild("BodyGyro")
	
	DebugXL:Assert( Creator )
	DebugXL:Assert( BodyForce )
	DebugXL:Assert( HitSound )
		
	local Stuck = false
	
	-- local function Stick(Object, Hit)
	-- 	local Weld = Instance.new("Weld")
	-- 	Weld.Part0 = projectileObj
	-- 	Weld.Part1 = Hit
	-- 	local HitPos = projectileObj.Position + (projectileObj.Velocity.unit * 3)
	-- 	local CJ = CFrame.new(HitPos)
	-- 	Weld.C0 = projectileObj.CFrame:inverse() * CJ
	-- 	Weld.C1 = Hit.CFrame:inverse() * CJ
	-- 	Weld.Parent = Object
	-- end

	local function Touched(Hit)
		if not Hit or not Hit.Parent or Stuck then
			return
		end
		if not Hit.CanCollide then 
			return 
		end		

		if GeneralWeaponUtility.isPorous( Hit ) then
			return
		end
		
		-- a lot of destructible objects don't have flat hierarchies, so we need to search more than
		-- one parent up to find if it's a character
		local hitCharacter = InstanceXL:FindFirstAncestorThat( Hit, function( ancestor ) return ancestor:FindFirstChild("Humanoid") end )		
--		if character:IsA("Hat") or character:IsA("Tool") then
--			character = character.Parent
--		end

		local creatorCharacter
		creatorCharacter = Creator.Value
		DebugXL:Assert( creatorCharacter:IsA('Model') )
		if not creatorCharacter then
			return
		end
		
		local creatorPlayer = game.Players:GetPlayerFromCharacter( creatorCharacter )
		local creatorTeam = creatorPlayer and creatorPlayer.Team or game.Teams.Monsters
		if hitCharacter then
			if not CharacterClientI:ValidTarget( creatorTeam, hitCharacter ) then
				return
			end
		end
--		--print( projectileObj.Name.." hit "..Hit:GetFullName() )
		Stuck = true
		--Stick(projectileObj, Hit)   -- wishlist fix: make sticking look good. right now it floats
		if HitSound then
			HitSound:Play()
		end
		
		local hitSquishy = false
		if( RunService:IsServer() )then  -- ugh. too lazy to refactor this right now
			local CharacterI = require( game.ServerStorage.CharacterI )
			local FlexibleTools = require( game.ServerStorage.Standard.FlexibleToolsModule )

			FlexibleTools:CreateExplosionIfNecessary( tool, projectileObj.Position )
			if hitCharacter then
				local humanoid = hitCharacter:FindFirstChild("Humanoid")
				if humanoid and humanoid.Health > 0 then			
					--print( "Has a humanoid. Executing hit func" )
					local flexToolInst = FlexibleTools:GetFlexToolFromInstance( tool )
					CharacterI:TakeFlexToolDamage( hitCharacter, creatorCharacter, creatorTeam, flexToolInst )
					hitSquishy = true
				end
			end
		end

		-- it looks not great if we stop when hitting a person; it looks like it stops way before him. Roblox velocity extrapolation I guess
		if not hitSquishy then 
			for _, v in pairs({BodyForce, BodyGyro}) do
				if v and v.Parent then
					v:Destroy()
				end
			end

			projectileObj.Velocity = Vector3.new(0,0,0)
			projectileObj.Anchored = true
		end
		projectileObj.Transparency = 1
		HitSound.Ended:Wait()

		-- it looks not great on the client if we destroy the projectile right away - its trail disappears
		delay( 0.5, function()
			projectileObj.Parent = nil
		end)
		
	end
		
	projectileObj.Touched:connect(Touched)
	
	for i = 1, 100 do
		wait(0.1 * i)  -- so, wait .1 seconds, then .2 seconds, then .3 seconds... not sure why
		if BodyGyro and BodyGyro.Parent then
			BodyGyro.cframe = CFrame.new(Vector3.new(0,0,0), -projectileObj.Velocity.unit)
		else
			break
		end
	end
end

return BoltUtilityXL
