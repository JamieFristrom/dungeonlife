print( script:GetFullName().." executed" )

local CharacterUtility   = require( game.ReplicatedStorage.Standard.CharacterUtility )
local DebugXL            = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL         = require( game.ReplicatedStorage.Standard.InstanceXL )

local CharacterClientI   = require( game.ReplicatedStorage.CharacterClientI )
local CharacterPhysics   = require( game.ReplicatedStorage.Standard.CharacterPhysics )

local CharacterI         = require( game.ServerStorage.CharacterI )
local FloorData          = require( game.ReplicatedStorage.FloorData )

local WeaponUtility      = require( game.ReplicatedStorage.Standard.WeaponUtility )

local BalanceData = require( game.ReplicatedStorage.TS.BalanceDataTS ).BalanceData

local CharacterXL = {}

local manaRegenRate = BalanceData.manaRestorePctN -- Regenerate this fraction of MaxHealth per second.


-- don't use a wait inside a 'debounce' so they stack appropriately
function CharacterXL:FreezeFor( character, duration )	
	if game.Players:GetPlayerFromCharacter( character ) then  	-- don't defile your freeze on a worthless object
		if not CharacterUtility:IsFrozen( character ) then
			local characterHumanoid = character:FindFirstChild("Humanoid") 
			for _, child in pairs( character:GetChildren() ) do
				if child:IsA("BasePart") then
					child.Anchored = true
				end
			end
		end	
		-- this could theoretically cut an existing freeze short but not sure I care
		InstanceXL:CreateSingleton( "NumberValue", { Value = time() + duration, Name = "FrozenUntil", Parent = character } )
	end
end


function CharacterXL:SpeedMulFor( character, walkPct, cooldownPct, duration )
	local slowUntil = time() + duration
	local vec3 = Vector3.new( walkPct, slowUntil )
	local params = { Name = "WalkSpeedMulUntil", Value = vec3, Parent = character }
	InstanceXL.new( "Vector3Value", params ) 
	local vec3 = Vector3.new( cooldownPct, slowUntil )
	local params = { Name = "CooldownMulUntil", Value = vec3, Parent = character }
	InstanceXL.new( "Vector3Value", params ) 
end


function CharacterXL:DamageOverTimeFor( character, dps, duration, attackingPlayer )
	local damageUntil = time() + duration
	if attackingPlayer then
		CharacterI:SetLastAttackingPlayer( character, attackingPlayer )
	end
	-- stacks
	InstanceXL.new( "Vector3Value", { Name = "DamageUntil", Value = Vector3.new( dps, damageUntil, 0 ), Parent = character } )
end 




function ProcessPC( character, deltaT )
	local humanoid = character:FindFirstChild("Humanoid")
	if humanoid then  -- already dead?
	
		-- unfreeze if time
		local frozenValueO = character:FindFirstChild("FrozenUntil")
		if frozenValueO then
			if time() >= frozenValueO.Value then
				for _, child in pairs( character:GetChildren() ) do
					if child:IsA("BasePart") then
						child.Anchored = false
					end
				end		
				frozenValueO:Destroy()							
			end
		end

		local player = game.Players:GetPlayerFromCharacter( character )

		for _, instance in pairs( character:GetChildren() ) do
			if instance.Name == "WalkSpeedMulUntil" or instance.Name == "CooldownMulUntil" then
				if time() > instance.Value.Y then  -- y contains time to destroy on
					instance:Destroy()
				end 
			elseif instance.Name == "DamageUntil" then
				local lastAttackingPlayer = CharacterUtility:GetLastAttackingPlayer( character )
				if lastAttackingPlayer then  -- mostly doing this to simplify coding, has the side effect that people who leave the game stop doing fire damage
					CharacterI:TakeDirectDamage( character, instance.Value.X * deltaT, lastAttackingPlayer, { spell=true } )
				end
				if time() > instance.Value.Y or not lastAttackingPlayer then
					instance:Destroy()
				end
			end
		end	
		
		-- redundant, also on client, this probably does next-to-nothing beacuse if a hacker hacks the client the character
		-- will just move as far as they want no matter their walkspeed
		local pcData = CharacterI:GetPCData( player )
		local calculatedWalkspeed = CharacterPhysics:CalculateWalkSpeed( character, pcData )
		humanoid.WalkSpeed = CharacterUtility:IsFrozen( character ) and 0 or calculatedWalkspeed
		humanoid.JumpPower = CharacterUtility:IsFrozen( character ) and 0 or CharacterPhysics:CalculateJumpPower( character, pcData )				
	end			
	
	local manaValueO = character:FindFirstChild("ManaValue")
	if manaValueO then
		local maxManaO = character:FindFirstChild("MaxManaValue")
		DebugXL:Assert( maxManaO )
		local newManaValue = math.min( maxManaO.Value, manaValueO.Value + maxManaO.Value * manaRegenRate * deltaT )
		manaValueO.Value = newManaValue 
	end
end




game["Run Service"].Heartbeat:Connect( function( deltaT )
	-- monitor freezing
	for _, player in pairs( game.Players:GetPlayers() ) do
		if player.Character then
			if player.Character.Parent == workspace then
				ProcessPC( player.Character, deltaT )
			end
		end
	end
end)


return CharacterXL


