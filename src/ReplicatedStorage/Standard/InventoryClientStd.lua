local InventoryUtility  = require( game.ReplicatedStorage.InventoryUtility )


local InventoryClient = {}

InventoryClient.inventory = workspace.Signals.InventoryRF:InvokeServer( "GetWait" )

local defaultConnection = workspace.Signals.InventoryRE.OnClientEvent:Connect( function( funcName, inventoryUpdate )
	if funcName == "Update" then
		InventoryClient.inventory = inventoryUpdate
	end
end)


function InventoryClient:SetActiveSkin( skinOwnerS, skinTypeKey, skinIdS )
	workspace.Signals.GearRE:FireServer( "setActiveSkin", skinOwnerS, skinTypeKey, skinIdS )
	
	-- for snappiness purposes:
	InventoryClient.inventory.activeSkinsT[ skinTypeKey ] = skinIdS
end


function InventoryClient:AmIInTutorial()
	return InventoryUtility:IsInTutorial( InventoryClient.inventory )	
end


function InventoryClient:GetTutorialLevel()
	return InventoryUtility:GetTutorialLevel( InventoryClient.inventory )
end


function InventoryClient:GetCount( itemS )
	return InventoryUtility:GetCount( InventoryClient.inventory, itemS )
end


function InventoryClient:GetMessagesShown( messageKeyS )
	return InventoryClient.inventory.messagesShownT[ messageKeyS ] or 0
end


-- we could: 
-- *  have an entirely different connection to the client event - but then we can't control order in which the connections
--   get called
-- *  keep a list of functions to call, but what happens when they go out of scope or their scripts get destroyed?
-- *  have a separate bindable event somewhere that gets triggered after?

-- went with A with a twist

function InventoryClient:InventoryUpdatedConnect( func )
	defaultConnection:Disconnect()
	return workspace.Signals.InventoryRE.OnClientEvent:Connect( function( funcName, inventoryUpdate )
		if funcName == "Update" then
			InventoryClient.inventory = inventoryUpdate
			func()
		end
	end)
end


return InventoryClient
