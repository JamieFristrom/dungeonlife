local MessageGui = require( game.ReplicatedStorage.TS.MessageGui ).MessageGui

local playerGui = script.Parent.Parent.Parent

local healthBall = script.Parent.Parent:WaitForChild("HealthBall")
local thermometer = healthBall:WaitForChild("Thermometer")

thermometer.Changed:Connect( function( property )
	if property=="AbsoluteSize" then
		-- by making the size in pixels it stays consistent while parent shrinks, thus parent clips it rather than shrinking it
		thermometer.MercuryImage.Size = UDim2.new( 0, healthBall.AbsoluteSize.X, 0, healthBall.AbsoluteSize.Y )
--		healthBall.BackingImage.Size = UDim2.new( 0, healthBall.AbsoluteSize.X, 0, healthBall.AbsoluteSize.Y )
	end
end)

local lastHealth = 500

while wait(0.1) do
	if game.Players.LocalPlayer.Character then
		local humanoid = game.Players.LocalPlayer.Character:FindFirstChild("Humanoid")
		if humanoid then 
			local health = humanoid.Health
			thermometer.Size = UDim2.new( 1, 0, health / humanoid.MaxHealth, 0 )
			if game.Players.LocalPlayer.Team == game.Teams.Heroes then
				if health < lastHealth then
					if lastHealth >= humanoid.MaxHealth * 0.33 and health < humanoid.MaxHealth * 0.33 and health > 0 then
						MessageGui:PostMessageByKey( "HealthLow", false )
					end
				end
			end
			lastHealth = health
		end
		local furnishGui = playerGui:FindFirstChild("FurnishGui")
		local furnishingMenuVisible = furnishGui and ( furnishGui:WaitForChild("ActiveCategoryListFrame").Visible or
			furnishGui:WaitForChild("ActiveFurnishingListFrame").Visible )
		healthBall.Visible = not furnishingMenuVisible		
	end
end
