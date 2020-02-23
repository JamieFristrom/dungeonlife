print( script:GetFullName().." executed" )

local DebugXL             = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL          = require( game.ReplicatedStorage.Standard.InstanceXL )
local ThrownWeaponUtility = require( game.ReplicatedStorage.Standard.ThrownWeaponUtility )
local WeaponUtility       = require( game.ReplicatedStorage.Standard.WeaponUtility )

local FlexEquipUtility    = require( game.ReplicatedStorage.Standard.FlexEquipUtility )

local WeaponServer        = require( game.ServerStorage.Standard.WeaponServerModule )

local CharacterI          = require( game.ServerStorage.CharacterI )
local FlexibleTools       = require( game.ServerStorage.Standard.FlexibleToolsModule )
local Mana                = require( game.ServerStorage.ManaModule )

local showThrownObjOnServerB = true

local ThrownWeaponServer = {}


function ThrownWeaponServer.new( tool )
	local thrown = true
	--ObjectX.SaveTransparencyInfoRecursively( tool.Handle )

	local projectileTemplate = tool.Handle:Clone()
	local toolIdValue = tool.ToolId:Clone()
	
	local flexToolInst 
	
	toolIdValue.Parent = projectileTemplate

	local function Weld(parentObj)
		local w1 = Instance.new("Weld") 
	
		w1.Parent = parentObj.Handle 
        w1.Part0  = parentObj.Handle 
        w1.C1 = CFrame.new(0, -0.5, 0) * CFrame.fromEulerAnglesXYZ(math.pi/2, 0, 0)
	end


	local function onThrow( player, mouseHitV3 )
		if thrown == true then return end
		if WeaponUtility:IsCoolingDown( player ) then return end
		if tool.Remaining.Value <= 0 then return end
		
		-- MANA COST ONLY PARTIALLY IMPLEMENTED, NEEDS TO CHECK CLIENT AND USE ManaCost object value
		-- (if we ever make a magic lobber thing)
		if Mana:SpendMana( player.Character, FlexibleTools:GetManaCostN( tool ) ) then		
			thrown = true  -- redundant but theoretically harmless
			local character = player.Character
			local humanoid = character.Humanoid
			if humanoid == nil then return end
		--	local targetPos = humanoid.TargetPoint
			local thrownObj
			if showThrownObjOnServerB then
				thrownObj = ThrownWeaponUtility.Lob( player, projectileTemplate, mouseHitV3 ) 			
				thrownObj.Parent = workspace.ActiveServerProjectiles
				
	--			Collisions.AssignToPlayersCollisionGroup( thrownObj, player )		
				thrownObj:SetNetworkOwner( nil )
			end
			
			-- we've rewritten this so the lobbed item will supposedly survive having its tool rmoved

			local cooldownN = tool.Cooldown.Value
			
			tool.Remaining.Value = tool.Remaining.Value - 1
			if tool.Remaining.Value <= 0 then
				-- we need to wait for tool action to resolve before destroying lest we mess things up
				-- if thrownObj then thrownObj.AncestryChanged:Wait() end  -- didn't work
--				while thrownObj and thrownObj.Parent == workspace.ActiveServerProjectiles do wait(0.1) end
				--print( "Destroying "..player.Name.."'s "..tool.Name.." id "..tool.ToolId.Value )
				FlexibleTools:RemoveToolWait( player, tool )
			end
			
			WeaponUtility:CooldownWait( player, cooldownN, FlexEquipUtility:GetAdjStat( flexToolInst, "walkSpeedMulN" ) )
			

			thrown = false
		end
	end
		
	local function onEquipped()
		flexToolInst = FlexibleTools:GetToolInst( tool )
		Weld(tool)
		local player = game.Players:GetPlayerFromCharacter( tool.Parent )
		if player then
			WeaponServer:CheckRequirements( tool, player )
		end 		
	end
	
	-- no longer necessary now that unequipping gets rid of
--	local function onUnequipped()
--		Weld(tool)
--	end
	
	local Bomb = {}
	
	function Bomb.Activate( player, mouseHitV3 )
		if not WeaponServer:CheckRequirements( tool, player ) then return end
		onThrow( player, mouseHitV3 )
	end
	
	tool.BombRemoteEvent.OnServerEvent:Connect( function( player, funcName, ... ) 
		Bomb[ funcName ]( player, ... )
	end)
	
	thrown = false
	
	tool.Equipped:connect(onEquipped)
	--tool.Unequipped:connect(onUnequipped)
	--tool.Activated:connect(onThrow)
	Weld(tool)
end



return ThrownWeaponServer
