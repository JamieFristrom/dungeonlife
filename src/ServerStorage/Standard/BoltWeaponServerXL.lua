local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
DebugXL:logI( 'Executed', script:GetFullName())

-- a 'bolt' is a projectile that travels at a fixed speed in a straight line; this code works for crossbows, arrows, fireballs, etc
local BoltWeaponUtilityXL = require( game.ReplicatedStorage.Standard.BoltWeaponUtilityXL )

local FlexEquipUtility    = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local GeneralWeaponUtility = require( game.ReplicatedStorage.TS.GeneralWeaponUtility ).GeneralWeaponUtility

local WeaponServer        = require( game.ServerStorage.Standard.WeaponServerModule )

local FlexibleTools       = require( game.ServerStorage.Standard.FlexibleToolsModule )
local Mana                = require( game.ServerStorage.ManaModule )

--print( "Made it here")

local BoltWeaponServerXL = {}

function BoltWeaponServerXL.new( Tool )
--	--print( Tool:GetFullName().." new" )
	local Handle = Tool:WaitForChild("Handle")
--	--print( Tool:GetFullName().." found Handle" )
	
	local Players = game:GetService("Players")
	
--	BaseUrl = "http://www.roblox.com/asset/?id="
	
	local Bolt = Tool:WaitForChild("Bolt"):Clone()
--	--print( Tool:GetFullName().." found Bolt" )
	-- we want to delete the Bolt so it's not floating around in the environment,
	-- but we don't want to do it before the client has also cloned it
	
	local owningHumanoid = nil

	Tool.Enabled = true

	local Character = nil
	local Player = nil
	local flexToolInst

	local function CheckIfAlive()
		return (((Character and Character.Parent and owningHumanoid and owningHumanoid.Parent and owningHumanoid.Health > 0 ) and true) or false)
	end
	
	local RemoteFunctions = {}	
	
	function RemoteFunctions.DestroyBoltTemplate()
		local bolt = Tool:FindFirstChild("Bolt")
		if bolt then
			bolt:Destroy()
		end
	end
	
	function RemoteFunctions.OnActivated( _, targetV3, boltCodeName )
	--	if not Tool.Enabled or not CheckIfAlive() or not ToolEquipped then	
		if not Character then
			DebugXL:logW( 'Combat', 'Firing '..Tool:GetFullName()..' before Character set')
			return
		end
		DebugXL:logD( 'Combat', Character.Name..' activated bolt' )
		if not GeneralWeaponUtility.isEquippedBy( Tool, Character ) then  
			DebugXL:logV( 'Combat', Character.Name.." unequipped, can't fire" )  -- not only that, variables might not be set up
			return			
		end
		if not WeaponServer:CheckRequirements( Tool, Player ) then return end
		if not CheckIfAlive() then
			DebugXL:logI( 'Combat', Character.Name.." not alive, can't fire" )
			return
		end

		if GeneralWeaponUtility.isCoolingDown( Character ) then 
			DebugXL:logI( 'Combat', Character.Name.." attempted to activate bolt while uncool")
			return 
		end
		
		local BoltDisplay = Tool:FindFirstChild("BoltDisplay")

		if Mana:SpendMana( Character, flexToolInst:getManaCost() ) then				
			DebugXL:logI( 'Combat', Character.Name.." firing bolt")
			if BoltDisplay then
				BoltDisplay.Transparency = 1
			end
		--	Sounds.Fire:Play()  -- sound comes from client
			local bolt = BoltWeaponUtilityXL.Fire( Tool, Bolt, targetV3 )
			bolt.Name = boltCodeName
			bolt.Parent = workspace.ActiveServerProjectiles   -- can't put this in Tool because then the client will destroy it on the server as well
			bolt:SetNetworkOwner( nil )
			if Handle:FindFirstChild("Draw") then
				Handle.Draw:Play()
			end
			GeneralWeaponUtility.cooldownWait( Character, flexToolInst:getBaseData().cooldownN, FlexEquipUtility:GetAdjStat( flexToolInst, "walkSpeedMulN" ) )
			if BoltDisplay then
				BoltDisplay.Transparency = 0
			end
		end
	end
	

	local function Equipped(Mouse)
		DebugXL:logD( 'Items', Tool:GetFullName()..' BoltWeaponServerXL OnEquipped' )
		Character = Tool.Parent
		flexToolInst = FlexibleTools:GetFlexToolFromInstance( Tool )
		owningHumanoid = Character:FindFirstChild("Humanoid")
		Player = Players:GetPlayerFromCharacter(Character)
	end
	
	local function Unequipped()
	end
	
--	--print( Tool:GetFullName().." connecting remote event" )
	
	Tool.BoltWeaponRE.OnServerEvent:Connect( function( player, funcName, ... )
--		--print( player.Name.." fired bolt server event "..funcName )
		DebugXL:logD( 'Combat', player.Name..' fired bolt server event '..funcName)
		RemoteFunctions[ funcName ]( player, ... )
	end)

	Tool.RangedWeaponBE.Event:Connect( function( funcName, ... )
		DebugXL:logD( 'Combat', 'Bolt bindable event '..funcName..' fired')
		RemoteFunctions[ funcName ]( nil, ... )
	end)
	
--	--print( Tool:GetFullName().." remote event connected" )
	
	Tool.Equipped:connect(Equipped)
	Tool.Unequipped:connect(Unequipped)
end

return BoltWeaponServerXL
