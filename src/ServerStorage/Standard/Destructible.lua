
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

--
--  Destructible structure
--

local MathXL          = require( game.ReplicatedStorage.Standard.MathXL )

local DestructibleServer = require( game.ServerStorage.TS.DestructibleServer ).DestructibleServer
local DungeonDeck = require( game.ServerStorage.TS.DungeonDeck ).DungeonDeck
local HeroServer = require( game.ServerStorage.TS.HeroServer ).HeroServer
local LootServer = require( game.ServerStorage.TS.LootServer ).LootServer

local Destructible = {}

function Destructible:FlyApart( destructibleInstance, timeLength )
	for _, descendent in pairs( destructibleInstance:GetDescendants() ) do
		if descendent:IsA("BasePart") then
			if MathXL:RandomNumber() > 0.5 then
				descendent.Anchored = false
				descendent.Velocity = Vector3.new( MathXL:RandomNumber( -20, 20 ),
					MathXL:RandomNumber( 20, 40 ),
					MathXL:RandomNumber( -20, 20 ) )	
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
	DebugXL:logD(LogArea.Gameplay,'Destructible.new called for '..destructibleInstance:GetFullName())
	local timeLength = 1
	
	game.CollectionService:AddTag( destructibleInstance, "CharacterTag" )
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
			LootServer.destructibleDrop(destructibleInstance)

			DebugXL:logI(LogArea.Gameplay, destructibleInstance:GetFullName()..' died')
			destructibleInstance.PrimaryPart.Destroyed:Play()
			
			Destructible:FlyApart( destructibleInstance, timeLength )
			wait( timeLength )
			destructibleInstance.Parent = nil
		end )
		DebugXL:logD(LogArea.Gameplay, destructibleInstance.Humanoid:GetFullName()..' died connected')		
		
		local lastValue = destructibleInstance.Humanoid.Health
		local hitSoundEmitter = destructibleInstance.PrimaryPart.Hit
		destructibleInstance.Humanoid.HealthChanged:Connect( function( value )
			if value < lastValue then
				hitSoundEmitter:Play()
			end
			lastValue = value
		end)
	end
end

return Destructible
