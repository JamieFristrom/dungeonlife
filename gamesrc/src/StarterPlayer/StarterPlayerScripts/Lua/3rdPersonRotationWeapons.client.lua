print( script:GetFullName().." executed" )

local cam = game.Workspace.CurrentCamera
local localPlayer = game.Players.LocalPlayer
local mouse = localPlayer:GetMouse()
local prevMouseHit

game:GetService("RunService").RenderStepped:Connect( function()
	local character = localPlayer.Character
	if character then
		local hum = character:FindFirstChild("Humanoid")
		if hum then
			local tor = character:FindFirstChild("HumanoidRootPart")
			if tor then
				local tool = character:FindFirstChildWhichIsA( "Tool" )
				if tool then
					local rotationAmountObj = tool:FindFirstChild("ThirdPersonRotationRads")
					if rotationAmountObj then
						if (cam.Focus.p-cam.CoordinateFrame.p).magnitude > 1 then
							if not hum.Sit then
								hum.AutoRotate = false
								if mouse.Hit.p ~= prevMouseHit then
									tor.CFrame = CFrame.new( tor.Position, Vector3.new( mouse.Hit.p.x, tor.Position.y, mouse.Hit.p.z ) )
									tor.CFrame = tor.CFrame * CFrame.fromOrientation( 0, rotationAmountObj.Value, 0 )
									prevMouseHit = mouse.Hit.p
									return
								end
							end
						end			
					end
				end
			end
			hum.AutoRotate = true
		end
	end
end)

