
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

-- animation and audio are on client
-- damage is on server
-- both independently check for best target; will once in a while be out of sync but nonfatal

local CharacterI    = require( game.ServerStorage.CharacterI )
local FlexibleTools = require( game.ServerStorage.Standard.FlexibleToolsModule )

local FlexibleToolsServer  = require( game.ServerStorage.TS.FlexibleToolsServer ).FlexibleToolsServer

local FlexEquipUtility = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local WeaponUtility    = require( game.ReplicatedStorage.Standard.WeaponUtility )

local GeneralWeaponUtility = require( game.ReplicatedStorage.TS.GeneralWeaponUtility ).GeneralWeaponUtility

local MainContext = require( game.ServerStorage.TS.MainContext ).MainContext

local MeleeWeaponServerXL = {}
MeleeWeaponServerXL.__index = MeleeWeaponServerXL

-- context can be undefined in which case we use MainContext. That way I didn't have to rewrite all the weapon scripts
-- but I'm forbidding it on the typescript side
function MeleeWeaponServerXL.new( Tool, context )  
	local meleeWeapon = {}
	setmetatable( meleeWeapon, MeleeWeaponServerXL )

	DebugXL:Assert( Tool )
	DebugXL:Assert( Tool:IsA("Tool") )

	if not context then
		context = MainContext:get()
	end
	meleeWeapon.context = context

	meleeWeapon.Tool = Tool
	DebugXL:logI( LogArea.Items, 'MeleeWeaponServerXL.new('..Tool:GetFullName()..')' )
	local Handle = Tool:FindFirstChild("Handle")
	DebugXL:Assert( Handle )
	if not Handle then return end

	-- validate
	if not Handle:FindFirstChild("Hit") then
		DebugXL:Error( Tool:GetFullName().." missing Hit sound" )
	end
	
	meleeWeapon.unsheathSound = Handle:WaitForChild("Unsheath")
	meleeWeapon.unsheathSound.Volume = 1
	
	Tool.Activated:Connect(function() meleeWeapon:OnActivated() end)
	Tool.Equipped:Connect(function() meleeWeapon:OnEquipped() end)
	DebugXL:logD( LogArea.Items, Tool:GetFullName()..' events connected' )

	return meleeWeapon
end

function MeleeWeaponServerXL:OnActivated()		
	DebugXL:logD( LogArea.Combat, 'MeleeWeaponServerXL::OnActivated')
	if not FlexibleToolsServer.recheckRequirements( 
			self.context:getPlayerTracker(), 
			FlexibleTools:GetFlexToolFromInstance( self.Tool ),
			self.Player ) then 
		DebugXL:logD( LogArea.Combat, self.Character.Name.." does not meet requirements for "..self.Tool.Name ) 
		return 
	end
	if GeneralWeaponUtility.isCoolingDown( self.Character ) then 
		DebugXL:logV( LogArea.Combat, self.Character.Name.."'s weapon still cooling down" ) 
		return 
	end
	
	-- had trouble deciding whether to put this in cooldown or not
	if self.Humanoid.Health <= 0 then 
		DebugXL:logV( LogArea.Combat, self.Character.Name.." attacking while dead" ) 
		return 
	end
--		
	if self.Player then
		self.context:getPlayerTracker():markAttack( self.Player, "Melee" )
	end

	local range = self.flexToolInst:getBaseData().rangeN
	local cr = self.context:getPlayerTracker():getCharacterRecordFromCharacter( self.Character )
	local bestTarget, bestFitN = unpack( GeneralWeaponUtility.findClosestVisibleTarget( self.Character, cr:getTeam(), range ) )
	if bestTarget then
--			--print( self.Character.Name.." found target "..bestTarget.Name )
		DebugXL:logI( LogArea.Combat, self.Character.Name.." in range. Applying damage to "..bestTarget.Name )
		CharacterI:TakeFlexToolDamage( self.context, bestTarget, self.Character, self.flexToolInst, self.Tool )
		if self.Player then
			self.context:getPlayerTracker():markHit( self.Player, "Melee" )
		end			

		FlexibleTools:CreateExplosionIfNecessary( self.Tool, WeaponUtility:GetTargetPoint( bestTarget ) )
	end

	GeneralWeaponUtility.cooldownWait( self.Character, self.flexToolInst:getBaseData().cooldownN, FlexEquipUtility:GetAdjStat( self.flexToolInst, "walkSpeedMulN" ) )
end

function MeleeWeaponServerXL:OnEquipped()
	DebugXL:logD( LogArea.Items, self.Tool:GetFullName()..' MeleeWeaponServerXL OnEquipped' )
	self.Character = self.Tool.Parent
	self.flexToolInst = FlexibleTools:GetFlexToolFromInstance( self.Tool )
	self.Humanoid = self.Character:FindFirstChildOfClass('Humanoid')
	self.Player = game.Players:GetPlayerFromCharacter(self.Character)
	if not FlexibleToolsServer.recheckRequirements( 
			self.context:getPlayerTracker(), 
			FlexibleTools:GetFlexToolFromInstance( self.Tool ),
			self.Player ) then 
		DebugXL:logD( LogArea.Combat, self.Character.Name.." does not meet requirements for "..self.Tool.Name ) 
		return 
	end
end


return MeleeWeaponServerXL
