local evt = game:GetService("ReplicatedStorage"):WaitForChild("ReportGoogleAnalyticsEvent")
local category = "PlaceId-" .. tostring(game.PlaceId)

function convertNewlinesToVertLine(stack)
	local rebuiltStack = ""
	local first = true
	for line in stack:gmatch("[^\r\n]+") do
		if first then
			rebuiltStack = line
			first = false
		else
			rebuiltStack = rebuiltStack .. " | " .. line
		end
	end
	return rebuiltStack
end

function removePlayerNameFromStack(stack)
	stack = string.gsub(stack, "Players%.[^.]+%.", "Players.<Player>.")
	return stack
end

game:GetService("ScriptContext").Error:connect(function (message, stack)
	print( "Reporting analytics event "..message )
	evt:FireServer(category,	
		removePlayerNameFromStack(message) .. " | " ..
		removePlayerNameFromStack(stack), "none", 1)
end)
