print( script:GetFullName().." executed" )

local DebugXL              = require( game.ReplicatedStorage.Standard.DebugXL )

local BoltWeaponUtilityXL = {}

function BoltWeaponUtilityXL.Fire( tool, boltTemplate, targetV3, speedN )
	local speedN = speedN or 1
	local handle = tool.Handle
	local character = tool.Parent
	
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

	bolt:WaitForChild("creator").Value = character
	bolt:WaitForChild("Tool").Value    = tool
	
	game.Debris:AddItem(bolt, 20)
	
	return bolt
end	

return BoltWeaponUtilityXL
