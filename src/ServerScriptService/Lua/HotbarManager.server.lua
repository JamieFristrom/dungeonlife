local CharacterI    = require( game.ServerStorage.CharacterI )
local Heroes        = require( game.ServerStorage.Standard.HeroesModule )
local Inventory     = require( game.ServerStorage.InventoryModule )

local PowerServer = require( game.ServerStorage.TS.PowerServer ).PowerServer
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData


HotbarRemote = {}

function HotbarRemote:Equip( player, hotbarSlotN )
--	--print( player.Name.." equipping "..hotbarSlotN )
--	local flexToolInst , _possessionsKey = CharacterI:GetHotbarToolDatum( player, hotbarSlotN )
	local flexToolInst = CharacterI:GetHotbarToolDatum( player, hotbarSlotN )
	if flexToolInst then
		local possessionDatum = ToolData.dataT[ flexToolInst.baseDataS ]
		if possessionDatum.useTypeS == "power" then
			PowerServer.activatePower( player, flexToolInst )
		end
	end		
end


function HotbarRemote:GetPCData( player )
	warn("Hotbar remote invoked by "..player.Name)
	local pcdata = CharacterI:GetPCDataWait( player )
	warn("Hotbar remote pc data for "..player.Name.." acquired" )
	return pcdata
end


workspace.Signals.HotbarRE.OnServerEvent:Connect( function( player, funcName, ... )
	HotbarRemote[ funcName ]( HotbarRemote, player, ... )
end)

workspace.Signals.HotbarRF.OnServerInvoke = function( player, funcName, ... )
	return HotbarRemote[ funcName ]( HotbarRemote, player, ... )
end