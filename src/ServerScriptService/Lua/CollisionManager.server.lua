-- seeing a *weird* bug with Missile collision group being executed twice!?
assert( not _G.collisionManagerExecuted )  -- using a regular assert for speed purposes; if it has been executed we don't need to do it again anyway
_G.collisionManagerExecuted = true


print( script:GetFullName().." executed" )

local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )

local CollectionService = game.CollectionService
local PhysicsService = game.PhysicsService

workspace.GameManagement.MissileCollisionGroupId.Value = game.PhysicsService:CreateCollisionGroup( "Missile" )
workspace.GameManagement.PorousCollisionGroupId.Value  = game.PhysicsService:CreateCollisionGroup( "Porous" )

PhysicsService:CreateCollisionGroup( "Impenetrable" )
PhysicsService:CreateCollisionGroup( "HeroNocollide" )
PhysicsService:CreateCollisionGroup( "Hero" )
PhysicsService:CreateCollisionGroup( "Ghost" )

PhysicsService:CollisionGroupSetCollidable( "Missile", "Porous", false )
PhysicsService:CollisionGroupSetCollidable( "HeroNocollide", "Hero", false )
PhysicsService:CollisionGroupSetCollidable( "Impenetrable", "Ghost", true )
PhysicsService:CollisionGroupSetCollidable( "Default", "Ghost", false )

-- it works for us that stuff in server storage will answer the call here
for _, inst in pairs( CollectionService:GetTagged("Impenetrable") ) do
	if not inst:IsA("BasePart") then 
		DebugXL:Error( inst:GetFullName().." incorrectly tagged as Impenetrable" )
	else
		PhysicsService:SetPartCollisionGroup( inst, "Impenetrable" )
	end	
end

for _, inst in pairs( CollectionService:GetTagged("HeroNocollide") ) do
	if not inst:IsA("BasePart") then 
		DebugXL:Error( inst:GetFullName().." incorrectly tagged as HeroNocollide" )
	else
		PhysicsService:SetPartCollisionGroup( inst, "HeroNocollide" )
	end	
end