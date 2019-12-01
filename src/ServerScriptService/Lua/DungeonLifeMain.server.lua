local GameManagement = require( game.ServerStorage.GameManagementModule )

local TownServer = require( game.ServerStorage.TS.TownServer ).TownServer

local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest

while #game.Players:GetPlayers()==0 do wait() end

if( Places.getCurrentPlace()==Places.places.Underhaven )then
    TownServer.Play()
else
    GameManagement:Play()
end

