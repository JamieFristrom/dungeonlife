print( script:GetFullName().." executed" )

local DebugXL              = require( game.ReplicatedStorage.Standard.DebugXL )
local MathXL               = require( game.ReplicatedStorage.Standard.MathXL )
local RangedWeaponUtility  = require( game.ReplicatedStorage.Standard.RangedWeaponUtility )
local WeaponUtility        = require( game.ReplicatedStorage.Standard.WeaponUtility )

local FlexEquipUtility     = require( game.ReplicatedStorage.Standard.FlexEquipUtility )

local HeroUtility          = require( game.ReplicatedStorage.Standard.HeroUtility )

local AnimationManifestService = require( game.ReplicatedFirst.TS.AnimationManifestService ).AnimationManifestService

local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData

local BoltWeaponUtilityXL = {}

local lagHidingB = true

function BoltWeaponUtilityXL:Fire( tool, boltTemplate, targetV3, speedN )
	local speedN = speedN or 1
	local handle = tool.Handle
	local character = tool.Parent
	local player = game.Players:GetPlayerFromCharacter( character )
	DebugXL:Assert( player )
	
	local StartPosition = (handle.CFrame + CFrame.new(handle.Position, targetV3).lookVector * ((handle.Size.Z / 2) + (boltTemplate.Size.Z / 2)))

	local Direction = CFrame.new(StartPosition.p, targetV3)
	
	StartPosition = (StartPosition + Direction.lookVector * 2)

	Direction = CFrame.new(StartPosition.p, targetV3)
	
	local bolt = boltTemplate:clone()
	bolt.CFrame = Direction * CFrame.Angles(0, math.pi, 0)
	bolt.Velocity = Direction.lookVector * tool.Speed.Value * speedN

	local force = Instance.new("BodyForce")
	force.force = Vector3.new( 0, bolt:GetMass() * workspace.Gravity, 0 )
	force.Parent = bolt

	-- why both?  Don't worry, the wrong script won't run on the wrong server/client
	bolt:WaitForChild("BoltServerScript").Disabled = false
	bolt:WaitForChild("BoltClientScript").Disabled = false

	bolt:WaitForChild("creator").Value = player
	bolt:WaitForChild("Tool").Value    = tool
	
	game.Debris:AddItem(bolt, 20)
	
	return bolt
end	

function BoltWeaponUtilityXL.Create( Tool, messageFunc, flexTool, animName )
	local BoltToBeCloned = Tool:WaitForChild("Bolt")
	local childTest = BoltToBeCloned:WaitForChild("BoltClientScript",5)
	DebugXL:Assert( childTest )
	local Bolt = BoltToBeCloned:Clone()
	warn( "bolt cloned")
	DebugXL:Assert( Bolt:FindFirstChild("BoltClientScript"))

	local Handle = Tool:WaitForChild("Handle")
	
	local Players = game:GetService("Players")
	local Debris = game:GetService("Debris")
	
	local Sounds = {
		Fire = Handle:WaitForChild("Fire")
	}
	
	Tool:WaitForChild("BoltWeaponRE"):FireServer( "DestroyBoltTemplate" ) 
	
	local ToolEquipped = false
		
	local mouse
	
	local Character
	local Player
	local owningHumanoid

	local aimAndFireAnimObj = animName and AnimationManifestService.getAnimInstance( animName ) or nil
	local animTrack 

	local function CheckIfAlive()
		return (((Character and Character.Parent and owningHumanoid and owningHumanoid.Parent and owningHumanoid.Health > 0 and Player and Player.Parent) and true) or false)
	end
	
	local function Activated( )
	--	if not Tool.Enabled or not CheckIfAlive() or not ToolEquipped then
	
		if not CheckIfAlive() or not ToolEquipped then
			return
		end
		local BoltDisplay = Tool:FindFirstChild("BoltDisplay")

		if WeaponUtility:IsCoolingDown( Player ) then return end

		-- guess it's possible to get a shot off when dead?
		local manaValueObj = Character:FindFirstChild("ManaValue") 
		if not manaValueObj then
			DebugXL:Error( Character:GetFullName().." missing ManaValue." )
			return 
		end
		DebugXL:Assert( Character.ManaValue.Value >= 0 )
		if Character.ManaValue.Value >= Tool.ManaCost.Value then 
			Tool.Enabled = false
			if BoltDisplay then
				BoltDisplay.Transparency = 1
			end
			Sounds.Fire:Play()
			local serverBoltCodeName = "Bolt"..MathXL:RandomInteger( 1, 100000 )  -- this will fail mostly harmlessly every once in a great while
			--print( "BoltWeaponRE:FireServer" )
			
			-- can't use mouse hit because it collides with transparent objects
			local clickPart, clickHitV3 = RangedWeaponUtility:MouseHitNontransparent( mouse, { Character } )
			
			Tool.BoltWeaponRE:FireServer( "OnActivated", clickHitV3, serverBoltCodeName )
			if lagHidingB then
				if animTrack then
					animTrack:AdjustSpeed( 1 )
				end

				-- making the bolt go slower on the client is a poor man's way of doing lag compensation
				-- 0.5 was too slow, though, people noticed - 10/29					
				local bolt = BoltWeaponUtilityXL:Fire( Tool, Bolt, clickHitV3, 0.75 )
				bolt.Name = "ClientBolt"
				bolt.Parent = Tool
				-- why both is client and is not server?  Because when playing from studio both are true
				if game["Run Service"]:IsClient() and not game["Run Service"]:IsServer() then
					--print( "Spawning boltwatch function" )
					spawn( function()
						----print( "Waiting for bolt" )
						local serverBolt = workspace.ActiveServerProjectiles:WaitForChild( serverBoltCodeName )
						serverBolt:Destroy()
						--print "Destroyed server bolt" )
					end)
				end
			end
			local walkSpeedMulN = FlexEquipUtility:GetAdjStat( flexTool, "walkSpeedMulN" )
			--print "Beginning cooldown" )
			WeaponUtility:CooldownWait( Player, Tool.Cooldown.Value, walkSpeedMulN )
			--print "Cooldown finished" )
			if animTrack then
				animTrack:Play()
				animTrack:AdjustSpeed( 0 )
			end
			if BoltDisplay then
				BoltDisplay.Transparency = 0
			end
		else
			messageFunc( "OutOfMana" , false )				
		end
	end
	
	local function Equipped(Mouse)
		mouse = Mouse
		Character = Tool.Parent
		owningHumanoid = Character:FindFirstChild("Humanoid")
		Player = Players:GetPlayerFromCharacter(Character)
		if not CheckIfAlive() then
			return
		end
		if aimAndFireAnimObj then
			animTrack = owningHumanoid:LoadAnimation( aimAndFireAnimObj )
			animTrack:Play()
			-- first frame of animation is holding steady pose
			animTrack:AdjustSpeed( 0 )
		end
		ToolEquipped = true
	end
	
	local function Unequipped()
		if animTrack then
			animTrack:Stop()
		end
		mouse = nil
		ToolEquipped = false
	end

	
	Tool.Activated:connect(Activated)
	Tool.Equipped:connect(Equipped)
	Tool.Unequipped:connect(Unequipped)
end

	
return BoltWeaponUtilityXL
