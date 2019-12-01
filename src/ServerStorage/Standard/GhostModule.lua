--
-- GhostModule
--
-- handles physics and cosmetics for ghost
--
-- @Jamie_Fristrom 2018
--
print( script:GetFullName().." executed" )


local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )
local MathXL  = require( game.ReplicatedStorage.Standard.MathXL )

local Ghost = {}


local CollectionService = game.CollectionService
local PhysicsService = game.PhysicsService

function MultiplyTransparency( a, b )
	return ( 1 - ( 1 - a ) * ( 1 - b ) )
end

function Ghost:Ghostify( character )
	for _, object in pairs( character:GetChildren() ) do 
		if object:IsA("MeshPart") then
			local limb = object
			limb.BrickColor   = BrickColor.new("Pearl")
			limb.Material     = Enum.Material.Neon
			limb.TextureID    = ""
			limb.Transparency = MultiplyTransparency( limb.Transparency, 0.8 )
			PhysicsService:SetPartCollisionGroup( limb, "Ghost" )		
		end
	end
	local shirt = character:FindFirstChild("Shirt")
	local pants = character:FindFirstChild("Pants")

	if shirt then shirt.ShirtTemplate = "" end
	if pants then pants.PantsTemplate = "" end
	
	character.Head.BrickColor = BrickColor.new("Pearl")
	character.Head.Transparency = MultiplyTransparency( character.Head.Transparency, 0.4 )
	PhysicsService:SetPartCollisionGroup( character.Head, "Ghost" )
	PhysicsService:SetPartCollisionGroup( character.HumanoidRootPart, "Ghost" )
	
	for _, object in pairs( character:GetChildren() ) do
		if object:IsA("Accoutrement") then
			local accoutrement = object
			local handle = accoutrement:FindFirstChild("Handle")
			if handle then
				handle.BrickColor = BrickColor.new("Pearl")
				handle.Transparency = MultiplyTransparency( handle.Transparency, 0.4 )
				local mesh = handle:FindFirstChildWhichIsA("FileMesh")
				if mesh then
					mesh.TextureId = ""
				end
			end
		end
	end
	
end

return Ghost