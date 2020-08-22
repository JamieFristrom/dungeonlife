local GuiXL = require( game.ReplicatedStorage.Standard.GuiXL )

local TextShadow = {}

-- assumes _script is child of TextLabel
function TextShadow.new( _script, pixelOffset )
	local textLabel = _script.Parent
	return GuiXL:shadowText( textLabel, pixelOffset )	
end

return TextShadow
