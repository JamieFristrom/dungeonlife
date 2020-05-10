local RunService = game:GetService('RunService')

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )
local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL = require( game.ReplicatedStorage.Standard.InstanceXL )

--
local BoltUtilityXL = {}


function BoltUtilityXL.new( projectileObj, hitPointFunc )

	local tool = projectileObj.Tool.Value

	projectileObj.Anchored     = false
	projectileObj.CanCollide   = false  -- needs to be false otherwise sometimes you get massive knockback that then kills the character because of the anti teleport script
	projectileObj.CollisionGroupId = workspace.GameManagement.MissileCollisionGroupId.Value
	
	--  doesn't look good with magic fx	
	--projectileObj.Transparency = 0
	
	local Players = game:GetService("Players")
	local Debris = game:GetService("Debris")
	
	-- not for recording damage but for tracking owner of bolt:
	local Creator = projectileObj:WaitForChild("creator")
	
	local BodyForce = projectileObj:WaitForChild("BodyForce")
			
	local HitSound = projectileObj:WaitForChild("Hit")

	local BodyGyro = projectileObj:FindFirstChild("BodyGyro")
	
	DebugXL:Assert( Creator )
	DebugXL:Assert( BodyForce )
--	DebugXL:Assert( BodyGyro )
	DebugXL:Assert( HitSound )
		
	local Stuck = false
	
	local function Stick(Object, Hit)
		local Weld = Instance.new("Weld")
		Weld.Part0 = projectileObj
		Weld.Part1 = Hit
		local HitPos = projectileObj.Position + (projectileObj.Velocity.unit * 3)
		local CJ = CFrame.new(HitPos)
		Weld.C0 = projectileObj.CFrame:inverse() * CJ
		Weld.C1 = Hit.CFrame:inverse() * CJ
		Weld.Parent = Object
	end
	
	local function IsTeamMate(Player1, Player2)
		return (Player1 and Player2 and not Player1.Neutral and not Player2.Neutral and Player1.TeamColor == Player2.TeamColor)
	end
	
	local function Touched(Hit)
		if not Hit or not Hit.Parent or Stuck then
			return
		end
		if not Hit.CanCollide then 
			return 
		end		

		-- here it gets awkward, since only the server can check if collision groups are collidable or not
		if Hit.CollisionGroupId == workspace.GameManagement.PorousCollisionGroupId.Value then
			return
		end
		
		-- a lot of destructible objects don't have flat hierarchies, so we need to search more than
		-- one parent up to find if it's a character
		local character = InstanceXL:FindFirstAncestorThat( Hit, function( ancestor ) return ancestor:FindFirstChild("Humanoid") end )		
--		if character:IsA("Hat") or character:IsA("Tool") then
--			character = character.Parent
--		end
		local CreatorPlayer
		if Creator and Creator.Value and Creator.Value:IsA("Player") then
			CreatorPlayer = Creator.Value
		end
		if CreatorPlayer and CreatorPlayer.Character == character then
			return
		end
		if character then
			local player = Players:GetPlayerFromCharacter(character)
			if not CharacterClientI:ValidTarget( CreatorPlayer.Character, character ) then
				return
			end
		end
--		--print( projectileObj.Name.." hit "..Hit:GetFullName() )
		Stuck = true
		--Stick(projectileObj, Hit)   -- wishlist fix: make sticking look good. right now it floats
		if HitSound then
			HitSound:Play()
		end
		for i, v in pairs({BodyForce, BodyGyro}) do
			if v and v.Parent then
				v:Destroy()
			end
		end

		if( RunService:IsServer() )then  -- ugh. too lazy to refactor this right now
			local CharacterI = require( game.ServerStorage.CharacterI )
			local FlexibleTools = require( game.ServerStorage.Standard.FlexibleToolsModule )

			FlexibleTools:CreateExplosionIfNecessary( tool, projectileObj.Position )
			if character then
				local humanoid = character:FindFirstChild("Humanoid")
				if humanoid and humanoid.Health > 0 then			
					--print( "Has a humanoid. Executing hit func" )
					local flexToolInst = FlexibleTools:GetFlexToolFromInstance( tool )
					CharacterI:TakeFlexToolDamage( character, CreatorPlayer, flexToolInst )
				end
			end
		end

		projectileObj.Transparency = 1
		projectileObj.Anchored = true
		HitSound.Ended:Wait()
		projectileObj:Destroy()
	end
		
	projectileObj.Touched:connect(Touched)
	
	for i = 1, 100 do
		wait(0.1 * i)
		if BodyGyro and BodyGyro.Parent then
			BodyGyro.cframe = CFrame.new(Vector3.new(0,0,0), -projectileObj.Velocity.unit)
		end
	end
end

return BoltUtilityXL
