local GuiXL = require( game.ReplicatedStorage.TS.GuiXLTS ).GuiXL

GuiXL.TextSizeEnum =
{
	Small    = "Small",
	Standard = "Standard",
	Large    = "Large"
}

return GuiXL
--[[
local GuiXL = {}

GuiXL.TextSizeEnum =
{
	Small    = "Small",
	Standard = "Standard",
	Large    = "Large"
}

function GuiXL:GetTextSize( textSizeEnum )
	if textSizeEnum == GuiXL.TextSizeEnum.Small then
		if workspace.CurrentCamera.ViewportSize.X < 800 then
			return 9
		else
			return 14
		end
	elseif textSizeEnum == GuiXL.TextSizeEnum.Standard then
		if workspace.CurrentCamera.ViewportSize.X < 800 then
			return 13
		else
			return 22
		end
	else
		if workspace.CurrentCamera.ViewportSize.X < 800 then
			return 18
		else
			return 34
		end
	end	
end



return GuiXL
--]]