--
-- Destructible structure
--
local DebugXL         = require( game.ReplicatedStorage.Standard.DebugXL )
local MathXL          = require( game.ReplicatedStorage.Standard.MathXL )

local HeroUtility     = require( game.ReplicatedStorage.Standard.HeroUtility )  
local PossessionData  = require( game.ReplicatedStorage.PossessionData )

local BalanceData = require( game.ReplicatedStorage.TS.BalanceDataTS ).BalanceData
local BlueprintUtility = require( game.ReplicatedStorage.TS.BlueprintUtility ).BlueprintUtility

local DestructibleServer = require( game.ServerStorage.TS.DestructibleServer ).DestructibleServer
local DungeonDeck = require( game.ServerStorage.TS.DungeonDeck ).DungeonDeck
local HeroServer = require( game.ServerStorage.TS.HeroServer ).HeroServer

local Destructible = {}

function Destructible:FlyApart( destructibleInstance, timeLength )
	for _, descendent in pairs( destructibleInstance:GetDescendants() ) do
		if descendent:IsA("BasePart") then
			if MathXL:RandomNumber() > 0.5 then
				descendent.Anchored = false
				descendent.Velocity = Vector3.new( MathXL:RandomNumber( -20, 20 ),
					MathXL:RandomNumber( 20, 40 ),
					MathXL:RandomNumber( -20, 20 ) )	
--				if descendent:FindFirstChild("SoundOnCollide") then
--					descendent.SoundOnCollide.Disabled = false
--				end			
				game.TweenService:Create( descendent, TweenInfo.new( timeLength ), { Transparency = 1 } ):Play()
			else
				-- I have a theory that despite the Roblox docs this is a preferable way to destroy objects, because
				-- the hierarchy doesn't get broken up when you do it, so code that assumes it has certain parts will not
				-- crash, and it still gets garbage collected, and its scripts still stop running:
				descendent.Parent = nil
				-- descendent:Destroy()
			end
		end
	end	
end

function Destructible.new( destructibleInstance )
	
	--local TimeLengthValue = destructibleInstance.PrimaryPart.Destroyed:FindFirstChild("TimeLength")
	local timeLength = 1
	
	game.CollectionService:AddTag( destructibleInstance, "Character" )
	game.CollectionService:AddTag( destructibleInstance, "Destructible" )
	
	local humanoid = destructibleInstance:FindFirstChild("Humanoid")
	DebugXL:Assert( humanoid )
	if humanoid then 
		-- this should get recalibrated once level starts properly, but just in case something I didn't foresee happens
		local averageHeroLocalLevel = HeroServer.getAverageHeroLocalLevel()
		local numHeroes = #game.Teams.Heroes:GetPlayers()
		local dungeonDepth = DungeonDeck.getCurrentDepth()
		DestructibleServer.calibrateHealth( destructibleInstance, averageHeroLocalLevel, numHeroes, dungeonDepth )
	
		destructibleInstance.Humanoid.Died:Connect( function()
			destructibleInstance.PrimaryPart.Destroyed:Play()
			Destructible:FlyApart( destructibleInstance, timeLength )
			wait( timeLength )
			destructibleInstance.Parent = nil
			--destructibleInstance:Destroy()
		end )
		
		
		local lastValue = destructibleInstance.Humanoid.Health
		destructibleInstance.Humanoid.HealthChanged:Connect( function( value )
			if value < lastValue then
				if destructibleInstance.PrimaryPart then
					destructibleInstance.PrimaryPart.Hit:Play()
				end
			end
			lastValue = value
		end)
	end
end

return Destructible
