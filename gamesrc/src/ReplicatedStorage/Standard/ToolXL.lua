--
-- ToolXL
--
-- Tool eXtended Library. It excels. It's extra large.
--
-- Additional functions to augment Roblox's tool API

local ToolXL = {}

function ToolXL:GetOwningPlayer( tool )
	if tool.Parent then
		if tool.Parent:FindFirstChildWhichIsA("Humanoid") then
			return game.Players:GetPlayerFromCharacter( tool.Parent )
		else
			-- in backpack or starter gear?
			if tool.Parent.Parent:IsA("Player") then
				return tool.Parent.Parent
			end
		end
	end
	return nil
end


return ToolXL
