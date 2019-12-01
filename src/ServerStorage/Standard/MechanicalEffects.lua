local DebugXL                 = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL              = require( game.ReplicatedStorage.Standard.InstanceXL )

local CharacterClientI        = require( game.ReplicatedStorage.CharacterClientI )

local CharacterI              = require( game.ServerStorage.CharacterI )

local CharacterXL             = require( game.ServerStorage.Standard.CharacterXL )

local MechanicalEffects = {}

-- these are . rather than : format because we typically pass the functions on

function MechanicalEffects.DamageOverTime( targetHumanoid, seconds, dps, tool )
	local attackingCharacter = tool.Parent
	local attackingPlayer = game.Players:GetPlayerFromCharacter( attackingCharacter )  -- fails silently which is what I want
	CharacterXL:DamageOverTimeFor( targetHumanoid.Parent, dps, seconds, attackingPlayer )
end

-- 0.3 & duration * 2 OP, I was locking people down
-- 0.6 & duration * 1 was weak

-- wishlist fix; abstract out monster and player stat blocks!
function MechanicalEffects.Slow( targetHumanoid, seconds, effect )
	CharacterXL:SpeedMulFor( targetHumanoid.Parent, 0.8, effect, seconds )  
end


function MechanicalEffects.Freeze( targetHumanoid, seconds )
	CharacterXL:FreezeFor( targetHumanoid.Parent, seconds )
end


function MechanicalEffects.DamageInstant( targetHumanoid, _, damage )
	-- usually this will accompany other damage so not bothering to record
	-- last attacker
	targetHumanoid:TakeDamage( damage )
	require( game.ServerStorage.CharacterFX.HealthChange ):Activate( targetHumanoid.Parent, -damage, false )		
end


-- wishlist fix: this also hits the target dummies in server storage. I wonder if it's possible to get XP from that?

-- explosions are different from other damage;  you want a weapon (such as a bomb) to create
-- one and only one explosion
-- we could go two ways here: we could have the explosion then chain tool damage, or have that
-- handled in the weapon code. Going with the latter, because most of our weapons already do their own
-- damage and didn't want to put in an exception
function MechanicalEffects.Explosion( positionV3, damage, radius, attackingPlayer, dontAttenuateB )
	DebugXL:Assert( attackingPlayer:IsA("Player"))
--	--print( "Creating explosion" )
	
	-- technically this part should be a cosmetic rather than mechanical effect - :?
	require( game.ServerStorage.CharacterFX.Explosion ):Activate( positionV3, radius )
		
	local attackingCharacter = attackingPlayer.Character
	local hitCharatersA = {}
	if attackingCharacter then
--		--print( "Attacking character is "..attackingCharacter.Name )
		for _, character in pairs( CharacterClientI:GetValidTargets( attackingCharacter ) ) do
			if character.PrimaryPart then
				local distance = ( character:GetPrimaryPartCFrame().p - positionV3 ).Magnitude
				if distance <= radius then
					table.insert( hitCharatersA, character )
					-- square root so people in radius get more noticeably damaged
					if( not dontAttenuateB )then
						damage = damage * math.sqrt( ( radius - distance ) / radius )
					end
					
--					--print("Damaging "..character.Name..": "..attenuatedDamage )
					CharacterI:TakeDirectDamage( character, damage, attackingPlayer, { ranged=true, spell=true } )
				else
--					--print( character.Name.." out of range" )
				end
			end
		end
	end
	
	return hitCharatersA
end


return MechanicalEffects