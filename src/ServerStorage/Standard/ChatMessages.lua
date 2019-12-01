--Get ChatService
local ChatService = require(game:GetService("ServerScriptService"):WaitForChild("ChatServiceRunner"):WaitForChild("ChatService"))

--Wait for the channel 'All' to exist
if not ChatService:GetChannel("All") then
	while true do
		local ChannelName = ChatService.ChannelAdded:Wait()
		if ChannelName == "All" then
			break
		end
	end
end

--Make your speaker and have it join the 'All' channel we waited for
local SpeakerOfTheHouse = ChatService:AddSpeaker("Dungeon Life")
SpeakerOfTheHouse:JoinChannel("All")

local ChatMessages = {}

function ChatMessages:SayMessage( message )
    SpeakerOfTheHouse:SayMessage( message, "All" )
end

return ChatMessages