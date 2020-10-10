local InstanceXL       = require( game.ReplicatedStorage.Standard.InstanceXL )


local CharacterUtility = {}

function CharacterUtility:IsFrozen( character )
	return character:FindFirstChild("FrozenUntil")
end


-- slows and fasts don't stack, but affect each other:
function CharacterUtility:GetWalkSpeedMul( character )
	local minSlow = 1
	local maxFast = 1
	for _, value in pairs( character:GetChildren() ) do
		if value.Name == "WalkSpeedMulUntil" then
			minSlow = math.min( value.Value.X, minSlow )  -- keeping how much to slow as a % in x  (z has duration)
			maxFast = math.max( value.Value.X, maxFast )
		end 
	end
	return minSlow * maxFast
end


function CharacterUtility:HasWalkSpeedBuffs( character )
	for _, value in pairs( character:GetChildren() ) do
		if value.Name == "WalkSpeedMulUntil" then
			if value.Value.X > 1 then
				return true
			end
		end 
	end
	return false
end


function CharacterUtility:GetSlowCooldownPct( character )
	local minSlow = 1
	for _, slow in pairs( character:GetChildren() ) do
		if slow.Name == "CooldownMulUntil" then
			minSlow = math.min( slow.Value.X, minSlow )  -- keeping how much to slow as a % in y  (z has duration)
			print("Cooldown slowed "..minSlow )
		end 
	end
	local haste = 1
	local primaryPart = character.PrimaryPart
	if( primaryPart )then
		for _, wisp in pairs( workspace.Summons:GetChildren() ) do
			if( wisp.PrimaryPart )then
				if(( wisp.PrimaryPart.Position - primaryPart.Position ).Magnitude <= wisp.Range.Value )then
					local player = game.Players:GetPlayerFromCharacter( character )
					if player then 
						if wisp.Name == "HasteWisp" then
							if( player.Team == game.Teams.Heroes )then
								-- they don't stack
								haste = math.max( 1+wisp.EffectStrength.Value, haste )
							end
						elseif wisp.Name == "CurseWisp" then
							if( player.Team ~= game.Teams.Heroes )then
								-- they don't stack
								minSlow = math.min( 1-wisp.EffectStrength.Value, minSlow )
							end
						end
					end
				end
			end
		end
	end
	return minSlow * haste
end


function CharacterUtility:GetLastAttackingPlayer( character )
--	--print("GetLastAttackingPlayer for "..character.Name )
	local humanoid = character:FindFirstChild("Humanoid")
	if humanoid then
--		--print("Found humanoid")
		local creatorTag = humanoid:FindFirstChild("creator")
		if creatorTag then
--			--print("Found creator tag: "..creatorTag.Value.Name )
			return creatorTag.Value
		end
	end
	return nil
end


return CharacterUtility
