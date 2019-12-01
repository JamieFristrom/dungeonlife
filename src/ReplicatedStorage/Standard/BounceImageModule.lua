local MathXL = require( game.ReplicatedStorage.Standard.MathXL )

local BounceImageModule = {}

local whiteColor3 = Color3.new( 1, 1, 1 )
local redColor3   = Color3.new( 0.5, 0, 0 )

-- atm this is only used by tutorial arrows so we hide them when the message dialog is up

function BounceImageModule.new( imageLabel, bounceRangeV3 )  -- x and y are position bounce, z is size bounce 

	local centerUDim2 = imageLabel.Position
	local sizeUDim2 = imageLabel.Size
	
	game["Run Service"].RenderStepped:Connect( function()
		imageLabel.Position = UDim2.new( 
			math.sin( tick()*2 ) * bounceRangeV3.X + centerUDim2.X.Scale,
			centerUDim2.X.Offset, 
			math.sin( tick()*2 ) * bounceRangeV3.Y + centerUDim2.Y.Scale, 
			centerUDim2.Y.Offset )
		imageLabel.Size = UDim2.new( 
			math.sin( tick()*2 ) * sizeUDim2.X.Scale * bounceRangeV3.Z + sizeUDim2.X.Scale,
			sizeUDim2.X.Offset, 
			math.sin( tick()*2 ) * sizeUDim2.Y.Scale * bounceRangeV3.Z + sizeUDim2.Y.Scale, 
			sizeUDim2.Y.Offset )
		imageLabel.ImageColor3 = redColor3:lerp( whiteColor3, ( math.sin( tick()*7 ) + 1 ) / 2 )  -- strobe out of sync with bounce to stand out 
		imageLabel.ImageTransparency = MathXL:Lerp( imageLabel.ImageTransparency, 
			game.Players.LocalPlayer.PlayerGui.MessageGuiConfiguration:FindFirstChild("MessageFrame") and 1 or 0, 
			0.5 )
	end)
	
end

return BounceImageModule
