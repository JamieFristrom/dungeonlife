local TextShadow = {}

-- assumes _script is child of TextLabel
function TextShadow.new( _script, pixelOffset )
	local textLabel = _script.Parent
	local shadowLabel = textLabel:Clone()
	shadowLabel:ClearAllChildren()
	
	-- need to delete the clone's script otherwise it's turtles all the way down
	-- shadowLabel:FindFirstChild( _script.Name ):Destroy()
	shadowLabel.Name        = shadowLabel.Name.."Shadow"
	shadowLabel.Position    = UDim2.new( 0, pixelOffset, 0, pixelOffset )
	shadowLabel.Size        = UDim2.new( 1, 0, 1, 0 )
	shadowLabel.TextColor3  = Color3.new()
	shadowLabel.AnchorPoint = Vector2.new( 0, 0 )
	shadowLabel.ZIndex      = textLabel.ZIndex - 1
	shadowLabel.Parent      = textLabel
--	shadowLabel.Position = UDim2.new( textLabel.Position.X.Scale, textLabel.Position.X.Offset + pixelOffset, 
--		textLabel.Position.Y.Scale, textLabel.Position.Y.Offset + pixelOffset )
	
	textLabel.Changed:Connect( function( property )
		if property == "Text" or property == "TextSize" then
			shadowLabel[ property ] = textLabel[ property ]
		end
	end)
	
end

return TextShadow
