print( script:GetFullName().." executed" )
-- animation and audio are on client
-- damage is on server
-- both independently check for best target; will once in a while be out of sync but nonfatal
local DebugXL       = require( game.ReplicatedStorage.Standard.DebugXL )
local TableXL       = require( game.ReplicatedStorage.Standard.TableXL )

local CharacterI    = require( game.ServerStorage.CharacterI )
local FlexibleTools = require( game.ServerStorage.Standard.FlexibleToolsModule )

local CharacterXL   = require( game.ServerStorage.Standard.CharacterXL )
local WeaponServer  = require( game.ServerStorage.Standard.WeaponServerModule )

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )
local FlexEquipUtility = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local WeaponUtility    = require( game.ReplicatedStorage.Standard.WeaponUtility )

local MeleeWeaponClient    = require( game.ReplicatedStorage.TS.MeleeWeaponClient ).MeleeWeaponClient

local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer

local MeleeWeaponServerXL = {}

function MeleeWeaponServerXL.new( Tool )
	
	local Handle = Tool:FindFirstChild("Handle")
	if not Handle then return end

	-- validate
	if not Handle:FindFirstChild("Hit") then
		DebugXL:Error( Tool:GetFullName().." missing Hit sound" )
	end
	
	--local Sword = require( script.MainModule )
	
	local Player
	local Character
	local Humanoid
	local Torso	
	local flexToolInst
	
	--local SwordData = Sword.SwordFunctions.GetData("HeroesAxe")
	--local SwordModel = Sword.SwordFunctions.GetSword("HeroesAxe")
	--local Config = Sword.SwordFunctions.CreateConfiguration(Tool, SwordData)
	
	local UnsheathSound = Handle:WaitForChild("Unsheath")
	UnsheathSound.Volume = 1
	local SlashSound = Handle:WaitForChild("Slash")
	SlashSound.Volume = 1
	
	local LastAttack = 0
	

	
	local function OnActivated()		
		if not WeaponServer:CheckRequirements( Tool, Player ) then
			--print( Player.Name.." does not meet requirements for "..Tool.Name ) 
			return 
		end
		if WeaponUtility:IsCoolingDown( Player ) then 
			return 
		end
		
		-- had trouble deciding whether to put this in cooldown or not
		if Humanoid.Health <= 0 then return end
		
		if not Tool.Enabled then 
--			--print( Player.Name.."'s "..Tool.Name.." is not enabled" )
			return 
		end
		Tool.Enabled = false
--		
		PlayerServer.markAttack( Player, "Melee" )
		local bestTarget, bestFitN = unpack( WeaponUtility:FindClosestTargetInCone( Character, MeleeWeaponClient.swordSweepDot ) )
		if bestTarget then
--			--print( Character.Name.." found target "..bestTarget.Name )
			if bestFitN <= Tool:FindFirstChild('Range').Value then
--				--print( "In range" )
				CharacterI:TakeFlexToolDamage( bestTarget, Player, flexToolInst )
				PlayerServer.markHit( Player, "Melee" )
				
--              actually it looks/sounds off if we do it here, it comes too late  
--				Tool.Handle.Hit:Play()

				FlexibleTools:CreateExplosionIfNecessary( Tool, WeaponUtility:GetTargetPoint( bestTarget ) )
			end
		end

		WeaponUtility:CooldownWait( Player, Tool.Cooldown.Value, FlexEquipUtility:GetAdjStat( flexToolInst, "walkSpeedMulN" ) )
		Tool.Enabled = true
	end
	
	local function OnEquipped()
		Character = Tool.Parent
		flexToolInst = FlexibleTools:GetToolInst( Tool )
		Humanoid = Character:FindFirstChildOfClass('Humanoid')
		Player = game.Players:GetPlayerFromCharacter(Character)
		if WeaponServer:CheckRequirements( Tool, Player ) then
			Torso = Character:FindFirstChild('HumanoidRootPart')
			
			UnsheathSound:Play()
		end
	end
	
--	local function OnUnequipped()
--		Player = nil
--		Character = nil
--		Humanoid = nil
--		Torso = nil
--	end
		
	Tool.Activated:Connect(OnActivated)
	Tool.Equipped:Connect(OnEquipped)
--	Tool.Unequipped:Connect(OnUnequipped)
end


return MeleeWeaponServerXL
