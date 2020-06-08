local DebugXL  = require( game.ReplicatedStorage.Standard.DebugXL )
DebugXL:logI('Executed', script.Name)

local InstanceXL = require( game.ReplicatedStorage.Standard.InstanceXL )
local RangedWeaponUtility = require( game.ReplicatedStorage.Standard.RangedWeaponUtility )
local GeneralWeaponUtility = require( game.ReplicatedStorage.TS.GeneralWeaponUtility ).GeneralWeaponUtility
--local RangedWeaponClient = require( game.ReplicatedStorage.StandardModules.RangedWeaponClientModule )
--local Raycast = require( game.ReplicatedStorage.StandardModules.RaycastModule )
--local RemoteX = require( game.ReplicatedStorage.StandardModules.RemoteXModule )

local SoundXL  = require( game.ReplicatedStorage.Standard.SoundXL )

local showMissileOnClientB = not game["Run Service"]:IsStudio() or not workspace.Standard.TestInStudio.Value


local ThrownWeaponClient = {}


local thrown = true
local velocityK = 150

	
function CreateThrownItem( projectileTemplate, player )

	local thrownObj = projectileTemplate:Clone()
    thrownObj.CanCollide = true

	thrownObj.Transparency = 0
	for _, child in pairs( thrownObj:GetDescendants() ) do
		if child:IsA("BasePart") then child.Transparency = 0 end 
	end
	
	InstanceXL.new( "ObjectValue", { Name = "creator", Parent = thrownObj, Value = player }, true )
	thrownObj.LobbedServer.Disabled = false
	thrownObj.LobbedClient.Disabled = false
	
--  wishlist: make it look like bomb disappears from your hand
--	spawn( function() ObjectX.FadeOutWait( heldBomb, 0, true ) end )
		
	return thrownObj
end
	
	
local function computeLaunchAngle(dx, dy, grav)
	-- http://en.wikipedia.org/wiki/Trajectory_of_a_projectile
	local g = math.abs(grav)
	local inRoot = (velocityK*velocityK*velocityK*velocityK) - (g * ((g*dx*dx) + (2*dy*velocityK*velocityK)))
	if inRoot <= 0 then
		return .25 * math.pi
	end
	local root = math.sqrt(inRoot)
	local inATan1 = ((velocityK*velocityK) + root) / (g*dx)
	local inATan2 = ((velocityK*velocityK) - root) / (g*dx)
	local answer1 = math.atan(inATan1)
	local answer2 = math.atan(inATan2)
	if answer1 < answer2 then return answer1 end
	return answer2
end	
	

local thrownObjHitBefore = nil



function ThrownWeaponClient.Lob( vPlayer, projectileTemplate, mouseHitV3 )
	local character = vPlayer.Character
	local rightHand = character:FindFirstChild("RightHand")
	if not rightHand then return end
	local startPos = rightHand.Position 
	local dir = mouseHitV3 - startPos
	dir = dir.Unit -- computeDirection(dir)
	local launch = startPos
	local delta = mouseHitV3 - launch
	local dy = delta.y
	local new_delta = Vector3.new(delta.x, 0, delta.z)
	delta = new_delta
	local dx = delta.magnitude
	local unit_delta = delta.unit
	local g = game.Workspace.Gravity -- (-9.81 * 20)
	local theta = computeLaunchAngle(dx, dy, g)
	local vy = math.sin(theta)
	local xz = math.cos(theta)
	local vx = unit_delta.x * xz
	local vz = unit_delta.z * xz
	local missile = CreateThrownItem( projectileTemplate, vPlayer )
	missile.Name = vPlayer.Name .. projectileTemplate.Name .. "_Projectile"
	missile.Position = launch
	missile.Velocity = Vector3.new(vx, vy, vz) * velocityK
	--print( missile:GetFullName().." launched" )
	
	return missile
end
	
	
	--[[
local function Weld(parentObj)
	local w1 = Instance.new("Weld") 

	w1.Parent = parentObj.Handle 
        w1.Part0 = w1.Parent 
        w1.C1 = CFrame.new(0, -0.5, 0) * CFrame.fromEulerAnglesXYZ(math.pi/2, 0, 0)
end
	--]]
	
function ThrownWeaponClient.new( tool )
	local enabled = true
	
	local cooldownN = tool:WaitForChild("Cooldown").Value
	local projectileTemplate = tool.Handle:Clone()
	
	local player = tool.Parent
	
	local function onButton1Down(mouse)
		local character = tool.Parent
		local player = game.Players:GetPlayerFromCharacter( character )
		if GeneralWeaponUtility.isCoolingDown( character ) then return end
		if not enabled then
			return
		end
	
		enabled = false
		
		local clickPart, clickHitV3 = unpack( RangedWeaponUtility.MouseHitNontransparent( mouse, { character } ) )  --  Raycast.Mouse( mouse )
		
		-- throw server missile
		tool.BombRemoteEvent:FireServer( "Activate", clickHitV3 )

		-- throw client missile
		if showMissileOnClientB then
			local missile
			missile = ThrownWeaponClient.Lob( player, projectileTemplate, clickHitV3 )
			missile.Parent = game.Players.LocalPlayer.Character
		end
		
		GeneralWeaponUtility.cooldownWait( character, cooldownN, nil )
		enabled = true
	end
	
	
	local function onEquippedLocal( mouse )
	
		if mouse == nil then
			--print("Mouse not found")
			return 
		end
		mouse.Button1Down:connect(function() onButton1Down(mouse) end)

--  wishlist: make it look like bomb disappears from your hand
--		ObjectX.FadeInWait( tool.Handle, 0, true )
	end

	tool.Equipped:connect(onEquippedLocal)
end


return ThrownWeaponClient
