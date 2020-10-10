-- it's possible for this script to be destroyed with the defined invokes lingering
 

local humanoid = script.Parent
local char = humanoid.Parent
--print("Validator executed")
local disableDeath = humanoid:WaitForChild("SetDeathEnabled")

--local verifyJoints = humanoid:WaitForChild("VerifyJoints")

--print("Costume validator found remote functions")

-- I believe this is a function because we don't want to morph until we're sure death has been disabled
function disableDeath.OnClientInvoke(state, cookie)
--	print("Client disableDeath "..cookie)
	humanoid:SetStateEnabled("Dead",state)
--	print( humanoid.Parent.Name.." death state enabled "..tostring(state).." "..cookie)
end

-- shouldn't be necessary; allegedly the call to us won't return until we've overriden OnClientInvoke
-- but it is
disableDeath:InvokeServer()  -- acknowledge that we're ready for invocation
--
--function verifyJoints.OnClientInvoke()
--	local passes = true
--	for _,part in pairs(char:GetChildren()) do
--		if part:IsA("BasePart") then
--			for _,att in pairs(part:GetChildren()) do
--				if att:IsA("Attachment") and att.Name:sub(-13) == "RigAttachment" then
--					local motorName = att.Name:sub(1,-14)
--					local motor = char:FindFirstChild(motorName,true)
--					if not (motor and motor:IsA("Motor6D")) then
--						passes = false
--						break
--					end
--				end
--			end
--		end
--	end
--	return passes
--end
--
--verifyJoints:InvokeServer()
--
--while wait(0.5) do
--	print( script.Parent.Parent.Name.." validator still running" ) 
--end 