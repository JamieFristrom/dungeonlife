
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

-- animation and audio are on client
-- damage is on server
-- both independently check for best target; will once in a while be out of sync but nonfatal

local CharacterI    = require( game.ServerStorage.CharacterI )
local FlexibleTools = require( game.ServerStorage.Standard.FlexibleToolsModule )

local WeaponServer  = require( game.ServerStorage.Standard.WeaponServerModule )

local FlexEquipUtility = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local WeaponUtility    = require( game.ReplicatedStorage.Standard.WeaponUtility )

local GeneralWeaponUtility = require( game.ReplicatedStorage.TS.GeneralWeaponUtility ).GeneralWeaponUtility

local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer

local MeleeWeaponServerXL = {}

function MeleeWeaponServerXL.new( Tool )
	DebugXL:Assert( Tool )
	DebugXL:logI( LogArea.Items, 'MeleeWeaponServerXL.new('..Tool:GetFullName()..')' )
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
	
	local function OnActivated()		
		DebugXL:logD( LogArea.Combat, 'MeleeWeaponServerXL::OnActivated')
		if not WeaponServer:CheckRequirements( Tool, Player ) then
			DebugXL:logD( LogArea.Combat, Character.Name.." does not meet requirements for "..Tool.Name ) 
			return 
		end
		if GeneralWeaponUtility.isCoolingDown( Character ) then 
			DebugXL:logV( LogArea.Combat, Character.Name.."'s weapon still cooling down" ) 
			return 
		end
		
		-- had trouble deciding whether to put this in cooldown or not
		if Humanoid.Health <= 0 then 
			DebugXL:logV( LogArea.Combat, Character.Name.." attacking while dead" ) 
			return 
		end
--		
		if Player then
			PlayerServer.markAttack( Player, "Melee" )
		end

		local range = flexToolInst:getBaseData().rangeN
		local bestTarget, bestFitN = unpack( GeneralWeaponUtility.findClosestVisibleTarget( Character, range ) )
		if bestTarget then
--			--print( Character.Name.." found target "..bestTarget.Name )
			DebugXL:logI( LogArea.Combat, Character.Name.." in range. Applying damage to "..bestTarget.Name )
			CharacterI:TakeFlexToolDamage( bestTarget, Character, Player and Player.Team or game.Teams.Monsters, flexToolInst )
			if Player then
				PlayerServer.markHit( Player, "Melee" )
			end			

			FlexibleTools:CreateExplosionIfNecessary( Tool, WeaponUtility:GetTargetPoint( bestTarget ) )
		end

		GeneralWeaponUtility.cooldownWait( Character, flexToolInst:getBaseData().cooldownN, FlexEquipUtility:GetAdjStat( flexToolInst, "walkSpeedMulN" ) )
	end
	
	local function OnEquipped()
		DebugXL:logD( LogArea.Items, Tool:GetFullName()..' MeleeWeaponServerXL OnEquipped' )
		Character = Tool.Parent
		flexToolInst = FlexibleTools:GetFlexToolFromInstance( Tool )
		Humanoid = Character:FindFirstChildOfClass('Humanoid')
		Player = game.Players:GetPlayerFromCharacter(Character)
		if WeaponServer:CheckRequirements( Tool, Player ) then
			UnsheathSound:Play()
		end
	end
	
	
	Tool.Activated:Connect(OnActivated)
	Tool.Equipped:Connect(OnEquipped)
	DebugXL:logD( LogArea.Items, Tool:GetFullName()..' events connected' )

end


return MeleeWeaponServerXL
