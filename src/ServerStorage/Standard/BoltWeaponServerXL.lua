print( script:GetFullName().." executed" )

-- a 'bolt' is a projectile that travels at a fixed speed in a straight line; this code works for crossbows, arrows, fireballs, etc
local InstanceXL          = require( game.ReplicatedStorage.Standard.InstanceXL )
local BoltWeaponUtilityXL = require( game.ReplicatedStorage.Standard.BoltWeaponUtilityXL )
local WeaponUtility       = require( game.ReplicatedStorage.Standard.WeaponUtility )

local FlexEquipUtility    = require( game.ReplicatedStorage.Standard.FlexEquipUtility )

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
	local Debris = game:GetService("Debris")
	
--	BaseUrl = "http://www.roblox.com/asset/?id="
	
	local Bolt = Tool:WaitForChild("Bolt"):Clone()
--	--print( Tool:GetFullName().." found Bolt" )
	-- we want to delete the Bolt so it's not floating around in the environment,
	-- but we don't want to do it before the client has also cloned it
	
	local owningHumanoid = nil

	local ToolEquipped = false
	
	Tool.Enabled = true

	local Character = nil
	local Player = nil
	local flexToolInst

	local function CheckIfAlive()
		return (((Character and Character.Parent and owningHumanoid and owningHumanoid.Parent and owningHumanoid.Health > 0 and Player and Player.Parent) and true) or false)
	end
	
	local enabled = true
	
	local RemoteFunctions = {}	
	
	function RemoteFunctions.DestroyBoltTemplate()
		local bolt = Tool:FindFirstChild("Bolt")
		if bolt then
			bolt:Destroy()
		end
	end
	
	function RemoteFunctions.OnActivated( _, targetV3, boltCodeName )
	--	if not Tool.Enabled or not CheckIfAlive() or not ToolEquipped then	
--		warn( Character.Name.." activated bolt" )		-- was checking why bolt failed but it seems it doesn't even get here
		if not ToolEquipped then  
	--			--print( Character.Name.." unequipped, can't fire" )  -- not only that, variables might not be set up
			return			
		end
		if not WeaponServer:CheckRequirements( Tool, Player ) then return end
		if not CheckIfAlive() then
--			--print( Character.Name.." not alive, can't fire" )
			return
		end
		local player = Players:GetPlayerFromCharacter( Character )
		if WeaponUtility:IsCoolingDown( player ) then return end
		local BoltDisplay = Tool:FindFirstChild("BoltDisplay")
		if enabled then
			if Mana:SpendMana( Character, Tool.ManaCost.Value ) then				
				-- enabled = false  -- relying on Cooldown system instead because bolts sometimes stopped working
				if BoltDisplay then
					BoltDisplay.Transparency = 1
				end
			--	Sounds.Fire:Play()  -- sound comes from client
				local bolt = BoltWeaponUtilityXL:Fire( Tool, Bolt, targetV3 )
				bolt.Name = boltCodeName
				bolt.Parent = workspace.ActiveServerProjectiles   -- can't put this in Tool because then the client will destroy it on the server as well
				bolt:SetNetworkOwner( nil )
				if Handle:FindFirstChild("Draw") then
					Handle.Draw:Play()
				end
				WeaponUtility:CooldownWait( player, Tool.Cooldown.Value, FlexEquipUtility:GetAdjStat( flexToolInst, "walkSpeedMulN" ) )
				if BoltDisplay then
					BoltDisplay.Transparency = 0
				end
			end
		else
--			--print( Character.Name.." bolt not enabled, can't fire" )
		end
	
		enabled = true
	end
	

	local function Equipped(Mouse)
		Character = Tool.Parent
		flexToolInst = FlexibleTools:GetToolInst( Tool )
		owningHumanoid = Character:FindFirstChild("Humanoid")
		Player = Players:GetPlayerFromCharacter(Character)
		if WeaponServer:CheckRequirements( Tool, Player ) then		
			if not CheckIfAlive() then
				return
			end
			ToolEquipped = true
		end
	end
	
	local function Unequipped()
		ToolEquipped = false
	end
	
--	--print( Tool:GetFullName().." connecting remote event" )
	
	Tool.BoltWeaponRE.OnServerEvent:Connect( function( player, funcName, ... )
--		--print( player.Name.." fired bolt server event "..funcName )
		RemoteFunctions[ funcName ]( player, ... )
	end)
	
--	--print( Tool:GetFullName().." remote event connected" )
	
	Tool.Equipped:connect(Equipped)
	Tool.Unequipped:connect(Unequipped)
end

return BoltWeaponServerXL
