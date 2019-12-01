print( script:GetFullName().." executed" )

local InputXL = require( game.ReplicatedStorage.Standard.InputXL )
print("IntroMessageScript: InputXL required")

local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest
print("IntroMessageScript: Places required")
local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize
print("IntroMessageScript: Localize required")


if not workspace.GameManagement.FastStart.Value then 
	wait(6)  -- give dungeon life logo opportunity to spin, in local tests this was enough to let us see it for 2-3 secs
end
print("IntroMessageScript: Logo wait done")

local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest

if Places:getCurrentPlace() ~= Places.places.LowLevelServer and not workspace.GameManagement.FastStart.Value then
	game.ReplicatedFirst.TS.Loading.Disabled = true
	workspace.Signals.InventoryRE:FireServer( "CheckForDailyAward" )
	return
end

local introMessageFrame = script.Parent.Parent:WaitForChild("IntroMessage")
local mainFrame = introMessageFrame:WaitForChild("Main")

function FinishIntro()
	delay( 1, function() mainFrame.Parent.Visible = false end )  -- hack delay gives fade curtain a chance to cover things up
	if not workspace.GameManagement.FastStart.Value then
		workspace.Signals.InventoryRE:FireServer( "CheckForDailyAward" )
	end
end

game.ReplicatedFirst.TS.Loading.Disabled = true

local showIntro = Places.getCurrentPlace()==Places.places.HighLevelServer

if showIntro then
	mainFrame.Parent.Visible = true
	local endPos = mainFrame.Position
	mainFrame.Position = UDim2.new( endPos.X.Scale, endPos.X.Offset, 1.5, 0 )
	mainFrame:TweenPosition( endPos, Enum.EasingDirection.InOut, Enum.EasingStyle.Quad, 0.25 ) 


	local textThingy = mainFrame:WaitForChild("Message")

	local introMessage = Localize.formatByKey( "IntroMessage" )
	textThingy.Text = introMessage
		
	local textToDisplayS = mainFrame:WaitForChild("Message").Text
	mainFrame.Message:FindFirstChild("TextShadowScript").Disabled = false

	local charIndex = #textToDisplayS

	function ClickHandler()
		if charIndex < #textToDisplayS then
			charIndex = #textToDisplayS
		else
			mainFrame:TweenPosition( UDim2.new( endPos.X.Scale, endPos.X.Offset, 1.5, 0 ), 
				Enum.EasingDirection.InOut, 
				Enum.EasingStyle.Quad,
				0.25, 
				false,
				FinishIntro() )
		end
	end

	mainFrame:WaitForChild("Done").MouseButton1Click:Connect( ClickHandler )
	mainFrame:WaitForChild("ClickableArea").MouseButton1Click:Connect( ClickHandler )

	game:GetService("UserInputService").InputBegan:Connect( function( inputObject )
		if inputObject.UserInputType == Enum.UserInputType.Gamepad1 then
			if inputObject.KeyCode == Enum.KeyCode.ButtonB or inputObject.KeyCode == Enum.KeyCode.ButtonA then
				if charIndex < #textToDisplayS then
					charIndex = #textToDisplayS
				else
					mainFrame.Parent.Visible = false
				end
			end
		end
	end)


	local displayDelay = mainFrame.Parent:WaitForChild("DisplayDelay").Value
	if displayDelay > 0 then
		mainFrame.Message.Text = ""
		mainFrame.Message.Visible = true

		charIndex = 1 
		while charIndex <= #textToDisplayS do   -- not using a for loop so above interrupts will work 
			mainFrame.Message.Text = string.sub( textToDisplayS, 1, charIndex )
			charIndex = charIndex + 1
			wait( displayDelay )
		end
	else
		mainFrame.Message.Visible = true
	end	

	mainFrame.Done.TextPulse.Disabled = false
else
	FinishIntro()
end