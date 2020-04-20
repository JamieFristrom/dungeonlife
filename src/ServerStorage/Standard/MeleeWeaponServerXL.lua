print( script:GetFullName().." executed" )
-- animation and audio are on client
-- damage is on server
-- both independently check for best target; will once in a while be out of sync but nonfatal
local DebugXL       = require( game.ReplicatedStorage.Standard.DebugXL )

local CharacterI    = require( game.ServerStorage.CharacterI )
local FlexibleTools = require( game.ServerStorage.Standard.FlexibleToolsModule )

local WeaponServer  = require( game.ServerStorage.Standard.WeaponServerModule )

local FlexEquipUtility = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local WeaponUtility    = require( game.ReplicatedStorage.Standard.WeaponUtility )

local MeleeWeaponClient    = require( game.ReplicatedStorage.TS.MeleeWeaponClient ).MeleeWeaponClient

local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer

local MeleeWeaponServerXL = {}

function MeleeWeaponServerXL.new( Tool )
	DebugXL:Assert( Tool )
	DebugXL:logI( 'Items', 'MeleeWeaponServerXL.new('..Tool:GetFullName()..')' )
	local Handle = Tool:FindFirstChild("Handle")
	DebugXL:Assert( Handle )
	if not Handle then return end

	-- validate
	if not Handle:FindFirstChild("Hit") then
		DebugXL:Error( Tool:GetFullName().." missing Hit sound" )
	end
	
	local Player
	local Character
	local Humanoid
	local flexToolInst
	
	local UnsheathSound = Handle:WaitForChild("Unsheath")
	UnsheathSound.Volume = 1
	local SlashSound = Handle:WaitForChild("Slash")
	SlashSound.Volume = 1
	
	local LastAttack = 0
	
	local function OnActivated()		
		DebugXL:logD( 'Combat', 'MeleeWeaponServerXL::OnActivated')
		if not WeaponServer:CheckRequirements( Tool, Player ) then
			DebugXL:logD( 'Combat', Player.Name.." does not meet requirements for "..Tool.Name ) 
			return 
		end
		if WeaponUtility:IsCoolingDown( Player ) then 
			DebugXL:logV( 'Combat', Player.Name.."'s weapon still cooling down" ) 
			return 
		end
		
		-- had trouble deciding whether to put this in cooldown or not
		if Humanoid.Health <= 0 then 
			DebugXL:logV( 'Combat', Player.Name.." attacking while dead" ) 
			return 
		end

		if WeaponUtility:IsCoolingDown( Player ) then
			DebugXL:logV( 'Combat', Player.Name.."'s "..Tool.Name.." is still cooling" )
			return 
		end
--		
		PlayerServer.markAttack( Player, "Melee" )
		local bestTarget, bestFitN = unpack( WeaponUtility:FindClosestTargetInCone( Character, MeleeWeaponClient.swordSweepDot ) )
		if bestTarget then
--			--print( Character.Name.." found target "..bestTarget.Name )
			if bestFitN <= Tool:FindFirstChild('Range').Value then
				DebugXL:logI( 'Combat', Player.Name.." in range. Applying damage to "..bestTarget.Name )
				CharacterI:TakeFlexToolDamage( bestTarget, Player, flexToolInst )
				PlayerServer.markHit( Player, "Melee" )
				

				FlexibleTools:CreateExplosionIfNecessary( Tool, WeaponUtility:GetTargetPoint( bestTarget ) )
			end
		end

		WeaponUtility:CooldownWait( Player, Tool.Cooldown.Value, FlexEquipUtility:GetAdjStat( flexToolInst, "walkSpeedMulN" ) )
	end
	
	local function OnEquipped()
		Character = Tool.Parent
		flexToolInst = FlexibleTools:GetToolInst( Tool )
		Humanoid = Character:FindFirstChildOfClass('Humanoid')
		Player = game.Players:GetPlayerFromCharacter(Character)
		if WeaponServer:CheckRequirements( Tool, Player ) then
			UnsheathSound:Play()
		end
	end
	
		
	Tool.Activated:Connect(OnActivated)
	Tool.Equipped:Connect(OnEquipped)
	DebugXL:logD( 'Items', Tool:GetFullName()..' events connected' )

end


return MeleeWeaponServerXL
