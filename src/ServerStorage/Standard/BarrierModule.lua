local InstanceXL        = require( game.ReplicatedStorage.Standard.InstanceXL )
local WeaponUtility     = require( game.ReplicatedStorage.Standard.WeaponUtility )

local FlexEquipUtility  = require( game.ReplicatedStorage.Standard.FlexEquipUtility )
local PossessionData    = require( game.ReplicatedStorage.PossessionData )

local CharacterI   = require( game.ServerStorage.CharacterI )
local FlexibleTools     = require( game.ServerStorage.FlexibleToolsModule )
local Mana              = require( game.ServerStorage.ManaModule )

local WeaponServer      = require( game.ServerStorage.Standard.WeaponServerModule )



local Barrier = {}

local debris = game:GetService("Debris")

local barrierFolder = game.ServerStorage.CharacterFX.Barrier

local fire = barrierFolder:WaitForChild("BarrierSegment"):Clone()


function onTouched( part, attackingPlayer, flexTool, burntStuff )	
	if part.Parent:FindFirstChild("Humanoid") then
		if not burntStuff[ part.Parent ] then
			CharacterI:TakeFlexToolDamage( part.Parent, attackingPlayer, flexTool )
			burntStuff[ part.Parent ] = true	
		end 
	end
end



function Ring( v, duration, attackingPlayer, flexTool )
	local numOfFire = 16
	local increment = (math.pi *2)/numOfFire

	local torsoNormal = Vector3.new( 0, 0, 1 )
	local denom = math.abs(torsoNormal.x) + math.abs(torsoNormal.z)
	local posX = 15 * (torsoNormal.x/denom)
	local posZ = 15 * (torsoNormal.z/denom)

	local pos = Vector3.new(v.x + posX,v.y, v.z + posZ)
	local fiery
	local burntStuff = {}
	for i = 1, numOfFire do

		fiery = fire:clone()
		fiery.Size = Vector3.new(5.5,fiery.Size.y + 7,fiery.Size.z)
		fiery.CFrame = CFrame.new( pos, v )
		fiery.Parent = game.Workspace
		fiery.Touched:Connect( function( part ) onTouched( part, attackingPlayer, flexTool, burntStuff ) end )

		debris:AddItem( fiery, duration )

		local angle = increment * i
		pos = Vector3.new(((pos.x - v.x) * math.cos(angle)) - ((pos.z - v.z) * math.sin(angle)) + v.x, pos.y,((pos.x - v.x) * math.sin(angle)) + ((pos.z - v.z) * math.cos(angle)) + v.z)

	end

	-- play just one of the sounds
	fiery.FireSound:Play()
end


local enabled = true
function Barrier.Activate( character, duration, flexTool )
	local player = game.Players:GetPlayerFromCharacter( character )
	
	local humanoid = character:FindFirstChild("Humanoid")
	if not humanoid then return end

	local torso = character:FindFirstChild("HumanoidRootPart")
	if not torso then return end
	
	local fireRingAnim = humanoid:LoadAnimation( barrierFolder.firering)
	fireRingAnim:Play()

	local spin = Instance.new("BodyAngularVelocity")
	spin.angularvelocity = Vector3.new(0,10,0)
	spin.P = 1000000
	spin.maxTorque = Vector3.new(0,spin.P,0)
	spin.Parent = torso
	
	debris:AddItem(spin,1.1)
	Ring( torso.Position, duration, player, flexTool )
end

return { Barrier = Barrier }