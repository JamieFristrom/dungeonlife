--
-- NicknameManager
--
-- Part of Jamie's new XL libraries
--

--[[
local InstanceXL = require( game.ReplicatedStorage.Standard.InstanceXL )

function PlayerAdded( player )
	InstanceXL.new( "StringValue", { Name = "Nickname", Value = player.Name, Parent = player:WaitForChild("leaderstats") }, true )	
end

for _, player in pairs( game.Players:GetPlayers() ) do PlayerAdded( player ) end
game.Players.PlayerAdded:Connect( PlayerAdded )

local NicknameManagerRemote = {}

function NicknameManagerRemote.NewNickname( player, newNicknameS )
	local textFilterResult = game.TextService:FilterStringAsync( newNicknameS, player.UserId )
	local filteredNicknameS = textFilterResult:GetNonChatStringForBroadcastAsync()
	InstanceXL.new( "StringValue", { Name = "Nickname", Value = filteredNicknameS, Parent = player:WaitForChild("leaderstats") }, true )
end



workspace.Signals.NicknameRE.OnServerEvent:Connect( function( player, funcName, ... )
	NicknameManagerRemote[ funcName ]( player, ... )
end)

--]]