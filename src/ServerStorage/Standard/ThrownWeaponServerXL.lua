
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local FlexEquipUtility    = require( game.ReplicatedStorage.Standard.FlexEquipUtility )

local WeaponServer        = require( game.ServerStorage.Standard.WeaponServerModule )

local FlexibleTools       = require( game.ServerStorage.Standard.FlexibleToolsModule )

local FlexibleToolsServer = require( game.ServerStorage.TS.FlexibleToolsServer ).FlexibleToolsServer
local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer

local GeneralWeaponUtility = require( game.ReplicatedStorage.TS.GeneralWeaponUtility ).GeneralWeaponUtility
local ThrownWeaponHelpers = require( game.ReplicatedStorage.TS.ThrownWeaponHelpers ).ThrownWeaponHelpers

local showThrownObjOnServerB = true

local ThrownWeaponServer = {}


function ThrownWeaponServer.new( tool )
	local thrown = true
	--ObjectX.SaveTransparencyInfoRecursively( tool.Handle )

	local toolObjectValue = tool.Handle:FindFirstChild('Tool')
	DebugXL:Assert( toolObjectValue )
	if not toolObjectValue then
		return
	end
	toolObjectValue.Value = tool
	local projectileTemplate = tool.Handle:Clone()
	
	local flexToolInst 

	local function Weld(parentObj)
		local w1 = Instance.new("Weld") 
	
		w1.Parent = parentObj.Handle 
        w1.Part0  = parentObj.Handle 
        w1.C1 = CFrame.new(0, -0.5, 0) * CFrame.fromEulerAnglesXYZ(math.pi/2, 0, 0)
	end


	local function onThrow( player, mouseHitV3 )
		if thrown == true then return end
		local character = player.Character
		if GeneralWeaponUtility.isCoolingDown( character ) then return end
		if tool.Remaining.Value <= 0 then return end

		-- to do; if lobbed items are ever spells they need mana cost
		thrown = true  -- redundant but theoretically harmless
		local humanoid = character.Humanoid
		if humanoid == nil then return end
	--	local targetPos = humanoid.TargetPoint
		local thrownObj
		if showThrownObjOnServerB then
			thrownObj = ThrownWeaponHelpers.lob( player, projectileTemplate, mouseHitV3 ) 			
			thrownObj.Parent = workspace.ActiveServerProjectiles
			
--			Collisions.AssignToPlayersCollisionGroup( thrownObj, player )		
			thrownObj:SetNetworkOwner( nil )
		end
		
		-- we've rewritten this so the lobbed item will supposedly survive having its tool rmoved
		local flexToolInst = FlexibleTools:GetFlexToolFromInstance( tool )
		DebugXL:Assert( flexToolInst )
		if flexToolInst then
			local cooldownN = flexToolInst:getBaseData().cooldownN
			
			tool.Remaining.Value = tool.Remaining.Value - 1
			if tool.Remaining.Value <= 0 then
				-- we need to wait for tool action to resolve before destroying lest we mess things up
				-- if thrownObj then thrownObj.AncestryChanged:Wait() end  -- didn't work
	--				while thrownObj and thrownObj.Parent == workspace.ActiveServerProjectiles do wait(0.1) end
				FlexibleToolsServer.removeToolWait(tool, character)
				if player.Team == game.Teams.Heroes then
					require( game.ServerStorage.Standard.HeroesModule ):SaveHeroesWait( player )		
				else
					local pcData = PlayerServer.getCharacterRecordFromPlayer(player)
					DebugXL:Assert( pcData )
					workspace.Signals.HotbarRE:FireClient( player, "Refresh", pcData )
				end				
			end
			
			GeneralWeaponUtility.cooldownWait( character, cooldownN, FlexEquipUtility:GetAdjStat( flexToolInst, "walkSpeedMulN" ) )
			
			thrown = false
		end
	end
		
	local function onEquipped()
		flexToolInst = FlexibleTools:GetFlexToolFromInstance( tool )
		Weld(tool)
		local player = game.Players:GetPlayerFromCharacter( tool.Parent )
		if player then
			if not FlexibleToolsServer.recheckRequirements( 
					PlayerServer.getPlayerTracker(), 
					flexToolInst,
					player ) then 
				return 
			end
		end 		
	end
	
	-- no longer necessary now that unequipping gets rid of
--	local function onUnequipped()
--		Weld(tool)
--	end
	
	local Bomb = {}
	
	function Bomb.Activate( player, mouseHitV3 )
		if not FlexibleToolsServer.recheckRequirements( 
				PlayerServer.getPlayerTracker(), 
				FlexibleTools:GetFlexToolFromInstance( tool ),
				player ) then 
			return 
		end
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
