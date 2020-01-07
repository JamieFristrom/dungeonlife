local BalanceData = require( game.ReplicatedStorage.TS.BalanceDataTS ).BalanceData

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )
local CharacterUtility = require( game.ReplicatedStorage.Standard.CharacterUtility )
local WeaponUtility = require( game.ReplicatedStorage.Standard.WeaponUtility )

local CharacterPhysics = {}

function CharacterPhysics:GetBaseWalkSpeed( pcData )
	return pcData:getWalkSpeed()
end

function CharacterPhysics:CalculateWalkSpeed( character, pcData )	
	if not pcData then return 12 * BalanceData.walkspeedMultiplierN end
	
	if character:FindFirstChild("ChangingCostume") then
		return 0
	end
	
	local baseWalkSpeedN = CharacterPhysics:GetBaseWalkSpeed( pcData )
	
	local equipWalkSpeedMul = 1
	
	local player = game.Players:GetPlayerFromCharacter( character )
	if player then
		-- from having recently fired a weapon that has a slow-walk-cooldown 
		-- (it used to just be that holding the weapon would trigger the cooldown 
		if WeaponUtility:IsCoolingDown( player ) then
			--print("cooldown slow "..player.Name )
			local toolWalkSpeedMul = WeaponUtility:LastWeaponWalkSpeedMul( player )
			if toolWalkSpeedMul then
				equipWalkSpeedMul = equipWalkSpeedMul * toolWalkSpeedMul 
			else
				--print( "no walkspeed mul found" )
			end
		end
	
		-- from armor
		local wornWalkSpeedMul = CharacterClientI:GetWornWalkSpeedMul( pcData)
		equipWalkSpeedMul = equipWalkSpeedMul * wornWalkSpeedMul
	end
	
	-- from aura:
	local auraMul = 1
	if character:FindFirstChild( "AuraOfCourage" ) then
		auraMul = 1.1  -- enough to stay ahead of everything but gremlins
	end
	
	-- from conditions:
	local slowPct = CharacterUtility:GetWalkSpeedMul( character )
	
	local calculatedWalkspeed = baseWalkSpeedN * equipWalkSpeedMul * slowPct * auraMul * BalanceData.walkspeedMultiplierN
	return calculatedWalkspeed
end


function CharacterPhysics:GetBaseJumpPower( pcData )
	return pcData:getJumpPower()
end


function CharacterPhysics:CalculateJumpPower( character, pcData )
	if not pcData then return 35 end

	local baseJumpPowerN = CharacterPhysics:GetBaseJumpPower( pcData )
	local player = game.Players:GetPlayerFromCharacter( character )

	baseJumpPowerN = baseJumpPowerN * CharacterClientI:GetWornJumpPowerMul( pcData )
	return baseJumpPowerN
end

local terminalVelocity = 75


function CharacterPhysics:ProcessCharacterStats( character, pcData )
	local humanoid = character:FindFirstChild("Humanoid")
	if humanoid then  -- already dead?
											
		local calculatedWalkspeed = CharacterPhysics:CalculateWalkSpeed( character, pcData )
		humanoid.WalkSpeed = CharacterUtility:IsFrozen( character ) and 0 or calculatedWalkspeed
		humanoid.JumpPower = CharacterUtility:IsFrozen( character ) and 0 or CharacterPhysics:CalculateJumpPower( character, pcData )	

		local xzVel = Vector3.new( character.PrimaryPart.Velocity.X, 0, character.PrimaryPart.Velocity.Z )
		if xzVel.Magnitude > calculatedWalkspeed * 1.5 then
			local clampedXZVel = xzVel.Unit * calculatedWalkspeed * 1.5
			character.PrimaryPart.Velocity = Vector3.new( clampedXZVel.X, character.PrimaryPart.Velocity.Y, clampedXZVel.Z )
--			--print("trim")
		end
		if character.PrimaryPart.Velocity.Magnitude > terminalVelocity then
			character.PrimaryPart.Velocity = character.PrimaryPart.Velocity.Unit * terminalVelocity
--			--print('terminal trim')
		end
		local rotVelCF = CFrame.fromEulerAnglesXYZ( character.PrimaryPart.RotVelocity.X, character.PrimaryPart.RotVelocity.Y, character.PrimaryPart.RotVelocity.Z )
		local axis, radians = rotVelCF:toAxisAngle()
		if( radians > 0.1 )then
			radians = 0.1
			rotVelCF = CFrame.fromAxisAngle( axis, radians )
			local xrot, yrot, zrot = rotVelCF:toEulerAnglesXYZ()
			character.PrimaryPart.RotVelocity = Vector3.new( xrot, yrot, zrot )
		end
	end
end

return CharacterPhysics