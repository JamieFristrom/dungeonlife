local InputXL = {}

local usingGamepadB = false

function InputXL:UsingGamepad()
	return usingGamepadB
end

local function CheckInputObjetForGamepadness( inputObject )
	if inputObject.UserInputType == Enum.UserInputType.Gamepad1 then
		-- if an unused gamepad is plugged in it will still report micropositions		
		if inputObject.KeyCode == Enum.KeyCode.Thumbstick1 or inputObject.KeyCode == Enum.KeyCode.Thumbstick2 then
			if inputObject.Position.Magnitude > 0.2 then
				if not usingGamepadB then
					print("Now using gamepad stick")
					usingGamepadB = true
				end				
			end
		else
			if not usingGamepadB then
				print("Now using gamepad")
				usingGamepadB = true
			end
		end
	else
		if usingGamepadB then
			print("Now not using gamepad")
			usingGamepadB = false
		end
	end
end 

game:GetService("UserInputService").InputBegan:Connect( CheckInputObjetForGamepadness )
game:GetService("UserInputService").InputChanged:Connect( CheckInputObjetForGamepadness )


return InputXL
